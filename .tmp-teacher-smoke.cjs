const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const assert = require('node:assert/strict');
const p = new PrismaClient();
(async () => {
  let groupId;
  let headers;
  const base = 'http://127.0.0.1:8080/api/v1';
  const call = async (path, method = 'GET', body) => {
    const response = await fetch(base + path, { method, headers, ...(body ? { body: JSON.stringify(body) } : {}) });
    assert.ok(response.ok, `${method} ${path}: HTTP ${response.status}`);
    return response.status === 204 ? null : response.json();
  };
  try {
    const teacher = await p.user.findFirst({ where: { status: 'active', deletedAt: null, userRoles: { some: { role: { code: 'teacher' } } } } });
    assert.ok(teacher, 'No active teacher to check');
    headers = { Authorization: 'Bearer ' + jwt.sign({ sub: teacher.id }, process.env.JWT_SECRET, { expiresIn: '5m' }), 'Content-Type': 'application/json' };
    const groups = await call('/learner-groups');
    assert.ok(Array.isArray(groups));
    assert.ok(groups.every(group => group.ownerId === teacher.id));
    const students = await call('/students?limit=1');
    assert.ok(Array.isArray(students.data));
    await call('/career-goals');
    const analytics = await call('/analytics/dashboard');
    assert.ok(Array.isArray(analytics.weeklyActivity));
    assert.ok(Array.isArray(analytics.domainsDistribution));
    console.log('Teacher groups, student choices, career goals and chart data: HTTP 200');
    const group = await call('/learner-groups', 'POST', { name: 'Temporary teacher smoke ' + Date.now() });
    groupId = group.id;
    assert.ok(groupId);
    await call('/learner-groups/' + groupId, 'PATCH', { name: 'Temporary teacher smoke updated' });
    if (students.data.length) {
      const learnerId = students.data[0].id;
      await call('/learner-groups/' + groupId + '/members', 'POST', { learnerId });
      await call('/learner-groups/' + groupId + '/members/' + learnerId, 'DELETE');
    }
    console.log('Teacher create/update/add/remove-member: passed');
  } finally {
    if (groupId) { await call('/learner-groups/' + groupId, 'DELETE'); console.log('Temporary group removed'); }
    await p.$disconnect();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
