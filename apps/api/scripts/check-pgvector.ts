import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    const [serverVersion, extension, vectorTable, vectorCount, dimensions, indexes, tableCount] = await Promise.all([
      prisma.$queryRawUnsafe('SELECT version()'),
      prisma.$queryRawUnsafe("SELECT name, default_version, installed_version FROM pg_available_extensions WHERE name = 'vector'"),
      prisma.$queryRawUnsafe("SELECT to_regclass('public.knowledge_vectors')::text AS table_name"),
      prisma.$queryRawUnsafe("SELECT CASE WHEN to_regclass('public.knowledge_vectors') IS NULL THEN 0 ELSE (SELECT COUNT(*) FROM knowledge_vectors) END AS count"),
      prisma.$queryRawUnsafe("SELECT vector_dims(embedding) AS dimensions FROM knowledge_vectors LIMIT 1"),
      prisma.$queryRawUnsafe("SELECT indexname FROM pg_indexes WHERE tablename = 'knowledge_vectors' ORDER BY indexname"),
      prisma.$queryRawUnsafe("SELECT COUNT(*)::bigint AS count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"),
    ])
    console.log(JSON.stringify({ serverVersion, extension, vectorTable, vectorCount, dimensions, indexes, tableCount }, (_, value) => typeof value === 'bigint' ? Number(value) : value))
  } finally { await prisma.$disconnect() }
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
