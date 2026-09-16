-- Data was backed up before this migration in:
-- backup_before_remove_out_of_scope_20260916.dump
--
-- Remove product areas that are outside the KLCN028 scope:
-- payments/PRO, conversational AI + RAG, chat vocabulary/feedback/quiz,
-- and the learning calendar/planner.

DROP TABLE IF EXISTS "ai_message_citations";
DROP TABLE IF EXISTS "ai_feedback";
DROP TABLE IF EXISTS "ai_learning_errors";
DROP TABLE IF EXISTS "ai_messages";
DROP TABLE IF EXISTS "ai_conversations";
DROP TABLE IF EXISTS "ai_saved_vocabulary";
DROP TABLE IF EXISTS "ai_usage_daily";

DROP TABLE IF EXISTS "knowledge_vectors";
DROP TABLE IF EXISTS "knowledge_chunks";
DROP TABLE IF EXISTS "knowledge_sources";

DROP TABLE IF EXISTS "learning_plan_items";

DROP TABLE IF EXISTS "user_subscriptions";
DROP TABLE IF EXISTS "payment_orders";

ALTER TABLE "lessons" DROP COLUMN IF EXISTS "is_pro_only";
ALTER TABLE "exams" DROP COLUMN IF EXISTS "is_pro_only";

DROP TYPE IF EXISTS "ai_chat_mode";
DROP TYPE IF EXISTS "ai_message_role";
DROP TYPE IF EXISTS "knowledge_source_type";
DROP TYPE IF EXISTS "knowledge_index_status";
DROP TYPE IF EXISTS "subscription_status";
DROP TYPE IF EXISTS "order_status";
