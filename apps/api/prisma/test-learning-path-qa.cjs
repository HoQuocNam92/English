// Integration check on an isolated database on the VPS. Never points at production.
const assert = require('node:assert/strict');
const { PrismaClient } = require('/app/node_modules/@prisma/client');
const url = new URL(process.env.DATABASE_URL);
url.pathname = '/techenglish_curriculum_qa20261024';
process.env.DATABASE_URL = url.toString();
const p = new PrismaClient();
require('/app/node_modules/ts-node').register({ project: '/app/apps/api/tsconfig.json' });
const { LearningPathService } = require('/app/apps/api/src/application/progress/learning-path.service.ts');

(async () => {
  assert.equal(new URL(process.env.DATABASE_URL).pathname, '/techenglish_curriculum_qa20261024');
  const role = await p.role.findUnique({ where: { code: 'learner' } });
  const level = await p.level.findUnique({ where: { code: 'intermediate' } });
  const domain = await p.domain.findUnique({ where: { code: 'SOFTWARE_ENG' } });
  const learner = await p.user.create({ data: { email: `learning-path-${Date.now()}@example.invalid`, passwordHash: 'isolated-qa-only', status: 'active', userRoles: { create: { roleId: role.id } }, learnerProfile: { create: { levelId: level.id, learningGoal: 'vocabulary', onboardingCompleted: true, domains: { create: { domainId: domain.id } } } } } });
  const service = new LearningPathService(p);
  const start = await service.getPath(learner.id);
  assert.equal(start.totalLessons, 4); assert.equal(start.completedLessons, 0); assert.equal(start.canAdvance, false);
  const completedAt = new Date(Date.now() - 5000);
  await p.learningProgress.createMany({ data: start.domains[0].lessons.map(lesson => ({ learnerId: learner.id, resourceType: 'lesson', resourceId: lesson.id, status: 'completed', completionPercent: 100, completedAt })) });
  const ready = await service.getPath(learner.id);
  assert.equal(ready.domains[0].state, 'assessment_due'); assert.equal(ready.canAdvance, false);
  await assert.rejects(() => service.advance(learner.id, 'intermediate'));
  const attempt = await p.examAttempt.create({ data: { learnerId: learner.id, examId: ready.domains[0].assessment.id, status: 'graded', questionsSnapshot: [], examSnapshot: {}, scorePercent: 90, passed: true, submittedAt: new Date(), gradedAt: new Date() } });
  const passed = await service.getPath(learner.id); assert.equal(passed.canAdvance, true);
  const concurrent = await Promise.allSettled([service.advance(learner.id, 'intermediate'), service.advance(learner.id, 'intermediate')]);
  assert.equal(concurrent.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(concurrent.filter(result => result.status === 'rejected').length, 1);
  const next = await service.getPath(learner.id); assert.equal(next.level.code, 'advanced'); assert.equal(next.completedLessons, 0);
  assert.equal(await p.learningProgress.count({ where: { learnerId: learner.id } }), 4);
  assert.ok(await p.examAttempt.findUnique({ where: { id: attempt.id } }));
  await assert.rejects(() => service.advance(learner.id, 'intermediate'));
  console.log('PASS: real PostgreSQL path -> assessment -> one concurrent upgrade; history retained; stale promotion rejected');
})().catch(error => { console.error(error.name, error.message?.replace(/postgres(?:ql)?:\/\/[^\s]+/g, '[REDACTED]').slice(-500)); process.exitCode = 1; }).finally(() => p.$disconnect());
