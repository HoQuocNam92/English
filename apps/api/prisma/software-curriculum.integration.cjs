// Run only against an explicitly designated disposable CI database.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { createHash } = require('node:crypto');
const { PrismaClient } = require('@prisma/client');
const { applySoftwareCurriculum, audit } = require('./seed-software-curriculum.cjs');
const { VocabStudyService } = require('../src/application/vocab-study/vocab-study.service');
const { LearningPathService } = require('../src/application/progress/learning-path.service');
const ts = require('typescript');
const trailExports = {};
require('node:vm').runInNewContext(ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../../../packages/shared-kernel/src/learning-trail.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: trailExports });

async function main() {
  if (process.env.SOFTWARE_CURRICULUM_QA !== '1') throw Error('Set SOFTWARE_CURRICULUM_QA=1 only for a disposable test database.');
  const p = new PrismaClient();
  try {
    const domain = await p.domain.upsert({ where: { code: 'SOFTWARE_ENG' }, update: {}, create: { code: 'SOFTWARE_ENG', name: 'Software Engineering', description: 'Software curriculum QA', isActive: true } });
    const levels = [];
    for (const [order, code] of ['beginner', 'intermediate', 'advanced', 'professional'].entries()) levels.push(await p.level.upsert({ where: { code }, update: {}, create: { code, name: code, description: 'Software curriculum QA', order } }));
    const adminRole = await p.role.upsert({ where: { code: 'admin' }, update: {}, create: { code: 'admin', name: 'Admin' } });
    const learnerRole = await p.role.upsert({ where: { code: 'learner' }, update: {}, create: { code: 'learner', name: 'Learner' } });
    const admin = await p.user.create({ data: { email: `software-author-${Date.now()}@example.invalid`, passwordHash: 'disabled-qa-account', userRoles: { create: { roleId: adminRole.id } } } });
    const learner = await p.user.create({ data: { email: `software-learner-${Date.now()}@example.invalid`, passwordHash: 'disabled-qa-account', userRoles: { create: { roleId: learnerRole.id } } } });
    await p.learnerProfile.create({ data: { userId: learner.id, levelId: levels[0].id, dailyVocabularyTarget: 1, learningGoal: 'vocabulary', onboardingCompleted: true, domains: { create: { domainId: domain.id } } } });
    await applySoftwareCurriculum(p);
    const lesson = await p.lesson.findFirst({ where: { slug: 'focused-20261024-software_eng-beginner-terminology' }, include: { vocabularies: true } });
    await p.learningProgress.create({ data: { learnerId: learner.id, resourceType: 'lesson', resourceId: lesson.id, status: 'completed', completionPercent: 100, completedAt: new Date() } });
    for (const link of lesson.vocabularies) await p.vocabularyProgress.create({ data: { learnerId: learner.id, vocabularyId: link.vocabularyId, status: 'mastered', lastRating: 'mastered', lastReviewAt: new Date(), nextReviewAt: new Date(Date.now() + 86400000) } });
    const fingerprint = async () => createHash('sha256').update(JSON.stringify(await Promise.all([p.learningProgress.findMany({ orderBy: { id: 'asc' } }), p.vocabularyProgress.findMany({ orderBy: { id: 'asc' } }), p.examAttempt.findMany({ orderBy: { id: 'asc' } })]))).digest('hex');
    const counts = async () => Promise.all([p.vocabulary.count(), p.lesson.count(), p.lessonSection.count(), p.vocabularyExample.count(), p.question.count(), p.examQuestion.count()]);
    const before = await fingerprint(); const initialCounts = await counts();
    await applySoftwareCurriculum(p);
    assert.deepEqual(await counts(), initialCounts, 'running twice must not duplicate content');
    assert.equal(await fingerprint(), before, 'preserve all learning and attempt history');
    const report = await audit(p);
    assert.ok(report.tiers.every(tier => tier.lessons === 10 && tier.vocabulary === 50 && tier.questions >= 18 && tier.errors.length === 0));
    const vocab = new VocabStudyService(p);
    let checked = 0;
    for (const level of levels) {
      const db = Object.create(p);
      db.learnerProfile = { findUnique: async () => ({ onboardingCompleted: true, learningGoal: 'vocabulary', level, levelId: level.id, domains: [{ domainId: domain.id, domain }], dailyStudyTargetMinutes: 30 }) };
      const journey = await new LearningPathService(p).getPath(learner.id, db);
      assert.equal(journey.domains[0].available, true);
      assert.equal(journey.domains[0].lessons.length, 10);
      const trail = trailExports.buildLearningTrail(journey.domains);
      for (const item of journey.domains[0].lessons) {
        const session = await vocab.getStudySession(learner.id, { sourceLessonId: item.id, onlyNew: false });
        assert.equal(session.words.length, item.vocabularyCount, item.title);
        assert.equal(trail.steps.find(step => step.id === `review:${item.id}`).title, `Luyện ${session.words.length} từ trong bài`);
        assert.ok(session.words.length >= 7); checked++;
      }
    }
    assert.equal(checked, 40);
    const masteredReview = await vocab.getStudySession(learner.id, { sourceLessonId: lesson.id, onlyNew: false });
    assert.equal(masteredReview.words.length, 8, 'all eight mastered words remain available after daily goal');
    console.log(JSON.stringify({ checkedLessonSessions: checked, historyPreserved: true, idempotent: true, authorCreated: Boolean(admin.id), report }));
  } finally { await p.$disconnect(); }
}
main().catch(error => { console.error(error.code ?? error.name, String(error.message).slice(-1500)); process.exitCode = 1; });
