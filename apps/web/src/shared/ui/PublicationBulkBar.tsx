'use client';
import * as React from 'react';
import { apiClient } from '@/shared/api/api-client';
import { confirmDialog } from './AppFeedback';
import { collectPublicationSelection, eligiblePublicationIds, MAX_PUBLICATION_SELECTION } from '../lib/publication-selection';
import type { PublicationItem } from '../lib/publication-selection';

type Result = { updatedCount: number; skippedCount: number; requestedCount: number };
export function PublicationBulkBar({ items, allItems, total, query, endpoint, selectedIds, onSelectionChange, loading, itemLabel = 'mục', activity = false, booleanStatus = false, onUpdated, onBusyChange }: {
  items: PublicationItem[]; allItems?: PublicationItem[]; total: number; query: string; endpoint: string;
  selectedIds: ReadonlySet<string> | string[]; onSelectionChange: (ids: Set<string>) => void;
  loading: boolean; itemLabel?: string; activity?: boolean; booleanStatus?: boolean;
  onUpdated: (message: string) => void | Promise<void>;
  onBusyChange?: (busy: boolean) => void;
}) {
  const ids = new Set(selectedIds);
  const cache = React.useRef(new Map<string, PublicationItem>());
  const lastItems = React.useRef<PublicationItem[] | undefined>(undefined);
  const scope = React.useRef(query);
  const epoch = React.useRef(0);
  const operation = React.useRef(false);
  const mounted = React.useRef(true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const updated = React.useRef(onUpdated); updated.current = onUpdated;
  const working = (value: boolean) => { setBusy(value); onBusyChange?.(value); };
  if (scope.current !== query) { scope.current = query; epoch.current++; cache.current = new Map(); lastItems.current = undefined; }
  if (lastItems.current !== (allItems ?? items)) {
    for (const item of allItems ?? items) cache.current.set(item.id, item);
    lastItems.current = allItems ?? items;
  }
  React.useEffect(() => { onSelectionChange(new Set()); setError(''); setMessage(''); }, [query]);
  React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const allPage = items.length > 0 && items.every(item => ids.has(item.id));
  const allMatching = total > 0 && ids.size === total;
  const disabled = busy || loading;
  const selectAll = async () => {
    if (operation.current || loading) return;
    operation.current = true; working(true); setError('');
    const key = query;
    const version = epoch.current;
    try {
      const all = allItems ?? await collectPublicationSelection(page => {
        const [path, search = ''] = query.split('?');
        const params = new URLSearchParams(search); params.set('page', String(page)); params.set('limit', '100');
        return apiClient.get<{ data: PublicationItem[]; meta: { total: number } }>(`${path}?${params}`);
      }, total, () => !mounted.current || scope.current !== key || epoch.current !== version);
      if (!mounted.current || scope.current !== key || epoch.current !== version) return;
      if (all.length !== total || all.length > MAX_PUBLICATION_SELECTION) throw new Error('Danh sách đã thay đổi hoặc vượt quá 10.000 mục. Hãy thu hẹp bộ lọc.');
      cache.current = new Map(all.map(item => [item.id, item]));
      onSelectionChange(new Set(all.map(item => item.id)));
    } catch (e: any) { if (mounted.current && scope.current === key && epoch.current === version) setError(e.message); }
    finally { operation.current = false; if (mounted.current) working(false); }
  };
  const change = async (target: 'draft' | 'published') => {
    const eligible = eligiblePublicationIds(ids, cache.current, target);
    if (operation.current || loading || !eligible.length) return;
    if (eligible.length > MAX_PUBLICATION_SELECTION) { setError('Mỗi lần cập nhật tối đa 10.000 mục. Hãy thu hẹp lựa chọn.'); return; }
    operation.current = true; working(true); setError(''); setMessage('');
    const key = query;
    const version = epoch.current;
    const action = activity ? (target === 'published' ? 'kích hoạt' : 'ngừng hoạt động') : target === 'published' ? 'xuất bản' : 'chuyển về bản nháp';
    try {
      if (!await confirmDialog(`Bạn có chắc muốn ${action} ${eligible.length} ${itemLabel}?${ids.size > eligible.length ? ` ${ids.size - eligible.length} mục không cần chuyển trạng thái sẽ được giữ nguyên.` : ''}`, { title: 'Xác nhận cập nhật hàng loạt', confirmLabel: action, tone: target === 'published' ? 'primary' : 'warning' })) return;
      if (scope.current !== key || epoch.current !== version || !mounted.current) return;
      const result = await apiClient.patch<Result>(endpoint, activity || booleanStatus ? { ids: eligible, isActive: target === 'published' } : { ids: eligible, status: target });
      if (!mounted.current || scope.current !== key || epoch.current !== version) return;
      const text = `Đã ${action} ${result.updatedCount} ${itemLabel}.${ids.size > eligible.length ? ` Giữ nguyên ${ids.size - eligible.length} mục không cần đổi trạng thái.` : ''}${result.skippedCount ? ` Bỏ qua ${result.skippedCount} mục đã đổi trạng thái hoặc không còn tồn tại.` : ''}`;
      onSelectionChange(new Set()); setMessage(text);
      await updated.current(text);
    } catch (e: any) { if (mounted.current && scope.current === key && epoch.current === version) setError(e.message); }
    finally { operation.current = false; if (mounted.current) working(false); }
  };
  if (!items.length && !ids.size) return message || error ? <div className="mt-4 rounded-xl border border-outline-variant bg-white p-4">{error && <p role="alert" className="text-sm text-error">{error}</p>}{message && <p role="status" className="text-sm text-emerald-800">{message}</p>}</div> : null;
  return <div className="mt-4 space-y-3 rounded-xl border border-outline-variant bg-white p-4" aria-busy={busy}>
    <div className="flex flex-wrap items-center gap-3"><label className="mr-auto flex items-center gap-2 text-sm font-semibold"><input type="checkbox" disabled={disabled || !items.length} checked={allPage} onChange={e => { const next = new Set(ids); items.forEach(item => e.target.checked ? next.add(item.id) : next.delete(item.id)); onSelectionChange(next); }} className="h-4 w-4 accent-primary" />Chọn {items.length} {itemLabel} trên trang này</label>
      <button disabled={disabled || !eligiblePublicationIds(ids, cache.current, 'published').length} onClick={() => void change('published')} className="rounded-lg border border-emerald-600 px-3 py-2 text-xs font-bold text-emerald-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400">{activity ? 'Kích hoạt' : 'Xuất bản'}</button>
      <button disabled={disabled || !eligiblePublicationIds(ids, cache.current, 'draft').length} onClick={() => void change('draft')} className="rounded-lg border border-amber-500 px-3 py-2 text-xs font-bold text-amber-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400">{activity ? 'Ngừng hoạt động' : 'Chuyển về bản nháp'}</button>
    </div>
    {ids.size > 0 && <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm" role="status"><span>Đã chọn {ids.size} {itemLabel}{allMatching ? ' trong toàn bộ kết quả phù hợp bộ lọc.' : '.'}</span>{allPage && !allMatching && total > items.length && <button disabled={disabled} onClick={() => void selectAll()} className="font-bold text-primary disabled:opacity-50">Chọn tất cả {total} {itemLabel} phù hợp bộ lọc</button>}<button disabled={disabled} onClick={() => onSelectionChange(new Set())} className="font-semibold text-on-surface-variant">Bỏ chọn tất cả</button></div>}
    {busy && <p className="text-sm" role="status">Đang xử lý lựa chọn…</p>}
    {error && <p className="text-sm text-error" role="alert">{error}</p>}
    {message && <p className="text-sm text-emerald-800" role="status">{message}</p>}
  </div>;
}
