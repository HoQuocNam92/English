'use client';
import { AppIcon } from '@/shared/ui/AppIcon';

import { Dropdown } from '@/shared/ui/Dropdown';
import * as React from 'react';
import { ActivityChart } from '@/shared/ui/ActivityChart';
import Link from 'next/link';
import { PageHeader } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { PaginatedResponse, UserItem, ExamItem } from '@/shared/api/api-client';
import { useAuth } from '@/features/auth/presentation';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
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
    activityCount: number;
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
  const { session } = useAuth();
  const roles = session?.user?.roles ?? (session?.user?.role ? [session.user.role] : []);
  const isAdmin = roles.includes('admin') && !roles.includes('teacher');
  const [stats, setStats] = React.useState<{
    totalUsers: number;
    activeUsers: number;
        totalExams: number;
    totalVocab: number;
  } | null>(null);
  const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(null);
  const [recentUsers, setRecentUsers] = React.useState<UserItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [period, setPeriod] = React.useState('week');
  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [allUsers, allExams, allVocab, analyticsRes, activeUsers] = await Promise.all<any>([
          isAdmin ? apiClient.get<PaginatedResponse<UserItem>>('/users?limit=5') : Promise.resolve({ data: [], meta: { total: 0 } }),
          apiClient.get<PaginatedResponse<ExamItem>>('/exams?limit=1'),
          apiClient.get<PaginatedResponse<unknown>>('/vocabulary?limit=1'),
          isAdmin ? apiClient.get<AnalyticsData>(`/analytics/dashboard?dateFrom=${period === 'month' ? new Date().toISOString().slice(0, 8) + '01' : new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10)}&dateTo=${new Date().toISOString().slice(0, 10)}`).catch(() => null) : Promise.resolve(null),
          isAdmin ? apiClient.get<any>('/users?limit=1&status=active') : Promise.resolve({ meta: { total: 0 } }),
        ]);

        const activeCount = allUsers.data.filter((u: any) => u.status === 'active').length;

        setStats({
          totalUsers: allUsers.meta.total,
          activeUsers: activeUsers.meta.total,
          totalExams: allExams.meta.total,
          totalVocab: allVocab.meta.total,
        });
        setRecentUsers(allUsers.data.slice(0, 5));
        if (analyticsRes) setAnalytics(analyticsRes);
      } catch (e: unknown) {
        setError(e instanceof ApiClientError ? e.message : 'Không thể tải dữ liệu Dashboard');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [isAdmin, period]);

  const statCards = [
    { label: 'Tổng người dùng', value: stats?.totalUsers ?? 0, sub: `${stats?.totalUsers ?? 0} tài khoản hệ thống`, icon: 'people', color: 'text-primary' },
    { label: 'Đề thi chứng chỉ', value: stats?.totalExams ?? 0, sub: 'AWS, CKA, Security+ Mock', icon: 'quiz', color: 'text-tertiary' },
    { label: 'Kho thuật ngữ IT', value: stats?.totalVocab ?? 0, sub: 'Thuật ngữ có IPA & ví dụ', icon: 'translate', color: 'text-emerald-600' },
  ];

  const maxWeeklyActivity = Math.max(...(analytics?.weeklyActivity.map((w) => w.activityCount) ?? [100]));
  const totalDomainItems = analytics?.domainsDistribution.reduce((s, d) => s + d.totalItems, 0) || 1;

  if (!isAdmin) return (
    <main className="w-full space-y-8">
      <div><h2 className="text-3xl font-bold tracking-tight text-on-surface">Không gian giảng viên</h2><p className="mt-1 text-sm text-on-surface-variant">Quản lý nội dung giảng dạy và theo dõi học viên của bạn.</p></div>
      {error && <div className="rounded-xl bg-error-container p-4 text-sm text-on-error-container">{error}</div>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      </div>
      <section><h3 className="mb-4 text-xl font-bold">Công việc giảng dạy</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[['Thêm câu hỏi','/admin/questions/editor','post_add'],['Tạo quiz chứng chỉ','/admin/tests/builder','quiz'],['Xem kết quả thi','/admin/test-results','fact_check'],['Theo dõi tiến độ','/admin/progress','insights']].map(([label,href,icon]) => <Link key={href} href={href} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:text-primary"><AppIcon className=" text-primary">{icon}</AppIcon><span className="font-semibold">{label}</span><AppIcon className=" ml-auto text-outline">chevron_right</AppIcon></Link>)}
      </div></section>
    </main>
  );

  return (
    <main className="flex-1 overflow-y-auto p-gutter lg:px-xl xl:px-margin bg-background">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-xl gap-md">
        <div>
          <h2 className="font-headline-h1 text-headline-h1 text-on-surface mb-xs">Chào buổi sáng, Quản trị viên.</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Hãy xem tình hình học tập hôm nay.</p>
        </div>
      </div>

      {error && (
        <div className="mb-xl p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <AppIcon className=" text-[18px]">error</AppIcon>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        <div className="stat-card bg-surface-container-lowest p-md flex flex-col justify-between h-[120px] rounded-lg border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Tổng người học</span>
            <AppIcon className=" text-outline text-[20px]">group</AppIcon>
          </div>
          <div>
            <div className="font-headline-h2 text-headline-h2 text-on-surface flex items-baseline gap-sm">
              {loading ? '...' : (stats?.totalUsers ?? 0).toLocaleString('vi-VN')}
            </div>
          </div>
        </div>

        <div className="stat-card bg-surface-container-lowest p-md flex flex-col justify-between h-[120px] rounded-lg border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Nội dung học</span>
            <AppIcon className=" text-outline text-[20px]">library_books</AppIcon>
          </div>
          <div>
            <div className="font-headline-h2 text-headline-h2 text-on-surface flex items-baseline gap-sm">
              {loading ? '...' : (stats?.totalVocab ?? 0).toLocaleString('vi-VN')} <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">từ vựng</span>
            </div>
          </div>
        </div>

        <div className="stat-card bg-surface-container-lowest p-md flex flex-col justify-between h-[120px] rounded-lg border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Đề thi chứng chỉ</span>
            <AppIcon className=" text-outline text-[20px]">assignment</AppIcon>
          </div>
          <div>
            <div className="font-headline-h2 text-headline-h2 text-on-surface flex items-baseline gap-sm">
              {loading ? '...' : (stats?.totalExams ?? 0).toLocaleString('vi-VN')} <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">đề thi</span>
            </div>
          </div>
        </div>

        <div className="stat-card bg-surface-container-lowest p-md flex flex-col justify-between h-[120px] rounded-lg border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:-translate-y-0.5 transition-all">
          <div className="flex justify-between items-start">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Tài khoản hoạt động</span>
            <AppIcon className=" text-outline text-[20px]">group</AppIcon>
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
            <h3 className="font-headline-h3 text-headline-h3 text-on-surface">Hoạt động học tập</h3>
            <Dropdown aria-label="Khoảng thời gian hoạt động" value={period} onChange={e => setPeriod(e.target.value)} className="bg-surface-bright border border-outline-variant rounded-md px-sm py-xs font-body-sm text-body-sm outline-none focus:border-primary">
              <option value="week">7 ngày gần nhất</option>
              <option value="month">Tháng này</option>
            </Dropdown>
          </div>
          <ActivityChart data={analytics?.weeklyActivity ?? []} />
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
              <Link href="/admin/questions/editor" className="flex flex-col items-center justify-center p-md border border-outline-variant rounded-lg hover:border-primary hover:bg-surface-bright transition-all group">
                <AppIcon className=" text-outline group-hover:text-primary mb-xs">post_add</AppIcon>
                <span className="font-interface-sb text-body-sm text-on-surface group-hover:text-primary">Thêm câu hỏi</span>
              </Link>
              <Link href="/admin/tests/builder" className="flex flex-col items-center justify-center p-md border border-outline-variant rounded-lg hover:border-primary hover:bg-surface-bright transition-all group">
                <AppIcon className=" text-outline group-hover:text-primary mb-xs">quiz</AppIcon>
                <span className="font-interface-sb text-body-sm text-on-surface group-hover:text-primary">Tạo quiz chứng chỉ</span>
              </Link>
              <Link href="/admin/students" className="flex flex-col items-center justify-center p-md border border-outline-variant rounded-lg hover:border-primary hover:bg-surface-bright transition-all group col-span-2">
                <AppIcon className=" text-outline group-hover:text-primary mb-xs">person_search</AppIcon>
                <span className="font-interface-sb text-body-sm text-on-surface group-hover:text-primary">Tìm người học</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="h-2xl"></div>
    </main>
  );
}
