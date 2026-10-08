type AttemptTiming = { timeSpentSeconds?: number | null; startedAt?: string | null; submittedAt?: string | null; completedAt?: string | null };

export function formatAttemptDuration(attempt: AttemptTiming): string {
  const start = attempt.startedAt ? Date.parse(attempt.startedAt) : NaN;
  const end = attempt.submittedAt || attempt.completedAt;
  const elapsed = end ? (Date.parse(end) - start) / 1000 : NaN;
  const recorded = attempt.timeSpentSeconds;
  const seconds = Number.isFinite(elapsed) && elapsed >= 0 ? elapsed
    : typeof recorded === 'number' && Number.isFinite(recorded) && recorded >= 0 ? recorded : null;
  if (seconds === null) return 'Chưa ghi nhận';
  if (seconds < 1) return 'Dưới 1 giây';
  const rounded = Math.ceil(seconds);
  return `${Math.floor(rounded / 60)} phút ${rounded % 60} giây`;
}
