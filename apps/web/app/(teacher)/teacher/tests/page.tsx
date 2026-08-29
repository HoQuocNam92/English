'use client';

import * as React from 'react';
import { PageHeader, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { ExamItem, PaginatedResponse } from '@/shared/api/api-client';

const STATUSES = [
  { value: '', label: 'Tất cả' },
  { value: 'published', label: 'Đã đăng' },
  { value: 'draft', label: 'Nháp' },
  { value: 'archived', label: 'Lưu trữ' },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    published: { label: 'Đang mở', cls: 'bg-green-100 text-green-700' },
    draft: { label: 'Nháp', cls: 'bg-amber-100 text-amber-700' },
    archived: { label: 'Lưu trữ', cls: 'bg-gray-100 text-gray-600' },
  };
  const s = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 space-y-3 animate-pulse">
      <div className="h-5 w-3/4 rounded bg-outline-variant/20" />
      <div className="h-3 w-1/2 rounded bg-outline-variant/20" />
      <div className="h-4 w-full rounded bg-outline-variant/20" />
    </div>
  );
}

export default function TeacherTestsPage() {
  const [items, setItems] = React.useState<ExamItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const limit = 9;

  const totalPages = Math.ceil(total / limit);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(status && { status }),
      });
      const res = await apiClient.get<PaginatedResponse<ExamItem>>(`/exams?${params}`);
      setItems(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải bài thi');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  React.useEffect(() => { void load(); }, [load]);

  return (
    <div>
      <PageHeader title="Bài thi" description="Quản lý bài kiểm tra và đề thi" />

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(sanitized) => {
            setPage(1);
            setSearch(sanitized);
          }}
          placeholder="Tìm kiếm bài thi theo tiêu đề, chủ đề..."
          maxLength={100}
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-sm text-on-surface focus:outline-none"
        >
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {!loading && (
        <p className="mt-3 text-xs text-on-surface-variant">{total} bài thi</p>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm">{error}</div>
      )}

      {/* Cards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : items.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">quiz</span>
            <p className="text-sm text-on-surface-variant">Không tìm thấy bài thi</p>
          </div>
        ) : (
          items.map((exam) => (
            <div key={exam.id} className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 hover:shadow-sm transition-shadow flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-on-surface text-sm line-clamp-2 flex-1">{exam.title}</h3>
                <StatusBadge status={exam.status} />
              </div>

              {exam.description && (
                <p className="text-xs text-on-surface-variant line-clamp-2">{exam.description}</p>
              )}

              {/* Meta */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-surface-container rounded-lg px-3 py-2">
                  <p className="text-on-surface-variant mb-0.5">Thời gian</p>
                  <p className="font-semibold text-on-surface">{exam.durationMinutes} phút</p>
                </div>
                <div className="bg-surface-container rounded-lg px-3 py-2">
                  <p className="text-on-surface-variant mb-0.5">Điểm đạt</p>
                  <p className="font-semibold text-on-surface">{exam.passingScorePercent}%</p>
                </div>
                {exam.maxAttempts !== null && (
                  <div className="bg-surface-container rounded-lg px-3 py-2">
                    <p className="text-on-surface-variant mb-0.5">Số lần thi</p>
                    <p className="font-semibold text-on-surface">{exam.maxAttempts} lần</p>
                  </div>
                )}
                {exam.domain && (
                  <div className="bg-surface-container rounded-lg px-3 py-2">
                    <p className="text-on-surface-variant mb-0.5">Lĩnh vực</p>
                    <p className="font-semibold text-on-surface truncate">{exam.domain.name}</p>
                  </div>
                )}
              </div>

              {/* Topics */}
              {exam.topics?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {exam.topics.slice(0, 3).map((t) => (
                    <span key={t} className="text-xs text-on-surface-variant bg-outline-variant/10 px-2 py-0.5 rounded-full">
                      {t}
                    </span>
                  ))}
                  {exam.topics.length > 3 && (
                    <span className="text-xs text-on-surface-variant">+{exam.topics.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-on-surface-variant">Trang {page}/{totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-xl text-sm border border-outline-variant disabled:opacity-40 hover:bg-surface-container transition-colors">← Trước</button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-xl text-sm border border-outline-variant disabled:opacity-40 hover:bg-surface-container transition-colors">Sau →</button>
          </div>
        </div>
      )}
    </div>
  );
}
