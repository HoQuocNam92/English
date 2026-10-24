import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { buildContinuationPlans, ContinuationPlanService } from './continuation-plan.service'

const path: any = { configured: true, allCompleted: true, finalLevel: true, level: { code: 'professional' }, dailyMinutes: 30, domains: [{ id: 'd', code: 'SOFTWARE_ENG', name: 'Software', assessment: { scorePercent: 80 } }] }
function fixture(eligible = true) {
  const records: any[] = []; let sequence = 0
  const db: any = {
    vocabularyProgress: { findMany: async () => [{ nextReviewAt: new Date(0), lastRating: 'hard', correctCount: 1, wrongCount: 5, vocabulary: { term: 'Contract', domainId: 'd' } }] },
    lesson: { findMany: async () => [{ id: 'lesson', title: 'API design', estimatedMinutes: 25 }] },
    certificationTopic: { findMany: async () => [] }, exam: { findMany: async () => [] }, learningProgress: { findMany: async () => [] },
    placementAssessment: {
      findFirst: async ({ where }: any) => [...records].reverse().find(record => record.learnerId === where.learnerId) ?? null,
      create: async ({ data }: any) => { const record = { id: `record-${++sequence}`, ...data }; records.push(record); return record },
      update: async ({ where, data }: any) => { const record = records.find(record => record.id === where.id); Object.assign(record, data); return record },
    },
  }
  db.$transaction = async (run: any) => run(db)
  const learningPath: any = { getPath: async () => ({ ...path, allCompleted: eligible }) }
  return { db, records, service: new ContinuationPlanService(db, learningPath) }
}

test('recommendations use real weak words and available lessons, without inventing empty certificate plans', () => {
  const plans = buildContinuationPlans(path, [{ nextReviewAt: new Date(0), lastRating: 'hard', wrongCount: 3, correctCount: 0, vocabulary: { term: 'Contract', domainId: 'd' } }], [{ id: 'real', title: 'Real case', estimatedMinutes: 20, completed: true }], [], [])
  assert.deepEqual(plans.map(plan => plan.id), ['review', 'application'])
  assert.equal(plans[0].durationDays, 14); assert.equal(plans[0].steps.length, 7)
  assert.match(plans[0].steps[0].description, /Contract/)
  assert.equal(plans[1].steps[0].href, '/learn/lessons/real')
  assert.match(plans[1].steps[0].title, /Ôn và vận dụng/)
  assert.ok(plans.every(plan => plan.steps.every(step => step.day >= 1 && step.day <= plan.durationDays)))
})
test('certificate schedule puts all topic prerequisites before its practice, and hides topics without practice', () => {
  const topic = { id: 'topic', code: '1.1', name: 'Cloud', certificateDomain: { certificate: { id: 'cert', name: 'Certificate', isActive: true } }, lessons: [{ lesson: { id: 'a', title: 'A', estimatedMinutes: 20, domainId: 'd' } }, { lesson: { id: 'b', title: 'B', estimatedMinutes: 20, domainId: 'd' } }] }
  const plans = buildContinuationPlans(path, [], [], [topic], [{ id: 'exam', certificateId: 'cert', topics: ['1.1'], durationMinutes: 15 }])
  const cert = plans.find(plan => plan.kind === 'certificate')!
  assert.equal(cert.steps.length, 3); assert.equal(cert.steps.at(-1).kind, 'practice')
  assert.match(cert.steps[0].href, /lessonId=a/); assert.match(cert.steps[1].href, /lessonId=b/)
  assert.equal(buildContinuationPlans(path, [], [], [topic], []).some(plan => plan.kind === 'certificate'), false)
})
test('unfinished professional course cannot select or record a continuation plan', async () => {
  const f = fixture(false)
  assert.equal((await f.service.getOptions('learner')).eligible, false)
  await assert.rejects(() => f.service.choose('learner', 'review'))
  await assert.rejects(() => f.service.completeStep('learner', 'missing', 'review-1'))
  assert.equal(f.records.length, 0)
})
test('selection persists in existing JSON, remains outside submitted assessments, and does not invent a grade', async () => {
  const f = fixture()
  await f.service.choose('learner', 'review')
  const options = await f.service.getOptions('learner')
  assert.equal(options.active?.plan.id, 'review'); assert.equal(f.records.length, 1)
  assert.equal(f.records[0].submittedAt, null); assert.deepEqual(f.records[0].questions, [])
  assert.equal(f.records[0].result.kind, 'continuation-v1'); assert.equal(f.records[0].result.scorePercent, undefined)
  await f.service.choose('learner', 'review'); assert.equal(f.records.length, 1)
})
test('completion is idempotent, rejects foreign tasks and stale tabs, and retains prior plan history', async () => {
  const f = fixture(); const chosen = await f.service.choose('learner', 'review'); const id = chosen.active!.recordId
  await f.service.completeStep('learner', id, 'review-1')
  const again = await f.service.completeStep('learner', id, 'review-1')
  assert.deepEqual(again.completedStepIds, ['review-1'])
  await assert.rejects(() => f.service.completeStep('learner', id, 'invented'))
  await assert.rejects(() => f.service.completeStep('other-user', id, 'review-2'))
  await f.service.choose('learner', 'application')
  await assert.rejects(() => f.service.completeStep('learner', id, 'review-2'))
  assert.equal(f.records.length, 2); assert.deepEqual(f.records[0].result.completedStepIds, ['review-1'])
})
test('unavailable or client-supplied plan URLs cannot be selected', async () => {
  const f = fixture()
  await assert.rejects(() => f.service.choose('learner', 'certificate-invented'))
  await assert.rejects(() => f.service.choose('learner', 'https://outside.invalid'))
  assert.equal(f.records.length, 0)
})
test('completed review cycle can restart without erasing its previous record', async () => {
  const f = fixture(); const first = await f.service.choose('learner', 'review')
  for (const step of first.active!.plan.steps) await f.service.completeStep('learner', first.active!.recordId, step.id)
  const next = await f.service.choose('learner', 'review')
  assert.notEqual(next.active!.recordId, first.active!.recordId)
  assert.deepEqual(next.active!.completedStepIds, [])
  assert.equal(f.records[0].result.completedStepIds.length, 7)
})
test('a multi-topic exam is not placed before another topic prerequisite outside the selected schedule', () => {
  const certificate = { id: 'cert', name: 'Certificate', isActive: true }
  const topics = [{ id: 'a', code: '1', name: 'A', certificateDomain: { certificate }, lessons: [{ lesson: { id: 'a', title: 'A', domainId: 'd', estimatedMinutes: 20 } }] }, { id: 'b', code: '2', name: 'B', certificateDomain: { certificate }, lessons: [] }]
  const plans = buildContinuationPlans(path, [], [], topics, [{ id: 'combined', certificateId: 'cert', topics: ['1', '2'], durationMinutes: 30 }])
  assert.equal(plans.some(plan => plan.kind === 'certificate'), false)
})
