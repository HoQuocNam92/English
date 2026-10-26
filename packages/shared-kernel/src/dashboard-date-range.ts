export function dashboardDateRange(period: string, now = new Date()) {
  const vietnamDay = new Date(now.getTime() + 7 * 3600000);
  const dateTo = vietnamDay.toISOString().slice(0, 10);
  const dateFrom = period === 'year' ? `${dateTo.slice(0, 4)}-01-01`
    : period === 'month' ? `${dateTo.slice(0, 8)}01`
      : new Date(vietnamDay.getTime() - 6 * 86400000).toISOString().slice(0, 10);
  return { dateFrom, dateTo };
}

export function vocabularyActivityRange(period: string, from: string, to: string, now = new Date()) {
  const today = dashboardDateRange('week', now).dateTo;
  const { dateFrom, dateTo } = period === 'custom' ? { dateFrom: from, dateTo: to } : dashboardDateRange(period, now);
  const isDay = (day: string) => /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(Date.parse(day)) && new Date(day).toISOString().slice(0, 10) === day;
  const count = isDay(dateFrom) && isDay(dateTo) ? Math.round((Date.parse(dateTo) - Date.parse(dateFrom)) / 86400000) + 1 : 0;
  const valid = count > 0 && count <= 366 && dateTo <= today;
  return { dateFrom, dateTo, count, valid, error: valid ? '' : 'Chọn khoảng ngày hợp lệ, tối đa 366 ngày và không vượt quá hôm nay.' };
}
