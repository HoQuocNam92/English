'use client';
import { FilterPanel } from '@/shared/ui/FilterPanel';
import { SummaryStat } from '@/shared/ui/SummaryStat';
import { ClearFiltersButton } from '@/shared/ui/ClearFiltersButton';
import { formatAttemptDuration } from '@/shared/lib/attempt-duration';
import { showToast } from '@/shared/ui/AppFeedback';
import { AppIcon } from '@/shared/ui/AppIcon';
import { ActionButton, ActionGroup } from '@/shared/ui/ActionButton';

import { Dropdown } from '@/shared/ui/Dropdown';
import * as React from 'react';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { PageHeader, Pagination, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { PaginatedResponse } from '@/shared/api/api-client';
import { ExamAttemptDetailModal } from './ExamAttemptDetailModal';

interface TestResultItem {
  id: string;
  score?: number;
  scorePercent?: number;
  isPassed?: boolean;
  passed?: boolean;
  timeSpentSeconds?: number | null;
  startedAt?: string;
  submittedAt?: string;
  completedAt?: string;
  createdAt: string;
  learner?: {
    id: string;
    email: string;
    userDetail?: { displayName: string } | null;
  } | null;
  exam?: {
    id: string;
    title: string;
    passingScorePercent: number;
    durationMinutes: number;
    domain?: { name: string } | null;
    level?: { name: string } | null;
  } | null;
}

export default function AdminTestResultsPage() {
  const [results, setResults] = React.useState<TestResultItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [selectedAttemptId, setSelectedAttemptId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [limit, setLimit] = React.useState(30);

  const totalPages = Math.ceil(total / limit);
  const scoredResults = results.filter(item => item.scorePercent !== undefined || item.score !== undefined);
  const averageScore = scoredResults.length ? scoredResults.reduce((sum, item) => sum + Number(item.scorePercent ?? item.score ?? 0), 0) / scoredResults.length : 0;
  const passRate = results.length ? Math.round(results.filter(item => item.passed ?? item.isPassed).length / results.length * 100) : 0;

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(status === 'passed' && { passed: 'true' }),
        ...(status === 'failed' && { passed: 'false' }),
      });
      const res = await apiClient.get<PaginatedResponse<TestResultItem>>(`/test-results?${params}`);
      setResults(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải kết quả thi');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const exportExcel = async () => {
    setError(null);
    try {
      const first = await apiClient.get<PaginatedResponse<TestResultItem>>('/test-results?page=1&limit=100');
      const pages = await Promise.all(Array.from({ length: Math.max(0, first.meta.totalPages - 1) }, (_, index) => apiClient.get<PaginatedResponse<TestResultItem>>(`/test-results?page=${index + 2}&limit=100`)));
      const all = [first, ...pages].flatMap(item => item.data);
      const XLSX = await import('xlsx');
      const rows = all.map(item => ({ 'Học viên': item.learner?.userDetail?.displayName ?? item.learner?.email ?? '', Email: item.learner?.email ?? '', 'Chủ đề/Bài thi': item.exam?.title ?? '', 'Chuyên ngành': item.exam?.domain?.name ?? '', 'Trình độ': item.exam?.level?.name ?? '', 'Điểm (%)': item.scorePercent ?? item.score ?? '', 'Kết quả': (item.passed ?? item.isPassed) ? 'Đạt' : 'Chưa đạt', 'Thời gian làm bài': formatAttemptDuration(item), 'Thời gian nộp': item.submittedAt ? new Date(item.submittedAt).toLocaleString('vi-VN') : '' }));
      const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), 'Kết quả bài thi'); XLSX.writeFile(book, `ket-qua-bai-thi-${new Date().toISOString().slice(0,10)}.xlsx`);
      showToast('Đã tạo tệp Excel kết quả bài thi.', 'success');
    } catch (e) { setError(e instanceof ApiClientError ? e.message : 'Không thể xuất Excel'); }
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-margin bg-surface">
      <PageHeader
        className="mb-lg"
        title="Kết quả bài thi"
        description="Kết quả thi của tất cả người học"
        icon="fact_check"
        iconClassName="from-blue-500 to-indigo-500"
        action={<button type="button" onClick={() => void exportExcel()} className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-interface-sb text-interface-sb text-on-surface transition-colors hover:bg-surface-container-low"><AppIcon className=" text-[18px]">download</AppIcon>Xuất Excel</button>}
      />

      <FilterPanel className="mb-xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={searchInput} onChange={setSearchInput} onSearch={value => { setPage(1); setSearch(value); }} placeholder="Tìm kiếm theo email, tên bài thi…" />
        <div className="flex flex-wrap gap-3 sm:ml-auto">
          <Dropdown
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="py-sm px-3 rounded-lg border border-outline-variant text-sm bg-surface"
            >
              <option value="">Tất cả kết quả</option>
              <option value="passed">Đạt</option>
              <option value="failed">Không đạt</option>
            </Dropdown>
          <ClearFiltersButton onClick={() => { setSearchInput(''); setSearch(''); setStatus(''); setPage(1); }} />
        </div>
      </FilterPanel>

      {error && (
        <div className="mb-xl p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <AppIcon className=" text-[18px]">error</AppIcon>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
        <SummaryStat label="Điểm trung bình" value={(averageScore / 10).toFixed(1)} unit="/ 10 điểm" icon="leaderboard" description="Tính từ dữ liệu đang lọc" />
        <SummaryStat label="Lượt làm bài" value={total.toLocaleString('vi-VN')} unit="lượt nộp" icon="group" description="Tổng lượt nộp bài theo bộ lọc" />
        <SummaryStat label="Tỷ lệ đạt" value={passRate} unit="%" icon="check_circle" description="Tính từ dữ liệu đang lọc" />
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white">
              <tr className="border-b border-outline-variant bg-white font-label-caps text-label-caps text-on-surface-variant uppercase">
                <th className="p-md font-semibold min-w-[200px]">Học viên</th>
                <th className="p-md font-semibold min-w-[200px]">Thi theo chủ đề</th>
                <th className="p-md font-semibold">Điểm</th>
                <th className="p-md font-semibold hidden sm:table-cell">Thời gian làm bài</th>
                <th className="p-md font-semibold hidden md:table-cell">Thời gian nộp</th>
                <th className="p-md font-semibold">Kết quả</th>
                <th className="p-md font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8">Đang tải...</td></tr>
              ) : results.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-on-surface-variant">Không tìm thấy kết quả nào.</td></tr>
              ) : (
                results.map((r) => {
                  const learnerName = r.learner?.userDetail?.displayName || r.learner?.email || 'Người học';
                  const isPassed = Boolean(r.isPassed ?? r.passed);
                  const score = Math.round(Number(r.score ?? r.scorePercent ?? 0));
                  const timeFormatted = formatAttemptDuration(r);
                  const submittedDate = r.completedAt || r.submittedAt;

                  return (
                    <tr key={r.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                      <td className="p-md">
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center font-interface-sb text-on-primary-fixed shrink-0">
                            {learnerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-interface-sb text-interface-sb truncate max-w-[150px]">{learnerName}</span>
                            {r.learner?.email && r.learner.email !== learnerName && (
                              <span className="text-[11px] text-on-surface-variant truncate max-w-[150px]">{r.learner.email}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-md">
                        <div className="flex flex-col">
                          <span className="font-interface-sb text-interface-sb truncate max-w-[180px]">{r.exam?.title ?? 'Bài thi không xác định'}</span>
                          <span className="text-[11px] text-on-surface-variant">{r.exam?.domain?.name ?? 'General IT'}</span>
                        </div>
                      </td>
                      <td className={`p-md font-interface-sb text-interface-sb ${isPassed ? 'text-primary' : 'text-error'}`}>
                        {score} / 100
                      </td>
                      <td className="p-md hidden sm:table-cell text-on-surface-variant">
                        {timeFormatted}
                      </td>
                      <td className="p-md hidden md:table-cell text-on-surface-variant">
                        {submittedDate ? new Date(submittedDate).toLocaleString('vi-VN') : '—'}
                      </td>
                      <td className="p-md">
                        <StatusBadge status={isPassed ? 'passed' : 'failed'} />
                      </td>
                      <td className="p-md text-right">
                        <ActionGroup><ActionButton action="view" onClick={() => setSelectedAttemptId(r.id)} /></ActionGroup>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && <Pagination page={page} limit={limit} total={total} totalPages={totalPages} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} showQuickJumper />}
      </div>
      <div className="h-24 md:h-8"></div>

      {/* Detail Modal */}
      <ExamAttemptDetailModal
        attemptId={selectedAttemptId}
        onClose={() => setSelectedAttemptId(null)}
      />
    </main>
  );
}
