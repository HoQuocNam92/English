'use client';

import { LevelBadge } from '@/shared/ui/LevelBadge';
import { Dropdown } from '@/shared/ui/Dropdown';
import * as React from 'react';
import { PageHeader, Pagination, SearchInput } from '@/shared/ui';
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

export default function AdminProgressPage() {
  const [items, setItems] = React.useState<StudentProgressItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [limit, setLimit] = React.useState(30);

  const [filters, setFilters] = React.useState({ levelCode: '', domainCode: '', certificateId: '' });
  const [options, setOptions] = React.useState<{ levels: any[]; domains: any[]; certificates: any[] }>({ levels: [], domains: [], certificates: [] });
  React.useEffect(() => {
    Promise.all([apiClient.get<any>('/levels'), apiClient.get<any>('/domains'), apiClient.get<any>('/certificates')])
      .then(([levels, domains, certificates]) => setOptions({ levels: levels.data ?? levels, domains: domains.data ?? domains, certificates: certificates.data ?? certificates }))
      .catch(() => setError('Không thể tải danh mục bộ lọc. Vui lòng tải lại trang.'));
  }, []);
  const totalPages = Math.ceil(total / limit);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...filters,
      });
      const res = await apiClient.get<PaginatedResponse<StudentProgressItem>>(`/progress-overview?${params}`);
      setItems(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải dữ liệu tiến độ học tập');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, filters]);

  React.useEffect(() => { void load(); }, [load]);

  return (
    <div>
      <PageHeader title="Tiến độ học tập toàn hệ thống" description="Báo cáo tiến độ hoàn thành bài học, tỷ lệ đạt bài thi và năng lực học viên" />

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1.5fr)_repeat(3,minmax(140px,1fr))_auto] rounded-2xl border border-outline-variant/50 bg-white p-4">
        <div className="grid min-w-0 gap-1 text-xs font-semibold text-on-surface-variant"><span>Tìm học viên</span>
        <SearchInput
          className="!w-full !max-w-none"
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
        {([['levelCode', 'Trình độ', options.levels], ['domainCode', 'Lĩnh vực', options.domains], ['certificateId', 'Mục tiêu chứng chỉ', options.certificates]] as const).map(([key, label, list]) => <label key={key} className="grid min-w-0 gap-1 text-xs font-semibold text-on-surface-variant">{label}<Dropdown aria-label={label} value={filters[key]} onChange={event => { setFilters(current => ({ ...current, [key]: event.target.value })); setPage(1); }} className="h-11 w-full rounded-xl border border-outline-variant bg-white px-3 text-sm text-on-surface"><option value="">Tất cả</option>{list.map(item => <option key={item.id} value={key === 'certificateId' ? item.id : item.code}>{item.name}</option>)}</Dropdown></label>)}
        <button type="button" onClick={() => { setFilters({ levelCode: '', domainCode: '', certificateId: '' }); setSearch(''); setSearchInput(''); setPage(1); }} className="h-11 rounded-xl border border-outline-variant px-4 text-sm">Xóa bộ lọc</button>
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
      <div className="mt-4 rounded-2xl bg-surface-container-lowest overflow-hidden shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20 text-xs text-on-surface-variant bg-surface-container-low/60">
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
                      <LevelBadge level={st.level} />
                    </td>
                    <td className="px-4 py-3 w-48">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-surface-container h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, st.avgCompletion))}%` }}
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
        {total > 0 && <Pagination page={page} limit={limit} total={total} totalPages={totalPages} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} showQuickJumper />}
      </div>
    </div>
  );
}
