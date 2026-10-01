'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';
import { progressViewModel, type ProgressMilestone, type ProgressPayload } from '@techenglish/shared-kernel';

const styles = {
  violet: { card: 'from-violet-50 to-indigo-50 border-violet-200', icon: 'from-violet-400 to-indigo-600', bar: 'from-violet-500 to-indigo-600', text: 'text-violet-700' },
  blue: { card: 'from-sky-50 to-blue-50 border-blue-200', icon: 'from-sky-400 to-blue-600', bar: 'from-sky-400 to-blue-600', text: 'text-blue-700' },
  fuchsia: { card: 'from-fuchsia-50 to-purple-50 border-fuchsia-200', icon: 'from-fuchsia-400 to-purple-600', bar: 'from-fuchsia-500 to-purple-600', text: 'text-fuchsia-700' },
  orange: { card: 'from-orange-50 to-rose-50 border-orange-200', icon: 'from-orange-400 to-rose-500', bar: 'from-orange-400 to-rose-500', text: 'text-orange-700' },
  amber: { card: 'from-amber-50 to-yellow-50 border-amber-200', icon: 'from-amber-400 to-orange-500', bar: 'from-amber-400 to-orange-500', text: 'text-amber-700' },
};

export default function LearnerProgressPage() {
  const [data, setData] = useState<ProgressPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get<ProgressPayload>('/progress/me').then(setData).catch(error => setError(error instanceof Error ? error.message : 'Không thể tải tiến độ học tập.')).finally(() => setLoading(false));
  }, []);

  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;
  if (error) return <LearnerShell><div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">{error}</div></LearnerShell>;

  const view = progressViewModel(data);
  const { milestones, recentAttempts, overallPercent, includesVocabulary, includesCertification } = view;
  const game = view;

  return <LearnerShell><div className="mx-auto flex w-full max-w-6xl flex-col gap-7 pb-10">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Hành trình của bạn</p><h1 className="mt-1 text-3xl font-black tracking-tight text-on-surface">Milestone học tập</h1><p className="mt-2 text-sm text-on-surface-variant">Học đều mỗi ngày, mở khóa thành tích và chinh phục lộ trình của bạn.</p></div><div className="flex gap-3"><SummaryPill icon="⚡" value={`${game.totalXp} XP`} label="Điểm thành tích" /><SummaryPill icon="🔥" value={`${game.studyStreak} ngày`} label="Chuỗi hiện tại" /></div></header>

    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-lg sm:p-8"><div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/10" /><div className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-fuchsia-300/20" /><div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><div><p className="text-sm font-bold text-white/80">Tiến độ thành tích</p><p className="mt-1 text-4xl font-black">{game.unlockedCount}/{game.totalMilestones}</p><p className="mt-2 text-sm text-white/80">milestone đã được mở khóa</p></div><div className="w-full max-w-xl"><div className="mb-2 flex justify-between text-xs font-bold"><span>Cấp độ hành trình</span><span>{overallPercent}%</span></div><div className="h-4 overflow-hidden rounded-full bg-black/20 p-1"><div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-200 transition-all duration-700" style={{ width: `${overallPercent}%` }} /></div><p className="mt-3 text-xs text-white/75">Mỗi milestone mở khóa sẽ cộng XP và đánh dấu một cột mốc mới.</p></div></div></section>

    <section><div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-black text-on-surface">Thử thách milestone</h2><p className="mt-1 text-xs text-on-surface-variant">Hoàn thành theo bất kỳ thứ tự nào phù hợp với lộ trình học của bạn.</p></div><span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 sm:inline">🎮 Game hóa đang bật</span></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{milestones.map(m => { const s = styles[m.color]; return <article key={m.id} className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition-all hover:-translate-y-1 hover:shadow-md ${s.card} ${m.unlocked ? 'ring-2 ring-emerald-300/70' : ''}`}>{m.unlocked && <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-black text-white">✓ ĐÃ MỞ KHÓA</span>}<div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl shadow-sm ${s.icon}`}>{m.icon}</div><h3 className="mt-4 text-base font-black text-on-surface">{m.title}</h3><p className="mt-1 min-h-9 text-xs leading-relaxed text-on-surface-variant">{m.description}</p><div className="mt-5 flex items-center justify-between text-xs font-bold"><span className={s.text}>{m.current}/{m.target}</span><span className="rounded-full bg-white/80 px-2 py-1 text-amber-700">⚡ +{m.xp} XP</span></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/80"><div className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${s.bar}`} style={{ width: `${m.progressPercent}%` }} /></div></article>; })}</div></section>

    <section className={`grid gap-5 ${includesCertification ? 'lg:grid-cols-[1fr_360px]' : ''}`}><div className="rounded-2xl border border-outline-variant/50 bg-white p-6"><h2 className="text-base font-black text-on-surface">Bước tiếp theo</h2><p className="mt-1 text-xs text-on-surface-variant">Tiếp tục hướng học đã chọn để tăng tiến độ milestone.</p><div className={`mt-5 grid gap-3 ${includesVocabulary && includesCertification ? 'sm:grid-cols-2' : ''}`}>{includesVocabulary && <Link href="/learn/flashcards" className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 p-4 text-white transition-transform hover:scale-[1.02]"><span className="text-2xl">📚</span><strong className="mt-2 block text-sm">Học từ vựng CNTT</strong><span className="mt-1 block text-xs text-white/80">Tăng milestone số từ và chuỗi ngày học</span></Link>}{includesCertification && <Link href="/learn/certifications" className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 p-4 text-white transition-transform hover:scale-[1.02]"><span className="text-2xl">🏆</span><strong className="mt-2 block text-sm">Luyện chứng chỉ</strong><span className="mt-1 block text-xs text-white/80">Làm quiz và hoàn thành domain</span></Link>}</div></div>{includesCertification && <div className="rounded-2xl border border-outline-variant/50 bg-white p-6"><h2 className="text-base font-black text-on-surface">Quiz chứng chỉ gần đây</h2><div className="mt-4 space-y-3">{recentAttempts.length ? recentAttempts.slice(0, 3).map((attempt: any) => <div key={attempt.id} className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3"><span className="text-xl">🧠</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-on-surface">{attempt.exam?.title}</p><p className="mt-0.5 text-[11px] text-on-surface-variant">{attempt.passed ? 'Đã đạt' : 'Đã hoàn thành'}</p></div><strong className={attempt.passed ? 'text-emerald-600' : 'text-primary'}>{Math.round(attempt.scorePercent ?? 0)}%</strong></div>) : <p className="rounded-xl bg-surface-container-low p-4 text-center text-xs text-on-surface-variant">Chưa có quiz nào được hoàn thành.</p>}</div></div>}</section>
  </div></LearnerShell>;
}

function SummaryPill({ icon, value, label }: { icon: string; value: string; label: string }) {
  return <div className="flex items-center gap-2 rounded-2xl border border-outline-variant/50 bg-white px-4 py-2 shadow-xs"><span className="text-xl">{icon}</span><span><strong className="block text-sm text-on-surface">{value}</strong><span className="block text-[10px] text-on-surface-variant">{label}</span></span></div>;
}
