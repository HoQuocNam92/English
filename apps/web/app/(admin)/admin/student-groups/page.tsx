'use client';

import * as React from 'react';
import { PageHeader, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { PaginatedResponse } from '@/shared/api/api-client';

interface StudentGroupItem {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  teacher?: { userDetail: { displayName: string } | null; email: string } | null;
  domain?: { code: string; name: string } | null;
  certificate?: { code: string; name: string } | null;
  members?: Array<{
    learner: {
      id: string;
      email: string;
      userDetail: { displayName: string } | null;
    };
  }>;
  _count?: { members: number };
}

export default function AdminStudentGroupsPage() {
  const [groups, setGroups] = React.useState<StudentGroupItem[]>([]);
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
      const res = await apiClient.get<PaginatedResponse<StudentGroupItem>>(`/student-groups?${params}`);
      setGroups(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải danh sách nhóm học viên');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  React.useEffect(() => { void load(); }, [load]);

  return (
    <div>
      <PageHeader title="Quản lý nhóm học viên" description="Danh sách các lớp, nhóm luyện thi chứng chỉ và phân công giảng viên" />

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(sanitized) => {
            setPage(1);
            setSearch(sanitized);
          }}
          placeholder="Tìm kiếm nhóm theo tên, mã lớp (AWS-SAA, CompTIA...)..."
          maxLength={100}
        />
      </div>

      {!loading && (
        <p className="mt-3 text-xs text-on-surface-variant">
          Tổng cộng {total} nhóm học viên {search && `— kết quả cho "${search}"`}
        </p>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Groups Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 space-y-3 animate-pulse">
              <div className="h-5 w-2/3 rounded bg-outline-variant/20" />
              <div className="h-4 w-full rounded bg-outline-variant/10" />
              <div className="h-8 w-full rounded bg-outline-variant/10" />
            </div>
          ))
        ) : groups.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30">
            <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">groups</span>
            <p className="text-sm text-on-surface-variant">Không tìm thấy nhóm học viên nào</p>
          </div>
        ) : (
          groups.map((grp) => (
            <div key={grp.id} className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 flex flex-col justify-between hover:shadow-sm transition-all">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-base text-on-surface">{grp.name}</h3>
                    <code className="text-xs text-primary font-mono font-medium">{grp.code}</code>
                  </div>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
                    {grp.status === 'active' ? 'Đang hoạt động' : grp.status}
                  </span>
                </div>

                {grp.description && (
                  <p className="text-xs text-on-surface-variant line-clamp-2 mb-3 leading-relaxed">{grp.description}</p>
                )}

                {/* Details */}
                <div className="space-y-1.5 text-xs text-on-surface-variant mb-4 bg-surface-container/60 p-3 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span>Giảng viên phụ trách:</span>
                    <strong className="text-on-surface">
                      {grp.teacher?.userDetail?.displayName ?? grp.teacher?.email ?? 'Chưa phân công'}
                    </strong>
                  </div>
                  {grp.certificate && (
                    <div className="flex items-center justify-between">
                      <span>Mục tiêu chứng chỉ:</span>
                      <strong className="text-secondary">{grp.certificate.name} ({grp.certificate.code})</strong>
                    </div>
                  )}
                  {grp.domain && (
                    <div className="flex items-center justify-between">
                      <span>Lĩnh vực CNTT:</span>
                      <strong className="text-on-surface">{grp.domain.name}</strong>
                    </div>
                  )}
                </div>

                {/* Members list preview */}
                {grp.members && grp.members.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-on-surface-variant mb-1.5">
                      Thành viên ({grp.members.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {grp.members.map((m) => (
                        <span key={m.learner.id} className="text-[11px] bg-surface-container px-2 py-0.5 rounded-md text-on-surface font-medium">
                          {m.learner.userDetail?.displayName ?? m.learner.email}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-on-surface-variant">
                <span>
                  Bắt đầu: {grp.startDate ? new Date(grp.startDate).toLocaleDateString('vi-VN') : '—'}
                </span>
                <span>
                  Kết thúc: {grp.endDate ? new Date(grp.endDate).toLocaleDateString('vi-VN') : '—'}
                </span>
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
