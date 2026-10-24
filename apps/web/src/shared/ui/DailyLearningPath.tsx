import Link from 'next/link';

type Domain = {
  id: string; name: string; available: boolean;
  lessons: { id: string; title: string; href: string; completed: boolean; estimatedMinutes: number; vocabularyCount: number }[];
  assessment: { id: string; href: string; passed: boolean; passingScorePercent: number } | null;
};

export function DailyLearningPath({ domains, dailyMinutes }: { domains: Domain[]; dailyMinutes: number }) {
  const budget = Math.max(1, dailyMinutes || 30);
  let day = 1;
  const sessions = domains.flatMap(domain => {
    const lessons = domain.lessons.map(lesson => {
      const start = day;
      const minutes = Math.max(1, lesson.estimatedMinutes || budget);
      day += Math.ceil(minutes / budget);
      return { id: lesson.id, start, end: day - 1, domain: domain.name, title: lesson.title, href: lesson.href, completed: lesson.completed, ready: true, minutes, words: lesson.vocabularyCount, assessment: false, passingScore: 0 };
    });
    if (domain.assessment) {
      const start = day++;
      lessons.push({ id: `assessment-${domain.assessment.id}`, start, end: start, domain: domain.name, title: 'Ôn tập và kiểm tra tổng kết', href: domain.assessment.href, completed: domain.assessment.passed, ready: domain.available && domain.lessons.every(lesson => lesson.completed), minutes: 0, words: 0, assessment: true, passingScore: domain.assessment.passingScorePercent });
    }
    return lessons;
  });
  const next = sessions.find(session => !session.completed);
  return <section className="rounded-2xl border border-outline-variant bg-white p-4 sm:p-6">
    <h2 className="text-xl font-bold">Lịch học theo ngày</h2>
    <p className="mt-2 text-sm leading-6 text-on-surface-variant">{domains.length} ngành · {sessions.filter(session => !session.assessment).length} chủ đề/bài học · {sessions.filter(session => session.assessment).length} bài tổng kết. Nhịp học dự kiến {budget} phút/ngày.</p>
    <p className="mt-2 text-xs leading-5 text-on-surface-variant">Ngày học là thứ tự gợi ý, không phải hạn chót. Mỗi chủ đề dài được chia nhiều ngày theo thời lượng của bạn. Chỉ khi hoàn thành bài, cả chủ đề mới được ghi nhận; hệ thống chưa đo tiến độ từng buổi. Ngày tổng kết có thời lượng riêng hiển thị trước khi bắt đầu.</p>
    {next && <p className="mt-4 rounded-xl bg-primary/5 p-3 text-sm font-semibold text-primary">Buổi tiếp theo: {next.domain} · {next.title}</p>}
    <ol className="mt-5 space-y-3">{sessions.map(session => <li key={session.id} className={`min-w-0 rounded-xl border p-4 ${session.completed ? 'border-emerald-200 bg-emerald-50/50' : next?.id === session.id ? 'border-primary/40 bg-primary/5' : 'border-outline-variant'}`}>
      <div className="flex flex-wrap justify-between gap-2 text-xs font-bold"><span className="text-primary">Ngày học {session.start}{session.end > session.start ? `–${session.end}` : ''} · {session.domain}</span><span className={session.completed ? 'text-emerald-700' : 'text-on-surface-variant'}>{session.completed ? session.assessment ? 'Đã đạt tổng kết' : 'Bài đã hoàn thành' : session.ready ? 'Chưa hoàn thành' : 'Học đủ bài trước'}</span></div>
      <h3 className="mt-2 break-words text-sm font-bold leading-6">{session.title}</h3>
      <p className="mt-2 text-xs leading-5 text-on-surface-variant">{session.assessment ? `Ôn lại các chủ đề của ngành này rồi làm tổng kết. Mức đạt: ${session.passingScore}%.` : `1 chủ đề · ${session.words} từ liên kết trong bài · khoảng ${session.minutes} phút tổng cộng${session.end > session.start ? `, chia ${session.end - session.start + 1} ngày` : ''}. Đọc nội dung, xem ví dụ và ôn các thuật ngữ của bài.`}</p>
      {session.ready ? <Link href={session.href} className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">{session.completed ? 'Ôn lại' : session.assessment ? 'Làm tổng kết' : 'Mở bài học'} →</Link> : <p className="mt-3 text-xs text-on-surface-variant">Hoàn thành các bài của ngành này để làm tổng kết.</p>}
    </li>)}</ol>
    {!sessions.length && <p className="mt-4 text-sm">Chưa có nội dung phù hợp để xếp lịch.</p>}
  </section>;
}
