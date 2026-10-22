'use client';
import { SummaryStat } from '@/shared/ui/SummaryStat';
import { dashboardDateRange } from '@/shared/lib/dashboard-date-range';
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
    passRate: number; averageScore: number;
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
    date: string;
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
  const isAdmin = roles.includes('admin');
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
  const [customRange, setCustomRange] = React.useState(() => dashboardDateRange('week'));
  const activityRange = period === 'custom' ? customRange : dashboardDateRange(period);
  const activityRangeDays = activityRange.dateFrom && activityRange.dateTo ? Math.round((Date.parse(activityRange.dateTo) - Date.parse(activityRange.dateFrom)) / 86400000) + 1 : 0;
  const validActivityRange = activityRangeDays > 0 && activityRangeDays <= 366 && activityRange.dateTo <= dashboardDateRange('week').dateTo;
  React.useEffect(() => {
    if (!validActivityRange) return;
    let current = true;
    async function load() {
      setLoading(true);
      setAnalytics(null);
      setError(null);
      try {
        const [allUsers, allExams, allVocab, analyticsRes, activeUsers] = await Promise.all<any>([
          isAdmin ? apiClient.get<PaginatedResponse<UserItem>>('/users?limit=5') : Promise.resolve({ data: [], meta: { total: 0 } }),
          apiClient.get<PaginatedResponse<ExamItem>>('/exams?limit=1'),
          apiClient.get<PaginatedResponse<unknown>>('/vocabulary?limit=1'),
          apiClient.get<AnalyticsData>(`/analytics/dashboard?${new URLSearchParams(activityRange)}`),
          isAdmin ? apiClient.get<any>('/users?limit=1&status=active') : Promise.resolve({ meta: { total: 0 } }),
        ]);

        const activeCount = allUsers.data.filter((u: any) => u.status === 'active').length;

        if (!current) return;
        setStats({
          totalUsers: allUsers.meta.total,
          activeUsers: activeUsers.meta.total,
          totalExams: allExams.meta.total,
          totalVocab: allVocab.meta.total,
        });
        setRecentUsers(allUsers.data.slice(0, 5));
        if (analyticsRes) setAnalytics(analyticsRes);
      } catch (e: unknown) {
        if (current) setError(e instanceof ApiClientError ? e.message : 'Không thể tải dữ liệu Dashboard');
      } finally {
        if (current) setLoading(false);
      }
    }
    void load();
    return () => { current = false; };
  }, [isAdmin, activityRange.dateFrom, activityRange.dateTo, validActivityRange]);

  const statCards = [
    { label: 'Tổng người dùng', value: stats?.totalUsers ?? 0, sub: `${stats?.totalUsers ?? 0} tài khoản hệ thống`, icon: 'people', color: 'text-primary' },
    { label: 'Đề thi chứng chỉ', value: stats?.totalExams ?? 0, sub: 'AWS, CKA, Security+ Mock', icon: 'quiz', color: 'text-tertiary' },
    { label: 'Kho thuật ngữ IT', value: stats?.totalVocab ?? 0, sub: 'Thuật ngữ có IPA & ví dụ', icon: 'translate', color: 'text-emerald-600' },
  ];

  const totalDomainItems = analytics?.domainsDistribution.reduce((s, d) => s + d.totalItems, 0) || 1;

  if (!isAdmin) return (
    <main className="w-full space-y-8">
      <div><h2 className="text-3xl font-bold tracking-tight text-on-surface">Không gian giảng viên</h2></div>
      {error && <div className="rounded-xl bg-error-container p-4 text-sm text-on-error-container">{error}</div>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryStat label="Kho từ vựng" value={loading ? '…' : (stats?.totalVocab ?? 0).toLocaleString('vi-VN')} unit="từ" icon="library_books" />
        <SummaryStat label="Bài kiểm tra" value={loading ? '…' : (stats?.totalExams ?? 0).toLocaleString('vi-VN')} unit="bài" icon="quiz" />
        <SummaryStat label="Điểm trung bình trong kỳ" value={loading ? '…' : (analytics?.overview.averageScore ?? 0)} unit="%" icon="insights" />
        <SummaryStat label="Tỷ lệ đạt trong kỳ" value={loading ? '…' : (analytics?.overview.passRate ?? 0)} unit="%" icon="task_alt" />
      </div>
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h3 className="text-xl font-bold">Tình hình học tập</h3><p className="mt-1 text-sm text-on-surface-variant">Dữ liệu toàn hệ thống phục vụ giảng dạy; chưa giới hạn theo nhóm phụ trách.</p></div>
          <label className="grid gap-1 text-sm font-medium">Khoảng thời gian<Dropdown value={period} onChange={e => setPeriod(e.target.value)} className="rounded-xl border border-outline-variant bg-white px-3 py-2"><option value="week">7 ngày gần nhất</option><option value="month">Tháng này</option><option value="year">Năm nay</option></Dropdown></label>
        </div>
        {!error && <div className="grid gap-5 lg:grid-cols-3">
          <div className="min-w-0 rounded-2xl border border-outline-variant bg-white p-5 lg:col-span-2"><h4 className="mb-5 text-base font-semibold">Hoạt động học tập</h4>{loading ? <p className="py-12 text-center text-sm">Đang tải biểu đồ...</p> : <ActivityChart data={analytics?.weeklyActivity ?? []} />}</div>
          <div className="min-w-0 rounded-2xl border border-outline-variant bg-white p-5"><h4 className="mb-5 text-base font-semibold">Học liệu theo lĩnh vực trong kỳ</h4><p className="mb-4 text-xs text-on-surface-variant">Bài học, từ vựng, câu hỏi và bài kiểm tra được tạo trong kỳ.</p><div className="space-y-4">{loading ? <p className="text-sm">Đang tải biểu đồ...</p> : !analytics?.domainsDistribution.some(item => item.totalItems > 0) ? <p className="text-sm text-on-surface-variant">Chưa có học liệu trong kỳ này.</p> : [...analytics.domainsDistribution].filter(item => item.totalItems > 0).sort((a,b) => b.totalItems - a.totalItems).map(item => <div key={item.code}><div className="mb-1 flex justify-between gap-3 text-sm"><span>{item.name}</span><span className="font-semibold">{item.totalItems}</span></div><div className="h-2 overflow-hidden rounded-full bg-surface-container" role="img" aria-label={`${item.name}: ${item.totalItems} học liệu`}><div className="h-full rounded-full bg-primary" style={{ width: `${item.totalItems / totalDomainItems * 100}%` }} /></div></div>)}</div></div>
        </div>}
      </section>
      <section><h3 className="mb-4 text-xl font-bold">Công việc giảng dạy</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[['Thêm câu hỏi','/admin/questions/editor','post_add'],['Tạo quiz chứng chỉ','/admin/tests/builder','quiz'],['Xem kết quả thi','/admin/test-results','fact_check'],['Theo dõi tiến độ','/admin/progress','insights']].map(([label,href,icon]) => <Link key={href} href={href} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:text-primary"><AppIcon className=" text-primary">{icon}</AppIcon><span className="font-semibold">{label}</span><AppIcon className=" ml-auto text-outline">chevron_right</AppIcon></Link>)}
      </div></section>
    </main>
  );

  return (
    <main className="flex-1 overflow-y-auto p-gutter lg:px-xl xl:px-margin bg-background">
      <PageHeader
        className="mb-xl"
        title="Tổng quan"
        icon="dashboard"
      />

      {error && (
        <div className="mb-xl p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <AppIcon className=" text-[18px]">error</AppIcon>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        <SummaryStat label="Tổng người dùng" value={loading ? '…' : (stats?.totalUsers ?? 0).toLocaleString('vi-VN')} unit="người" icon="group" />
        <SummaryStat label="Tổng từ vựng" value={loading ? '…' : (stats?.totalVocab ?? 0).toLocaleString('vi-VN')} unit="từ vựng" icon="library_books" />
        <SummaryStat label="Đề thi chứng chỉ" value={loading ? '…' : (stats?.totalExams ?? 0).toLocaleString('vi-VN')} unit="đề thi" icon="assignment" />
        <SummaryStat label="Tài khoản hoạt động" value={loading ? '…' : (stats?.activeUsers ?? 0).toLocaleString('vi-VN')} unit="người" icon="group" />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
        <label className="grid gap-1 text-sm font-semibold text-on-surface">Khoảng thời gian biểu đồ
          <Dropdown aria-label="Khoảng thời gian biểu đồ" value={period} onChange={e => setPeriod(e.target.value)} className="bg-surface-bright border border-outline-variant rounded-md px-sm py-xs font-body-sm text-body-sm outline-none focus:border-primary">
            <option value="week">7 ngày gần nhất</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm nay</option>
            <option value="custom">Tùy chọn ngày</option>
          </Dropdown>
        </label>
        {period === 'custom' && <>
          <label className="grid gap-1 text-xs text-on-surface-variant">Từ ngày<input type="date" value={customRange.dateFrom} max={customRange.dateTo} onChange={e => setCustomRange(previous => ({ ...previous, dateFrom: e.target.value }))} className="rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface" /></label>
          <label className="grid gap-1 text-xs text-on-surface-variant">Đến ngày<input type="date" value={customRange.dateTo} min={customRange.dateFrom} max={dashboardDateRange('week').dateTo} onChange={e => setCustomRange(previous => ({ ...previous, dateTo: e.target.value }))} className="rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface" /></label>
        </>}
        <p className="text-xs text-on-surface-variant">Áp dụng cho các biểu đồ hoạt động và học liệu bên dưới.</p>
      </div>
      <div className="grid grid-cols-12 gap-6 mb-xl">
        <div className="stat-card bg-surface-container-lowest p-lg col-span-12 lg:col-span-4 min-h-[360px] flex flex-col rounded-lg border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:-translate-y-0.5 transition-all">
          <h3 className="font-headline-h3 text-headline-h3 text-on-surface mb-xl">Học liệu được tạo theo chuyên ngành</h3>
          <p className="mb-4 text-xs text-on-surface-variant">Trong khoảng thời gian đã chọn phía trên. Mỗi số là tổng bài học, từ vựng, câu hỏi và đề thi được tạo; % là tỷ trọng của chuyên ngành.</p>
          <div className="max-h-[360px] space-y-4 overflow-y-auto pr-2">
            {loading ? <p className="text-sm text-on-surface-variant">Đang tải số liệu...</p> : !(analytics?.domainsDistribution ?? []).some(dom => dom.totalItems > 0) ? <p className="text-sm text-on-surface-variant">Chưa có học liệu.</p> : [...(analytics?.domainsDistribution ?? [])].sort((a, b) => b.totalItems - a.totalItems).map(dom => {
              const percentage = dom.totalItems / totalDomainItems * 100;
              return (
                <div key={dom.code}>
                  <div className="mb-1.5 flex items-start justify-between gap-3 text-sm">
                    <span className="min-w-0 text-on-surface">{dom.name}</span>
                    <span className="shrink-0 text-xs text-on-surface-variant">{dom.totalItems.toLocaleString('vi-VN')} học liệu · {percentage.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-container-high" role="img" aria-label={`${dom.name}: ${dom.totalItems} học liệu, ${percentage.toFixed(1)}%`}>
                    <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="stat-card bg-surface-container-lowest p-lg col-span-12 lg:col-span-8 min-h-[360px] flex flex-col rounded-lg border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] hover:-translate-y-0.5 transition-all">
          <h3 className="font-headline-h3 text-headline-h3 text-on-surface mb-xl">Hoạt động học tập</h3>
          {!validActivityRange ? <p role="alert" className="text-sm text-error">Chọn khoảng ngày hợp lệ, tối đa 366 ngày và không sau hôm nay.</p> : loading ? <p className="py-12 text-center text-sm text-on-surface-variant">Đang tải số liệu...</p> : <ActivityChart data={analytics?.weeklyActivity ?? []} />}
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
