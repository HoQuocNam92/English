import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { LearningPathService } from './learning-path.service'

test('word review is counted only after completing the lesson and reviewing every linked word', async () => {
  const f = fixture({ completed: true })
  const original = f.db.lesson.findMany
  let reviewAt = new Date('2026-10-23T02:00:00Z')
  f.db.lesson.findMany = async (args: any) => (await original(args)).map((lesson: any) => ({ ...lesson, vocabularies: [{ vocabulary: { vocabProgress: [{ lastReviewAt: reviewAt }] } }] }))
  let path = await f.service.getPath('learner'); if (!path.configured) return assert.fail('path')
  assert.equal(path.domains[0].lessons[0].vocabularyCount, 1)
  assert.equal(path.domains[0].lessons[0].vocabularyReviewComplete, false)
  reviewAt = new Date('2026-10-24T04:00:00Z')
  path = await f.service.getPath('learner'); if (!path.configured) return assert.fail('path')
  assert.equal(path.domains[0].lessons[0].vocabularyReviewComplete, true)
  assert.equal(path.canAdvance, false, 'review alone cannot unlock a level without assessment')
})

function fixture(options: { completed?: boolean; passed?: boolean; final?: boolean; oldAttempt?: boolean; missing?: boolean; secondDomain?: boolean } = {}) {
  const levels = ['beginner', 'intermediate', 'advanced', 'professional'].map(code => ({ id: code, code, name: code }))
  const profile: any = { userId: 'learner', onboardingCompleted: true, learningGoal: 'vocabulary', levelId: options.final ? 'professional' : 'intermediate', level: levels[options.final ? 3 : 1], domains: [{ domainId: 'd', domain: { code: 'SOFTWARE_ENG', name: 'Software', isActive: true } }] }
  if (options.secondDomain) profile.domains.push({ domainId: 'other', domain: { code: 'CLOUD', name: 'Cloud', isActive: true } })
  const lessonRows = (level: string) => profile.domains.flatMap((link: any) => ['terminology', 'reading', 'documentation', 'case', ...(link.domain.code === 'SOFTWARE_ENG' ? ['05-vocabulary', '06-technical_reading', '07-api_documentation', '08-system_design', '09-case_study', '10-technical_reading'] : [])].map((type, index) => ({ id: `${link.domainId}-${level}-${index}`, title: type, slug: `focused-20261024-${link.domain.code.toLowerCase()}-${level}-${type}`, domainId: link.domainId, estimatedMinutes: 20 })))
  const progress = options.completed ? lessonRows(profile.levelId).filter((row: any) => row.domainId === 'd').map((row: any) => ({ resourceId: row.id, status: 'completed', completionPercent: 100, completedAt: new Date('2026-10-24T02:00:00Z') })) : []
  let updates = 0
  const db: any = {
    user: { findFirst: async () => ({ id: 'learner' }) },
    learnerProfile: { findUnique: async () => profile, updateMany: async ({ where, data }: any) => { if (where.levelId !== profile.levelId) return { count: 0 }; updates++; profile.levelId = data.levelId; profile.level = levels.find(level => level.id === data.levelId); return { count: 1 } } },
    lesson: { findMany: async ({ where }: any) => options.missing ? [] : lessonRows(where.levelId) },
    learningProgress: { findMany: async () => progress },
    exam: { findMany: async () => profile.domains.map((link: any) => ({ id: `exam-${link.domainId}`, title: 'Practice', domainId: link.domainId, passingScorePercent: 75, topics: [`coverage-20261009-${link.domain.code.toLowerCase()}-${profile.levelId}`] })) },
    examAttempt: { findMany: async () => options.passed !== undefined ? [{ id: 'attempt', examId: 'exam-d', passed: options.passed, scorePercent: options.passed ? 90 : 50, submittedAt: new Date(options.oldAttempt ? '2026-10-23T03:00:00Z' : '2026-10-24T03:00:00Z') }] : [] },
    level: { findMany: async () => levels },
  }
  db.$transaction = async (run: any) => run(db)
  return { service: new LearningPathService(db), db, profile, get updates() { return updates } }
}
test('recommends an unfinished lesson at the current level', async () => {
  const f = fixture(); const path = await f.service.getPath('learner')
  if (!path.configured) return assert.fail('path')
  assert.equal(path.domains[0].nextLesson.id, 'd-intermediate-0'); assert.equal(path.canAdvance, false); assert.equal(f.updates, 0)
})

test('Software requires all ten ordered lessons and never unlocks promotion from the old four', async () => {
  const f = fixture({ completed: true, passed: true })
  const complete = await f.service.getPath('learner'); if (!complete.configured) return assert.fail('path')
  assert.equal(complete.domains[0].lessons.length, 10)
  assert.equal(complete.domains[0].lessons[9].week, 10)
  const read = f.db.lesson.findMany
  f.db.lesson.findMany = async (args: any) => (await read(args)).slice(0, 4)
  const old = await f.service.getPath('learner'); if (!old.configured) return assert.fail('path')
  assert.equal(old.domains[0].available, false)
  assert.equal(old.allCompleted, false)
  assert.equal(old.canAdvance, false)
  assert.equal(old.nextLevel, null)
})
test('reading alone opens assessment, never automatically upgrades', async () => {
  const f = fixture({ completed: true }); const path = await f.service.getPath('learner')
  if (!path.configured) return assert.fail('path')
  assert.equal(path.domains[0].state, 'assessment_due'); assert.equal(path.canAdvance, false)
  await assert.rejects(() => f.service.advance('learner', 'intermediate')); assert.equal(f.updates, 0)
})
test('failed or historical quiz results do not unlock the new course', async () => {
  for (const options of [{ completed: true, passed: false }, { completed: true, passed: true, oldAttempt: true }]) {
    const path = await fixture(options).service.getPath('learner'); if (!path.configured) return assert.fail('path')
    assert.equal(path.canAdvance, false); assert.equal(path.allCompleted, false)
  }
})
test('explicit upgrade starts next level and rejects a stale second click', async () => {
  const f = fixture({ completed: true, passed: true }); const before = await f.service.getPath('learner')
  if (!before.configured) return assert.fail('path')
  assert.equal(before.canAdvance, true); assert.equal(f.updates, 0)
  const after = await f.service.advance('learner', 'intermediate'); if (!after.configured) return assert.fail('path')
  assert.equal(after.level.code, 'advanced'); assert.equal(after.completedLessons, 0); assert.equal(f.updates, 1)
  await assert.rejects(() => f.service.advance('learner', 'intermediate')); assert.equal(f.updates, 1)
})
test('all selected domains must finish; an empty course is never complete', async () => {
  for (const options of [{ completed: true, passed: true, secondDomain: true }, { completed: true, passed: true, missing: true }]) {
    const path = await fixture(options).service.getPath('learner'); if (!path.configured) return assert.fail('path')
    assert.equal(path.allCompleted, false); assert.equal(path.canAdvance, false)
  }
})
test('professional completion is terminal with no invented level', async () => {
  const path = await fixture({ completed: true, passed: true, final: true }).service.getPath('learner')
  if (!path.configured) return assert.fail('path')
  assert.equal(path.allCompleted, true); assert.equal(path.finalLevel, true); assert.equal(path.nextLevel, null); assert.equal(path.canAdvance, false)
})
test('latest failed assessment supersedes an earlier pass, and unavailable next content blocks promotion', async () => {
  const f = fixture({ completed: true, passed: true })
  f.db.examAttempt.findMany = async () => [
    { id: 'new', examId: 'exam-d', passed: false, scorePercent: 50, submittedAt: new Date('2026-10-24T04:00:00Z') },
    { id: 'old', examId: 'exam-d', passed: true, scorePercent: 90, submittedAt: new Date('2026-10-24T03:00:00Z') },
  ]
  const failed = await f.service.getPath('learner'); if (!failed.configured) return assert.fail('path')
  assert.equal(failed.domains[0].state, 'review_needed'); assert.equal(failed.canAdvance, false)
  const nextMissing = fixture({ completed: true, passed: true })
  const read = nextMissing.db.lesson.findMany
  nextMissing.db.lesson.findMany = (query: any) => query.where.levelId === 'advanced' ? [] : read(query)
  const path = await nextMissing.service.getPath('learner'); if (!path.configured) return assert.fail('path')
  assert.equal(path.allCompleted, true); assert.equal(path.nextLevel, null); assert.equal(path.canAdvance, false)
})
