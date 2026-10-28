import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { TaxonomyService } from './taxonomy.service'

test('certificate search data includes published exams and can restrict inactive certificates', async () => {
  const service = new TaxonomyService({
    certificate: { findMany: async (query: any) => {
      assert.deepEqual(query.where, { isActive: true })
      assert.deepEqual(query.include.exams.where, { status: 'published' })
      assert.equal(query.include.exams.select.domain.select.isActive, true)
      return [{ id: 'certificate-1', exams: [{ id: 'exam-1', title: 'Bài kiểm tra số 1' }] }]
    } },
  } as any)
  const result = await service.getCertificates(true)
  assert.equal(result.data[0].exams[0].title, 'Bài kiểm tra số 1')
})

test('certificate detail includes the linked questions specialty and level', async () => {
  const domain = { id: 'cloud', name: 'Cloud Computing' }
  const level = { id: 'beginner', code: 'beginner', name: 'Cơ bản' }
  const service = new TaxonomyService({
    certificate: { findUnique: async (query: any) => {
      assert.deepEqual(query.include.exams.orderBy, { createdAt: 'desc' })
      const relations = query.include.domains.include.certificationTopics.include.questions.include.question.include
      assert.equal(relations.domain, true)
      assert.equal(relations.level, true)
      return {
        domains: [{ certificationTopics: [{ questions: [{ question: { id: 'question-1', domain, level } }] }] }],
        profileGoals: [],
      }
    } },
    examAttempt: { findMany: async () => [] },
  } as any)
  const result = await service.getCertificate('certificate-1')
  const question = result.domains[0].certificationTopics[0].questions[0].question
  assert.deepEqual(question.domain, domain)
  assert.deepEqual(question.level, level)
  assert.equal(result.stats.attempts, 0)
})

test('certificate filter domains derive from active linked content without exposing retired blueprint areas', async () => {
  const cloud = { id: 'cloud', code: 'CLOUD', name: 'Cloud', isActive: true }
  const blueprint = { id: 'blueprint', code: 'CLOUD_CONCEPTS', name: 'Cloud Concepts', isActive: false }
  const service = new TaxonomyService({ certificate: { findMany: async () => [{
    id: 'certificate', domains: [{ domain: blueprint }], exams: [{ domain: cloud }], lessons: [{ lesson: { domain: cloud } }],
  }] } } as any)
  const result = await service.getCertificates()
  assert.deepEqual(result.data[0].selectionDomains, [cloud])
  assert.deepEqual(result.data[0].domains[0].domain, blueprint, 'keep the real certificate structure')
})
