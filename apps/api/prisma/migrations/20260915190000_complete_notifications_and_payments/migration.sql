-- Persist a stable transfer reference for every payment order.
ALTER TABLE "payment_orders" ADD COLUMN "short_ref" VARCHAR(24);

UPDATE "payment_orders"
SET "short_ref" = 'TE' || UPPER(SUBSTRING(REPLACE("id"::text, '-', '') FROM 1 FOR 16))
WHERE "short_ref" IS NULL;

ALTER TABLE "payment_orders" ALTER COLUMN "short_ref" SET NOT NULL;
CREATE UNIQUE INDEX "payment_orders_short_ref_key" ON "payment_orders"("short_ref");

-- A broadcast notification must have independent read state for each user.
CREATE TABLE "notification_reads" (
    "id" UUID NOT NULL,
    "notification_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "read_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notification_reads_pkey" PRIMARY KEY ("id")
);

-- Preserve the known read state of existing personal notifications.
INSERT INTO "notification_reads" ("id", "notification_id", "user_id", "read_at")
SELECT md5("id"::text || "userId"::text)::uuid, "id", "userId", "created_at"
FROM "notifications"
WHERE "userId" IS NOT NULL AND "is_read" = TRUE;

CREATE UNIQUE INDEX "notification_reads_notification_id_user_id_key"
ON "notification_reads"("notification_id", "user_id");
CREATE INDEX "notification_reads_user_id_read_at_idx"
ON "notification_reads"("user_id", "read_at");

ALTER TABLE "notification_reads"
ADD CONSTRAINT "notification_reads_notification_id_fkey"
FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notification_reads"
ADD CONSTRAINT "notification_reads_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
