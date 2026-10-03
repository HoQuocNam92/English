'use client';
import { AppIcon } from '@/shared/ui/AppIcon';
import { useRouter } from 'next/navigation';
import { completeCreation, CreatePage } from '@/shared/ui/CreatePage';
import { ActionButton, ActionGroup } from '@/shared/ui/ActionButton';

import { LevelBadge } from '@/shared/ui/LevelBadge';
import { Dropdown } from '@/shared/ui/Dropdown';
import * as React from 'react';
import { confirmDialog, PageHeader, SearchInput, Pagination } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { VocabularyItem, PaginatedResponse } from '@/shared/api/api-client';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUSES = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'draft', label: 'Bản nháp' },
];

const PARTS_OF_SPEECH_OPTIONS = [
  { value: '', label: '— Chọn từ loại —' },
  { value: 'noun', label: 'Danh từ (noun)' },
  { value: 'verb', label: 'Động từ (verb)' },
  { value: 'adjective', label: 'Tính từ (adjective)' },
  { value: 'adverb', label: 'Trạng từ (adverb)' },
  { value: 'phrase', label: 'Cụm từ (phrase)' },
  { value: 'abbreviation', label: 'Viết tắt (abbreviation)' },
];

const PARTS_OF_SPEECH: Record<string, string> = {
  noun: 'Danh từ',
  verb: 'Động từ',
  adjective: 'Tính từ',
  adverb: 'Trạng từ',
  phrase: 'Cụm từ',
  abbreviation: 'Viết tắt',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface DomainOption { id: string; code: string; name: string; }
interface LevelOption  { id: string; name: string; }

interface FormState {
  term: string;
  definitionEn: string;
  definitionVi: string;
  pronunciationIpa: string;
  partsOfSpeech: string[];
  domainIds: string[];
  levelId: string;
  tags: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  term: '',
  definitionEn: '',
  definitionVi: '',
  pronunciationIpa: '',
  partsOfSpeech: [],
  domainIds: [],
  levelId: '',
  tags: '',
};

function HighlightedExample({ sentence, term }: { sentence: string; term: string }) {
  if (!term.trim()) return <>{sentence}</>;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = sentence.split(new RegExp(`(${escaped})`, 'gi'));
  return <>{parts.map((part, index) => part.toLocaleLowerCase() === term.toLocaleLowerCase()
    ? <strong key={`${part}-${index}`} className="font-bold text-on-surface">{part}</strong>
    : <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>)}</>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.term.trim())         errors.term         = 'Vui lòng nhập từ / thuật ngữ';
  if (!form.definitionEn.trim()) errors.definitionEn = 'Vui lòng nhập định nghĩa tiếng Anh';
  if (!form.definitionVi.trim()) errors.definitionVi = 'Vui lòng nhập định nghĩa tiếng Việt';
  if (!form.domainIds.length)    errors.domainIds     = 'Vui lòng chọn lĩnh vực';
  if (!form.levelId)             errors.levelId      = 'Vui lòng chọn cấp độ';
  return errors;
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 space-y-3 animate-pulse">
      <div className="h-5 w-2/3 rounded bg-outline-variant/20" />
      <div className="h-3 w-1/4 rounded bg-outline-variant/20" />
      <div className="h-4 w-full rounded bg-outline-variant/20" />
      <div className="h-4 w-4/5 rounded bg-outline-variant/20" />
    </div>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}
function Field({ label, required, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-on-surface-variant">
        {label}{required && <span className="text-error ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

const inputCls =
  'rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors';
const inputErrCls = 'border-error focus:border-error';

// ─── Vocabulary Modal (Create / Edit) ────────────────────────────────────────

interface VocabularyModalProps {
  mode: 'create' | 'edit';
  page?: boolean;
  initial?: VocabularyItem;
  domains: DomainOption[];
  levels: LevelOption[];
  onClose: () => void;
  onSuccess: () => void;
}

function VocabularyModal({ mode, initial, domains, levels, onClose, onSuccess, page = false }: VocabularyModalProps) {
  const [form, setForm] = React.useState<FormState>(() => {
    if (mode === 'edit' && initial) {
      return {
        term: initial.term,
        definitionEn: initial.definitionEn,
        definitionVi: initial.definitionVi ?? '',
        pronunciationIpa: initial.pronunciationIpa ?? '',
        partsOfSpeech: initial.partsOfSpeech?.length ? initial.partsOfSpeech : initial.partOfSpeech ? [initial.partOfSpeech] : [],
        domainIds: [],
        levelId: '',
        tags: initial.tags?.join(', ') ?? '',
      };
    }
    return EMPTY_FORM;
  });

  // Pre-fill domainId / levelId by matching name from options list
  React.useEffect(() => {
    if (mode === 'edit' && initial) {
      const matchedDomain = domains.find((d) => d.name === initial.domain?.name);
      const matchedLevel  = levels.find((l)  => l.name  === initial.level?.name);
      setForm((prev) => ({
        ...prev,
        domainIds: initial.domains?.length ? initial.domains.map(item => item.domainId) : matchedDomain ? [matchedDomain.id] : [],
        levelId:  matchedLevel?.id  ?? '',
      }));
    }
  }, [mode, initial, domains, levels]);

  const [errors, setErrors]         = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleSelection = (key: 'domainIds' | 'partsOfSpeech', value: string) => {
    setForm(current => ({ ...current, [key]: current[key].includes(value)
      ? current[key].filter(item => item !== value) : [...current[key], value] }));
    setErrors(current => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const body = {
        term: form.term.trim(),
        definitionEn: form.definitionEn.trim(),
        definitionVi: form.definitionVi.trim(),
        ...(form.pronunciationIpa.trim() && { pronunciationIpa: form.pronunciationIpa.trim() }),
        partsOfSpeech: form.partsOfSpeech,
        domainIds: form.domainIds,
        levelId:  form.levelId,
        ...(form.tags.trim() && {
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      };
      if (mode === 'create') {
        await apiClient.post('/vocabulary', body);
      } else {
        await apiClient.patch(`/vocabulary/${initial!.id}`, body);
      }
      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof ApiClientError ? err.message : 'Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={page ? undefined : "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"}
      onClick={page ? undefined : handleBackdrop}
    >
      <div
        className={page ? "w-full" : "relative w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-surface shadow-2xl"}
        style={page ? undefined : { width: '100%', maxWidth: '640px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline-variant/30">
          <h2 className="text-base font-bold text-on-surface">
            {mode === 'create' ? 'Thêm từ vựng mới' : 'Chỉnh sửa từ vựng'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <AppIcon className=" text-[20px]">close</AppIcon>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
          {submitError && (
            <div className="flex items-center gap-2 rounded-xl bg-error-container text-on-error-container text-sm p-3">
              <AppIcon className=" text-[18px]">error</AppIcon>
              <span>{submitError}</span>
            </div>
          )}

          <Field label="Từ / Thuật ngữ" required error={errors.term}>
            <input
              type="text"
              value={form.term}
              onChange={set('term')}
              placeholder="VD: algorithm"
              className={`${inputCls} ${errors.term ? inputErrCls : ''}`}
            />
          </Field>

          <Field label="Phiên âm IPA" error={errors.pronunciationIpa}>
            <input
              type="text"
              value={form.pronunciationIpa}
              onChange={set('pronunciationIpa')}
              placeholder="VD: /ˈælɡərɪðəm/"
              className={inputCls}
            />
          </Field>

          <Field label="Từ loại" error={errors.partsOfSpeech}>
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-outline-variant bg-surface-container-low/40 p-3 sm:grid-cols-3">
              {PARTS_OF_SPEECH_OPTIONS.filter((option) => option.value).map((option) => (
                <label key={option.value} className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-on-surface hover:bg-primary/5">
                  <input type="checkbox" checked={form.partsOfSpeech.includes(option.value)} onChange={() => toggleSelection('partsOfSpeech', option.value)} className="h-4 w-4 rounded border-outline-variant accent-primary" />
                  {option.label}
                </label>
              ))}
            </div>
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Lĩnh vực" required error={errors.domainIds}>
              <div className={`max-h-44 space-y-1 overflow-y-auto rounded-xl border bg-surface-container-low/40 p-2 ${errors.domainIds ? 'border-error' : 'border-outline-variant'}`}>
                {domains.map((domain) => (
                  <label key={domain.id} className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-on-surface hover:bg-primary/5">
                    <input type="checkbox" checked={form.domainIds.includes(domain.id)} onChange={() => toggleSelection('domainIds', domain.id)} className="h-4 w-4 rounded border-outline-variant accent-primary" />
                    <span className="truncate">{domain.name}</span>
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Cấp độ" required error={errors.levelId}>
              <Dropdown
                value={form.levelId}
                onChange={set('levelId')}
                className={`admin-select ${inputCls} ${errors.levelId ? inputErrCls : ''}`}
              >
                <option value="">— Chọn cấp độ —</option>
                {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </Dropdown>
            </Field>
          </div>

          <Field label="Định nghĩa tiếng Anh" required error={errors.definitionEn}>
            <textarea
              rows={3}
              value={form.definitionEn}
              onChange={set('definitionEn')}
              placeholder="English definition..."
              className={`${inputCls} resize-none ${errors.definitionEn ? inputErrCls : ''}`}
            />
          </Field>

          <Field label="Định nghĩa tiếng Việt" required error={errors.definitionVi}>
            <textarea
              rows={3}
              value={form.definitionVi}
              onChange={set('definitionVi')}
              placeholder="Định nghĩa tiếng Việt..."
              className={`${inputCls} resize-none ${errors.definitionVi ? inputErrCls : ''}`}
            />
          </Field>

          <Field label="Tags (phân cách bằng dấu phẩy)" error={errors.tags}>
            <input
              type="text"
              value={form.tags}
              onChange={set('tags')}
              placeholder="VD: backend, data-structure, sorting"
              className={inputCls}
            />
          </Field>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-sm border border-outline-variant text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {submitting && (
                <span className="inline-block w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
              )}
              {mode === 'create' ? 'Thêm từ vựng' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

interface DeleteDialogProps {
  item: VocabularyItem;
  onClose: () => void;
  onSuccess: () => void;
}

function DeleteDialog({ item, onClose, onSuccess }: DeleteDialogProps) {
  const [deleting, setDeleting] = React.useState(false);
  const [delError, setDelError] = React.useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setDelError(null);
    try {
      await apiClient.delete(`/vocabulary/${item.id}`);
      onSuccess();
    } catch (err) {
      setDelError(err instanceof ApiClientError ? err.message : 'Xóa thất bại, vui lòng thử lại');
      setDeleting(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div
        className="w-full rounded-2xl bg-surface shadow-2xl p-6 space-y-4"
        style={{ width: '100%', maxWidth: '440px' }}
      >
        <div className="flex items-center gap-3">
          <AppIcon className=" text-error text-[28px]">delete_forever</AppIcon>
          <h2 className="text-base font-bold text-on-surface">Xóa từ vựng</h2>
        </div>
        <p className="text-sm text-on-surface-variant">
          Bạn có chắc muốn xóa từ vựng{' '}
          <span className="font-semibold text-on-surface">"{item.term}"</span>?{' '}
          Thao tác này không thể hoàn tác.
        </p>
        {delError && (
          <div className="flex items-center gap-2 rounded-xl bg-error-container text-on-error-container text-sm p-3">
            <AppIcon className=" text-[16px]">error</AppIcon>
            <span>{delError}</span>
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 rounded-xl text-sm border border-outline-variant text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-error text-on-error font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {deleting && (
              <span className="inline-block w-4 h-4 border-2 border-on-error/40 border-t-on-error rounded-full animate-spin" />
            )}
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminLearningContent({ createOnly = false }: { createOnly?: boolean }) {
  const router = useRouter();
  // ── List state (unchanged) ──
  const [items, setItems]             = React.useState<VocabularyItem[]>([]);
  const [total, setTotal]             = React.useState(0);
  const [page, setPage]               = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch]           = React.useState('');
  const [status, setStatus]           = React.useState('');
  const [domainCode, setDomainCode]   = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy]       = React.useState(false);
  const [loading, setLoading]         = React.useState(true);
  const [error, setError]             = React.useState<string | null>(null);
  const [limit, setLimit] = React.useState(30);
  const totalPages = Math.ceil(total / limit);

  // ── Domain / Level options ──
  const [domains, setDomains] = React.useState<DomainOption[]>([]);
  const [levels, setLevels]   = React.useState<LevelOption[]>([]);

  // ── Modal / dialog state ──
  const [modalMode, setModalMode]       = React.useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget]     = React.useState<VocabularyItem | undefined>();
  const [deleteTarget, setDeleteTarget] = React.useState<VocabularyItem | null>(null);

  // Load domains + levels once on mount
  React.useEffect(() => {
    void apiClient.get<{ data: DomainOption[] } | DomainOption[]>('/domains')
      .then((res) => setDomains(Array.isArray(res) ? res : (res as { data: DomainOption[] }).data ?? []))
      .catch(() => {/* silently ignore — selects will just be empty */});
    void apiClient.get<{ data: LevelOption[] } | LevelOption[]>('/levels')
      .then((res) => setLevels(Array.isArray(res) ? res : (res as { data: LevelOption[] }).data ?? []))
      .catch(() => {/* silently ignore */});
  }, []);

  // Load vocabulary list (unchanged logic)
  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(status && { status }),
        ...(domainCode && { domainCode }),
      });
      const res = await apiClient.get<PaginatedResponse<VocabularyItem>>(`/vocabulary?${params}`);
      setItems(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải kho từ vựng');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, domainCode]);

  React.useEffect(() => { if (!createOnly) void load(); }, [load, createOnly]);

  const openCreate = () => router.push('/admin/learning-content/new');
  const openEdit   = (v: VocabularyItem) => { setEditTarget(v); setModalMode('edit'); };
  const closeModal = () => setModalMode(null);
  const handleModalSuccess  = () => { closeModal();       void load(); };
  const handleDeleteSuccess = () => { setDeleteTarget(null); void load(); };

  React.useEffect(() => { setSelectedIds(new Set()); }, [page, limit, search, status, domainCode]);

  const toggleSelected = (id: string) => setSelectedIds((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const bulkUpdate = async (targetStatus: 'draft' | 'published', scope: 'selected' | 'filtered') => {
    const selectedCount = selectedIds.size;
    if (scope === 'selected' && selectedCount === 0) return;
    const affected = scope === 'selected' ? `${selectedCount} từ đã chọn` : `${total} kết quả đang lọc`;
    const action = targetStatus === 'published' ? 'xuất bản' : 'chuyển về bản nháp';
    if (!(await confirmDialog(`Bạn có chắc muốn ${action} ${affected}?`, { title: 'Xác nhận cập nhật hàng loạt', confirmLabel: action, tone: targetStatus === 'published' ? 'primary' : 'warning' }))) return;
    setBulkBusy(true); setError(null);
    try {
      await apiClient.patch('/vocabulary/bulk-status', scope === 'selected'
        ? { ids: [...selectedIds], status: targetStatus }
        : { domainCode: domainCode || undefined, currentStatus: status || undefined, search: search || undefined, status: targetStatus, confirmAll: !domainCode && !status && !search });
      setSelectedIds(new Set());
      await load();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể cập nhật hàng loạt');
    } finally { setBulkBusy(false); }
  };

  if (createOnly) return <CreatePage backHref="/admin/learning-content"><VocabularyModal page mode="create" domains={domains} levels={levels} onClose={() => router.push('/admin/learning-content')} onSuccess={() => completeCreation(router, '/admin/learning-content', 'Đã thêm từ vựng.')} /></CreatePage>;

  return (
    <div>
      {/* Page header + Add button */}
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Kho nội dung từ vựng"
          description="Quản trị toàn bộ kho từ vựng và thuật ngữ chuyên ngành IT"
        />
        <button
          type="button"
          onClick={openCreate}
          className="shrink-0 mt-1 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <AppIcon className=" text-[18px]">add</AppIcon>
          Thêm từ vựng
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
          placeholder="Tìm kiếm từ vựng, thuật ngữ, định nghĩa tiếng Anh hoặc tiếng Việt..."
          maxLength={100}
        />
        <Dropdown
          value={domainCode}
          onChange={(e) => { setDomainCode(e.target.value); setPage(1); }}
          className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:outline-none"
        >
          <option value="">Tất cả lĩnh vực</option>
          {domains.map((domain) => <option key={domain.id} value={domain.code}>{domain.name}</option>)}
        </Dropdown>
        <Dropdown
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:outline-none"
        >
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Dropdown>
      </div>

      {/* Summary */}
      {!loading && (
        <p className="mt-3 text-xs text-on-surface-variant">
          Tổng cộng {total} thuật ngữ IT {search && `— kết quả cho "${search}"`}
        </p>
      )}

      {!loading && items.length > 0 && (
        <div className="mt-4 rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-3 flex flex-wrap items-center gap-2">
          <label className="mr-auto flex cursor-pointer items-center gap-2 text-sm font-semibold text-on-surface">
            <input type="checkbox" className="h-4 w-4 accent-primary" checked={items.every((item) => selectedIds.has(item.id))} onChange={(e) => setSelectedIds((current) => { const next = new Set(current); items.forEach((item) => e.target.checked ? next.add(item.id) : next.delete(item.id)); return next; })} />
            Chọn trang này {selectedIds.size > 0 && `(${selectedIds.size})`}
          </label>
          {selectedIds.size > 0 && <><button disabled={bulkBusy} onClick={() => void bulkUpdate('published', 'selected')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Xuất bản đã chọn</button><button disabled={bulkBusy} onClick={() => void bulkUpdate('draft', 'selected')} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Đưa về nháp</button></>}
          <button disabled={bulkBusy || total === 0} onClick={() => void bulkUpdate('published', 'filtered')} className="rounded-lg border border-emerald-600 px-3 py-2 text-xs font-bold text-emerald-700 disabled:opacity-50">Xuất bản tất cả kết quả lọc</button>
          <button disabled={bulkBusy || total === 0} onClick={() => void bulkUpdate('draft', 'filtered')} className="rounded-lg border border-amber-500 px-3 py-2 text-xs font-bold text-amber-700 disabled:opacity-50">Cho tất cả kết quả lọc về nháp</button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <AppIcon className=" text-[18px]">error</AppIcon>
          <span>{error}</span>
        </div>
      )}

      {/* Cards grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : items.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30">
            <AppIcon className=" text-[48px] text-outline mb-3 block">translate</AppIcon>
            <p className="text-sm text-on-surface-variant">Không tìm thấy từ vựng nào</p>
          </div>
        ) : (
          items.map((v) => (
            <div key={v.id} className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-[0_8px_28px_rgba(15,23,42,0.035)] hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <input aria-label={`Chọn ${v.term}`} type="checkbox" checked={selectedIds.has(v.id)} onChange={() => toggleSelected(v.id)} className="mt-1 h-4 w-4 shrink-0 accent-primary" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-on-surface text-base">{v.term}</h3>
                    {v.pronunciationIpa && (
                      <p className="text-xs text-primary font-mono mt-0.5 font-medium">{v.pronunciationIpa}</p>
                    )}
                  </div>
                  <div className="flex max-w-[55%] flex-col items-end gap-1 text-right">
                    {(v.partsOfSpeech?.length || v.partOfSpeech) && (
                      <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-semibold">
                        {(v.partsOfSpeech?.length ? v.partsOfSpeech : [v.partOfSpeech!]).map(part => PARTS_OF_SPEECH[part] ?? part).join(', ')}
                      </span>
                    )}
                    {v.status === 'published' ? (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Đã xuất bản</span>
                    ) : (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">Bản nháp</span>
                    )}
                  </div>
                </div>

                {/* Domain + Level */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  {v.domain && (
                    <span className="text-[11px] text-secondary bg-secondary/10 px-2 py-0.5 rounded-md font-medium">
                      {v.domains?.length ? v.domains.map(item => item.domain.name).join(', ') : v.domain.name}
                    </span>
                  )}
                  {v.level && (
                    <LevelBadge level={v.level} />
                  )}
                </div>

                {/* Definitions */}
                <div className="mt-3 space-y-1.5 text-xs">
                  <p className="text-on-surface leading-relaxed font-normal">{v.definitionEn}</p>
                  {v.definitionVi && (
                    <p className="text-on-surface-variant italic leading-relaxed">{v.definitionVi}</p>
                  )}
                </div>

                {/* Example */}
                {v.examples?.[0] && (
                  <div className="mt-3 border-t border-outline-variant/20 pt-2.5">
                    <p className="text-xs text-on-surface-variant line-clamp-2">
                      <span className="font-semibold text-on-surface">Ví dụ: </span>
                      <HighlightedExample sentence={v.examples[0].sentenceEn} term={v.term} />
                    </p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {v.tags?.length > 0 && (
                <div className="mt-3 pt-2 border-t border-outline-variant/20 flex flex-wrap gap-1">
                  {v.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Card action buttons */}
              <ActionGroup className="mt-4 pt-3 border-t border-outline-variant/20">
                <ActionButton action="edit" type="button" onClick={() => openEdit(v)} title="Chỉnh sửa" />
                <ActionButton action="delete" type="button" onClick={() => setDeleteTarget(v)} title="Xóa" />
              </ActionGroup>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <Pagination
          className="mt-6 rounded-2xl border border-outline-variant/40 shadow-xs"
          page={page}
          limit={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          onLimitChange={(value) => { setLimit(value); setPage(1); }}
          showQuickJumper
        />
      )}

      {/* Create / Edit modal */}
      {modalMode && (
        <VocabularyModal
          mode={modalMode}
          initial={editTarget}
          domains={domains}
          levels={levels}
          onClose={closeModal}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <DeleteDialog
          item={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
