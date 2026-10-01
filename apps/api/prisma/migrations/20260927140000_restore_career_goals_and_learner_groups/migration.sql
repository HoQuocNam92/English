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
CREATE UNIQUE INDEX "career_goals_code_key" ON "career_goals"("code");
CREATE INDEX "career_goals_is_active_idx" ON "career_goals"("is_active");

CREATE TABLE "learner_profile_career_goals" (
  "profile_id" UUID NOT NULL,
  "career_goal_id" UUID NOT NULL,
  CONSTRAINT "learner_profile_career_goals_pkey" PRIMARY KEY ("profile_id", "career_goal_id")
);
CREATE INDEX "learner_profile_career_goals_career_goal_id_idx" ON "learner_profile_career_goals"("career_goal_id");

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
CREATE INDEX "learner_groups_owner_id_idx" ON "learner_groups"("owner_id");
CREATE INDEX "learner_groups_career_goal_id_idx" ON "learner_groups"("career_goal_id");

CREATE TABLE "learner_group_members" (
  "group_id" UUID NOT NULL,
  "learner_id" UUID NOT NULL,
  "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "learner_group_members_pkey" PRIMARY KEY ("group_id", "learner_id")
);
CREATE INDEX "learner_group_members_learner_id_idx" ON "learner_group_members"("learner_id");

ALTER TABLE "learner_profile_career_goals" ADD CONSTRAINT "learner_profile_career_goals_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "learner_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learner_profile_career_goals" ADD CONSTRAINT "learner_profile_career_goals_career_goal_id_fkey" FOREIGN KEY ("career_goal_id") REFERENCES "career_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learner_groups" ADD CONSTRAINT "learner_groups_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "learner_groups" ADD CONSTRAINT "learner_groups_career_goal_id_fkey" FOREIGN KEY ("career_goal_id") REFERENCES "career_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "learner_group_members" ADD CONSTRAINT "learner_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "learner_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learner_group_members" ADD CONSTRAINT "learner_group_members_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "career_goals" ("id", "code", "name", "description", "updated_at") VALUES
('31000000-0000-4000-8000-000000000001', 'CLOUD_ENGINEER', 'Cloud Engineer', 'Vận hành và xây dựng hạ tầng điện toán đám mây.', CURRENT_TIMESTAMP),
('31000000-0000-4000-8000-000000000002', 'SECURITY_ENGINEER', 'Security Engineer', 'Bảo mật hệ thống, ứng dụng và dữ liệu.', CURRENT_TIMESTAMP),
('31000000-0000-4000-8000-000000000003', 'NETWORK_ENGINEER', 'Network Engineer', 'Thiết kế, triển khai và vận hành hệ thống mạng.', CURRENT_TIMESTAMP),
('31000000-0000-4000-8000-000000000004', 'DATA_ENGINEER', 'Data Engineer', 'Xây dựng nền tảng và pipeline dữ liệu.', CURRENT_TIMESTAMP),
('31000000-0000-4000-8000-000000000005', 'BUSINESS_ANALYST', 'Business Analyst', 'Phân tích nghiệp vụ và kết nối nhu cầu với giải pháp công nghệ.', CURRENT_TIMESTAMP),
('31000000-0000-4000-8000-000000000006', 'SOFTWARE_ENGINEER', 'Software Engineer', 'Thiết kế và phát triển phần mềm.', CURRENT_TIMESTAMP),
('31000000-0000-4000-8000-000000000007', 'DEVOPS_ENGINEER', 'DevOps Engineer', 'Tự động hóa quy trình phát triển và vận hành.', CURRENT_TIMESTAMP);
