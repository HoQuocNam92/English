'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/shared/api/api-client';
import { PageHeader } from '@/shared/ui/PageHeader';

type Entry = { id: string; actorEmail: string | null; actorId: string | null; method: string; action: string | null; route: string; targetIds: string[]; statusCode: number; createdAt: string; ipAddress: string | null };
type Result = { data: Entry[]; meta: { total: number; totalPages: number } };
const actions: Record<string, string> = { POST: 'Tạo / thực hiện', PATCH: 'Cập nhật', PUT: 'Thay thế', DELETE: 'Xóa / gỡ', GET: 'Truy cập' };
const states: Record<string, string> = { published: 'Xuất bản', draft: 'Chuyển về nháp', archived: 'Lưu trữ', active: 'Kích hoạt', inactive: 'Ngừng hoạt động' };
export default function AuditLogsPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [outcome, setOutcome] = useState('');
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    const query = new URLSearchParams({ page: String(page), limit: '25', search: filter, outcome });
    void apiClient.get<Result>(`/audit-logs?${query}`).then(value => { if (active) setResult(value); }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, filter, outcome, reload]);
  return <div className="admin-page-stack p-6">
    <PageHeader title="Nhật ký thao tác" icon="history" description="Theo dõi thay đổi dữ liệu, phân quyền và xác thực từ khi bật nhật ký. Chỉ quản trị viên có quyền xem." action={<button onClick={() => setReload(v => v + 1)} className="rounded-xl border border-primary px-4 py-2 font-semibold text-primary">Làm mới</button>} />
    <form onSubmit={e => { e.preventDefault(); setFilter(search.trim()); setPage(1); setReload(v => v + 1); }} className="flex flex-wrap gap-3 rounded-2xl border border-outline-variant bg-white p-4"><input aria-label="Tìm theo email hoặc thao tác" placeholder="Tìm theo email hoặc đường dẫn thao tác…" value={search} onChange={e => setSearch(e.target.value)} maxLength={100} className="min-w-48 flex-1 rounded-xl border border-outline-variant p-3" /><select aria-label="Kết quả thao tác" value={outcome} onChange={e => { setOutcome(e.target.value); setPage(1); }} className="rounded-xl border border-outline-variant p-3"><option value="">Tất cả kết quả</option><option value="success">Thành công</option><option value="failure">Thất bại</option></select><button className="rounded-xl bg-primary px-5 py-3 font-bold text-white">Tìm</button></form>
    {error && <p role="alert" className="text-error">{error}</p>}
    <div className="overflow-x-auto rounded-2xl border border-outline-variant bg-white"><table className="w-full text-left text-sm"><thead className="border-b border-outline-variant"><tr>{['Thời gian', 'Người thực hiện', 'Thao tác', 'Đối tượng', 'Kết quả'].map(label => <th key={label} className="p-4">{label}</th>)}</tr></thead><tbody>
      {loading ? <tr><td colSpan={5} className="p-6">Đang tải nhật ký…</td></tr> : !result?.data.length ? <tr><td colSpan={5} className="p-6">Chưa có thao tác phù hợp.</td></tr> : result.data.map(row => <tr key={row.id} className="border-b border-outline-variant/50"><td className="whitespace-nowrap p-4">{new Date(row.createdAt).toLocaleString('vi-VN')}</td><td className="p-4"><p>{row.actorEmail ?? 'Chưa xác thực'}</p><p className="mt-1 text-xs text-on-surface-variant">{row.ipAddress}</p></td><td className="p-4"><p className="font-semibold">{states[row.action ?? ""] ?? actions[row.method] ?? row.method}</p><code className="text-xs">{row.method} {row.route}</code></td><td className="max-w-xs p-4"><details><summary>{row.targetIds.length ? `${row.targetIds.length} mục` : 'Không có mã đối tượng'}</summary><ul className="mt-2 text-xs">{row.targetIds.map(id => <li key={id}>{id}</li>)}</ul></details></td><td className="p-4"><span className={row.statusCode < 400 ? 'text-emerald-700' : 'text-error'}>{row.statusCode < 400 ? 'Thành công' : 'Thất bại'} ({row.statusCode})</span></td></tr>)}
    </tbody></table></div>
    <div className="flex items-center justify-between gap-3 text-sm"><p>{result?.meta.total ?? 0} thao tác · Trang {page}/{Math.max(1, result?.meta.totalPages ?? 1)}</p><div className="flex gap-3"><button disabled={loading || page === 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-50">Trước</button><button disabled={loading || page >= (result?.meta.totalPages ?? 1)} onClick={() => setPage(p => p + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-50">Sau</button></div></div>
  </div>;
}
