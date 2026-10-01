'use client';

import { LevelBadge } from '@/shared/ui/LevelBadge';
import { Dropdown } from '@/shared/ui/Dropdown';
import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PageHeader, Pagination, SearchInput } from '@/shared/ui';
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
  const searchParams = useSearchParams();
  const certificateGoalsView = searchParams.get('view') === 'certificate-goals';
  const [students, setStudents] = React.useState<UserItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [domainId, setDomainId] = React.useState('');
  const [certificateId, setCertificateId] = React.useState('');
  const [domains, setDomains] = React.useState<Array<{ id: string; name: string }>>([]);
  const [certificates, setCertificates] = React.useState<Array<{ id: string; name: string; code: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [limit, setLimit] = React.useState(30);

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
        ...(domainId && { domainId }),
        ...(certificateId && { certificateId }),
      });
      const res = await apiClient.get<PaginatedResponse<UserItem>>(`/students?${params}`);
      setStudents(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải danh sách học viên');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, domainId, certificateId]);

  React.useEffect(() => { void load(); }, [load]);
  React.useEffect(() => {
    Promise.all([apiClient.get<any>('/domains'), apiClient.get<any>('/certificates')])
      .then(([domainResult, certificateResult]) => {
        setDomains(domainResult?.data ?? domainResult ?? []);
        setCertificates(certificateResult?.data ?? certificateResult ?? []);
      })
      .catch(() => {});
  }, []);

  return (
    <main className="flex-1 p-margin overflow-y-auto">
      <PageHeader
        className="mb-xl"
        title={certificateGoalsView ? 'Mục tiêu chứng chỉ của học viên' : 'Danh sách học viên'}
        description={certificateGoalsView ? 'Theo dõi và lọc học viên theo chứng chỉ nghề nghiệp đang hướng tới.' : 'Quản lý và theo dõi lộ trình học tập của sinh viên.'}
        icon={certificateGoalsView ? 'workspace_premium' : 'school'}
        iconClassName={certificateGoalsView ? 'from-violet-500 to-fuchsia-600' : 'from-cyan-500 to-blue-600'}
      />
      
      {error && (
        <div className="mb-xl p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md mb-xl flex flex-wrap gap-md items-center shadow-[0_1px_3px_rgba(15,23,24,0.06)]">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(value) => { setPage(1); setSearch(value); }}
          placeholder="Tìm theo tên, email..."
        />
        <Dropdown
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-outline-variant bg-surface-bright py-sm pl-sm pr-xl font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none min-w-[150px]"
        >
          <option value="">Trạng thái (Tất cả)</option>
          <option value="active">Đang học</option>
          <option value="suspended">Tạm khoá</option>
          <option value="inactive">Chưa kích hoạt</option>
        </Dropdown>
        <Dropdown value={domainId} onChange={(e) => { setDomainId(e.target.value); setPage(1); }} className="rounded-lg border border-outline-variant bg-surface-bright py-sm pl-sm pr-xl font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none min-w-[170px]">
          <option value="">Tất cả lĩnh vực</option>
          {domains.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Dropdown>
        <Dropdown value={certificateId} onChange={(e) => { setCertificateId(e.target.value); setPage(1); }} className="rounded-lg border border-outline-variant bg-surface-bright py-sm pl-sm pr-xl font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none min-w-[210px]">
          <option value="">Tất cả mục tiêu chứng chỉ</option>
          {certificates.map(item => <option key={item.id} value={item.id}>{item.code} - {item.name}</option>)}
        </Dropdown>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-[0_1px_3px_rgba(15,23,24,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-label-caps text-label-caps uppercase">
                <th className="p-md font-bold">Học viên</th>
                <th className="p-md font-bold">Trạng thái / Cấp độ</th>
                <th className="p-md font-bold">Lĩnh vực CNTT</th>
                <th className="p-md font-bold">Mục tiêu chứng chỉ</th>
                <th className="p-md font-bold">Ngày đăng ký</th>
                <th className="p-md font-bold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-md text-on-surface">
              {loading ? (
                 <tr><td colSpan={6} className="text-center py-8">Đang tải...</td></tr>
              ) : students.length === 0 ? (
                 <tr><td colSpan={6} className="text-center py-8 text-on-surface-variant">Không tìm thấy người học nào.</td></tr>
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
                        <LevelBadge level={u.level} />
                      </div>
                    </td>
                    <td className="p-md">
                      <span className="inline-flex items-center px-2 py-1 rounded-md border border-outline-variant bg-surface text-on-surface-variant font-body-sm text-[12px]">{u.domains?.join(', ') || 'Chưa thiết lập'}</span>
                    </td>
                    <td className="p-md">
                      <span className="inline-flex items-center px-2 py-1 rounded-md border border-violet-200 bg-violet-50 text-violet-800 font-body-sm text-[12px]">{(u as UserItem & { certGoals?: string[] }).certGoals?.join(', ') || 'Chưa chọn'}</span>
                    </td>
                    <td className="p-md text-on-surface-variant">
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-md text-center">
                      <Link
                        href={`/admin/students/${u.id}`}
                        className="ui-button ui-button-outline inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-primary bg-primary/5 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 whitespace-nowrap"
                      >
                        <span>Xem chi tiết</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && <Pagination page={page} limit={limit} total={total} totalPages={totalPages} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} showQuickJumper />}
      </div>
      <div className="h-24 md:h-8"></div>
    </main>
  );
}
