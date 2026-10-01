'use client';

import * as React from 'react';
import { PageHeader } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';

type CareerGoal = { id: string; code: string; name: string; description?: string; isActive: boolean; _count?: { profileGoals?: number; learnerGroups?: number } };

export default function CareerGoalsPage() {
  const [items, setItems] = React.useState<CareerGoal[]>([]);
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
  React.useEffect(() => { void load(); }, [load]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { code: form.code.trim().toUpperCase(), name: form.name.trim(), description: form.description.trim(), isActive: true };
      if (form.id) await apiClient.patch(`/career-goals/${form.id}`, payload); else await apiClient.post('/career-goals', payload);
      setForm({ id: '', code: '', name: '', description: '' }); await load();
    } catch (cause) { setError(cause instanceof ApiClientError ? cause.message : 'Không thể lưu mục tiêu nghề nghiệp'); }
    finally { setSaving(false); }
  };

  return <main className="flex-1 p-margin">
    <PageHeader title="Mục tiêu nghề nghiệp" description="Quản lý các định hướng Cloud, Security, Data, DevOps và những hướng nghề nghiệp dùng để phân nhóm học viên." icon="flag" iconClassName="from-amber-500 to-orange-600" />
    {error && <div className="mt-5 rounded-xl bg-error-container p-3 text-sm text-on-error-container">{error}</div>}
    <form onSubmit={save} className="mt-6 grid gap-3 rounded-2xl border border-outline-variant bg-white p-5 md:grid-cols-[180px_1fr_1.5fr_auto]">
      <input required value={form.code} onChange={e => setForm(current => ({ ...current, code: e.target.value }))} placeholder="Mã mục tiêu" className="h-11 rounded-xl border border-outline-variant px-3 uppercase" />
      <input required value={form.name} onChange={e => setForm(current => ({ ...current, name: e.target.value }))} placeholder="Tên mục tiêu nghề nghiệp" className="h-11 rounded-xl border border-outline-variant px-3" />
      <input value={form.description} onChange={e => setForm(current => ({ ...current, description: e.target.value }))} placeholder="Mô tả" className="h-11 rounded-xl border border-outline-variant px-3" />
      <button disabled={saving} className="h-11 rounded-xl bg-primary px-5 font-bold text-white disabled:opacity-60">{saving ? 'Đang lưu...' : form.id ? 'Cập nhật' : 'Thêm mục tiêu'}</button>
    </form>
    <div className="mt-5 overflow-hidden rounded-2xl border border-outline-variant bg-white">
      <table className="w-full text-left text-sm"><thead className="bg-surface-container-low"><tr><th className="p-4">Mã</th><th className="p-4">Mục tiêu nghề nghiệp</th><th className="p-4">Học viên</th><th className="p-4">Nhóm</th><th className="p-4 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-outline-variant/40">
        {loading ? <tr><td colSpan={5} className="p-10 text-center">Đang tải...</td></tr> : items.length ? items.map(item => <tr key={item.id}><td className="p-4 font-mono text-xs font-bold text-primary">{item.code}</td><td className="p-4"><strong>{item.name}</strong><p className="mt-1 text-xs text-on-surface-variant">{item.description || 'Chưa có mô tả'}</p></td><td className="p-4">{item._count?.profileGoals ?? 0}</td><td className="p-4">{item._count?.learnerGroups ?? 0}</td><td className="p-4 text-right"><button type="button" onClick={() => setForm({ id: item.id, code: item.code, name: item.name, description: item.description ?? '' })} className="rounded-lg p-2 text-primary hover:bg-primary/10"><span className="material-symbols-outlined">edit</span></button></td></tr>) : <tr><td colSpan={5} className="p-10 text-center text-on-surface-variant">Chưa có mục tiêu nghề nghiệp.</td></tr>}
      </tbody></table>
    </div>
  </main>;
}
