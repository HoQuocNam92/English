'use client';
import { LearningTrail } from './LearningTrail';
import { buildLearningTrail } from '../../../../../packages/shared-kernel/src/learning-trail';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/shared/api/api-client';
import { AppIcon } from './AppIcon';
import { DailyLearningPath } from './DailyLearningPath';
import { ContinuationPlans } from './ContinuationPlans';

type PathLesson = { id: string; title: string; href: string; week: number; completed: boolean; estimatedMinutes: number; vocabularyCount: number; vocabularyReviewComplete?: boolean };
type PathDomain = {
  id: string; name: string; available: boolean; lessons: PathLesson[];
  completedLessons: number; totalLessons: number; nextLesson: PathLesson | null;
  state: 'in_progress' | 'assessment_due' | 'review_needed' | 'complete';
  assessment: { id: string; title: string; href: string; passingScorePercent: number; passed: boolean; scorePercent: number | null } | null;
};
type Path = {
  dailyMinutes: number; configured: true; level: { code: string; name: string }; domains: PathDomain[];
  completedLessons: number; totalLessons: number; allCompleted: boolean; canAdvance: boolean;
  nextLevel: { code: string; name: string } | null; finalLevel: boolean;
};

const actionClass = 'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50 sm:w-auto';
const secondaryClass = 'inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5 sm:w-auto';

export function LearningPathJourney({ full = false, lessonId, onAvailability }: { full?: boolean; lessonId?: string; onAvailability?: (available: boolean) => void }) {
  const [path, setPath] = useState<Path | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [advancing, setAdvancing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const sequence = useRef(0);

  useEffect(() => {
    let current = true;
    const refresh = async () => {
      const request = ++sequence.current;
      try {
        const result = await apiClient.get<Path | { configured: false }>('/progress/me/learning-path');
        if (!current || request !== sequence.current) return;
        setPath(result.configured ? result : null);
        onAvailability?.(result.configured);
        setError('');
      } catch (cause: any) {
        if (current && request === sequence.current) setError(cause?.message || 'Không thể tải bước học tiếp theo.');
      } finally { if (current && request === sequence.current) setLoading(false); }
    };
    void refresh();
    window.addEventListener('techenglish:learning-updated', refresh);
    window.addEventListener('techenglish:learning-path-changed', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('pageshow', refresh);
    return () => { current = false; window.removeEventListener('techenglish:learning-updated', refresh); window.removeEventListener('techenglish:learning-path-changed', refresh); window.removeEventListener('focus', refresh); window.removeEventListener('pageshow', refresh); };
  }, [reload, onAvailability]);

  const advance = async () => {
    if (!path?.canAdvance || advancing) return;
    setAdvancing(true); setError('');
    try {
      const next = await apiClient.post<Path>('/progress/me/learning-path/advance', { fromLevelCode: path.level.code });
      ++sequence.current;
      setPath(next); setConfirm(false);
      window.dispatchEvent(new CustomEvent('techenglish:learning-path-changed'));
    } catch (cause: any) {
      setError(cause?.message || 'Không thể chuyển cấp. Hãy tải lại lộ trình.');
      setConfirm(false);
    } finally { setAdvancing(false); }
  };

  if (loading) return <div role="status" className="rounded-2xl border border-outline-variant bg-white p-5 text-sm text-on-surface-variant">Đang tìm bước học tiếp theo…</div>;
  if (!path) return error ? <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}<button type="button" onClick={() => { setLoading(true); setReload(value => value + 1); }} className="ml-3 underline">Thử lại</button></div> : null;

  const practiceStep = buildLearningTrail(path.domains).next;
  const focus = path.domains.find(domain => domain.lessons.some(lesson => lesson.id === lessonId));
  const actionDomain = focus && focus.state !== 'complete' ? focus : path.domains.find(domain => domain.state !== 'complete') ?? path.domains[0];
  const readAll = path.domains.every(domain => domain.available) && path.totalLessons > 0 && path.completedLessons === path.totalLessons;
  const percent = path.totalLessons ? Math.round(path.completedLessons / path.totalLessons * 100) : 0;
  const title = path.allCompleted
    ? path.finalLevel ? 'Bạn đã hoàn thành lộ trình Chuyên nghiệp' : `Đã hoàn thành cấp ${path.level.name}`
    : readAll ? 'Đã học xong bài — tiếp tục kiểm tra tổng kết' : 'Bước học tiếp theo';

  return <div className="space-y-5">
    <section aria-label="Tổng kết và bước học tiếp theo" className={`rounded-3xl border p-4 shadow-sm sm:p-6 ${path.allCompleted ? 'border-emerald-200 bg-emerald-50' : 'border-outline-variant bg-white'}`}>
      <div className="flex items-start gap-3"><AppIcon className={`mt-1 text-2xl ${path.allCompleted ? 'text-emerald-700' : 'text-primary'}`}>{path.allCompleted ? 'workspace_premium' : 'route'}</AppIcon><div className="min-w-0"><p className="text-xs font-bold uppercase text-primary">Lộ trình · {path.level.name}</p><h2 className="mt-1 text-xl font-bold leading-7">{title}</h2><p className="mt-2 text-sm leading-6 text-on-surface-variant">{path.completedLessons}/{path.totalLessons} bài trong chuỗi cốt lõi đã học. Hoàn thành cấp cần học đủ bài và đạt bài luyện tập tổng kết của từng ngành đã chọn.</p></div></div>
      <div className="mt-5 flex items-center justify-between gap-3 text-xs font-semibold text-on-surface-variant"><span>Tiến độ bài học</span><span className="text-primary">{path.completedLessons}/{path.totalLessons} bài · {percent}%</span></div>
      <div role="progressbar" aria-label="Tiến độ đọc bài trong chuỗi" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} /></div>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {!path.allCompleted && <div className={`mt-6 grid gap-4 ${practiceStep?.kind === 'review' && actionDomain ? 'lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]' : ''}`}>
        {actionDomain && <div className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{actionDomain.nextLesson ? 'Tiếp tục học' : 'Bài tổng kết'}</p>{actionDomain.state === 'review_needed' && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Cần củng cố</span>}</div>
          <h3 className="mt-2 text-lg font-bold leading-7">{actionDomain.name}</h3>
          {!actionDomain.available ? <p className="mt-3 text-sm leading-6 text-on-surface-variant">Chuỗi bài đang được bổ sung. Bạn có thể ôn từ vựng hoặc khám phá các bài khác.</p>
            : actionDomain.nextLesson ? <><p className="mt-2 text-sm leading-6 text-on-surface-variant">{actionDomain.nextLesson.title}</p><div className="mt-auto pt-5"><Link href={actionDomain.nextLesson.href} className={actionClass}>Học bài tiếp theo <AppIcon className="text-lg">arrow_forward</AppIcon></Link></div></>
            : actionDomain.assessment ? <>
              <div className="my-4 grid grid-cols-2 gap-3"><div className="rounded-xl border border-slate-200 bg-white px-3 py-3"><p className="text-xs text-on-surface-variant">Kết quả gần nhất</p><p className="mt-1 text-2xl font-bold tabular-nums">{actionDomain.assessment.scorePercent === null ? 'Chưa làm' : `${Math.round(actionDomain.assessment.scorePercent)}%`}</p></div><div className="rounded-xl border border-slate-200 bg-white px-3 py-3"><p className="text-xs text-on-surface-variant">Mục tiêu đạt</p><p className="mt-1 text-2xl font-bold tabular-nums text-primary">{actionDomain.assessment.passingScorePercent}%</p></div></div>
              <p className="text-sm leading-6 text-on-surface-variant">{actionDomain.state === 'review_needed' ? 'Ôn phần chưa vững rồi làm lại khi bạn sẵn sàng.' : 'Bạn đã học đủ bài. Làm tổng kết để kiểm tra mức hiểu.'}</p>
              <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row sm:flex-wrap"><Link href={actionDomain.assessment.href} className={actionClass}>{actionDomain.state === 'review_needed' ? 'Làm lại bài tổng kết' : 'Làm bài tổng kết'} <span aria-hidden="true">→</span></Link><Link href={actionDomain.lessons[0].href} className={secondaryClass}>Ôn lại bài học</Link></div>
            </> : <p className="mt-3 text-sm leading-6 text-on-surface-variant">Bạn đã học đủ bài. Bài tổng kết đang được bổ sung; chưa thể chuyển cấp.</p>}
        </div>}
        {practiceStep?.kind === 'review' && <div className="flex min-w-0 flex-col items-start rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:p-5">
          <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary"><AppIcon className="text-xl">style</AppIcon></span>
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Luyện tập bổ sung</p><h3 className="mt-2 text-lg font-bold leading-7">{practiceStep.title}</h3><p className="mt-2 text-sm leading-6 text-on-surface-variant">Ôn thuật ngữ bằng flashcards để nhớ chắc hơn trước khi tiếp tục.</p>
          <div className="mt-auto w-full pt-5"><Link href={practiceStep.href} className={secondaryClass}>Luyện từ vừa học <span aria-hidden="true" className="ml-2">→</span></Link></div>
        </div>}
      </div>}

      {path.allCompleted && <p className="mt-3 text-sm leading-6">Bạn đã học đủ chuỗi bài và đạt bài tổng kết. Đây là kết quả học tập trên nền tảng, không phải chứng chỉ nghề nghiệp.</p>}
      {path.canAdvance && path.nextLevel && <div className="mt-4 space-y-3">
        {confirm ? <div className="rounded-xl border border-primary/20 bg-white p-4"><p className="text-sm leading-6">Chuyển từ <strong>{path.level.name}</strong> sang <strong>{path.nextLevel.name}</strong>? Lịch sử và bài đã hoàn thành được giữ lại. Các bài mới bắt đầu theo tiến độ riêng.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={advancing} onClick={() => void advance()} className={actionClass}>{advancing ? 'Đang chuyển…' : `Xác nhận học ${path.nextLevel.name}`}</button><button type="button" disabled={advancing} onClick={() => setConfirm(false)} className={secondaryClass}>Ở lại ôn tập</button></div></div>
          : <button type="button" onClick={() => setConfirm(true)} className={actionClass}>Học tiếp cấp {path.nextLevel.name} <AppIcon className="text-lg">arrow_forward</AppIcon></button>}
      </div>}
      {path.allCompleted && !path.finalLevel && !path.nextLevel && <p className="mt-3 text-sm">Nội dung cấp tiếp theo đang được bổ sung. Bạn có thể tiếp tục ôn tập.</p>}
      <div className="mt-5 flex flex-wrap gap-3 border-t border-outline-variant/60 pt-4">{practiceStep?.kind !== 'review' && <Link href="/learn/flashcards" className={secondaryClass}>Ôn flashcards</Link>}{path.allCompleted && <><Link href="/learn/certifications" className={secondaryClass}>Khám phá chứng chỉ</Link><Link href="/learn/profile?tab=goals" className={secondaryClass}>Chọn thêm ngành học</Link></>}{!full && <Link href="/learn/plan" className={secondaryClass}>Xem toàn bộ lộ trình</Link>}</div>
    </section>

    {path.allCompleted && path.finalLevel && <ContinuationPlans />}

    {full && <>
      <div className="grid gap-3 sm:grid-cols-2">{path.domains.map(domain => <section key={domain.id} className="rounded-2xl border border-outline-variant bg-white p-4"><h3 className="font-bold">{domain.name}</h3><p className="mt-2 text-sm">{domain.completedLessons}/{domain.totalLessons} bài đã học</p><p className={`mt-1 text-sm font-semibold ${domain.state === 'complete' ? 'text-emerald-700' : 'text-on-surface-variant'}`}>{domain.state === 'complete' ? 'Đã hoàn thành cấp ở ngành này' : domain.state === 'assessment_due' ? 'Còn bài tổng kết' : domain.state === 'review_needed' ? 'Cần ôn và làm lại tổng kết' : domain.available ? 'Đang học' : 'Nội dung đang bổ sung'}</p></section>)}</div>
      <LearningTrail domains={path.domains} />
      <details className="rounded-2xl border border-outline-variant bg-white p-4"><summary className="cursor-pointer font-bold text-primary">Xem lịch bài mới theo tuần và ngày</summary><div className="mt-4"><DailyLearningPath domains={path.domains} dailyMinutes={path.dailyMinutes} /></div></details>
    </>}
  </div>;
}
