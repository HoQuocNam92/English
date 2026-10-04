CREATE TABLE "placement_assessments" (
 "id" UUID NOT NULL,
 "learner_id" UUID NOT NULL,
 "questions" JSONB NOT NULL,
 "answers" JSONB,
 "result" JSONB,
 "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "expires_at" TIMESTAMPTZ(6) NOT NULL,
 "submitted_at" TIMESTAMPTZ(6),
 CONSTRAINT "placement_assessments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "placement_assessments_learner_id_created_at_idx" ON "placement_assessments"("learner_id", "created_at");
ALTER TABLE "placement_assessments" ADD CONSTRAINT "placement_assessments_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
