import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { CertificationStudyService } from './certification-study.service'
import { LessonsService } from './lesson.service'
import { SelectionTranslationService } from '../vocabulary/selection-translation.service'

function translationService(words: any, settings: Record<string, string> = {}) {
  return new SelectionTranslationService({ vocabulary: words } as any, { get: (key: string) => settings[key] } as any)
}

test('selection translates exact published dictionary entry without a provider call', async () => {
  let query: any
  const service = translationService({ findFirst: async (args: any) => { query = args; return { definitionVi: 'Co giãn', definitionEn: 'Changes with demand' } } })
  const result = await service.translate('  Elasticity  ')
  assert.equal(result.text, 'Elasticity')
  assert.equal(result.translation, 'Co giãn')
  assert.equal(result.source, 'dictionary')
  assert.equal(query.where.status, 'published')
  assert.deepEqual(query.where.term, { equals: 'Elasticity', mode: 'insensitive' })
})

test('selection validates empty, nonstring and oversized selections before database access', async () => {
  const service = translationService({ findFirst: async () => { throw new Error('Must not query') } })
  for (const input of [null, '', '  ', 'a'.repeat(501), 'đ'.repeat(251)]) await assert.rejects(() => service.translate(input))
})

test('missing APIVN key keeps dictionary fallback available with clear unavailable result', async () => {
  const service = translationService({ findFirst: async () => null })
  const result = await service.translate('a new concept')
  assert.equal(result.translation, null)
  assert.match(result.message!, /chưa khả dụng/)
})

test('APIVN uses requested model and sends only selected text, caches repeated requests', async () => {
  const originalFetch = global.fetch
  let calls = 0
  let payload: any, endpoint: string
  global.fetch = (async (url: any, init: any) => {
    calls++; endpoint = String(url); payload = JSON.parse(init.body)
    assert.equal(init.headers.Authorization, 'Bearer test-key')
    return { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ translation: 'Cấp phát tài nguyên theo nhu cầu.', partOfSpeech: 'cụm động từ', pronunciationIpa: '/prəˈvɪʒən/' }) } }] }) } as any
  }) as any
  try {
    const service = translationService({ findFirst: async () => null }, { APIVN_API_KEY: 'test-key', APIVN_MODEL: 'gpt-6-luna', APIVN_BASE_URL: 'https://apivn.vn/v1/' })
    const result = await service.translate('Provision resources on demand')
    assert.equal(endpoint!, 'https://apivn.vn/v1/chat/completions')
    assert.equal(payload.model, 'gpt-6-luna')
    assert.deepEqual(JSON.parse(payload.messages[1].content), { text: 'Provision resources on demand', context: '' })
    assert.equal(payload.messages.length, 2)
    assert.equal(result.source, 'apivn')
    assert.equal(result.translation, 'Cấp phát tài nguyên theo nhu cầu.')
    assert.ok(!('apiKey' in result))
    await service.translate('Provision resources on demand')
    assert.equal(calls, 1)
  } finally { global.fetch = originalFetch }
})

test('provider failure does not leak credentials or response body', async () => {
  const originalFetch = global.fetch
  global.fetch = (async () => ({ ok: false, status: 401 })) as any
  try {
    const service = translationService({ findFirst: async () => null }, { APIVN_API_KEY: 'private-test-key' })
    await assert.rejects(() => service.translate('Unseen term'), error => !String(error).includes('private-test-key') && /Chưa dịch được/.test(String(error)))
  } finally { global.fetch = originalFetch }
})

test('certificate progress counts lessons rather than vocabulary and isolates learners', async () => {
  const queries: any[] = []
  const service = new CertificationStudyService({
    certificate: { findUnique: async () => ({ isActive: true }) },
    certificationTopic: { findMany: async (args: any) => {
      assert.deepEqual(args.select.lessons.where.lesson, { status: 'published', type: 'certification_review' })
      return [{ id: 'topic', lessons: [{ lesson: { id: 'lesson', title: 'Cloud knowledge', estimatedMinutes: 12 } }] }]
    } },
    learningProgress: { findMany: async (args: any) => { queries.push(args); return args.where.learnerId === 'user-A' ? [{ resourceId: 'lesson', status: 'completed' }] : [] } },
  } as any)
  const a = await service.getCertificateProgress('user-A', 'certificate')
  const b = await service.getCertificateProgress('user-B', 'certificate')
  assert.equal(a.topics[0].completed, 1)
  assert.equal(b.topics[0].completed, 0)
  assert.equal(b.topics[0].started, false)
  assert.equal(queries[0].where.resourceType, 'lesson')
  assert.deepEqual(queries[1].where.resourceId.in, ['lesson'])
})

test('hidden certificate cannot serve study progress', async () => {
  const service = new CertificationStudyService({ certificate: { findUnique: async () => ({ isActive: false }) } } as any)
  await assert.rejects(() => service.getCertificateProgress('learner', 'hidden'))
})

test('study topic returns published knowledge lessons and matching practice exams', async () => {
  let topicQuery: any, examQuery: any, progressQuery: any
  const service = new CertificationStudyService({
    certificationTopic: { findUnique: async (args: any) => { topicQuery = args; return { id: 'topic', certificateId: 'cert', code: '1.1', name: 'Benefits', lessons: [{ lesson: { id: 'lesson', sections: [] } }], certificateDomain: { certificate: { id: 'cert', isActive: true }, domain: { id: 'domain' } } } } },
    learningProgress: { findMany: async (args: any) => { progressQuery = args; return [] } },
    exam: { findMany: async (args: any) => { examQuery = args; return [{ id: 'exam', title: 'Knowledge Quiz' }] } },
  } as any)
  const result = await service.getTopic('user-B', 'topic')
  assert.equal(topicQuery.include.lessons.where.lesson.type, 'certification_review')
  assert.equal(topicQuery.include.lessons.where.lesson.status, 'published')
  assert.deepEqual(examQuery.where, { certificateId: 'cert', kind: 'practice', status: 'published', topics: { has: '1.1' } })
  assert.equal(progressQuery.where.learnerId, 'user-B')
  assert.equal(result.lessons[0].progress, null)
  assert.equal(result.exams.length, 1)
})

test('admin cannot attach a vocabulary lesson as certificate knowledge', async () => {
  const service = new LessonsService({} as any)
  await assert.rejects(() => service.create({ title: 'Word list', type: 'vocabulary', topicIds: ['topic'], certificateIds: ['cert'] } as any, 'admin'), /ôn chứng chỉ/)
})

test('admin cannot attach lessons to a topic from another certificate', async () => {
  const service = new LessonsService({ certificationTopic: { findMany: async () => [{ id: 'topic', certificateId: 'other-cert' }] } } as any)
  await assert.rejects(() => service.create({ title: 'Cloud knowledge', type: 'certification_review', topicIds: ['topic'], certificateIds: ['cert'] } as any, 'admin'), /Chủ đề phải thuộc/)
})

 test('context isolates cached meanings and returns grammar and IPA', async () => {
  const original = global.fetch
  let calls = 0
  global.fetch = (async (_url: any, init: any) => {
    calls++
    const { context } = JSON.parse(JSON.parse(init.body).messages[1].content)
    return { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ translation: context.includes('river') ? 'bờ sông' : 'ngân hàng', partOfSpeech: 'danh từ', pronunciationIpa: '/bæŋk/' }) } }] }) } as any
  }) as any
  try {
    const service = translationService({ findFirst: async () => ({ definitionVi: 'ngân hàng' }) }, { APIVN_API_KEY: 'test-key' })
    const river = await service.translate('bank', 'river bank')
    assert.equal(river.translation, 'bờ sông')
    assert.equal(river.partOfSpeech, 'danh từ')
    assert.equal(river.pronunciationIpa, '/bæŋk/')
    assert.equal(river.contextual, true)
    assert.equal((await service.translate('bank', 'bank loan')).translation, 'ngân hàng')
    await service.translate('bank', 'river bank')
    assert.equal(calls, 2)
    await assert.rejects(() => service.translate('bank', 42))
  } finally { global.fetch = original }
 })
