-- Core application roles are mutually exclusive. Preserve the more privileged
-- existing role when historical data contains more than one core role.
DELETE FROM "user_roles" AS learner_role
USING "roles" AS learner
WHERE learner_role."role_id" = learner."id"
  AND learner."code" = 'learner'
  AND EXISTS (
    SELECT 1
    FROM "user_roles" AS elevated_user_role
    JOIN "roles" AS elevated_role ON elevated_role."id" = elevated_user_role."role_id"
    WHERE elevated_user_role."user_id" = learner_role."user_id"
      AND elevated_role."code" IN ('admin', 'teacher')
  );

DELETE FROM "user_roles" AS teacher_role
USING "roles" AS teacher
WHERE teacher_role."role_id" = teacher."id"
  AND teacher."code" = 'teacher'
  AND EXISTS (
    SELECT 1
    FROM "user_roles" AS admin_user_role
    JOIN "roles" AS admin_role ON admin_role."id" = admin_user_role."role_id"
    WHERE admin_user_role."user_id" = teacher_role."user_id"
      AND admin_role."code" = 'admin'
  );

DELETE FROM "learner_profiles" AS profile
WHERE NOT EXISTS (
  SELECT 1
  FROM "user_roles" AS user_role
  JOIN "roles" AS role ON role."id" = user_role."role_id"
  WHERE user_role."user_id" = profile."user_id"
    AND role."code" = 'learner'
);
