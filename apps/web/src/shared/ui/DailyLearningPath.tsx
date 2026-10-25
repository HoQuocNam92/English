import Link from 'next/link';
import { buildWeeklyStudySchedule, type StudyDomain } from '../../../../../packages/shared-kernel/src/weekly-study-schedule';

export function DailyLearningPath({ domains, dailyMinutes }: { domains: StudyDomain[]; dailyMinutes: number }) {
  const { budget, weeks, days, next } = buildWeeklyStudySchedule(domains, dailyMinutes);
  return <section className="rounded-2xl border border-outline-variant bg-white p-4 sm:p-6">
    <h2 className="text-xl font-bold">Lộ trình theo tuần</h2>
    <p className="mt-2 text-sm leading-6 text-on-surface-variant">{weeks.length} tuần · {days.length} ngày học · {domains.reduce((sum, domain) => sum + domain.lessons.length, 0)} chủ đề/bài học · {days.filter(day => day.assessment).length} bài tổng kết. Nhịp học dự kiến {budget} phút/ngày.</p>
    <p className="mt-2 text-xs leading-5 text-on-surface-variant">Mở từng tuần để xem lịch mỗi ngày. Mỗi tuần có tối đa 7 ngày học; tuần cuối có thể ngắn hơn theo nội dung thực tế. Đây là thứ tự học gợi ý, không phải hạn chót. Bài dài được chia nhiều buổi và chỉ ghi nhận hoàn thành khi học xong cả bài.</p>
    {next && <p className="mt-4 rounded-xl bg-primary/5 p-3 text-sm font-semibold text-primary">Tiếp theo: Tuần {next.week} · Ngày {next.dayOfWeek} · {next.domain} · {next.title}</p>}
    <div className="mt-5 space-y-4">{weeks.map(week => <details key={week.week} open={next ? week.week >= next.week : week.week === 1} className="rounded-2xl border border-outline-variant">
      <summary className="cursor-pointer rounded-2xl p-4 marker:text-primary focus-visible:outline focus-visible:outline-primary">
        <span className="font-bold text-primary">Tuần {week.week}</span>
        <span className="mt-1 block text-xs leading-5 text-on-surface-variant">{week.days.length} ngày học · {week.topics} chủ đề{week.days.some(day => day.assessment) ? ' · Có tổng kết' : ''} · {week.days.every(day => day.completed) ? 'Các bài trong tuần đã hoàn thành' : 'Còn nội dung chưa hoàn thành'}</span>
      </summary>
      <ol className="space-y-3 border-t border-outline-variant p-3 sm:p-4">{week.days.map(day => <li key={day.id} className={`min-w-0 rounded-xl border p-4 ${day.completed ? 'border-emerald-200 bg-emerald-50/50' : next?.id === day.id ? 'border-primary/40 bg-primary/5' : 'border-outline-variant'}`}>
        <div className="flex flex-wrap justify-between gap-2 text-xs font-bold"><span className="text-primary">Ngày {day.dayOfWeek} · {day.domain}</span><span className={day.completed ? 'text-emerald-700' : 'text-on-surface-variant'}>{day.completed ? day.assessment ? 'Đã đạt tổng kết' : 'Bài đã hoàn thành' : day.ready ? 'Chưa hoàn thành bài' : 'Học đủ bài trước'}</span></div>
        <h3 className="mt-2 break-words text-sm font-bold leading-6">{day.title}{day.parts > 1 && <span className="font-normal"> · Buổi {day.part}/{day.parts}</span>}</h3>
        <p className="mt-2 text-xs leading-5 text-on-surface-variant">{day.assessment ? `Ôn lại các chủ đề của ngành này rồi làm tổng kết. Mức đạt: ${day.passingScore}%. Thời lượng hiển thị trước khi bắt đầu bài kiểm tra.` : `1 chủ đề · ${day.words} từ liên kết trong cả bài · khoảng ${day.minutes} phút trong ngày này. ${day.part === 1 ? 'Đọc nội dung và xem ví dụ của bài.' : 'Tiếp tục nội dung của cùng bài, xem lại ví dụ và ôn thuật ngữ.'}`}</p>
        {day.ready ? <Link href={day.href} className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">{day.completed ? 'Ôn lại' : day.assessment ? 'Làm tổng kết' : day.part > 1 ? 'Tiếp tục bài học' : 'Mở bài học'} →</Link> : <p className="mt-3 text-xs text-on-surface-variant">Hoàn thành các bài của ngành này để làm tổng kết.</p>}
      </li>)}</ol>
    </details>)}</div>
    {!days.length && <p className="mt-4 text-sm">Chưa có nội dung phù hợp để xếp lịch.</p>}
  </section>;
}
