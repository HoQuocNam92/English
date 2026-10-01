'use client';

import * as React from 'react';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PageHeader, Pagination, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { PaginatedResponse } from '@/shared/api/api-client';
import { ContentPreview } from './ContentPreview';
import { CONTENT_TYPES } from '@/shared/lib/admin-content-types';

type Lesson = { id: string; title: string; summary: string; type: string; keyConcepts?: string[]; estimatedMinutes: number; status: string; domain: { name: string }; level: { name: string }; _count?: { sections: number } };
const TYPES: Record<string, string> = { vocabulary: 'Từ vựng', terminology: 'Thuật ngữ CNTT', technical_reading: 'Đọc hiểu kỹ thuật', api_documentation: 'Tài liệu API', system_design: 'System Design', case_study: 'Tình huống thực tế', certification_review: 'Ôn tập chứng chỉ' };
const STATUS: Record<string, string> = { draft: 'Bản nháp', published: 'Đã xuất bản', archived: 'Đã lưu trữ' };

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
  React.useEffect(() => {
    const requestedType = searchParams.get('type') ?? '';
    if (requestedType !== type) { setType(requestedType); setPage(1); }
  }, [searchParams]);

  const changeStatus = async (id: string, next: string) => { try { await apiClient.patch(`/lessons/${id}`, { status: next }); await load(); } catch (e) { setError(e instanceof ApiClientError ? e.message : 'Không thể cập nhật bài học'); } };
  const remove = async (item: Lesson) => { if (!window.confirm(`Bạn có muốn xóa bài học “${item.title}” hay không?`)) return; try { await apiClient.delete(`/lessons/${item.id}`); await load(); } catch (e) { setError(e instanceof ApiClientError ? e.message : 'Không thể xóa bài học'); } };

  return <div>
    <div className="flex items-start justify-between gap-4"><PageHeader icon={category?.icon} iconClassName={category?.iconClassName} title={pageTitle} description={category?.description ?? 'Quản lý các loại nội dung học tập'} /><Link href={`/admin/lessons/editor${type ? `?type=${type}` : ''}`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold !text-white"><span className="material-symbols-outlined text-[19px]">add</span>Thêm {itemName}</Link></div>
    <div className="mt-6 grid gap-3 md:grid-cols-[minmax(280px,1fr)_220px_190px]">
      <SearchInput value={searchInput} onChange={setSearchInput} onSearch={value => { setSearch(value); setPage(1); }} placeholder="Tìm theo tiêu đề, tóm tắt..." />
      <select value={type} onChange={e => { setType(e.target.value); setPage(1); }} className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 text-sm"><option value="">Tất cả loại bài học</option>{Object.entries(TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="rounded-xl border border-outline-variant bg-surface-container-lowest px-3 text-sm"><option value="">Tất cả trạng thái</option>{Object.entries(STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
    </div>
    {error && <div className="mt-4 rounded-xl bg-error-container p-3 text-sm text-on-error-container">{error}</div>}
    {category ? <div className="mt-5 space-y-4">
      {loading ? <p role="status" className="py-12 text-center">Đang tải nội dung...</p> : error ? null : !items.length ? <p className="py-12 text-center text-on-surface-variant">Chưa có {itemName} phù hợp.</p> : items.map(item => <article key={item.id} className="rounded-2xl border border-outline-variant/50 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-on-surface-variant"><span>{item.level.name}</span><span>{item.estimatedMinutes} phút</span><span>{item._count?.sections ?? 0} khối nội dung</span><StatusBadge status={item.status} /></div>
        <ContentPreview item={item} />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/40 pt-4"><span className="text-sm text-on-surface-variant">{item.domain.name}</span><div className="flex flex-wrap gap-2"><Link href={`/admin/lessons/editor?id=${item.id}`} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold !text-white">Biên soạn {category.item}</Link><button onClick={() => void changeStatus(item.id, item.status === 'published' ? 'archived' : 'published')} className="rounded-lg border border-outline-variant px-3 py-2 text-sm text-on-surface">{item.status === 'published' ? 'Lưu trữ' : 'Xuất bản'}</button><button onClick={() => void remove(item)} className="rounded-lg px-3 py-2 text-sm text-error">Xóa</button></div></div>
      </article>)}
    </div> : (
    <div className="mt-4 overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest"><div className="overflow-x-auto"><table className="w-full table-fixed text-left text-sm"><colgroup><col className="w-[30%]" /><col className="w-[11%]" /><col className="w-[13%]" /><col className="w-[10%]" /><col className="w-[8%]" /><col className="w-[12%]" /><col className="w-[16%]" /></colgroup><thead className="bg-surface-container-low"><tr>{[type ? `Tên ${itemName}` : 'Bài học','Loại nội dung','Lĩnh vực','Trình độ','Thời lượng','Trạng thái','Thao tác'].map(x => <th key={x} className="px-4 py-3 font-semibold">{x}</th>)}</tr></thead><tbody className="divide-y divide-outline-variant/30">
      {loading ? <tr><td colSpan={7} className="px-4 py-12 text-center text-on-surface-variant">Đang tải bài học...</td></tr> : items.length === 0 ? <tr><td colSpan={7} className="px-4 py-14 text-center text-on-surface-variant">Chưa có bài học phù hợp bộ lọc.</td></tr> : items.map(item => <tr key={item.id} className="hover:bg-surface-container-low/60"><td className="min-w-0 px-4 py-3"><p className="truncate font-semibold" title={item.title}>{item.title}</p><p className="mt-1 truncate text-xs text-on-surface-variant" title={item.summary}>{item.summary}</p></td><td className="px-4 py-3">{TYPES[item.type] ?? item.type}</td><td className="px-4 py-3">{item.domain.name}</td><td className="px-4 py-3">{item.level.name}</td><td className="whitespace-nowrap px-4 py-3">{item.estimatedMinutes} phút</td><td className="whitespace-nowrap px-4 py-3"><StatusBadge status={item.status} /></td><td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><Link title="Chỉnh sửa" href={`/admin/lessons/editor?id=${item.id}`} className="rounded-lg p-2 text-primary hover:bg-primary/10"><span className="material-symbols-outlined text-[18px]">edit</span></Link><button title={item.status === 'published' ? 'Lưu trữ' : 'Xuất bản'} onClick={() => void changeStatus(item.id, item.status === 'published' ? 'archived' : 'published')} className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50"><span className="material-symbols-outlined text-[18px]">{item.status === 'published' ? 'archive' : 'publish'}</span></button><button title="Xóa" onClick={() => void remove(item)} className="rounded-lg p-2 text-error hover:bg-error-container"><span className="material-symbols-outlined text-[18px]">delete</span></button></div></td></tr>)}</tbody></table></div></div>
    )}
    <div className="mt-5"><Pagination page={page} limit={10} total={total} totalPages={totalPages} onPageChange={setPage} /></div>
  </div>;
}
