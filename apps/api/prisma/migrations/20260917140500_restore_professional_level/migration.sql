-- Step 1: Add 'professional' value to the level_code enum
-- Must be in its own transaction before the value can be used.
ALTER TYPE "level_code" ADD VALUE IF NOT EXISTS 'professional' AFTER 'advanced';
