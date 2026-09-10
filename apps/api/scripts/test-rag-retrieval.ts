import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../src/infrastructure/database/prisma.service'
import { EmbeddingService } from '../src/application/ai-chat/embedding.service'
import { RagVectorStoreService } from '../src/application/ai-chat/rag-vector-store.service'
import { RagService } from '../src/application/ai-chat/rag.service'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const envPath = resolve(process.cwd(), '.env')
if (existsSync(envPath)) for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match && process.env[match[1].trim()] === undefined) process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '')
}

async function main() {
  const prisma = new PrismaService(); const config = new ConfigService(); const embedding = new EmbeddingService(config)
  const vectorStore = new RagVectorStoreService(embedding, config); const rag = new RagService(prisma, embedding, vectorStore, config)
  await prisma.$connect()
  try {
    const query = process.argv.slice(2).filter((argument) => argument !== '--').join(' ').trim()
      || 'Giải thích thuật ngữ API trong phát triển phần mềm'
    const results = await rag.retrieve(undefined, query, undefined, 3)
    console.log(JSON.stringify(results.map((item) => ({ title: item.source.title, sourceType: item.source.sourceType, score: Number(item.score.toFixed(4)), rerankScore: Number(item.rerankScore.toFixed(4)) }))))
  } finally { await vectorStore.onModuleDestroy(); await prisma.$disconnect() }
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
