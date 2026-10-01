ALTER TABLE "learner_profiles"
ADD COLUMN "learning_goal" VARCHAR(20);

UPDATE "learner_profiles" AS profile
SET "learning_goal" = CASE
  WHEN EXISTS (
    SELECT 1
    FROM "learner_certificate_goals" AS goal
    WHERE goal."profile_id" = profile."id"
  ) THEN 'certification'
  WHEN EXISTS (
    SELECT 1
    FROM "learner_profile_domains" AS domain_goal
    WHERE domain_goal."profile_id" = profile."id"
  ) THEN 'vocabulary'
  ELSE NULL
END;

ALTER TABLE "learner_profiles"
ADD CONSTRAINT "learner_profiles_learning_goal_check"
CHECK ("learning_goal" IS NULL OR "learning_goal" IN ('vocabulary', 'certification', 'both'));
