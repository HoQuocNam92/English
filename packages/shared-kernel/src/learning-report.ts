type Activity = { id: string; resourceType: string; title?: string; status: string; completionPercent: number; completedAt?: string | null; updatedAt?: string | null };
export type LearningReportPayload = {
  summary?: { completedLessons?: number; startedLessons?: number; studiedWords?: number };
  progress?: Activity[];
  certProgress?: { certificateId: string; certificateName: string; completedLessons: number; totalLessons: number; examAttempts: number; avgScore: number | null; completionPercent: number; hasStarted?: boolean }[];
  recentAttempts?: { id: string; exam?: { title?: string }; passed?: boolean; scorePercent?: number | null }[];
};
export type CourseReportPayload = {
  configured: boolean; level?: { name: string };
  domains?: { id: string; name: string; state: string; completedLessons: number; totalLessons: number; assessment: { passed: boolean; scorePercent: number | null; passingScorePercent: number } | null }[];
};
const count = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
export function learningReport(data: LearningReportPayload, course: CourseReportPayload | null) {
  const activities = (data.progress ?? []).filter(item => item.resourceType === 'lesson' && (item.status !== 'not_started' || item.completionPercent > 0));
  const completed = activities.filter(item => item.status === 'completed' || item.completionPercent >= 100).length;
  const completedLessons = count(data.summary?.completedLessons ?? completed);
  const startedLessons = count(data.summary?.startedLessons ?? activities.length);
  return {
    completedLessons, inProgressLessons: Math.max(0, startedLessons - completedLessons), studiedWords: count(data.summary?.studiedWords),
    levelName: course?.configured ? course.level?.name : undefined,
    domains: course?.configured ? (course.domains ?? []).map(domain => ({
      ...domain,
      percent: domain.totalLessons > 0 ? Math.min(100, Math.round(domain.completedLessons / domain.totalLessons * 100)) : 0,
      resultLabel: domain.state === 'complete' ? 'Đã đạt tổng kết' : domain.state === 'review_needed' ? 'Tổng kết chưa đạt' : domain.state === 'assessment_due' ? 'Chưa làm tổng kết' : 'Chưa học đủ bài',
    })) : [],
    activities: [...activities].sort((a, b) => {
      const timestamp = (item: Activity) => { const date = Date.parse(item.completedAt ?? item.updatedAt ?? ''); return Number.isFinite(date) ? date : 0; };
      return timestamp(b) - timestamp(a);
    }).slice(0, 10),
    certificates: (data.certProgress ?? []).filter(cert => cert.hasStarted || cert.completedLessons > 0 || cert.examAttempts > 0 || cert.completionPercent > 0), recentAttempts: (data.recentAttempts ?? []).slice(0, 5),
  };
}
