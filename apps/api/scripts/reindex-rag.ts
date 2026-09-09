import { PrismaService } from '../src/infrastructure/database/prisma.service'
import { RagService } from '../src/application/ai-chat/rag.service'
import { EmbeddingService } from '../src/application/ai-chat/embedding.service'
import { ConfigService } from '@nestjs/config'
import { RagVectorStoreService } from '../src/application/ai-chat/rag-vector-store.service'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const envPath = resolve(process.cwd(), '.env')
if (existsSync(envPath)) for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match && process.env[match[1].trim()] === undefined) process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '')
}

async function main() {
  const prisma = new PrismaService()
  await prisma.$connect()
  try {
    const config = new ConfigService()
    const embedding = new EmbeddingService(config)
    const vectorStore = new RagVectorStoreService(embedding, config)
    const result = await new RagService(prisma, embedding, vectorStore, config).reindexPublished()
    console.log(JSON.stringify(result))
    await vectorStore.onModuleDestroy()
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
