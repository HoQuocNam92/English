CREATE TABLE "certification_topics" (
  "id" UUID NOT NULL,
  "certificate_id" UUID NOT NULL,
  "domain_id" UUID NOT NULL,
  "code" VARCHAR(20) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "description" VARCHAR(1000) NOT NULL,
  "order" INTEGER NOT NULL,
  CONSTRAINT "certification_topics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "certification_topic_lessons" (
  "topic_id" UUID NOT NULL,
  "lesson_id" UUID NOT NULL,
  CONSTRAINT "certification_topic_lessons_pkey" PRIMARY KEY ("topic_id", "lesson_id")
);

CREATE TABLE "certification_topic_vocabularies" (
  "topic_id" UUID NOT NULL,
  "vocabulary_id" UUID NOT NULL,
  CONSTRAINT "certification_topic_vocabularies_pkey" PRIMARY KEY ("topic_id", "vocabulary_id")
);

CREATE TABLE "certification_topic_questions" (
  "topic_id" UUID NOT NULL,
  "question_id" UUID NOT NULL,
  CONSTRAINT "certification_topic_questions_pkey" PRIMARY KEY ("topic_id", "question_id")
);

CREATE TABLE "saved_questions" (
  "learner_id" UUID NOT NULL,
  "question_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "saved_questions_pkey" PRIMARY KEY ("learner_id", "question_id")
);

CREATE UNIQUE INDEX "certification_topics_certificate_id_code_key" ON "certification_topics"("certificate_id", "code");
CREATE UNIQUE INDEX "certification_topics_certificate_id_domain_id_order_key" ON "certification_topics"("certificate_id", "domain_id", "order");
CREATE INDEX "certification_topics_certificate_id_domain_id_idx" ON "certification_topics"("certificate_id", "domain_id");
CREATE INDEX "certification_topic_lessons_lesson_id_idx" ON "certification_topic_lessons"("lesson_id");
CREATE INDEX "certification_topic_vocabularies_vocabulary_id_idx" ON "certification_topic_vocabularies"("vocabulary_id");
CREATE INDEX "certification_topic_questions_question_id_idx" ON "certification_topic_questions"("question_id");
CREATE INDEX "saved_questions_question_id_idx" ON "saved_questions"("question_id");

ALTER TABLE "certification_topics" ADD CONSTRAINT "certification_topics_certificate_id_domain_id_fkey" FOREIGN KEY ("certificate_id", "domain_id") REFERENCES "certificate_domains"("certificate_id", "domain_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "certification_topic_lessons" ADD CONSTRAINT "certification_topic_lessons_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "certification_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "certification_topic_lessons" ADD CONSTRAINT "certification_topic_lessons_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "certification_topic_vocabularies" ADD CONSTRAINT "certification_topic_vocabularies_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "certification_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "certification_topic_vocabularies" ADD CONSTRAINT "certification_topic_vocabularies_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabularies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "certification_topic_questions" ADD CONSTRAINT "certification_topic_questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "certification_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "certification_topic_questions" ADD CONSTRAINT "certification_topic_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_questions" ADD CONSTRAINT "saved_questions_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_questions" ADD CONSTRAINT "saved_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
