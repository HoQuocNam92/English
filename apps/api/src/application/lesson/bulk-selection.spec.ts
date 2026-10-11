import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { validate } from 'class-validator'
import { BulkUpdateStatusDto } from '../../presentation/http-dto/content.dto'
import { LessonsService } from './lesson.service'
import { QuestionsService } from '../question/question.service'
import { ExamsService } from '../exam/exam.service'
import { VocabularyService } from '../vocabulary/vocabulary.service'

const ids = Array.from({ length: 10 }, (_, i) => `4936f4ab-59a9-4c51-b3da-${String(i).padStart(12, '0')}`)

for (const [model, Service] of [
  ['lesson', LessonsService], ['question', QuestionsService],
  ['exam', ExamsService], ['vocabulary', VocabularyService],
] as const) {
  test(`${model}: publish/draft affects selected 10 of 76 and never falls back to all`, async () => {
    const records = Array.from({ length: 76 }, (_, i) => ({ id: ids[i] ?? `unselected-${i}`, status: 'draft' }))
    let writes = 0
    const service = new Service({ [model]: { updateMany: async ({ where, data }: any) => {
      writes++
      assert.deepEqual(where, { id: { in: ids } })
      const affected = records.filter(item => where.id.in.includes(item.id))
      affected.forEach(item => { item.status = data.status })
      return { count: affected.length }
    } } } as any)
    for (const status of ['published', 'draft']) {
      const result = await service.bulkUpdateStatus({ ids, status, confirmAll: true, search: 'cloud' })
      assert.equal(result.updatedCount, 10)
      assert.ok(records.slice(0, 10).every(item => item.status === status))
      assert.ok(records.slice(10).every(item => item.status === 'draft'))
    }
    for (const input of [{}, { ids: [] }, { ids: null }, { ids: [''] }, { ids: [null] }, { search: 'cloud' }, { confirmAll: true }]) {
      await assert.rejects(() => service.bulkUpdateStatus({ ...input, status: 'published' }))
    }
    assert.equal(writes, 2)
  })
}

test('bulk request validation requires a nonempty list of unique identifiers', async () => {
  assert.equal((await validate(Object.assign(new BulkUpdateStatusDto(), { ids, status: 'published' }))).length, 0)
  for (const input of [{}, { ids: [] }, { ids: [ids[0], ids[0]] }, { ids: ['invalid'] }]) {
    assert.ok((await validate(Object.assign(new BulkUpdateStatusDto(), { ...input, status: 'published' }))).length > 0)
  }
})
