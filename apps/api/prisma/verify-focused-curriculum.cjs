const assert = require('node:assert/strict');
const { mainCodes, levels, stamp } = require('./seed-focused-curriculum.cjs');
let PrismaClient; try { ({ PrismaClient } = require('@prisma/client')); } catch { ({ PrismaClient } = require('/app/node_modules/@prisma/client')); }
if (process.argv.includes('--qa')) { const url = new URL(process.env.DATABASE_URL); url.pathname = '/techenglish_curriculum_qa20261024'; process.env.DATABASE_URL = url.toString(); }
const prisma = new PrismaClient();
(async () => {
  const active = await prisma.domain.findMany({ where: { isActive: true }, select: { code: true } });
  assert.deepEqual(active.map(d => d.code).sort(), [...mainCodes].sort());
  const lessons = await prisma.lesson.findMany({ where: { slug: { startsWith: stamp } }, include: { sections: true, domain: true, level: true, _count: { select: { vocabularies: true } } } });
  assert.equal(lessons.length, 48);
  const coverage = [];
  for (const domain of mainCodes) for (const level of levels) {
    const rows = lessons.filter(l => l.domain.code === domain && l.level.code === level);
    assert.equal(rows.length, 4);
    assert.equal(rows.filter(l => l.type === 'terminology').length, 1);
    assert.equal(rows.filter(l => l.type === 'technical_reading').length, 2);
    assert.equal(rows.filter(l => l.type === 'case_study').length, 1);
    assert.ok(rows.every(l => l.status === 'published' && l._count.vocabularies === 8 && l.sections.length >= 6), JSON.stringify({ domain, level, counts: rows.map(l => ({ type: l.type, status: l.status, words: l._count.vocabularies, sections: l.sections.length })) }));
    assert.ok(rows.every(l => !l.sections.some(s => s.type === 'quiz')));
    coverage.push({ domain, level, lessons: rows.length, vocabularyPerLesson: 8 });
  }
  const questions = await prisma.question.findMany({ where: { topics: { has: stamp } }, include: { options: true } });
  assert.equal(questions.length, 72);
  assert.ok(questions.every(q => q.status === 'published' && q.options.length === 4 && q.options.filter(o => o.isCorrect).length === 1));
  let professionalPracticeExams = 0;
  for (const domain of mainCodes) {
    const exam = await prisma.exam.findFirst({ where: { domain: { code: domain }, level: { code: 'professional' }, certificateId: null, status: 'published', kind: 'practice', topics: { has: `coverage-20261009-${domain.toLowerCase()}-professional` } }, include: { questions: { include: { question: true } } } });
    assert.ok(exam, `Missing professional practice: ${domain}`);
    const linked = exam.questions.filter(link => link.question.topics.includes(stamp));
    assert.equal(linked.length, 6);
    assert.ok(linked.every(link => link.question.levelId === exam.levelId && link.question.domainId === exam.domainId));
    professionalPracticeExams++;
  }
  let verifiedPlans = 0;
  const profiles = await prisma.learnerProfile.findMany({ where: { onboardingCompleted: true, learningGoal: 'vocabulary' }, include: { domains: true } });
  for (const profile of profiles) {
    const assessment = await prisma.placementAssessment.findFirst({ where: { learnerId: profile.userId, submittedAt: { not: null } }, orderBy: { submittedAt: 'desc' } });
    if (assessment?.result?.plan?.curriculumVersion !== stamp) continue;
    for (const step of assessment.result.plan.steps.filter(s => s.kind === 'lesson')) {
      const lesson = lessons.find(l => l.id === step.id);
      assert.ok(lesson && lesson.levelId === profile.levelId && profile.domains.some(d => d.domainId === lesson.domainId));
    }
    verifiedPlans++;
  }
  console.log(JSON.stringify({ verified: true, environment: process.argv.includes('--qa') ? 'QA' : 'production', activeDomains: active.map(d => d.code), coverage, assessmentQuestions: questions.length, professionalPracticeExams, verifiedPlans }));
})().catch(error => { console.error(error.name, error.message?.replace(/postgres(?:ql)?:\/\/[^\s]+/g, '[REDACTED]').slice(-500)); process.exitCode = 1; }).finally(() => prisma.$disconnect());
