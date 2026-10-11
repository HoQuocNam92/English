import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { activityDays } from './activity-days'

test('activity days have full weekdays, calendar dates and Vietnam day boundaries', () => {
  const days = activityDays('2026-10-05', '2026-10-11')
  assert.equal(days.length, 7)
  assert.equal(days[0].day, 'Thứ Hai, 05/10/2026')
  assert.equal(days[6].day, 'Chủ nhật, 11/10/2026')
  assert.equal(days[0].startOfDay.toISOString(), '2026-10-04T17:00:00.000Z')
  assert.equal(days[0].endOfDay.toISOString(), '2026-10-05T16:59:59.999Z')
  for (let i = 1; i < days.length; i++) assert.equal(days[i].startOfDay.getTime(), days[i - 1].endOfDay.getTime() + 1)
})

test('default dates follow Vietnam midnight and handle month and leap-year boundaries', () => {
  const days = activityDays(undefined, undefined, new Date('2026-09-30T18:00:00Z'))
  assert.equal(days.length, 7)
  assert.equal(days[6].day, 'Thứ Năm, 01/10/2026')
  assert.equal(activityDays('2024-02-28', '2024-03-01')[1].day, 'Thứ Năm, 29/02/2024')
  assert.equal(activityDays('2026-10-11', '2026-10-11').length, 1)
  assert.equal(activityDays('2026-01-01', '2026-10-11').length, 31)
})
