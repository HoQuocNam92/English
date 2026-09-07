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
    <main className="flex-1 p-margin overflow-y-auto">
      <div className="mb-xl">
        <h2 className="font-headline-h1 text-headline-h1 text-on-surface mb-xs">Danh sách người học</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Quản lý và theo dõi lộ trình học tập của sinh viên.</p>
      </div>
      
      {error && (
        <div className="mb-xl p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md mb-xl flex flex-wrap gap-md items-center shadow-[0_1px_3px_rgba(15,23,24,0.06)]">
        <div className="flex-1 min-w-[200px] relative">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); setSearch(searchInput); } }}
            className="w-full pl-xl pr-sm py-sm rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-body-md text-on-surface transition-colors placeholder:text-outline" 
            placeholder="Tìm theo tên, email..." 
            type="text"
          />
        </div>
        <select 
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-outline-variant bg-surface-bright py-sm pl-sm pr-xl font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none min-w-[150px]"
        >
          <option value="">Trạng thái (Tất cả)</option>
          <option value="active">Đang học</option>
          <option value="suspended">Tạm khoá</option>
          <option value="inactive">Chưa kích hoạt</option>
        </select>
        <select className="rounded-lg border border-outline-variant bg-surface-bright py-sm pl-sm pr-xl font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none min-w-[150px]">
          <option value="">Lĩnh vực CNTT</option>
          <option value="se">Software Engineering</option>
          <option value="cc">Cloud Computing</option>
          <option value="ai">Artificial Intelligence</option>
        </select>
        <button className="bg-surface-container hover:bg-surface-container-high text-on-surface font-interface-sb py-sm px-md rounded-lg border border-outline-variant transition-colors flex items-center gap-xs">
          <span className="material-symbols-outlined text-[20px]">filter_list</span>
          Lọc
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-[0_1px_3px_rgba(15,23,24,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-label-caps text-label-caps uppercase">
                <th className="p-md font-bold">Học viên</th>
                <th className="p-md font-bold">Trạng thái / Cấp độ</th>
                <th className="p-md font-bold">Lĩnh vực CNTT</th>
                <th className="p-md font-bold">Ngày đăng ký</th>
                <th className="p-md font-bold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-md text-on-surface">
              {loading ? (
                 <tr><td colSpan={5} className="text-center py-8">Đang tải...</td></tr>
              ) : students.length === 0 ? (
                 <tr><td colSpan={5} className="text-center py-8 text-on-surface-variant">Không tìm thấy người học nào.</td></tr>
              ) : (
                students.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-bright transition-colors group">
                    <td className="p-md">
                      <div className="flex items-center gap-sm">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-interface-sb shrink-0 border border-outline-variant">
                          {(u.displayName ?? u.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-interface-sb text-interface-sb text-on-surface">{u.displayName ?? '—'}</p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-md">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full font-interface-sb text-[12px] ${
                          u.status === 'active' ? 'bg-[#E6F4EA] text-[#137333]' :
                          u.status === 'suspended' ? 'bg-[#FCE8E6] text-[#C5221F]' :
                          'bg-surface-container-highest text-outline'
                        }`}>
                          {u.status === 'active' ? 'Đang học' : u.status === 'suspended' ? 'Tạm khoá' : 'Chưa kích hoạt'}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-interface-sb text-[12px]">Trung cấp (Intermediate)</span>
                      </div>
                    </td>
                    <td className="p-md">
                      <span className="inline-flex items-center px-2 py-1 rounded-md border border-outline-variant bg-surface text-on-surface-variant font-body-sm text-[12px]">Cloud Computing</span>
                    </td>
                    <td className="p-md text-on-surface-variant">
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-md text-center">
                      <button className="text-primary hover:text-tertiary-container transition-colors p-sm rounded-lg hover:bg-primary-fixed opacity-0 group-hover:opacity-100">
                        <span className="font-interface-sb text-interface-sb">Xem chi tiết</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="p-md border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between bg-surface-container-lowest gap-3">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Hiển thị {(page - 1) * limit + 1}-{Math.min(page * limit, total)} của {total} học viên
            </span>
            <div className="flex items-center gap-xs">
              <button 
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-sm rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button className="w-8 h-8 rounded-lg bg-primary text-on-primary font-interface-sb flex items-center justify-center">{page}</button>
              <button 
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-sm rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="h-24 md:h-8"></div>
    </main>
  );
}