import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { VocabStudyService } from './vocab-study.service'

test('quiz refuses missing IDs without querying all words', async () => {
  let queried = false
  const service = new VocabStudyService({ vocabulary: { findMany: async () => { queried = true; return [] } } } as any)
  for (const ids of [undefined, [], ['']]) await assert.rejects(() => service.generateQuiz('learner', ids as any))
  assert.equal(queried, false)
})

test('distractors never become quiz questions', async () => {
  const queries: any[] = []
  const service = new VocabStudyService({ vocabulary: { findMany: async (args: any) => {
    queries.push(args)
    return queries.length === 1 ? [{ id: 'studied', term: 'API', definitionVi: 'Giao diện', examples: [] }] : [{ id: 'unseen', term: 'Cloud', definitionVi: 'Đám mây' }]
  } } } as any)
  const result = await service.generateQuiz('learner', ['studied'], { studied: 2 })
  assert.deepEqual(queries[0].where.id.in, ['studied'])
  assert.equal(result.questions.length, 2)
  assert.ok(result.questions.every(question => question.vocabularyId === 'studied'))
})

test('history requires study evidence and paginates within the current learner', async () => {
  let query: any
  let countWhere: any
  const service = new VocabStudyService({ vocabularyProgress: {
    count: async ({ where }: any) => { countWhere = where; return 25 },
    findMany: async (args: any) => { query = args; return [] },
  } } as any)
  const result = await service.getHistory('learner', 'all', 'easy', 2, 10)
  assert.equal(query.where.learnerId, 'learner')
  assert.deepEqual(query.where.lastReviewAt, { not: null })
  assert.equal(query.where.lastRating, 'easy')
  assert.equal(query.where.OR.length, 3)
  assert.deepEqual(query.where, countWhere)
  assert.equal(query.skip, 10)
  assert.equal(query.take, 10)
  assert.deepEqual(result.meta, { page: 2, limit: 10, total: 25, totalPages: 3 })
  assert.equal((await service.getHistory('learner', 'all', 'all', 999, 10)).meta.page, 3)
})

test('recommended study session only selects linked, published, unstudied words', async () => {
  let query: any
  const service = new VocabStudyService({
    lesson: { findUnique: async () => ({ status: 'published', vocabularies: [{ vocabularyId: 'linked' }] }) },
    vocabulary: { findMany: async (args: any) => { query = args; return [] } },
    vocabularyProgress: { count: async () => 0 },
    learnerProfile: { findUnique: async () => ({ dailyVocabularyTarget: 10 }) },
  } as any)
  await service.getStudySession('learner', { sourceLessonId: 'lesson' })
  assert.deepEqual(query.where.id, { in: ['linked'] })
  assert.equal(query.where.status, 'published')
  assert.deepEqual(query.where.vocabProgress, { none: { learnerId: 'learner' } })
})

test('recommendations never fall back to all words when lesson is unavailable', async () => {
  let queried = false
  const service = new VocabStudyService({
    lesson: { findUnique: async () => null },
    vocabulary: { findMany: async () => { queried = true; return [] } },
  } as any)
  await assert.rejects(() => service.getStudySession('learner', { sourceLessonId: 'missing' }))
  assert.equal(queried, false)
})

test('vocabulary recommendations use the exact profile level and selected domains', async () => {
  const queries: any[] = []
  const service = new VocabStudyService({
    learnerProfile: { findUnique: async () => ({ learningGoal: 'vocabulary', level: { id: 'intermediate-id', code: 'intermediate' }, domains: [{ domain: { id: 'software-id', code: 'software' } }], certGoals: [] }) },
    vocabulary: {
      count: async (args: any) => { queries.push(args); return args.where.vocabProgress ? 7 : 10 },
      findMany: async (args: any) => { queries.push(args); return [{ id: 'word', term: 'API' }] },
    },
  } as any)
  const result = await service.getRecommendations('learner')
  assert.equal(result.groups.length, 1)
  assert.equal(result.groups[0].remaining, 7)
  assert.ok(queries.every(query => query.where.levelId === 'intermediate-id'))
  assert.deepEqual(queries[0].where.OR, [{ domainId: 'software-id' }, { domains: { some: { domainId: 'software-id' } } }])
  assert.deepEqual(queries[2].where.vocabProgress, { none: { learnerId: 'learner' } })
})
