export function dueReminderDate(now: Date, reminderTime: string, timezone: string): string | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(reminderTime)) return null
  let formatter: Intl.DateTimeFormat
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
  try { formatter = new Intl.DateTimeFormat('en-GB', { ...options, timeZone: timezone }) }
  catch { formatter = new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'Asia/Ho_Chi_Minh' }) }
  const parts = formatter.formatToParts(now)
  const part = (name: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === name)!.value
  if (`${part('hour')}:${part('minute')}` < reminderTime) return null
  return `${part('year')}-${part('month')}-${part('day')}`
}
