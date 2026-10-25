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

const actionClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-50';
const secondaryClass = 'inline-flex min-h-11 items-center justify-center rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5';

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
    <section aria-label="Tổng kết và bước học tiếp theo" className={`rounded-2xl border p-4 sm:p-6 ${path.allCompleted ? 'border-emerald-200 bg-emerald-50' : 'border-primary/20 bg-primary/5'}`}>
      <div className="flex items-start gap-3"><AppIcon className={`mt-1 text-2xl ${path.allCompleted ? 'text-emerald-700' : 'text-primary'}`}>{path.allCompleted ? 'workspace_premium' : 'route'}</AppIcon><div className="min-w-0"><p className="text-xs font-bold uppercase text-primary">Lộ trình · {path.level.name}</p><h2 className="mt-1 text-xl font-bold leading-7">{title}</h2><p className="mt-2 text-sm leading-6 text-on-surface-variant">{path.completedLessons}/{path.totalLessons} bài trong chuỗi cốt lõi đã học. Hoàn thành cấp cần học đủ bài và đạt bài luyện tập tổng kết của từng ngành đã chọn.</p></div></div>
      <progress aria-label="Tiến độ đọc bài trong chuỗi" max={100} value={percent} className="mt-4 h-2 w-full accent-primary" />
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}

      {practiceStep?.kind === 'review' && <div className="mt-4 rounded-xl border border-primary/20 bg-white p-4"><p className="mb-3 text-sm font-semibold">Bước luyện tập tiếp theo: {practiceStep.title}</p><Link href={practiceStep.href} className={actionClass}>Luyện từ vừa học →</Link></div>}
      {!path.allCompleted && actionDomain && <div className="mt-4 space-y-3">
        <p className="text-sm font-bold">{actionDomain.name}</p>
        {!actionDomain.available ? <p className="text-sm">Chuỗi bài đang được bổ sung. Bạn có thể ôn từ vựng hoặc khám phá các bài khác.</p>
          : actionDomain.nextLesson ? <><p className="text-sm leading-6">{actionDomain.nextLesson.title}</p><Link href={actionDomain.nextLesson.href} className={actionClass}>Học bài tiếp theo <AppIcon className="text-lg">arrow_forward</AppIcon></Link></>
          : actionDomain.assessment ? <><p className="text-sm leading-6">{actionDomain.state === 'review_needed' ? `Kết quả gần nhất: ${Math.round(actionDomain.assessment.scorePercent ?? 0)}%. Ôn lại nội dung chưa vững rồi làm lại.` : 'Bạn đã học đủ bài của ngành này. Làm bài tổng kết để kiểm tra mức hiểu.'} Mức đạt: {actionDomain.assessment.passingScorePercent}%.</p><div className="flex flex-wrap gap-2"><Link href={actionDomain.assessment.href} className={actionClass}>{actionDomain.state === 'review_needed' ? 'Làm lại bài tổng kết' : 'Làm bài tổng kết'}</Link><Link href={actionDomain.lessons[0].href} className={secondaryClass}>Ôn lại bài học</Link></div></>
          : <p className="text-sm leading-6">Bạn đã học đủ bài. Bài tổng kết đang được bổ sung; hãy tiếp tục ôn tập. Lộ trình chưa mở chuyển cấp.</p>}
      </div>}

      {path.allCompleted && <p className="mt-3 text-sm leading-6">Bạn đã học đủ chuỗi bài và đạt bài tổng kết. Đây là kết quả học tập trên nền tảng, không phải chứng chỉ nghề nghiệp.</p>}
      {path.canAdvance && path.nextLevel && <div className="mt-4 space-y-3">
        {confirm ? <div className="rounded-xl border border-primary/20 bg-white p-4"><p className="text-sm leading-6">Chuyển từ <strong>{path.level.name}</strong> sang <strong>{path.nextLevel.name}</strong>? Lịch sử và bài đã hoàn thành được giữ lại. Các bài mới bắt đầu theo tiến độ riêng.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={advancing} onClick={() => void advance()} className={actionClass}>{advancing ? 'Đang chuyển…' : `Xác nhận học ${path.nextLevel.name}`}</button><button type="button" disabled={advancing} onClick={() => setConfirm(false)} className={secondaryClass}>Ở lại ôn tập</button></div></div>
          : <button type="button" onClick={() => setConfirm(true)} className={actionClass}>Học tiếp cấp {path.nextLevel.name} <AppIcon className="text-lg">arrow_forward</AppIcon></button>}
      </div>}
      {path.allCompleted && !path.finalLevel && !path.nextLevel && <p className="mt-3 text-sm">Nội dung cấp tiếp theo đang được bổ sung. Bạn có thể tiếp tục ôn tập.</p>}
      <div className="mt-4 flex flex-wrap gap-2"><Link href="/learn/flashcards" className={secondaryClass}>Ôn flashcards</Link>{path.allCompleted && <><Link href="/learn/certifications" className={secondaryClass}>Khám phá chứng chỉ</Link><Link href="/learn/profile?tab=goals" className={secondaryClass}>Chọn thêm ngành học</Link></>}{!full && <Link href="/learn/plan" className={secondaryClass}>Xem toàn bộ lộ trình</Link>}</div>
    </section>

    {path.allCompleted && path.finalLevel && <ContinuationPlans />}

    {full && <>
      <div className="grid gap-3 sm:grid-cols-2">{path.domains.map(domain => <section key={domain.id} className="rounded-2xl border border-outline-variant bg-white p-4"><h3 className="font-bold">{domain.name}</h3><p className="mt-2 text-sm">{domain.completedLessons}/{domain.totalLessons} bài đã học</p><p className={`mt-1 text-sm font-semibold ${domain.state === 'complete' ? 'text-emerald-700' : 'text-on-surface-variant'}`}>{domain.state === 'complete' ? 'Đã hoàn thành cấp ở ngành này' : domain.state === 'assessment_due' ? 'Còn bài tổng kết' : domain.state === 'review_needed' ? 'Cần ôn và làm lại tổng kết' : domain.available ? 'Đang học' : 'Nội dung đang bổ sung'}</p></section>)}</div>
      <LearningTrail domains={path.domains} />
      <details className="rounded-2xl border border-outline-variant bg-white p-4"><summary className="cursor-pointer font-bold text-primary">Xem lịch bài mới theo tuần và ngày</summary><div className="mt-4"><DailyLearningPath domains={path.domains} dailyMinutes={path.dailyMinutes} /></div></details>
    </>}
  </div>;
}
