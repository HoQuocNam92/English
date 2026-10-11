import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { TaxonomyService } from './taxonomy.service'

test('certificate detail includes the linked questions specialty and level', async () => {
  const domain = { id: 'cloud', name: 'Cloud Computing' }
  const level = { id: 'beginner', code: 'beginner', name: 'Cơ bản' }
  const service = new TaxonomyService({
    certificate: { findUnique: async (query: any) => {
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
