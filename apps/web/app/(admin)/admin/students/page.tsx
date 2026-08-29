'use client';

import * as React from 'react';
import { PageHeader, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { UserItem, PaginatedResponse } from '@/shared/api/api-client';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; dot: string }> = {
    active: { label: 'Đang học', dot: 'bg-emerald-500' },
    suspended: { label: 'Tạm khoá', dot: 'bg-red-500' },
    inactive: { label: 'Chưa kích hoạt', dot: 'bg-gray-400' },
  };
  const s = map[status] ?? { label: status, dot: 'bg-gray-400' };
  return (
    <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export default function AdminStudentsPage() {
  const [students, setStudents] = React.useState<UserItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const limit = 12;

  const totalPages = Math.ceil(total / limit);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        role: 'learner',
        ...(search && { search }),
        ...(status && { status }),
      });
      const res = await apiClient.get<PaginatedResponse<UserItem>>(`/users?${params}`);
      setStudents(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải danh sách học viên');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  React.useEffect(() => { void load(); }, [load]);

  return (
    <div>
      <PageHeader title="Quản lý học viên" description="Danh sách học viên, tiến độ học tập và mục tiêu chứng chỉ" />

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(sanitized) => {
            setPage(1);
            setSearch(sanitized);
          }}
          placeholder="Tìm kiếm học viên theo tên, email..."
          maxLength={100}
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-sm text-on-surface focus:outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang học (Active)</option>
          <option value="suspended">Tạm khoá</option>
          <option value="inactive">Chưa kích hoạt</option>
        </select>
      </div>

      {!loading && (
        <p className="mt-3 text-xs text-on-surface-variant">
          Tổng cộng {total} học viên {search && `— kết quả cho "${search}"`}
        </p>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Grid of students */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-outline-variant/20" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-2/3 rounded bg-outline-variant/20" />
                  <div className="h-3 w-1/2 rounded bg-outline-variant/10" />
                </div>
              </div>
            </div>
          ))
        ) : students.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30">
            <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">school</span>
            <p className="text-sm text-on-surface-variant">Không tìm thấy học viên nào</p>
          </div>
        ) : (
          students.map((st) => (
            <div
              key={st.id}
              className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 flex flex-col justify-between hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {(st.displayName ?? st.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-on-surface">{st.displayName ?? 'Học viên'}</h3>
                      <p className="text-xs text-on-surface-variant truncate max-w-[180px]">{st.email}</p>
                    </div>
                  </div>
                  <StatusBadge status={st.status} />
                </div>

                {st.phoneNumber && (
                  <div className="flex items-center gap-1 text-xs text-on-surface-variant mb-2">
                    <span className="material-symbols-outlined text-[14px]">call</span>
                    <span>{st.phoneNumber}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
                <span>Tham gia: {new Date(st.createdAt).toLocaleDateString('vi-VN')}</span>
                <span className="text-primary font-medium text-[11px] bg-primary/5 px-2 py-0.5 rounded">Học viên IT</span>
              </div>
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
