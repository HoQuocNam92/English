-- English A2 is a general proficiency goal, outside the IT certificate catalog.
-- Keep historical attempts: detach their exams and hide those exams from learners.
WITH generic_certificate AS (
  SELECT id FROM certificates WHERE lower(trim(name)) = 'english a2'
)
UPDATE exams
SET certificate_id = NULL, status = 'draft'
WHERE certificate_id IN (SELECT id FROM generic_certificate)
  AND EXISTS (SELECT 1 FROM exam_attempts WHERE exam_attempts.exam_id = exams.id);

WITH generic_certificate AS (
  SELECT id FROM certificates WHERE lower(trim(name)) = 'english a2'
)
DELETE FROM exams
WHERE certificate_id IN (SELECT id FROM generic_certificate)
  AND NOT EXISTS (SELECT 1 FROM exam_attempts WHERE exam_attempts.exam_id = exams.id);

DELETE FROM certificates WHERE lower(trim(name)) = 'english a2';
