CREATE TYPE "question_skill" AS ENUM ('vocabulary', 'reading', 'technical_understanding', 'scenario_based');
ALTER TABLE "questions" ADD COLUMN "skill" "question_skill" NOT NULL DEFAULT 'vocabulary';
UPDATE "questions" SET "skill" = 'scenario_based' WHERE "type" = 'scenario';
UPDATE "questions" SET "skill" = 'reading' WHERE "context" IS NOT NULL AND LENGTH(TRIM("context")) > 0 AND "type" <> 'scenario';
CREATE INDEX "questions_skill_idx" ON "questions"("skill");
