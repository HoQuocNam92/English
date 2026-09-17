-- Step 2: Insert the Professional level row (enum value already committed)
INSERT INTO "levels" ("id", "code", "name", "order", "description", "is_active", "created_at", "updated_at")
VALUES (
  gen_random_uuid(),
  'professional',
  'Professional',
  4,
  'Dành cho chuyên gia IT. Bao gồm tài liệu chuyên sâu, kỹ năng giao tiếp chuyên nghiệp và nội dung chuẩn bị chứng chỉ nâng cao.',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (code) DO NOTHING;
