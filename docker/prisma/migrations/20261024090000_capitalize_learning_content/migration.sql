-- Capitalize display text only. Preserve code, URLs, HTML and identifiers.
CREATE FUNCTION pg_temp.content_initial_upper(value text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN value IS NULL OR value ~ 'https?://|<[^>]+>|[`{}=_/\\]' OR value ~ '[a-z]+[A-Z][[:alnum:]]*' THEN value
    WHEN value ~ '^[[:lower:]]' THEN upper(left(value, 1)) || substr(value, 2)
    ELSE value
  END
$$;

UPDATE lessons
SET title = pg_temp.content_initial_upper(title),
    summary = pg_temp.content_initial_upper(summary),
    key_concepts = ARRAY(SELECT pg_temp.content_initial_upper(value) FROM unnest(key_concepts) AS value);

UPDATE vocabularies v
SET term = CASE WHEN EXISTS (
      SELECT 1 FROM vocabularies other
      WHERE other.domain_id = v.domain_id AND other.id <> v.id
        AND other.term = pg_temp.content_initial_upper(v.term)
    ) THEN v.term ELSE pg_temp.content_initial_upper(v.term) END,
    definition_en = pg_temp.content_initial_upper(definition_en),
    definition_vi = pg_temp.content_initial_upper(definition_vi);

UPDATE vocabulary_examples
SET sentence_en = pg_temp.content_initial_upper(sentence_en),
    translation_vi = pg_temp.content_initial_upper(translation_vi);

UPDATE lesson_sections SET title = pg_temp.content_initial_upper(title);

-- Deliberate allowlist: do not rewrite code, HTML, method, path or free-text snippets.
UPDATE lesson_sections s
SET content = (
  SELECT jsonb_object_agg(key, CASE
    WHEN key IN ('term', 'definitionEn', 'definitionVi', 'example', 'translationVi', 'context', 'problem', 'constraints', 'stakeholders', 'documentTitle')
      AND jsonb_typeof(value) = 'string'
    THEN to_jsonb(pg_temp.content_initial_upper(value #>> '{}'))
    ELSE value END)
  FROM jsonb_each(s.content::jsonb)
)
WHERE type <> 'code' AND jsonb_typeof(content::jsonb) = 'object' AND content::jsonb <> '{}'::jsonb;
