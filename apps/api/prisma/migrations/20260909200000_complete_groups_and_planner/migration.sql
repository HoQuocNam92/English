-- Add the stable, searchable class code expected by the administration UI.
ALTER TABLE "learner_groups" ADD COLUMN IF NOT EXISTS "code" VARCHAR(40);
UPDATE "learner_groups"
SET "code" = 'GRP-' || UPPER(SUBSTRING(MD5("id"::text), 1, 8))
WHERE "code" IS NULL;
ALTER TABLE "learner_groups" ALTER COLUMN "code" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "learner_groups_code_key" ON "learner_groups"("code");
