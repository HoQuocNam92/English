'use client';

import * as React from 'react';
import { PageHeader, SearchInput } from '@/shared/ui';
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
    <div>
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Chứng chỉ quốc tế"
          description="Quản lý và theo dõi các chứng chỉ IT hàng đầu được hỗ trợ luyện thi trên hệ thống"
        />
        <button
          onClick={openCreate}
          className="shrink-0 mt-1 flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 active:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Thêm chứng chỉ
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearch}
          placeholder="Tìm kiếm chứng chỉ theo tên, mã (AWS-SAA, CKA...), tổ chức cấp..."
          maxLength={100}
        />
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {[
          { label: 'Tổng số chứng chỉ', value: loading ? '—' : String(certs.length), icon: 'workspace_premium', color: 'text-primary' },
          { label: 'Tổ chức cấp chứng chỉ', value: loading ? '—' : String(new Set(certs.map((c) => c.provider)).size), icon: 'business', color: 'text-secondary' },
          { label: 'Đề thi Mock Exam', value: loading ? '—' : String(certs.reduce((s, c) => s + (c._count?.exams ?? 0), 0)), icon: 'quiz', color: 'text-tertiary' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-on-surface-variant font-medium">{s.label}</p>
              <span className={`material-symbols-outlined text-[20px] ${s.color}`}>{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Cert Cards */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-on-surface">
            Danh sách chứng chỉ {filteredCerts.length > 0 && `(${filteredCerts.length})`}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 space-y-3 animate-pulse">
                <div className="h-5 w-2/3 rounded bg-outline-variant/20" />
                <div className="h-4 w-full rounded bg-outline-variant/10" />
                <div className="h-8 w-full rounded bg-outline-variant/10" />
              </div>
            ))}
          </div>
        ) : filteredCerts.length === 0 ? (
          <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">workspace_premium</span>
            <p className="text-sm text-on-surface-variant">Không tìm thấy chứng chỉ nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCerts.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5 flex flex-col justify-between hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                      {c.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md font-medium">
                        {c.provider}
                      </span>
                      <button
                        onClick={() => openEdit(c)}
                        title="Sửa chứng chỉ"
                        className="flex items-center justify-center rounded-lg p-1 text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-on-surface line-clamp-2 mt-1">{c.name}</h3>
                  <p className="text-xs text-on-surface-variant line-clamp-3 mt-2 leading-relaxed">{c.description}</p>

                  {/* Domains */}
                  {c.domains && c.domains.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {c.domains.map((d) => (
                        <span key={d.domain.code} className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-medium">
                          {d.domain.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">quiz</span>
                    {c._count?.exams ?? 0} đề thi mock
                  </span>
                  {c.examUrl && (
                    <a
                      href={c.examUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-0.5"
                    >
                      Trang chủ <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <CertModal
          cert={editTarget}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

// ── CertModal ────────────────────────────────────────────────────────────────

interface CertFormValues {
  code: string;
  name: string;
  provider: string;
  description: string;
  examUrl: string;
}

interface CertFormErrors {
  code?: string;
  name?: string;
  provider?: string;
  description?: string;
}

function CertModal({
  cert,
  onClose,
  onSaved,
}: {
  cert: CertificateItem | null;
  onClose: () => void;
  onSaved: (saved: CertificateItem) => void;
}) {
  const isEdit = cert !== null;

  const [values, setValues] = React.useState<CertFormValues>({
    code: cert?.code ?? '',
    name: cert?.name ?? '',
    provider: cert?.provider ?? '',
    description: cert?.description ?? '',
    examUrl: cert?.examUrl ?? '',
  });

  const [errors, setErrors] = React.useState<CertFormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const set = (field: keyof CertFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (errors[field as keyof CertFormErrors]) {
      setErrors((er) => ({ ...er, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const errs: CertFormErrors = {};
    if (!values.code.trim()) errs.code = 'Mã chứng chỉ là bắt buộc';
    if (!values.name.trim()) errs.name = 'Tên chứng chỉ là bắt buộc';
    if (!values.provider.trim()) errs.provider = 'Tổ chức cấp là bắt buộc';
    if (!values.description.trim()) errs.description = 'Mô tả là bắt buộc';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError(null);
    setSubmitting(true);
    try {
      const body: Record<string, string> = {
        code: values.code.trim(),
        name: values.name.trim(),
        provider: values.provider.trim(),
        description: values.description.trim(),
      };
      if (values.examUrl.trim()) body.examUrl = values.examUrl.trim();

      let saved: CertificateItem;
      if (isEdit) {
        const res = await apiClient.patch<{ data: CertificateItem }>(`/certificates/${cert.id}`, body);
        saved = res.data;
      } else {
        const res = await apiClient.post<{ data: CertificateItem }>('/certificates', body);
        saved = res.data;
      }
      onSaved(saved);
    } catch (err) {
      setApiError(err instanceof ApiClientError ? err.message : 'Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div
        className="w-full rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-xl flex flex-col max-h-[90vh]"
        style={{ width: '100%', maxWidth: '560px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
          <h2 className="text-base font-bold text-on-surface">
            {isEdit ? 'Sửa chứng chỉ' : 'Thêm chứng chỉ mới'}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={(e) => { void handleSubmit(e); }} className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
          {apiError && (
            <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{apiError}</span>
            </div>
          )}

          {/* Code */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Mã chứng chỉ <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={values.code}
              onChange={set('code')}
              placeholder="VD: AWS-SAA, CKA, CKAD"
              className={`w-full rounded-xl border px-3 py-2 text-sm bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition ${
                errors.code ? 'border-error' : 'border-outline-variant'
              }`}
            />
            {errors.code && <p className="mt-1 text-xs text-error">{errors.code}</p>}
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Tên đầy đủ <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={values.name}
              onChange={set('name')}
              placeholder="VD: AWS Solutions Architect Associate"
              className={`w-full rounded-xl border px-3 py-2 text-sm bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition ${
                errors.name ? 'border-error' : 'border-outline-variant'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-error">{errors.name}</p>}
          </div>

          {/* Provider */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Tổ chức cấp <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={values.provider}
              onChange={set('provider')}
              placeholder="VD: Amazon Web Services, CNCF, CompTIA"
              className={`w-full rounded-xl border px-3 py-2 text-sm bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition ${
                errors.provider ? 'border-error' : 'border-outline-variant'
              }`}
            />
            {errors.provider && <p className="mt-1 text-xs text-error">{errors.provider}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Mô tả <span className="text-error">*</span>
            </label>
            <textarea
              value={values.description}
              onChange={set('description')}
              rows={4}
              placeholder="Mô tả nội dung và yêu cầu của chứng chỉ..."
              className={`w-full rounded-xl border px-3 py-2 text-sm bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none ${
                errors.description ? 'border-error' : 'border-outline-variant'
              }`}
            />
            {errors.description && <p className="mt-1 text-xs text-error">{errors.description}</p>}
          </div>

          {/* examUrl */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              URL trang chính thức <span className="text-outline text-[11px] font-normal">(tuỳ chọn)</span>
            </label>
            <input
              type="url"
              value={values.examUrl}
              onChange={set('examUrl')}
              placeholder="https://aws.amazon.com/certification/..."
              className="w-full rounded-xl border border-outline-variant px-3 py-2 text-sm bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={submitting}
            onClick={(e) => { void handleSubmit(e as unknown as React.FormEvent); }}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-60"
          >
            {submitting && (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {submitting ? (isEdit ? 'Đang lưu...' : 'Đang tạo...') : (isEdit ? 'Lưu thay đổi' : 'Tạo chứng chỉ')}
          </button>
        </div>
      </div>
    </div>
  );
}

