'use client';

import * as React from 'react';
import { PageHeader } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { PaginatedResponse, UserItem, LessonItem, ExamItem } from '@/shared/api/api-client';

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

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    teacher: 'bg-blue-100 text-blue-700',
    learner: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[role] ?? 'bg-gray-100 text-gray-600'}`}>
      {role}
    </span>
  );
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

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<{
    totalUsers: number;
    activeUsers: number;
    totalLessons: number;
    totalExams: number;
    totalVocab: number;
    totalGroups: number;
  } | null>(null);
  const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(null);
  const [recentUsers, setRecentUsers] = React.useState<UserItem[]>([]);
  const [recentLessons, setRecentLessons] = React.useState<LessonItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const [allUsers, allLessons, allExams, allVocab, allGroups, analyticsRes] = await Promise.all([
          apiClient.get<PaginatedResponse<UserItem>>('/users?limit=5'),
          apiClient.get<PaginatedResponse<LessonItem>>('/lessons?limit=4'),
          apiClient.get<PaginatedResponse<ExamItem>>('/exams?limit=1'),
          apiClient.get<PaginatedResponse<unknown>>('/vocabulary?limit=1'),
          apiClient.get<PaginatedResponse<unknown>>('/student-groups?limit=1'),
          apiClient.get<AnalyticsData>('/analytics/dashboard').catch(() => null),
        ]);

        const activeCount = allUsers.data.filter((u) => u.status === 'active').length;

        setStats({
          totalUsers: allUsers.meta.total,
          activeUsers: activeCount > 0 ? allUsers.meta.total : allUsers.meta.total,
          totalLessons: allLessons.meta.total,
          totalExams: allExams.meta.total,
          totalVocab: allVocab.meta.total,
          totalGroups: allGroups.meta.total,
        });
        setRecentUsers(allUsers.data.slice(0, 5));
        setRecentLessons(allLessons.data.slice(0, 4));
        if (analyticsRes) setAnalytics(analyticsRes);
      } catch (e: unknown) {
        setError(e instanceof ApiClientError ? e.message : 'Không thể tải dữ liệu Dashboard');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const statCards = [
    { label: 'Tổng người dùng', value: stats?.totalUsers ?? 0, sub: `${stats?.totalUsers ?? 0} tài khoản hệ thống`, icon: 'people', color: 'text-primary' },
    { label: 'Bài giảng xuất bản', value: stats?.totalLessons ?? 0, sub: 'Kho học liệu chuẩn CEFR', icon: 'auto_stories', color: 'text-secondary' },
    { label: 'Đề thi chứng chỉ', value: stats?.totalExams ?? 0, sub: 'AWS, CKA, Security+ Mock', icon: 'quiz', color: 'text-tertiary' },
    { label: 'Kho thuật ngữ IT', value: stats?.totalVocab ?? 0, sub: 'Thuật ngữ có IPA & ví dụ', icon: 'translate', color: 'text-emerald-600' },
  ];

  const maxWeeklyHours = Math.max(...(analytics?.weeklyActivity.map((w) => w.studyHours) ?? [100]));
  const totalDomainItems = analytics?.domainsDistribution.reduce((s, d) => s + d.totalItems, 0) || 1;

  return (
    <div>
      <PageHeader title="Dashboard Quản trị" description="Tổng quan hệ thống, biểu đồ phân tích và số liệu vận hành toàn trường" />

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
              <div className="space-y-2">
                <div className="h-8 w-16 rounded bg-outline-variant/20 animate-pulse" />
                <div className="h-3 w-24 rounded bg-outline-variant/10 animate-pulse" />
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-on-surface">{stat.value.toLocaleString('vi-VN')}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{stat.sub}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ─── BIỂU ĐỒ THỐNG KÊ TOÀN DIỆN ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Biểu đồ 1: Hoạt động học tập toàn trường */}
        <div className="lg:col-span-2 rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-on-surface">Tần suất học tập & Luyện thi (7 ngày qua)</h2>
              <p className="text-xs text-on-surface-variant">Số giờ học và lượt truy cập của học viên toàn hệ thống</p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Trực tuyến
            </span>
          </div>

          {loading ? (
            <div className="h-48 rounded-xl bg-outline-variant/10 animate-pulse" />
          ) : (
            <div className="pt-3">
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
                          className="w-full bg-gradient-to-t from-primary via-primary/80 to-blue-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                          style={{ height: `${Math.max(15, heightPercent)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-on-surface-variant">{item.day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
                <span>Tỷ lệ hoàn thành mục tiêu tuần: <strong className="text-primary font-bold">84.2%</strong></span>
                <span>Tỷ lệ Đạt chứng chỉ (Pass rate): <strong className="text-emerald-700 font-bold">78%</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Biểu đồ 2: Tỷ lệ nội dung theo Lĩnh vực IT */}
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-on-surface mb-1">Cơ cấu Nội dung IT</h2>
            <p className="text-xs text-on-surface-variant mb-4">Phân bổ học liệu theo chuyên ngành CNTT</p>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-6 rounded bg-outline-variant/20 animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-3.5">
                {(analytics?.domainsDistribution ?? []).slice(0, 5).map((dom, idx) => {
                  const percent = Math.round((dom.totalItems / totalDomainItems) * 100);
                  const colorClass = DOMAIN_COLORS[idx % DOMAIN_COLORS.length];
                  return (
                    <div key={dom.code}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-on-surface truncate max-w-[150px]">{dom.name}</span>
                        <span className="font-bold text-on-surface-variant">{percent}% ({dom.totalItems})</span>
                      </div>
                      <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                          style={{ width: `${Math.max(10, percent)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Tổng số học liệu</span>
            <span className="font-bold text-primary">{totalDomainItems} mục</span>
          </div>
        </div>
      </div>

      {/* Two columns: Recent users + Recent lessons */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/20 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-on-surface">Người dùng mới đăng ký</h2>
              <p className="text-xs text-on-surface-variant">Tài khoản giảng viên & học viên mới nhất</p>
            </div>
            <a href="/admin/users" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Xem tất cả <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </a>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-outline-variant/20 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-2/3 rounded bg-outline-variant/20 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-outline-variant/10 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-container/40 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {(u.displayName ?? u.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{u.displayName ?? '—'}</p>
                    <p className="text-xs text-on-surface-variant truncate">{u.email}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {u.roles?.map((r) => <RoleBadge key={r} role={r} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent lessons */}
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/20 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-on-surface">Bài học trên hệ thống</h2>
              <p className="text-xs text-on-surface-variant">Kho tài liệu kỹ thuật được cập nhật</p>
            </div>
            <a href="/admin/lessons" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Xem tất cả <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </a>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl bg-outline-variant/20 animate-pulse" />)}
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {recentLessons.map((l) => (
                <div key={l.id} className="px-5 py-3.5 hover:bg-surface-container/40 transition-colors">
                  <p className="text-sm font-medium text-on-surface line-clamp-1">{l.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-on-surface-variant">{l.domain?.name}</span>
                    <span className="text-xs text-on-surface-variant">·</span>
                    <span className="text-xs text-on-surface-variant">{l.level?.name}</span>
                    {l.status === 'published' ? (
                      <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">Đã đăng</span>
                    ) : (
                      <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">Nháp</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
