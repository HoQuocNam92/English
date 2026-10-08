'use client';
import { PaginatedList } from '@/shared/ui/PaginatedList';
import { AppIcon } from '@/shared/ui/AppIcon';
import { useRouter } from 'next/navigation';
import { completeCreation, CreatePage, FormSurface } from '@/shared/ui/CreatePage';
import { ActionButton, ActionGroup } from '@/shared/ui/ActionButton';
import { Dropdown } from '@/shared/ui/Dropdown';

import * as React from 'react';
import Link from 'next/link';
import { BulkSelectionBar, confirmDialog, PageHeader, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';

interface CertificateItem {
  id: string;
  code: string;
  name: string;
  provider: string;
  description: string;
  category?: string | null;
  examDurationMinutes?: number | null;
  examQuestionCount?: number | null;
  passingScaledScore?: number | null;
  examUrl: string | null;
  isActive: boolean;
  domains?: Array<{ domain: { code: string; name: string }; certificationTopics?: Array<{ _count?: { questions?: number } }> }>;
  _count?: {
    exams: number;
  };
}

export default function AdminCertifications({ createOnly = false }: { createOnly?: boolean }) {
  const router = useRouter();
  const [certs, setCerts] = React.useState<CertificateItem[]>([]);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [domainFilter, setDomainFilter] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [providerFilter, setProviderFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<{ data: CertificateItem[] }>('/certificates');
        const data = res.data ?? [];
        setCerts(data);
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : 'Không thể tải danh sách chứng chỉ');
      } finally {
        setLoading(false);
      }
    }
    if (!createOnly) void load();
  }, [createOnly]);

  const domains = React.useMemo(() => [...new Map(certs.flatMap(cert => cert.domains ?? []).map(item => [item.domain.code, item.domain])).values()].sort((a, b) => a.name.localeCompare(b.name, 'vi')), [certs]);
  const categories = React.useMemo(() => [...new Set(certs.map(cert => cert.category?.trim()).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'vi')), [certs]);
  const providers = React.useMemo(() => [...new Set(certs.map(cert => cert.provider?.trim()).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'vi')), [certs]);
  const filteredCerts = React.useMemo(() => {
    const q = search.trim().toLocaleLowerCase('vi');
    return certs.filter(cert => {
      const matchesQuery = !q || [cert.name, cert.code, cert.provider, cert.description, cert.category, ...(cert.domains ?? []).map(item => item.domain.name)]
        .some(value => String(value ?? '').toLocaleLowerCase('vi').includes(q));
      const matchesDomain = !domainFilter || cert.domains?.some(item => item.domain.code === domainFilter);
      const matchesCategory = !categoryFilter || cert.category?.trim() === categoryFilter;
      const matchesProvider = !providerFilter || cert.provider === providerFilter;
      const matchesStatus = !statusFilter || cert.isActive === (statusFilter === 'active');
      return matchesQuery && matchesDomain && matchesCategory && matchesProvider && matchesStatus;
    });
  }, [certs, search, domainFilter, categoryFilter, providerFilter, statusFilter]);
  const hasFilters = Boolean(search || domainFilter || categoryFilter || providerFilter || statusFilter);
  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setDomainFilter('');
    setCategoryFilter('');
    setProviderFilter('');
    setStatusFilter('');
    setSelectedIds([]);
  };

  // ── Modal state ──────────────────────────────────────────────
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<CertificateItem | null>(null);

  const openCreate = () => router.push('/admin/certifications/new');

  const openEdit = (cert: CertificateItem) => {
    setEditTarget(cert);
    setModalOpen(true);
  };

  const remove = async (cert: CertificateItem) => {
    if (!(await confirmDialog(`Xóa chứng chỉ “${cert.name}”? Chỉ chứng chỉ chưa có nội dung liên kết mới có thể xóa.`, { title: 'Xóa chứng chỉ?', confirmLabel: 'Xóa chứng chỉ', tone: 'danger' }))) return;
    setError(null);
    try {
      await apiClient.delete(`/certificates/${cert.id}`);
      setCerts(current => current.filter(item => item.id !== cert.id));
    } catch (cause) { setError(cause instanceof ApiClientError ? cause.message : 'Không thể xóa chứng chỉ'); }
  };

  const handleSaved = (saved: CertificateItem) => {
    setCerts((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      const next = idx >= 0 ? prev.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...prev];
      return next;
    });
    setModalOpen(false);
  };

  const bulkChangePublication = async (isActive: boolean, allFiltered = false) => {
    const ids = allFiltered ? filteredCerts.map(cert => cert.id) : selectedIds;
    if (!ids.length) return;
    const action = isActive ? 'xuất bản' : 'chuyển về bản nháp';
    if (!(await confirmDialog(`Bạn có chắc muốn ${action} ${ids.length} chứng chỉ đã chọn?`, { title: `Xác nhận ${action}`, confirmLabel: action, tone: 'primary' }))) return;

    setBulkBusy(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const saved = await Promise.all(ids.map(id => apiClient.patch<CertificateItem>(`/certificates/${id}`, { isActive })));
      const updated = new Map(saved.map(cert => [cert.id, cert]));
      setCerts(current => current.map(cert => updated.get(cert.id) ?? cert));
      setSelectedIds([]);
      setSuccessMessage(`Đã ${action} ${saved.length} chứng chỉ.`);
    } catch (cause) {
      setError(cause instanceof ApiClientError ? cause.message : 'Không thể cập nhật trạng thái chứng chỉ');
    } finally {
      setBulkBusy(false);
    }
  };

  if (createOnly) return <CreatePage backHref="/admin/certifications"><CertificateModal page open initial={null} onClose={() => router.push('/admin/certifications')} onSaved={() => completeCreation(router, '/admin/certifications', 'Đã thêm chứng chỉ.')} /></CreatePage>;

  return (
    <main className="flex-1 p-margin flex flex-col gap-xl">
      <PageHeader
        title="Quản lý Chứng chỉ"
        description="Quản lý và tổ chức nội dung học tập theo chứng chỉ IT."
        icon="card_membership"
        action={<button type="button" onClick={openCreate} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold !text-white"><AppIcon className=" text-[19px]">add</AppIcon>Thêm chứng chỉ mới</button>}
      />
      {error && <div className="flex items-center gap-2 rounded-xl bg-error-container p-3 text-sm text-on-error-container"><AppIcon className=" text-[18px]">error</AppIcon><span>{error}</span></div>}

      <div className="grid gap-3 rounded-xl border border-outline-variant bg-white p-4 sm:grid-cols-2 xl:grid-cols-5">
        <SearchInput className="sm:!w-full sm:col-span-2 xl:col-span-2" value={searchInput} onChange={setSearchInput} onSearch={value => { setSearch(value); setSelectedIds([]); }} placeholder="Tìm theo tên, mã, đơn vị cấp…" />
        <Dropdown aria-label="Lọc lĩnh vực" value={domainFilter} onChange={event => { setDomainFilter(event.target.value); setSelectedIds([]); }} className="h-11 w-full min-w-0 rounded-xl border border-outline-variant bg-white px-3 text-sm"><option value="">Tất cả lĩnh vực</option>{domains.map(domain => <option key={domain.code} value={domain.code}>{domain.name}</option>)}</Dropdown>
        <Dropdown aria-label="Lọc nhóm chứng chỉ" value={categoryFilter} onChange={event => { setCategoryFilter(event.target.value); setSelectedIds([]); }} className="h-11 w-full min-w-0 rounded-xl border border-outline-variant bg-white px-3 text-sm"><option value="">Tất cả nhóm chứng chỉ</option>{categories.map(category => <option key={category} value={category}>{category}</option>)}</Dropdown>
        <Dropdown aria-label="Lọc đơn vị cấp" value={providerFilter} onChange={event => { setProviderFilter(event.target.value); setSelectedIds([]); }} className="h-11 w-full min-w-0 rounded-xl border border-outline-variant bg-white px-3 text-sm"><option value="">Tất cả đơn vị cấp</option>{providers.map(provider => <option key={provider} value={provider}>{provider}</option>)}</Dropdown>
        <Dropdown aria-label="Lọc trạng thái" value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setSelectedIds([]); }} className="h-11 w-full min-w-0 rounded-xl border border-outline-variant bg-white px-3 text-sm"><option value="">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="draft">Bản nháp</option></Dropdown>
        {hasFilters && <button type="button" onClick={clearFilters} className="ui-button ui-button-outline h-11 sm:col-span-2 xl:col-span-5">Xóa lọc</button>}
      </div>

      {successMessage && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{successMessage}</div>}
      <BulkSelectionBar
        pageCount={filteredCerts.length}
        selectedCount={selectedIds.length}
        allPageSelected={filteredCerts.length > 0 && filteredCerts.every(cert => selectedIds.includes(cert.id))}
        onSelectPage={checked => setSelectedIds(checked ? filteredCerts.map(cert => cert.id) : [])}
        selectionLabel="Chọn tất cả kết quả lọc"
      >
        {selectedIds.length > 0 && <>
          <button type="button" disabled={bulkBusy} onClick={() => void bulkChangePublication(true)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Xuất bản đã chọn</button>
          <button type="button" disabled={bulkBusy} onClick={() => void bulkChangePublication(false)} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Chuyển về bản nháp đã chọn</button>
        </>}
        <button type="button" disabled={bulkBusy || filteredCerts.length === 0} onClick={() => void bulkChangePublication(true, true)} className="rounded-lg border border-emerald-600 px-3 py-2 text-xs font-bold text-emerald-700 disabled:opacity-50">Xuất bản tất cả kết quả lọc</button>
        <button type="button" disabled={bulkBusy || filteredCerts.length === 0} onClick={() => void bulkChangePublication(false, true)} className="rounded-lg border border-amber-500 px-3 py-2 text-xs font-bold text-amber-700 disabled:opacity-50">Chuyển tất cả kết quả lọc về bản nháp</button>
      </BulkSelectionBar>

      <PaginatedList enabled={!loading} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-lg">
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
            const topicList = c.domains?.flatMap(domain => domain.certificationTopics ?? []) ?? [];
            const questionCount = topicList.reduce((sum, topic) => sum + Number(topic._count?.questions ?? 0), 0);
            const readyParts = Number(questionCount > 0) + Number((c._count?.exams ?? 0) > 0);
            const contentProgress = Math.round(readyParts / 2 * 100);

            return (
              <div key={c.id} className="relative bg-surface-container-lowest rounded-xl border border-outline-variant p-lg hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col gap-md">
                <label className="absolute left-4 top-4 flex items-center" aria-label={`Chọn chứng chỉ ${c.name}`}>
                  <input type="checkbox" className="h-4 w-4 accent-primary" checked={selectedIds.includes(c.id)} onChange={event => setSelectedIds(current => event.target.checked ? [...new Set([...current, c.id])] : current.filter(id => id !== c.id))} />
                </label>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                  <div className="flex flex-col gap-xs pl-6">
                    <span className={`inline-block font-label-caps text-label-caps px-sm py-xs rounded-full w-fit ${badgeClass}`}>
                      {domainName}
                    </span>
                    <Link href={`/admin/certifications/${c.id}`} className="font-headline-h3 text-headline-h3 text-on-surface flex items-center gap-2 hover:text-primary">
                      {c.name}
                      {!c.isActive && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-normal">Bản nháp</span>
                      )}
                    </Link>
                    <span className="text-xs text-on-surface-variant">{c.code} • {c.provider}</span>
                  </div>
                  <ActionGroup>
                    <ActionButton action="edit" onClick={() => openEdit(c)} />
                    <ActionButton action="delete" onClick={() => void remove(c)} />
                  </ActionGroup>
                </div>

                <div className="grid grid-cols-3 gap-sm py-md border-y border-outline-variant/50">
                  <div className="flex flex-col">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Đề thi</span>
                    <span className="font-interface-sb text-interface-sb text-on-surface">{c._count?.exams || 0}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Câu hỏi</span>
                    <span className="font-interface-sb text-interface-sb text-on-surface">{questionCount}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Tổng nội dung</span>
                    <span className="font-interface-sb text-interface-sb text-on-surface">{questionCount + (c._count?.exams ?? 0)}</span>
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
      </PaginatedList>
      <CertificateModal open={modalOpen} initial={editTarget} onClose={() => setModalOpen(false)} onSaved={handleSaved} />
    </main>
  );
}

function CertificateModal({ open, initial, onClose, onSaved, page = false }: { page?: boolean; open: boolean; initial: CertificateItem | null; onClose: () => void; onSaved: (item: CertificateItem) => void }) {
  const blank = { code: '', name: '', provider: '', description: '', category: '', examDurationMinutes: '', examQuestionCount: '', passingScaledScore: '', examUrl: '', isActive: true };
  const [form, setForm] = React.useState(blank);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    setForm(initial ? { code: initial.code, name: initial.name, provider: initial.provider, description: initial.description, category: initial.category ?? '', examDurationMinutes: initial.examDurationMinutes?.toString() ?? '', examQuestionCount: initial.examQuestionCount?.toString() ?? '', passingScaledScore: initial.passingScaledScore?.toString() ?? '', examUrl: initial.examUrl ?? '', isActive: initial.isActive } : blank);
    setError('');
  }, [initial, open]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.code.trim() || !form.name.trim() || !form.provider.trim()) { setError('Vui lòng nhập đầy đủ mã, tên và đơn vị cấp.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form, code: form.code.trim().toUpperCase(), category: form.category || null, examDurationMinutes: form.examDurationMinutes ? Number(form.examDurationMinutes) : null, examQuestionCount: form.examQuestionCount ? Number(form.examQuestionCount) : null, passingScaledScore: form.passingScaledScore ? Number(form.passingScaledScore) : null, examUrl: form.examUrl || null };
      const response: any = initial ? await apiClient.patch(`/certificates/${initial.id}`, payload) : await apiClient.post('/certificates', payload);
      onSaved(response?.data ?? response);
    } catch (e) { setError(e instanceof ApiClientError ? e.message : 'Không thể lưu chứng chỉ.'); }
    finally { setSaving(false); }
  };
  const cls = 'mt-2 h-11 w-full rounded-xl border border-outline-variant/70 bg-white px-3.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10';
  return <FormSurface page={page} open={open} onClose={onClose} maxWidth="max-w-2xl"><form onSubmit={save}>
    <div className="flex items-start justify-between border-b border-outline-variant/50 px-6 py-5"><div><h2 className="text-xl font-bold">{initial ? 'Chỉnh sửa chứng chỉ' : 'Thêm chứng chỉ mới'}</h2><p className="mt-1 text-xs text-on-surface-variant">Thông tin chứng chỉ công nghệ và đơn vị cấp.</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-surface-container-low"><AppIcon className="">close</AppIcon></button></div>
    <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
      <label className="text-sm font-semibold">Mã chứng chỉ *<input className={`${cls} uppercase`} value={form.code} onChange={e => setForm({...form, code:e.target.value})} placeholder="AWS-CLF-C02" /></label>
      <label className="text-sm font-semibold">Đơn vị cấp *<input className={cls} value={form.provider} onChange={e => setForm({...form, provider:e.target.value})} placeholder="Amazon Web Services" /></label>
      <label className="text-sm font-semibold sm:col-span-2">Tên chứng chỉ *<input className={cls} value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="AWS Certified Cloud Practitioner" /></label>
      <label className="text-sm font-semibold sm:col-span-2">Nhóm chứng chỉ<input className={cls} value={form.category} onChange={e => setForm({...form, category:e.target.value})} placeholder="Cloud / Security / Network" /></label>
      <label className="text-sm font-semibold">Thời gian thi (phút)<input type="number" min="1" className={cls} value={form.examDurationMinutes} onChange={e => setForm({...form, examDurationMinutes:e.target.value})} placeholder="90" /></label>
      <label className="text-sm font-semibold">Số câu trong đề thật<input type="number" min="1" className={cls} value={form.examQuestionCount} onChange={e => setForm({...form, examQuestionCount:e.target.value})} placeholder="65" /></label>
      <label className="text-sm font-semibold sm:col-span-2">Điểm chuẩn quy đổi<input type="number" min="0" className={cls} value={form.passingScaledScore} onChange={e => setForm({...form, passingScaledScore:e.target.value})} placeholder="700" /></label>
      <label className="text-sm font-semibold sm:col-span-2">Liên kết kỳ thi<input className={cls} value={form.examUrl} onChange={e => setForm({...form, examUrl:e.target.value})} placeholder="https://..." /></label>
      <label className="text-sm font-semibold sm:col-span-2">Mô tả<textarea className="mt-2 min-h-24 w-full rounded-xl border border-outline-variant/70 bg-white p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" value={form.description} onChange={e => setForm({...form, description:e.target.value})} /></label>
      <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2"><input type="checkbox" className="accent-primary" checked={form.isActive} onChange={e => setForm({...form, isActive:e.target.checked})} />Hiển thị trong hệ thống</label>
      {error && <div className="rounded-xl bg-error-container p-3 text-sm text-on-error-container sm:col-span-2">{error}</div>}
    </div>
    <div className="flex justify-end gap-3 border-t border-outline-variant/50 bg-surface-container-low/50 px-6 py-4"><button type="button" onClick={onClose} className="h-10 rounded-xl border border-outline-variant px-4 text-sm font-semibold">Huỷ</button><button disabled={saving} className="h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu...' : initial ? 'Lưu thay đổi' : 'Thêm chứng chỉ'}</button></div>
  </form></FormSurface>;
}
