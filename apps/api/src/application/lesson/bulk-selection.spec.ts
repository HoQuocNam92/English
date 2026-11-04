import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { validate } from 'class-validator'
import { BulkUpdateStatusDto, UpdateLessonDto, ExamQuestionLinkDto } from '../../presentation/http-dto/content.dto'
import { AnswerDto } from '../../presentation/http-dto/exam-attempt.dto'
import { LessonsService } from './lesson.service'
import { QuestionsService } from '../question/question.service'
import { ExamsService } from '../exam/exam.service'
import { VocabularyService } from '../vocabulary/vocabulary.service'
import { TaxonomyService } from '../taxonomy/taxonomy.service'
import { activitySelection, publicationSelection } from '../publication-selection'

// Exercise mixed API-created v4 and imported v5 records through every bulk endpoint.
const ids = Array.from({ length: 10 }, (_, i) => `4936f4ab-59a9-${i % 2 ? '5c51' : '4c51'}-b3da-${String(i).padStart(12, '0')}`)

for (const [model, Service] of [
  ['lesson', LessonsService], ['question', QuestionsService],
  ['exam', ExamsService], ['vocabulary', VocabularyService],
] as const) {
  test(`${model}: publish/draft affects selected 10 of 76 and never falls back to all`, async () => {
    const records = Array.from({ length: 76 }, (_, i) => ({ id: ids[i] ?? `unselected-${i}`, status: 'draft' }))
    let writes = 0
    const service = new Service({ [model]: { updateMany: async ({ where, data }: any) => {
      writes++
      assert.deepEqual(where, { id: { in: ids }, status: data.status === 'published' ? 'draft' : 'published' })
      const affected = records.filter(item => where.id.in.includes(item.id) && item.status === where.status)
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

for (const [model, Service] of [['lesson', LessonsService], ['question', QuestionsService], ['exam', ExamsService], ['vocabulary', VocabularyService]] as const) {
  test(`${model}: a 100-item snapshot skips published, archived, deleted and raced records without republishing`, async () => {
    const selected = Array.from({ length: 100 }, (_, i) => `4936f4ab-59a9-5c51-b3da-${String(i).padStart(12, '0')}`)
    const originalDate = new Date('2026-01-01')
    const records = selected.slice(0, 99).map((id, i) => ({ id, status: i < 80 ? 'draft' : i < 95 ? 'published' : 'archived', publishedAt: originalDate }))
    records.push({ id: 'outside-filter', status: 'draft', publishedAt: originalDate })
    const service = new Service({ [model]: { updateMany: async ({ where, data }: any) => {
      const changed = records.filter(item => where.id.in.includes(item.id) && item.status === where.status)
      changed.forEach(item => Object.assign(item, data)); return { count: changed.length }
    } } } as any)
    const first = await service.bulkUpdateStatus({ ids: selected, status: 'published' })
    assert.equal(first.updatedCount, 80)
    assert.equal(first.skippedCount, 20)
    const publishedDates = records.map(item => item.publishedAt)
    const repeated = await service.bulkUpdateStatus({ ids: selected, status: 'published' })
    assert.equal(repeated.updatedCount, 0)
    assert.deepEqual(records.map(item => item.publishedAt), publishedDates)
    assert.equal(records[80].publishedAt, originalDate)
    assert.equal(records[95].status, 'archived')
    assert.equal(records[99].status, 'draft')
    for (const invalid of [{ ids: [] }, { ids: [selected[0], selected[0]] }, { ids: ['invalid'] }, { ids: selected, status: 'archived' }]) {
      await assert.rejects(service.bulkUpdateStatus({ status: 'published', ...invalid }))
    }
  })
}

test('publication validation rejects empty, oversized, duplicate IDs and unsupported target states', () => {
  for (const idsValue of [null, [], ['invalid'], [ids[0], ids[0]], Array(10001).fill(ids[0])]) assert.throws(() => publicationSelection({ ids: idsValue, status: 'published' }))
  for (const status of [undefined, '', 'active', 'archived', true]) assert.throws(() => publicationSelection({ ids, status }))
  assert.throws(() => activitySelection({ ids, isActive: 'false' }))
})

for (const resource of ['level', 'certificate'] as const) {
  test(`${resource}: activation/deactivation only changes records in the opposite state`, async () => {
    const rows = ids.map((id, index) => ({ id, isActive: index >= 5 }))
    const db: any = { [resource]: { updateMany: async ({ where, data }: any) => {
      const matching = rows.filter(row => where.id.in.includes(row.id) && row.isActive === where.isActive)
      matching.forEach(row => Object.assign(row, data)); return { count: matching.length }
    } } }
    const svc = new TaxonomyService(db)
    assert.equal((await svc.bulkActivity(resource, { ids, isActive: true })).updatedCount, 5)
    assert.equal((await svc.bulkActivity(resource, { ids, isActive: true })).updatedCount, 0)
    assert.equal((await svc.bulkActivity(resource, { ids, isActive: false })).updatedCount, 10)
  })
}

test('bulk request validation requires a nonempty list of unique identifiers', async () => {
  assert.equal((await validate(Object.assign(new BulkUpdateStatusDto(), { ids, status: 'published' }))).length, 0)
  for (const input of [{}, { ids: [] }, { ids: [ids[0], ids[0]] }, { ids: ['invalid'] }]) {
    assert.ok((await validate(Object.assign(new BulkUpdateStatusDto(), { ...input, status: 'published' }))).length > 0)
  }
})

test('imported vocabulary, question and option IDs work when editing lessons, linking exams and submitting answers', async () => {
  const importedId = ids[1]
  const cases = [
    [UpdateLessonDto, { vocabularyIds: [importedId] }, { vocabularyIds: ['invalid'] }],
    [ExamQuestionLinkDto, { questionId: importedId, order: 1 }, { questionId: 'invalid', order: 1 }],
    [AnswerDto, { questionId: importedId, selectedOptionIds: [importedId] }, { questionId: importedId, selectedOptionIds: ['invalid'] }],
  ] as const
  for (const [Dto, valid, invalid] of cases) {
    assert.equal((await validate(Object.assign(new Dto(), valid))).length, 0)
    assert.ok((await validate(Object.assign(new Dto(), invalid))).length > 0)
  }
})
