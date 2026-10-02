'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { completeCreation, CreatePage } from '@/shared/ui/CreatePage';
import { Dropdown } from '@/shared/ui/Dropdown';
import { apiClient, ApiClientError } from '@/shared/api/api-client';

type Domain = { id: string; name: string };
type Certificate = { domains?: { domainId: string }[] };

export default function StructureForm({ certificateId, mode, initialDomainId }: {
  certificateId: string; mode: 'domain' | 'topic'; initialDomainId: string;
}) {
  const router = useRouter();
  const backHref = `/admin/certifications/${certificateId}`;
  const [form, setForm] = React.useState({ domainId: initialDomainId, code: '', name: '', description: '', weightPercent: '' });
  const [domains, setDomains] = React.useState<Domain[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [response, certificate] = await Promise.all([
          apiClient.get<Domain[] | { data: Domain[] }>('/domains'),
          apiClient.get<Certificate>(`/certificates/${certificateId}`),
        ]);
        if (cancelled) return;
        const options = Array.isArray(response) ? response : response.data;
        setDomains(options.filter(domain => mode === 'domain'
          ? !certificate.domains?.some(entry => entry.domainId === domain.id)
          : certificate.domains?.some(entry => entry.domainId === domain.id)));
      } catch (cause) {
        if (!cancelled) setError(cause instanceof ApiClientError ? cause.message : 'Không thể tải danh sách Domain');
      } finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, [certificateId, mode]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (saving || loading) return;
    if (!domains.some(domain => domain.id === form.domainId)) { setError('Vui lòng chọn Domain hợp lệ.'); return; }
    if (mode === 'topic' && (!form.code.trim() || !form.name.trim())) { setError('Vui lòng nhập mã và tên Topic.'); return; }
    setSaving(true); setError('');
    try {
      if (mode === 'domain') {
        await apiClient.post(`/certificates/${certificateId}/domains`, { domainId: form.domainId, weightPercent: Number(form.weightPercent || 0) });
      } else {
        await apiClient.post(`/certificates/${certificateId}/topics`, { domainId: form.domainId, code: form.code.trim(), name: form.name.trim(), description: form.description.trim() });
      }
      completeCreation(router, backHref, mode === 'domain' ? 'Đã thêm Domain.' : 'Đã thêm Topic.');
    } catch (cause) { setError(cause instanceof ApiClientError ? cause.message : 'Không thể lưu cấu trúc chứng chỉ'); }
    finally { setSaving(false); }
  }

  const inputClass = 'mt-2 h-11 w-full rounded-xl border border-outline-variant bg-white px-3';
  return <CreatePage backHref={backHref}><form onSubmit={save} className="space-y-5 p-6">
    <h1 className="text-xl font-bold">{mode === 'domain' ? 'Thêm Domain vào chứng chỉ' : 'Thêm Topic vào Domain'}</h1>
    {loading && <p role="status" className="text-sm text-on-surface-variant">Đang tải Domain...</p>}
    {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-sm text-on-error-container">{error}</p>}
    <label className="block text-sm font-medium">Domain *<Dropdown required disabled={loading || saving} value={form.domainId} onChange={event => setForm(current => ({ ...current, domainId: event.target.value }))} className={inputClass}>
      <option value="">Chọn Domain</option>{domains.map(domain => <option key={domain.id} value={domain.id}>{domain.name}</option>)}
    </Dropdown></label>
    {mode === 'domain' ? <label className="block text-sm font-medium">Trọng số trong đề thi (%)<input type="number" min="0" max="100" step="0.1" value={form.weightPercent} onChange={event => setForm(current => ({ ...current, weightPercent: event.target.value }))} className={inputClass} /></label> : <>
      <label className="block text-sm font-medium">Mã Topic *<input required value={form.code} onChange={event => setForm(current => ({ ...current, code: event.target.value }))} className={inputClass} placeholder="D1-T1" /></label>
      <label className="block text-sm font-medium">Tên Topic *<input required value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} className={inputClass} /></label>
      <label className="block text-sm font-medium">Mô tả<textarea value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} className="mt-2 min-h-24 w-full rounded-xl border border-outline-variant p-3" /></label>
    </>}
    {!loading && !domains.length && <p className="text-sm text-on-surface-variant">{mode === 'topic' ? 'Chứng chỉ chưa có Domain. Hãy thêm Domain trước.' : 'Không còn Domain để thêm vào chứng chỉ.'}</p>}
    <div className="flex justify-end gap-3 border-t border-outline-variant/40 pt-4">
      <button type="button" disabled={saving} onClick={() => router.push(backHref)} className="h-10 rounded-xl border border-outline-variant px-4 text-sm font-medium">Hủy</button>
      <button disabled={saving || loading || !domains.length} className="h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu'}</button>
    </div>
  </form></CreatePage>;
}
