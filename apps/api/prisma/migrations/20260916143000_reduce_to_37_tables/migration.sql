-- Full backup created before this migration:
-- backup_before_reduce_to_37_tables_20260916.dump

DROP TABLE IF EXISTS "discussion_votes";
DROP TABLE IF EXISTS "discussion_comments";
DROP TABLE IF EXISTS "discussion_posts";
DROP TABLE IF EXISTS "notification_reads";
DROP TABLE IF EXISTS "notifications";
DROP TABLE IF EXISTS "landing_banners";
DROP TABLE IF EXISTS "career_goal_skills";
DROP TABLE IF EXISTS "progress_summary_cache";

DROP TYPE IF EXISTS "notification_type";
