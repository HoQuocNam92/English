export function dailyVocabularyProgress(studied: number = 0, target?: number) {
  const count = Number.isFinite(studied) ? Math.max(0, Math.floor(studied)) : 0;
  const goal = typeof target === 'number' && Number.isFinite(target) ? Math.max(0, Math.floor(target)) : 0;
  return {
    label: goal > 0 && count >= goal ? `Đã đạt mục tiêu ${goal} từ hôm nay`
      : goal > 0 ? `Hôm nay: ${count}/${goal} từ mới` : `Hôm nay đã học ${count} từ mới`,
    extra: goal > 0 ? Math.max(0, count - goal) : 0,
  };
}
