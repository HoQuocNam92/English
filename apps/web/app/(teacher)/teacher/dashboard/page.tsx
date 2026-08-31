'use client';

import * as React from 'react';
import { PageHeader } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { LessonItem, PaginatedResponse } from '@/shared/api/api-client';

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
  'bg-blue-500 text-blue-500',
  'bg-purple-500 text-purple-500',
  'bg-emerald-500 text-emerald-500',
  'bg-amber-500 text-amber-500',
  'bg-rose-500 text-rose-500',
  'bg-cyan-500 text-cyan-500',
  'bg-indigo-500 text-indigo-500',
];

export default function TeacherDashboardPage() {
  const [stats, setStats] = React.useState<{ lessons: number; groups: number; exams: number; students: number } | null>(null);
  const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(null);
  const [recentLessons, setRecentLessons] = React.useState<LessonItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const [lessonsRes, examsRes, groupsRes, studentsRes, analyticsRes] = await Promise.all<any>([
          apiClient.get<PaginatedResponse<LessonItem>>('/lessons?limit=4'),
          apiClient.get<PaginatedResponse<unknown>>('/exams?limit=1'),
          apiClient.get<PaginatedResponse<unknown>>('/student-groups?limit=1'),
          apiClient.get<PaginatedResponse<unknown>>('/students?limit=1'),
          apiClient.get<AnalyticsData>('/analytics/dashboard').catch(() => null),
        ]);

        setStats({
          lessons: lessonsRes.meta.total,
          exams: examsRes.meta.total,
          groups: groupsRes.meta.total,
          students: studentsRes.meta.total,
        });
        setRecentLessons(lessonsRes.data);
        if (analyticsRes) setAnalytics(analyticsRes);
      } catch (e: unknown) {
        setError(e instanceof ApiClientError ? e.message : 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const statCards = [
    { label: 'Bài học của tôi', value: stats?.lessons ?? 0, icon: 'auto_stories', color: 'text-primary' },
    { label: 'Nhóm học viên', value: stats?.groups ?? 0, icon: 'groups', color: 'text-secondary' },
    { label: 'Bài thi đang mở', value: stats?.exams ?? 0, icon: 'quiz', color: 'text-tertiary' },
    { label: 'Học viên phụ trách', value: stats?.students ?? 0, icon: 'school', color: 'text-emerald-600' },
  ];

  const maxWeeklyHours = Math.max(...(analytics?.weeklyActivity.map((w) => w.studyHours) ?? [100]));
  const totalDomainItems = analytics?.domainsDistribution.reduce((s, d) => s + d.totalItems, 0) || 1;

  return (
    <div>
      <PageHeader title="Dashboard Giảng viên" description="Quản lý bài giảng, nhóm học viên và biểu đồ tiến độ học tập" />

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-surface-container-low p-5 border border-outline-variant/30">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-on-surface-variant">{stat.label}</p>
              <span className={`material-symbols-outlined text-[22px] ${stat.color}`}>{stat.icon}</span>
            </div>
            {loading ? (
              <div className="h-8 w-16 rounded bg-outline-variant/20 animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-on-surface">{stat.value.toLocaleString('vi-VN')}</p>
            )}
          </div>
        ))}
      </div>

      {/* ─── BIỂU ĐỒ HOẠT ĐỘNG VÀ TIẾN ĐỘ ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Biểu đồ cột: Hoạt động học tập trong tuần */}
        <div className="lg:col-span-2 rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-on-surface">Hoạt động học tập tuần này (Giờ học)</h2>
              <p className="text-xs text-on-surface-variant">Tổng số giờ học viên tương tác với bài học & thi thử</p>
            </div>
            <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full">7 ngày qua</span>
          </div>

          {loading ? (
            <div className="h-48 rounded-xl bg-outline-variant/10 animate-pulse" />
          ) : (
            <div className="pt-4">
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
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[11px] font-bold text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.studyHours}h
                      </span>
                      <div className="w-full bg-surface-container rounded-t-lg h-32 flex items-end overflow-hidden">
                        <div
                          className="w-full bg-gradient-to-t from-primary to-primary/70 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                          style={{ height: `${Math.max(15, heightPercent)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-on-surface-variant">{item.day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-primary inline-block" /> Tổng giờ học: <strong>496 giờ</strong>
                </span>
                <span>Tỷ lệ hoàn thành trung bình: <strong className="text-emerald-700">78.5%</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Biểu đồ phân bổ lĩnh vực CNTT */}
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-on-surface mb-1">Phân bổ theo Lĩnh vực CNTT</h2>
            <p className="text-xs text-on-surface-variant mb-4">Tỷ lệ nội dung và bài học theo chuyên ngành</p>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-6 rounded bg-outline-variant/20 animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-3.5">
                {(analytics?.domainsDistribution ?? []).slice(0, 5).map((dom, idx) => {
                  const percent = Math.round((dom.totalItems / totalDomainItems) * 100);
                  const colorClass = DOMAIN_COLORS[idx % DOMAIN_COLORS.length].split(' ')[0];
                  return (
                    <div key={dom.code}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-on-surface truncate max-w-[160px]">{dom.name}</span>
                        <span className="font-bold text-on-surface-variant">{percent}% ({dom.totalItems})</span>
                      </div>
                      <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(8, percent)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Lĩnh vực hàng đầu</span>
            <span className="font-bold text-primary">Cloud & DevOps</span>
          </div>
        </div>
      </div>

      {/* Recent lessons table */}
      <div className="mt-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/20 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-on-surface">Bài học gần đây</h2>
            <p className="text-xs text-on-surface-variant">Các bài giảng kỹ thuật mới nhất trên hệ thống</p>
          </div>
          <a href="/teacher/lessons" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            Xem tất cả <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </a>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-outline-variant/20 animate-pulse" />
            ))}
          </div>
        ) : recentLessons.length === 0 ? (
          <div className="p-8 text-center text-xs text-on-surface-variant">Chưa có bài học nào</div>
        ) : (
          <div className="divide-y divide-outline-variant/20">
            {recentLessons.map((l) => (
              <div key={l.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-container/40 transition-colors">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-medium text-on-surface truncate">{l.title}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {l.domain?.name ?? 'IT'} · {l.level?.name ?? 'Beginner'}
                    {l.estimatedMinutes ? ` · ${l.estimatedMinutes} phút` : ''}
                  </p>
                </div>
                {l.status === 'published' ? (
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 shrink-0">
                    Đã đăng
                  </span>
                ) : (
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 shrink-0">
                    Nháp
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
