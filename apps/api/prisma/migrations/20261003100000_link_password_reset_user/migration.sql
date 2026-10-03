BEGIN;
ALTER TABLE "password_reset_tokens" ADD COLUMN "user_id" UUID;
UPDATE "password_reset_tokens" AS t SET "user_id" = u."id"
FROM "users" AS u WHERE t."email" = u."email";
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;
