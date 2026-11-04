ALTER TABLE audit_logs
 ADD COLUMN event_key VARCHAR(100), ADD COLUMN target_type VARCHAR(40),
 ADD COLUMN outcome VARCHAR(20), ADD COLUMN severity VARCHAR(10) NOT NULL DEFAULT 'info',
 ADD COLUMN request_id UUID, ADD COLUMN user_agent VARCHAR(500), ADD COLUMN failure_reason VARCHAR(100),
 ADD COLUMN old_values JSONB, ADD COLUMN new_values JSONB,
 ADD COLUMN requested_count INTEGER, ADD COLUMN updated_count INTEGER, ADD COLUMN skipped_count INTEGER;
CREATE INDEX audit_logs_event_key_created_at_idx ON audit_logs(event_key,created_at);
CREATE INDEX audit_logs_outcome_created_at_idx ON audit_logs(outcome,created_at);
CREATE INDEX audit_logs_severity_created_at_idx ON audit_logs(severity,created_at);
CREATE INDEX audit_logs_target_type_created_at_idx ON audit_logs(target_type,created_at);
CREATE INDEX audit_logs_ip_address_created_at_idx ON audit_logs(ip_address,created_at);
CREATE INDEX audit_logs_request_id_idx ON audit_logs(request_id);
CREATE INDEX audit_logs_target_ids_gin_idx ON audit_logs USING GIN(target_ids);
CREATE TABLE audit_alerts (id UUID PRIMARY KEY, dedupe_key VARCHAR(150) NOT NULL UNIQUE, kind VARCHAR(50) NOT NULL, severity VARCHAR(10) NOT NULL, event_id UUID NOT NULL, created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX audit_alerts_created_at_id_idx ON audit_alerts(created_at,id);
-- No historical rows are rewritten. Unknown legacy outcomes stay unknown.
INSERT INTO permissions (id,code,name,resource,action) VALUES (gen_random_uuid(),'audit:read','Xem nhật ký thao tác','audit','read') ON CONFLICT(code) DO NOTHING;
INSERT INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.code='admin' AND p.code='audit:read' ON CONFLICT DO NOTHING;
CREATE FUNCTION protect_audit_history() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP = 'DELETE' AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname='techenglish_audit_maintenance' AND pg_has_role(current_user,oid,'MEMBER')) THEN RETURN OLD; END IF;
 RAISE EXCEPTION 'Audit history is append-only' USING ERRCODE='42501';
END $$;
CREATE TRIGGER audit_history_append_only BEFORE UPDATE OR DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION protect_audit_history();
CREATE TRIGGER audit_history_no_truncate BEFORE TRUNCATE ON audit_logs FOR EACH STATEMENT EXECUTE FUNCTION protect_audit_history();
