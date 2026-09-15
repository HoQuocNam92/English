-- Product scope has exactly three learning levels.
-- Preserve existing references by moving Professional records to Advanced first.
UPDATE "learner_profiles"
SET "level_id" = (SELECT "id" FROM "levels" WHERE "code" = 'advanced')
WHERE "level_id" = (SELECT "id" FROM "levels" WHERE "code" = 'professional');

UPDATE "vocabularies"
SET "level_id" = (SELECT "id" FROM "levels" WHERE "code" = 'advanced')
WHERE "level_id" = (SELECT "id" FROM "levels" WHERE "code" = 'professional');

UPDATE "lessons"
SET "level_id" = (SELECT "id" FROM "levels" WHERE "code" = 'advanced')
WHERE "level_id" = (SELECT "id" FROM "levels" WHERE "code" = 'professional');

UPDATE "questions"
SET "level_id" = (SELECT "id" FROM "levels" WHERE "code" = 'advanced')
WHERE "level_id" = (SELECT "id" FROM "levels" WHERE "code" = 'professional');

UPDATE "exams"
SET "level_id" = (SELECT "id" FROM "levels" WHERE "code" = 'advanced')
WHERE "level_id" = (SELECT "id" FROM "levels" WHERE "code" = 'professional');

DELETE FROM "levels" WHERE "code" = 'professional';

ALTER TYPE "level_code" RENAME TO "level_code_old";
CREATE TYPE "level_code" AS ENUM ('beginner', 'intermediate', 'advanced');
ALTER TABLE "levels" ALTER COLUMN "code" TYPE "level_code" USING ("code"::text::"level_code");
DROP TYPE "level_code_old";
