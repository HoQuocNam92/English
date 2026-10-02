'use client';
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
  timeSpentSeconds?: number;
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
      const rows = all.map(item => ({ 'Học viên': item.learner?.userDetail?.displayName ?? item.learner?.email ?? '', Email: item.learner?.email ?? '', 'Chủ đề/Bài thi': item.exam?.title ?? '', 'Lĩnh vực': item.exam?.domain?.name ?? '', 'Trình độ': item.exam?.level?.name ?? '', 'Điểm (%)': item.scorePercent ?? item.score ?? '', 'Kết quả': (item.passed ?? item.isPassed) ? 'Đạt' : 'Chưa đạt', 'Thời gian làm bài': item.timeSpentSeconds ? `${Math.round(item.timeSpentSeconds / 60)} phút` : '', 'Thời gian nộp': item.submittedAt ? new Date(item.submittedAt).toLocaleString('vi-VN') : '' }));
      const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), 'Kết quả bài thi'); XLSX.writeFile(book, `ket-qua-bai-thi-${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (e) { setError(e instanceof ApiClientError ? e.message : 'Không thể xuất Excel'); }
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-margin bg-surface">
      <div className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h2 className="font-headline-h1 text-headline-h1 text-on-surface mb-xs">Lịch sử làm bài thi</h2>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-xs">
            <span className="material-symbols-outlined text-[16px]">history</span>
            Kết quả thi của tất cả người học
          </p>
        </div>
        <div className="flex gap-sm">
          <button onClick={() => void exportExcel()} className="px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-interface-sb text-interface-sb text-on-surface flex items-center gap-2 hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Xuất Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-xl p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
        <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all">
          <div className="flex justify-between items-start mb-sm">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">Điểm trung bình</p>
            <div className="p-sm bg-secondary-fixed rounded-full text-on-secondary-fixed-variant">
              <span className="material-symbols-outlined text-[20px]">leaderboard</span>
            </div>
          </div>
          <div className="flex items-end gap-sm">
            <h3 className="font-headline-h2 text-headline-h2 text-on-surface">{(averageScore / 10).toFixed(1)}</h3>
            <span className="font-body-sm text-body-sm text-on-surface-variant pb-1">/ 10</span>
          </div>
          <div className="mt-xs flex items-center gap-xs text-secondary">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span className="font-body-sm text-body-sm">Tính từ dữ liệu đang lọc</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all">
          <div className="flex justify-between items-start mb-sm">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">Lượt làm bài</p>
            <div className="p-sm bg-tertiary-fixed rounded-full text-on-tertiary-fixed-variant">
              <span className="material-symbols-outlined text-[20px]">group</span>
            </div>
          </div>
          <div className="flex items-end gap-sm">
            <h3 className="font-headline-h2 text-headline-h2 text-on-surface">{total.toLocaleString()}</h3>
          </div>
          <div className="mt-xs text-on-surface-variant text-sm">
            Lượt nộp bài trên toàn hệ thống
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all">
          <div className="flex justify-between items-start mb-sm">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">Tỷ lệ đạt</p>
            <div className="p-sm bg-primary-fixed rounded-full text-on-primary-fixed-variant">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
          </div>
          <div className="flex items-end gap-sm">
            <h3 className="font-headline-h2 text-headline-h2 text-on-surface">{passRate}%</h3>
          </div>
          <div className="mt-xs flex items-center gap-xs text-on-surface-variant">
            <span className="font-body-sm text-body-sm">Trung bình hệ thống</span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <div className="p-md border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-md bg-surface-bright">
          <h3 className="font-headline-h3 text-headline-h3 text-on-surface">Kết quả chi tiết</h3>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-start">
            <SearchInput value={searchInput} onChange={setSearchInput} onSearch={value => { setPage(1); setSearch(value); }} placeholder="Tìm kiếm theo email, tên bài thi…" />
            <Dropdown
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="py-sm px-3 rounded-lg border border-outline-variant text-sm bg-surface"
            >
              <option value="">Tất cả</option>
              <option value="passed">Đạt</option>
              <option value="failed">Không đạt</option>
            </Dropdown>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-lowest font-label-caps text-label-caps text-on-surface-variant uppercase">
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
                  const timeSpent = typeof r.timeSpentSeconds === 'number' && !Number.isNaN(r.timeSpentSeconds)
                    ? r.timeSpentSeconds
                    : (r.submittedAt && r.startedAt ? Math.max(0, Math.round((new Date(r.submittedAt).getTime() - new Date(r.startedAt).getTime()) / 1000)) : 0);
                  const mins = Math.floor(timeSpent / 60);
                  const secs = timeSpent % 60;
                  const timeFormatted = `${mins}m ${secs}s`;
                  const submittedDate = r.completedAt || r.submittedAt || r.createdAt;

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
