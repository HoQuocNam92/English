-- Expression indexes enforce identity even for legacy formatting and concurrent
-- requests. Do not merge, delete or rewrite existing accounts to resolve conflicts.
BEGIN;

CREATE FUNCTION canonical_phone(value text) RETURNS text
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE AS $$
  WITH digits AS (SELECT regexp_replace(value, '[^0-9]', '', 'g') AS value),
  international AS (SELECT CASE WHEN value LIKE '00%' THEN substr(value, 3) ELSE value END AS value FROM digits)
  SELECT NULLIF(CASE WHEN length(value) = 10 AND value LIKE '0%'
    THEN '84' || substr(value, 2) ELSE value END, '') FROM international;
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM users GROUP BY lower(btrim(email)) HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'Duplicate normalized emails exist. Review the identity audit before applying this migration.';
  END IF;
  IF EXISTS (SELECT 1 FROM user_details WHERE canonical_phone(phone_number) IS NOT NULL
    GROUP BY canonical_phone(phone_number) HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'Duplicate normalized phone numbers exist. Review the identity audit before applying this migration.';
  END IF;
END $$;

CREATE UNIQUE INDEX users_email_normalized_key ON users (lower(btrim(email)));
CREATE UNIQUE INDEX user_details_phone_normalized_key ON user_details (canonical_phone(phone_number));

COMMIT;
