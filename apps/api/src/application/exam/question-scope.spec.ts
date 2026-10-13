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
