-- Existing data must first be exported and fsynced by docker/export-legacy-state.cjs.
DO $$
DECLARE name text; actual bigint; marker text; expected bigint;
BEGIN
  FOREACH name IN ARRAY ARRAY['admin_mfa','audit_logs','audit_alerts','study_time_sessions'] LOOP
    EXECUTE format('SELECT count(*) FROM %I', name) INTO actual;
    SELECT obj_description(('public.' || name)::regclass) INTO marker;
    IF actual > 0 THEN
      IF marker IS NULL OR marker !~ '^external-file-state:[0-9]+:[0-9a-f]{64}$' THEN
        RAISE EXCEPTION 'Export % to persistent files before removing the table', name;
      END IF;
      expected := split_part(marker, ':', 2)::bigint;
      IF actual <> expected THEN RAISE EXCEPTION 'Legacy table % changed after export; stop API and repeat migration', name; END IF;
    END IF;
  END LOOP;
END $$;
DROP TABLE audit_alerts;
DROP TABLE audit_logs;
DROP TABLE admin_mfa;
DROP TABLE study_time_sessions;
DROP FUNCTION IF EXISTS protect_audit_history();
