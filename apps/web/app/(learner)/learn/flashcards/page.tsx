'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';

type TabType = 'studying' | 'explore' | 'my_lists';

export default function FlashcardsDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('studying');
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

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dashRes, lessonRes, profileRes] = await Promise.allSettled<any>([
          apiClient.get('/vocab-study/dashboard'),
          apiClient.get('/lessons?status=published&limit=100'),
          apiClient.get('/learner-profiles/me'),
        ]);

        if (dashRes.status === 'fulfilled' && dashRes.value) {
          setDashboardData(dashRes.value);
        }

        const allLessons =
          lessonRes.status === 'fulfilled'
            ? lessonRes.value?.data ?? lessonRes.value ?? []
            : [];
        setLessons(Array.isArray(allLessons) ? allLessons : []);

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

  const domains = Array.from(
    new Map(lessons.filter(l => l.domain).map(l => [l.domain.code, l.domain])).values()
  );
  const levels = Array.from(
    new Map(lessons.filter(l => l.level).map(l => [l.level.code, l.level])).values()
  );

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

  // Generate 8 weeks (56 days) for activity heatmap
  const renderHeatmap = () => {
    const days: { date: string; count: number; level: number }[] = [];
    const countMap = new Map(dashboardData.heatmap.map(h => [h.date, h.count]));
    const now = new Date();

    for (let i = 55; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
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
      'bg-emerald-200',
      'bg-emerald-400',
      'bg-emerald-600',
    ];

    return (
      <div className="flex flex-wrap gap-1 mt-4 items-center justify-start overflow-x-auto py-2">
        {days.map(d => (
          <div
            key={d.date}
            title={`${d.date}: ${d.count} từ đã ôn`}
            className={`w-3.5 h-3.5 rounded-xs transition-transform hover:scale-125 cursor-pointer ${levelColors[d.level]}`}
          />
        ))}
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
      <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header Title */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">style</span>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Flashcards
            </h1>
          </div>

          {/* 3 Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('my_lists')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'my_lists'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              List từ của tôi
            </button>
            <button
              onClick={() => setActiveTab('studying')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'studying'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Đang học
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'explore'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Khám phá
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs leading-relaxed">
          <span className="material-symbols-outlined text-emerald-600 text-base mt-0.5">info</span>
          <div>
            <span className="font-bold">Chú ý:</span> Bạn có thể luyện tập flashcard hàng ngày theo thuật toán lặp lại ngắt quãng (SRS) để ghi nhớ từ vựng CNTT lâu dài.
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: ĐANG HỌC */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'studying' && (
          <div className="space-y-8">
            {/* Overview Stats Box */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-2xs space-y-6">
              <h2 className="text-base font-bold text-slate-800">Đang học:</h2>

              <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-100">
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
                  <div className="text-3xl lg:text-4xl font-black text-amber-600">
                    {dashboardData.stats.needsReview}
                  </div>
                  <div className="text-xs font-bold text-amber-700 mt-1">Cần ôn tập</div>
                </div>
              </div>

              {/* Activity Heatmap */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <span>Hoạt động ôn tập (56 ngày gần nhất)</span>
                  <div className="flex items-center gap-1.5 lowercase">
                    <span>Ít</span>
                    <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-200 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
                    <span>Nhiều</span>
                  </div>
                </div>
                {renderHeatmap()}
              </div>
            </div>

            {/* List of Studying Lessons */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Bộ từ đang học ({dashboardData.studyingLessons.length})
                </h2>
                {dashboardData.studyingLessons.length > 0 && (
                  <button
                    onClick={() => setActiveTab('explore')}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    Xem tất cả &gt;&gt;
                  </button>
                )}
              </div>

              {dashboardData.studyingLessons.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-4">
                  <span className="material-symbols-outlined text-5xl text-slate-300">menu_book</span>
                  <p className="text-sm font-semibold text-slate-600">
                    Bạn chưa chọn bộ từ nào để học.
                  </p>
                  <button
                    onClick={() => setActiveTab('explore')}
                    className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">explore</span>
                    Khám phá kho từ vựng
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.studyingLessons.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm text-slate-400">style</span>
                            {item.totalWords} từ
                          </span>
                          <span>·</span>
                          <span className="text-slate-600 font-semibold">
                            {item.domain?.name || 'CNTT'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                            TE
                          </div>
                          <span>TechEnglish</span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                          <span className="text-amber-600 font-bold">
                            Cần ôn tập: {item.needsReviewCount}
                          </span>
                          <span className="text-emerald-600 font-bold">
                            Đã nhớ: {item.rememberedCount}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3">
                        <Link
                          href={`/learn/flashcards/${item.id}`}
                          className="w-full block py-2 px-4 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white font-bold text-xs text-center transition-all"
                        >
                          Học tiếp
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* List từ đã tạo */}
            <div className="space-y-4 pt-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                List từ đã tạo:
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => alert('Tính năng tạo list từ cá nhân đang được phát triển!')}
                  className="h-44 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all p-6 text-center group"
                >
                  <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
                    add
                  </span>
                  <span className="text-sm font-bold">+ Tạo list từ</span>
                </button>
              </div>
            </div>
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
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  search
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm theo tên bài học..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs font-semibold outline-none focus:border-primary focus:bg-white"
                />
              </div>
              <select
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
              </select>
              <select
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
              </select>
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
                <span className="material-symbols-outlined text-5xl mb-2 text-slate-300 block">
                  filter_list_off
                </span>
                <p className="text-sm font-semibold">Không tìm thấy bộ từ vựng phù hợp với bộ lọc.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExplore.map((lesson: any) => (
                  <Link
                    key={lesson.id}
                    href={`/learn/flashcards/${lesson.id}`}
                    className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md hover:border-primary/40 transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">style</span>
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
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                          {lesson.domain?.name || 'CNTT'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-primary text-xs font-bold pt-4 mt-2 border-t border-slate-100">
                      <span>Bắt đầu học</span>
                      <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: LIST TỪ CỦA TÔI */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'my_lists' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
            <span className="material-symbols-outlined text-5xl text-slate-300">bookmark</span>
            <h2 className="text-lg font-bold text-slate-800">Chưa có list từ nào</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Bạn có thể tự tạo bộ flashcard từ vựng riêng của mình hoặc lưu lại những từ vựng cần lưu ý khi đọc bài học.
            </p>
            <button
              onClick={() => alert('Tính năng tạo danh sách cá nhân đang được phát triển!')}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Tạo list từ mới
            </button>
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
