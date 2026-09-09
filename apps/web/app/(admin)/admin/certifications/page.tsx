'use client';

import * as React from 'react';
import Link from 'next/link';
import { Modal, PageHeader, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';

interface CertificateItem {
  id: string;
  code: string;
  name: string;
  provider: string;
  description: string;
  examUrl: string | null;
  isActive: boolean;
  domains?: Array<{ domain: { code: string; name: string } }>;
  _count?: {
    exams: number;
    lessonCerts: number;
    questionCerts: number;
  };
}

export default function AdminCertificationsPage() {
  const [certs, setCerts] = React.useState<CertificateItem[]>([]);
  const [filteredCerts, setFilteredCerts] = React.useState<CertificateItem[]>([]);
  const [searchInput, setSearchInput] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<{ data: CertificateItem[] }>('/certificates');
        const data = res.data ?? [];
        setCerts(data);
        setFilteredCerts(data);
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : 'Không thể tải danh sách chứng chỉ');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const handleSearch = (sanitized: string) => {
    if (!sanitized) {
      setFilteredCerts(certs);
      return;
    }
    const q = sanitized.toLowerCase();
    setFilteredCerts(
      certs.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.provider.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      )
    );
  };

  // ── Modal state ──────────────────────────────────────────────
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<CertificateItem | null>(null);

  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (cert: CertificateItem) => {
    setEditTarget(cert);
    setModalOpen(true);
  };

  const remove = async (cert: CertificateItem) => {
    if (!window.confirm(`Xóa chứng chỉ “${cert.name}”? Chỉ chứng chỉ chưa có nội dung liên kết mới có thể xóa.`)) return;
    setError(null);
    try {
      await apiClient.delete(`/certificates/${cert.id}`);
      setCerts(current => current.filter(item => item.id !== cert.id));
      setFilteredCerts(current => current.filter(item => item.id !== cert.id));
    } catch (cause) { setError(cause instanceof ApiClientError ? cause.message : 'Không thể xóa chứng chỉ'); }
  };

  const handleSaved = (saved: CertificateItem) => {
    setCerts((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      const next = idx >= 0 ? prev.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...prev];
      // Re-apply current search filter
      const q = searchInput.trim().toLowerCase();
      if (q) {
        setFilteredCerts(
          next.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.code.toLowerCase().includes(q) ||
              c.provider.toLowerCase().includes(q) ||
              c.description.toLowerCase().includes(q)
          )
        );
      } else {
        setFilteredCerts(next);
      }
      return next;
    });
    setModalOpen(false);
  };

  return (
    <main className="flex-1 p-margin flex flex-col gap-xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h2 className="font-headline-h1 text-headline-h1 text-on-surface">Quản lý Chứng chỉ</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Quản lý và tổ chức nội dung học tập theo chứng chỉ IT.</p>
        </div>
        
        {error && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-sm mt-md md:mt-0">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { handleSearch(searchInput); } }}
              className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg py-sm pl-[36px] pr-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors min-w-[200px]"
              placeholder="Tìm chứng chỉ..."
            />
          </div>
          <button 
            onClick={openCreate}
            className="bg-primary text-on-primary font-interface-sb py-sm px-md rounded-lg hover:bg-primary-container transition-colors flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Thêm chứng chỉ mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-lg">
        {loading ? (
          <div className="col-span-full py-8 text-center text-on-surface-variant">Đang tải...</div>
        ) : filteredCerts.length === 0 ? (
          <div className="col-span-full py-8 text-center text-on-surface-variant">Không tìm thấy chứng chỉ nào.</div>
        ) : (
          filteredCerts.map((c, idx) => {
            const domainName = c.domains?.[0]?.domain?.name || 'General IT';
            const badgeClasses = [
              'bg-secondary-fixed text-on-secondary-fixed',
              'bg-error-container text-on-error-container',
              'bg-tertiary-fixed text-on-tertiary-fixed',
            ];
            const badgeClass = badgeClasses[idx % badgeClasses.length];
            
            const readyParts = Number((c._count?.lessonCerts ?? 0) > 0) + Number((c._count?.questionCerts ?? 0) > 0) + Number((c._count?.exams ?? 0) > 0);
            const contentProgress = Math.round(readyParts / 3 * 100);
            
            return (
              <div key={c.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col gap-md">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-xs">
                    <span className={`inline-block font-label-caps text-label-caps px-sm py-xs rounded-full w-fit ${badgeClass}`}>
                      {domainName}
                    </span>
                    <Link href={`/admin/certifications/${c.id}`} className="font-headline-h3 text-headline-h3 text-on-surface flex items-center gap-2 hover:text-primary">
                      {c.name}
                      {!c.isActive && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-normal">Ẩn</span>
                      )}
                    </Link>
                    <span className="text-xs text-on-surface-variant">{c.code} • {c.provider}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="text-outline hover:text-primary transition-colors p-1"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                    <button onClick={() => void remove(c)} className="text-outline hover:text-error transition-colors p-1"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-sm py-md border-y border-outline-variant/50">
                  <div className="flex flex-col">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Đề thi</span>
                    <span className="font-interface-sb text-interface-sb text-on-surface">{c._count?.exams || 0}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Bài học</span>
                    <span className="font-interface-sb text-interface-sb text-on-surface">{c._count?.lessonCerts || 0}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Câu hỏi</span>
                    <span className="font-interface-sb text-interface-sb text-on-surface">{c._count?.questionCerts || 0}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Tổng nội dung</span>
                    <span className="font-interface-sb text-interface-sb text-on-surface">{(c._count?.lessonCerts ?? 0) + (c._count?.questionCerts ?? 0) + (c._count?.exams ?? 0)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-xs mt-auto">
                  <div className="flex justify-between items-center">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Mức hoàn thiện nội dung</span>
                    <span className="font-interface-sb text-interface-sb text-primary">{contentProgress}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-[8px] rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${contentProgress}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <CertificateModal open={modalOpen} initial={editTarget} onClose={() => setModalOpen(false)} onSaved={handleSaved} />
    </main>
  );
}

function CertificateModal({ open, initial, onClose, onSaved }: { open: boolean; initial: CertificateItem | null; onClose: () => void; onSaved: (item: CertificateItem) => void }) {
  const blank = { code: '', name: '', provider: '', description: '', examUrl: '', isActive: true };
  const [form, setForm] = React.useState(blank);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    setForm(initial ? { code: initial.code, name: initial.name, provider: initial.provider, description: initial.description, examUrl: initial.examUrl ?? '', isActive: initial.isActive } : blank);
    setError('');
  }, [initial, open]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.code.trim() || !form.name.trim() || !form.provider.trim()) { setError('Vui lòng nhập đầy đủ mã, tên và đơn vị cấp.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form, code: form.code.trim().toUpperCase(), examUrl: form.examUrl || null };
      const response: any = initial ? await apiClient.patch(`/certificates/${initial.id}`, payload) : await apiClient.post('/certificates', payload);
      onSaved(response?.data ?? response);
    } catch (e) { setError(e instanceof ApiClientError ? e.message : 'Không thể lưu chứng chỉ.'); }
    finally { setSaving(false); }
  };
  const cls = 'mt-2 h-11 w-full rounded-xl border border-outline-variant/70 bg-white px-3.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10';
  return <Modal open={open} onClose={onClose} maxWidth="max-w-2xl"><form onSubmit={save}>
    <div className="flex items-start justify-between border-b border-outline-variant/50 px-6 py-5"><div><h2 className="text-xl font-bold">{initial ? 'Chỉnh sửa chứng chỉ' : 'Thêm chứng chỉ mới'}</h2><p className="mt-1 text-xs text-on-surface-variant">Thông tin chứng chỉ công nghệ và đơn vị cấp.</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-surface-container-low"><span className="material-symbols-outlined">close</span></button></div>
    <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
      <label className="text-sm font-semibold">Mã chứng chỉ *<input className={`${cls} uppercase`} value={form.code} onChange={e => setForm({...form, code:e.target.value})} placeholder="AWS-CLF-C02" /></label>
      <label className="text-sm font-semibold">Đơn vị cấp *<input className={cls} value={form.provider} onChange={e => setForm({...form, provider:e.target.value})} placeholder="Amazon Web Services" /></label>
      <label className="text-sm font-semibold sm:col-span-2">Tên chứng chỉ *<input className={cls} value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="AWS Certified Cloud Practitioner" /></label>
      <label className="text-sm font-semibold sm:col-span-2">Liên kết kỳ thi<input className={cls} value={form.examUrl} onChange={e => setForm({...form, examUrl:e.target.value})} placeholder="https://..." /></label>
      <label className="text-sm font-semibold sm:col-span-2">Mô tả<textarea className="mt-2 min-h-24 w-full rounded-xl border border-outline-variant/70 bg-white p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" value={form.description} onChange={e => setForm({...form, description:e.target.value})} /></label>
      <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2"><input type="checkbox" className="accent-primary" checked={form.isActive} onChange={e => setForm({...form, isActive:e.target.checked})} />Hiển thị trong hệ thống</label>
      {error && <div className="rounded-xl bg-error-container p-3 text-sm text-on-error-container sm:col-span-2">{error}</div>}
    </div>
    <div className="flex justify-end gap-3 border-t border-outline-variant/50 bg-surface-container-low/50 px-6 py-4"><button type="button" onClick={onClose} className="h-10 rounded-xl border border-outline-variant px-4 text-sm font-semibold">Huỷ</button><button disabled={saving} className="h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu...' : initial ? 'Lưu thay đổi' : 'Thêm chứng chỉ'}</button></div>
  </form></Modal>;
}
