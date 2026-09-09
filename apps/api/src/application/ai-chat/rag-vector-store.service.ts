import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector'
import { CohereRerank } from '@langchain/cohere'
import { EmbeddingService } from './embedding.service'

@Injectable()
export class RagVectorStoreService implements OnModuleDestroy {
  private instance?: Promise<PGVectorStore>
  readonly reranker: CohereRerank

  constructor(private readonly embeddings: EmbeddingService, private readonly config: ConfigService) {
    this.reranker = new CohereRerank({ apiKey: this.config.get<string>('COHERE_API_KEY'), model: this.config.get<string>('COHERE_RERANK_MODEL', 'rerank-v4.0-fast'), topN: Number(this.config.get('RAG_FINAL_K', 6)) })
  }

  store() {
    if (!this.instance) this.instance = PGVectorStore.initialize(this.embeddings, {
      postgresConnectionOptions: { connectionString: this.config.getOrThrow<string>('DATABASE_URL') },
      tableName: 'knowledge_vectors',
      columns: { idColumnName: 'id', vectorColumnName: 'embedding', contentColumnName: 'content', metadataColumnName: 'metadata' },
      distanceStrategy: 'cosine', scoreNormalization: 'similarity', skipInitializationCheck: true,
    })
    return this.instance
  }

  async onModuleDestroy() { if (this.instance) await (await this.instance).end() }
}
