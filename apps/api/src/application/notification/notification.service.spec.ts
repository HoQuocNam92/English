import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { ConfigService } from '@nestjs/config'
import { NotificationService } from './notification.service'
import { dueReminderDate } from './reminder-time'
import { ReminderJobController } from '../../presentation/reminder-job.controller'

test('local date, catch-up, midnight and invalid timezone', () => {
  const now = new Date('2026-10-05T15:31:00Z')
  assert.equal(dueReminderDate(now, '22:30', 'Asia/Ho_Chi_Minh'), '2026-10-05')
  assert.equal(dueReminderDate(now, '22:32', 'Asia/Ho_Chi_Minh'), null)
  assert.equal(dueReminderDate(new Date('2026-10-05T17:00:00Z'), '00:00', 'Asia/Ho_Chi_Minh'), '2026-10-06')
  assert.equal(dueReminderDate(now, '22:30', 'invalid'), '2026-10-05')
  assert.equal(dueReminderDate(now, '25:00', 'UTC'), null)
})

test('in-web reminders work without Firebase and repeated calls do not duplicate', async () => {
  const records = new Set<string>()
  const prisma: any = {
    learnerProfile: { findMany: async () => [{ userId: 'learner', reminderTime: '20:00', dailyVocabularyTarget: 10, dailyStudyTargetMinutes: 30, user: { userDetail: null, pushSubscriptions: [] } }] },
    learningNotification: { createMany: async ({ data }: any) => {
      const key = data[0].userId + data[0].localDate
      if (records.has(key)) return { count: 0 }
      records.add(key); return { count: 1 }
    } },
  }
  const service = new NotificationService(prisma, new ConfigService())
  const now = new Date('2026-10-05T14:00:00Z')
  assert.deepEqual(await service.dispatchLearningReminders(now), { created: 1 })
  assert.deepEqual(await service.dispatchLearningReminders(now), { created: 0 })
})

test('pending and read operations are scoped to the authenticated user', async () => {
  const queries: any[] = []
  const prisma: any = { learningNotification: { findMany: async (q: any) => { queries.push(q); return [] }, updateMany: async (q: any) => { queries.push(q); return { count: 0 } } } }
  const service = new NotificationService(prisma, new ConfigService())
  await service.getPending('A'); await service.markRead('A', 'other-users-notification')
  assert.equal(queries[0].where.userId, 'A')
  assert.equal(queries[1].where.userId, 'A')
})

test('scheduler endpoint rejects missing, incorrect and unconfigured keys', async () => {
  let calls = 0
  const service: any = { dispatchLearningReminders: async () => { calls++; return { created: 1 } } }
  const secret = 'a'.repeat(32)
  const controller = new ReminderJobController(service, new ConfigService({ LEARNING_REMINDER_JOB_KEY: secret }))
  assert.throws(() => controller.run(), /Unauthorized/)
  assert.throws(() => controller.run('b'.repeat(32)), /Unauthorized/)
  assert.deepEqual(await controller.run(secret), { created: 1 })
  assert.equal(calls, 1)
  assert.throws(() => new ReminderJobController(service, new ConfigService()).run(secret), /not configured/)
})
