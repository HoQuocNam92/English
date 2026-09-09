-- learning_progress.resource_id is polymorphic. A single column cannot reference
-- lessons, domains and certificates with three simultaneous foreign keys.
-- Referential integrity for (resource_type, resource_id) is enforced by ProgressService.
ALTER TABLE "learning_progress" DROP CONSTRAINT IF EXISTS "fk_progress_lesson";
ALTER TABLE "learning_progress" DROP CONSTRAINT IF EXISTS "fk_progress_domain";
ALTER TABLE "learning_progress" DROP CONSTRAINT IF EXISTS "fk_progress_certificate";

-- learner_profiles belongs exclusively to users whose core role is learner.
DELETE FROM "learner_profiles" AS profile
WHERE NOT EXISTS (
  SELECT 1
  FROM "user_roles" AS user_role
  JOIN "roles" AS role ON role."id" = user_role."role_id"
  WHERE user_role."user_id" = profile."user_id"
    AND role."code" = 'learner'
);

-- Repair old learner accounts that were created without a profile.
INSERT INTO "learner_profiles" (
  "id", "user_id", "level_id", "weekly_study_target_minutes",
  "onboarding_completed", "created_at", "updated_at"
)
SELECT
  gen_random_uuid(), learner."id", default_level."id", 180,
  false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "users" AS learner
CROSS JOIN LATERAL (
  SELECT "id" FROM "levels" ORDER BY "order" ASC LIMIT 1
) AS default_level
WHERE EXISTS (
  SELECT 1
  FROM "user_roles" AS user_role
  JOIN "roles" AS role ON role."id" = user_role."role_id"
  WHERE user_role."user_id" = learner."id"
    AND role."code" = 'learner'
)
AND NOT EXISTS (
  SELECT 1 FROM "learner_profiles" AS profile WHERE profile."user_id" = learner."id"
);
