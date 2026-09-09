-- Reconcile an older restored database with the application schema.
-- This migration is intentionally additive: legacy certification/vocabulary
-- tables are preserved because they can contain restored user data.

CREATE TYPE "learner_group_status" AS ENUM ('active', 'completed', 'archived');

ALTER TABLE "lessons"
  ADD COLUMN "key_concepts" TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "mock_interview_turns"
  ADD COLUMN "clarity_score" DOUBLE PRECISION,
  ADD COLUMN "communication_score" DOUBLE PRECISION,
  ADD COLUMN "grammar_score" DOUBLE PRECISION,
  ADD COLUMN "improvements" TEXT,
  ADD COLUMN "strengths" TEXT,
  ADD COLUMN "technical_score" DOUBLE PRECISION,
  ADD COLUMN "vocab_score" DOUBLE PRECISION;

ALTER TABLE "writing_submissions"
  ADD COLUMN "prompt_id" UUID,
  ADD COLUMN "suggestions" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "technical_score" DOUBLE PRECISION;

CREATE TABLE "learner_groups" (
  "id" UUID NOT NULL,
  "name" VARCHAR(150) NOT NULL,
  "description" VARCHAR(1000),
  "teacher_id" UUID NOT NULL,
  "domain_id" UUID NOT NULL,
  "certificate_id" UUID NOT NULL,
  "status" "learner_group_status" NOT NULL DEFAULT 'active',
  "starts_at" TIMESTAMPTZ(6),
  "ends_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "learner_groups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "learner_group_members" (
  "group_id" UUID NOT NULL,
  "learner_id" UUID NOT NULL,
  "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "learner_group_members_pkey" PRIMARY KEY ("group_id", "learner_id")
);

CREATE TABLE "certification_contents" (
  "id" UUID NOT NULL,
  "certificate_id" UUID NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "body" TEXT NOT NULL,
  "topic" VARCHAR(100),
  "order" INTEGER NOT NULL DEFAULT 0,
  "status" "content_status" NOT NULL DEFAULT 'draft',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "certification_contents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "learning_sessions" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "lesson_id" UUID,
  "session_type" VARCHAR(50) NOT NULL,
  "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ended_at" TIMESTAMPTZ(6),
  "duration_seconds" INTEGER NOT NULL DEFAULT 0,
  "study_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "time_of_day" VARCHAR(20) NOT NULL,
  CONSTRAINT "learning_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "career_goal_skills" (
  "id" UUID NOT NULL,
  "career_goal_id" UUID NOT NULL,
  "lesson_id" UUID,
  "name" VARCHAR(150) NOT NULL,
  CONSTRAINT "career_goal_skills_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "learning_paths" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "career_goal" VARCHAR(150) NOT NULL,
  "current_level" VARCHAR(50) NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "learning_path_modules" (
  "id" UUID NOT NULL,
  "learning_path_id" UUID NOT NULL,
  "order" INTEGER NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "description" TEXT NOT NULL,
  "status" VARCHAR(30) NOT NULL,
  "progress_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "current_lesson_id" UUID,
  CONSTRAINT "learning_path_modules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "writing_prompts" (
  "id" UUID NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "topic" VARCHAR(200) NOT NULL,
  "prompt_text" TEXT NOT NULL,
  "difficulty" VARCHAR(50) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "writing_prompts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "learning_plan_items" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "lessonId" UUID,
  "title" VARCHAR(200) NOT NULL,
  "note" TEXT,
  "planned_at" TIMESTAMPTZ(6) NOT NULL,
  "duration_min" INTEGER NOT NULL DEFAULT 30,
  "is_completed" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "learning_plan_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "learner_groups_teacher_id_idx" ON "learner_groups"("teacher_id");
CREATE INDEX "learner_groups_domain_id_idx" ON "learner_groups"("domain_id");
CREATE INDEX "learner_groups_certificate_id_idx" ON "learner_groups"("certificate_id");
CREATE INDEX "learner_groups_status_idx" ON "learner_groups"("status");
CREATE INDEX "certification_contents_certificate_id_idx" ON "certification_contents"("certificate_id");
CREATE INDEX "learning_sessions_user_id_study_date_idx" ON "learning_sessions"("user_id", "study_date");
CREATE INDEX "career_goal_skills_career_goal_id_idx" ON "career_goal_skills"("career_goal_id");
CREATE INDEX "learning_paths_user_id_created_at_idx" ON "learning_paths"("user_id", "created_at");
CREATE INDEX "learning_path_modules_learning_path_id_order_idx" ON "learning_path_modules"("learning_path_id", "order");
CREATE INDEX "learning_plan_items_userId_idx" ON "learning_plan_items"("userId");
CREATE INDEX "learning_plan_items_planned_at_idx" ON "learning_plan_items"("planned_at");

ALTER TABLE "learner_groups" ADD CONSTRAINT "learner_groups_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "learner_groups" ADD CONSTRAINT "learner_groups_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "learner_groups" ADD CONSTRAINT "learner_groups_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "learner_group_members" ADD CONSTRAINT "learner_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "learner_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learner_group_members" ADD CONSTRAINT "learner_group_members_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "certification_contents" ADD CONSTRAINT "certification_contents_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "writing_submissions" ADD CONSTRAINT "writing_submissions_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "writing_prompts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "career_goal_skills" ADD CONSTRAINT "career_goal_skills_career_goal_id_fkey" FOREIGN KEY ("career_goal_id") REFERENCES "career_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "career_goal_skills" ADD CONSTRAINT "career_goal_skills_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_path_modules" ADD CONSTRAINT "learning_path_modules_learning_path_id_fkey" FOREIGN KEY ("learning_path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_plan_items" ADD CONSTRAINT "learning_plan_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_plan_items" ADD CONSTRAINT "learning_plan_items_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
