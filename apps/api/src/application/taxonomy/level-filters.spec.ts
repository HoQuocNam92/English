import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { TaxonomyService } from './taxonomy.service'
import { VocabularyService } from '../vocabulary/vocabulary.service'
import { QuestionsService } from '../question/question.service'
import { LessonsService } from '../lesson/lesson.service'

for (const [model, Service] of [['vocabulary', VocabularyService], ['question', QuestionsService], ['lesson', LessonsService]] as const) {
  test(`${model}: specialty and level scope rows and total together`, async () => {
    let rows: any, count: any
    const service = new Service({ [model]: { findMany: async (args: any) => { rows = args; return [] }, count: async (args: any) => { count = args; return 123 } } } as any)
    const result = await service.findAll({ domainCode: 'SOFTWARE_ENG', levelCode: 'beginner', status: 'draft', page: 2, limit: 10 }, true)
    assert.deepEqual(rows.where, count.where)
    assert.deepEqual(rows.where.level, { code: 'beginner' })
    assert.ok(JSON.stringify(rows.where).includes('SOFTWARE_ENG'))
    assert.equal(rows.where.status, 'draft')
    assert.equal(rows.skip, 10)
    assert.equal(result.meta.total, 123)
  })
}
test('students combine level, specialty and certificate under one profile predicate', async () => {
  let rows: any, count: any
  const service = new TaxonomyService({ user: { findMany: async (args: any) => { rows = args; return [] }, count: async (args: any) => { count = args; return 7 } } } as any)
  const result = await service.getStudents({ levelCode: 'beginner', domainId: 'software', certificateId: 'aws' })
  assert.deepEqual(rows.where, count.where)
  assert.deepEqual(rows.where.learnerProfile.is, { level: { code: 'beginner' }, domains: { some: { domainId: 'software' } }, certGoals: { some: { certificateId: 'aws' } } })
  assert.equal(result.meta.total, 7)
})
