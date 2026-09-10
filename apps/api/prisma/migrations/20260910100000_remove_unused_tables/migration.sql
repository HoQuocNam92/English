-- Remove unused recommendation feedback storage.
DROP TABLE IF EXISTS "recommendation_feedbacks";
DROP TYPE IF EXISTS "recommendation_feedback_action";

-- Remove the unused limited-slot plan configuration.
DROP TABLE IF EXISTS "plan_quotas";

-- Remove the unused advanced certification-objective and hands-on-lab module.
DROP TABLE IF EXISTS "objective_labs";
DROP TABLE IF EXISTS "objective_lessons";
DROP TABLE IF EXISTS "objective_questions";
DROP TABLE IF EXISTS "objective_vocabularies";
DROP TABLE IF EXISTS "learner_objective_mastery";
DROP TABLE IF EXISTS "hands_on_labs";
DROP TABLE IF EXISTS "certification_objectives";
