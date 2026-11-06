ALTER TABLE "learner_profiles" ADD COLUMN "level_selected_at" TIMESTAMPTZ(6);

-- Preserve completed setups; unfinished accounts must explicitly select a level.
UPDATE "learner_profiles" SET "level_selected_at" = "updated_at"
WHERE "onboarding_completed" = true;

-- A submitted placement test is also an explicit determination of proficiency.
UPDATE "learner_profiles" AS p SET "level_selected_at" = a."submitted_at"
FROM (
  SELECT "learner_id", MAX("submitted_at") AS "submitted_at"
  FROM "placement_assessments"
  WHERE "submitted_at" IS NOT NULL AND jsonb_array_length("questions") > 0
  GROUP BY "learner_id"
) AS a
WHERE p."user_id" = a."learner_id" AND p."level_selected_at" IS NULL;
