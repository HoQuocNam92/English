CREATE TYPE "exam_kind" AS ENUM ('practice', 'domain_test', 'mock_exam');

ALTER TABLE "certificates"
  ADD COLUMN "category" VARCHAR(50),
  ADD COLUMN "exam_duration_minutes" INTEGER,
  ADD COLUMN "exam_question_count" INTEGER,
  ADD COLUMN "passing_scaled_score" INTEGER;

ALTER TABLE "certificate_domains"
  ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "weight_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "topics" JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE "exams"
  ADD COLUMN "kind" "exam_kind" NOT NULL DEFAULT 'practice';

CREATE INDEX "certificate_domains_certificate_id_order_idx"
  ON "certificate_domains"("certificate_id", "order");

CREATE INDEX "exams_certificate_id_kind_idx"
  ON "exams"("certificate_id", "kind");
