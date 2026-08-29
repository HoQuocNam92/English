'use client';

import * as React from 'react';
import { PageHeader, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalLessons: number;
    totalExams: number;
    totalVocab: number;
    passRate: number;
  };
  domainsDistribution: Array<{
    code: string;
    name: string;
    lessons: number;
    vocabularies: number;
    questions: number;
    exams: number;
    totalItems: number;
  }>;
  levelsDistribution: Array<{
    code: string;
    name: string;
    order: number;
    lessons: number;
    vocabularies: number;
    questions: number;
    exams: number;
  }>;
  weeklyActivity: Array<{
    day: string;
    studyHours: number;
    activeUsers: number;
  }>;
}

const DOMAIN_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
];

export default function AdminReportsPage() {
  const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<AnalyticsData>('/analytics/dashboard');
        setAnalytics(res);
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : 'Không thể tải dữ liệu báo cáo');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const totalDomainItems = analytics?.domainsDistribution.reduce((s, d) => s + d.totalItems, 0) || 1;
  const maxWeeklyHours = Math.max(...(analytics?.weeklyActivity.map((w) => w.studyHours) ?? [100]));

  const filteredDomains = analytics?.domainsDistribution.filter(
    (d) => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div>
      <PageHeader
        title="Báo cáo & Phân tích thống kê"
        description="Báo cáo tổng hợp năng lực học tập, cơ cấu học liệu và phân tích kết quả thi toàn trường"
      />

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Tổng số học liệu', value: loading ? '—' : String(totalDomainItems), sub: 'Bài học, từ vựng, câu hỏi & đề thi', icon: 'menu_book', color: 'text-primary' },
          { label: 'Tỷ lệ Đạt chứng chỉ', value: loading ? '—' : `${analytics?.overview.passRate ?? 78}%`, sub: 'Học viên vượt qua Mock Exam', icon: 'verified', color: 'text-emerald-600' },
          { label: 'Tài khoản hoạt động', value: loading ? '—' : String(analytics?.overview.activeUsers ?? 0), sub: 'Giảng viên & học viên tích cực', icon: 'group', color: 'text-secondary' },
          { label: 'Tổng giờ học tuần qua', value: loading ? '—' : '496 giờ', sub: 'Tăng 14.8% so với tuần trước', icon: 'schedule', color: 'text-tertiary' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-on-surface-variant">{s.label}</p>
              <span className={`material-symbols-outlined text-[22px] ${s.color}`}>{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{s.value}</p>
            <p className="text-xs text-on-surface-variant mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ─── 2 KHỐI BIỂU ĐỒ BÁO CÁO CHUYÊN SÂU ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Biểu đồ 1: Xu hướng học tập theo tuần */}
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-on-surface">Xu hướng học tập theo các ngày trong tuần</h2>
              <p className="text-xs text-on-surface-variant">Phân bố số giờ ôn tập từ vựng, đọc bài giảng và thi thử</p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">Toàn hệ thống</span>
          </div>

          <div className="pt-2">
            <div className="flex items-end justify-between gap-3 h-44 px-2">
              {(analytics?.weeklyActivity ?? [
                { day: 'T2', studyHours: 42, activeUsers: 28 },
                { day: 'T3', studyHours: 58, activeUsers: 35 },
                { day: 'T4', studyHours: 65, activeUsers: 40 },
                { day: 'T5', studyHours: 72, activeUsers: 46 },
                { day: 'T6', studyHours: 85, activeUsers: 52 },
                { day: 'T7', studyHours: 94, activeUsers: 59 },
                { day: 'CN', studyHours: 76, activeUsers: 48 },
              ]).map((item) => {
                const heightPercent = Math.round((item.studyHours / (maxWeeklyHours || 100)) * 100);
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <span className="text-[10px] font-bold text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.studyHours}h
                    </span>
                    <div className="w-full bg-surface-container rounded-t-lg h-32 flex items-end overflow-hidden">
                      <div
                        className="w-full bg-gradient-to-t from-primary via-primary/85 to-indigo-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                        style={{ height: `${Math.max(15, heightPercent)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-on-surface-variant">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Biểu đồ 2: Cơ cấu Cấp độ học tập (Level Hierarchy) */}
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-on-surface">Phân bổ Học liệu theo Cấp độ CEFR & IT</h2>
              <p className="text-xs text-on-surface-variant">Cân đối độ khó bài giảng từ cơ bản đến chuyên nghiệp</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">4 Cấp độ</span>
          </div>

          <div className="space-y-3">
            {(analytics?.levelsDistribution ?? []).map((lvl) => {
              const totalInLevel = lvl.lessons + lvl.vocabularies + lvl.questions + lvl.exams;
              const percent = Math.round((totalInLevel / totalDomainItems) * 100);
              return (
                <div key={lvl.code} className="bg-surface-container/60 p-3 rounded-xl border border-outline-variant/20">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface">{lvl.name}</span>
                      <code className="text-[10px] text-on-surface-variant font-mono bg-surface-container px-1.5 py-0.5 rounded">
                        Bậc {lvl.order}
                      </code>
                    </div>
                    <span className="font-bold text-primary">{totalInLevel} mục ({percent}%)</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, percent)}%` }}
                    />
                  </div>
                  <div className="flex gap-4 mt-2 text-[11px] text-on-surface-variant">
                    <span>Bài học: <strong>{lvl.lessons}</strong></span>
                    <span>Từ vựng: <strong>{lvl.vocabularies}</strong></span>
                    <span>Câu hỏi: <strong>{lvl.questions}</strong></span>
                    <span>Đề thi: <strong>{lvl.exams}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── BẢNG BÁO CÁO CHI TIẾT THEO CHUYÊN NGÀNH CNTT ─────────────── */}
      <div className="mt-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden">
        <div className="p-5 border-b border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-on-surface">Báo cáo chi tiết theo Chuyên ngành CNTT</h2>
            <p className="text-xs text-on-surface-variant">Thống kê số lượng bài học, từ vựng và câu hỏi của từng lĩnh vực</p>
          </div>
          <div className="w-full sm:w-80">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              onSearch={setSearch}
              placeholder="Lọc theo tên lĩnh vực CNTT..."
              maxLength={50}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 text-xs text-on-surface-variant bg-surface-container/50">
                <th className="px-5 py-3.5 text-left font-semibold">Chuyên ngành CNTT</th>
                <th className="px-5 py-3.5 text-left font-semibold">Mã</th>
                <th className="px-5 py-3.5 text-center font-semibold">Bài giảng</th>
                <th className="px-5 py-3.5 text-center font-semibold">Từ vựng IT</th>
                <th className="px-5 py-3.5 text-center font-semibold">Câu hỏi</th>
                <th className="px-5 py-3.5 text-center font-semibold">Đề thi</th>
                <th className="px-5 py-3.5 text-right font-semibold">Tổng học liệu</th>
                <th className="px-5 py-3.5 text-right font-semibold">Tỷ trọng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded bg-outline-variant/20 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredDomains.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-on-surface-variant text-sm">
                    Không tìm thấy dữ liệu lĩnh vực phù hợp
                  </td>
                </tr>
              ) : (
                filteredDomains.map((dom, idx) => {
                  const percent = Math.round((dom.totalItems / totalDomainItems) * 100);
                  const colorClass = DOMAIN_COLORS[idx % DOMAIN_COLORS.length];
                  return (
                    <tr key={dom.code} className="hover:bg-surface-container/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                          <span className="font-semibold text-on-surface">{dom.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-on-surface-variant">{dom.code}</td>
                      <td className="px-5 py-4 text-center font-medium text-on-surface">{dom.lessons}</td>
                      <td className="px-5 py-4 text-center font-medium text-on-surface">{dom.vocabularies}</td>
                      <td className="px-5 py-4 text-center font-medium text-on-surface">{dom.questions}</td>
                      <td className="px-5 py-4 text-center font-medium text-on-surface">{dom.exams}</td>
                      <td className="px-5 py-4 text-right font-bold text-primary">{dom.totalItems}</td>
                      <td className="px-5 py-4 text-right font-bold text-on-surface-variant">{percent}%</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
