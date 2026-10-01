'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { lessonTracks, lessonTrackByType } from '@/shared/lib/lesson-tracks';
import { LearningActivities } from './learning-activities';

type Lesson = { id: string; title: string; summary: string; type: string; estimatedMinutes: number; domain?: { name: string }; level?: { name: string }; keyConcepts?: string[] };

const accentClasses: Record<string, { icon: string; badge: string; border: string; nav: string }> = {
  teal: { icon: 'bg-primary/10 text-primary', badge: 'bg-primary/10 text-primary', border: 'border-t-primary', nav: 'border-primary/30 bg-primary/5 text-on-surface' },
  blue: { icon: 'bg-primary/10 text-primary', badge: 'bg-primary/10 text-primary', border: 'border-t-primary', nav: 'border-primary/30 bg-primary/5 text-on-surface' },
  violet: { icon: 'bg-primary/10 text-primary', badge: 'bg-primary/10 text-primary', border: 'border-t-primary', nav: 'border-primary/30 bg-primary/5 text-on-surface' },
  indigo: { icon: 'bg-primary/10 text-primary', badge: 'bg-primary/10 text-primary', border: 'border-t-primary', nav: 'border-primary/30 bg-primary/5 text-on-surface' },
  amber: { icon: 'bg-primary/10 text-primary', badge: 'bg-primary/10 text-primary', border: 'border-t-primary', nav: 'border-primary/30 bg-primary/5 text-on-surface' },
};

function LessonCatalog() {
  const params = useSearchParams();
  const activeTrack = lessonTrackByType(params.get('type') ?? '');
  const type = activeTrack?.type ?? '';
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let current = true;
    setLoading(true); setError('');
    const load = async () => {
      try {
        const results = await Promise.all((type ? [type] : lessonTracks.map(track => track.type)).map(async lessonType => {
          const search = new URLSearchParams({ limit: '100', status: 'published', type: lessonType });
          const result = await apiClient.get<{ data: Lesson[] }>(`/lessons?${search}`);
          return result?.data ?? [];
        }));
        if (current) setItems(results.flat());
      } catch (cause: any) {
        if (current) setError(cause?.message ?? 'Không thể tải bài học.');
      } finally { if (current) setLoading(false); }
    };
    void load();
    return () => { current = false; };
  }, [type, reload]);

  const visible = useMemo(() => items.filter(item => `${item.title} ${item.summary} ${item.domain?.name ?? ''} ${item.keyConcepts?.join(' ') ?? ''}`.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi'))), [items, query]);

  return <LearnerShell><div className="pb-12">
    <header className="flex justify-end">
      <label className="learner-header-search flex h-11 min-w-0 items-center gap-2 rounded-xl border border-outline-variant bg-white px-3 lg:w-72"><span className="material-symbols-outlined text-[20px] text-on-surface-variant">search</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm theo chủ đề, lĩnh vực..." aria-label="Tìm bài học chuyên ngành" className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm outline-none" /></label>
    </header>

    {!type && <LearningActivities />}

    <nav className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" aria-label="Không gian học tập">
      <Link href="/learn/lessons" aria-current={!type ? 'page' : undefined} className={`group rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${!type ? 'border-primary bg-primary !text-white' : 'border-outline-variant/60 bg-white text-on-surface'}`}><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${!type ? 'bg-white/15' : 'bg-slate-100'}`}><span className="material-symbols-outlined text-[20px]">explore</span></span><p className="mt-4 text-[10px] font-black uppercase tracking-widest opacity-65">Khám phá</p><strong className="mt-1 block text-sm">Tất cả chuyên đề</strong></Link>
      {lessonTracks.map(track => { const accent = accentClasses[track.accent]; const active = type === track.type; return <Link key={track.type} href={`/learn/lessons?type=${track.type}`} aria-current={active ? 'page' : undefined} className={`group relative overflow-hidden rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${active ? 'border-primary bg-primary !text-white' : 'border-outline-variant/60 bg-white text-on-surface'}`}><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? 'bg-white/15 !text-white' : accent.icon}`}><span className="material-symbols-outlined text-[20px]">{track.icon}</span></span><p className="mt-4 text-[10px] font-black uppercase tracking-widest opacity-60">{track.eyebrow}</p><strong className="mt-1 block text-sm leading-5">{track.label}</strong>{active && <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-current" />}</Link>; })}
    </nav>

    <section className="mt-9"><div className="flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs font-black uppercase tracking-widest text-primary">{activeTrack?.eyebrow ?? 'Nội dung đã xuất bản'}</p><h2 className="mt-1 text-xl font-black text-on-surface">{activeTrack ? `Bài học ${activeTrack.label}` : 'Tất cả bài học chuyên ngành'}</h2></div>{!loading && !error && <span className="text-sm text-on-surface-variant">{visible.length} bài phù hợp</span>}</div>
      {activeTrack && <p className="mt-3 rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-on-surface-variant"><strong className="text-on-surface">Cách học:</strong> {activeTrack.focus}</p>}
      {error && <div role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => setReload(value => value + 1)} className="mt-3 rounded-lg border border-red-300 px-4 py-2 font-semibold">Thử lại</button></div>}
      {loading ? <div className="flex h-48 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div> : error ? null : visible.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{visible.map(item => { const track = lessonTrackByType(item.type); const accent = accentClasses[track?.accent ?? 'indigo']; return <article key={item.id} className="rounded-2xl border border-outline-variant/50 bg-white p-5 shadow-xs"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${accent.badge}`}>{track?.label ?? 'Bài học'}</span><span className="text-xs text-on-surface-variant">{item.estimatedMinutes} phút</span><span className="text-xs text-on-surface-variant">{item.level?.name}</span></div><h3 className="mt-4 text-lg font-black text-on-surface">{item.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-on-surface-variant">{item.summary}</p>{item.keyConcepts?.length ? <div className="mt-4 flex flex-wrap gap-1.5">{item.keyConcepts.slice(0, 3).map(concept => <span key={concept} className="rounded-md bg-surface-container-low px-2 py-1 text-xs text-on-surface-variant">{concept}</span>)}</div> : null}<div className="mt-5 flex items-center justify-between gap-3 border-t border-outline-variant/40 pt-4"><span className="text-xs font-semibold text-on-surface-variant">{item.domain?.name ?? 'Chuyên ngành CNTT'}</span><Link href={`/learn/lessons/${item.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-primary">{track?.action ?? 'Vào học'}<span className="material-symbols-outlined text-[18px]">arrow_forward</span></Link></div></article>; })}</div> : <div className="mt-5 rounded-2xl border border-dashed border-outline-variant bg-white px-5 py-14 text-center"><span className="material-symbols-outlined text-4xl text-outline">menu_book</span><p className="mt-3 font-bold">Chưa có bài học phù hợp</p><p className="mt-1 text-sm text-on-surface-variant">Hãy chọn chuyên đề khác hoặc đổi từ khóa.</p></div>}
    </section>
  </div></LearnerShell>;
}

export default function LessonsPage() { return <Suspense><LessonCatalog /></Suspense>; }
