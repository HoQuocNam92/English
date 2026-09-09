CREATE TYPE "ai_chat_mode" AS ENUM ('qa', 'correction', 'it_conversation', 'vocabulary');
CREATE TYPE "ai_message_role" AS ENUM ('user', 'assistant');

CREATE TABLE "ai_conversations" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "mode" "ai_chat_mode" NOT NULL DEFAULT 'qa',
  "title" VARCHAR(200) NOT NULL DEFAULT 'Cuộc trò chuyện mới',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ai_messages" (
  "id" UUID NOT NULL,
  "conversation_id" UUID NOT NULL,
  "role" "ai_message_role" NOT NULL,
  "content" TEXT NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ai_learning_errors" (
  "id" UUID NOT NULL,
  "conversation_id" UUID NOT NULL,
  "message_id" UUID,
  "category" VARCHAR(50) NOT NULL,
  "original" TEXT NOT NULL,
  "corrected" TEXT NOT NULL,
  "explanation_vi" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_learning_errors_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ai_saved_vocabulary" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "term" VARCHAR(150) NOT NULL,
  "phrase" VARCHAR(250),
  "meaning_vi" VARCHAR(1000) NOT NULL,
  "pronunciation" VARCHAR(100),
  "part_of_speech" VARCHAR(50),
  "level" VARCHAR(10),
  "example" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_saved_vocabulary_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ai_conversations_user_id_updated_at_idx" ON "ai_conversations"("user_id", "updated_at");
CREATE INDEX "ai_messages_conversation_id_created_at_idx" ON "ai_messages"("conversation_id", "created_at");
CREATE INDEX "ai_learning_errors_conversation_id_created_at_idx" ON "ai_learning_errors"("conversation_id", "created_at");
CREATE INDEX "ai_saved_vocabulary_user_id_created_at_idx" ON "ai_saved_vocabulary"("user_id", "created_at");
CREATE UNIQUE INDEX "ai_saved_vocabulary_user_id_term_phrase_key" ON "ai_saved_vocabulary"("user_id", "term", "phrase");
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_learning_errors" ADD CONSTRAINT "ai_learning_errors_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_learning_errors" ADD CONSTRAINT "ai_learning_errors_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "ai_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ai_saved_vocabulary" ADD CONSTRAINT "ai_saved_vocabulary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
