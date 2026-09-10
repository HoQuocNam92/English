DROP TABLE IF EXISTS "learner_group_members";
DROP TABLE IF EXISTS "learner_groups";
DROP TYPE IF EXISTS "learner_group_status";

DELETE FROM "permissions" WHERE "code" = 'groups:manage';
