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

export default function TeacherTestResultsPage() {
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
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải kết quả thi của học viên');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  React.useEffect(() => { void load(); }, [load]);

  return (
    <div>
      <PageHeader title="Kết quả bài thi của học viên" description="Theo dõi điểm số, kết quả thi thử và tiến trình của học viên" />

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(sanitized) => {
            setPage(1);
            setSearch(sanitized);
          }}
          placeholder="Tìm theo tên học viên, email hoặc tên bài thi..."
          maxLength={100}
        />
      </div>

      {!loading && (
        <p className="mt-3 text-xs text-on-surface-variant">
          Tổng cộng {total} lượt làm bài {search && `— kết quả cho "${search}"`}
        </p>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="mt-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 text-xs text-on-surface-variant bg-surface-container/50">
                <th className="px-4 py-3 text-left font-medium">Học viên</th>
                <th className="px-4 py-3 text-left font-medium">Đề thi</th>
                <th className="px-4 py-3 text-left font-medium">Lĩnh vực</th>
                <th className="px-4 py-3 text-left font-medium">Điểm số</th>
                <th className="px-4 py-3 text-left font-medium">Kết quả</th>
                <th className="px-4 py-3 text-left font-medium">Thời gian</th>
                <th className="px-4 py-3 text-left font-medium">Ngày nộp bài</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-outline-variant/20 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <span className="material-symbols-outlined text-[40px] text-outline mb-2 block">fact_check</span>
                    <p className="text-on-surface-variant text-sm">Chưa có lượt nộp bài thi nào từ học viên của bạn</p>
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-on-surface">
                        {r.learner?.userDetail?.displayName ?? r.learner?.email ?? 'Học viên'}
                      </p>
                      <p className="text-xs text-on-surface-variant">{r.learner?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-on-surface">{r.exam?.title ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">{r.exam?.domain?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-bold text-on-surface">{r.score}%</td>
                    <td className="px-4 py-3">
                      {r.isPassed ? (
                        <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                          ĐẠT (PASS)
                        </span>
                      ) : (
                        <span className="text-xs text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full font-bold">
                          CHƯA ĐẠT
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">
                      {Math.round(r.timeSpentSeconds / 60)} phút
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">
                      {new Date(r.completedAt ?? r.createdAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-outline-variant/30 flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">Trang {page}/{totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg text-xs border border-outline-variant disabled:opacity-40 hover:bg-surface-container transition-colors">← Trước</button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg text-xs border border-outline-variant disabled:opacity-40 hover:bg-surface-container transition-colors">Sau →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
