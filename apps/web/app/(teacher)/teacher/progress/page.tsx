'use client';

import * as React from 'react';
import { PageHeader, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { PaginatedResponse } from '@/shared/api/api-client';

interface StudentProgressItem {
  id: string;
  displayName: string;
  email: string;
  level: string;
  completedLessons: number;
  avgCompletion: number;
  examCount: number;
  passedExams: number;
  overallScore: number;
}

export default function TeacherProgressPage() {
  const [items, setItems] = React.useState<StudentProgressItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const limit = 10;

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
      const res = await apiClient.get<PaginatedResponse<StudentProgressItem>>(`/progress-overview?${params}`);
      setItems(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải dữ liệu tiến độ học tập');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  React.useEffect(() => { void load(); }, [load]);

  return (
    <div>
      <PageHeader title="Tiến độ học tập của học viên" description="Theo dõi tiến độ hoàn thành bài học, tỷ lệ đạt bài thi và điểm số trung bình" />

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(sanitized) => {
            setPage(1);
            setSearch(sanitized);
          }}
          placeholder="Tìm theo tên học viên hoặc email..."
          maxLength={100}
        />
      </div>

      {!loading && (
        <p className="mt-3 text-xs text-on-surface-variant">
          Tổng cộng {total} học viên theo dõi {search && `— kết quả cho "${search}"`}
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
                <th className="px-4 py-3 text-left font-medium">Trình độ</th>
                <th className="px-4 py-3 text-left font-medium">Tiến độ bài học</th>
                <th className="px-4 py-3 text-left font-medium">Số bài hoàn thành</th>
                <th className="px-4 py-3 text-left font-medium">Đề thi đã làm</th>
                <th className="px-4 py-3 text-left font-medium">Tỷ lệ Đạt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-outline-variant/20 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <span className="material-symbols-outlined text-[40px] text-outline mb-2 block">insights</span>
                    <p className="text-on-surface-variant text-sm">Chưa có dữ liệu tiến độ</p>
                  </td>
                </tr>
              ) : (
                items.map((st) => (
                  <tr key={st.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-on-surface">{st.displayName}</p>
                      <p className="text-xs text-on-surface-variant">{st.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
                        {st.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 w-48">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-surface-container h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{ width: `${Math.max(10, st.avgCompletion)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-on-surface">{st.avgCompletion}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-on-surface font-semibold">
                      {st.completedLessons} bài
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">
                      {st.examCount} lượt làm ({st.passedExams} đạt)
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        st.overallScore >= 70 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                      }`}>
                        {st.overallScore}%
                      </span>
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
