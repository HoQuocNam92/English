ALTER TABLE roles ADD COLUMN color VARCHAR(16);
UPDATE roles SET color = CASE code
  WHEN 'SUPER_ADMIN' THEN 'amber'
  WHEN 'admin' THEN 'indigo'
  WHEN 'teacher' THEN 'blue'
  WHEN 'learner' THEN 'violet'
  ELSE (ARRAY['amber','indigo','blue','violet','emerald','teal','rose','orange'])[
    1 + (SELECT COALESCE(SUM(ascii(letter)), 0) % 8 FROM regexp_split_to_table(lower(code), '') AS characters(letter))::int
  ] END;
ALTER TABLE roles ALTER COLUMN color SET DEFAULT 'indigo';
ALTER TABLE roles ALTER COLUMN color SET NOT NULL;
ALTER TABLE roles ADD CONSTRAINT roles_color_palette_check
  CHECK (color IN ('amber','indigo','blue','violet','emerald','teal','rose','orange'));
