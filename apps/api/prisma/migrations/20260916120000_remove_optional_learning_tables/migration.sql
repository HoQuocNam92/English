-- Move certificate study material into the existing lesson model before removing
-- the separate content table. Abort if required lesson references are unavailable.
BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "certification_contents") AND
     (NOT EXISTS (SELECT 1 FROM "domains") OR
      NOT EXISTS (SELECT 1 FROM "levels") OR
      NOT EXISTS (SELECT 1 FROM "users")) THEN
    RAISE EXCEPTION 'Cannot migrate certification contents without a domain, level and user';
  END IF;
END $$;

INSERT INTO "lessons" (
  "id", "title", "slug", "summary", "type", "domain_id", "level_id",
  "estimated_minutes", "status", "published_at", "created_by_id",
  "created_at", "updated_at", "key_concepts"
)
SELECT
  md5('cert-review-lesson:' || cc."id"::text)::uuid,
  cc."title",
  'cert-review-' || cc."id"::text,
  LEFT(COALESCE(NULLIF(cc."body", ''), cc."title"), 1000),
  'technical_reading'::"lesson_type",
  COALESCE(cd."domain_id", (SELECT "id" FROM "domains" ORDER BY "id" LIMIT 1)),
  (SELECT "id" FROM "levels" ORDER BY "order", "id" LIMIT 1),
  15,
  cc."status",
  CASE WHEN cc."status" = 'published' THEN cc."created_at" ELSE NULL END,
  (SELECT "id" FROM "users" ORDER BY "id" LIMIT 1),
  cc."created_at",
  cc."updated_at",
  CASE WHEN cc."topic" IS NULL OR cc."topic" = '' THEN ARRAY[]::TEXT[] ELSE ARRAY[cc."topic"] END
FROM "certification_contents" cc
LEFT JOIN LATERAL (
  SELECT "domain_id" FROM "certificate_domains"
  WHERE "certificate_id" = cc."certificate_id"
  ORDER BY "domain_id" LIMIT 1
) cd ON TRUE;

INSERT INTO "lesson_sections" ("id", "lesson_id", "type", "order", "title", "content")
SELECT
  md5('cert-review-section:' || "id"::text)::uuid,
  md5('cert-review-lesson:' || "id"::text)::uuid,
  'rich_text'::"lesson_section_type",
  "order",
  "topic",
  jsonb_build_object('text', "body")
FROM "certification_contents";

INSERT INTO "lesson_certificates" ("lesson_id", "certificate_id")
SELECT md5('cert-review-lesson:' || "id"::text)::uuid, "certificate_id"
FROM "certification_contents";

ALTER TABLE "attempt_answers"
  ADD COLUMN "selected_option_ids" UUID[] NOT NULL DEFAULT ARRAY[]::UUID[];

UPDATE "attempt_answers" AS answer
SET "selected_option_ids" = selected."option_ids"
FROM (
  SELECT "answer_id", array_agg("option_id" ORDER BY "option_id") AS "option_ids"
  FROM "attempt_answer_options"
  GROUP BY "answer_id"
) AS selected
WHERE answer."id" = selected."answer_id";

DROP TABLE "attempt_answer_options";
DROP TABLE "certification_contents";
DROP TABLE "learning_path_modules";
DROP TABLE "learning_paths";

COMMIT;
