CREATE TABLE "learner_groups" (
  "id" UUID NOT NULL,
  "name" VARCHAR(150) NOT NULL,
  "description" VARCHAR(500),
  "owner_id" UUID NOT NULL,
  "career_goal_id" UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "learner_groups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "learner_group_members" (
  "group_id" UUID NOT NULL,
  "learner_id" UUID NOT NULL,
  "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "learner_group_members_pkey" PRIMARY KEY ("group_id", "learner_id")
);

CREATE INDEX "learner_groups_owner_id_idx" ON "learner_groups"("owner_id");
CREATE INDEX "learner_groups_career_goal_id_idx" ON "learner_groups"("career_goal_id");
CREATE INDEX "learner_group_members_learner_id_idx" ON "learner_group_members"("learner_id");

ALTER TABLE "learner_groups" ADD CONSTRAINT "learner_groups_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "learner_groups" ADD CONSTRAINT "learner_groups_career_goal_id_fkey" FOREIGN KEY ("career_goal_id") REFERENCES "career_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "learner_group_members" ADD CONSTRAINT "learner_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "learner_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learner_group_members" ADD CONSTRAINT "learner_group_members_learner_id_fkey" FOREIGN KEY ("learner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
