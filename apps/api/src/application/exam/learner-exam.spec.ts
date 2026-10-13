import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { ExamsService } from './exam.service'
function fixture(o: any = {}) {
  const exam = { id: 'exam', status: 'published', kind: 'practice', certificateId: 'cert', topics: ['1.1'], maxAttempts: 5, durationMinutes: 30, _count: { questions: 1 }, questions: [{ weight: 1, question: { id: 'q', points: 1, options: [] } }], ...o.exam }
  let writes = 0
  const db: any = {
    exam: { findUnique: async () => exam },
    certificationTopic: { findMany: async () => o.topics ?? [{ code: '1.1', lessons: [{ lessonId: 'lesson' }] }] },
    lesson: { findMany: async () => o.lessons ?? [{ id: 'lesson' }] },
    learningProgress: { count: async ({ where }: any) => { assert.equal(where.learnerId, 'learner'); return o.completed ?? 1 } },
    examAttempt: {
      findMany: async ({ where }: any) => { assert.deepEqual(where, { examId: 'exam', learnerId: 'learner' }); return o.attempts ?? [{ id: 'result', status: 'graded', scorePercent: 70 }] },
      count: async () => o.used ?? 1, updateMany: async () => ({}), findFirst: async () => o.active ?? null,
      create: async ({ data }: any) => { writes++; return { ...data, id: 'new' } },
    },
    $transaction: async (run: any) => run(db),
  }
  return { service: new ExamsService(db), writes: () => writes }
}
test('one of five used attempts permits retaking and retains the latest result', async () => {
  const { service, writes } = fixture()
  const result = await service.getEligibility('exam', 'learner')
  assert.equal(result.canStart, true); assert.equal(result.remainingAttempts, 4); assert.equal(result.latestAttempt.id, 'result')
  await service.startAttempt('exam', 'learner'); assert.equal(writes(), 1)
})
test('practice prerequisites block listing and starting, including exams without topic mappings', async () => {
  for (const exam of [{ topics: ['1.1'] }, { topics: [] }]) {
    const { service, writes } = fixture({ exam, completed: 0 })
    assert.equal((await service.getEligibility('exam', 'learner')).canStart, false)
    await assert.rejects(() => service.startAttempt('exam', 'learner'), /hoàn thành bài học/); assert.equal(writes(), 0)
  }
})
test('missing topics or published lessons cannot bypass prerequisites', async () => {
  for (const o of [{ topics: [] }, { topics: [{ code: '1.1', lessons: [] }] }, { exam: { topics: [] }, lessons: [] }]) {
    const { service, writes } = fixture(o)
    assert.equal((await service.getEligibility('exam', 'learner')).canStart, false)
    await assert.rejects(() => service.startAttempt('exam', 'learner'), /chưa có bài học/); assert.equal(writes(), 0)
  }
})
test('mock exams are independent of lesson completion', async () => {
  const { service } = fixture({ exam: { kind: 'mock_exam' }, completed: 0 })
  assert.equal((await service.getEligibility('exam', 'learner')).canStart, true)
  await service.startAttempt('exam', 'learner')
})
test('exhausting the attempt limit blocks retakes but preserves results', async () => {
  const { service, writes } = fixture({ used: 5, attempts: Array.from({ length: 5 }, (_, i) => ({ id: `a${i}`, status: 'graded' })) })
  const result = await service.getEligibility('exam', 'learner')
  assert.equal(result.canStart, false); assert.equal(result.remainingAttempts, 0); assert.ok(result.latestAttempt)
  await assert.rejects(() => service.startAttempt('exam', 'learner'), /hết 5 lượt/); assert.equal(writes(), 0)
})
test('expired attempts count toward limits and active attempts resume without new writes', async () => {
  const expired = { id: 'old', status: 'in_progress', expiresAt: new Date(0) }
  const active = { id: 'active', status: 'in_progress', expiresAt: new Date(Date.now() + 60000), questionsSnapshot: [] }
  const { service, writes } = fixture({ attempts: [active, expired], active })
  const result = await service.getEligibility('exam', 'learner')
  assert.equal(result.usedAttempts, 1); assert.equal(result.activeAttemptId, 'active')
  assert.equal((await service.startAttempt('exam', 'learner')).id, 'active'); assert.equal(writes(), 0)
})
