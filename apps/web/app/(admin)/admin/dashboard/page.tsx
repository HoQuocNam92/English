'use client';

import * as React from 'react';
import { PageHeader } from '@/shared/ui';
import { apiClient } from '@/shared/api/api-client';
import type { PaginatedResponse, UserItem, LessonItem, ExamItem } from '@/shared/api/api-client';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalLessons: number;
  publishedLessons: number;
  totalExams: number;
  publishedExams: number;
}

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
  loading,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: string;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl bg-surface-container-low p-5 border border-outline-variant/30">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-on-surface-variant">{label}</p>
        <span className={`material-symbols-outlined text-[22px] ${color}`}>{icon}</span>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-8 w-16 rounded bg-outline-variant/20 animate-pulse" />
          <div className="h-3 w-24 rounded bg-outline-variant/10 animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-on-surface">{value.toLocaleString('vi-VN')}</p>
          {sub && <p className="text-xs text-on-surface-variant mt-0.5">{sub}</p>}
        </>
      )}
    </div>
  );
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

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<SystemStats | null>(null);
  const [recentUsers, setRecentUsers] = React.useState<UserItem[]>([]);
  const [recentLessons, setRecentLessons] = React.useState<LessonItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const [allUsers, activeUsers, allLessons, publishedLessons, allExams, publishedExams] = await Promise.all([
          apiClient.get<PaginatedResponse<UserItem>>('/users?limit=5'),
          apiClient.get<PaginatedResponse<UserItem>>('/users?status=active&limit=1'),
          apiClient.get<PaginatedResponse<LessonItem>>('/lessons?limit=5'),
          apiClient.get<PaginatedResponse<LessonItem>>('/lessons?status=published&limit=1'),
          apiClient.get<PaginatedResponse<ExamItem>>('/exams?limit=1'),
          apiClient.get<PaginatedResponse<ExamItem>>('/exams?status=published&limit=1'),
        ]);

        setStats({
          totalUsers: allUsers.meta.total,
          activeUsers: activeUsers.meta.total,
          totalLessons: allLessons.meta.total,
          publishedLessons: publishedLessons.meta.total,
          totalExams: allExams.meta.total,
          publishedExams: publishedExams.meta.total,
        });
        setRecentUsers(allUsers.data.slice(0, 5));
        setRecentLessons(allLessons.data.slice(0, 4));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const statCards = [
    { label: 'Tổng người dùng', value: stats?.totalUsers ?? 0, sub: `${stats?.activeUsers ?? 0} đang hoạt động`, icon: 'people', color: 'text-primary' },
    { label: 'Bài học', value: stats?.totalLessons ?? 0, sub: `${stats?.publishedLessons ?? 0} đã xuất bản`, icon: 'auto_stories', color: 'text-secondary' },
    { label: 'Bài thi', value: stats?.totalExams ?? 0, sub: `${stats?.publishedExams ?? 0} đang mở`, icon: 'quiz', color: 'text-tertiary' },
    { label: 'Giảng viên', value: 0, sub: 'Xem trang Người dùng', icon: 'school', color: 'text-error' },
  ];

  return (
    <div>
      <PageHeader title="Dashboard Quản trị" description="Tổng quan hệ thống TechEnglish Pro" />

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm">{error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {statCards.map((s) => (
          <StatCard key={s.label} loading={loading} {...s} />
        ))}
      </div>

      {/* Two columns */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent users */}
        <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/20 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-on-surface">Người dùng mới nhất</h2>
            <a href="/admin/users" className="text-xs text-primary hover:underline">Xem tất cả →</a>
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
            <h2 className="text-sm font-semibold text-on-surface">Bài học gần đây</h2>
            <a href="/admin/lessons" className="text-xs text-primary hover:underline">Xem tất cả →</a>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-outline-variant/20 animate-pulse" />
              ))}
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
                      <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Đã đăng</span>
                    ) : (
                      <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Nháp</span>
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
