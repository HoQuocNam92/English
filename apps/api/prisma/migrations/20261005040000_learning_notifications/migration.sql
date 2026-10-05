CREATE TABLE "learning_notifications" (
 "id" UUID NOT NULL,
 "user_id" UUID NOT NULL,
 "local_date" VARCHAR(10) NOT NULL,
 "title" VARCHAR(150) NOT NULL,
 "body" TEXT NOT NULL,
 "read_at" TIMESTAMPTZ(6),
 "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "learning_notifications_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "learning_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "learning_notifications_user_id_local_date_key" ON "learning_notifications"("user_id", "local_date");
CREATE INDEX "learning_notifications_user_id_read_at_created_at_idx" ON "learning_notifications"("user_id", "read_at", "created_at");
