DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lesson_type') THEN
    CREATE TYPE "lesson_type" AS ENUM ('vocabulary', 'terminology', 'technical_reading', 'api_documentation', 'system_design', 'case_study', 'certification_review');
  ELSE
    ALTER TYPE "lesson_type" ADD VALUE IF NOT EXISTS 'certification_review';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lesson_section_type') THEN
    CREATE TYPE "lesson_section_type" AS ENUM ('heading', 'rich_text', 'image', 'audio', 'video', 'code', 'vocabulary_list', 'callout', 'quiz');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'progress_resource_type' AND e.enumlabel = 'lesson') THEN
    ALTER TYPE "progress_resource_type" ADD VALUE 'lesson';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "lessons" (
  "id" UUID NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "slug" VARCHAR(220) NOT NULL,
  "summary" VARCHAR(1000) NOT NULL,
  "type" "lesson_type" NOT NULL,
  "domain_id" UUID NOT NULL,
  "level_id" UUID NOT NULL,
  "estimated_minutes" INTEGER NOT NULL,
  "thumbnail_url" VARCHAR(2048),
  "key_concepts" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "status" "content_status" NOT NULL DEFAULT 'draft',
  "published_at" TIMESTAMPTZ(6),
  "created_by_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "lessons_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lessons_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "lessons_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "lessons_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "lesson_sections" (
  "id" UUID NOT NULL,
  "lesson_id" UUID NOT NULL,
  "type" "lesson_section_type" NOT NULL,
  "order" INTEGER NOT NULL,
  "title" VARCHAR(200),
  "content" JSONB NOT NULL,
  CONSTRAINT "lesson_sections_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "lesson_sections_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "lesson_vocabularies" (
  "lesson_id" UUID NOT NULL,
  "vocabulary_id" UUID NOT NULL,
  CONSTRAINT "lesson_vocabularies_pkey" PRIMARY KEY ("lesson_id", "vocabulary_id"),
  CONSTRAINT "lesson_vocabularies_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "lesson_vocabularies_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabularies"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "lesson_certificates" (
  "lesson_id" UUID NOT NULL,
  "certificate_id" UUID NOT NULL,
  CONSTRAINT "lesson_certificates_pkey" PRIMARY KEY ("lesson_id", "certificate_id"),
  CONSTRAINT "lesson_certificates_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "lesson_certificates_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "lessons_slug_key" ON "lessons"("slug");
CREATE INDEX IF NOT EXISTS "lessons_domain_id_idx" ON "lessons"("domain_id");
CREATE INDEX IF NOT EXISTS "lessons_level_id_idx" ON "lessons"("level_id");
CREATE INDEX IF NOT EXISTS "lessons_status_idx" ON "lessons"("status");
CREATE INDEX IF NOT EXISTS "lessons_type_idx" ON "lessons"("type");
CREATE UNIQUE INDEX IF NOT EXISTS "lesson_sections_lesson_id_order_key" ON "lesson_sections"("lesson_id", "order");
CREATE INDEX IF NOT EXISTS "lesson_sections_lesson_id_idx" ON "lesson_sections"("lesson_id");
