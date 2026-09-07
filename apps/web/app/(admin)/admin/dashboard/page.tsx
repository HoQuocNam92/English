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
        const [allUsers, allLessons, allExams, allVocab, allGroups, analyticsRes] = await Promise.all<any>([
          apiClient.get<PaginatedResponse<UserItem>>('/users?limit=5'),
          apiClient.get<PaginatedResponse<LessonItem>>('/lessons?limit=4'),
          apiClient.get<PaginatedResponse<ExamItem>>('/exams?limit=1'),
          apiClient.get<PaginatedResponse<unknown>>('/vocabulary?limit=1'),
          apiClient.get<PaginatedResponse<unknown>>('/student-groups?limit=1'),
          apiClient.get<AnalyticsData>('/analytics/dashboard').catch(() => null),
        ]);

        const activeCount = allUsers.data.filter((u: any) => u.status === 'active').length;

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
    <main className="flex-1 overflow-y-auto p-gutter lg:px-xl xl:px-margin bg-background">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-xl gap-md">
        <div>
          <h2 className="font-headline-h1 text-headline-h1 text-on-surface mb-xs">Chào buổi sáng, Quản trị viên.</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Hãy xem tình hình học tập hôm nay.</p>
        </div>
        <button className="bg-primary-container text-on-primary font-interface-sb text-interface-sb px-lg py-sm rounded-lg flex items-center gap-sm hover:bg-primary transition-colors shadow-sm">
          <span className="material-symbols-outlined">add</span>
          Tạo bài học
        </button>
      </div>

      {error && (
        <div className="mb-xl p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-md mb-xl">
        <div className="stat-card bg-surface-container-lowest p-md flex flex-col justify-between h-[120px] rounded-lg border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Tổng người học</span>
            <span className="material-symbols-outlined text-outline text-[20px]">group</span>
          </div>
          <div>
            <div className="font-headline-h2 text-headline-h2 text-on-surface flex items-baseline gap-sm">
              {loading ? '...' : (stats?.totalUsers ?? 0).toLocaleString('vi-VN')}
            </div>
          </div>
        </div>
        
        <div className="stat-card bg-surface-container-lowest p-md flex flex-col justify-between h-[120px] rounded-lg border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Bài giảng xuất bản</span>
            <span className="material-symbols-outlined text-outline text-[20px]">school</span>
          </div>
          <div>
            <div className="font-headline-h2 text-headline-h2 text-on-surface">
              {loading ? '...' : (stats?.totalLessons ?? 0).toLocaleString('vi-VN')}
            </div>
          </div>
        </div>
        
        <div className="stat-card bg-surface-container-lowest p-md flex flex-col justify-between h-[120px] rounded-lg border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Nội dung học</span>
            <span className="material-symbols-outlined text-outline text-[20px]">library_books</span>
          </div>
          <div>
            <div className="font-headline-h2 text-headline-h2 text-on-surface flex items-baseline gap-sm">
              {loading ? '...' : (stats?.totalVocab ?? 0).toLocaleString('vi-VN')} <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">items</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card bg-surface-container-lowest p-md flex flex-col justify-between h-[120px] rounded-lg border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Đề thi chứng chỉ</span>
            <span className="material-symbols-outlined text-outline text-[20px]">assignment</span>
          </div>
          <div>
            <div className="font-headline-h2 text-headline-h2 text-on-surface flex items-baseline gap-sm">
              {loading ? '...' : (stats?.totalExams ?? 0).toLocaleString('vi-VN')} <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">active</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card bg-surface-container-lowest p-md flex flex-col justify-between h-[120px] rounded-lg border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Tài khoản hoạt động</span>
            <span className="material-symbols-outlined text-outline text-[20px]">group</span>
          </div>
          <div>
            <div className="font-headline-h2 text-headline-h2 text-on-surface flex items-baseline gap-sm">
              {loading ? '...' : (stats?.activeUsers ?? 0).toLocaleString('vi-VN')}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-xl">
        <div className="stat-card bg-surface-container-lowest p-lg col-span-12 lg:col-span-4 min-h-[360px] flex flex-col rounded-lg border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:-translate-y-0.5 transition-all">
          <h3 className="font-headline-h3 text-headline-h3 text-on-surface mb-xl">Phân bố học liệu theo lĩnh vực CNTT</h3>
          <div className="flex-1 relative flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-[24px] border-surface-container-high relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[24px] border-transparent border-t-primary border-r-primary-container border-b-secondary-container opacity-90 transform rotate-45"></div>
              <span className="font-headline-h2 text-headline-h2 text-on-surface absolute z-10 text-center flex flex-col">IT<span className="font-body-sm text-body-sm text-on-surface-variant font-normal">Sectors</span></span>
            </div>
          </div>
          <div className="mt-lg grid grid-cols-2 gap-sm">
            {(analytics?.domainsDistribution ?? []).slice(0, 4).map((dom, idx) => {
              const bgClass = ['bg-primary', 'bg-primary-container', 'bg-secondary-container', 'bg-outline-variant'][idx] || 'bg-primary';
              return (
                <div key={dom.code} className="flex items-center gap-sm">
                  <span className={`w-3 h-3 rounded-full ${bgClass}`}></span>
                  <span className="font-body-sm text-body-sm truncate" title={dom.name}>{dom.name} ({Math.round((dom.totalItems / totalDomainItems) * 100)}%)</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="stat-card bg-surface-container-lowest p-lg col-span-12 lg:col-span-8 min-h-[360px] flex flex-col rounded-lg border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-center mb-xl">
            <h3 className="font-headline-h3 text-headline-h3 text-on-surface">Tiến độ học tập theo tuần</h3>
            <select className="bg-surface-bright border border-outline-variant rounded-md px-sm py-xs font-body-sm text-body-sm outline-none focus:border-primary">
              <option>Tuần này</option>
              <option>Tháng này</option>
            </select>
          </div>
          <div className="flex-1 relative flex items-end">
            <div className="absolute inset-0 flex items-end justify-between px-md pb-md">
              <div className="absolute inset-0 flex flex-col justify-between border-l border-b border-outline-variant/30 pb-xl ml-lg z-0">
                <div className="w-full border-t border-outline-variant/20"></div>
                <div className="w-full border-t border-outline-variant/20"></div>
                <div className="w-full border-t border-outline-variant/20"></div>
                <div className="w-full border-t border-outline-variant/20"></div>
              </div>
              <div className="relative w-full h-[80%] ml-xl z-10 flex items-end gap-2 justify-between">
                {(analytics?.weeklyActivity ?? [
                  { day: 'T2', studyHours: 42, activeUsers: 28 },
                  { day: 'T3', studyHours: 58, activeUsers: 35 },
                  { day: 'T4', studyHours: 65, activeUsers: 40 },
                  { day: 'T5', studyHours: 72, activeUsers: 46 },
                  { day: 'T6', studyHours: 85, activeUsers: 52 },
                  { day: 'T7', studyHours: 94, activeUsers: 59 },
                  { day: 'CN', studyHours: 76, activeUsers: 48 },
                ]).map((item, idx) => {
                  const heightPercent = Math.round((item.studyHours / (maxWeeklyHours || 100)) * 100);
                  const isMax = heightPercent >= 90;
                  return (
                    <div key={item.day} className="w-2 bg-primary/20 rounded-t-sm relative group" style={{ height: `${Math.max(15, heightPercent)}%` }}>
                      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary group-hover:scale-150 transition-transform ${isMax ? 'shadow-[0_0_8px_rgba(79,70,229,0.5)]' : ''}`}></div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full flex justify-between ml-xl pr-md font-label-caps text-label-caps text-on-surface-variant">
               {(analytics?.weeklyActivity ?? [
                  { day: 'T2' }, { day: 'T3' }, { day: 'T4' }, { day: 'T5' }, { day: 'T6' }, { day: 'T7' }, { day: 'CN' }
                ]).map(item => <span key={item.day}>{item.day}</span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="stat-card bg-surface-container-lowest p-lg col-span-12 lg:col-span-6 rounded-lg border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-center mb-md border-b border-outline-variant pb-sm">
            <h3 className="font-headline-h3 text-headline-h3 text-on-surface">Người dùng mới đăng ký</h3>
            <a href="/admin/users" className="text-primary font-interface-sb text-body-sm hover:underline">Xem tất cả</a>
          </div>
          <ul className="space-y-md">
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
              recentUsers.map((u) => (
                <li key={u.id} className="flex items-start gap-md">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {(u.displayName ?? u.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-body-md text-body-md text-on-surface"><span className="font-interface-sb">{u.displayName ?? u.email}</span> đã đăng ký tài khoản</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Vai trò: {u.roles?.join(', ')}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
        
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-xl">
          <div className="stat-card bg-surface-container-lowest p-lg rounded-lg border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:-translate-y-0.5 transition-all">
            <h3 className="font-headline-h3 text-headline-h3 text-on-surface mb-md">Thao tác nhanh</h3>
            <div className="grid grid-cols-2 gap-md">
              <button className="flex flex-col items-center justify-center p-md border border-outline-variant rounded-lg hover:border-primary hover:bg-surface-bright transition-all group">
                <span className="material-symbols-outlined text-outline group-hover:text-primary mb-xs">add_box</span>
                <span className="font-interface-sb text-body-sm text-on-surface group-hover:text-primary">Tạo bài học</span>
              </button>
              <button className="flex flex-col items-center justify-center p-md border border-outline-variant rounded-lg hover:border-primary hover:bg-surface-bright transition-all group">
                <span className="material-symbols-outlined text-outline group-hover:text-primary mb-xs">post_add</span>
                <span className="font-interface-sb text-body-sm text-on-surface group-hover:text-primary">Thêm câu hỏi</span>
              </button>
              <button className="flex flex-col items-center justify-center p-md border border-outline-variant rounded-lg hover:border-primary hover:bg-surface-bright transition-all group">
                <span className="material-symbols-outlined text-outline group-hover:text-primary mb-xs">quiz</span>
                <span className="font-interface-sb text-body-sm text-on-surface group-hover:text-primary">Tạo bài kiểm tra</span>
              </button>
              <button className="flex flex-col items-center justify-center p-md border border-outline-variant rounded-lg hover:border-primary hover:bg-surface-bright transition-all group">
                <span className="material-symbols-outlined text-outline group-hover:text-primary mb-xs">person_search</span>
                <span className="font-interface-sb text-body-sm text-on-surface group-hover:text-primary">Tìm người học</span>
              </button>
            </div>
          </div>
          
          <div className="stat-card bg-surface-container-lowest p-lg flex-1 rounded-lg border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:-translate-y-0.5 transition-all">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-headline-h3 text-headline-h3 text-on-surface">Bài học trên hệ thống</h3>
              <button className="material-symbols-outlined text-on-surface-variant hover:text-primary">more_horiz</button>
            </div>
            <div className="flex items-center gap-md">
              <div className="flex -space-x-4">
                {recentLessons.slice(0, 3).map((l, i) => (
                  <div key={l.id} className="w-10 h-10 rounded-full border-2 border-surface-container-lowest bg-surface-container-high flex items-center justify-center font-interface-sb text-body-sm text-on-surface-variant z-10" style={{ zIndex: 10 - i }}>
                    {l.title.charAt(0).toUpperCase()}
                  </div>
                ))}
                {recentLessons.length > 3 && (
                  <div className="w-10 h-10 rounded-full border-2 border-surface-container-lowest bg-surface-container-high flex items-center justify-center font-interface-sb text-body-sm text-on-surface-variant z-10">
                    +{stats?.totalLessons ? stats.totalLessons - 3 : 0}
                  </div>
                )}
              </div>
              <div className="ml-sm">
                <p className="font-body-sm text-body-sm text-on-surface-variant">Bài học mới cập nhật.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-2xl"></div>
    </main>
  );
}