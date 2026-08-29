'use client';

import * as React from 'react';
import { PageHeader } from '@/shared/ui';
import { apiClient } from '@/shared/api/api-client';
import type { LessonItem, PaginatedResponse } from '@/shared/api/api-client';

interface DashboardStats {
  lessonCount: number;
  groupCount: number;
  activeExamCount: number;
}

function StatCard({
  label,
  value,
  icon,
  color,
  loading,
}: {
  label: string;
  value: string | number;
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
        <div className="h-8 w-12 rounded bg-outline-variant/20 animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-on-surface">{value}</p>
      )}
    </div>
  );
}

function LessonStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    published: { label: 'Đã đăng', cls: 'bg-green-100 text-green-700' },
    draft: { label: 'Nháp', cls: 'bg-yellow-100 text-yellow-700' },
    archived: { label: 'Lưu trữ', cls: 'bg-gray-100 text-gray-600' },
  };
  const s = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}

export default function TeacherDashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [recentLessons, setRecentLessons] = React.useState<LessonItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        // Fetch in parallel
        const [lessonsRes, examsRes] = await Promise.all([
          apiClient.get<PaginatedResponse<LessonItem>>('/lessons?limit=5'),
          apiClient.get<PaginatedResponse<{ id: string; status: string }>>('/exams?limit=100'),
        ]);

        setStats({
          lessonCount: lessonsRes.meta.total,
          groupCount: 0, // TODO: groups endpoint
          activeExamCount: examsRes.data.filter((e) => e.status === 'published').length,
        });
        setRecentLessons(lessonsRes.data.slice(0, 5));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const statCards = [
    { label: 'Bài học của tôi', value: stats?.lessonCount ?? 0, icon: 'auto_stories', color: 'text-secondary' },
    { label: 'Nhóm học viên', value: stats?.groupCount ?? 0, icon: 'groups', color: 'text-primary' },
    { label: 'Bài thi đang mở', value: stats?.activeExamCount ?? 0, icon: 'quiz', color: 'text-tertiary' },
  ];

  return (
    <div>
      <PageHeader title="Dashboard Giảng viên" description="Quản lý bài giảng và học viên của bạn" />

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {statCards.map((s) => (
          <StatCard key={s.label} loading={loading} {...s} />
        ))}
      </div>

      {/* Recent lessons */}
      <div className="mt-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-on-surface">Bài học gần đây</h2>
          <a href="/teacher/lessons" className="text-xs text-primary hover:underline">
            Xem tất cả →
          </a>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-outline-variant/20 animate-pulse" />
            ))}
          </div>
        ) : recentLessons.length === 0 ? (
          <div className="p-10 text-center">
            <span className="material-symbols-outlined text-[40px] text-outline mb-2 block">auto_stories</span>
            <p className="text-sm text-on-surface-variant">Chưa có bài học nào.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/20">
            {recentLessons.map((lesson) => (
              <div key={lesson.id} className="px-6 py-4 flex items-center gap-4 hover:bg-surface-container/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{lesson.title}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {lesson.domain?.name} · {lesson.level?.name} · {lesson.estimatedMinutes} phút
                  </p>
                </div>
                <LessonStatusBadge status={lesson.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
