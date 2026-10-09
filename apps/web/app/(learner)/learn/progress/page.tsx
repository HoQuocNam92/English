'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, Flame, RefreshCw, Route, Target, Trophy, Zap } from 'lucide-react';
import { WeeklyLearningPath, type WeekStep } from '@/shared/ui/WeeklyLearningPath';
import { AppIcon } from '@/shared/ui/AppIcon';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';
import { LevelBadge } from '@/shared/ui/LevelBadge';
import { progressViewModel, type ProgressPayload } from '@techenglish/shared-kernel';

type Metric = { label: string; current: number; target: number; unit: string };
type Task = { id: string; title: string; reason: string; href: string; action: string; status: 'todo' | 'done'; kind: string; minutes?: number; completedLessons?: { id: string; title: string; href: string }[] };
type Agenda = { source?: string; aiSummary?: string; aiMessage?: string; configured: boolean; calculatedAt: string; date: string; level: { code: string; name: string }; dailyMinutes: number; tasks: Task[]; month: { label: string; metrics: Metric[]; focus: string }; year: { focus?: string; label: string; metrics: Metric[]; certificates: { name: string; href: string }[] }; completedLessons: number; totalLessons: number; retestSuggested: boolean; explanation: string };
const colors: Record<string, { background: string; icon: string }> = {
  violet: { background: 'bg-violet-50 border-violet-100', icon: 'bg-violet-600' },
  blue: { background: 'bg-blue-50 border-blue-100', icon: 'bg-blue-600' },
  fuchsia: { background: 'bg-fuchsia-50 border-fuchsia-100', icon: 'bg-fuchsia-600' },
  orange: { background: 'bg-orange-50 border-orange-100', icon: 'bg-orange-600' },
  amber: { background: 'bg-amber-50 border-amber-100', icon: 'bg-amber-600' },
};

export default function LearnerProgressPage() {
  const [data, setData] = useState<ProgressPayload | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<{ steps: WeekStep[]; dailyMinutes: number } | null>(null);
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [agendaError, setAgendaError] = useState('');
  const fetching = useRef(false);
  const mounted = useRef(true);
  const load = useCallback(async () => {
    if (fetching.current) return;
    fetching.current = true; setRefreshing(true);
    const [progress, plan, savedPlan] = await Promise.allSettled([apiClient.get<ProgressPayload>('/progress/me'), apiClient.get<Agenda>('/progress/me/agenda'), apiClient.get<{ plan?: { steps: WeekStep[]; dailyMinutes: number } }>('/placement-test/result')]);
    if (mounted.current) {
      setWeeklyPlan(savedPlan.status === 'fulfilled' ? savedPlan.value.plan ?? null : null);
      if (progress.status === 'fulfilled') { setData(progress.value); setError(''); } else setError(progress.reason?.message ?? 'Không thể tải tiến độ.');
      if (plan.status === 'fulfilled') { setAgenda(plan.value); setAgendaError(''); } else setAgendaError(plan.reason?.message ?? 'Không thể tải kế hoạch.');
      setLoading(false); setRefreshing(false);
    }
    fetching.current = false;
  }, []);
  useEffect(() => {
    mounted.current = true; void load();
    const refresh = () => { if (!document.hidden) void load(); };
    window.addEventListener('focus', refresh); window.addEventListener('techenglish:learning-updated', refresh); document.addEventListener('visibilitychange', refresh);
    const timer = window.setInterval(refresh, 60000);
    return () => { mounted.current = false; window.clearInterval(timer); window.removeEventListener('focus', refresh); window.removeEventListener('techenglish:learning-updated', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, [load]);
  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;
  if (!data && error) return <LearnerShell><p role="alert" className="rounded-2xl bg-red-50 p-6 text-red-700">{error}</p><button onClick={() => void load()} className="mt-3 text-primary">Thử lại</button></LearnerShell>;
  const view = progressViewModel(data);
  const unfinished = agenda?.tasks.filter(t => t.status !== 'done') ?? [];
  return <LearnerShell><main className="flex w-full flex-col gap-6 pb-8">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight">Kế hoạch & cột mốc học tập</h1><p className="mt-2 text-sm text-on-surface-variant">Biết bước tiếp theo, theo dõi mục tiêu và tiến bộ từng ngày.</p></div><div className="flex items-center gap-3"><Link href="/learn/plan" className="rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-sm font-semibold">Lộ trình của tôi</Link><button onClick={() => void load()} disabled={refreshing} aria-label="Cập nhật kế hoạch" className="rounded-xl border border-outline-variant bg-white p-2.5 text-primary disabled:opacity-50"><RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} /></button></div></header>
    {agendaError && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{agendaError}</p>}
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {agenda?.configured ? <>
      {agenda.aiSummary && <p role="status" className="rounded-xl border border-violet-100 bg-violet-50 p-4 text-sm leading-6 text-violet-900"><strong>Gợi ý học tập: </strong>{agenda.aiSummary}</p>}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-2xl border border-outline-variant bg-white p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><CalendarDays size={22} /></span><div><h2 className="text-xl font-bold">Hôm nay cần làm gì?</h2><p className="mt-0.5 text-xs text-on-surface-variant">{new Date(`${agenda.date}T12:00:00+07:00`).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}</p></div></div><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600"><Clock3 size={14} />Dành {agenda.dailyMinutes} phút</span></div>
          <div className="mt-5 space-y-3">{agenda.tasks.map((task, i) => <article key={task.id} className={`flex items-start gap-3 rounded-xl border p-4 ${task.status === 'done' ? 'border-emerald-100 bg-emerald-50/60' : 'border-outline-variant bg-white'}`}><span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${task.status === 'done' ? 'bg-emerald-600 text-white' : 'bg-primary/10 text-primary'}`}>{task.status === 'done' ? <Check size={16} /> : i + 1}</span><div className="min-w-0 flex-1"><h3 className="text-sm font-bold leading-6">{task.title.replace(/\bQuiz\b/gi, 'bài kiểm tra')}</h3><p className="mt-1 text-xs leading-5 text-on-surface-variant">{task.reason.replace(/\bQuiz\b/gi, 'bài kiểm tra')}</p><div className="mt-3 flex flex-wrap items-center gap-3">{task.completedLessons?.length ? task.completedLessons.map(item => <Link key={item.id} href={item.href} className="rounded-lg px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 hover:underline">Xem lại: {item.title}</Link>) : <Link href={task.href} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${task.status === 'done' ? 'text-emerald-700' : 'bg-primary text-white'}`}>{task.action.replace(/\bQuiz\b/gi, 'bài kiểm tra')}<ArrowRight size={14} /></Link>}{task.minutes && <span className="text-xs text-on-surface-variant">Khoảng {task.minutes} phút</span>}</div></div></article>)}{!agenda.tasks.length && <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6">Chưa có bài học phù hợp được xuất bản. Bạn có thể xem chứng chỉ hoặc điều chỉnh mục tiêu trong hồ sơ.<Link href="/learn/certifications" className="mt-2 block font-semibold text-primary">Xem nội dung học →</Link></div>}</div>
          {!!agenda.tasks.length && !unfinished.length && <p className="mt-4 text-sm font-semibold text-emerald-700">Bạn đã hoàn thành mục tiêu hôm nay.</p>}
        </div>
        <aside className="self-start rounded-2xl border border-violet-200 bg-violet-50/70 p-6 text-on-surface"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary"><Route size={25} /></span><p className="mt-4 text-sm font-bold">Lộ trình hiện tại</p><div className="mt-3"><LevelBadge level={agenda.level} /></div><p className="mt-5 text-3xl font-bold text-primary">{agenda.completedLessons}<span className="text-sm font-normal text-on-surface-variant"> / {agenda.totalLessons} bài đã hoàn thành</span></p><p className="mt-2 text-xs leading-6 text-on-surface-variant">Các bài học phù hợp với mục tiêu của bạn.</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-violet-200"><div className="h-full rounded-full bg-primary" style={{ width: `${agenda.totalLessons ? Math.min(100, agenda.completedLessons / agenda.totalLessons * 100) : 0}%` }} /></div><p className="mt-5 text-xs leading-6 text-on-surface-variant">Kế hoạch được cập nhật theo tiến độ và kết quả bài kiểm tra của bạn.</p><Link href="/onboarding/placement-test?next=/learn/progress" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">{agenda.retestSuggested ? 'Kiểm tra để chọn trình độ phù hợp' : 'Kiểm tra lại trình độ'}<ArrowRight size={15} /></Link></aside>
      </section>
      {weeklyPlan && <section className="rounded-2xl border border-outline-variant bg-white p-5 sm:p-6"><h2 className="text-xl font-bold">Đường đi học tập của bạn</h2><p className="mt-2 text-sm text-on-surface-variant">Nội dung theo từng tuần · Dự kiến {weeklyPlan.dailyMinutes} phút mỗi ngày</p><WeeklyLearningPath steps={weeklyPlan.steps} /></section>}
      <div className="grid gap-5 md:grid-cols-2"><PeriodCard title="Tháng này" subtitle={agenda.month.label} metrics={agenda.month.metrics} icon="month"><p className="mt-4 border-t border-outline-variant pt-4 text-xs leading-6 text-on-surface-variant"><strong className="text-on-surface">Ưu tiên: </strong>{agenda.month.focus}</p></PeriodCard><PeriodCard title="Năm nay" subtitle={agenda.year.label} metrics={agenda.year.metrics} icon="year">{agenda.year.focus && <p className="mt-4 text-xs leading-6 text-on-surface-variant">{agenda.year.focus}</p>}{!!agenda.year.certificates.length && <div className="mt-4 border-t border-outline-variant pt-4"><p className="text-xs font-semibold">Chứng chỉ mục tiêu</p>{agenda.year.certificates.map(c => <Link key={c.href} href={c.href} className="mt-2 flex items-center justify-between gap-3 text-xs font-semibold text-primary"><span>{c.name}</span><ChevronRight size={15} className="shrink-0" /></Link>)}</div>}</PeriodCard></div>
      <p className="text-xs leading-5 text-on-surface-variant">Mục tiêu dự kiến theo nhịp học trong hồ sơ và nội dung đang có. Số phút là thời gian bạn dự định dành ra, chưa phải thời gian được đo. Cập nhật lúc {new Date(agenda.calculatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}.</p>
    </> : !agendaError && <section className="rounded-2xl border border-outline-variant bg-white p-6"><h2 className="font-bold">Thiết lập mục tiêu để có kế hoạch ngày, tháng và năm</h2><Link href="/onboarding" className="mt-4 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">Chọn mục tiêu học</Link></section>}
    <section className="rounded-2xl border border-outline-variant bg-white p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-bold">Cột mốc học tập</h2><p className="mt-1 text-xs text-on-surface-variant">{view.unlockedCount}/{view.totalMilestones} cột mốc đạt được</p></div><div className="flex gap-4 text-sm font-bold"><span className="flex items-center gap-1.5 text-amber-700"><Zap size={17} />{view.totalXp} điểm tích lũy</span><span className="flex items-center gap-1.5 text-orange-600"><Flame size={17} />{view.studyStreak} ngày học liên tiếp</span></div></div><div className={`mt-5 grid gap-3 sm:grid-cols-2 ${view.milestones.length === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>{view.milestones.map(m => { const color = colors[m.color] ?? colors.violet; return <article key={m.id} className={`rounded-xl border p-4 ${color.background}`}><div className="flex items-start justify-between gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${color.icon}`}><AppIcon className="!text-white text-xl">{m.icon}</AppIcon></span>{m.unlocked && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"><CheckCircle2 size={13} />Đã đạt</span>}</div><h3 className="mt-3 text-sm font-bold">{m.title}</h3><p className="mt-1 text-xs leading-5 text-on-surface-variant">{m.description}</p><div className="mt-4 flex justify-between text-xs font-semibold"><span>{m.current}/{m.target}</span><span className="text-amber-700">+{m.xp} điểm</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><div className={`h-full rounded-full ${color.icon}`} style={{ width: `${m.progressPercent}%` }} /></div></article>; })}</div></section>
    {!!view.recentAttempts.length && <section className="rounded-2xl border border-outline-variant bg-white p-5 sm:p-6"><h2 className="font-bold">Bài kiểm tra gần đây</h2><div className="mt-3 divide-y divide-outline-variant">{view.recentAttempts.slice(0, 3).map((a: any) => <div key={a.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{a.exam?.title}</p><p className="mt-1 text-xs text-on-surface-variant">{a.passed ? 'Đã đạt' : 'Xem lại giải thích để củng cố'}</p></div><span className={`font-bold ${a.passed ? 'text-emerald-600' : 'text-primary'}`}>{Math.round(a.scorePercent ?? 0)}%</span></div>)}</div></section>}
  </main></LearnerShell>;
}
function PeriodCard({ title, subtitle, metrics, icon, children }: { title: string; subtitle: string; metrics: Metric[]; icon: 'month' | 'year'; children?: React.ReactNode }) {
  return <section className="rounded-2xl border border-outline-variant bg-white p-5 sm:p-6"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${icon === 'month' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'}`}>{icon === 'month' ? <Target size={21} /> : <Trophy size={21} />}</span><div><h2 className="text-lg font-bold">{title}</h2><p className="text-xs text-on-surface-variant">{subtitle}</p></div></div><div className="mt-5 space-y-4">{metrics.map(m => <div key={m.label}><div className="flex justify-between gap-3 text-xs"><span className="font-semibold">{m.label}</span><span className="text-on-surface-variant">{m.current}/{m.target} {m.unit}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary" style={{ width: `${m.target ? Math.min(100, m.current / m.target * 100) : 0}%` }} /></div></div>)}</div>{children}</section>;
}
