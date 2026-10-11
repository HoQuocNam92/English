const DAY_MS = 86400000
const VIETNAM_OFFSET_MS = 7 * 3600000
const weekdays = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

/** Daily analytics buckets use Vietnam calendar days, independent of server timezone. */
export function activityDays(dateFrom?: string, dateTo?: string, now = new Date()) {
  const lastKey = dateTo ?? new Date(now.getTime() + VIETNAM_OFFSET_MS).toISOString().slice(0, 10)
  const last = new Date(`${lastKey}T00:00:00+07:00`).getTime()
  const first = dateFrom ? new Date(`${dateFrom}T00:00:00+07:00`).getTime() : last - 6 * DAY_MS
  const count = Math.min(31, Math.max(1, Math.floor((last - first) / DAY_MS) + 1))
  return Array.from({ length: count }, (_, i) => {
    const start = last - (count - 1 - i) * DAY_MS
    const calendarDay = new Date(start + VIETNAM_OFFSET_MS)
    const date = calendarDay.toISOString().slice(0, 10)
    const [year, month, day] = date.split('-')
    return {
      day: `${weekdays[calendarDay.getUTCDay()]}, ${day}/${month}/${year}`,
      startOfDay: new Date(start),
      endOfDay: new Date(start + DAY_MS - 1),
    }
  })
}
