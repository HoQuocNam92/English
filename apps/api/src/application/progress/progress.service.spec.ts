import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { ProgressService } from './progress.service'

test('opening a lesson starts it once and cannot reset a completed lesson from another tab', async () => {
  let row: any = null
  const db: any = { learningProgress: {
    upsert: async ({ create, update }: any) => { if (!row) row = { ...create, completionPercent: 0 }; else Object.assign(row, update); return row },
    updateMany: async ({ data }: any) => { if (row.status === 'not_started' && row.completionPercent < 100) Object.assign(row, data); return { count: 0 } },
    findUnique: async () => row,
  } }
  db.user = { findFirst: async () => ({ learnerProfile: { id: 'profile' } }) }
  db.lesson = { findUnique: async () => ({ id: 'lesson' }) }
  db.$transaction = async (run: any) => run(db)
  const service = new ProgressService(db)
  const request: any = { resourceType: 'lesson', resourceId: 'lesson', status: 'in_progress' }
  assert.equal((await service.upsertProgress('learner', request))?.status, 'in_progress')
  row.status = 'completed'; row.completionPercent = 100; row.completedAt = new Date()
  const completedAt = row.completedAt
  await service.upsertProgress('learner', request)
  assert.equal(row.status, 'completed'); assert.equal(row.completionPercent, 100)
  assert.equal(row.completedAt, completedAt)
})

function fixture(goal: 'vocabulary' | 'certification' | 'both' | null, overrides: Record<string, any> = {}) {
  const profile = { learningGoal: goal, certGoals: goal === 'certification' || goal === 'both' ? [{ certificateId: 'cert-1', certificate: { code: 'AWS', name: 'AWS' } }] : [], dailyVocabularyTarget: 10, weeklyExamTarget: 2, level: { name: 'Intermediate', code: 'B1' } }
  const prisma = {
    user: { findFirst: async () => ({ id: 'learner', learnerProfile: { id: 'profile' } }) },
    learnerProfile: { findUnique: async () => profile },
    learningProgress: { findMany: async () => overrides.progress ?? [] },
    examAttempt: { findMany: async (args: any) => { overrides.attemptQueries?.push(args); return typeof args.where.exam?.certificateId === 'string' ? (overrides.certAttempts ?? []) : args.select ? (overrides.quizActivity ?? []) : (overrides.recentAttempts ?? []) } },
    exam: { findMany: async (args: any) => { overrides.examQueries?.push(args); return overrides.publishedExams ?? [] } },
    vocabularyProgress: { findMany: async () => overrides.vocabularyActivity ?? [] },
    domain: { findMany: async () => [] },
    certificate: { findMany: async (args: any) => { overrides.certificateQueries?.push(args); return args.where.OR ? (overrides.trackedCertificates ?? []) : [] } },
    lesson: { findMany: async (args: any) => { overrides.queries?.push(args); return args.where?.OR ? (overrides.certificateLessons ?? []) : [] } },
  }
  return new ProgressService(prisma as any)
}

test('new vocabulary learner receives vocabulary milestones and no certification quiz milestone', async () => {
  const result = await fixture('vocabulary').getMyProgress('learner')
  assert.deepEqual(result.milestones.map(item => item.id), ['first_lesson', 'learn_words', 'seven_day_streak'])
  assert.equal(result.gamification.totalXp, 0)
  assert.equal(result.gamification.unlockedCount, 0)
  assert.equal(result.gamification.totalMilestones, 3)
})

test('certification goal receives quiz and domain milestones', async () => {
  const result = await fixture('certification').getMyProgress('learner')
  assert.deepEqual(result.milestones.map(item => item.id), ['first_lesson', 'complete_quizzes', 'seven_day_streak', 'complete_domain'])
  assert.equal(result.certProgress.length, 1)
})

test('combined goal receives both vocabulary and certification milestones', async () => {
  const result = await fixture('both').getMyProgress('learner')
  assert.deepEqual(result.milestones.map(item => item.id), ['first_lesson', 'learn_words', 'complete_quizzes', 'seven_day_streak', 'complete_domain'])
})

test('completed lesson unlocks first milestone even when status is in_progress at 100 percent', async () => {
  const result = await fixture('vocabulary', { progress: [{ resourceType: 'lesson', resourceId: 'lesson-1', status: 'in_progress', completionPercent: 100 }] }).getMyProgress('learner')
  assert.equal(result.milestones.find(item => item.id === 'first_lesson')?.unlocked, true)
  assert.equal(result.gamification.totalXp, 50)
})

test('vocabulary activity unlocks first milestone and clamps weekly vocabulary progress', async () => {
  const activity = Array.from({ length: 75 }, () => ({ createdAt: new Date('2026-01-01') }))
  const result = await fixture('vocabulary', { vocabularyActivity: activity }).getMyProgress('learner')
  const words = result.milestones.find(item => item.id === 'learn_words')
  assert.equal(words?.current, 70)
  assert.equal(words?.progressPercent, 100)
  assert.equal(words?.unlocked, true)
  assert.equal(result.gamification.totalXp, 200)
})

test('quiz attempts unlock quiz milestone at goal threshold', async () => {
  const dates = [{ startedAt: new Date('2026-01-01') }, { startedAt: new Date('2026-01-02') }]
  const result = await fixture('certification', { quizActivity: dates }).getMyProgress('learner')
  assert.equal(result.milestones.find(item => item.id === 'complete_quizzes')?.unlocked, true)
})


test('summary counts completed lessons and studied words without mixing certificate progress', async () => {
  const result = await fixture('both', { progress: [
    { resourceType: 'lesson', resourceId: 'l1', status: 'completed', completionPercent: 100 },
    { resourceType: 'lesson', resourceId: 'l2', status: 'in_progress', completionPercent: 50 },
    { resourceType: 'lesson', resourceId: 'l3', status: 'not_started', completionPercent: 0 },
    { resourceType: 'certificate', resourceId: 'cert-1', status: 'completed', completionPercent: 100 },
  ], vocabularyActivity: [{}, {}, {}] }).getLearnerProgress('learner')
  assert.equal(result.summary.completedLessons, 1)
  assert.equal(result.summary.startedLessons, 2)
  assert.equal(result.summary.studiedWords, 3)
  assert.equal(result.summary.overallCompletionPercent, 75)
})

test('certificate without lessons or attempts starts at zero', async () => {
  const result = await fixture('certification').getMyProgress('learner')
  assert.equal(result.summary.completedLessons, 0)
  assert.equal(result.summary.overallCompletionPercent, 0)
  assert.equal(result.certProgress[0].completedLessons, 0)
  assert.equal(result.certProgress[0].totalLessons, 0)
  assert.equal(result.certProgress[0].completionPercent, 0)
  assert.equal(result.certProgress[0].avgScore, null)
})

test('certificate completion uses only published review lessons linked to that certificate', async () => {
  const queries: any[] = []
  const result = await fixture('certification', { queries, certificateLessons: [{ id: 'review-1' }, { id: 'review-2' }], progress: [
    { resourceType: 'lesson', resourceId: 'review-1', status: 'completed', completionPercent: 100 },
    { resourceType: 'lesson', resourceId: 'unrelated', status: 'completed', completionPercent: 100 },
  ] }).getMyProgress('learner')
  assert.equal(result.certProgress[0].completedLessons, 1)
  assert.equal(result.certProgress[0].totalLessons, 2)
  assert.equal(result.certProgress[0].completionPercent, 50)
  const query = queries.find(item => item.where.OR)
  assert.equal(query.where.status, 'published')
  assert.equal(query.where.type, 'certification_review')
  assert.equal(query.where.OR[0].certificates.some.certificateId, 'cert-1')
  assert.equal(query.where.OR[1].certificationTopics.some.topic.certificateId, 'cert-1')
})

test('admin progress propagates storage failures instead of returning fabricated zeros', async () => {
  const service = new ProgressService({ user: { findFirst: async () => { throw new Error('database offline') } } } as any)
  await assert.rejects(() => service.getLearnerProgress('learner'), /database offline/)
})

test('completed exams count outside selected goals and beyond recent history', async () => {
  const certificateQueries: any[] = [], attemptQueries: any[] = [], examQueries: any[] = []
  const result = await fixture('vocabulary', {
    certificateQueries, attemptQueries, examQueries,
    trackedCertificates: [{ id: 'cert-other', code: 'A2', name: 'English A2' }],
    publishedExams: [{ id: 'exam-1' }, { id: 'exam-2' }, { id: 'exam-3' }],
    certAttempts: [{ examId: 'exam-1', scorePercent: 0 }, { examId: 'exam-2', scorePercent: 80 }],
    recentAttempts: [],
  }).getMyProgress('learner')
  const certificate = result.certProgress[0]
  assert.equal(certificate.certificateId, 'cert-other')
  assert.equal(certificate.examAttempts, 2)
  assert.equal(certificate.completedExams, 2)
  assert.equal(certificate.totalExams, 3)
  assert.equal(certificate.completionPercent, 67)
  assert.equal(certificate.avgScore, 40)
  assert.equal(certificate.hasStarted, true)
  const trackedQuery = certificateQueries.find(query => query.where.OR)
  assert.equal(trackedQuery.where.OR[1].exams.some.attempts.some.learnerId, 'learner')
  const attemptQuery = attemptQueries.find(query => query.where.exam?.certificateId === 'cert-other')
  assert.equal(attemptQuery.where.learnerId, 'learner')
  assert.deepEqual(attemptQuery.where.status.in, ['graded', 'submitted'])
  assert.equal(attemptQuery.take, undefined)
  assert.equal(examQueries[0].where.status, 'published')
  assert.deepEqual(examQueries[0].where.questions, { some: {} })
})

test('retakes and archived exams do not inflate completion; ungraded scores remain absent', async () => {
  const result = await fixture('certification', {
    publishedExams: [{ id: 'exam-1' }, { id: 'exam-2' }],
    certAttempts: [
      { examId: 'exam-1', scorePercent: 0 },
      { examId: 'exam-1', scorePercent: 60 },
      { examId: 'exam-1', scorePercent: null },
      { examId: 'archived', scorePercent: null },
    ],
  }).getMyProgress('learner')
  assert.equal(result.certProgress[0].examAttempts, 4)
  assert.equal(result.certProgress[0].completedExams, 1)
  assert.equal(result.certProgress[0].completionPercent, 50)
  assert.equal(result.certProgress[0].avgScore, 30)
})

test('overall certificate completion combines review lessons and completed published exams', async () => {
  const result = await fixture('both', {
    certificateLessons: [{ id: 'review-1' }, { id: 'review-2' }],
    progress: [{ resourceType: 'lesson', resourceId: 'review-1', status: 'completed', completionPercent: 100 }],
    publishedExams: [{ id: 'exam-1' }, { id: 'exam-2' }, { id: 'exam-3' }],
    certAttempts: [{ examId: 'exam-1', scorePercent: 0 }, { examId: 'exam-2', scorePercent: null }],
  }).getMyProgress('learner')
  const certificate = result.certProgress[0]
  assert.equal(certificate.lessonCompletionPercent, 50)
  assert.equal(certificate.totalItems, 5)
  assert.equal(certificate.completedItems, 3)
  assert.equal(certificate.completionPercent, 60)
})
