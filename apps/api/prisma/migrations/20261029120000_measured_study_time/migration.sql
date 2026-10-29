CREATE TABLE "study_time_sessions" (
 "id" TEXT PRIMARY KEY,
 "learner_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
 "seconds" INTEGER NOT NULL DEFAULT 0,
 "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "study_time_sessions_learner_id_started_at_idx" ON "study_time_sessions"("learner_id", "started_at");
