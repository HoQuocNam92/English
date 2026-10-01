ALTER TABLE "vocabularies" ADD COLUMN "parts_of_speech" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
UPDATE "vocabularies" SET "parts_of_speech" = ARRAY["part_of_speech"] WHERE "part_of_speech" IS NOT NULL AND "part_of_speech" <> '';
CREATE TABLE "vocabulary_domains" (
  "vocabulary_id" UUID NOT NULL,
  "domain_id" UUID NOT NULL,
  CONSTRAINT "vocabulary_domains_pkey" PRIMARY KEY ("vocabulary_id", "domain_id"),
  CONSTRAINT "vocabulary_domains_vocabulary_id_fkey" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabularies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "vocabulary_domains_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "vocabulary_domains_domain_id_idx" ON "vocabulary_domains"("domain_id");
INSERT INTO "vocabulary_domains" ("vocabulary_id", "domain_id") SELECT "id", "domain_id" FROM "vocabularies";
