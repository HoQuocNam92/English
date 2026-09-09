-- Ensure restored certification-objective tables also exist on fresh databases.
-- IF NOT EXISTS preserves restored production data.

CREATE TABLE IF NOT EXISTS "certification_objectives" (
  "id" UUID NOT NULL,
  "certificate_id" UUID NOT NULL,
  "code" VARCHAR(40) NOT NULL,
  "title" VARCHAR(300) NOT NULL,
  "description" TEXT NOT NULL,
  "parent_id" UUID,
  "weight_min_percent" DECIMAL,
  "weight_max_percent" DECIMAL,
  "assessment_kind" VARCHAR(20) NOT NULL,
  "min_vocabularies" INTEGER NOT NULL DEFAULT 5,
  "min_lessons" INTEGER NOT NULL DEFAULT 1,
  "min_questions" INTEGER NOT NULL DEFAULT 5,
  "min_labs" INTEGER NOT NULL DEFAULT 0,
  "source_url" TEXT NOT NULL,
  "source_version" VARCHAR(80) NOT NULL,
  "source_checked_at" TIMESTAMPTZ(6) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "certification_objectives_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "certification_objectives_certificate_id_code_key" UNIQUE ("certificate_id", "code"),
  CONSTRAINT "certification_objectives_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "certification_objectives_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "certification_objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "hands_on_labs" (
  "id" UUID NOT NULL,
  "certificate_id" UUID NOT NULL,
  "level_id" UUID NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "slug" VARCHAR(220) NOT NULL,
  "summary" VARCHAR(1000) NOT NULL,
  "instructions" JSONB NOT NULL,
  "validation_rules" JSONB NOT NULL,
  "estimated_minutes" INTEGER NOT NULL,
  "status" "content_status" NOT NULL DEFAULT 'draft',
  "source_url" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hands_on_labs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "hands_on_labs_slug_key" UNIQUE ("slug"),
  CONSTRAINT "hands_on_labs_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "hands_on_labs_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "learner_objective_mastery" (
  "learner_id" UUID NOT NULL,
  "objective_id" UUID NOT NULL,
  "knowledge_score_percent" DOUBLE PRECISION,
  "practical_score_percent" DOUBLE PRECISION,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "last_assessed_at" TIMESTAMPTZ(6),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "learner_objective_mastery_pkey" PRIMARY KEY ("learner_id", "objective_id"),
  CONSTRAINT "learner_objective_mastery_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "learner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "learner_objective_mastery_objective_id_fkey" FOREIGN KEY ("objective_id") REFERENCES "certification_objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "objective_labs" (
  "objective_id" UUID NOT NULL,
  "lab_id" UUID NOT NULL,
  CONSTRAINT "objective_labs_pkey" PRIMARY KEY ("objective_id", "lab_id"),
  CONSTRAINT "objective_labs_objective_id_fkey" FOREIGN KEY ("objective_id") REFERENCES "certification_objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "objective_labs_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "hands_on_labs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "objective_lessons" (
  "objective_id" UUID NOT NULL,
  "lesson_id" UUID NOT NULL,
  CONSTRAINT "objective_lessons_pkey" PRIMARY KEY ("objective_id", "lesson_id"),
  CONSTRAINT "objective_lessons_objective_id_fkey" FOREIGN KEY ("objective_id") REFERENCES "certification_objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "objective_lessons_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "objective_questions" (
  "objective_id" UUID NOT NULL,
  "question_id" UUID NOT NULL,
  CONSTRAINT "objective_questions_pkey" PRIMARY KEY ("objective_id", "question_id"),
  CONSTRAINT "objective_questions_objective_id_fkey" FOREIGN KEY ("objective_id") REFERENCES "certification_objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "objective_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "objective_vocabularies" (
  "objective_id" UUID NOT NULL,
  "vocabulary_id" UUID NOT NULL,
  CONSTRAINT "objective_vocabularies_pkey" PRIMARY KEY ("objective_id", "vocabulary_id"),
  CONSTRAINT "objective_vocabularies_objective_id_fkey" FOREIGN KEY ("objective_id") REFERENCES "certification_objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "objective_vocabularies_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabularies"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "vocabulary_sources" (
  "vocabulary_id" UUID NOT NULL,
  "source" TEXT NOT NULL,
  "source_url" TEXT NOT NULL,
  "source_title" TEXT NOT NULL,
  "content_hash" CHAR(64) NOT NULL,
  "crawled_at" TIMESTAMPTZ(6) NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  CONSTRAINT "vocabulary_sources_pkey" PRIMARY KEY ("vocabulary_id", "source", "source_url"),
  CONSTRAINT "vocabulary_sources_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabularies"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "certification_objectives_certificate_id_idx" ON "certification_objectives"("certificate_id");
CREATE INDEX IF NOT EXISTS "certification_objectives_parent_id_idx" ON "certification_objectives"("parent_id");
CREATE INDEX IF NOT EXISTS "hands_on_labs_certificate_id_idx" ON "hands_on_labs"("certificate_id");
CREATE INDEX IF NOT EXISTS "hands_on_labs_level_id_idx" ON "hands_on_labs"("level_id");
CREATE INDEX IF NOT EXISTS "learner_objective_mastery_objective_id_idx" ON "learner_objective_mastery"("objective_id");
CREATE INDEX IF NOT EXISTS "objective_labs_lab_id_idx" ON "objective_labs"("lab_id");
CREATE INDEX IF NOT EXISTS "objective_lessons_lesson_id_idx" ON "objective_lessons"("lesson_id");
CREATE INDEX IF NOT EXISTS "objective_questions_question_id_idx" ON "objective_questions"("question_id");
CREATE INDEX IF NOT EXISTS "objective_vocabularies_vocabulary_id_idx" ON "objective_vocabularies"("vocabulary_id");
