ALTER TABLE "knowledge_chunks"
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX "knowledge_chunks_is_active_idx" ON "knowledge_chunks"("is_active");
