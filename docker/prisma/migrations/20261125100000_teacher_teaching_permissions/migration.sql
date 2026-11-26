-- Grant teaching capabilities without changing existing user accounts.
INSERT INTO permissions (id, code, name, resource, action)
SELECT gen_random_uuid(), code, name, resource, action FROM (VALUES
 ('lessons:read', 'Read Lessons', 'lessons', 'read'),
 ('lessons:create', 'Create Lessons', 'lessons', 'create'),
 ('lessons:update', 'Update Lessons', 'lessons', 'update'),
 ('lessons:delete', 'Delete Lessons', 'lessons', 'delete'),
 ('exams:delete', 'Delete Exams', 'exams', 'delete')
) AS teaching(code, name, resource, action)
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code IN ('teacher', 'admin') AND p.code IN (
 'lessons:read', 'lessons:create', 'lessons:update', 'lessons:delete',
 'vocabulary:read', 'vocabulary:manage', 'questions:read', 'questions:manage',
 'exams:read', 'exams:create', 'exams:publish', 'exams:grade', 'exams:delete', 'reports:read'
)
ON CONFLICT DO NOTHING;
