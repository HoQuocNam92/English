ALTER TABLE "learner_profiles"
  ADD COLUMN "daily_vocabulary_target" INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN "weekly_exam_target" INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN "daily_study_target_minutes" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN "reminder_time" VARCHAR(5),
  ADD COLUMN "reminder_enabled" BOOLEAN NOT NULL DEFAULT false;
