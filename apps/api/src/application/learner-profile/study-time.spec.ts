import { test } from 'node:test'
import * as assert from 'node:assert/strict'
import { LearnerProfilesService } from './learner-profile.service'
function database(seconds: number) {
  return {
    user: { findFirst: async () => ({ id: 'learner' }) },
    learnerProfile: { findUnique: async () => ({ onboardingCompleted: true, domains: [{}], certGoals: [], dailyVocabularyTarget: 10, weeklyExamTarget: 2, dailyStudyTargetMinutes: 30 }) },
    vocabularyProgress: { count: async () => 20 }, examAttempt: { count: async () => 0 },
    $queryRaw: async () => [{ seconds }],
  }
}
test('twenty studied words do not become twenty minutes; only measured seconds count', async () => {
  for (const [seconds, expected] of [[0, 0], [59, 0], [60, 1], [119, 1], [120, 2]]) {
    const result = await new LearnerProfilesService(database(seconds) as any).getJourney('learner')
    assert.equal(result.progress?.vocabularyToday, 20)
    assert.equal(result.progress?.studyMinutesToday, expected)
  }
})
test('invalid heartbeat input cannot write time', async () => {
  let writes = 0
  const service = new LearnerProfilesService({ ...database(0), $executeRaw: async () => { writes++ } } as any)
  for (const seconds of [-1, 1.5, 86401, NaN]) await assert.rejects(() => service.trackStudyTime('learner', 'valid-session-123', seconds))
  await assert.rejects(() => service.trackStudyTime('learner', '', 60))
  assert.equal(writes, 0)
  await service.trackStudyTime('learner', 'valid-session-123', 60)
  assert.equal(writes, 1)
})

