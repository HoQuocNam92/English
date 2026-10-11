export function dashboardDateRange(period: string, now = new Date()) {
  const vietnamDay = new Date(now.getTime() + 7 * 3600000);
  const dateTo = vietnamDay.toISOString().slice(0, 10);
  const dateFrom = period === 'month'
    ? `${dateTo.slice(0, 8)}01`
    : new Date(vietnamDay.getTime() - 6 * 86400000).toISOString().slice(0, 10);
  return { dateFrom, dateTo };
}
