CREATE TABLE "certification_topic_lessons" (
  "topic_id" UUID NOT NULL,
  "lesson_id" UUID NOT NULL,
  CONSTRAINT "certification_topic_lessons_pkey" PRIMARY KEY ("topic_id", "lesson_id"),
  CONSTRAINT "certification_topic_lessons_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "certification_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "certification_topic_lessons_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "certification_topic_lessons_lesson_id_idx" ON "certification_topic_lessons"("lesson_id");
