-- Interview and writing features have been retired.
-- Drop dependent tables before their parent tables.
DROP TABLE IF EXISTS "mock_interview_turns";
DROP TABLE IF EXISTS "mock_interviews";
DROP TABLE IF EXISTS "writing_submissions";
DROP TABLE IF EXISTS "writing_prompts";
DROP TYPE IF EXISTS "MockInterviewStatus";
