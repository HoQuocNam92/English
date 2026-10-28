const count = (value: unknown) => Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 0);
export function homeSummary(journey: any) {
  const configured = journey?.configured === true;
  const targets = journey?.targets ?? {};
  const progress = journey?.progress ?? {};
  const wordsLeft = Math.max(0, count(targets.vocabularyPerDay) - count(progress.vocabularyToday));
  const minutesLeft = Math.max(0, count(targets.minutesPerDay) - count(progress.studyMinutesToday));
  const complete = configured && wordsLeft === 0 && minutesLeft === 0;
  const title = !configured ? 'Bắt đầu hành trình học tiếng Anh CNTT' : complete ? 'Bạn đã đạt mục tiêu học tập hôm nay!'
    : wordsLeft && minutesLeft ? `Còn ${wordsLeft} từ và ${minutesLeft} phút nữa là đạt mục tiêu hôm nay`
    : wordsLeft ? `Còn ${wordsLeft} từ nữa là đạt mục tiêu hôm nay` : `Còn ${minutesLeft} phút nữa là đạt mục tiêu hôm nay`;
  const metrics = [
    { label: 'Từ vựng', value: count(progress.vocabularyToday), target: count(targets.vocabularyPerDay), unit: 'từ' },
    { label: 'Thời gian học', value: count(progress.studyMinutesToday), target: count(targets.minutesPerDay), unit: 'phút' },
    { label: 'Bài thi tuần này', value: count(progress.examsWeek), target: count(targets.examsPerWeek), unit: 'bài' },
  ].map(metric => ({ ...metric, percent: metric.target ? Math.min(100, Math.round(metric.value / metric.target * 100)) : 0 }));
  return { configured, complete, title, wordsLeft, minutesLeft, metrics, targets };
}
