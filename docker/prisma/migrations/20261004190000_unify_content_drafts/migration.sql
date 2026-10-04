-- Unify unpublished content as draft without deleting content or learning history.
UPDATE "lessons" SET "status" = 'draft' WHERE "status" = 'archived';
UPDATE "vocabularies" SET "status" = 'draft' WHERE "status" = 'archived';
UPDATE "questions" SET "status" = 'draft' WHERE "status" = 'archived';
UPDATE "exams" SET "status" = 'draft' WHERE "status" = 'archived';
