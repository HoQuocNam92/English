import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { ProgressService } from './progress.service'

function fixture(goal: 'vocabulary' | 'certification' | 'both' | null, overrides: Record<string, any> = {}) {
  const profile = { learningGoal: goal, certGoals: goal === 'certification' || goal === 'both' ? [{ certificateId: 'cert-1', certificate: { code: 'AWS', name: 'AWS' } }] : [], dailyVocabularyTarget: 10, weeklyExamTarget: 2, level: { name: 'Intermediate', code: 'B1' } }
  const prisma = {
    user: { findFirst: async () => ({ id: 'learner', learnerProfile: { id: 'profile' } }) },
    learnerProfile: { findUnique: async () => profile },
    learningProgress: { findMany: async () => overrides.progress ?? [] },
    examAttempt: { findMany: async (args: any) => args.select ? (overrides.quizActivity ?? []) : args.include ? (overrides.recentAttempts ?? []) : (overrides.certAttempts ?? []) },
    vocabularyProgress: { findMany: async () => overrides.vocabularyActivity ?? [] },
    domain: { findMany: async () => [] },
    certificate: { findMany: async () => [] },
    lesson: { findMany: async () => [] },
  }
  return new ProgressService(prisma as any)
}

test('new vocabulary learner receives vocabulary milestones and no certification quiz milestone', async () => {
  const result = await fixture('vocabulary').getMyProgress('learner')
  assert.deepEqual(result.milestones.map(item => item.id), ['first_lesson', 'learn_words', 'seven_day_streak'])
  assert.equal(result.gamification.totalXp, 0)
  assert.equal(result.gamification.unlockedCount, 0)
  assert.equal(result.gamification.totalMilestones, 3)
})

test('certification goal receives quiz and domain milestones', async () => {
  const result = await fixture('certification').getMyProgress('learner')
  assert.deepEqual(result.milestones.map(item => item.id), ['first_lesson', 'complete_quizzes', 'seven_day_streak', 'complete_domain'])
  assert.equal(result.certProgress.length, 1)
})

test('combined goal receives both vocabulary and certification milestones', async () => {
  const result = await fixture('both').getMyProgress('learner')
  assert.deepEqual(result.milestones.map(item => item.id), ['first_lesson', 'learn_words', 'complete_quizzes', 'seven_day_streak', 'complete_domain'])
})

test('completed lesson unlocks first milestone even when status is in_progress at 100 percent', async () => {
  const result = await fixture('vocabulary', { progress: [{ resourceType: 'lesson', resourceId: 'lesson-1', status: 'in_progress', completionPercent: 100 }] }).getMyProgress('learner')
  assert.equal(result.milestones.find(item => item.id === 'first_lesson')?.unlocked, true)
  assert.equal(result.gamification.totalXp, 50)
})

test('vocabulary activity unlocks first milestone and clamps weekly vocabulary progress', async () => {
  const activity = Array.from({ length: 75 }, () => ({ createdAt: new Date('2026-01-01') }))
  const result = await fixture('vocabulary', { vocabularyActivity: activity }).getMyProgress('learner')
  const words = result.milestones.find(item => item.id === 'learn_words')
  assert.equal(words?.current, 70)
  assert.equal(words?.progressPercent, 100)
  assert.equal(words?.unlocked, true)
  assert.equal(result.gamification.totalXp, 200)
})

test('quiz attempts unlock quiz milestone at goal threshold', async () => {
  const dates = [{ startedAt: new Date('2026-01-01') }, { startedAt: new Date('2026-01-02') }]
  const result = await fixture('certification', { quizActivity: dates }).getMyProgress('learner')
  assert.equal(result.milestones.find(item => item.id === 'complete_quizzes')?.unlocked, true)
})
