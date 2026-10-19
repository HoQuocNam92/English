import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { ExamsService } from '../exam/exam.service'
import { QuestionsService } from './question.service'
import { TaxonomyService } from '../taxonomy/taxonomy.service'

test('questions search prompt and context, and selected exam filters both rows and count', async () => {
  const queries: any[] = []
  const service = new QuestionsService({ question: { findMany: async (q: any) => { queries.push(q); return [] }, count: async (q: any) => { queries.push(q); return 0 } } } as any)
  const examId = '4936f4ab-59a9-4c51-b3da-61402e3be245'
  await service.findAll({ search: 'cloud', examId })
  for (const q of queries) {
    assert.deepEqual(q.where.examQuestions, { some: { examId } })
    assert.deepEqual(q.where.OR, [{ prompt: { contains: 'cloud', mode: 'insensitive' } }, { context: { contains: 'cloud', mode: 'insensitive' } }])
  }
  queries.length = 0
  await service.findAll({ examId: '' })
  assert.equal(queries[0].where.examQuestions, undefined)
})

test('question pages use a unique tie breaker for questions created together', async () => {
  const records = ['c', 'a', 'b'].map(id => ({ id, createdAt: new Date('2026-10-01T00:00:00Z') }))
  const service = new QuestionsService({ question: {
    findMany: async ({ orderBy, skip, take }: any) => [...records].sort((a: any, b: any) => {
      for (const order of Array.isArray(orderBy) ? orderBy : [orderBy]) {
        const [field, direction] = Object.entries(order)[0]
        const compared = a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0
        if (compared) return direction === 'desc' ? -compared : compared
      }
      return 0
    }).slice(skip, skip + take),
    count: async () => records.length,
  } } as any)
  const pages = await Promise.all([1, 2, 3].map(page => service.findAll({ page, limit: 1 })))
  assert.deepEqual(pages.flatMap(page => page.data.map((item: any) => item.id)), ['c', 'b', 'a'])
})

test('test results do not invent a zero duration or submission time when timestamps are missing', async () => {
  const service = new TaxonomyService({ examAttempt: { findMany: async () => [{ id: 'missing', createdAt: new Date(), submittedAt: null, startedAt: null, exam: {} }, { id: 'timed', startedAt: new Date('2026-10-07T01:00:00Z'), submittedAt: new Date('2026-10-07T01:03:42Z'), exam: {} }], count: async () => 2 } } as any)
  const result: any = await service.getTestResults({})
  assert.equal(result.data[0].timeSpentSeconds, null)
  assert.equal(result.data[0].completedAt, null)
  assert.equal(result.data[1].timeSpentSeconds, 222)
})


test('attempt list and detail retain fractional elapsed seconds and missing timestamps', async () => {
  const attempts = [
    { id: 'timed', learnerId: 'learner', startedAt: new Date('2026-10-07T01:00:00Z'), submittedAt: new Date('2026-10-07T01:00:59.900Z'), exam: {}, questionsSnapshot: [] },
    { id: 'missing', learnerId: 'learner', startedAt: null, submittedAt: null, exam: {}, questionsSnapshot: [] },
  ]
  const prisma: any = { examAttempt: { findMany: async () => attempts, count: async () => 2, findUnique: async ({ where }: any) => attempts.find(a => a.id === where.id) } }
  const list: any = await new TaxonomyService(prisma).getTestResults({})
  const detail = new ExamsService(prisma)
  assert.equal(list.data[0].timeSpentSeconds, 59.9)
  assert.equal((await detail.getAttemptById('timed', 'learner')).timeSpentSeconds, 59.9)
  assert.equal((await detail.getAttemptById('missing', 'learner')).timeSpentSeconds, null)
})
