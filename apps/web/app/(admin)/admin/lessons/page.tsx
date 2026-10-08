'use client';
import { AppIcon } from '@/shared/ui/AppIcon';
import { confirmDialog } from '@/shared/ui/AppFeedback';
import { ActionButton, ActionGroup } from '@/shared/ui/ActionButton';

import { LevelBadge } from '@/shared/ui/LevelBadge';
import { Dropdown } from '@/shared/ui/Dropdown';
import * as React from 'react';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BulkSelectionBar, PageHeader, Pagination, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { PaginatedResponse } from '@/shared/api/api-client';
import { ContentPreview } from './ContentPreview';
import { CONTENT_TYPES } from '@/shared/lib/admin-content-types';

type Lesson = { id: string; title: string; summary: string; type: string; keyConcepts?: string[]; estimatedMinutes: number; status: string; domain: { name: string }; level: { name: string }; _count?: { sections: number } };
const TYPES: Record<string, string> = { vocabulary: 'Từ vựng', terminology: 'Thuật ngữ CNTT', technical_reading: 'Đọc hiểu kỹ thuật', api_documentation: 'Tài liệu API', system_design: 'System Design', case_study: 'Tình huống thực tế', certification_review: 'Ôn tập chứng chỉ' };
const STATUS: Record<string, string> = { draft: 'Bản nháp', published: 'Đã xuất bản' };

export default function LessonsPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = React.useState<Lesson[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');
  const [total, setTotal] = React.useState(0);
  const [type, setType] = React.useState(() => searchParams.get('type') ?? '');
  const [status, setStatus] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const pageTitle = type ? TYPES[type] ?? 'Quản lý bài học' : 'Tất cả bài học';
  const category = CONTENT_TYPES[type];
  const itemName = category?.item ?? 'bài học';

  const load = React.useCallback(async () => {
    setLoading(true); setError('');
    try {
      const query = new URLSearchParams({ page: String(page), limit: '10', ...(search && { search }), ...(type && { type }), ...(status && { status }) });
      const result = await apiClient.get<PaginatedResponse<Lesson>>(`/lessons?${query}`);
      setItems(result.data); setTotal(result.meta.total); setTotalPages(result.meta.totalPages || 1);
    } catch (e) { setError(e instanceof ApiClientError ? e.message : 'Không thể tải danh sách bài học'); }
    finally { setLoading(false); }
  }, [page, search, type, status]);
  React.useEffect(() => { void load(); }, [load]);
  React.useEffect(() => { setSelectedIds(new Set()); }, [page, search, type, status]);
  React.useEffect(() => {
    const requestedType = searchParams.get('type') ?? '';
    if (requestedType !== type) { setType(requestedType); setPage(1); }
  }, [searchParams]);

  const bulkUpdateStatus = async (targetStatus: 'draft' | 'published', scope: 'selected' | 'filtered') => {
    if (scope === 'selected' && selectedIds.size === 0) return;
    const count = scope === 'selected' ? selectedIds.size : total;
    const action = targetStatus === 'published' ? 'xuất bản' : 'chuyển về bản nháp';
    const affected = scope === 'selected' ? `${count} bài học đã chọn` : `${count} kết quả đang lọc`;
    if (!(await confirmDialog(`Bạn có chắc muốn ${action} ${affected}?`, { title: 'Xác nhận cập nhật hàng loạt', confirmLabel: action, tone: targetStatus === 'published' ? 'primary' : 'warning' }))) return;
    setBulkBusy(true); setError(''); setSuccessMessage('');
    try {
      const filters = { search: search || undefined, currentStatus: status || undefined, type: type || undefined };
      const result = await apiClient.patch<{ updatedCount: number }>('/lessons/bulk-status', scope === 'selected'
        ? { ids: [...selectedIds], status: targetStatus }
        : { ...filters, status: targetStatus, confirmAll: !Object.values(filters).some(Boolean) });
      setSelectedIds(new Set());
      setSuccessMessage(`Đã ${action} ${result.updatedCount} bài học.`);
      await load();
    } catch (e) { setError(e instanceof ApiClientError ? e.message : 'Không thể cập nhật hàng loạt bài học'); }
    finally { setBulkBusy(false); }
  };
  const remove = async (item: Lesson) => { if (!await confirmDialog(`Bạn có muốn xóa bài học “${item.title}” hay không?`, { title: 'Xóa bài học', confirmLabel: 'Xóa', tone: 'danger' })) return; try { await apiClient.delete(`/lessons/${item.id}`); await load(); } catch (e) { setError(e instanceof ApiClientError ? e.message : 'Không thể xóa bài học'); } };

  return <div>
    <div className="flex items-start justify-between gap-4"><PageHeader icon={category?.icon} iconClassName={category?.iconClassName} title={pageTitle} description={category?.description ?? 'Quản lý các loại nội dung học tập'} /><Link href={`/admin/lessons/editor${type ? `?type=${type}` : ''}`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold !text-white"><AppIcon className=" text-[19px]">add</AppIcon>Thêm {itemName}</Link></div>
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <SearchInput value={searchInput} onChange={setSearchInput} onSearch={value => { setSearch(value); setPage(1); }} placeholder="Tìm theo tiêu đề, tóm tắt..." />
      <div className="flex flex-wrap gap-3 sm:ml-auto">
      <Dropdown value={type} onChange={e => { setType(e.target.value); setPage(1); }} className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 text-sm"><option value="">Tất cả loại bài học</option>{Object.entries(TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Dropdown>
      <Dropdown value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 text-sm"><option value="">Tất cả trạng thái</option>{Object.entries(STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Dropdown>
      </div>
    </div>
    {error && <div className="mt-4 rounded-xl bg-error-container p-3 text-sm text-on-error-container">{error}</div>}
    {successMessage && <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{successMessage}</div>}
    <BulkSelectionBar pageCount={items.length} selectedCount={selectedIds.size} allPageSelected={items.length > 0 && items.every((item) => selectedIds.has(item.id))} onSelectPage={(selected) => setSelectedIds((current) => { const next = new Set(current); items.forEach((item) => selected ? next.add(item.id) : next.delete(item.id)); return next; })}>
      {selectedIds.size > 0 && <><button disabled={bulkBusy} onClick={() => void bulkUpdateStatus('published', 'selected')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Xuất bản đã chọn</button><button disabled={bulkBusy} onClick={() => void bulkUpdateStatus('draft', 'selected')} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Chuyển về bản nháp đã chọn</button></>}
      <button disabled={bulkBusy || total === 0} onClick={() => void bulkUpdateStatus('published', 'filtered')} className="rounded-lg border border-emerald-600 px-3 py-2 text-xs font-bold text-emerald-700 disabled:opacity-50">Xuất bản tất cả kết quả lọc</button>
      <button disabled={bulkBusy || total === 0} onClick={() => void bulkUpdateStatus('draft', 'filtered')} className="rounded-lg border border-amber-500 px-3 py-2 text-xs font-bold text-amber-700 disabled:opacity-50">Chuyển tất cả kết quả lọc về bản nháp</button>
    </BulkSelectionBar>
    {category ? <div className="mt-5 space-y-4">
      {loading ? <p role="status" className="py-12 text-center">Đang tải nội dung...</p> : !items.length ? <p className="py-12 text-center text-on-surface-variant">Chưa có {itemName} phù hợp.</p> : items.map(item => <article key={item.id} className="rounded-2xl border border-outline-variant/50 bg-white p-5 shadow-sm">
        <label className="mb-3 inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-on-surface-variant"><input type="checkbox" aria-label={`Chọn ${item.title}`} checked={selectedIds.has(item.id)} onChange={() => setSelectedIds((current) => { const next = new Set(current); if (next.has(item.id)) next.delete(item.id); else next.add(item.id); return next; })} className="h-4 w-4 accent-primary" />Chọn bài học</label>
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-on-surface-variant"><LevelBadge level={item.level} /><span>{item.estimatedMinutes} phút</span><span>{item._count?.sections ?? 0} khối nội dung</span><StatusBadge status={item.status} /></div>
        <ContentPreview item={item} />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/40 pt-4"><span className="text-sm text-on-surface-variant">{item.domain.name}</span><ActionGroup><ActionButton action="edit" label={`Biên soạn ${category.item}`} href={`/admin/lessons/editor?id=${item.id}`} /><ActionButton action="delete" onClick={() => void remove(item)} /></ActionGroup></div>
      </article>)}
    </div> : (
    <div className="mt-4 overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest"><div className="overflow-x-auto"><table className="w-full min-w-[1040px] table-fixed text-left text-sm"><colgroup><col className="w-[5%]" /><col className="w-[32%]" /><col className="w-[11%]" /><col className="w-[13%]" /><col className="w-[10%]" /><col className="w-[8%]" /><col className="w-[11%]" /><col className="w-[10%]" /></colgroup><thead className="bg-white"><tr>{['Chọn', type ? `Tên ${itemName}` : 'Bài học','Loại nội dung','Lĩnh vực','Trình độ','Thời lượng','Trạng thái','Thao tác'].map(x => <th key={x} className={`px-4 py-3 font-semibold ${x === 'Thao tác' ? 'text-right' : ''}`}>{x}</th>)}</tr></thead><tbody className="divide-y divide-outline-variant/30">
      {loading ? <tr><td colSpan={8} className="px-4 py-12 text-center text-on-surface-variant">Đang tải bài học...</td></tr> : items.length === 0 ? <tr><td colSpan={8} className="px-4 py-14 text-center text-on-surface-variant">Chưa có bài học phù hợp bộ lọc.</td></tr> : items.map(item => <tr key={item.id} className="hover:bg-surface-container-low/60"><td className="px-4 py-3"><input type="checkbox" aria-label={`Chọn ${item.title}`} checked={selectedIds.has(item.id)} onChange={() => setSelectedIds((current) => { const next = new Set(current); if (next.has(item.id)) next.delete(item.id); else next.add(item.id); return next; })} className="h-4 w-4 accent-primary" /></td><td className="min-w-0 px-4 py-3"><p className="truncate font-semibold" title={item.title}>{item.title}</p><p className="mt-1 truncate text-xs text-on-surface-variant" title={item.summary}>{item.summary}</p></td><td className="px-4 py-3">{TYPES[item.type] ?? item.type}</td><td className="px-4 py-3">{item.domain.name}</td><td className="px-4 py-3"><LevelBadge level={item.level} /></td><td className="whitespace-nowrap px-4 py-3">{item.estimatedMinutes} phút</td><td className="whitespace-nowrap px-4 py-3"><StatusBadge status={item.status} /></td><td className="px-4 py-3"><ActionGroup><ActionButton action="edit" title="Chỉnh sửa" href={`/admin/lessons/editor?id=${item.id}`} /><ActionButton action="delete" title="Xóa" onClick={() => void remove(item)} /></ActionGroup></td></tr>)}</tbody></table></div></div>
    )}
    <div className="mt-5"><Pagination page={page} limit={10} total={total} totalPages={totalPages} onPageChange={setPage} /></div>
  </div>;
}
