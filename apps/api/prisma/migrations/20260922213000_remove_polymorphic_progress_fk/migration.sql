-- learning_progress.resource_id is polymorphic and may contain a lesson,
-- domain, or certificate id. A foreign key to lessons rejects the other two
-- valid resource types, so integrity is enforced by ProgressService instead.
ALTER TABLE "learning_progress" DROP CONSTRAINT IF EXISTS "fk_progress_lesson";
ALTER TABLE "learning_progress" DROP CONSTRAINT IF EXISTS "fk_progress_domain";
ALTER TABLE "learning_progress" DROP CONSTRAINT IF EXISTS "fk_progress_certificate";
