'use client';
import { PaginatedList } from '@/shared/ui/PaginatedList';
import { VocabularyRecommendations } from '@/shared/ui/VocabularyRecommendations';
import { Pagination } from '@/shared/ui/Pagination';
import { AppIcon } from '@/shared/ui/AppIcon';

import { levelLabel } from '@/shared/lib/level-label';
import { Dropdown } from '@/shared/ui/Dropdown';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';

type TabType = 'studying' | 'explore';

export default function FlashcardsDashboard({ activeTab }: { activeTab: TabType }) {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    stats: { learned: number; remembered: number; needsReview: number };
    heatmap: { date: string; count: number }[];
    studyingLessons: any[];
  }>({
    stats: { learned: 0, remembered: 0, needsReview: 0 },
    heatmap: [],
    studyingLessons: [],
  });

  const [lessons, setLessons] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [level, setLevel] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activityDays, setActivityDays] = useState(30);
  const today = new Date().toISOString().slice(0, 10);
  const [activityFrom, setActivityFrom] = useState(() => new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10));
  const [activityTo, setActivityTo] = useState(today);
  const [activityError, setActivityError] = useState('');
  const [activityLoading, setActivityLoading] = useState(false);
  const activityStart = activityDays ? new Date(Date.now() - (activityDays - 1) * 86400000).toISOString().slice(0, 10) : activityFrom;
  const activityEnd = activityDays ? today : activityTo;
  const activityCount = activityStart && activityEnd ? Math.round((Date.parse(activityEnd) - Date.parse(activityStart)) / 86400000) + 1 : 0;
  const activityValid = activityCount > 0 && activityCount <= 366 && activityEnd <= today;

  useEffect(() => {
    if (loading) return;
    if (!activityValid) { setActivityError('Chọn khoảng ngày hợp lệ, tối đa 366 ngày và không vượt quá hôm nay.'); setActivityLoading(false); return; }
    let active = true;
    setActivityError(''); setActivityLoading(true);
    apiClient.get<{ heatmap: { date: string; count: number }[] }>(`/vocab-study/dashboard?from=${activityStart}&to=${activityEnd}`)
      .then(result => { if (active) setDashboardData(previous => ({ ...previous, heatmap: result.heatmap })); })
      .catch(() => { if (active) setActivityError('Không tải được hoạt động trong khoảng ngày này.'); })
      .finally(() => { if (active) setActivityLoading(false); });
    return () => { active = false; };
  }, [activityStart, activityEnd, activityValid, loading]);
  const [historyPeriod, setHistoryPeriod] = useState<'day' | 'month' | 'year' | 'all'>('month');
  const [historyRating, setHistoryRating] = useState('all');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [historyMeta, setHistoryMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [historyWords, setHistoryWords] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dashRes, lessonRes, profileRes] = await Promise.allSettled<any>([
          apiClient.get('/vocab-study/dashboard'),
          apiClient.get('/vocabulary?status=published&limit=3000'),
          apiClient.get('/learner-profiles/me'),
        ]);

        if (dashRes.status === 'fulfilled' && dashRes.value) {
          const dashboard = dashRes.value;
          setDashboardData({
            stats: {
              learned: dashboard.stats?.learned ?? 0,
              remembered: dashboard.stats?.remembered ?? 0,
              needsReview: dashboard.stats?.needsReview ?? 0,
            },
            heatmap: Array.isArray(dashboard.heatmap) ? dashboard.heatmap : [],
            studyingLessons: Array.isArray(dashboard.studyingLessons)
              ? dashboard.studyingLessons
              : [],
          });
        }

        const vocabularyItems =
          lessonRes.status === 'fulfilled'
            ? lessonRes.value?.data ?? lessonRes.value ?? []
            : [];
        const groupMap = new Map<string, any>();
        if (Array.isArray(vocabularyItems)) {
          vocabularyItems.forEach((word: any) => {
            if (!word.domain?.code || !word.level?.code) return;
            const key = `${word.domain.code}:${word.level.code}`;
            const current = groupMap.get(key);
            if (current) {
              current._count.vocabularies += 1;
              return;
            }
            groupMap.set(key, {
              id: key,
              title: `${word.domain.name} · ${word.level.name}`,
              summary: `Học từ vựng ${word.domain.name} ở trình độ ${word.level.name}.`,
              domain: word.domain,
              level: word.level,
              _count: { vocabularies: 1 },
              studyHref: `/learn/flashcards/all/practice?domainCode=${encodeURIComponent(word.domain.code)}&levelCode=${encodeURIComponent(word.level.code)}`,
            });
          });
        }
        setLessons(Array.from(groupMap.values()));

        if (profileRes.status === 'fulfilled' && profileRes.value) {
          setUserProfile(profileRes.value);
          if (profileRes.value?.level?.code) {
            setLevel(profileRes.value.level.code);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    let active = true;
    setHistoryLoading(true);
    setHistoryError('');
    apiClient.get<{ data: any[]; meta: typeof historyMeta }>(`/vocab-study/history?period=${historyPeriod}&rating=${historyRating}&page=${historyPage}&limit=${historyLimit}`)
      .then(result => { if (active) { setHistoryWords(result.data); setHistoryMeta(result.meta); } })
      .catch(() => { if (active) setHistoryError('Không thể tải lịch sử học. Vui lòng thử lại.'); })
      .finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, [historyPeriod, historyRating, historyPage, historyLimit]);

  const domains = Array.from(
    new Map(lessons.filter(l => l.domain).map(l => [l.domain.code, l.domain])).values()
  );
  const levels = ['beginner', 'intermediate', 'advanced', 'professional'].map(code => ({
    code, name: levelLabel(code),
  }));

  const filteredExplore = lessons.filter(lesson => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch =
      !keyword ||
      lesson.title?.toLowerCase().includes(keyword) ||
      lesson.domain?.name?.toLowerCase().includes(keyword);
    return (
      (lesson._count?.vocabularies ?? 0) > 0 &&
      matchesSearch &&
      (!domain || lesson.domain?.code === domain) &&
      (!level || lesson.level?.code === level)
    );
  });

  // Render the selected date range from oldest to newest.
  const renderHeatmap = () => {
    const days: { date: string; count: number; level: number }[] = [];
    const countMap = new Map(dashboardData.heatmap.map(h => [h.date, h.count]));
    const end = new Date(`${activityEnd}T00:00:00Z`);

    for (let i = activityCount - 1; i >= 0; i--) {
      const d = new Date(end.getTime() - i * 86400000);
      const dateStr = d.toISOString().slice(0, 10);
      const count = countMap.get(dateStr) ?? 0;
      let level = 0;
      if (count > 0 && count <= 5) level = 1;
      else if (count > 5 && count <= 15) level = 2;
      else if (count > 15) level = 3;
      days.push({ date: dateStr, count, level });
    }

    const levelColors = [
      'bg-slate-100',
      'bg-primary/20',
      'bg-primary/50',
      'bg-primary',
    ];

    return (
      <div className="mt-4 overflow-x-auto pb-2">
        <div style={{ minWidth: activityCount * 11 }}>
          <div className="grid gap-[3px] py-2" style={{ gridTemplateColumns: `repeat(${activityCount}, minmax(0, 1fr))` }} role="img" aria-label={`Hoạt động ôn tập từ ${activityStart} đến ${activityEnd}, theo thứ tự từ trái sang phải`}>
            {days.map((d, index) => <div key={d.date} title={`${new Date(`${d.date}T12:00:00Z`).toLocaleDateString('vi-VN')}: ${d.count} từ đã ôn${d.date === today ? ' · Hôm nay' : ''}`} className={`h-3.5 rounded-sm ${d.date === today ? 'ring-1 ring-primary ring-offset-2' : ''} ${levelColors[d.level]}`} />)}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-slate-500"><span>{new Date(`${days[0].date}T12:00:00Z`).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}</span><span className="font-semibold text-primary">{activityEnd === today ? 'Hôm nay · ' : ''}{new Date(`${activityEnd}T12:00:00Z`).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}</span></div>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">Mỗi ô là một ngày, từ trái sang phải. Màu càng đậm thì càng nhiều từ đã ôn; ô nhạt là chưa có hoạt động.</p>
      </div>
    );
  };

  if (loading) {
    return (
      <LearnerShell>
        <LoadingSpinner />
      </LearnerShell>
    );
  }

  return (
    <LearnerShell>
      <div className="w-full py-6 space-y-6">
        <Link href="/learn/lessons" className="inline-flex items-center gap-2 rounded-lg py-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><AppIcon className="text-[18px]" aria-hidden="true">arrow_back</AppIcon>Quay lại bài học</Link>
        {/* Header Title */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AppIcon className=" text-primary text-3xl">style</AppIcon>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Flashcards
            </h1>
          </div>

          <nav aria-label="Flashcards" className="ui-tabs">
            {[
              { id: 'studying', href: '/learn/flashcards', label: 'Đang học' },
              { id: 'explore', href: '/learn/flashcards/explore', label: 'Khám phá' },
            ].map(tab => (
              <Link key={tab.id} href={tab.href} aria-current={activeTab === tab.id ? 'page' : undefined}
                className="ui-tab">
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Notice Banner */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20 text-on-surface text-xs leading-relaxed">
          <AppIcon className=" text-primary text-base mt-0.5">info</AppIcon>
          <div>
            Bạn có thể luyện tập flashcard hàng ngày theo thuật toán lặp lại ngắt quãng (SRS) để ghi nhớ từ vựng CNTT lâu dài.
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: ĐANG HỌC */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <VocabularyRecommendations />

        {activeTab === 'studying' && (
          <div className="space-y-6">
            {/* SRS Review Alert Banner */}
            {dashboardData.stats.needsReview > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-primary/[0.08] via-primary/[0.04] to-surface-white border border-primary/25 shadow-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/25">
                    <AppIcon className=" text-2xl">alarm</AppIcon>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-base font-black text-on-surface flex items-center gap-2">
                      <span>Bạn có {dashboardData.stats.needsReview} từ vựng đã đến hạn ôn tập!</span>
                      <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold bg-primary/10 text-primary border border-primary/25 rounded-md">
                        SRS DUE
                      </span>
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Ôn tập đúng thời điểm ngắt quãng giúp củng cố từ vựng kỹ thuật vào trí nhớ dài hạn.
                    </p>
                  </div>
                </div>

                <Link
                  href="/learn/flashcards/review/practice"
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs font-black transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 shrink-0 group hover:scale-[1.02]"
                >
                  <AppIcon className=" text-lg group-hover:scale-110 transition-transform">
                    play_circle
                  </AppIcon>
                  <span>Ôn tập ngay ({dashboardData.stats.needsReview} từ)</span>
                </Link>
              </div>
            )}

            {/* Overview Stats Box */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-2xs space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800">Đang học:</h2>
                {dashboardData.stats.needsReview > 0 && (
                  <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />
                    Có từ đến hạn ôn tập
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-100 items-center">
                <div>
                  <div className="text-3xl lg:text-4xl font-black text-slate-900">
                    {dashboardData.stats.learned}
                  </div>
                  <div className="text-xs font-bold text-slate-500 mt-1">Đã học</div>
                </div>
                <div>
                  <div className="text-3xl lg:text-4xl font-black text-emerald-600">
                    {dashboardData.stats.remembered}
                  </div>
                  <div className="text-xs font-bold text-emerald-700 mt-1">Đã nhớ</div>
                </div>
                <div>
                  {dashboardData.stats.needsReview > 0 ? (
                    <Link
                      href="/learn/flashcards/review/practice"
                      className="group block p-3 -m-3 rounded-2xl bg-primary/5 hover:bg-primary/10 border border-primary/25 transition-all hover:scale-[1.02] shadow-2xs cursor-pointer"
                      title="Bấm để bắt đầu ôn tập các từ đến hạn theo thuật toán SRS"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-3xl lg:text-4xl font-black text-primary group-hover:text-primary/90">
                          {dashboardData.stats.needsReview}
                        </span>
                        <AppIcon className=" text-primary text-xl group-hover:translate-x-0.5 transition-transform">
                          arrow_forward
                        </AppIcon>
                      </div>
                      <div className="text-xs font-bold text-primary mt-1 flex items-center justify-center gap-1.5 flex-wrap">
                        <span>Cần ôn tập</span>
                        <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-black">
                          Bấm để ôn
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <div>
                      <div className="text-3xl lg:text-4xl font-black text-slate-400">
                        0
                      </div>
                      <div className="text-xs font-bold text-slate-500 mt-1">Cần ôn tập</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Heatmap */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex flex-wrap justify-between items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <div className="flex flex-wrap items-center gap-3"><span>Hoạt động ôn tập</span><Dropdown aria-label="Khoảng thời gian hoạt động ôn tập" value={String(activityDays)} onChange={event => setActivityDays(Number(event.target.value))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold normal-case tracking-normal text-slate-700"><option value="7">7 ngày gần đây</option><option value="30">30 ngày gần đây</option><option value="56">8 tuần gần đây</option><option value="0">Tùy chọn ngày</option></Dropdown></div>
                  <div className="flex items-center gap-1.5 lowercase">
                    <span>Ít</span>
                    <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-xs bg-primary/20 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-xs bg-primary/50 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-xs bg-primary inline-block" />
                    <span>Nhiều</span>
                  </div>
                </div>
                {activityDays === 0 && <div className="mt-4 flex flex-wrap items-end gap-3"><label className="grid gap-1 text-xs font-semibold text-slate-600">Từ ngày<input type="date" value={activityFrom} max={activityTo || today} onChange={event => setActivityFrom(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800" /></label><label className="grid gap-1 text-xs font-semibold text-slate-600">Đến ngày<input type="date" value={activityTo} min={activityFrom} max={today} onChange={event => setActivityTo(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800" /></label>{activityValid && <span className="pb-2 text-xs text-slate-500">{activityCount} ngày</span>}</div>}
                {activityError ? <p role="alert" className="mt-4 text-sm text-rose-600">{activityError}</p> : activityLoading ? <p role="status" className="mt-4 text-sm text-slate-500">Đang tải hoạt động…</p> : activityValid ? renderHeatmap() : null}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="text-base font-bold text-slate-800">Từ đã học / đã biết</h2><p className="text-xs text-slate-500">Mặc định các từ này không xuất hiện trong phiên học từ mới.</p></div>
                <div className="flex flex-wrap gap-2">
                  <Dropdown value={historyPeriod} onChange={event => { setHistoryPeriod(event.target.value as any); setHistoryPage(1); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">
                    <option value="day">Hôm nay</option><option value="month">Tháng này</option><option value="year">Năm nay</option><option value="all">Tất cả</option>
                  </Dropdown>
                  <Dropdown value={historyRating} onChange={event => { setHistoryRating(event.target.value); setHistoryPage(1); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">
                    <option value="all">Mọi độ khó</option><option value="easy">Dễ</option><option value="medium">Trung bình</option><option value="hard">Khó</option><option value="mastered">Đã biết</option>
                  </Dropdown>
                </div>
              </div>
              {historyLoading ? <LoadingSpinner /> : historyError ? <p role="alert" className="p-5 text-sm text-rose-600">{historyError}</p> : historyWords.length ? <div className="divide-y divide-slate-100">{historyWords.map(item => <div key={item.id} className="flex items-center justify-between gap-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{item.vocabulary?.term}</p><p className="truncate text-xs text-slate-500">{item.vocabulary?.definitionVi}</p></div><div className="shrink-0 text-right"><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${item.lastRating === 'easy' ? 'bg-green-100 text-green-800' : item.lastRating === 'medium' ? 'bg-amber-100 text-amber-800' : item.lastRating === 'hard' ? 'bg-rose-100 text-rose-800' : item.lastRating === 'mastered' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>{item.lastRating === 'easy' ? 'Dễ' : item.lastRating === 'medium' ? 'Trung bình' : item.lastRating === 'hard' ? 'Khó' : item.lastRating === 'mastered' ? 'Đã biết' : 'Đã học'}</span><p className="mt-1 text-[10px] text-slate-400">{item.lastReviewAt ? new Date(item.lastReviewAt).toLocaleDateString('vi-VN') : ''}</p></div></div>)}</div> : <p className="rounded-xl bg-slate-50 p-5 text-center text-xs text-slate-500">Không có từ phù hợp với bộ lọc.</p>}
              {!historyLoading && !historyError && <Pagination {...historyMeta} onPageChange={setHistoryPage} onLimitChange={limit => { setHistoryLimit(limit); setHistoryPage(1); }} className="mt-4 px-0" />}
            </div>

            {/* List of Studying Lessons */}
            {dashboardData.studyingLessons.length > 0 && <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Bộ từ đang học ({dashboardData.studyingLessons.length})
                </h2>
                {dashboardData.studyingLessons.length > 0 && (
                  <Link
                    href="/learn/flashcards/explore"
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    Xem tất cả &gt;&gt;
                  </Link>
                )}
              </div>

                <PaginatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.studyingLessons.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 content-card hover:shadow-md hover:border-primary/40 transition-all group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <AppIcon className=" text-sm text-slate-400">style</AppIcon>
                            {item.totalWords} từ
                          </span>
                          <span>·</span>
                          <span className="text-slate-600 font-semibold">
                            {item.domain?.name || 'CNTT'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                          <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px]">
                            TE
                          </div>
                          <span>TechEnglish</span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                          <span className={item.needsReviewCount > 0 ? "text-primary font-bold flex items-center gap-1" : "text-slate-500"}>
                            {item.needsReviewCount > 0 && <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block" />}
                            Cần ôn tập: {item.needsReviewCount}
                          </span>
                          <span className="text-emerald-600 font-bold">
                            Đã nhớ: {item.rememberedCount}
                          </span>
                        </div>
                      </div>

                      <div className="content-card-footer content-card-actions">
                        {item.needsReviewCount > 0 && (
                          <Link
                            href={`/learn/flashcards/${item.id}/practice?onlyNeedsReview=true`}
                            className="flex-1 py-2 px-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs text-center transition-all shadow-xs flex items-center justify-center gap-1"
                            title={`Chỉ ôn ${item.needsReviewCount} từ đến hạn của bộ này`}
                          >
                            <AppIcon className=" text-sm">alarm</AppIcon>
                            <span>Ôn ({item.needsReviewCount})</span>
                          </Link>
                        )}
                        <Link
                          href={`/learn/flashcards/${item.id}`}
                          className={`py-2 px-3 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white font-bold text-xs text-center transition-all ${
                            item.needsReviewCount > 0 ? 'flex-1' : 'w-full'
                          }`}
                        >
                          {item.needsReviewCount > 0 ? 'Chi tiết' : 'Học tiếp'}
                        </Link>
                      </div>
                    </div>
                  ))}
                </PaginatedList>
            </div>}


          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: KHÁM PHÁ */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            {/* Filter bar */}
            <div className="grid w-full gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[minmax(240px,1fr)_200px_200px_auto]">
              <div className="relative">
                <AppIcon className=" absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  search
                </AppIcon>
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm theo lĩnh vực hoặc trình độ..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs font-semibold outline-none focus:border-primary focus:bg-white"
                />
              </div>
              <Dropdown
                value={domain}
                onChange={e => setDomain(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold outline-none focus:border-primary focus:bg-white"
              >
                <option value="">Tất cả lĩnh vực</option>
                {domains.map((item: any) => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </Dropdown>
              <Dropdown
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold outline-none focus:border-primary focus:bg-white"
              >
                <option value="">Tất cả trình độ</option>
                {levels.map((item: any) => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </Dropdown>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setDomain('');
                  setLevel('');
                }}
                className="h-10 px-4 text-xs font-bold text-slate-600 hover:text-primary transition-colors"
              >
                Xóa lọc
              </button>
            </div>

            {/* Grid lessons */}
            {!filteredExplore.length ? (
              <div className="text-center py-16 text-slate-500 bg-white border border-slate-200 rounded-3xl">
                <AppIcon className=" text-5xl mb-2 text-slate-300 block">
                  filter_list_off
                </AppIcon>
                <p className="text-sm font-semibold">Không tìm thấy bộ từ vựng phù hợp với bộ lọc.</p>
              </div>
            ) : (
              <PaginatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExplore.map((lesson: any, lessonIndex: number) => {
                  const iconStyles = [
                    'bg-blue-50 text-blue-600',
                    'bg-orange-50 text-orange-600',
                    'bg-fuchsia-50 text-fuchsia-600',
                    'bg-emerald-50 text-emerald-600',
                    'bg-cyan-50 text-cyan-600',
                  ];
                  return (
                  <Link
                    key={lesson.id}
                    href={lesson.studyHref ?? `/learn/flashcards/${lesson.id}`}
                    className="bg-white border border-slate-200 rounded-2xl p-5 content-card hover:-translate-y-1 hover:shadow-md hover:border-primary/40 transition-all group"
                  >
                    <div className="space-y-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconStyles[lessonIndex % iconStyles.length]}`}>
                        <AppIcon className=" text-xl">style</AppIcon>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {lesson.summary || 'Bộ từ vựng chuyên ngành kỹ thuật.'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap pt-2">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                          {lesson._count?.vocabularies ?? 0} từ
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                          {lesson.domain?.name || 'CNTT'}
                        </span>
                      </div>
                    </div>

                    <div className="content-card-footer content-card-actions text-primary text-xs font-bold border-t border-slate-100">
                      <span>Bắt đầu học</span>
                      <AppIcon className=" text-base group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </AppIcon>
                    </div>
                  </Link>
                  );
                })}
              </PaginatedList>
            )}
          </div>
        )}


      </div>
    </LearnerShell>
  );
}
