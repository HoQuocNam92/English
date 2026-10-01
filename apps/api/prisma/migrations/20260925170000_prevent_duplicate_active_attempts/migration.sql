-- Keep the newest active attempt and expire older duplicates created by
-- concurrent start requests.
WITH ranked_attempts AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY exam_id, learner_id
      ORDER BY started_at DESC, id DESC
    ) AS position
  FROM exam_attempts
  WHERE status = 'in_progress'
)
UPDATE exam_attempts
SET status = 'expired', updated_at = CURRENT_TIMESTAMP
WHERE id IN (SELECT id FROM ranked_attempts WHERE position > 1);

CREATE UNIQUE INDEX exam_attempts_one_active_per_learner
ON exam_attempts (exam_id, learner_id)
WHERE status = 'in_progress';
