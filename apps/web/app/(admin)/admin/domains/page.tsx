'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import { PageHeader, Button, confirmDialog, showToast } from '@/shared/ui';
import { ListTools, matchesSearch } from '@/shared/ui/ListTools';
import { PaginatedList } from '@/shared/ui/PaginatedList';
import { ActionButton, ActionGroup } from '@/shared/ui/ActionButton';
import { Modal } from '@/shared/ui/Modal';

type Domain = { id: string; code: string; name: string; description: string; isActive: boolean };
const blank = { code: '', name: '', description: '', isActive: true };
export default function DomainsPage() {
  const [items, setItems] = React.useState<Domain[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('active');
  const [editing, setEditing] = React.useState<Domain | null | undefined>();
  const [form, setForm] = React.useState(blank);
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState('');
  const load = React.useCallback(async () => {
    setLoading(true); setError('');
    try { const response = await apiClient.get<{ data: Domain[] }>('/domains?activeOnly=false'); setItems(response.data); }
    catch (e) { setError(e instanceof ApiClientError ? e.message : 'Không thể tải danh sách chuyên ngành'); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);
  const open = (item: Domain | null) => { setEditing(item); setForm(item ? { code: item.code, name: item.name, description: item.description, isActive: item.isActive } : blank); setFormError(''); };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); if (saving) return;
    setSaving(true); setFormError('');
    try {
      if (editing?.isActive && !form.isActive && !await confirmDialog('Chuyên ngành này sẽ được ẩn khỏi các lựa chọn học tập mới. Nội dung và lịch sử đã có vẫn được giữ lại.', { title: 'Ngừng hoạt động chuyên ngành', confirmLabel: 'Ngừng hoạt động' })) return;
      const payload = { name: form.name.trim(), description: form.description.trim(), isActive: form.isActive };
      const saved = editing ? await apiClient.patch<Domain>(`/domains/${editing.id}`, payload) : await apiClient.post<Domain>('/domains', { ...payload, code: form.code.trim().toUpperCase() });
      setItems(current => editing ? current.map(item => item.id === saved.id ? saved : item) : [...current, saved]);
      setEditing(undefined); showToast('Đã lưu chuyên ngành.', 'success');
    } catch (e) { setFormError(e instanceof ApiClientError ? e.message : 'Không thể lưu chuyên ngành'); }
    finally { setSaving(false); }
  };
  const visible = items.filter(item => matchesSearch(search, item.name, item.code, item.description) && (!filter || item.isActive === (filter === 'active')));
  return <div className="admin-page-stack">
    <PageHeader title="Chuyên ngành CNTT" icon="account_tree" description={`${items.filter(item => item.isActive).length} chuyên ngành đang hoạt động. Danh mục này được dùng cho lựa chọn học tập và biểu đồ thống kê.`} action={<Button disabled={loading || !!error} onClick={() => open(null)}><Plus className="h-4 w-4" />Thêm chuyên ngành</Button>} />
    {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}<button className="ml-3 font-semibold underline" onClick={() => void load()}>Thử lại</button></div>}
    <ListTools search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={[{ value: '', label: 'Tất cả trạng thái' }, { value: 'active', label: 'Đang hoạt động' }, { value: 'inactive', label: 'Ngừng hoạt động' }]} />
    {loading ? <p role="status">Đang tải chuyên ngành...</p> : !visible.length ? <p className="rounded-xl border border-dashed p-6 text-sm">Không có chuyên ngành phù hợp.</p> : <PaginatedList className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map(item => <article key={item.id} className="rounded-xl border border-outline-variant bg-white p-5">
      <div className="flex flex-wrap justify-between gap-2"><h2 className="text-lg font-bold">{item.name}</h2><span className={`rounded-full px-2 py-1 text-xs ${item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{item.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span></div>
      <p className="mt-2 text-xs text-on-surface-variant">Mã: {item.code}</p><p className="my-4 text-sm">{item.description || 'Chưa có mô tả.'}</p><ActionGroup><ActionButton action="edit" label="Chỉnh sửa chuyên ngành" onClick={() => open(item)} /></ActionGroup>
    </article>)}</PaginatedList>}
    <Modal open={editing !== undefined} onClose={() => { if (!saving) setEditing(undefined); }}><form onSubmit={save} className="space-y-4 p-6">
      <h2 className="text-xl font-bold">{editing ? 'Chỉnh sửa chuyên ngành' : 'Thêm chuyên ngành'}</h2>
      <label className="block text-sm font-semibold">Mã chuyên ngành<input required disabled={!!editing || saving} pattern="[A-Za-z0-9_]+" minLength={2} maxLength={30} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="mt-2 block w-full rounded-xl border p-3" /></label>
      <p className="text-xs text-on-surface-variant">Mã là duy nhất, gồm chữ không dấu, số và dấu gạch dưới; không đổi sau khi tạo.</p>
      <label className="block text-sm font-semibold">Tên chuyên ngành<input required minLength={2} maxLength={100} disabled={saving} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-2 block w-full rounded-xl border p-3" /></label>
      <label className="block text-sm font-semibold">Mô tả<textarea maxLength={500} disabled={saving} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-2 block w-full rounded-xl border p-3" /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={saving} checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />Đang hoạt động</label>
      {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
      <div className="flex justify-end gap-3"><Button type="button" variant="outline" disabled={saving} onClick={() => setEditing(undefined)}>Hủy</Button><Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu chuyên ngành'}</Button></div>
    </form></Modal>
  </div>;
}
