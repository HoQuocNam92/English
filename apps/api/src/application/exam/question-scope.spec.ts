import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { ExamsService } from './exam.service'

const questions = [{ id: 'q1', domainId: 'cloud', levelId: 'intermediate' }, { id: 'q2', domainId: 'cloud-services', levelId: 'intermediate' }, { id: 'q3', domainId: 'cloud', levelId: 'basic' }]
function setup() {
  let writes = 0
  const db: any = {
    domain: { findUnique: async () => ({ id: 'cloud' }) },
    level: { findUnique: async () => ({ id: 'intermediate' }) },
    question: { count: async ({ where }: any) => questions.filter(q => where.id.in.includes(q.id) && q.domainId === where.domainId && q.levelId === where.levelId).length },
    exam: {
      findUnique: async () => ({ id: 'exam', domainId: 'cloud', levelId: 'intermediate', questions: [{ questionId: 'q1' }] }),
      create: async ({ data }: any) => { writes++; return data },
      update: async ({ data }: any) => { writes++; return data },
    },
    examQuestion: {
      deleteMany: async () => { writes++ },
      createMany: async () => { writes++ },
    },
    $transaction: async (run: any) => run(db),
  }
  return { service: new ExamsService(db), writes: () => writes }
}
const dto = { title: 'Cloud quiz', domainId: 'cloud', levelId: 'intermediate', certificateId: 'cert', questions: [{ questionId: 'q1', order: 1 }] }

test('admin can manage course finals while learner exam listings stay certificate scoped', async () => {
  const queries: any[] = []
  const db: any = { exam: {
    findMany: async ({ where }: any) => { queries.push(where); return [] },
    count: async () => 0,
  } }
  const service = new ExamsService(db)
  await service.findAll({}, true)
  assert.equal(queries[0].certificateId, undefined)
  await service.findAll({ kind: 'course_final', domainCode: 'SOFTWARE_ENG', levelCode: 'intermediate' }, true)
  assert.equal(queries[1].certificateId, null)
  assert.deepEqual(queries[1].kind, { in: ['domain_test', 'practice'] })
  await service.findAll({ status: 'draft' })
  assert.deepEqual(queries[2].certificateId, { not: null })
  assert.equal(queries[2].status, 'published')
})

test('course finals use the existing exam and question links without requiring a certificate', async () => {
  const { service, writes } = setup()
  await service.create({ ...dto, certificateId: null, kind: 'domain_test' }, 'admin')
  assert.equal(writes(), 1)
  await assert.rejects(() => service.create({ ...dto, certificateId: null, kind: 'mock_exam' }, 'admin'), /chứng chỉ/)
})

test('admin marks the same course final that the learning path selects across pages', async () => {
  const finals = [
    { id: 'new-practice', domainId: 'd', levelId: 'l', kind: 'practice' },
    { id: 'final', domainId: 'd', levelId: 'l', kind: 'domain_test' },
    { id: 'old-final', domainId: 'd', levelId: 'l', kind: 'domain_test' },
  ]
  const db: any = { exam: {
    findMany: async (query: any) => query.select ? finals : finals,
    count: async () => 3,
  } }
  const result = await new ExamsService(db).findAll({}, true)
  assert.deepEqual(result.data.filter((exam: any) => exam.isCourseAssessment).map(exam => exam.id), ['final'])
})

test('delete preserves attempts and reports a conflict, including a concurrently started attempt', async () => {
  let attempts = 1
  let deletes = 0
  let deleteError: unknown
  const db: any = {
    exam: {
      findUnique: async () => ({ id: 'exam' }),
      delete: async ({ where }: any) => {
        assert.equal(where.id, 'exam')
        deletes++
        if (deleteError) throw deleteError
      },
    },
    examAttempt: { count: async ({ where }: any) => {
      assert.equal(where.examId, 'exam')
      return attempts
    } },
  }
  const service = new ExamsService(db)
  const isConflict = (error: any) => error.getStatus?.() === 409 && /bản nháp/.test(error.message)
  await assert.rejects(() => service.delete('exam'), isConflict)
  assert.equal(deletes, 0)
  attempts = 0
  deleteError = { code: 'P2003' }
  await assert.rejects(() => service.delete('exam'), isConflict)
  deleteError = new Error('database unavailable')
  await assert.rejects(() => service.delete('exam'), /database unavailable/)
  deleteError = undefined
  await service.delete('exam')
  assert.equal(deletes, 3)
})

test('create accepts matching questions and rejects other domains, levels and missing IDs before writing', async () => {
  const { service, writes } = setup()
  for (const questionId of ['q2', 'q3', 'missing']) {
    await assert.rejects(() => service.create({ ...dto, questions: [{ questionId, order: 1 }] }, 'admin'), /chuyên ngành, cấp độ/)
  }
  assert.equal(writes(), 0)
  await service.create(dto, 'admin')
  assert.equal(writes(), 1)
})

test('update validates replacement questions before deleting existing links', async () => {
  const { service, writes } = setup()
  await assert.rejects(() => service.update('exam', { questions: [{ questionId: 'q2' }] }), /chuyên ngành, cấp độ/)
  assert.equal(writes(), 0)
  await service.update('exam', { questions: dto.questions })
  assert.equal(writes(), 3)
})

test('changing only exam taxonomy validates retained questions; title-only edits stay valid', async () => {
  const { service, writes } = setup()
  await assert.rejects(() => service.update('exam', { levelId: 'basic' }), /chuyên ngành, cấp độ/)
  await assert.rejects(() => service.update('exam', { domainId: 'cloud-services' }), /chuyên ngành, cấp độ/)
  assert.equal(writes(), 0)
  await service.update('exam', { title: 'Renamed' })
  assert.equal(writes(), 1)
})

test('legacy mixed-scope questions survive metadata edits but incompatible additions fail', async () => {
  let writes = 0
  const db: any = {
    exam: { findUnique: async () => ({ domainId: 'cloud', levelId: 'basic', questions: [{ questionId: 'q1' }] }), update: async () => { writes++ } },
    question: { count: async () => 0 },
    examQuestion: { deleteMany: async () => {}, createMany: async () => {} },
    $transaction: async (run: any) => run(db),
  }
  const service = new ExamsService(db)
  await service.update('exam', { title: 'Edited', questions: [{ questionId: 'q1' }] }); assert.equal(writes, 1)
  await assert.rejects(() => service.update('exam', { questions: [{ questionId: 'q1' }, { questionId: 'q2' }] }), /chuyên ngành, cấp độ/)
  await assert.rejects(() => service.update('exam', { levelId: 'intermediate' }), /chuyên ngành, cấp độ/)
  assert.equal(writes, 1)
})
