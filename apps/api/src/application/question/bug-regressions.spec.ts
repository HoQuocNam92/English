import { test } from 'node:test'
import { strict as assert } from 'node:assert'
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

test('test results do not invent a zero duration or submission time when timestamps are missing', async () => {
  const service = new TaxonomyService({ examAttempt: { findMany: async () => [{ id: 'missing', createdAt: new Date(), submittedAt: null, startedAt: null, exam: {} }, { id: 'timed', startedAt: new Date('2026-10-07T01:00:00Z'), submittedAt: new Date('2026-10-07T01:03:42Z'), exam: {} }], count: async () => 2 } } as any)
  const result: any = await service.getTestResults({})
  assert.equal(result.data[0].timeSpentSeconds, null)
  assert.equal(result.data[0].completedAt, null)
  assert.equal(result.data[1].timeSpentSeconds, 222)
})
