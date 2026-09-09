ALTER TABLE "discussion_posts"
ADD COLUMN "is_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "locked_at" TIMESTAMPTZ(6),
ADD COLUMN "moderation_reason" VARCHAR(500);

INSERT INTO "permissions" ("id", "code", "name", "description", "resource", "action", "created_at")
VALUES (gen_random_uuid(), 'community:manage', 'Manage Community', 'Khóa, mở khóa và xóa bài viết cộng đồng', 'community', 'manage', CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r."id", p."id"
FROM "roles" r
JOIN "permissions" p ON p."code" = 'community:manage'
WHERE r."code" = 'admin'
ON CONFLICT DO NOTHING;
