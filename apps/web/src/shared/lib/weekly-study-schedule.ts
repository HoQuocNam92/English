export type StudyDomain = {
  id: string; name: string; available: boolean;
  lessons: { id: string; title: string; href: string; completed: boolean; estimatedMinutes: number; vocabularyCount: number }[];
  assessment: { id: string; href: string; passed: boolean; passingScorePercent: number } | null;
};

export function buildWeeklyStudySchedule(domains: StudyDomain[], dailyMinutes: number) {
  const budget = Number.isFinite(dailyMinutes) && dailyMinutes > 0 ? Math.max(1, Math.floor(dailyMinutes)) : 30;
  const days: { id: string; resourceId: string; day: number; week: number; dayOfWeek: number; domain: string; title: string; href: string; completed: boolean; ready: boolean; minutes: number | null; words: number; part: number; parts: number; assessment: boolean; passingScore: number }[] = [];
  const append = (item: Omit<typeof days[number], 'day' | 'week' | 'dayOfWeek'>) => {
    const day = days.length + 1;
    days.push({ ...item, day, week: Math.floor((day - 1) / 7) + 1, dayOfWeek: (day - 1) % 7 + 1 });
  };
  for (const domain of domains) {
    for (const lesson of domain.lessons) {
      const minutes = Math.max(1, lesson.estimatedMinutes || budget);
      const parts = Math.ceil(minutes / budget);
      for (let part = 1; part <= parts; part++) append({
        id: `${lesson.id}:${part}`, resourceId: lesson.id, domain: domain.name,
        title: lesson.title, href: lesson.href, completed: lesson.completed, ready: true,
        minutes: Math.min(budget, minutes - (part - 1) * budget), words: lesson.vocabularyCount,
        part, parts, assessment: false, passingScore: 0,
      });
    }
    if (domain.assessment) append({
      id: `assessment:${domain.assessment.id}`, resourceId: domain.assessment.id, domain: domain.name,
      title: 'Ôn tập và kiểm tra tổng kết', href: domain.assessment.href,
      completed: domain.assessment.passed, ready: domain.available && domain.lessons.length > 0 && domain.lessons.every(lesson => lesson.completed),
      minutes: null, words: 0, part: 1, parts: 1, assessment: true, passingScore: domain.assessment.passingScorePercent,
    });
  }
  const weeks = Array.from({ length: Math.ceil(days.length / 7) }, (_, index) => {
    const items = days.slice(index * 7, index * 7 + 7);
    return { week: index + 1, days: items, topics: new Set(items.filter(item => !item.assessment).map(item => item.resourceId)).size };
  });
  return { budget, weeks, days, next: days.find(day => !day.completed) ?? null };
}
