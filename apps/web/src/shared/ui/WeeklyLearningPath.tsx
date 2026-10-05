import Link from 'next/link';
import { ArrowRight, Flag, MapPin } from 'lucide-react';

export type WeekStep = { id: string; week: number; title: string; reason: string; actionUrl: string; kind: string };

export function WeeklyLearningPath({ steps }: { steps: WeekStep[] }) {
  const weeks = [...new Set(steps.map(step => step.week))].sort((a, b) => a - b);
  if (!weeks.length) return <p className="mt-5 text-sm text-on-surface-variant">Chưa có bài học phù hợp với mục tiêu của bạn. Hãy điều chỉnh mục tiêu trong hồ sơ.</p>;
  return <div className="mt-7">
    <p className="mb-6 flex items-center gap-2 text-xs text-on-surface-variant"><MapPin size={15} className="text-primary" />Đi từng bước theo thứ tự tuần. Bạn có thể mở lại bài học bất cứ lúc nào.</p>
    <div className="relative">
      <div aria-hidden="true" className="absolute bottom-6 left-5 top-5 w-1 rounded-full bg-violet-200 sm:hidden" />
    <ol className="relative space-y-8 sm:space-y-0">
      {weeks.map((week, index) => <li key={week} className="relative pl-14 sm:grid sm:grid-cols-[1fr_64px_1fr] sm:gap-x-4 sm:pb-10 sm:pl-0">
        <div aria-hidden="true" className="absolute bottom-0 left-1/2 top-0 hidden w-1 -translate-x-1/2 bg-violet-200 sm:block" />
        <div className={`absolute left-0 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-primary text-white shadow-sm sm:left-1/2 sm:h-14 sm:w-14 sm:-translate-x-1/2 ${index === 0 ? 'ring-2 ring-violet-200' : ''}`}><Flag size={18} aria-hidden="true" /></div>
        <article className={`relative rounded-2xl border border-violet-200 bg-white p-5 shadow-[0_4px_20px_rgba(53,37,205,0.04)] sm:col-span-1 ${index % 2 ? 'sm:col-start-3' : 'sm:col-start-1'}`}>
          <span aria-hidden="true" className={`absolute top-9 hidden h-0.5 w-12 bg-violet-200 sm:block ${index % 2 ? '-left-12' : '-right-12'}`} />
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Tuần {week}</p>
          <div className="mt-3 space-y-4">{steps.filter(step => step.week === week).map((step, i) => <div key={`${step.id}-${i}`} className={i ? 'border-t border-violet-100 pt-4' : ''}><h3 className="text-sm font-bold leading-6">{step.title}</h3><p className="mt-1 text-xs leading-6 text-on-surface-variant">{step.reason.replace(/\bQuiz\b/gi, 'bài kiểm tra')}</p><Link href={step.actionUrl} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/15">{step.kind === 'certificate' ? 'Học theo chứng chỉ' : step.kind === 'vocabulary' ? 'Học từ vựng' : 'Mở bài học'}<ArrowRight size={14} /></Link></div>)}</div>
        </article>
      </li>)}
    </ol>
    </div>
    <p className="relative mx-auto mt-3 w-fit rounded-full bg-violet-100 px-4 py-2 text-xs font-semibold text-primary">Tiếp tục học và ôn tập theo mục tiêu của bạn</p>
  </div>;
}
