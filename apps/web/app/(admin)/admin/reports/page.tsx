'use client';
import { showToast } from '@/shared/ui/AppFeedback';
import { ActionButton, ActionGroup } from '@/shared/ui/ActionButton';
import { AppIcon } from '@/shared/ui/AppIcon';

import { Dropdown } from '@/shared/ui/Dropdown';
import * as React from 'react';
import { ActivityChart } from '@/shared/ui/ActivityChart';
import { apiClient, ApiClientError } from '@/shared/api/api-client';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalLessons: number;
    totalExams: number;
    totalVocab: number;
    passRate: number;
    averageScore: number;
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
  certificatesDistribution: Array<{ id: string; code: string; name: string; goalLearners: number; exams: number; learnersAttempted: number; attempts: number; averageScore: number; passRate: number }>;
  completionStats: { completedLearners: number; completedItems: number; topLearners: Array<{ learnerId: string; displayName: string; completedItems: number }> };
}

type FilterOption = { id: string; code?: string; name: string };
type ReportFilters = { dateFrom: string; dateTo: string; domainCode: string; certificateId: string };

const formatDateInput = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const presetRange = (preset: string): Pick<ReportFilters, 'dateFrom' | 'dateTo'> => {
  const today = new Date();
  if (preset === 'last_month') return { dateFrom: formatDateInput(new Date(today.getFullYear(), today.getMonth() - 1, 1)), dateTo: formatDateInput(new Date(today.getFullYear(), today.getMonth(), 0)) };
  if (preset === 'year') return { dateFrom: formatDateInput(new Date(today.getFullYear(), 0, 1)), dateTo: formatDateInput(today) };
  if (preset === 'last_7_days') { const from = new Date(today); from.setDate(today.getDate() - 6); return { dateFrom: formatDateInput(from), dateTo: formatDateInput(today) }; }
  return { dateFrom: formatDateInput(new Date(today.getFullYear(), today.getMonth(), 1)), dateTo: formatDateInput(today) };
};

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
  const [period, setPeriod] = React.useState('month');
  const initialRange = React.useMemo(() => presetRange('month'), []);
  const [dateFrom, setDateFrom] = React.useState(initialRange.dateFrom);
  const [dateTo, setDateTo] = React.useState(initialRange.dateTo);
  const [domainCode, setDomainCode] = React.useState('');
  const [certificateId, setCertificateId] = React.useState('');
  const [domains, setDomains] = React.useState<FilterOption[]>([]);
  const [certificates, setCertificates] = React.useState<FilterOption[]>([]);
  const [appliedFilters, setAppliedFilters] = React.useState<ReportFilters>({ ...initialRange, domainCode: '', certificateId: '' });

  React.useEffect(() => {
    void Promise.all([apiClient.get<any>('/domains'), apiClient.get<any>('/certificates')]).then(([domainResult, certificateResult]) => {
      setDomains(domainResult?.data ?? domainResult ?? []);
      setCertificates(certificateResult?.data ?? certificateResult ?? []);
    }).catch(() => {});
  }, []);

  React.useEffect(() => {
    let current = true;
    async function load() {
      setLoading(true);
      setAnalytics(null);
      setError(null);
      try {
        const query = new URLSearchParams(Object.entries(appliedFilters).filter(([, value]) => value));
        const res = await apiClient.get<AnalyticsData>(`/analytics/dashboard?${query}`);
        if (current) setAnalytics(res);
      } catch (e) {
        if (current) setError(e instanceof ApiClientError ? e.message : 'Không thể tải dữ liệu báo cáo');
      } finally {
        if (current) setLoading(false);
      }
    }
    void load();
    return () => { current = false; };
  }, [appliedFilters]);

  const changePeriod = (value: string) => {
    setPeriod(value);
    if (value !== 'custom') {
      const range = presetRange(value);
      setDateFrom(range.dateFrom);
      setDateTo(range.dateTo);
    }
  };

  const applyFilters = () => {
    if (!dateFrom || !dateTo) { setError('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.'); return; }
    if (dateFrom > dateTo) { setError('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.'); return; }
    setAppliedFilters({ dateFrom, dateTo, domainCode, certificateId });
  };

  const resetFilters = () => {
    const range = presetRange('month');
    setPeriod('month');
    setDateFrom(range.dateFrom);
    setDateTo(range.dateTo);
    setDomainCode('');
    setCertificateId('');
    setError(null);
    setAppliedFilters({ ...range, domainCode: '', certificateId: '' });
  };

  const hasPendingFilters = dateFrom !== appliedFilters.dateFrom
    || dateTo !== appliedFilters.dateTo
    || domainCode !== appliedFilters.domainCode
    || certificateId !== appliedFilters.certificateId;
  const hasActiveFilters = Boolean(appliedFilters.domainCode || appliedFilters.certificateId)
    || appliedFilters.dateFrom !== initialRange.dateFrom
    || appliedFilters.dateTo !== initialRange.dateTo;

  const totalDomainItems = analytics?.domainsDistribution.reduce((s, d) => s + d.totalItems, 0) || 1;
  const maxWeeklyActivity = Math.max(1, ...(analytics?.weeklyActivity.map((w) => w.activityCount) ?? [100]));
  const completionRate = Math.min(100, Math.max(0, analytics?.overview.passRate ?? 0));

  const exportExcel = async () => {
    if (!analytics) return;
    const XLSX = await import('xlsx');
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet([{ 'Tổng học viên': analytics.overview.totalUsers, 'Học viên hoạt động': analytics.overview.activeUsers, 'Tổng bài học': analytics.overview.totalLessons, 'Tổng từ vựng': analytics.overview.totalVocab, 'Tổng bài thi': analytics.overview.totalExams, 'Tỷ lệ đạt (%)': analytics.overview.passRate, 'Điểm trung bình': analytics.overview.averageScore }]), 'Tổng quan');
    XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(analytics.domainsDistribution.map(item => ({ 'Lĩnh vực CNTT': item.name, 'Bài học': item.lessons, 'Từ vựng': item.vocabularies, 'Câu hỏi': item.questions, 'Bài thi': item.exams, 'Tổng nội dung': item.totalItems }))), 'Theo lĩnh vực');
    XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(analytics.levelsDistribution.map(item => ({ 'Trình độ': item.name, 'Bài học': item.lessons, 'Từ vựng': item.vocabularies, 'Câu hỏi': item.questions, 'Bài thi': item.exams }))), 'Theo trình độ');
    XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(analytics.certificatesDistribution.map(item => ({ 'Chứng chỉ': item.name, 'Mã': item.code, 'Người đặt mục tiêu': item.goalLearners, 'Người đã thi': item.learnersAttempted, 'Lượt thi': item.attempts, 'Điểm trung bình': item.averageScore, 'Tỷ lệ đạt (%)': item.passRate }))), 'Theo chứng chỉ');
    XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(analytics.weeklyActivity.map(item => ({ 'Ngày': item.day, 'Lượt hoạt động': item.activityCount, 'Người học hoạt động': item.activeUsers }))), 'Tiến độ hoạt động');
    XLSX.writeFile(book, `bao-cao-thong-ke-${appliedFilters.dateFrom}-${appliedFilters.dateTo}.xlsx`);
      showToast('Đã tạo tệp Excel báo cáo thống kê.', 'success');
  };

  const exportChart = async (kind: 'activity' | 'domains' | 'certificates') => {
    if (!analytics || loading || error || hasPendingFilters) return;
    try {
      const XLSX = await import('xlsx');
      const rows = kind === 'activity' ? analytics.weeklyActivity.map(item => ({ 'Ngày': item.day, 'Lượt hoạt động': item.activityCount, 'Học viên hoạt động': item.activeUsers }))
        : kind === 'domains' ? analytics.domainsDistribution.map(item => ({ 'Lĩnh vực': item.name, 'Bài học': item.lessons, 'Từ vựng': item.vocabularies, 'Câu hỏi': item.questions, 'Bài thi': item.exams, 'Tổng nội dung': item.totalItems }))
        : analytics.certificatesDistribution.map(item => ({ 'Chứng chỉ': item.name, 'Điểm trung bình (%)': item.averageScore, 'Lượt thi': item.attempts, 'Tỷ lệ đạt (%)': item.passRate }));
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), 'Dữ liệu');
      XLSX.writeFile(book, `bao-cao-${kind}-${appliedFilters.dateFrom}-${appliedFilters.dateTo}.xlsx`);
      showToast('Đã xuất dữ liệu biểu đồ.', 'success');
    } catch { showToast('Chưa xuất được dữ liệu. Vui lòng thử lại.', 'error'); }
  };

  return (
    <main className="min-w-0 flex-1 bg-background p-4 sm:p-6 lg:p-margin">
      <div className="mx-auto flex w-full min-w-0 flex-col gap-xl">
        <div className="flex min-w-0 flex-col gap-5">
          <div>
            <h2 className="font-headline-h1 text-headline-h1 text-on-surface">Báo cáo Tổng quan</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-sm">Hiệu suất học tập và tương tác của hệ thống.</p>
          </div>
          <section aria-label="Bộ lọc báo cáo" className="grid w-full min-w-0 gap-4 rounded-2xl border border-outline-variant/50 bg-white p-4 sm:grid-cols-2 xl:grid-cols-3">
            <label className="grid gap-1 text-sm font-semibold">Khoảng thời gian<Dropdown aria-label="Khoảng thời gian" value={period} onChange={e => changePeriod(e.target.value)} className="h-11 min-w-0 rounded-xl border border-outline-variant px-3"><option value="month">Tháng này</option><option value="last_month">Tháng trước</option><option value="last_7_days">7 ngày gần nhất</option><option value="year">Năm nay</option><option value="custom">Tùy chọn ngày</option></Dropdown></label>
            <label className="grid gap-1 text-sm font-semibold">Lĩnh vực<Dropdown aria-label="Lĩnh vực" value={domainCode} onChange={e => setDomainCode(e.target.value)} className="h-11 min-w-0 rounded-xl border border-outline-variant px-3"><option value="">Tất cả lĩnh vực</option>{domains.map(d => <option key={d.id} value={d.code}>{d.name}</option>)}</Dropdown></label>
            <label className="grid gap-1 text-sm font-semibold">Chứng chỉ<Dropdown aria-label="Chứng chỉ" value={certificateId} onChange={e => setCertificateId(e.target.value)} className="h-11 min-w-0 rounded-xl border border-outline-variant px-3"><option value="">Tất cả chứng chỉ</option>{certificates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Dropdown></label>
            <label className="grid gap-1 text-sm font-semibold">Từ ngày<input aria-label="Từ ngày" type="date" value={dateFrom} max={dateTo} onChange={e => { setDateFrom(e.target.value); setPeriod('custom'); }} className="h-11 min-w-0 w-full rounded-xl border border-outline-variant px-3" /></label>
            <label className="grid gap-1 text-sm font-semibold">Đến ngày<input aria-label="Đến ngày" type="date" value={dateTo} min={dateFrom} onChange={e => { setDateTo(e.target.value); setPeriod('custom'); }} className="h-11 min-w-0 w-full rounded-xl border border-outline-variant px-3" /></label>
            <div className="flex flex-wrap items-end gap-2"><button onClick={applyFilters} disabled={loading} className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold !text-white disabled:opacity-50">Áp dụng</button><button onClick={resetFilters} className="h-11 rounded-xl border border-outline-variant px-4 text-sm">Đặt lại</button><button onClick={() => void exportExcel()} disabled={!analytics || loading || hasPendingFilters || !!error} className="h-11 rounded-xl border border-outline-variant px-4 text-sm disabled:opacity-50">Xuất Excel</button></div>
            <p className="text-sm text-on-surface-variant sm:col-span-2 xl:col-span-3">{hasPendingFilters ? 'Bộ lọc đã thay đổi. Nhấn Áp dụng để cập nhật dữ liệu.' : `Đang hiển thị: ${appliedFilters.dateFrom} đến ${appliedFilters.dateTo}`}</p>
          </section>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
            <AppIcon className=" text-[18px]">error</AppIcon>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-md">
              <span className="font-interface-sb text-interface-sb text-on-surface-variant">Tổng số người học</span>
              <AppIcon className=" text-primary" data-icon="group">group</AppIcon>
            </div>
            <div>
              <div className="font-headline-h1 text-headline-h1 text-on-surface">{loading ? '...' : analytics?.overview.totalUsers.toLocaleString()}</div>
              <div className="flex items-center gap-xs mt-xs text-green-700 font-body-sm text-body-sm">
                <AppIcon className=" text-[14px]" data-icon="trending_up">trending_up</AppIcon>
                <span>Dữ liệu tài khoản hiện tại</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-md">
              <span className="font-interface-sb text-interface-sb text-on-surface-variant">Người học hoạt động</span>
              <AppIcon className=" text-secondary" data-icon="local_fire_department">local_fire_department</AppIcon>
            </div>
            <div>
              <div className="font-headline-h1 text-headline-h1 text-on-surface">{loading ? '...' : analytics?.overview.activeUsers.toLocaleString()}</div>
              <div className="flex items-center gap-xs mt-xs text-green-700 font-body-sm text-body-sm">
                <AppIcon className=" text-[14px]" data-icon="trending_up">trending_up</AppIcon>
                <span>Dữ liệu hoạt động hiện tại</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-md">
              <span className="font-interface-sb text-interface-sb text-on-surface-variant">Tỷ lệ đạt bài thi</span>
              <AppIcon className=" text-tertiary" data-icon="task_alt">task_alt</AppIcon>
            </div>
            <div>
              <div className="font-headline-h1 text-headline-h1 text-on-surface">{loading ? '...' : Math.round(completionRate)}%</div>
              <div className="w-full bg-surface-container-high h-2 rounded-full mt-sm overflow-hidden">
                <div className="bg-tertiary h-full rounded-full" style={{ width: `${completionRate}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-md">
              <span className="font-interface-sb text-interface-sb text-on-surface-variant">Điểm TB hệ thống</span>
              <AppIcon className=" text-primary-container" data-icon="school">school</AppIcon>
            </div>
            <div>
              <div className="font-headline-h1 text-headline-h1 text-on-surface">{loading ? '...' : ((analytics?.overview.averageScore ?? 0) / 10).toFixed(1)}<span className="text-headline-h3 text-on-surface-variant">/10</span></div>
              <div className="mt-xs font-body-sm text-body-sm text-on-surface-variant">Tính từ các lượt thi thực tế</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          <div className="min-w-0 lg:col-span-2 bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="font-headline-h3 text-headline-h3 text-on-surface">Hoạt động học tập (tối đa 31 ngày cuối kỳ)</h3>
              <ActionGroup><ActionButton action="export" label="Xuất dữ liệu biểu đồ" disabled={!analytics || loading || hasPendingFilters || !!error} onClick={() => void exportChart('activity')} /></ActionGroup>
            </div>
            <ActivityChart data={analytics?.weeklyActivity ?? []} />
          </div>

          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="font-headline-h3 text-headline-h3 text-on-surface">Phân bố theo lĩnh vực</h3>
              <ActionGroup><ActionButton action="export" label="Xuất dữ liệu biểu đồ" disabled={!analytics || loading || hasPendingFilters || !!error} onClick={() => void exportChart('domains')} /></ActionGroup>
            </div>
            <div className="mt-md flex flex-col gap-sm">
              {(analytics?.domainsDistribution ?? []).map((dom, idx) => {
                const bgClasses = ['bg-primary', 'bg-secondary', 'bg-tertiary'];
                return (
                  <div key={dom.code} className="flex items-center justify-between font-body-sm text-body-sm">
                    <div className="flex items-center gap-xs"><div className={`w-3 h-3 rounded-full ${bgClasses[idx%3]}`}></div><span className="break-words">{dom.name}</span></div>
                    <span className="font-interface-sb text-on-surface">{Math.round((dom.totalItems / totalDomainItems) * 100)}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-3 bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="font-headline-h3 text-headline-h3 text-on-surface">Điểm trung bình theo chứng chỉ</h3>
              <ActionGroup><ActionButton action="export" label="Xuất dữ liệu biểu đồ" disabled={!analytics || loading || hasPendingFilters || !!error} onClick={() => void exportChart('certificates')} /></ActionGroup>
            </div>
            <div className="relative h-[300px] w-full min-w-0 overflow-x-auto overflow-y-hidden pb-2">
              <div className="flex h-full min-w-full items-end justify-between gap-6 px-2 pt-6" style={{ width: `${Math.max(100, (analytics?.certificatesDistribution.length ?? 0) * 108)}px` }}>
                 {(analytics?.certificatesDistribution ?? []).map(item => {
                    const heightPercent = Math.round(item.averageScore);
                    return (
                      <div key={item.id} className="min-w-20 flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <span className="text-xs font-bold text-on-surface opacity-100 transition-opacity">
                          {item.averageScore}% · {item.attempts} lượt
                        </span>
                        <div className="w-full bg-surface-container h-[80%] flex items-end">
                          <div
                            className="w-full bg-primary transition-all duration-500 group-hover:brightness-110 rounded-t-sm"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-on-surface-variant text-center leading-tight h-8">{item.code}</span>
                      </div>
                    );
                 })}
                 {!analytics?.certificatesDistribution.length && <p className="m-auto text-sm text-on-surface-variant">Chưa có dữ liệu thi theo chứng chỉ.</p>}
              </div>
            </div>
          </div>
          <div className="lg:col-span-3 grid gap-4 md:grid-cols-[1fr_2fr]">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5"><p className="text-sm font-semibold text-on-surface-variant">Người học đã hoàn thành</p><p className="mt-2 text-3xl font-black text-primary">{analytics?.completionStats.completedLearners ?? 0}</p><p className="mt-1 text-xs text-on-surface-variant">{analytics?.completionStats.completedItems ?? 0} nội dung đã hoàn thành</p></div>
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5"><h3 className="font-bold">Top người học hoàn thành nhiều nội dung</h3><div className="mt-3 divide-y divide-outline-variant/40">{analytics?.completionStats.topLearners.map((item,index)=><div key={item.learnerId} className="flex items-center justify-between py-2.5"><span className="text-sm font-semibold">{index+1}. {item.displayName}</span><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{item.completedItems} nội dung</span></div>)}{!analytics?.completionStats.topLearners.length&&<p className="py-4 text-sm text-on-surface-variant">Chưa có học viên hoàn thành nội dung trong kỳ.</p>}</div></div>
          </div>
        </div>
      </div>
    </main>
  );
}
