ALTER TABLE "refresh_tokens" ADD COLUMN "mfa_verified_at" TIMESTAMPTZ(6);
CREATE TABLE "admin_mfa" (
  "user_id" UUID PRIMARY KEY,
  "secret_encrypted" TEXT NOT NULL,
  "enabled_at" TIMESTAMPTZ(6),
  "pending_expires_at" TIMESTAMPTZ(6) NOT NULL,
  "last_step" INTEGER NOT NULL DEFAULT -1,
  "recovery_hashes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "failed_attempts" INTEGER NOT NULL DEFAULT 0,
  "locked_until" TIMESTAMPTZ(6)
);
CREATE TABLE "audit_logs" (
  "id" UUID PRIMARY KEY,
  "actor_id" UUID,
  "actor_email" VARCHAR(254),
  "method" VARCHAR(10) NOT NULL,
  "action" VARCHAR(30),
  "route" VARCHAR(300) NOT NULL,
  "target_ids" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "status_code" INTEGER NOT NULL,
  "ip_address" VARCHAR(64),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "audit_logs_created_at_id_idx" ON "audit_logs"("created_at", "id");
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");
