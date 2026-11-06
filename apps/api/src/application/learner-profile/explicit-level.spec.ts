import { test } from 'node:test'
import * as assert from 'node:assert/strict'
import { LearnerProfilesService } from './learner-profile.service'
import { careerFocus } from '../recommendation/career-focus'

function fixture() {
  const profile: any = { id: 'p', userId: 'u', levelId: 'beginner-id', level: { code: 'beginner' }, levelSelectedAt: null, onboardingCompleted: false, domains: [], certGoals: [] }
  const prisma: any = {
    user: { findFirst: async () => ({ id: 'u' }) },
    learnerProfile: {
      findUnique: async () => profile,
      update: async ({ data }: any) => { Object.assign(profile, data); if (data.levelSelectedAt) profile.level = { code: 'intermediate' } },
    },
    level: { findUnique: async () => ({ id: 'intermediate-id', isActive: true }) },
    $transaction: async (fn: any) => fn(prisma),
  }
  return { profile, service: new LearnerProfilesService(prisma) }
}

test('new account does not expose its technical Beginner default as a selected level', async () => {
  const { service, profile } = fixture()
  const response = await service.findByUser('u')
  assert.equal(response.level, null)
  assert.equal(response.levelId, null)
  assert.equal(profile.level.code, 'beginner')
})

test('editing unrelated targets does not confirm a level; explicit selection does', async () => {
  const { service, profile } = fixture()
  await service.updateGoals('u', { dailyVocabularyTarget: 15 })
  assert.equal((await service.findByUser('u')).level, null)
  await service.updateGoals('u', { levelCode: 'intermediate' })
  assert.ok(profile.levelSelectedAt instanceof Date)
  assert.equal(profile.levelId, 'intermediate-id')
  assert.equal((await service.findByUser('u')).level?.code, 'intermediate')
})

test('onboarding cannot silently substitute Beginner for a missing level', async () => {
  const { service } = fixture()
  await assert.rejects(service.completeOnboarding('u', { learningGoal: 'vocabulary', domainCodes: ['CLOUD'] } as any), /tự chọn trình độ/)
})

test('career preference changes ranking without inventing matches for unknown or retired careers', () => {
  const focus = careerFocus([{ careerGoal: { code: 'SECURITY_ENGINEER', name: 'Security Engineer' } }])
  const selected = ['CLOUD', 'CYBERSEC', 'SOFTWARE_ENG']
  assert.deepEqual([...selected].sort((a, b) => focus.score(b) - focus.score(a)), ['CYBERSEC', 'CLOUD', 'SOFTWARE_ENG'])
  assert.match(focus.reason('CYBERSEC'), /Security Engineer/)
  assert.equal(focus.reason('CLOUD'), '')
  assert.equal(careerFocus([{ careerGoal: { code: 'CUSTOM', name: 'Custom' } }]).score('CLOUD'), 0)
  assert.equal(careerFocus([{ careerGoal: { code: 'CLOUD_ENGINEER', name: 'Cloud', isActive: false } }]).score('CLOUD'), 0)
  assert.deepEqual(selected, ['CLOUD', 'CYBERSEC', 'SOFTWARE_ENG'])
})
