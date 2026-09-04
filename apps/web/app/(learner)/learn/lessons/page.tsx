'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

type LevelFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';
type SortMode = 'newest' | 'oldest' | 'progress';

export default function LearnerLessonsPage() {
  const { t } = useI18n();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<LevelFilter>('all');
  const [sort, setSort] = useState<SortMode>('newest');
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  useEffect(() => {
    async function loadData() {
      try {
        const res: any = await apiClient.get('/lessons?limit=100');
        const data = res?.data ?? res ?? [];
        setLessons(Array.isArray(data) ? data : []);
      } catch {
        setError((t.lessons as any).fetchError);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [(t.lessons as any).fetchError]);

  // Filter & sort
  const filtered = lessons
    .filter((l) => {
      const q = search.toLowerCase();
      const matchSearch = !q || l.title?.toLowerCase().includes(q) || l.domain?.name?.toLowerCase().includes(q);
      const levelCode = l.level?.code?.toLowerCase() ?? l.level?.name?.toLowerCase() ?? '';
      const matchLevel = level === 'all' || levelCode.includes(level.replace('intermediate', 'inter'));
      return matchSearch && matchLevel;
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      if (sort === 'oldest') return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
      return (b.progress ?? 0) - (a.progress ?? 0);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const getLevelLabel = (l: any) => {
    const code = l.level?.code ?? l.level?.name ?? '';
    if (/begin|basic|cơ/i.test(code)) return (t.lessons as any).beginner;
    if (/inter|trung/i.test(code)) return (t.lessons as any).intermediate;
    if (/adv|nâng/i.test(code)) return (t.lessons as any).advanced;
    return code || (t.lessons as any).beginner;
  };

  const getStatusLabel = (l: any) => {
    const prog = l.progress ?? null;
    if (prog === null) return { label: (t.lessons as any).notStarted, color: 'text-on-surface-variant', pct: 0 };
    if (prog >= 100) return { label: (t.lessons as any).completed, color: 'text-secondary', pct: 100 };
    if (prog > 0) return { label: (t.lessons as any).inProgress, color: 'text-on-surface-variant', pct: prog };
    return { label: (t.lessons as any).notStarted, color: 'text-on-surface-variant', pct: 0 };
  };

  if (loading) {
    return (
      <LearnerShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </LearnerShell>
    );
  }

  if (error) {
    return (
      <LearnerShell>
        <div className="text-center text-error py-10">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-[14px] font-semibold">{t.common.submit}</button>
        </div>
      </LearnerShell>
    );
  }

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <header className="flex flex-col gap-2">
          <h1 className="text-[30px] font-bold text-on-surface" style={{ lineHeight: '38px', letterSpacing: '-0.02em' }}>
            {(t.lessons as any).title}
          </h1>
          <p className="text-[14px] text-on-surface-variant max-w-2xl">
            {(t.lessons as any).desc}
          </p>
        </header>

        {/* Search + Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-surface-white p-4 rounded-lg border border-border-subtle">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '20px' }}>search</span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-background border border-border-subtle rounded text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder={(t.lessons as any).searchPlaceholder}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              type="text"
            />
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            {/* Level filter */}
            <div className="relative flex-1 md:flex-none">
              <select
                value={level}
                onChange={(e) => { setLevel(e.target.value as LevelFilter); setPage(1); }}
                className="w-full md:w-auto appearance-none bg-background border border-border-subtle rounded pl-4 pr-10 py-2 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
              >
                <option value="all">{(t.lessons as any).allLevels}</option>
                <option value="beginner">{(t.lessons as any).beginner}</option>
                <option value="intermediate">{(t.lessons as any).intermediate}</option>
                <option value="advanced">{(t.lessons as any).advanced}</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ fontSize: '20px' }}>expand_more</span>
            </div>

            {/* Sort */}
            <div className="relative flex-1 md:flex-none">
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value as SortMode); setPage(1); }}
                className="w-full md:w-auto appearance-none bg-background border border-border-subtle rounded pl-4 pr-10 py-2 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
              >
                <option value="newest">{(t.lessons as any).sortNewest}</option>
                <option value="oldest">{(t.lessons as any).sortOldest}</option>
                <option value="progress">{(t.lessons as any).sortProgress}</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ fontSize: '20px' }}>sort</span>
            </div>
          </div>
        </div>

        {/* Lesson Grid — 4 col */}
        {paginated.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] block mb-2">search_off</span>
            <p className="text-[14px]">{(t.lessons as any).noResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {paginated.map((lesson: any, idx: number) => {
              const status = getStatusLabel(lesson);
              const levelLabel = getLevelLabel(lesson);
              const domain = lesson.domain?.name ?? lesson.domain?.code ?? 'IT';
              const duration = lesson.estimatedMinutes ?? 30;
              const isAIRec = idx % 7 === 3; // Mock AI badge every 7th card

              return (
                <Link
                  key={lesson.id}
                  href={`/learn/lessons/${lesson.id}`}
                  className={`bg-surface-white border rounded-lg overflow-hidden flex flex-col group cursor-pointer relative transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_6px_-1px_rgba(15,23,24,0.1),0_2px_4px_-1px_rgba(15,23,24,0.06)] ${isAIRec ? 'border-secondary/40 bg-ai-accent-bg/30' : 'border-border-subtle'}`}
                >
                  {/* AI gradient bar */}
                  {isAIRec && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-primary z-10" />
                  )}

                  {/* Thumbnail */}
                  <div className="relative h-40 w-full bg-surface-container-low overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-primary-light to-surface-container group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary opacity-20" style={{ fontSize: '72px' }}>auto_stories</span>
                    </div>

                    {/* AI badge */}
                    {isAIRec && (
                      <div className="absolute top-2 left-2 bg-surface-white px-2 py-1 rounded text-[12px] font-bold text-secondary flex items-center gap-1 shadow-sm border border-secondary/20">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>auto_awesome</span> {(t.lessons as any).aiRecommendation}
                      </div>
                    )}

                    {/* Duration badge */}
                    <div className="absolute top-2 right-2 bg-surface-white px-2 py-1 rounded text-[12px] font-bold text-on-surface-variant flex items-center gap-1 shadow-sm">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                      {duration} min
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex flex-col flex-grow gap-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[12px] font-bold text-primary bg-primary-light px-2 py-1 rounded">
                        {domain}
                      </span>
                      <span className="text-[12px] font-bold text-on-surface-variant">{levelLabel}</span>
                    </div>

                    <h3 className="text-[20px] font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2 mt-1" style={{ lineHeight: '28px' }}>
                      {lesson.title}
                    </h3>

                    <div className="text-[12px] text-on-surface-variant flex items-center gap-1 mt-auto">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>signal_cellular_alt</span>
                      {levelLabel}
                    </div>

                    {/* Progress */}
                    <div className="mt-2 flex flex-col gap-1">
                      <div className="flex justify-between text-[12px]">
                        <span className={status.color}>{status.label}</span>
                        <span className={`font-semibold ${status.pct > 0 ? 'text-primary' : 'text-on-surface-variant'}`}>{status.pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${status.pct >= 100 ? 'bg-secondary' : 'bg-primary'}`}
                          style={{ width: `${status.pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded border border-border-subtle text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-[14px] font-semibold transition-colors ${p === page ? 'bg-primary text-white' : 'border border-border-subtle text-on-surface hover:bg-surface-container-low'}`}
                >
                  {p}
                </button>
              );
            })}

            {totalPages > 5 && <span className="text-on-surface-variant">...</span>}
            {totalPages > 5 && (
              <button
                onClick={() => setPage(totalPages)}
                className={`w-8 h-8 flex items-center justify-center rounded text-[14px] font-semibold border border-border-subtle text-on-surface hover:bg-surface-container-low transition-colors`}
              >
                {totalPages}
              </button>
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded border border-border-subtle text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </LearnerShell>
  );
}


