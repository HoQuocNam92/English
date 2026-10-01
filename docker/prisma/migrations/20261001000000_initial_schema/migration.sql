-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "content_status" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "lesson_type" AS ENUM ('vocabulary', 'terminology', 'technical_reading', 'api_documentation', 'system_design', 'case_study', 'certification_review');

-- CreateEnum
CREATE TYPE "lesson_section_type" AS ENUM ('heading', 'rich_text', 'image', 'audio', 'video', 'code', 'vocabulary_list', 'callout', 'quiz');

-- CreateEnum
CREATE TYPE "question_type" AS ENUM ('single_choice', 'multiple_choice', 'true_false', 'short_answer', 'scenario');

-- CreateEnum
CREATE TYPE "question_skill" AS ENUM ('vocabulary', 'reading', 'technical_understanding', 'scenario_based');

-- CreateEnum
CREATE TYPE "exam_kind" AS ENUM ('practice', 'domain_test', 'mock_exam', 'scenario_assessment');

-- CreateEnum
CREATE TYPE "attempt_status" AS ENUM ('in_progress', 'submitted', 'graded', 'expired');

-- CreateEnum
CREATE TYPE "progress_status" AS ENUM ('not_started', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "progress_resource_type" AS ENUM ('lesson', 'domain', 'certificate');

-- CreateEnum
CREATE TYPE "level_code" AS ENUM ('beginner', 'intermediate', 'advanced', 'professional');

-- CreateEnum
CREATE TYPE "vocab_study_status" AS ENUM ('new', 'learning', 'mastered');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "status" "user_status" NOT NULL DEFAULT 'active',
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_details" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "display_name" VARCHAR(150) NOT NULL,
    "avatar_url" VARCHAR(2048),
    "phone_number" VARCHAR(20),
    "date_of_birth" DATE,
    "gender" VARCHAR(20),
    "bio" VARCHAR(500),
    "timezone" VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    "locale" VARCHAR(10) DEFAULT 'vi',
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500),
    "resource" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "granted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6),
    "granted_by_id" UUID,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "user_agent" VARCHAR(500),
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "otp_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domains" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "icon" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "order" INTEGER NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "provider" VARCHAR(100) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "category" VARCHAR(50),
    "exam_duration_minutes" INTEGER,
    "exam_question_count" INTEGER,
    "passing_scaled_score" INTEGER,
    "exam_url" VARCHAR(2048),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_goals" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "career_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_domains" (
    "certificate_id" UUID NOT NULL,
    "domain_id" UUID NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "weight_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "certificate_domains_pkey" PRIMARY KEY ("certificate_id","domain_id")
);

-- CreateTable
CREATE TABLE "certification_topics" (
    "id" UUID NOT NULL,
    "certificate_id" UUID NOT NULL,
    "domain_id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "certification_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "bio" VARCHAR(500),
    "weekly_study_target_minutes" INTEGER NOT NULL DEFAULT 180,
    "daily_vocabulary_target" INTEGER NOT NULL DEFAULT 10,
    "weekly_exam_target" INTEGER NOT NULL DEFAULT 2,
    "daily_study_target_minutes" INTEGER NOT NULL DEFAULT 30,
    "reminder_time" VARCHAR(5),
    "reminder_enabled" BOOLEAN NOT NULL DEFAULT false,
    "learning_goal" VARCHAR(20),
    "learning_path_mode" VARCHAR(20) NOT NULL DEFAULT 'smart',
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "learner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_profile_domains" (
    "profile_id" UUID NOT NULL,
    "domain_id" UUID NOT NULL,

    CONSTRAINT "learner_profile_domains_pkey" PRIMARY KEY ("profile_id","domain_id")
);

-- CreateTable
CREATE TABLE "learner_certificate_goals" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "certificate_id" UUID NOT NULL,
    "target_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learner_certificate_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_profile_career_goals" (
    "profile_id" UUID NOT NULL,
    "career_goal_id" UUID NOT NULL,

    CONSTRAINT "learner_profile_career_goals_pkey" PRIMARY KEY ("profile_id","career_goal_id")
);

-- CreateTable
CREATE TABLE "learner_groups" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500),
    "owner_id" UUID NOT NULL,
    "career_goal_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "learner_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_group_members" (
    "group_id" UUID NOT NULL,
    "learner_id" UUID NOT NULL,
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learner_group_members_pkey" PRIMARY KEY ("group_id","learner_id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "platform" VARCHAR(20) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_sent_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabularies" (
    "id" UUID NOT NULL,
    "term" VARCHAR(150) NOT NULL,
    "pronunciation_ipa" VARCHAR(100),
    "audio_url" VARCHAR(2048),
    "part_of_speech" VARCHAR(50),
    "definition_en" VARCHAR(1000) NOT NULL,
    "definition_vi" VARCHAR(1000) NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "domain_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "status" "content_status" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "vocabularies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_topic_vocabularies" (
    "topic_id" UUID NOT NULL,
    "vocabulary_id" UUID NOT NULL,

    CONSTRAINT "certification_topic_vocabularies_pkey" PRIMARY KEY ("topic_id","vocabulary_id")
);

-- CreateTable
CREATE TABLE "vocabulary_examples" (
    "id" UUID NOT NULL,
    "vocabulary_id" UUID NOT NULL,
    "sentence_en" VARCHAR(500) NOT NULL,
    "translation_vi" VARCHAR(500),
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "vocabulary_examples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "summary" VARCHAR(1000) NOT NULL,
    "type" "lesson_type" NOT NULL,
    "domain_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "estimated_minutes" INTEGER NOT NULL,
    "thumbnail_url" VARCHAR(2048),
    "key_concepts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "content_status" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMPTZ(6),
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_sections" (
    "id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "type" "lesson_section_type" NOT NULL,
    "order" INTEGER NOT NULL,
    "title" VARCHAR(200),
    "content" JSONB NOT NULL,

    CONSTRAINT "lesson_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_vocabularies" (
    "lesson_id" UUID NOT NULL,
    "vocabulary_id" UUID NOT NULL,

    CONSTRAINT "lesson_vocabularies_pkey" PRIMARY KEY ("lesson_id","vocabulary_id")
);

-- CreateTable
CREATE TABLE "lesson_certificates" (
    "lesson_id" UUID NOT NULL,
    "certificate_id" UUID NOT NULL,

    CONSTRAINT "lesson_certificates_pkey" PRIMARY KEY ("lesson_id","certificate_id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL,
    "type" "question_type" NOT NULL,
    "skill" "question_skill" NOT NULL DEFAULT 'vocabulary',
    "prompt" TEXT NOT NULL,
    "context" TEXT,
    "code_snippet" TEXT,
    "explanation" TEXT NOT NULL,
    "domain_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accepted_answers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "points" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "status" "content_status" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_topic_questions" (
    "topic_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,

    CONSTRAINT "certification_topic_questions_pkey" PRIMARY KEY ("topic_id","question_id")
);

-- CreateTable
CREATE TABLE "saved_questions" (
    "learner_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_questions_pkey" PRIMARY KEY ("learner_id","question_id")
);

-- CreateTable
CREATE TABLE "question_options" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "key" VARCHAR(10) NOT NULL,
    "text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(2000) NOT NULL,
    "domain_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "certificate_id" UUID,
    "kind" "exam_kind" NOT NULL DEFAULT 'practice',
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "duration_minutes" INTEGER NOT NULL,
    "passing_score_percent" DOUBLE PRECISION NOT NULL DEFAULT 70.0,
    "max_attempts" INTEGER NOT NULL DEFAULT 1,
    "shuffle_questions" BOOLEAN NOT NULL DEFAULT false,
    "available_from" TIMESTAMPTZ(6),
    "available_until" TIMESTAMPTZ(6),
    "status" "content_status" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMPTZ(6),
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_questions" (
    "exam_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "exam_questions_pkey" PRIMARY KEY ("exam_id","question_id")
);

-- CreateTable
CREATE TABLE "exam_attempts" (
    "id" UUID NOT NULL,
    "exam_id" UUID NOT NULL,
    "learner_id" UUID NOT NULL,
    "status" "attempt_status" NOT NULL DEFAULT 'in_progress',
    "questions_snapshot" JSONB NOT NULL,
    "exam_snapshot" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "max_score" DOUBLE PRECISION,
    "score_percent" DOUBLE PRECISION,
    "passed" BOOLEAN,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6),
    "submitted_at" TIMESTAMPTZ(6),
    "graded_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempt_answers" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "text_answer" VARCHAR(2000),
    "is_correct" BOOLEAN,
    "earned_points" DOUBLE PRECISION,
    "max_points" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "selected_option_ids" UUID[] DEFAULT ARRAY[]::UUID[],

    CONSTRAINT "attempt_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_progress" (
    "id" UUID NOT NULL,
    "learner_id" UUID NOT NULL,
    "resource_type" "progress_resource_type" NOT NULL,
    "resource_id" UUID NOT NULL,
    "completed_lesson_count" INTEGER NOT NULL DEFAULT 0,
    "total_lesson_count" INTEGER NOT NULL DEFAULT 0,
    "status" "progress_status" NOT NULL DEFAULT 'not_started',
    "completion_percent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "average_score_percent" DOUBLE PRECISION,
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "learning_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_progress" (
    "id" UUID NOT NULL,
    "learner_id" UUID NOT NULL,
    "vocabulary_id" UUID NOT NULL,
    "status" "vocab_study_status" NOT NULL DEFAULT 'new',
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "wrong_count" INTEGER NOT NULL DEFAULT 0,
    "last_review_at" TIMESTAMPTZ(6),
    "next_review_at" TIMESTAMPTZ(6),
    "last_rating" VARCHAR(20),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "vocabulary_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_details_user_id_key" ON "user_details"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE INDEX "roles_code_idx" ON "roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "permissions_resource_idx" ON "permissions"("resource");

-- CreateIndex
CREATE INDEX "permissions_resource_action_idx" ON "permissions"("resource", "action");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_email_idx" ON "password_reset_tokens"("email");

-- CreateIndex
CREATE UNIQUE INDEX "domains_code_key" ON "domains"("code");

-- CreateIndex
CREATE INDEX "domains_code_idx" ON "domains"("code");

-- CreateIndex
CREATE INDEX "domains_is_active_idx" ON "domains"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "levels_code_key" ON "levels"("code");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_code_key" ON "certificates"("code");

-- CreateIndex
CREATE INDEX "certificates_code_idx" ON "certificates"("code");

-- CreateIndex
CREATE UNIQUE INDEX "career_goals_code_key" ON "career_goals"("code");

-- CreateIndex
CREATE INDEX "career_goals_is_active_idx" ON "career_goals"("is_active");

-- CreateIndex
CREATE INDEX "certificate_domains_certificate_id_order_idx" ON "certificate_domains"("certificate_id", "order");

-- CreateIndex
CREATE INDEX "certification_topics_certificate_id_domain_id_idx" ON "certification_topics"("certificate_id", "domain_id");

-- CreateIndex
CREATE UNIQUE INDEX "certification_topics_certificate_id_code_key" ON "certification_topics"("certificate_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "certification_topics_certificate_id_domain_id_order_key" ON "certification_topics"("certificate_id", "domain_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "learner_profiles_user_id_key" ON "learner_profiles"("user_id");

-- CreateIndex
CREATE INDEX "learner_profiles_level_id_idx" ON "learner_profiles"("level_id");

-- CreateIndex
CREATE UNIQUE INDEX "learner_certificate_goals_profile_id_certificate_id_key" ON "learner_certificate_goals"("profile_id", "certificate_id");

-- CreateIndex
CREATE INDEX "learner_profile_career_goals_career_goal_id_idx" ON "learner_profile_career_goals"("career_goal_id");

-- CreateIndex
CREATE INDEX "learner_groups_owner_id_idx" ON "learner_groups"("owner_id");

-- CreateIndex
CREATE INDEX "learner_groups_career_goal_id_idx" ON "learner_groups"("career_goal_id");

-- CreateIndex
CREATE INDEX "learner_group_members_learner_id_idx" ON "learner_group_members"("learner_id");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_token_key" ON "push_subscriptions"("token");

-- CreateIndex
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "push_subscriptions_active_idx" ON "push_subscriptions"("active");

-- CreateIndex
CREATE INDEX "vocabularies_domain_id_idx" ON "vocabularies"("domain_id");

-- CreateIndex
CREATE INDEX "vocabularies_level_id_idx" ON "vocabularies"("level_id");

-- CreateIndex
CREATE INDEX "vocabularies_status_idx" ON "vocabularies"("status");

-- CreateIndex
CREATE UNIQUE INDEX "vocabularies_term_domain_id_key" ON "vocabularies"("term", "domain_id");

-- CreateIndex
CREATE INDEX "certification_topic_vocabularies_vocabulary_id_idx" ON "certification_topic_vocabularies"("vocabulary_id");

-- CreateIndex
CREATE INDEX "vocabulary_examples_vocabulary_id_idx" ON "vocabulary_examples"("vocabulary_id");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_slug_key" ON "lessons"("slug");

-- CreateIndex
CREATE INDEX "lessons_domain_id_idx" ON "lessons"("domain_id");

-- CreateIndex
CREATE INDEX "lessons_level_id_idx" ON "lessons"("level_id");

-- CreateIndex
CREATE INDEX "lessons_status_idx" ON "lessons"("status");

-- CreateIndex
CREATE INDEX "lessons_type_idx" ON "lessons"("type");

-- CreateIndex
CREATE INDEX "lesson_sections_lesson_id_idx" ON "lesson_sections"("lesson_id");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_sections_lesson_id_order_key" ON "lesson_sections"("lesson_id", "order");

-- CreateIndex
CREATE INDEX "questions_domain_id_idx" ON "questions"("domain_id");

-- CreateIndex
CREATE INDEX "questions_level_id_idx" ON "questions"("level_id");

-- CreateIndex
CREATE INDEX "questions_type_idx" ON "questions"("type");

-- CreateIndex
CREATE INDEX "questions_status_idx" ON "questions"("status");

-- CreateIndex
CREATE INDEX "questions_skill_idx" ON "questions"("skill");

-- CreateIndex
CREATE INDEX "certification_topic_questions_question_id_idx" ON "certification_topic_questions"("question_id");

-- CreateIndex
CREATE INDEX "saved_questions_question_id_idx" ON "saved_questions"("question_id");

-- CreateIndex
CREATE INDEX "question_options_question_id_idx" ON "question_options"("question_id");

-- CreateIndex
CREATE INDEX "exams_domain_id_idx" ON "exams"("domain_id");

-- CreateIndex
CREATE INDEX "exams_level_id_idx" ON "exams"("level_id");

-- CreateIndex
CREATE INDEX "exams_certificate_id_idx" ON "exams"("certificate_id");

-- CreateIndex
CREATE INDEX "exams_status_idx" ON "exams"("status");

-- CreateIndex
CREATE INDEX "exams_certificate_id_kind_idx" ON "exams"("certificate_id", "kind");

-- CreateIndex
CREATE INDEX "exam_questions_exam_id_idx" ON "exam_questions"("exam_id");

-- CreateIndex
CREATE INDEX "exam_attempts_exam_id_idx" ON "exam_attempts"("exam_id");

-- CreateIndex
CREATE INDEX "exam_attempts_learner_id_idx" ON "exam_attempts"("learner_id");

-- CreateIndex
CREATE INDEX "exam_attempts_status_idx" ON "exam_attempts"("status");

-- CreateIndex
CREATE INDEX "exam_attempts_learner_id_exam_id_idx" ON "exam_attempts"("learner_id", "exam_id");

-- CreateIndex
CREATE INDEX "attempt_answers_attempt_id_idx" ON "attempt_answers"("attempt_id");

-- CreateIndex
CREATE UNIQUE INDEX "attempt_answers_attempt_id_question_id_key" ON "attempt_answers"("attempt_id", "question_id");

-- CreateIndex
CREATE INDEX "learning_progress_learner_id_idx" ON "learning_progress"("learner_id");

-- CreateIndex
CREATE INDEX "learning_progress_resource_type_resource_id_idx" ON "learning_progress"("resource_type", "resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_progress_learner_id_resource_type_resource_id_key" ON "learning_progress"("learner_id", "resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "vocabulary_progress_learner_id_status_idx" ON "vocabulary_progress"("learner_id", "status");

-- CreateIndex
CREATE INDEX "vocabulary_progress_learner_id_next_review_at_idx" ON "vocabulary_progress"("learner_id", "next_review_at");

-- CreateIndex
CREATE UNIQUE INDEX "vocabulary_progress_learner_id_vocabulary_id_key" ON "vocabulary_progress"("learner_id", "vocabulary_id");

-- AddForeignKey
ALTER TABLE "user_details" ADD CONSTRAINT "user_details_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_granted_by_id_fkey" FOREIGN KEY ("granted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_domains" ADD CONSTRAINT "certificate_domains_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_domains" ADD CONSTRAINT "certificate_domains_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_topics" ADD CONSTRAINT "certification_topics_certificate_id_domain_id_fkey" FOREIGN KEY ("certificate_id", "domain_id") REFERENCES "certificate_domains"("certificate_id", "domain_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_profiles" ADD CONSTRAINT "learner_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_profiles" ADD CONSTRAINT "learner_profiles_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_profile_domains" ADD CONSTRAINT "learner_profile_domains_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "learner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_profile_domains" ADD CONSTRAINT "learner_profile_domains_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_certificate_goals" ADD CONSTRAINT "learner_certificate_goals_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "learner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_certificate_goals" ADD CONSTRAINT "learner_certificate_goals_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_profile_career_goals" ADD CONSTRAINT "learner_profile_career_goals_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "learner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_profile_career_goals" ADD CONSTRAINT "learner_profile_career_goals_career_goal_id_fkey" FOREIGN KEY ("career_goal_id") REFERENCES "career_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_groups" ADD CONSTRAINT "learner_groups_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_groups" ADD CONSTRAINT "learner_groups_career_goal_id_fkey" FOREIGN KEY ("career_goal_id") REFERENCES "career_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_group_members" ADD CONSTRAINT "learner_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "learner_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_group_members" ADD CONSTRAINT "learner_group_members_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabularies" ADD CONSTRAINT "vocabularies_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabularies" ADD CONSTRAINT "vocabularies_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_topic_vocabularies" ADD CONSTRAINT "certification_topic_vocabularies_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "certification_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_topic_vocabularies" ADD CONSTRAINT "certification_topic_vocabularies_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabularies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_examples" ADD CONSTRAINT "vocabulary_examples_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabularies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_sections" ADD CONSTRAINT "lesson_sections_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_vocabularies" ADD CONSTRAINT "lesson_vocabularies_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_vocabularies" ADD CONSTRAINT "lesson_vocabularies_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabularies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_certificates" ADD CONSTRAINT "lesson_certificates_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_certificates" ADD CONSTRAINT "lesson_certificates_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_topic_questions" ADD CONSTRAINT "certification_topic_questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "certification_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_topic_questions" ADD CONSTRAINT "certification_topic_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_questions" ADD CONSTRAINT "saved_questions_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_questions" ADD CONSTRAINT "saved_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_progress" ADD CONSTRAINT "vocabulary_progress_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_progress" ADD CONSTRAINT "vocabulary_progress_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabularies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

