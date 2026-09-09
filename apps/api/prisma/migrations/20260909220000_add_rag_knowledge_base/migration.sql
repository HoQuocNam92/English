CREATE TYPE "knowledge_source_type" AS ENUM ('lesson', 'lesson_section', 'vocabulary');
CREATE TYPE "knowledge_index_status" AS ENUM ('pending', 'indexed', 'failed', 'stale');

ALTER TABLE "ai_conversations" ADD COLUMN "lesson_id" UUID;

CREATE TABLE "knowledge_sources" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "source_type" "knowledge_source_type" NOT NULL,
  "source_id" UUID NOT NULL, "title" VARCHAR(300) NOT NULL, "content_version" VARCHAR(100) NOT NULL,
  "status" "knowledge_index_status" NOT NULL DEFAULT 'pending', "error_message" TEXT,
  "indexed_at" TIMESTAMPTZ(6), "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "knowledge_sources_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "knowledge_sources_source_type_source_id_key" ON "knowledge_sources"("source_type", "source_id");
CREATE INDEX "knowledge_sources_status_idx" ON "knowledge_sources"("status");

CREATE TABLE "knowledge_chunks" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "source_id" UUID NOT NULL, "chunk_index" INTEGER NOT NULL,
  "content" TEXT NOT NULL, "token_count" INTEGER NOT NULL DEFAULT 0, "lesson_id" UUID,
  "domain_id" UUID, "level_id" UUID, "certificate_id" UUID, "language" VARCHAR(20) NOT NULL DEFAULT 'mixed',
  CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "knowledge_chunks_source_id_chunk_index_key" ON "knowledge_chunks"("source_id", "chunk_index");
CREATE INDEX "knowledge_chunks_lesson_id_idx" ON "knowledge_chunks"("lesson_id");
CREATE INDEX "knowledge_chunks_domain_id_level_id_idx" ON "knowledge_chunks"("domain_id", "level_id");
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "knowledge_sources"("id") ON DELETE CASCADE;

CREATE TABLE "ai_message_citations" (
  "message_id" UUID NOT NULL, "chunk_id" UUID NOT NULL, "rank" INTEGER NOT NULL, "score" DOUBLE PRECISION NOT NULL,
  CONSTRAINT "ai_message_citations_pkey" PRIMARY KEY ("message_id", "chunk_id")
);
CREATE INDEX "ai_message_citations_chunk_id_idx" ON "ai_message_citations"("chunk_id");
ALTER TABLE "ai_message_citations" ADD CONSTRAINT "ai_message_citations_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "ai_messages"("id") ON DELETE CASCADE;
ALTER TABLE "ai_message_citations" ADD CONSTRAINT "ai_message_citations_chunk_id_fkey" FOREIGN KEY ("chunk_id") REFERENCES "knowledge_chunks"("id") ON DELETE RESTRICT;

CREATE TABLE "ai_feedback" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "message_id" UUID NOT NULL, "user_id" UUID NOT NULL,
  "helpful" BOOLEAN NOT NULL, "reason" VARCHAR(500), "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_feedback_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ai_feedback_message_id_user_id_key" ON "ai_feedback"("message_id", "user_id");
CREATE INDEX "ai_feedback_user_id_created_at_idx" ON "ai_feedback"("user_id", "created_at");
ALTER TABLE "ai_feedback" ADD CONSTRAINT "ai_feedback_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "ai_messages"("id") ON DELETE CASCADE;

CREATE TABLE "ai_usage_daily" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(), "user_id" UUID NOT NULL, "usage_date" DATE NOT NULL,
  "request_count" INTEGER NOT NULL DEFAULT 0, "input_tokens" INTEGER NOT NULL DEFAULT 0,
  "output_tokens" INTEGER NOT NULL DEFAULT 0, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ai_usage_daily_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ai_usage_daily_user_id_usage_date_key" ON "ai_usage_daily"("user_id", "usage_date");
CREATE INDEX "ai_usage_daily_usage_date_idx" ON "ai_usage_daily"("usage_date");
