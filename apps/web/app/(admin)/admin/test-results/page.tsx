'use client';

import * as React from 'react';
import { PageHeader, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { PaginatedResponse } from '@/shared/api/api-client';

interface TestResultItem {
  id: string;
  score: number;
  isPassed: boolean;
  timeSpentSeconds: number;
  completedAt: string;
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
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const limit = 15;

  const totalPages = Math.ceil(total / limit);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
      });
      const res = await apiClient.get<PaginatedResponse<TestResultItem>>(`/test-results?${params}`);
      setResults(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải kết quả thi');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  React.useEffect(() => { void load(); }, [load]);

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
          <button className="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-interface-sb text-interface-sb text-on-surface flex items-center gap-xs hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Xuất CSV
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
            <h3 className="font-headline-h2 text-headline-h2 text-on-surface">7.8</h3>
            <span className="font-body-sm text-body-sm text-on-surface-variant pb-1">/ 10</span>
          </div>
          <div className="mt-xs flex items-center gap-xs text-secondary">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span className="font-body-sm text-body-sm">+0.4 so với tuần trước</span>
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
            <h3 className="font-headline-h2 text-headline-h2 text-on-surface">72%</h3>
          </div>
          <div className="mt-xs flex items-center gap-xs text-on-surface-variant">
            <span className="font-body-sm text-body-sm">Trung bình hệ thống</span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <div className="p-md border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-md bg-surface-bright">
          <h3 className="font-headline-h3 text-headline-h3 text-on-surface">Kết quả chi tiết</h3>
          <div className="relative w-full sm:w-auto min-w-[250px] flex gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">search</span>
              <input 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); setSearch(searchInput); } }}
                className="w-full pl-xl pr-md py-sm rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary font-body-sm text-body-sm text-on-surface" 
                placeholder="Tìm theo email, tên thi..." 
                type="text"
              />
            </div>
            <select
              value={status}
              onChange={(e) => {  setPage(1); }}
              className="py-sm px-3 rounded-lg border border-outline-variant text-sm bg-surface"
            >
              <option value="">Tất cả</option>
              <option value="passed">Đạt</option>
              <option value="failed">Không đạt</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-lowest font-label-caps text-label-caps text-on-surface-variant uppercase">
                <th className="p-md font-semibold min-w-[200px]">Học viên</th>
                <th className="p-md font-semibold min-w-[200px]">Bài thi</th>
                <th className="p-md font-semibold">Điểm</th>
                <th className="p-md font-semibold hidden sm:table-cell">Thời gian</th>
                <th className="p-md font-semibold hidden md:table-cell">Nộp lúc</th>
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
                          <span className="font-interface-sb text-interface-sb truncate max-w-[180px]">{r.exam?.title ?? 'Unknown Exam'}</span>
                          <span className="text-[11px] text-on-surface-variant">{r.exam?.domain?.name ?? 'General IT'}</span>
                        </div>
                      </td>
                      <td className={`p-md font-interface-sb text-interface-sb ${r.isPassed ? 'text-primary' : 'text-error'}`}>
                        {Math.round(r.score)} / 100
                      </td>
                      <td className="p-md hidden sm:table-cell text-on-surface-variant">
                        {Math.floor(r.timeSpentSeconds / 60)}m {r.timeSpentSeconds % 60}s
                      </td>
                      <td className="p-md hidden md:table-cell text-on-surface-variant">
                        {new Date(r.completedAt || r.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-md">
                        {r.isPassed ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#dcfce7] text-[#166534] font-interface-sb text-[11px]">Đạt</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-error-container text-on-error-container font-interface-sb text-[11px]">Không đạt</span>
                        )}
                      </td>
                      <td className="p-md text-right">
                        <button className="text-primary hover:text-primary-container font-interface-sb text-interface-sb transition-colors whitespace-nowrap">Chi tiết</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="p-md border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Hiển thị {(page - 1) * limit + 1}-{Math.min(page * limit, total)} của {total} kết quả
            </span>
            <div className="flex gap-xs">
              <button 
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-sm rounded border border-outline-variant text-outline disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button className="w-8 h-8 rounded bg-primary text-on-primary font-interface-sb text-interface-sb flex items-center justify-center">{page}</button>
              <button 
                disabled={page * limit >= total}
                onClick={() => setPage(p => p + 1)}
                className="p-sm rounded border border-outline-variant text-outline disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="h-24 md:h-8"></div>
    </main>
  );
}