CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "knowledge_vectors" (
  "id" UUID NOT NULL PRIMARY KEY,
  "content" TEXT NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "embedding" vector(1024) NOT NULL
);

CREATE INDEX "knowledge_vectors_embedding_hnsw_idx"
ON "knowledge_vectors" USING hnsw ("embedding" vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX "knowledge_vectors_metadata_gin_idx"
ON "knowledge_vectors" USING gin ("metadata");
