import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { validate } from 'class-validator'
import { QuestionsService } from '../question/question.service'
import { LearnerProfilesService } from '../learner-profile/learner-profile.service'
import { CompleteOnboardingDto } from '../../presentation/http-dto/content.dto'

const question = { type: 'single_choice', prompt: 'Which cloud answer is correct?', options: [{ key: 'A', text: 'Right', isCorrect: true }, { key: 'B', text: 'Wrong', isCorrect: false }] }

for (const field of ['domainId', 'domainCode', 'domainName', 'domain', 'levelId', 'levelCode', 'levelName', 'level']) {
  test(`import rejects unknown ${field} in a later row before starting a transaction`, async () => {
    let transactions = 0
    const service = new QuestionsService({
      domain: { findMany: async () => [{ id: 'domain-id', code: 'CLOUD', name: 'Cloud Computing' }] },
      level: { findMany: async () => [{ id: 'level-id', code: 'beginner', name: 'Beginner' }] },
      $transaction: async () => { transactions++; throw new Error('Must not write') },
    } as any)
    await assert.rejects(() => service.bulkCreate([{ ...question, domainCode: 'CLOUD', levelCode: 'beginner' }, { ...question, [field]: 'DOES_NOT_EXIST' }]), (error: any) => error.getStatus?.() === 400)
    assert.equal(transactions, 0)
  })
}

test('import resolves valid codes and names case insensitively and retains defaults only for omitted fields', async () => {
  const saved: any[] = []
  const service = new QuestionsService({
    domain: { findMany: async () => [{ id: 'domain-id', code: 'CLOUD', name: 'Cloud Computing' }] },
    level: { findMany: async () => [{ id: 'level-id', code: 'beginner', name: 'Beginner' }] },
    $transaction: async (fn: any) => fn({ question: { create: async ({ data }: any) => { saved.push(data); return data } } }),
  } as any)
  const result = await service.bulkCreate([{ ...question, domainCode: ' cloud ', levelName: ' BEGINNER ' }, question])
  assert.equal(result.count, 2)
  assert.ok(saved.every(row => row.domainId === 'domain-id' && row.levelId === 'level-id'))
})

test('import rejects an unconfigured taxonomy instead of reporting success with skipped rows', async () => {
  const service = new QuestionsService({ domain: { findMany: async () => [] }, level: { findMany: async () => [] } } as any)
  await assert.rejects(() => service.bulkCreate([question]), (error: any) => error.getStatus?.() === 400)
})

test('onboarding DTO requires an explicit learning goal', async () => {
  assert.ok((await validate(new CompleteOnboardingDto())).some(error => error.property === 'learningGoal'))
  assert.ok(!(await validate(Object.assign(new CompleteOnboardingDto(), { learningGoal: 'vocabulary', domainCodes: ['CLOUD'] }))).some(error => error.property === 'learningGoal'))
})

for (const dto of [{}, { learningGoal: 'vocabulary' }, { learningGoal: 'certification' }, { learningGoal: 'both', domainCodes: ['CLOUD'] }, { learningGoal: 'both', certificateCodes: ['AWS-SAA'] }]) {
  test(`incomplete onboarding ${JSON.stringify(dto)} is rejected before profile writes`, async () => {
    let writes = 0
    const service = new LearnerProfilesService({ user: { findFirst: async () => ({ id: 'learner' }) }, learnerProfile: { upsert: async () => { writes++ } } } as any)
    await assert.rejects(() => service.completeOnboarding('learner', dto as any), (error: any) => error.getStatus?.() === 400)
    assert.equal(writes, 0)
  })
}

test('editing preferences cannot mark a new incomplete profile as onboarded', async () => {
  let update: any
  const existing = { id: 'profile', userId: 'learner', levelId: 'level', onboardingCompleted: false, learningGoal: null, domains: [], certGoals: [] }
  const service = new LearnerProfilesService({
    user: { findFirst: async () => ({ id: 'learner' }) },
    learnerProfile: { findUnique: async () => existing },
    $transaction: async (fn: any) => fn({ learnerProfile: { update: async ({ data }: any) => { update = data } } }),
  } as any)
  await service.updateGoals('learner', { reminderEnabled: false })
  assert.equal(update.onboardingCompleted, undefined)
})

test('completed vocabulary onboarding cannot be cleared through the goals endpoint', async () => {
  let transactions = 0
  const service = new LearnerProfilesService({
    user: { findFirst: async () => ({ id: 'learner' }) },
    learnerProfile: { findUnique: async () => ({ id: 'profile', levelId: 'level', learningGoal: 'vocabulary', onboardingCompleted: true, domains: [{ domainId: 'cloud' }], certGoals: [] }) },
    $transaction: async () => { transactions++ },
  } as any)
  await assert.rejects(() => service.updateGoals('learner', { domainCodes: [] }), /chuyên ngành/)
  assert.equal(transactions, 0)
})
import { AuthService } from '../auth/auth.service'
import { RegisterDto } from '../../presentation/http-dto/auth.dto'
import { plainToInstance } from 'class-transformer'

for (const email of ['learner@yahoo.com', 'learner@gmail.com.evil.test', 'learner@sub.gmail.com', 'learner@@gmail.com', 'learner@gmail', 'learner@']) {
  test(`registration rejects ${email} in validation and before any database write`, async () => {
    const dto = plainToInstance(RegisterDto, { email, displayName: 'Learner', password: 'Abcd@1234' })
    assert.ok((await validate(dto)).some(error => error.property === 'email'))
    const service = new AuthService({} as any, {} as any, {} as any, {} as any)
    await assert.rejects(() => service.register(dto), /Email không hợp lệ|Chỉ chấp nhận địa chỉ email @gmail.com/)
  })
}
test('registration normalizes Gmail case and surrounding spaces before duplicate lookup', async () => {
  const dto = plainToInstance(RegisterDto, { email: '  Learner@GMAIL.COM  ', displayName: 'Learner', password: 'Abcd@1234' })
  assert.equal(dto.email, 'learner@gmail.com')
  assert.equal((await validate(dto)).length, 0)
  const service = new AuthService({ user: { findFirst: async ({ where }: any) => {
    assert.equal(where.email.equals, 'learner@gmail.com'); return { id: 'already-exists' }
  } } } as any, {} as any, {} as any, {} as any)
  await assert.rejects(() => service.register(dto), /Email đã được sử dụng/)
})
test('Google cannot create a new non Gmail account', async () => {
  const service = new AuthService({ user: { findFirst: async () => null } } as any, {} as any, {} as any, {} as any)
  await assert.rejects(() => service.findOrCreateGoogleUser({ googleId: 'google-user', email: 'learner@company.com', displayName: 'Learner' }), /Chỉ chấp nhận địa chỉ email @gmail.com/)
})
