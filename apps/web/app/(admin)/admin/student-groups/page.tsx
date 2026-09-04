'use client';

import * as React from 'react';
import { PageHeader, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { PaginatedResponse } from '@/shared/api/api-client';

interface StudentGroupItem {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  teacher?: { userDetail: { displayName: string } | null; email: string } | null;
  domain?: { code: string; name: string } | null;
  certificate?: { code: string; name: string } | null;
  members?: Array<{
    learner: {
      id: string;
      email: string;
      userDetail: { displayName: string } | null;
    };
  }>;
  _count?: { members: number };
}

interface DomainOption { id: string; name: string; code: string; }
interface CertificateOption { id: string; name: string; code: string; }

export default function AdminStudentGroupsPage() {
  const [groups, setGroups] = React.useState<StudentGroupItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const limit = 10;

  const totalPages = Math.ceil(total / limit);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
      });
      const res = await apiClient.get<PaginatedResponse<StudentGroupItem>>(`/student-groups?${params}`);
      setGroups(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải danh sách nhóm học viên');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  React.useEffect(() => { void load(); }, [load]);

  // ── Create Group Modal ──────────────────────────────────────────────────────

  const [showModal, setShowModal] = React.useState(false);
  const [domains, setDomains] = React.useState<DomainOption[]>([]);
  const [certificates, setCertificates] = React.useState<CertificateOption[]>([]);
  const [optionsLoading, setOptionsLoading] = React.useState(false);

  // Form state
  const [formName, setFormName] = React.useState('');
  const [formDescription, setFormDescription] = React.useState('');
  const [formDomainId, setFormDomainId] = React.useState('');
  const [formCertificateId, setFormCertificateId] = React.useState('');
  const [formStartsAt, setFormStartsAt] = React.useState('');
  const [formEndsAt, setFormEndsAt] = React.useState('');
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const openModal = async () => {
    setShowModal(true);
    setFormName('');
    setFormDescription('');
    setFormDomainId('');
    setFormCertificateId('');
    setFormStartsAt('');
    setFormEndsAt('');
    setFormErrors({});
    setSubmitError(null);

    if (domains.length === 0 || certificates.length === 0) {
      setOptionsLoading(true);
      try {
        const [domRes, certRes] = await Promise.all([
          apiClient.get<{ data: DomainOption[] } | DomainOption[]>('/domains'),
          apiClient.get<{ data: CertificateOption[] } | CertificateOption[]>('/certificates'),
        ]);
        setDomains(Array.isArray(domRes) ? domRes : (domRes as { data: DomainOption[] }).data ?? []);
        setCertificates(Array.isArray(certRes) ? certRes : (certRes as { data: CertificateOption[] }).data ?? []);
      } catch {
        // non-fatal; selects will just be empty
      } finally {
        setOptionsLoading(false);
      }
    }
  };

  const closeModal = () => {
    if (submitting) return;
    setShowModal(false);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formName.trim()) errs.name = 'Tên nhóm là bắt buộc';
    if (!formDomainId) errs.domainId = 'Vui lòng chọn lĩnh vực CNTT';
    if (!formCertificateId) errs.certificateId = 'Vui lòng chọn chứng chỉ mục tiêu';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await apiClient.post('/student-groups', {
        name: formName.trim(),
        ...(formDescription.trim() && { description: formDescription.trim() }),
        domainId: formDomainId,
        certificateId: formCertificateId,
        ...(formStartsAt && { startsAt: formStartsAt }),
        ...(formEndsAt && { endsAt: formEndsAt }),
      });
      setShowModal(false);
      void load();
    } catch (e) {
      setSubmitError(e instanceof ApiClientError ? e.message : 'Tạo nhóm thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Shared input class helper ───────────────────────────────────────────────
  const inputCls = (field: string) =>
    `w-full rounded-xl border px-3 py-2 text-sm bg-surface text-on-surface outline-none transition-colors focus:ring-2 focus:ring-primary/30 ${
      formErrors[field]
        ? 'border-error focus:border-error'
        : 'border-outline-variant focus:border-primary'
    }`;

  return (
    <div>
      {/* Header row with Create button */}
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Quản lý nhóm học viên" description="Danh sách các lớp, nhóm luyện thi chứng chỉ và phân công giảng viên" />
        <button
          onClick={() => { void openModal(); }}
          className="shrink-0 mt-1 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tạo nhóm mới
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(sanitized) => {
            setPage(1);
            setSearch(sanitized);
          }}
          placeholder="Tìm kiếm nhóm theo tên, mã lớp (AWS-SAA, CompTIA...)..."
          maxLength={100}
        />
      </div>

      {!loading && (
        <p className="mt-3 text-xs text-on-surface-variant">
          Tổng cộng {total} nhóm học viên {search && `— kết quả cho "${search}"`}
        </p>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Groups Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 space-y-3 animate-pulse">
              <div className="h-5 w-2/3 rounded bg-outline-variant/20" />
              <div className="h-4 w-full rounded bg-outline-variant/10" />
              <div className="h-8 w-full rounded bg-outline-variant/10" />
            </div>
          ))
        ) : groups.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30">
            <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">groups</span>
            <p className="text-sm text-on-surface-variant">Không tìm thấy nhóm học viên nào</p>
          </div>
        ) : (
          groups.map((grp) => (
            <div key={grp.id} className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 flex flex-col justify-between hover:shadow-sm transition-all">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-base text-on-surface">{grp.name}</h3>
                    <code className="text-xs text-primary font-mono font-medium">{grp.code}</code>
                  </div>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium">
                    {grp.status === 'active' ? 'Đang hoạt động' : grp.status}
                  </span>
                </div>

                {grp.description && (
                  <p className="text-xs text-on-surface-variant line-clamp-2 mb-3 leading-relaxed">{grp.description}</p>
                )}

                {/* Details */}
                <div className="space-y-1.5 text-xs text-on-surface-variant mb-4 bg-surface-container/60 p-3 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span>Giảng viên phụ trách:</span>
                    <strong className="text-on-surface">
                      {grp.teacher?.userDetail?.displayName ?? grp.teacher?.email ?? 'Chưa phân công'}
                    </strong>
                  </div>
                  {grp.certificate && (
                    <div className="flex items-center justify-between">
                      <span>Mục tiêu chứng chỉ:</span>
                      <strong className="text-secondary">{grp.certificate.name} ({grp.certificate.code})</strong>
                    </div>
                  )}
                  {grp.domain && (
                    <div className="flex items-center justify-between">
                      <span>Lĩnh vực CNTT:</span>
                      <strong className="text-on-surface">{grp.domain.name}</strong>
                    </div>
                  )}
                </div>

                {/* Members list preview */}
                {grp.members && grp.members.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-on-surface-variant mb-1.5">
                      Thành viên ({grp.members.length}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {grp.members.map((m) => (
                        <span key={m.learner.id} className="text-[11px] bg-surface-container px-2 py-0.5 rounded-md text-on-surface font-medium">
                          {m.learner.userDetail?.displayName ?? m.learner.email}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-on-surface-variant">
                <span>
                  Bắt đầu: {grp.startDate ? new Date(grp.startDate).toLocaleDateString('vi-VN') : '—'}
                </span>
                <span>
                  Kết thúc: {grp.endDate ? new Date(grp.endDate).toLocaleDateString('vi-VN') : '—'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-on-surface-variant">Trang {page}/{totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-xl text-sm border border-outline-variant disabled:opacity-40 hover:bg-surface-container transition-colors">← Trước</button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-xl text-sm border border-outline-variant disabled:opacity-40 hover:bg-surface-container transition-colors">Sau →</button>
          </div>
        </div>
      )}

      {/* ── Create Group Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            className="w-full rounded-2xl bg-surface shadow-xl border border-outline-variant/30 flex flex-col max-h-[90vh]"
            style={{ width: '100%', maxWidth: '560px' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">group_add</span>
                <h2 className="text-base font-bold text-on-surface">Tạo nhóm học viên mới</h2>
              </div>
              <button
                onClick={closeModal}
                disabled={submitting}
                className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal body */}
            <form id="create-group-form" onSubmit={(e) => { void handleSubmit(e); }} className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Tên nhóm / lớp học <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => { setFormName(e.target.value); setFormErrors((prev) => ({ ...prev, name: '' })); }}
                  placeholder="VD: AWS Solutions Architect - Khoá 1"
                  maxLength={200}
                  className={inputCls('name')}
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Mô tả nhóm
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Mô tả ngắn về mục tiêu, đối tượng học viên..."
                  rows={3}
                  maxLength={500}
                  className={`${inputCls('description')} resize-none`}
                />
              </div>

              {/* Domain */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Lĩnh vực CNTT <span className="text-error">*</span>
                </label>
                <select
                  value={formDomainId}
                  onChange={(e) => { setFormDomainId(e.target.value); setFormErrors((prev) => ({ ...prev, domainId: '' })); }}
                  disabled={optionsLoading}
                  className={`${inputCls('domainId')} disabled:opacity-60`}
                >
                  <option value="">{optionsLoading ? 'Đang tải...' : '— Chọn lĩnh vực —'}</option>
                  {domains.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
                {formErrors.domainId && (
                  <p className="mt-1 text-xs text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {formErrors.domainId}
                  </p>
                )}
              </div>

              {/* Certificate */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Chứng chỉ mục tiêu <span className="text-error">*</span>
                </label>
                <select
                  value={formCertificateId}
                  onChange={(e) => { setFormCertificateId(e.target.value); setFormErrors((prev) => ({ ...prev, certificateId: '' })); }}
                  disabled={optionsLoading}
                  className={`${inputCls('certificateId')} disabled:opacity-60`}
                >
                  <option value="">{optionsLoading ? 'Đang tải...' : '— Chọn chứng chỉ —'}</option>
                  {certificates.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
                {formErrors.certificateId && (
                  <p className="mt-1 text-xs text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {formErrors.certificateId}
                  </p>
                )}
              </div>

              {/* Dates row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={formStartsAt}
                    onChange={(e) => setFormStartsAt(e.target.value)}
                    className={inputCls('startsAt')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    value={formEndsAt}
                    onChange={(e) => setFormEndsAt(e.target.value)}
                    className={inputCls('endsAt')}
                  />
                </div>
              </div>

              {/* Submit error */}
              {submitError && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{submitError}</span>
                </div>
              )}
            </form>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-sm border border-outline-variant hover:bg-surface-container transition-colors disabled:opacity-40"
              >
                Huỷ
              </button>
              <button
                type="submit"
                form="create-group-form"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Tạo nhóm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

