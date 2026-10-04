'use client';
import { AppIcon } from '@/shared/ui/AppIcon';
import { useRouter } from 'next/navigation';
import { completeCreation, CreatePage } from '@/shared/ui/CreatePage';
import { ActionButton, ActionGroup } from '@/shared/ui/ActionButton';

import * as React from 'react';
import { ListTools, matchesSearch } from '@/shared/ui/ListTools';
import { PageHeader } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';

type CareerGoal = { id: string; code: string; name: string; description?: string; isActive: boolean; _count?: { profileGoals?: number; learnerGroups?: number } };

export default function CareerGoals({ createOnly = false }: { createOnly?: boolean }) {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('');
  const [items, setItems] = React.useState<CareerGoal[]>([]);
  const visible = items.filter(item => matchesSearch(search, item.name, item.code, item.description) && (!filter || (filter === 'assigned' ? (item._count?.profileGoals ?? 0) > 0 : (item._count?.profileGoals ?? 0) === 0)));
  const [form, setForm] = React.useState({ id: '', code: '', name: '', description: '' });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true); setError('');
    try { const result: any = await apiClient.get('/career-goals'); setItems(result?.data ?? result ?? []); }
    catch (cause) { setError(cause instanceof ApiClientError ? cause.message : 'Không thể tải mục tiêu nghề nghiệp'); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { if (!createOnly) void load(); }, [load, createOnly]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { code: form.code.trim().toUpperCase(), name: form.name.trim(), description: form.description.trim(), isActive: true };
      if (form.id) await apiClient.patch(`/career-goals/${form.id}`, payload); else await apiClient.post('/career-goals', payload);
      if (createOnly) { completeCreation(router, '/admin/career-goals', 'Đã thêm mục tiêu nghề nghiệp.'); return; }
      setForm({ id: '', code: '', name: '', description: '' }); await load();
    } catch (cause) { setError(cause instanceof ApiClientError ? cause.message : 'Không thể lưu mục tiêu nghề nghiệp'); }
    finally { setSaving(false); }
  };

  const goalForm = (<form onSubmit={save} className="space-y-5 p-6">
      <h1 className="text-xl font-bold">{form.id ? 'Chỉnh sửa mục tiêu nghề nghiệp' : 'Thêm mục tiêu nghề nghiệp'}</h1>
      <label className="block text-sm font-medium">Mã mục tiêu *<input required value={form.code} onChange={e => setForm(current => ({ ...current, code: e.target.value }))} placeholder="CLOUD" className="mt-2 h-11 w-full rounded-xl border border-outline-variant px-3 uppercase" /></label>
      <label className="block text-sm font-medium">Tên mục tiêu nghề nghiệp *<input required value={form.name} onChange={e => setForm(current => ({ ...current, name: e.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-outline-variant px-3" /></label>
      <label className="block text-sm font-medium">Mô tả<textarea value={form.description} onChange={e => setForm(current => ({ ...current, description: e.target.value }))} className="mt-2 min-h-24 w-full rounded-xl border border-outline-variant p-3" /></label>
      {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-sm text-on-error-container">{error}</p>}
      <div className="flex justify-end gap-3 border-t border-outline-variant/40 pt-4"><button type="button" disabled={saving} onClick={() => createOnly ? router.push('/admin/career-goals') : setForm({ id: '', code: '', name: '', description: '' })} className="h-10 rounded-xl border border-outline-variant px-4 text-sm font-medium">Hủy</button><button disabled={saving} className="h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Đang lưu...' : form.id ? 'Lưu thay đổi' : 'Thêm mục tiêu'}</button></div>
    </form>);
  if (createOnly) return <CreatePage backHref="/admin/career-goals">{goalForm}</CreatePage>;

  return <main className="flex-1 p-margin">
    <PageHeader title="Mục tiêu nghề nghiệp" description="Quản lý các định hướng Cloud, Security, Data, DevOps và những hướng nghề nghiệp dùng để phân nhóm học viên." icon="flag" iconClassName="from-amber-500 to-orange-600" action={<button type="button" onClick={() => router.push('/admin/career-goals/new')} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white"><AppIcon aria-hidden="true" className="" style={{ fontSize: 18 }}>add</AppIcon>Thêm mục tiêu</button>} />
    <ListTools search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={[{value:'',label:'Tất cả mục tiêu'},{value:'assigned',label:'Đã có học viên'},{value:'empty',label:'Chưa có học viên'}]} />
    {error && <div className="mt-5 rounded-xl bg-error-container p-3 text-sm text-on-error-container">{error}</div>}
    {form.id && <section className="mt-6 rounded-2xl border border-outline-variant bg-white">{goalForm}</section>}
    <div className="mt-5 overflow-hidden rounded-2xl border border-outline-variant bg-white">
      <table className="w-full text-left text-sm"><thead className="bg-white"><tr><th className="p-4">Mã</th><th className="p-4">Mục tiêu nghề nghiệp</th><th className="p-4">Học viên</th><th className="p-4">Nhóm</th><th className="p-4 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-outline-variant/40">
        {loading ? <tr><td colSpan={5} className="p-10 text-center">Đang tải...</td></tr> : visible.length ? visible.map(item => <tr key={item.id}><td className="p-4 font-mono text-xs font-bold text-primary">{item.code}</td><td className="p-4"><strong>{item.name}</strong><p className="mt-1 text-xs text-on-surface-variant">{item.description || 'Chưa có mô tả'}</p></td><td className="p-4">{item._count?.profileGoals ?? 0}</td><td className="p-4">{item._count?.learnerGroups ?? 0}</td><td className="p-4 text-right"><ActionGroup><ActionButton action="edit" type="button" onClick={() => setForm({ id: item.id, code: item.code, name: item.name, description: item.description ?? '' })} /></ActionGroup></td></tr>) : <tr><td colSpan={5} className="p-10 text-center text-on-surface-variant">Không có mục tiêu phù hợp.</td></tr>}
      </tbody></table>
    </div>
  </main>;
}
