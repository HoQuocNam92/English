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
  assert.equal(result.questions.length, 1)
  assert.deepEqual(queries[1].where.vocabProgress, { some: { learnerId: 'learner', lastRating: { not: null } } })
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
  assert.deepEqual(query.where.vocabProgress, { none: { learnerId: 'learner', lastRating: { not: null } } })
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


test('quiz only accepts the current learner published and rated words', async () => {
  const queries: any[] = []
  const service = new VocabStudyService({ vocabulary: { findMany: async (args: any) => {
    queries.push(args)
    return queries.length === 1 ? Array.from({ length: 5 }, (_, i) => ({ id: `word-${i}`, term: `Term ${i}`, definitionVi: `Nghĩa ${i}`, examples: [] })) : []
  } } } as any)
  const ids = Array.from({ length: 5 }, (_, i) => `word-${i}`)
  const result = await service.generateQuiz('user-A', ids)
  assert.equal(result.questions.length, 5)
  assert.deepEqual(new Set(result.questions.map(q => q.vocabularyId)), new Set(ids))
  assert.equal(queries[0].where.status, 'published')
  assert.deepEqual(queries[0].where.vocabProgress.some, { learnerId: 'user-A', lastRating: { in: ['easy', 'medium', 'hard'] }, lastReviewAt: { not: null } })
})

test('unseen or another learner words reject quiz before loading distractors', async () => {
  let queries = 0
  const service = new VocabStudyService({ vocabulary: { findMany: async () => { queries++; return [] } } } as any)
  await assert.rejects(() => service.generateQuiz('user-B', ['word-studied-by-A']))
  assert.equal(queries, 1)
})

test('certificate session scopes topic and learner, review only takes due studied words', async () => {
  let query: any
  const service = new VocabStudyService({
    certificationTopic: { findUnique: async () => ({ id: 'topic' }) },
    vocabulary: { findMany: async (args: any) => { query = args; return [] } },
    vocabularyProgress: { count: async () => 0 },
    learnerProfile: { findUnique: async () => ({ dailyVocabularyTarget: 10 }) },
  } as any)
  await service.getStudySession('user-A', { topicId: 'topic' })
  assert.deepEqual(query.where.certificationTopics, { some: { topicId: 'topic' } })
  assert.equal(query.where.vocabProgress.none.learnerId, 'user-A')
  await service.getStudySession('user-B', { topicId: 'topic', reviewOnly: true })
  assert.equal(query.where.vocabProgress.some.learnerId, 'user-B')
  assert.deepEqual(query.where.vocabProgress.some.lastRating.in, ['easy', 'medium', 'hard'])
  assert.ok(query.where.vocabProgress.some.nextReviewAt.lte instanceof Date)
})

test('certificate progress never includes another learner progress', async () => {
  let query: any
  const service = new VocabStudyService({ certificationTopic: { findMany: async (args: any) => {
    query = args
    return [{ id: 'topic', vocabularies: [{ vocabulary: { id: 'word', vocabProgress: [] } }] }]
  } } } as any)
  const result = await service.getCertificateStudyProgress('user-B', 'certificate')
  assert.equal(query.where.certificateId, 'certificate')
  assert.equal(query.select.vocabularies.select.vocabulary.select.vocabProgress.where.learnerId, 'user-B')
  assert.deepEqual(result.topics, [{ topicId: 'topic', total: 1, studied: 0, due: 0 }])
})

test('answer cannot create progress for an unseen word', async () => {
  const service = new VocabStudyService({ vocabularyProgress: { findUnique: async () => null } } as any)
  await assert.rejects(() => service.submitAnswer('user-B', 'unseen', true))
})


test('quiz meanings are concise and do not leak the full English dictionary explanation', async () => {
  let call = 0
  const service = new VocabStudyService({ vocabulary: { findMany: async () => ++call === 1
    ? [{ id: 'sample', term: 'Sample interface', definitionVi: 'Giao diện giữa các ứng dụng. ' + 'Chi tiết dài. '.repeat(60), definitionEn: 'Long English explanation', examples: [] }]
    : [{ id: 'wrong', term: 'Cloud', definitionVi: 'Tài nguyên máy tính qua mạng.' }]
  } } as any)
  const { questions } = await service.generateQuiz('learner', ['sample'])
  assert.equal(questions.length, 1)
  assert.equal(questions[0].answer, 'Giao diện giữa các ứng dụng.')
  assert.ok(questions[0].options.every(text => text.length <= 180))
  assert.ok(questions[0].optionExplanations.every(item => !item.explanation.includes('Long English')))
  assert.match(questions[0].optionExplanations.find(item => !item.correct)!.explanation, /Cloud/)
})

test('unresolved cross references and oversized definitions are excluded from quiz choices', async () => {
  let call = 0
  const service = new VocabStudyService({ vocabulary: { findMany: async () => ++call === 1
    ? [{ id: 'sample', term: 'API', definitionVi: 'Giao diện giữa các ứng dụng.', examples: [] }]
    : [{ id: 'bad', term: 'Unknown', definitionVi: 'Xem từ khác.' }, { id: 'long', term: 'Long', definitionVi: 'Nội dung '.repeat(100) }, { id: 'valid', term: 'Cloud', definitionVi: 'Tài nguyên máy tính qua mạng.' }]
  } } as any)
  const { questions } = await service.generateQuiz('learner', ['sample'])
  assert.equal(questions[0].options.length, 2)
  assert.ok(questions[0].options.every(text => !text.startsWith('Xem')))
})


test('dashboard custom date range includes both dates and remains scoped to the learner', async () => {
  let query: any
  const service = new VocabStudyService({ vocabularyProgress: {
    count: async () => 0,
    findMany: async (args: any) => { query = args; return [{ lastReviewAt: new Date('2025-01-03T23:59:00Z') }] },
  } } as any)
  const result = await service.getDashboard('A', '2025-01-01', '2025-01-03')
  assert.equal(query.where.learnerId, 'A')
  assert.equal(query.where.lastReviewAt.gte.toISOString(), '2025-01-01T00:00:00.000Z')
  assert.equal(query.where.lastReviewAt.lte.toISOString(), '2025-01-03T23:59:59.999Z')
  assert.deepEqual(result.heatmap, [{ date: '2025-01-03', count: 1 }])
})

test('dashboard rejects invalid, incomplete and reversed custom date ranges before queries', async () => {
  const service = new VocabStudyService({} as any)
  for (const [from, to] of [['2025-02-30', '2025-03-01'], ['2025-01-04', '2025-01-03'], ['2025-01-01', undefined], ['2020-01-01', '2025-01-01']]) {
    await assert.rejects(() => service.getDashboard('A', from, to))
  }
})
