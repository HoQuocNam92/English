'use client';
import { useEffect, useState } from 'react';
import { Dropdown } from './Dropdown';
export type ListFilterField = { key: string; label: string; type?: 'number' | 'date' | 'text'; max?: number; options?: { value: string; label: string }[] };
export function DataListFilters({ fields, value, onChange }: { fields: ListFilterField[]; value: Record<string, string>; onChange: (value: Record<string, string>) => void }) {
 const [draft, setDraft] = useState(value), [error, setError] = useState('');
 useEffect(() => { setDraft(value); }, [value]);
 const active = Object.values(value).filter(Boolean).length;
 const apply = () => {
  for (const field of fields) { const input = draft[field.key]; if (input && field.type === 'number' && (!Number.isFinite(Number(input)) || Number(input) < 0 || (field.max !== undefined && Number(input) > field.max))) { setError(`${field.label} không hợp lệ`); return; } }
  for (const field of fields.filter(item => item.key.endsWith('Min'))) { const low = draft[field.key], high = draft[field.key.replace(/Min$/, 'Max')]; if (low && high && Number(low) > Number(high)) { setError('Giá trị từ phải nhỏ hơn hoặc bằng giá trị đến.'); return; } }
  if (draft.dateFrom && draft.dateTo && draft.dateFrom > draft.dateTo) { setError('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.'); return; }
  setError(''); onChange(draft);
 };
 return <details className="my-4 rounded-xl border border-outline-variant bg-white p-4"><summary className="cursor-pointer text-sm font-semibold text-primary">Bộ lọc bổ sung{active ? ` (${active})` : ''}</summary><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{fields.map(field => <label key={field.key} className="grid gap-1 text-xs font-semibold text-on-surface-variant">{field.label}{field.options ? <Dropdown value={draft[field.key] ?? ''} onChange={event => setDraft(current => ({ ...current, [field.key]: event.target.value }))} className="h-10 min-w-0 rounded-xl border border-outline-variant px-3 text-sm text-on-surface"><option value="">Tất cả</option>{field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</Dropdown> : <input type={field.type ?? 'text'} min={field.type === 'number' ? 0 : undefined} max={field.max} step={field.type === 'number' ? 'any' : undefined} value={draft[field.key] ?? ''} onChange={event => setDraft(current => ({ ...current, [field.key]: event.target.value }))} className="h-10 min-w-0 rounded-xl border border-outline-variant px-3 text-sm font-normal text-on-surface" />}</label>)}</div>{error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}<div className="mt-4 flex gap-2"><button type="button" onClick={apply} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">Áp dụng lọc</button><button type="button" onClick={() => { setDraft({}); setError(''); onChange({}); }} className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-semibold">Xóa lọc bổ sung</button></div></details>;
}
export function matchListFilters(row: Record<string, any>, filters: Record<string, string>) {
 return Object.entries(filters).every(([key, value]) => {
  if (!value) return true;
  if (key === 'dateFrom' || key === 'dateTo') { const date = new Date(row.date); if (!Number.isFinite(date.getTime())) return false; const day = new Date(date.getTime() + 7 * 3600000).toISOString().slice(0,10); return key === 'dateFrom' ? day >= value : day <= value; }
  if (key.endsWith('Min')) return Number(row[key.slice(0, -3)] ?? 0) >= Number(value);
  if (key.endsWith('Max')) return Number(row[key.slice(0, -3)] ?? 0) <= Number(value);
  return Array.isArray(row[key]) ? row[key].map(String).includes(value) : String(row[key] ?? '') === value;
 });
}
