-- =============================================================================
-- TechEnglish Pro — Complete Database Schema (PostgreSQL DDL)
-- Auto-generated & consolidated from Prisma Migrations & Schema Analysis
-- Database System: PostgreSQL 14+ (Compatible with PostgreSQL 13+)
-- Total Tables: 53
-- Total Enums: 16
-- =============================================================================

-- =============================================================================
-- 1. EXTENSIONS & ENUMS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Status
CREATE TYPE "user_status" AS ENUM ('active', 'inactive', 'suspended');

-- Content Lifecycle Status
CREATE TYPE "content_status" AS ENUM ('draft', 'published', 'archived');

-- Lesson Category / Format
CREATE TYPE "lesson_type" AS ENUM (
    'vocabulary',
    'terminology',
    'technical_reading',
    'api_documentation',
    'system_design',
    'case_study'
);

-- Lesson Block / Section Type
CREATE TYPE "lesson_section_type" AS ENUM (
    'heading',
    'rich_text',
    'image',
    'audio',
    'video',
    'code',
    'vocabulary_list',
    'callout',
    'quiz'
);

-- Assessment Question Types
CREATE TYPE "question_type" AS ENUM (
    'single_choice',
    'multiple_choice',
    'true_false',
    'short_answer',
    'scenario'
);

-- Exam Attempt Lifecycle
CREATE TYPE "attempt_status" AS ENUM ('in_progress', 'submitted', 'graded', 'expired');

-- Learning Progress Lifecycle
CREATE TYPE "progress_status" AS ENUM ('not_started', 'in_progress', 'completed');

-- Learning Resource Target
CREATE TYPE "progress_resource_type" AS ENUM ('lesson', 'domain', 'certificate');

-- Study Group Status
CREATE TYPE "learner_group_status" AS ENUM ('active', 'completed', 'archived');

-- AI Recommendation Resource Types
CREATE TYPE "recommendation_resource_type" AS ENUM ('lesson', 'practice', 'exam');

-- User Feedback on AI Recommendations
CREATE TYPE "recommendation_feedback_action" AS ENUM ('helpful', 'not_helpful', 'dismissed', 'opened');

-- English / Technical Proficiency Levels
CREATE TYPE "level_code" AS ENUM ('beginner', 'intermediate', 'advanced', 'professional');

-- Payment Order Status (SePay Gateway)
CREATE TYPE "order_status" AS ENUM ('pending', 'paid', 'failed', 'expired', 'cancelled');

-- PRO Subscription Status
CREATE TYPE "subscription_status" AS ENUM ('active', 'expired', 'cancelled');

-- AI Mock Interview Session Status
CREATE TYPE "MockInterviewStatus" AS ENUM ('in_progress', 'completed', 'abandoned');

-- In-App Notification Types
CREATE TYPE "NotificationType" AS ENUM (
    'system',
    'lesson_complete',
    'streak',
    'flash_sale',
    'achievement',
    'reminder'
);

-- =============================================================================
-- 2. TABLES DEFINITIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 2.1 AUTH & ENTERPRISE RBAC (8 tables)
-- -----------------------------------------------------------------------------

-- Core Authentication Table
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "status" "user_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- User Profiles (Personal & General Information)
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

-- RBAC Roles Master
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

-- RBAC Permissions Master (resource:action)
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

-- N:N Junction: Role ↔ Permission
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id")
);

-- N:N Junction: User ↔ Role (Multi-role support per user)
CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "granted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6),
    "granted_by_id" UUID,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role_id")
);

-- JWT Refresh Tokens
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

-- Password Reset OTP / Tokens
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "otp_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 2.2 TAXONOMY & MASTER DATA (5 tables)
-- -----------------------------------------------------------------------------

-- IT Domains (Cloud, DevOps, Cybersecurity, etc.)
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

-- Learning Proficiency Levels (Beginner to Professional)
CREATE TABLE "levels" (
    "id" UUID NOT NULL,
    "code" "level_code" NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "order" INTEGER NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- Career Goals (Backend, DevOps, Cloud Architect, etc.)
CREATE TABLE "career_goals" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "career_goals_pkey" PRIMARY KEY ("id")
);

-- IT Industry Certifications (AWS-SAA, CKA, etc.)
CREATE TABLE "certificates" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "provider" VARCHAR(100) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "exam_url" VARCHAR(2048),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- N:N Junction: Certificate ↔ Domain
CREATE TABLE "certificate_domains" (
    "certificate_id" UUID NOT NULL,
    "domain_id" UUID NOT NULL,

    CONSTRAINT "certificate_domains_pkey" PRIMARY KEY ("certificate_id", "domain_id")
);

-- -----------------------------------------------------------------------------
-- 2.3 LEARNER PROFILE & STUDY GROUPS (6 tables)
-- -----------------------------------------------------------------------------

-- Learner Academic Profile & Preferences
CREATE TABLE "learner_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "bio" VARCHAR(500),
    "weekly_study_target_minutes" INTEGER NOT NULL DEFAULT 180,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "learner_profiles_pkey" PRIMARY KEY ("id")
);

-- N:N Junction: LearnerProfile ↔ Target Domain
CREATE TABLE "learner_profile_domains" (
    "profile_id" UUID NOT NULL,
    "domain_id" UUID NOT NULL,

    CONSTRAINT "learner_profile_domains_pkey" PRIMARY KEY ("profile_id", "domain_id")
);

-- N:N Junction: LearnerProfile ↔ Career Goal
CREATE TABLE "learner_profile_career_goals" (
    "profile_id" UUID NOT NULL,
    "career_goal_id" UUID NOT NULL,

    CONSTRAINT "learner_profile_career_goals_pkey" PRIMARY KEY ("profile_id", "career_goal_id")
);

-- Learner Target Certification Goals
CREATE TABLE "learner_certificate_goals" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "certificate_id" UUID NOT NULL,
    "target_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learner_certificate_goals_pkey" PRIMARY KEY ("id")
);

-- Classroom / Cohort Study Groups
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

-- N:N Junction: LearnerGroup ↔ Learner Members
CREATE TABLE "learner_group_members" (
    "group_id" UUID NOT NULL,
    "learner_id" UUID NOT NULL,
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learner_group_members_pkey" PRIMARY KEY ("group_id", "learner_id")
);

-- -----------------------------------------------------------------------------
-- 2.4 VOCABULARY & LESSONS (7 tables)
-- -----------------------------------------------------------------------------

-- Specialized Technical Vocabulary Repository
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

-- Real-World Engineering Example Sentences
CREATE TABLE "vocabulary_examples" (
    "id" UUID NOT NULL,
    "vocabulary_id" UUID NOT NULL,
    "sentence_en" VARCHAR(500) NOT NULL,
    "translation_vi" VARCHAR(500),
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "vocabulary_examples_pkey" PRIMARY KEY ("id")
);

-- Technical English Lessons
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
    "is_pro_only" BOOLEAN NOT NULL DEFAULT false,
    "status" "content_status" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMPTZ(6),
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- Structured Lesson Content Blocks (JSONB Body)
CREATE TABLE "lesson_sections" (
    "id" UUID NOT NULL,
    "lesson_id" UUID NOT NULL,
    "type" "lesson_section_type" NOT NULL,
    "order" INTEGER NOT NULL,
    "title" VARCHAR(200),
    "content" JSONB NOT NULL,

    CONSTRAINT "lesson_sections_pkey" PRIMARY KEY ("id")
);

-- N:N Junction: Lesson ↔ Vocabulary
CREATE TABLE "lesson_vocabularies" (
    "lesson_id" UUID NOT NULL,
    "vocabulary_id" UUID NOT NULL,

    CONSTRAINT "lesson_vocabularies_pkey" PRIMARY KEY ("lesson_id", "vocabulary_id")
);

-- N:N Junction: Lesson ↔ Certification Preparation
CREATE TABLE "lesson_certificates" (
    "lesson_id" UUID NOT NULL,
    "certificate_id" UUID NOT NULL,

    CONSTRAINT "lesson_certificates_pkey" PRIMARY KEY ("lesson_id", "certificate_id")
);

-- Certification Exam Specific Guide Content
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

-- -----------------------------------------------------------------------------
-- 2.5 QUESTION BANK, EXAMS & ATTEMPTS (8 tables)
-- -----------------------------------------------------------------------------

-- Question Bank
CREATE TABLE "questions" (
    "id" UUID NOT NULL,
    "type" "question_type" NOT NULL,
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

-- Multiple Choice Question Options
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

-- N:N Junction: Question ↔ Target Certificate
CREATE TABLE "question_certificates" (
    "question_id" UUID NOT NULL,
    "certificate_id" UUID NOT NULL,

    CONSTRAINT "question_certificates_pkey" PRIMARY KEY ("question_id", "certificate_id")
);

-- Exam Master Definition
CREATE TABLE "exams" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(2000) NOT NULL,
    "domain_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "certificate_id" UUID,
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "duration_minutes" INTEGER NOT NULL,
    "passing_score_percent" DOUBLE PRECISION NOT NULL DEFAULT 70.0,
    "max_attempts" INTEGER NOT NULL DEFAULT 1,
    "shuffle_questions" BOOLEAN NOT NULL DEFAULT false,
    "is_pro_only" BOOLEAN NOT NULL DEFAULT false,
    "available_from" TIMESTAMPTZ(6),
    "available_until" TIMESTAMPTZ(6),
    "status" "content_status" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMPTZ(6),
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- N:N Junction: Exam ↔ Question (Order & Weighting)
CREATE TABLE "exam_questions" (
    "exam_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "exam_questions_pkey" PRIMARY KEY ("exam_id", "question_id")
);

-- Student Exam Test Sessions
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

-- Answers Given in Exam Attempt
CREATE TABLE "attempt_answers" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "text_answer" VARCHAR(2000),
    "is_correct" BOOLEAN,
    "earned_points" DOUBLE PRECISION,
    "max_points" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attempt_answers_pkey" PRIMARY KEY ("id")
);

-- Junction: Answer ↔ Selected Option(s)
CREATE TABLE "attempt_answer_options" (
    "answer_id" UUID NOT NULL,
    "option_id" UUID NOT NULL,

    CONSTRAINT "attempt_answer_options_pkey" PRIMARY KEY ("answer_id", "option_id")
);

-- -----------------------------------------------------------------------------
-- 2.6 LEARNING PROGRESS & AI RECOMMENDATIONS (4 tables)
-- -----------------------------------------------------------------------------

-- Granular Learning Progress (per Lesson / Domain / Certificate)
CREATE TABLE "learning_progress" (
    "id" UUID NOT NULL,
    "learner_id" UUID NOT NULL,
    "resource_type" "progress_resource_type" NOT NULL,
    "resource_id" UUID NOT NULL,
    "status" "progress_status" NOT NULL DEFAULT 'not_started',
    "completion_percent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "completed_lesson_count" INTEGER NOT NULL DEFAULT 0,
    "total_lesson_count" INTEGER NOT NULL DEFAULT 0,
    "average_score_percent" DOUBLE PRECISION,
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "learning_progress_pkey" PRIMARY KEY ("id")
);

-- Precalculated User Progress Summary (Cache / Snapshot)
CREATE TABLE "progress_summary_cache" (
    "learner_id" UUID NOT NULL,
    "overall_completion_percent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "study_streak_days" INTEGER NOT NULL DEFAULT 0,
    "total_study_minutes" INTEGER NOT NULL DEFAULT 0,
    "completed_lessons" INTEGER NOT NULL DEFAULT 0,
    "total_attempts" INTEGER NOT NULL DEFAULT 0,
    "average_score_percent" DOUBLE PRECISION,
    "weak_topics" JSONB NOT NULL DEFAULT '[]',
    "calculated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_summary_cache_pkey" PRIMARY KEY ("learner_id")
);

-- AI Recommended Learning Items
CREATE TABLE "recommendations" (
    "id" UUID NOT NULL,
    "learner_id" UUID NOT NULL,
    "resource_type" "recommendation_resource_type" NOT NULL,
    "resource_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "reason" VARCHAR(1000) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "based_on" JSONB NOT NULL DEFAULT '[]',
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- Learner Feedback on AI Recommendations
CREATE TABLE "recommendation_feedbacks" (
    "id" UUID NOT NULL,
    "recommendation_id" UUID NOT NULL,
    "learner_id" UUID NOT NULL,
    "action" "recommendation_feedback_action" NOT NULL,
    "comment" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_feedbacks_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 2.7 PAYMENT, PRO SUBSCRIPTION & PROMOTIONS (5 tables)
-- -----------------------------------------------------------------------------

-- Payment Orders via SePay / Bank Transfer
CREATE TABLE "payment_orders" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "plan_id" VARCHAR(50) NOT NULL,
    "amount" INTEGER NOT NULL,
    "original_amount" INTEGER,
    "discount_amount" INTEGER DEFAULT 0,
    "voucher_id" UUID,
    "voucher_code" VARCHAR(50),
    "idempotency_key" VARCHAR(128) NOT NULL,
    "status" "order_status" NOT NULL DEFAULT 'pending',
    "sepay_transaction_id" VARCHAR(100),
    "webhook_payload" JSONB,
    "webhook_received_at" TIMESTAMPTZ(6),
    "paid_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payment_orders_pkey" PRIMARY KEY ("id")
);

-- Active User Subscriptions (1:1 with User)
CREATE TABLE "user_subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "plan_id" VARCHAR(50) NOT NULL,
    "order_id" UUID NOT NULL,
    "status" "subscription_status" NOT NULL DEFAULT 'active',
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- Early-bird & Plan Seat Slot Quotas
CREATE TABLE "plan_quotas" (
    "plan_id" VARCHAR(50) NOT NULL,
    "max_slots" INTEGER,
    "sold_slots" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "plan_quotas_pkey" PRIMARY KEY ("plan_id")
);

-- Discount Vouchers / Coupons
CREATE TABLE "vouchers" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "discount_type" VARCHAR(20) NOT NULL DEFAULT 'percentage',
    "discount_value" INTEGER NOT NULL,
    "min_order_amount" INTEGER NOT NULL DEFAULT 0,
    "max_discount_amount" INTEGER,
    "usage_limit" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- Flash Sale Promotional Campaigns
CREATE TABLE "flash_sales" (
    "id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500),
    "plan_id" VARCHAR(50) NOT NULL,
    "discount_percent" INTEGER NOT NULL,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "flash_sales_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 2.8 GAMIFICATION & EXP LEADERBOARD (2 tables)
-- -----------------------------------------------------------------------------

-- Daily Learning Streak & EXP Points
CREATE TABLE "user_streaks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "max_streak" INTEGER NOT NULL DEFAULT 0,
    "last_study_date" DATE,
    "total_exp_points" INTEGER NOT NULL DEFAULT 0,
    "weekly_points" INTEGER NOT NULL DEFAULT 0,
    "monthly_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_streaks_pkey" PRIMARY KEY ("id")
);

-- Unlocked Achievement Badges
CREATE TABLE "user_badges" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "badge_code" VARCHAR(50) NOT NULL,
    "badge_name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(300),
    "icon_url" VARCHAR(500),
    "unlocked_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 2.9 AI INTERACTIVE FEATURES (MOCK INTERVIEW & WRITING) (3 tables)
-- -----------------------------------------------------------------------------

-- AI Mock Interview Sessions
CREATE TABLE "mock_interviews" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "topic" VARCHAR(200) NOT NULL,
    "difficulty" VARCHAR(50) NOT NULL DEFAULT 'intermediate',
    "status" "MockInterviewStatus" NOT NULL DEFAULT 'in_progress',
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "mock_interviews_pkey" PRIMARY KEY ("id")
);

-- Individual Conversation Turns in Mock Interview
CREATE TABLE "mock_interview_turns" (
    "id" UUID NOT NULL,
    "interview_id" UUID NOT NULL,
    "turn_index" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "user_answer" TEXT,
    "ai_feedback" TEXT,
    "score" DOUBLE PRECISION,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mock_interview_turns_pkey" PRIMARY KEY ("id")
);

-- AI Writing Practice & Evaluation
CREATE TABLE "writing_submissions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "prompt" TEXT NOT NULL,
    "topic" VARCHAR(200) NOT NULL,
    "user_text" TEXT NOT NULL,
    "ai_feedback" TEXT,
    "grammar_score" DOUBLE PRECISION,
    "clarity_score" DOUBLE PRECISION,
    "vocab_score" DOUBLE PRECISION,
    "overall_score" DOUBLE PRECISION,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "writing_submissions_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 2.10 COMMUNITY DISCUSSION & FORUM (3 tables)
-- -----------------------------------------------------------------------------

-- Community Forum Posts
CREATE TABLE "discussion_posts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "discussion_posts_pkey" PRIMARY KEY ("id")
);

-- Comments on Discussion Posts
CREATE TABLE "discussion_comments" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discussion_comments_pkey" PRIMARY KEY ("id")
);

-- Upvotes / Downvotes on Discussion Posts
CREATE TABLE "discussion_votes" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "discussion_votes_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 2.11 NOTIFICATIONS & STUDY PLANNER (2 tables)
-- -----------------------------------------------------------------------------

-- User Notifications
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "type" "NotificationType" NOT NULL DEFAULT 'system',
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "action_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- Personal Study Calendar & Scheduled Plan Items
CREATE TABLE "learning_plan_items" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "lesson_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "note" TEXT,
    "planned_at" TIMESTAMPTZ(6) NOT NULL,
    "duration_min" INTEGER NOT NULL DEFAULT 30,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_plan_items_pkey" PRIMARY KEY ("id")
);

-- =============================================================================
-- 3. UNIQUE CONSTRAINTS & INDEXES
-- =============================================================================

-- users
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_status_idx" ON "users"("status");

-- user_details
CREATE UNIQUE INDEX "user_details_user_id_key" ON "user_details"("user_id");

-- roles
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");
CREATE INDEX "roles_code_idx" ON "roles"("code");

-- permissions
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");
CREATE INDEX "permissions_resource_idx" ON "permissions"("resource");
CREATE INDEX "permissions_resource_action_idx" ON "permissions"("resource", "action");

-- user_roles
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- refresh_tokens
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- password_reset_tokens
CREATE INDEX "password_reset_tokens_email_idx" ON "password_reset_tokens"("email");

-- domains
CREATE UNIQUE INDEX "domains_code_key" ON "domains"("code");
CREATE INDEX "domains_code_idx" ON "domains"("code");
CREATE INDEX "domains_is_active_idx" ON "domains"("is_active");

-- levels
CREATE UNIQUE INDEX "levels_code_key" ON "levels"("code");

-- career_goals
CREATE UNIQUE INDEX "career_goals_code_key" ON "career_goals"("code");
CREATE INDEX "career_goals_code_idx" ON "career_goals"("code");

-- certificates
CREATE UNIQUE INDEX "certificates_code_key" ON "certificates"("code");
CREATE INDEX "certificates_code_idx" ON "certificates"("code");

-- learner_profiles
CREATE UNIQUE INDEX "learner_profiles_user_id_key" ON "learner_profiles"("user_id");
CREATE INDEX "learner_profiles_level_id_idx" ON "learner_profiles"("level_id");

-- learner_certificate_goals
CREATE UNIQUE INDEX "learner_certificate_goals_profile_id_certificate_id_key" ON "learner_certificate_goals"("profile_id", "certificate_id");

-- learner_groups
CREATE INDEX "learner_groups_teacher_id_idx" ON "learner_groups"("teacher_id");
CREATE INDEX "learner_groups_domain_id_idx" ON "learner_groups"("domain_id");
CREATE INDEX "learner_groups_certificate_id_idx" ON "learner_groups"("certificate_id");
CREATE INDEX "learner_groups_status_idx" ON "learner_groups"("status");

-- vocabularies
CREATE UNIQUE INDEX "vocabularies_term_domain_id_key" ON "vocabularies"("term", "domain_id");
CREATE INDEX "vocabularies_domain_id_idx" ON "vocabularies"("domain_id");
CREATE INDEX "vocabularies_level_id_idx" ON "vocabularies"("level_id");
CREATE INDEX "vocabularies_status_idx" ON "vocabularies"("status");

-- vocabulary_examples
CREATE INDEX "vocabulary_examples_vocabulary_id_idx" ON "vocabulary_examples"("vocabulary_id");

-- lessons
CREATE UNIQUE INDEX "lessons_slug_key" ON "lessons"("slug");
CREATE INDEX "lessons_domain_id_idx" ON "lessons"("domain_id");
CREATE INDEX "lessons_level_id_idx" ON "lessons"("level_id");
CREATE INDEX "lessons_status_idx" ON "lessons"("status");
CREATE INDEX "lessons_slug_idx" ON "lessons"("slug");
CREATE INDEX "lessons_type_idx" ON "lessons"("type");

-- lesson_sections
CREATE INDEX "lesson_sections_lesson_id_idx" ON "lesson_sections"("lesson_id");

-- certification_contents
CREATE INDEX "certification_contents_certificate_id_idx" ON "certification_contents"("certificate_id");

-- questions
CREATE INDEX "questions_domain_id_idx" ON "questions"("domain_id");
CREATE INDEX "questions_level_id_idx" ON "questions"("level_id");
CREATE INDEX "questions_type_idx" ON "questions"("type");
CREATE INDEX "questions_status_idx" ON "questions"("status");

-- question_options
CREATE INDEX "question_options_question_id_idx" ON "question_options"("question_id");

-- exams
CREATE INDEX "exams_domain_id_idx" ON "exams"("domain_id");
CREATE INDEX "exams_level_id_idx" ON "exams"("level_id");
CREATE INDEX "exams_certificate_id_idx" ON "exams"("certificate_id");
CREATE INDEX "exams_status_idx" ON "exams"("status");

-- exam_questions
CREATE INDEX "exam_questions_exam_id_idx" ON "exam_questions"("exam_id");

-- exam_attempts
CREATE INDEX "exam_attempts_exam_id_idx" ON "exam_attempts"("exam_id");
CREATE INDEX "exam_attempts_learner_id_idx" ON "exam_attempts"("learner_id");
CREATE INDEX "exam_attempts_status_idx" ON "exam_attempts"("status");
CREATE INDEX "exam_attempts_learner_id_exam_id_idx" ON "exam_attempts"("learner_id", "exam_id");

-- attempt_answers
CREATE UNIQUE INDEX "attempt_answers_attempt_id_question_id_key" ON "attempt_answers"("attempt_id", "question_id");
CREATE INDEX "attempt_answers_attempt_id_idx" ON "attempt_answers"("attempt_id");

-- learning_progress
CREATE UNIQUE INDEX "learning_progress_learner_id_resource_type_resource_id_key" ON "learning_progress"("learner_id", "resource_type", "resource_id");
CREATE INDEX "learning_progress_learner_id_idx" ON "learning_progress"("learner_id");
CREATE INDEX "learning_progress_resource_type_resource_id_idx" ON "learning_progress"("resource_type", "resource_id");

-- recommendations
CREATE INDEX "recommendations_learner_id_idx" ON "recommendations"("learner_id");
CREATE INDEX "recommendations_learner_id_resource_type_idx" ON "recommendations"("learner_id", "resource_type");
CREATE INDEX "recommendations_generated_at_idx" ON "recommendations"("generated_at");

-- recommendation_feedbacks
CREATE INDEX "recommendation_feedbacks_recommendation_id_idx" ON "recommendation_feedbacks"("recommendation_id");
CREATE INDEX "recommendation_feedbacks_learner_id_idx" ON "recommendation_feedbacks"("learner_id");

-- payment_orders
CREATE UNIQUE INDEX "payment_orders_idempotency_key_key" ON "payment_orders"("idempotency_key");
CREATE UNIQUE INDEX "payment_orders_sepay_transaction_id_key" ON "payment_orders"("sepay_transaction_id");
CREATE INDEX "payment_orders_user_id_idx" ON "payment_orders"("user_id");
CREATE INDEX "payment_orders_status_idx" ON "payment_orders"("status");
CREATE INDEX "payment_orders_sepay_transaction_id_idx" ON "payment_orders"("sepay_transaction_id");

-- user_subscriptions
CREATE UNIQUE INDEX "user_subscriptions_user_id_key" ON "user_subscriptions"("user_id");
CREATE UNIQUE INDEX "user_subscriptions_order_id_key" ON "user_subscriptions"("order_id");
CREATE INDEX "user_subscriptions_status_idx" ON "user_subscriptions"("status");
CREATE INDEX "user_subscriptions_expires_at_idx" ON "user_subscriptions"("expires_at");

-- vouchers
CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers"("code");
CREATE INDEX "vouchers_code_idx" ON "vouchers"("code");
CREATE INDEX "vouchers_is_active_idx" ON "vouchers"("is_active");

-- flash_sales
CREATE INDEX "flash_sales_plan_id_idx" ON "flash_sales"("plan_id");
CREATE INDEX "flash_sales_is_active_idx" ON "flash_sales"("is_active");

-- user_streaks
CREATE UNIQUE INDEX "user_streaks_user_id_key" ON "user_streaks"("user_id");
CREATE INDEX "user_streaks_total_exp_points_idx" ON "user_streaks"("total_exp_points");
CREATE INDEX "user_streaks_weekly_points_idx" ON "user_streaks"("weekly_points");

-- user_badges
CREATE UNIQUE INDEX "user_badges_user_id_badge_code_key" ON "user_badges"("user_id", "badge_code");
CREATE INDEX "user_badges_user_id_idx" ON "user_badges"("user_id");

-- mock_interviews
CREATE INDEX "mock_interviews_user_id_idx" ON "mock_interviews"("user_id");

-- mock_interview_turns
CREATE INDEX "mock_interview_turns_interview_id_idx" ON "mock_interview_turns"("interview_id");

-- writing_submissions
CREATE INDEX "writing_submissions_user_id_idx" ON "writing_submissions"("user_id");

-- discussion_posts
CREATE INDEX "discussion_posts_user_id_idx" ON "discussion_posts"("user_id");
CREATE INDEX "discussion_posts_created_at_idx" ON "discussion_posts"("created_at");

-- discussion_comments
CREATE INDEX "discussion_comments_post_id_idx" ON "discussion_comments"("post_id");

-- discussion_votes
CREATE UNIQUE INDEX "discussion_votes_post_id_user_id_key" ON "discussion_votes"("post_id", "user_id");

-- notifications
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- learning_plan_items
CREATE INDEX "learning_plan_items_user_id_idx" ON "learning_plan_items"("user_id");
CREATE INDEX "learning_plan_items_planned_at_idx" ON "learning_plan_items"("planned_at");

-- =============================================================================
-- 4. FOREIGN KEY CONSTRAINTS
-- =============================================================================

-- user_details ↔ users
ALTER TABLE "user_details"
    ADD CONSTRAINT "user_details_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- role_permissions ↔ roles & permissions
ALTER TABLE "role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_fkey"
    FOREIGN KEY ("role_id") REFERENCES "roles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_fkey"
    FOREIGN KEY ("permission_id") REFERENCES "permissions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- user_roles ↔ users, roles & granter (users)
ALTER TABLE "user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_roles"
    ADD CONSTRAINT "user_roles_role_id_fkey"
    FOREIGN KEY ("role_id") REFERENCES "roles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_roles"
    ADD CONSTRAINT "user_roles_granted_by_id_fkey"
    FOREIGN KEY ("granted_by_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- refresh_tokens ↔ users
ALTER TABLE "refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- certificate_domains ↔ certificates & domains
ALTER TABLE "certificate_domains"
    ADD CONSTRAINT "certificate_domains_certificate_id_fkey"
    FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "certificate_domains"
    ADD CONSTRAINT "certificate_domains_domain_id_fkey"
    FOREIGN KEY ("domain_id") REFERENCES "domains"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- learner_profiles ↔ users & levels
ALTER TABLE "learner_profiles"
    ADD CONSTRAINT "learner_profiles_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "learner_profiles"
    ADD CONSTRAINT "learner_profiles_level_id_fkey"
    FOREIGN KEY ("level_id") REFERENCES "levels"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- learner_profile_domains ↔ learner_profiles & domains
ALTER TABLE "learner_profile_domains"
    ADD CONSTRAINT "learner_profile_domains_profile_id_fkey"
    FOREIGN KEY ("profile_id") REFERENCES "learner_profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "learner_profile_domains"
    ADD CONSTRAINT "learner_profile_domains_domain_id_fkey"
    FOREIGN KEY ("domain_id") REFERENCES "domains"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- learner_profile_career_goals ↔ learner_profiles & career_goals
ALTER TABLE "learner_profile_career_goals"
    ADD CONSTRAINT "learner_profile_career_goals_profile_id_fkey"
    FOREIGN KEY ("profile_id") REFERENCES "learner_profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "learner_profile_career_goals"
    ADD CONSTRAINT "learner_profile_career_goals_career_goal_id_fkey"
    FOREIGN KEY ("career_goal_id") REFERENCES "career_goals"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- learner_certificate_goals ↔ learner_profiles & certificates
ALTER TABLE "learner_certificate_goals"
    ADD CONSTRAINT "learner_certificate_goals_profile_id_fkey"
    FOREIGN KEY ("profile_id") REFERENCES "learner_profiles"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "learner_certificate_goals"
    ADD CONSTRAINT "learner_certificate_goals_certificate_id_fkey"
    FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- learner_groups ↔ users (teacher), domains & certificates
ALTER TABLE "learner_groups"
    ADD CONSTRAINT "learner_groups_teacher_id_fkey"
    FOREIGN KEY ("teacher_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "learner_groups"
    ADD CONSTRAINT "learner_groups_domain_id_fkey"
    FOREIGN KEY ("domain_id") REFERENCES "domains"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "learner_groups"
    ADD CONSTRAINT "learner_groups_certificate_id_fkey"
    FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- learner_group_members ↔ learner_groups & users (learner)
ALTER TABLE "learner_group_members"
    ADD CONSTRAINT "learner_group_members_group_id_fkey"
    FOREIGN KEY ("group_id") REFERENCES "learner_groups"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "learner_group_members"
    ADD CONSTRAINT "learner_group_members_learner_id_fkey"
    FOREIGN KEY ("learner_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- vocabularies ↔ domains & levels
ALTER TABLE "vocabularies"
    ADD CONSTRAINT "vocabularies_domain_id_fkey"
    FOREIGN KEY ("domain_id") REFERENCES "domains"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "vocabularies"
    ADD CONSTRAINT "vocabularies_level_id_fkey"
    FOREIGN KEY ("level_id") REFERENCES "levels"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- vocabulary_examples ↔ vocabularies
ALTER TABLE "vocabulary_examples"
    ADD CONSTRAINT "vocabulary_examples_vocabulary_id_fkey"
    FOREIGN KEY ("vocabulary_id") REFERENCES "vocabularies"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- lessons ↔ domains, levels & users (author)
ALTER TABLE "lessons"
    ADD CONSTRAINT "lessons_domain_id_fkey"
    FOREIGN KEY ("domain_id") REFERENCES "domains"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "lessons"
    ADD CONSTRAINT "lessons_level_id_fkey"
    FOREIGN KEY ("level_id") REFERENCES "levels"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "lessons"
    ADD CONSTRAINT "lessons_created_by_id_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- lesson_sections ↔ lessons
ALTER TABLE "lesson_sections"
    ADD CONSTRAINT "lesson_sections_lesson_id_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- lesson_vocabularies ↔ lessons & vocabularies
ALTER TABLE "lesson_vocabularies"
    ADD CONSTRAINT "lesson_vocabularies_lesson_id_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lesson_vocabularies"
    ADD CONSTRAINT "lesson_vocabularies_vocabulary_id_fkey"
    FOREIGN KEY ("vocabulary_id") REFERENCES "vocabularies"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- lesson_certificates ↔ lessons & certificates
ALTER TABLE "lesson_certificates"
    ADD CONSTRAINT "lesson_certificates_lesson_id_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lesson_certificates"
    ADD CONSTRAINT "lesson_certificates_certificate_id_fkey"
    FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- certification_contents ↔ certificates
ALTER TABLE "certification_contents"
    ADD CONSTRAINT "certification_contents_certificate_id_fkey"
    FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- questions ↔ domains & levels
ALTER TABLE "questions"
    ADD CONSTRAINT "questions_domain_id_fkey"
    FOREIGN KEY ("domain_id") REFERENCES "domains"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "questions"
    ADD CONSTRAINT "questions_level_id_fkey"
    FOREIGN KEY ("level_id") REFERENCES "levels"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- question_options ↔ questions
ALTER TABLE "question_options"
    ADD CONSTRAINT "question_options_question_id_fkey"
    FOREIGN KEY ("question_id") REFERENCES "questions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- question_certificates ↔ questions & certificates
ALTER TABLE "question_certificates"
    ADD CONSTRAINT "question_certificates_question_id_fkey"
    FOREIGN KEY ("question_id") REFERENCES "questions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "question_certificates"
    ADD CONSTRAINT "question_certificates_certificate_id_fkey"
    FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- exams ↔ domains, levels, certificates & users (creator)
ALTER TABLE "exams"
    ADD CONSTRAINT "exams_domain_id_fkey"
    FOREIGN KEY ("domain_id") REFERENCES "domains"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "exams"
    ADD CONSTRAINT "exams_level_id_fkey"
    FOREIGN KEY ("level_id") REFERENCES "levels"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "exams"
    ADD CONSTRAINT "exams_certificate_id_fkey"
    FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "exams"
    ADD CONSTRAINT "exams_created_by_id_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- exam_questions ↔ exams & questions
ALTER TABLE "exam_questions"
    ADD CONSTRAINT "exam_questions_exam_id_fkey"
    FOREIGN KEY ("exam_id") REFERENCES "exams"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "exam_questions"
    ADD CONSTRAINT "exam_questions_question_id_fkey"
    FOREIGN KEY ("question_id") REFERENCES "questions"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- exam_attempts ↔ exams & users (learner)
ALTER TABLE "exam_attempts"
    ADD CONSTRAINT "exam_attempts_exam_id_fkey"
    FOREIGN KEY ("exam_id") REFERENCES "exams"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "exam_attempts"
    ADD CONSTRAINT "exam_attempts_learner_id_fkey"
    FOREIGN KEY ("learner_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- attempt_answers ↔ exam_attempts
ALTER TABLE "attempt_answers"
    ADD CONSTRAINT "attempt_answers_attempt_id_fkey"
    FOREIGN KEY ("attempt_id") REFERENCES "exam_attempts"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- attempt_answer_options ↔ attempt_answers & question_options
ALTER TABLE "attempt_answer_options"
    ADD CONSTRAINT "attempt_answer_options_answer_id_fkey"
    FOREIGN KEY ("answer_id") REFERENCES "attempt_answers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "attempt_answer_options"
    ADD CONSTRAINT "attempt_answer_options_option_id_fkey"
    FOREIGN KEY ("option_id") REFERENCES "question_options"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- learning_progress ↔ users (learner)
ALTER TABLE "learning_progress"
    ADD CONSTRAINT "learning_progress_learner_id_fkey"
    FOREIGN KEY ("learner_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- recommendations ↔ users (learner)
ALTER TABLE "recommendations"
    ADD CONSTRAINT "recommendations_learner_id_fkey"
    FOREIGN KEY ("learner_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- recommendation_feedbacks ↔ recommendations & users (learner)
ALTER TABLE "recommendation_feedbacks"
    ADD CONSTRAINT "recommendation_feedbacks_recommendation_id_fkey"
    FOREIGN KEY ("recommendation_id") REFERENCES "recommendations"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recommendation_feedbacks"
    ADD CONSTRAINT "recommendation_feedbacks_learner_id_fkey"
    FOREIGN KEY ("learner_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- payment_orders ↔ users & vouchers
ALTER TABLE "payment_orders"
    ADD CONSTRAINT "payment_orders_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payment_orders"
    ADD CONSTRAINT "payment_orders_voucher_id_fkey"
    FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- user_subscriptions ↔ users & payment_orders
ALTER TABLE "user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_order_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "payment_orders"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- user_streaks ↔ users
ALTER TABLE "user_streaks"
    ADD CONSTRAINT "user_streaks_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- user_badges ↔ users
ALTER TABLE "user_badges"
    ADD CONSTRAINT "user_badges_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- mock_interviews ↔ users
ALTER TABLE "mock_interviews"
    ADD CONSTRAINT "mock_interviews_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- mock_interview_turns ↔ mock_interviews
ALTER TABLE "mock_interview_turns"
    ADD CONSTRAINT "mock_interview_turns_interview_id_fkey"
    FOREIGN KEY ("interview_id") REFERENCES "mock_interviews"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- writing_submissions ↔ users
ALTER TABLE "writing_submissions"
    ADD CONSTRAINT "writing_submissions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- discussion_posts ↔ users
ALTER TABLE "discussion_posts"
    ADD CONSTRAINT "discussion_posts_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- discussion_comments ↔ discussion_posts & users
ALTER TABLE "discussion_comments"
    ADD CONSTRAINT "discussion_comments_post_id_fkey"
    FOREIGN KEY ("post_id") REFERENCES "discussion_posts"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "discussion_comments"
    ADD CONSTRAINT "discussion_comments_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- discussion_votes ↔ discussion_posts & users
ALTER TABLE "discussion_votes"
    ADD CONSTRAINT "discussion_votes_post_id_fkey"
    FOREIGN KEY ("post_id") REFERENCES "discussion_posts"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "discussion_votes"
    ADD CONSTRAINT "discussion_votes_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- notifications ↔ users
ALTER TABLE "notifications"
    ADD CONSTRAINT "notifications_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- learning_plan_items ↔ users & lessons
ALTER TABLE "learning_plan_items"
    ADD CONSTRAINT "learning_plan_items_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "learning_plan_items"
    ADD CONSTRAINT "learning_plan_items_lesson_id_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
