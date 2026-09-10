import { Injectable } from '@nestjs/common'
import { createHash } from 'crypto'
import { PrismaService } from '../../infrastructure/database/prisma.service'
import { EmbeddingService } from './embedding.service'
import { RagVectorStoreService } from './rag-vector-store.service'
import { ConfigService } from '@nestjs/config'

type ChunkInput = { content: string; lessonId?: string; domainId?: string; levelId?: string }

@Injectable()
export class RagService {
  constructor(private readonly prisma: PrismaService, private readonly embeddings: EmbeddingService, private readonly vectors: RagVectorStoreService, private readonly config: ConfigService) {}

  private text(value: unknown) {
    if (typeof value === 'string') return value
    if (value == null) return ''
    return JSON.stringify(value).replace(/[{}"\[\],]/g, ' ')
  }

  private chunks(content: string, maxLength = 1200) {
    const paragraphs = content.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean)
    const result: string[] = []
    let current = ''
    for (const paragraph of paragraphs.length ? paragraphs : [content]) {
      if (current && current.length + paragraph.length > maxLength) { result.push(current); current = '' }
      if (paragraph.length > maxLength) {
        for (let index = 0; index < paragraph.length; index += maxLength) result.push(paragraph.slice(index, index + maxLength))
      } else current += `${current ? '\n\n' : ''}${paragraph}`
    }
    if (current.trim()) result.push(current.trim())
    return result
  }

  private async saveSource(sourceType: 'lesson' | 'lesson_section' | 'vocabulary', sourceId: string, title: string, versionSource: string, chunks: ChunkInput[]) {
    const contentVersion = createHash('sha256').update(versionSource).digest('hex')
    const existing = await this.prisma.knowledgeSource.findUnique({ where: { sourceType_sourceId: { sourceType, sourceId } }, include: { chunks: { select: { embeddingModel: true, embedding: true } } } })
    if (existing?.contentVersion === contentVersion && existing.status === 'indexed' && existing.chunks.length && existing.chunks.every((chunk) => chunk.embeddingModel === this.embeddings.model())) return false
    const prepared = chunks.flatMap((chunk) => this.chunks(chunk.content).map((content) => ({ ...chunk, content })))
    const vectorStore = await this.vectors.store()
    if (existing?.chunks.length) await vectorStore.delete({ ids: existing.chunks.map((chunk: any) => chunk.id) })
    let sourceDbId = ''
    let createdChunks: Array<{ id: string; content: string; lessonId: string | null; domainId: string | null; levelId: string | null }> = []
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const source = await tx.knowledgeSource.upsert({
          where: { sourceType_sourceId: { sourceType, sourceId } },
          create: { sourceType, sourceId, title, contentVersion, status: 'pending' },
          update: { title, contentVersion, status: 'pending', errorMessage: null },
        })
        await tx.knowledgeChunk.deleteMany({ where: { sourceId: source.id } })
        const rows = []
        for (let chunkIndex = 0; chunkIndex < prepared.length; chunkIndex++) {
          const chunk = prepared[chunkIndex]
          rows.push(await tx.knowledgeChunk.create({ data: {
            sourceId: source.id, chunkIndex, content: chunk.content, tokenCount: Math.ceil(chunk.content.length / 4), lessonId: chunk.lessonId,
            domainId: chunk.domainId, levelId: chunk.levelId, embeddingModel: this.embeddings.model(),
          }, select: { id: true, content: true, lessonId: true, domainId: true, levelId: true } }))
        }
        return { sourceId: source.id, rows }
      })
      sourceDbId = result.sourceId; createdChunks = result.rows
      await vectorStore.addDocuments(createdChunks.map((chunk) => ({ pageContent: chunk.content, metadata: {
        chunkId: chunk.id, sourceType, sourceId, title, lessonId: chunk.lessonId || '', domainId: chunk.domainId || '', levelId: chunk.levelId || '', contentStatus: 'published',
      } })), { ids: createdChunks.map((chunk) => chunk.id) })
      await this.prisma.knowledgeSource.update({ where: { id: sourceDbId }, data: { status: 'indexed', indexedAt: new Date(), errorMessage: null } })
    } catch (error: any) {
      await this.prisma.knowledgeSource.upsert({
        where: { sourceType_sourceId: { sourceType, sourceId } },
        create: { sourceType, sourceId, title, contentVersion, status: 'failed', errorMessage: error?.message || 'Embedding failed' },
        update: { status: 'failed', errorMessage: error?.message || 'Embedding failed' },
      })
      throw error
    }
    return true
  }

  async reindexPublished() {
    const [lessons, vocabularies] = await Promise.all([
      this.prisma.lesson.findMany({ where: { status: 'published' }, include: { sections: { orderBy: { order: 'asc' } } } }),
      this.prisma.vocabulary.findMany({ where: { status: 'published' }, include: { examples: { orderBy: { order: 'asc' } } } }),
    ])
    let indexed = 0
    const activeKeys = new Set<string>()
    for (const lesson of lessons) {
      activeKeys.add(`lesson:${lesson.id}`)
      if (await this.saveSource('lesson', lesson.id, lesson.title, `${lesson.updatedAt.toISOString()}|${lesson.title}|${lesson.summary}|${lesson.keyConcepts.join('|')}`, [{
        content: `${lesson.title}\n${lesson.summary}\n${lesson.keyConcepts.join('\n')}`, lessonId: lesson.id, domainId: lesson.domainId, levelId: lesson.levelId,
      }])) indexed++
      for (const section of lesson.sections) {
        activeKeys.add(`lesson_section:${section.id}`)
        if (await this.saveSource('lesson_section', section.id, section.title || lesson.title, `${lesson.updatedAt.toISOString()}|${section.order}|${this.text(section.content)}`, [{
          content: `${section.title || ''}\n${this.text(section.content)}`, lessonId: lesson.id, domainId: lesson.domainId, levelId: lesson.levelId,
        }])) indexed++
      }
    }
    for (const vocabulary of vocabularies) {
      activeKeys.add(`vocabulary:${vocabulary.id}`)
      const content = `${vocabulary.term}\n${vocabulary.pronunciationIpa || ''}\n${vocabulary.definitionEn}\n${vocabulary.definitionVi || ''}\n${vocabulary.examples.map((item) => `${item.sentenceEn} ${item.translationVi || ''}`).join('\n')}`
      if (await this.saveSource('vocabulary', vocabulary.id, vocabulary.term, `${vocabulary.updatedAt.toISOString()}|${content}`, [{ content, domainId: vocabulary.domainId, levelId: vocabulary.levelId }])) indexed++
    }
    const known = await this.prisma.knowledgeSource.findMany({ select: { id: true, sourceType: true, sourceId: true, chunks: { select: { id: true } } } })
    const staleIds = known.filter((item) => !activeKeys.has(`${item.sourceType}:${item.sourceId}`)).map((item) => item.id)
    if (staleIds.length) {
      const staleVectorIds = known.filter((item) => staleIds.includes(item.id)).flatMap((item) => item.chunks.map((chunk) => chunk.id))
      if (staleVectorIds.length) await (await this.vectors.store()).delete({ ids: staleVectorIds })
      await this.prisma.knowledgeSource.deleteMany({ where: { id: { in: staleIds } } })
    }
    return { indexed, unchanged: lessons.length + lessons.reduce((sum, lesson) => sum + lesson.sections.length, 0) + vocabularies.length - indexed, removed: staleIds.length }
  }

  async retrieve(userId: string | undefined, query: string, lessonId?: string, limit = 6) {
    const vectorStore = await this.vectors.store()
    const topK = Number(this.config.get('RAG_TOP_K', 20))
    const filter = lessonId ? { lessonId } : undefined
    const vectorResults = await vectorStore.similaritySearchWithScore(query, topK, filter)
    if (!vectorResults.length) return []
    const reranked = await this.vectors.reranker.rerank(vectorResults.map(([document]) => document), query, { topN: limit })
    const terms = [...new Set(query.toLocaleLowerCase('vi').split(/[^\p{L}\p{N}_+#.-]+/u).filter((term) => term.length > 1))]
    const ranked = reranked.map((item) => ({ document: vectorResults[item.index][0], vectorScore: vectorResults[item.index][1], rerankScore: item.relevanceScore }))
    const chunkIds = ranked.map((item) => String(item.document.metadata.chunkId))
    const chunksById = new Map((await this.prisma.knowledgeChunk.findMany({ where: { id: { in: chunkIds } }, include: { source: true } })).map((chunk) => [chunk.id, chunk]))
    // A vector store always returns the nearest rows, even when none is relevant.
    // Require independent rerank evidence and a strong combined score before a
    // chunk is allowed to ground an answer.
    const minimumRerankScore = Math.max(0.35, Number(this.config.get('RAG_MIN_SCORE', 0.35)))
    const minimumCombinedScore = Math.max(0.4, Number(this.config.get('RAG_MIN_COMBINED_SCORE', 0.4)))
    return ranked.map((item) => {
      const chunk = chunksById.get(String(item.document.metadata.chunkId))
      if (!chunk) return null
      const haystack = `${chunk.source.title} ${chunk.content}`.toLocaleLowerCase('vi')
      const matches = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0)
      const phraseBoost = haystack.includes(query.toLocaleLowerCase('vi')) ? 2 : 0
      const lexicalScore = terms.length ? (matches + phraseBoost) / (terms.length + 2) : 0
      const score = item.rerankScore * 0.6 + item.vectorScore * 0.3 + lexicalScore * 0.1
      return { ...chunk, score, semanticScore: item.vectorScore, rerankScore: item.rerankScore, lexicalScore }
    }).filter((item): item is NonNullable<typeof item> => Boolean(
      item
      && item.rerankScore >= minimumRerankScore
      && item.score >= minimumCombinedScore,
    )).sort((a, b) => b.score - a.score).slice(0, limit)
  }

  async health() {
    const [sources, totalChunks, vectorCountRows] = await Promise.all([
      this.prisma.knowledgeSource.groupBy({ by: ['sourceType', 'status'], _count: true }),
      this.prisma.knowledgeChunk.count(),
      this.prisma.$queryRawUnsafe<Array<{ count: bigint }>>('SELECT COUNT(*)::bigint AS count FROM knowledge_vectors'),
    ])
    const embeddedChunks = Number(vectorCountRows[0]?.count ?? 0)
    return { sources, chunks: { total: totalChunks, embedded: embeddedChunks, missingEmbedding: totalChunks - embeddedChunks }, embeddingModel: this.embeddings.model(), vectorStore: 'pgvector', reranker: this.config.get('COHERE_RERANK_MODEL', 'rerank-v4.0-fast'), ready: totalChunks > 0 && totalChunks === embeddedChunks }
  }
}
