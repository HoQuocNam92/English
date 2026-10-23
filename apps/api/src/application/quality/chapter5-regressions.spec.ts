import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { validate } from 'class-validator'
import { AuthService } from '../auth/auth.service'
import { LessonsService } from '../lesson/lesson.service'
import { QuestionsService } from '../question/question.service'
import { ExamsService } from '../exam/exam.service'
import { LearnerProfilesService } from '../learner-profile/learner-profile.service'
import { CreateCertificateDto, UpdateCertificateDto } from '../../presentation/http-dto/certificate.dto'
import { canManageContent } from '../../infrastructure/auth/content-access'

const uuid = '4936f4ab-59a9-4c51-b3da-61402e3be245'

test('email with different case cannot create a second learner or bypass an existing legacy email', async () => {
  let creates = 0
  const service = new AuthService({ user: {
    findFirst: async ({ where }: any) => where.email.mode === 'insensitive' && where.email.equals === 'learner@gmail.com' ? { id: 'existing' } : null,
    create: async () => { creates++; throw new Error('Must not create') },
  } } as any, {} as any, {} as any, {} as any)
  await assert.rejects(() => service.register({ email: '  Learner@Gmail.Com ', displayName: 'Learner', password: 'Abcd@1234' }), /đã được sử dụng/)
  assert.equal(creates, 0)
})

test('read-only learner permissions and client query flags never authorize draft previews', async () => {
  assert.equal(canManageContent(undefined, 'lessons'), false)
  assert.equal(canManageContent({ roles: ['learner'], permissions: ['exams:read'] }, 'exams'), false)
  assert.equal(canManageContent({ permissions: ['lessons:create'] }, 'lessons'), true)
  assert.equal(canManageContent({ roles: ['admin'] }, 'exams'), true)
  let where: any
  const service = new LessonsService({ lesson: {
    findMany: async (args: any) => { where = args.where; return [] }, count: async () => 0,
    findFirst: async () => ({ id: uuid, status: 'draft' }),
  } } as any)
  await service.findAll({ status: 'draft', canPreview: true })
  assert.equal(where.status, 'published')
  await assert.rejects(() => service.findForViewer(uuid), /Không tìm thấy/)
  assert.equal((await service.findForViewer(uuid, true)).status, 'draft')
})

test('published lessons remain accessible by slug without passing a non UUID to PostgreSQL', async () => {
  const service = new LessonsService({ lesson: { findFirst: async ({ where }: any) => {
    assert.deepEqual(where, { slug: 'cloud-basics' })
    return { status: 'published', title: 'Cloud basics' }
  } } } as any)
  assert.equal((await service.findForViewer('cloud-basics')).title, 'Cloud basics')
})

test('exam detail hides every grading hint for learner while preserving the staff editor', async () => {
  const exam: any = { id: uuid, status: 'published', questions: [{ order: 1, question: {
    prompt: 'Question', acceptedAnswers: ['secret'], explanation: 'secret', options: [{ id: 'option', isCorrect: true, text: 'Answer', explanation: 'secret' }],
  } }] }
  const service = new ExamsService({ exam: { findUnique: async () => exam } } as any)
  const learner = await service.findForViewer(uuid)
  assert.ok(!JSON.stringify(learner).includes('secret'))
  assert.ok(!JSON.stringify(learner).includes('isCorrect'))
  assert.equal(learner.questions[0].question.options[0].text, 'Answer')
  const staff: any = await service.findForViewer(uuid, true)
  assert.equal(staff.questions[0].question.options[0].isCorrect, true)
  exam.status = 'draft'
  await assert.rejects(() => service.findForViewer(uuid), /Không tìm thấy/)
})

test('malformed exam identifier produces 400 before reaching database', async () => {
  const service = new ExamsService({ exam: { findUnique: () => { throw new Error('Should not query') } } } as any)
  await assert.rejects(() => service.findForViewer('not-a-uuid'), (error: any) => error.getStatus?.() === 400)
})

test('learner question bank cannot reveal answers or drafts through an alternate route', async () => {
  const row = { id: uuid, status: 'published', prompt: 'Question', acceptedAnswers: ['secret'], explanation: 'secret', options: [{ key: 'A', isCorrect: true, text: 'A' }] }
  const service = new QuestionsService({ question: { findUnique: async () => row, findMany: async () => [row], count: async () => 1 } } as any)
  for (const result of [await service.findForViewer(uuid), await service.findAll({})]) {
    assert.ok(!JSON.stringify(result).includes('isCorrect'))
    assert.ok(!JSON.stringify(result).includes('secret'))
  }
  assert.equal((await service.findForViewer(uuid, true)).options[0].isCorrect, true)
  row.status = 'draft'
  await assert.rejects(() => service.findForViewer(uuid), /Không tìm thấy/)
})

test('active attempt history and details hide answers until the owner submits', async () => {
  const row = { id: uuid, status: 'in_progress', learnerId: 'learner', exam: {}, questionsSnapshot: [{ id: uuid, prompt: 'Question', acceptedAnswers: ['secret'], explanation: 'secret', options: [{ id: 'A', isCorrect: true, text: 'A' }] }] }
  const service = new ExamsService({ examAttempt: { findUnique: async () => row, findMany: async () => [row], count: async () => 1 } } as any)
  for (const result of [await service.getMyAttempts('learner'), await service.getAttemptById(uuid, 'learner')]) {
    assert.ok(!JSON.stringify(result).includes('isCorrect'))
    assert.ok(!JSON.stringify(result).includes('secret'))
  }
  row.status = 'graded'
  assert.equal((await service.getAttemptById(uuid, 'learner')).questionsSnapshot[0].options[0].isCorrect, true)
})

test('an expired exam cannot be graded or produce answers and progress', async () => {
  let writes = 0
  const service = new ExamsService({
    examAttempt: { findUnique: async () => ({ id: uuid, learnerId: 'learner', status: 'in_progress', expiresAt: new Date(Date.now() - 1) }) },
    $transaction: async () => { writes++ },
  } as any)
  await assert.rejects(() => service.submitAttempt(uuid, 'learner', []), /hết thời gian/)
  assert.equal(writes, 0)
})

for (const [label, type, options] of [
  ['no correct answer', 'single_choice', [{ key: 'A', isCorrect: false }, { key: 'B', isCorrect: false }]],
  ['two correct answers', 'single_choice', [{ key: 'A', isCorrect: true }, { key: 'B', isCorrect: true }]],
  ['duplicate keys', 'multiple_choice', [{ key: 'a', isCorrect: true }, { key: 'A', isCorrect: false }]],
  ['only one option', 'single_choice', [{ key: 'A', isCorrect: true }]],
  ['three true false options', 'true_false', [{ key: 'A', isCorrect: true }, { key: 'B', isCorrect: false }, { key: 'C', isCorrect: false }]],
] as const) {
  test(`invalid question ${label} is rejected on create and import before any writes`, async () => {
    const service = new QuestionsService({} as any)
    const dto = { type, options }
    await assert.rejects(() => service.create(dto), (error: any) => error.getStatus?.() === 400)
    await assert.rejects(() => service.bulkCreate([dto]), (error: any) => error.getStatus?.() === 400)
  })
}

test('question validation permits real multi-answer questions and short text answers', async () => {
  let writes = 0
  const service = new QuestionsService({ domain: { findUnique: async () => ({ id: uuid }) }, level: { findUnique: async () => ({ id: uuid }) }, question: { create: async () => { writes++; return {} } } } as any)
  await service.create({ type: 'multiple_choice', options: [{ key: 'A', isCorrect: true }, { key: 'B', isCorrect: true }] })
  await service.create({ type: 'short_answer', acceptedAnswers: ['cloud'] })
  assert.equal(writes, 2)
})

for (const [field, model] of [['domainCodes', 'domain'], ['certificateCodes', 'certificate'], ['careerGoalCodes', 'careerGoal']] as const) {
  test(`unknown ${field} rejects mixed valid and invalid references without changing profile`, async () => {
    let writes = 0
    const db: any = {
      user: { findFirst: async () => ({ id: 'learner' }) },
      learnerProfile: { findUnique: async () => ({ id: uuid, levelId: uuid }) },
      [model]: { findMany: async () => [{ id: uuid, code: 'VALID', isActive: true }] },
      $transaction: async () => { writes++ },
    }
    const service = new LearnerProfilesService(db)
    await assert.rejects(() => service.updateGoals('learner', { [field]: ['VALID', 'INVALID'], dailyVocabularyTarget: 20 }), /không tồn tại/)
    assert.equal(writes, 0)
  })
}

test('certificate validation rejects missing required fields and accepts frontend nullable metadata', async () => {
  const base = { code: 'QA', name: 'QA Certificate', provider: 'QA Provider', description: 'QA description', category: null, examDurationMinutes: null, examQuestionCount: null, passingScaledScore: null, examUrl: null, isActive: true }
  assert.equal((await validate(Object.assign(new CreateCertificateDto(), base))).length, 0)
  for (const field of ['code', 'name', 'provider', 'description']) {
    const data: any = { ...base }; delete data[field]
    assert.ok((await validate(Object.assign(new CreateCertificateDto(), data))).some(error => error.property === field))
  }
  assert.equal((await validate(Object.assign(new UpdateCertificateDto(), { name: 'Updated certificate' }))).length, 0)
})
