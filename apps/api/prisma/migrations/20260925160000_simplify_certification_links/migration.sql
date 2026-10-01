-- Preserve legacy certificate content by routing any unassigned items through
-- a generated Topic before removing the old direct Certificate links.

WITH legacy_pairs AS (
  SELECT lc.certificate_id, l.domain_id
  FROM lesson_certificates lc
  JOIN lessons l ON l.id = lc.lesson_id
  UNION
  SELECT qc.certificate_id, q.domain_id
  FROM question_certificates qc
  JOIN questions q ON q.id = qc.question_id
), missing_pairs AS (
  SELECT lp.*,
    ROW_NUMBER() OVER (PARTITION BY lp.certificate_id ORDER BY lp.domain_id) AS position
  FROM legacy_pairs lp
  WHERE NOT EXISTS (
    SELECT 1 FROM certificate_domains cd
    WHERE cd.certificate_id = lp.certificate_id AND cd.domain_id = lp.domain_id
  )
)
INSERT INTO certificate_domains (certificate_id, domain_id, "order", weight_percent)
SELECT mp.certificate_id, mp.domain_id,
  COALESCE((SELECT MAX(cd."order") FROM certificate_domains cd WHERE cd.certificate_id = mp.certificate_id), 0) + mp.position,
  0
FROM missing_pairs mp
ON CONFLICT (certificate_id, domain_id) DO NOTHING;

WITH unassigned_pairs AS (
  SELECT DISTINCT lc.certificate_id, l.domain_id
  FROM lesson_certificates lc
  JOIN lessons l ON l.id = lc.lesson_id
  WHERE NOT EXISTS (
    SELECT 1
    FROM certification_topic_lessons ctl
    JOIN certification_topics ct ON ct.id = ctl.topic_id
    WHERE ct.certificate_id = lc.certificate_id AND ctl.lesson_id = lc.lesson_id
  )
  UNION
  SELECT DISTINCT qc.certificate_id, q.domain_id
  FROM question_certificates qc
  JOIN questions q ON q.id = qc.question_id
  WHERE NOT EXISTS (
    SELECT 1
    FROM certification_topic_questions ctq
    JOIN certification_topics ct ON ct.id = ctq.topic_id
    WHERE ct.certificate_id = qc.certificate_id AND ctq.question_id = qc.question_id
  )
)
INSERT INTO certification_topics (id, certificate_id, domain_id, code, name, description, "order")
SELECT gen_random_uuid(), up.certificate_id, up.domain_id,
  'LEGACY-' || SUBSTRING(REPLACE(up.domain_id::text, '-', '') FROM 1 FOR 8),
  'Imported content',
  'Nội dung được chuyển tự động từ cấu trúc chứng chỉ cũ.',
  COALESCE((SELECT MAX(ct."order") FROM certification_topics ct WHERE ct.certificate_id = up.certificate_id AND ct.domain_id = up.domain_id), 0) + 1
FROM unassigned_pairs up
ON CONFLICT (certificate_id, code) DO NOTHING;

INSERT INTO certification_topic_lessons (topic_id, lesson_id)
SELECT ct.id, lc.lesson_id
FROM lesson_certificates lc
JOIN lessons l ON l.id = lc.lesson_id
JOIN certification_topics ct
  ON ct.certificate_id = lc.certificate_id
  AND ct.domain_id = l.domain_id
  AND ct.code = 'LEGACY-' || SUBSTRING(REPLACE(l.domain_id::text, '-', '') FROM 1 FOR 8)
WHERE NOT EXISTS (
  SELECT 1
  FROM certification_topic_lessons existing
  JOIN certification_topics existing_topic ON existing_topic.id = existing.topic_id
  WHERE existing_topic.certificate_id = lc.certificate_id AND existing.lesson_id = lc.lesson_id
)
ON CONFLICT (topic_id, lesson_id) DO NOTHING;

INSERT INTO certification_topic_questions (topic_id, question_id)
SELECT ct.id, qc.question_id
FROM question_certificates qc
JOIN questions q ON q.id = qc.question_id
JOIN certification_topics ct
  ON ct.certificate_id = qc.certificate_id
  AND ct.domain_id = q.domain_id
  AND ct.code = 'LEGACY-' || SUBSTRING(REPLACE(q.domain_id::text, '-', '') FROM 1 FOR 8)
WHERE NOT EXISTS (
  SELECT 1
  FROM certification_topic_questions existing
  JOIN certification_topics existing_topic ON existing_topic.id = existing.topic_id
  WHERE existing_topic.certificate_id = qc.certificate_id AND existing.question_id = qc.question_id
)
ON CONFLICT (topic_id, question_id) DO NOTHING;

DROP TABLE question_certificates;
DROP TABLE lesson_certificates;
ALTER TABLE certificate_domains DROP COLUMN topics;
