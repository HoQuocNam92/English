CREATE TABLE IF NOT EXISTS "legacy_exam_archives" (
  "exam_id" UUID PRIMARY KEY,
  "archived_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "payload" JSONB NOT NULL
);

INSERT INTO "legacy_exam_archives" ("exam_id", "payload")
SELECT
  exam."id",
  jsonb_build_object(
    'exam', to_jsonb(exam),
    'examQuestions', COALESCE((
      SELECT jsonb_agg(to_jsonb(eq))
      FROM "exam_questions" eq
      WHERE eq."exam_id" = exam."id"
    ), '[]'::jsonb),
    'attempts', COALESCE((
      SELECT jsonb_agg(
        to_jsonb(attempt) || jsonb_build_object(
          'answers', COALESCE((
            SELECT jsonb_agg(to_jsonb(answer))
            FROM "attempt_answers" answer
            WHERE answer."attempt_id" = attempt."id"
          ), '[]'::jsonb)
        )
      )
      FROM "exam_attempts" attempt
      WHERE attempt."exam_id" = exam."id"
    ), '[]'::jsonb)
  )
FROM "exams" exam
WHERE exam."certificate_id" IS NULL
ON CONFLICT ("exam_id") DO NOTHING;

DELETE FROM "attempt_answers"
WHERE "attempt_id" IN (
  SELECT attempt."id"
  FROM "exam_attempts" attempt
  JOIN "exams" exam ON exam."id" = attempt."exam_id"
  WHERE exam."certificate_id" IS NULL
);

DELETE FROM "exam_attempts"
WHERE "exam_id" IN (SELECT "id" FROM "exams" WHERE "certificate_id" IS NULL);

DELETE FROM "exam_questions"
WHERE "exam_id" IN (SELECT "id" FROM "exams" WHERE "certificate_id" IS NULL);

DELETE FROM "exams" WHERE "certificate_id" IS NULL;
