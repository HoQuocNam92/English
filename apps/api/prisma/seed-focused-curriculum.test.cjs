const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadModules, validate, sectionsFor, questionsFor, planFor } = require('./seed-focused-curriculum.cjs');

test('three requested industries have complete all four level modules', () => {
  const modules = loadModules(); validate(modules);
  assert.equal(modules.length, 12);
  assert.equal(modules.flatMap(m => m.words).length, 96);
  assert.equal(modules.flatMap(questionsFor).length, 72);
  for (const module of modules) for (const type of ['terminology', 'reading', 'documentation', 'case']) {
    const sections = sectionsFor(module, type);
    assert.ok(sections.length >= 6);
    assert.ok(sections.some(s => /Bước tiếp theo|Sau khi hoàn thành/.test(s.title)));
    assert.ok(!sections.some(s => s.type === 'quiz'), 'No removed free-response cards');
    assert.ok(sections.every(s => Object.values(s.content).every(value => typeof value === 'string')));
  }
});
test('professional plan points at professional practice rather than claiming the general placement test certifies it', () => {
  const profile = { domains: [{ domainId: 'cloud' }], levelId: 'p', level: { name: 'Chuyên nghiệp' }, dailyStudyTargetMinutes: 30 };
  const plan = planFor(profile, [{ id: 'lesson', title: 'Professional', domainId: 'cloud', levelId: 'p', curriculumOrder: 0, practiceExamId: 'practice' }], new Set());
  assert.equal(plan.steps.at(-1).kind, 'quiz');
  assert.equal(plan.steps.at(-1).actionUrl, '/learn/quiz/practice');
  assert.match(plan.summary, /không xác nhận cấp Chuyên nghiệp/);
});
test('a completed introductory lesson never replaces the next intermediate activity', () => {
  const profile = { domains: [{ domainId: 'software' }], levelId: 'intermediate', level: { name: 'Trung cấp' }, dailyStudyTargetMinutes: 30 };
  const lessons = [
    { id: 'intro', title: 'Beginner', domainId: 'software', levelId: 'beginner', curriculumOrder: 0 },
    { id: 'known', title: 'Vocabulary', domainId: 'software', levelId: 'intermediate', curriculumOrder: 0 },
    { id: 'reading', title: 'Reading', domainId: 'software', levelId: 'intermediate', curriculumOrder: 1 },
    { id: 'cloud', title: 'Cloud', domainId: 'cloud', levelId: 'intermediate', curriculumOrder: 1 },
  ];
  const plan = planFor(profile, lessons, new Set(['known', 'intro']));
  assert.equal(plan.steps[0].id, 'reading');
  assert.equal(plan.steps[0].actionUrl, '/learn/lessons/reading');
  assert.ok(!plan.steps.some(s => ['intro', 'cloud'].includes(s.id)));
  assert.equal(plan.steps.at(-1).kind, 'vocabulary');
});
