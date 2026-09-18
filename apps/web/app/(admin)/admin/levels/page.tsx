'use client';

import * as React from 'react';
import { PageHeader, Modal } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';

interface LevelItem {
  id: string;
  code: string;
  name: string;
  order: number;
  description: string;
  isActive: boolean;
  _count?: {
    lessons: number;
    vocabularies: number;
    questions: number;
    exams: number;
    learnerProfiles?: number;
  };
}

const LEVEL_COLOR_MAP: Record<string, { bg: string; text: string; icon: string }> = {
  beginner: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'text-emerald-700', icon: 'signal_cellular_alt_1_bar' },
  intermediate: { bg: 'bg-blue-100 text-blue-800 border-blue-200', text: 'text-blue-700', icon: 'signal_cellular_alt_2_bar' },
  advanced: { bg: 'bg-purple-100 text-purple-800 border-purple-200', text: 'text-purple-700', icon: 'signal_cellular_alt' },
  professional: { bg: 'bg-rose-100 text-rose-800 border-rose-200', text: 'text-rose-700', icon: 'workspace_premium' },
};

export default function AdminLevelsPage() {
  const [levels, setLevels] = React.useState<LevelItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Modal states
  const [formModalOpen, setFormModalOpen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  // Form fields
  const [code, setCode] = React.useState('');
  const [name, setName] = React.useState('');
  const [order, setOrder] = React.useState<number | string>('1');
  const [description, setDescription] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deletingLevel, setDeletingLevel] = React.useState<LevelItem | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ data: LevelItem[] }>('/levels');
      setLevels(res.data ?? []);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải danh sách cấp độ');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setEditingId(null);
    setCode('');
    setName('');
    const maxOrder = levels.reduce((max, l) => Math.max(max, l.order), 0);
    setOrder(maxOrder + 1);
    setDescription('');
    setIsActive(true);
    setFormError(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (lvl: LevelItem) => {
    setIsEditMode(true);
    setEditingId(lvl.id);
    setCode(lvl.code);
    setName(lvl.name);
    setOrder(lvl.order);
    setDescription(lvl.description || '');
    setIsActive(lvl.isActive);
    setFormError(null);
    setFormModalOpen(true);
  };

  const handleSaveLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedCode = code.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedCode) {
      setFormError('Vui lòng nhập mã cấp độ');
      return;
    }
    if (!trimmedName) {
      setFormError('Vui lòng nhập tên cấp độ');
      return;
    }
    const orderNum = Number(order);
    if (isNaN(orderNum) || orderNum <= 0) {
      setFormError('Thứ tự phải là số nguyên dương (ví dụ: 1, 2, 3)');
      return;
    }

    setSaving(true);
    try {
      if (isEditMode && editingId) {
        await apiClient.patch(`/levels/${editingId}`, {
          code: trimmedCode,
          name: trimmedName,
          order: orderNum,
          description: description.trim(),
          isActive,
        });
        setSuccessMsg(`Cập nhật cấp độ "${trimmedName}" thành công!`);
      } else {
        await apiClient.post('/levels', {
          code: trimmedCode,
          name: trimmedName,
          order: orderNum,
          description: description.trim(),
          isActive,
        });
        setSuccessMsg(`Tạo cấp độ mới "${trimmedName}" thành công!`);
      }
      setFormModalOpen(false);
      await load();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : 'Đã có lỗi xảy ra khi lưu cấp độ');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (lvl: LevelItem) => {
    setDeletingLevel(lvl);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLevel) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/levels/${deletingLevel.id}`);
      setSuccessMsg(`Đã xóa cấp độ "${deletingLevel.name}" thành công!`);
      setDeleteModalOpen(false);
      setDeletingLevel(null);
      await load();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Không thể xóa cấp độ này');
    } finally {
      setDeleting(false);
    }
  };

  const handleQuickDeactivate = async () => {
    if (!deletingLevel) return;
    setDeleting(true);
    try {
      await apiClient.patch(`/levels/${deletingLevel.id}`, { isActive: false });
      setSuccessMsg(`Đã chuyển cấp độ "${deletingLevel.name}" sang trạng thái Ngừng hoạt động an toàn.`);
      setDeleteModalOpen(false);
      setDeletingLevel(null);
      await load();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Lỗi cập nhật trạng thái');
    } finally {
      setDeleting(false);
    }
  };

  // Check linked count
  const getLinkedCount = (lvl: LevelItem | null) => {
    if (!lvl?._count) return 0;
    return (
      (lvl._count.lessons ?? 0) +
      (lvl._count.vocabularies ?? 0) +
      (lvl._count.questions ?? 0) +
      (lvl._count.exams ?? 0) +
      (lvl._count.learnerProfiles ?? 0)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Cấp độ học tập"
          description="Quản lý và thống kê toàn bộ cấp độ học theo khung năng lực chuẩn (CEFR & Tech Framework)"
        />
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold !text-white shadow-sm hover:opacity-95 transition-all self-start sm:self-center"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm cấp độ mới
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
            <span className="font-medium">{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container text-sm flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-on-error-container hover:opacity-75">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng cấp độ', value: loading ? '—' : String(levels.length), icon: 'stairs', color: 'text-primary' },
          { label: 'Tổng bài học theo cấp', value: loading ? '—' : String(levels.reduce((s, l) => s + (l._count?.lessons ?? 0), 0)), icon: 'auto_stories', color: 'text-secondary' },
          { label: 'Tổng từ vựng', value: loading ? '—' : String(levels.reduce((s, l) => s + (l._count?.vocabularies ?? 0), 0)), icon: 'translate', color: 'text-tertiary' },
          { label: 'Ngân hàng câu hỏi', value: loading ? '—' : String(levels.reduce((s, l) => s + (l._count?.questions ?? 0), 0)), icon: 'quiz', color: 'text-error' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-surface-container-lowest p-5 border border-outline-variant/40 shadow-[0_8px_28px_rgba(15,23,42,0.03)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-on-surface-variant">{stat.label}</p>
              <span className={`material-symbols-outlined text-[22px] ${stat.color}`}>{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Level Cards Grid */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-on-surface mb-4">Danh sách cấp độ ({levels.length})</h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-surface-container-lowest p-6 space-y-3 border border-outline-variant/30 shadow-[0_8px_28px_rgba(15,23,42,0.03)] animate-pulse">
                <div className="h-6 w-1/3 rounded bg-outline-variant/20" />
                <div className="h-4 w-full rounded bg-outline-variant/10" />
                <div className="h-10 w-full rounded bg-outline-variant/10" />
              </div>
            ))}
          </div>
        ) : levels.length === 0 ? (
          <div className="rounded-2xl bg-surface-container-lowest p-12 text-center border border-outline-variant/30 shadow-[0_8px_28px_rgba(15,23,42,0.03)]">
            <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">stairs</span>
            <p className="text-sm text-on-surface-variant mb-4">Chưa có cấp độ học tập nào trong hệ thống</p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold !text-white"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tạo cấp độ đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {levels.map((lvl) => {
              const meta = LEVEL_COLOR_MAP[lvl.code] ?? {
                bg: 'bg-slate-100 text-slate-800 border-slate-200',
                text: 'text-slate-700',
                icon: 'school',
              };

              return (
                <div
                  key={lvl.id}
                  className="rounded-2xl bg-surface-container-lowest p-6 flex flex-col justify-between border border-outline-variant/40 shadow-[0_8px_28px_rgba(15,23,42,0.03)] hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${meta.bg}`}>
                          <span className="material-symbols-outlined text-[20px]">{meta.icon}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-on-surface">{lvl.name}</h3>
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">
                              Bậc {lvl.order}
                            </span>
                          </div>
                          <code className="text-xs text-on-surface-variant font-mono">{lvl.code}</code>
                        </div>
                      </div>

                      {/* Action buttons + Status */}
                      <div className="flex items-center gap-1.5">
                        {lvl.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                            Ngừng
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(lvl)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors ml-1"
                          title="Chỉnh sửa cấp độ"
                        >
                          <span className="material-symbols-outlined text-[19px]">edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDelete(lvl)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-red-50 transition-colors"
                          title="Xóa cấp độ"
                        >
                          <span className="material-symbols-outlined text-[19px]">delete</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-on-surface-variant leading-relaxed mb-4 min-h-[40px]">
                      {lvl.description || <span className="italic text-outline">Chưa có mô tả chi tiết cho cấp độ này.</span>}
                    </p>
                  </div>

                  {/* Counters */}
                  <div className="grid grid-cols-4 gap-2 pt-4 border-t border-outline-variant/20 text-center">
                    <div className="bg-surface-container-low/70 rounded-xl p-2.5">
                      <p className="text-[11px] text-on-surface-variant mb-0.5">Bài học</p>
                      <p className="text-sm font-bold text-on-surface">{lvl._count?.lessons ?? 0}</p>
                    </div>
                    <div className="bg-surface-container-low/70 rounded-xl p-2.5">
                      <p className="text-[11px] text-on-surface-variant mb-0.5">Từ vựng</p>
                      <p className="text-sm font-bold text-on-surface">{lvl._count?.vocabularies ?? 0}</p>
                    </div>
                    <div className="bg-surface-container-low/70 rounded-xl p-2.5">
                      <p className="text-[11px] text-on-surface-variant mb-0.5">Câu hỏi</p>
                      <p className="text-sm font-bold text-on-surface">{lvl._count?.questions ?? 0}</p>
                    </div>
                    <div className="bg-surface-container-low/70 rounded-xl p-2.5">
                      <p className="text-[11px] text-on-surface-variant mb-0.5">Đề thi</p>
                      <p className="text-sm font-bold text-on-surface">{lvl._count?.exams ?? 0}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {formModalOpen && (
        <Modal open onClose={() => { if (!saving) setFormModalOpen(false); }} maxWidth="max-w-lg">
          <form onSubmit={handleSaveLevel} className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  {isEditMode ? 'edit_square' : 'add_circle'}
                </span>
                <h3 className="text-lg font-bold text-on-surface">
                  {isEditMode ? 'Chỉnh sửa cấp độ học tập' : 'Thêm cấp độ học tập mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                disabled={saving}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Mã cấp độ (Code) <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  placeholder="Ví dụ: pre_intermediate, expert, master"
                  className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm font-mono focus:outline-hidden focus:border-primary"
                  required
                />
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Dùng chữ thường, không dấu, ngăn cách bằng dấu gạch dưới.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Tên hiển thị <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Pre-Intermediate (Tiền trung cấp)"
                  className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm focus:outline-hidden focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Bậc thứ tự (Order) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  placeholder="1, 2, 3..."
                  className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm focus:outline-hidden focus:border-primary"
                  required
                />
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Thứ tự sắp xếp từ thấp đến cao trong lộ trình học tập.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Mô tả cấp độ
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả đối tượng người học, mục tiêu và phạm vi kiến thức..."
                  className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-sm font-semibold text-on-surface cursor-pointer">
                  Kích hoạt cấp độ này (Cho phép chọn khi tạo bài học/câu hỏi/bài thi)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setFormModalOpen(false)}
                disabled={saving}
                className="px-4 py-2 rounded-xl border border-outline-variant text-sm font-semibold hover:bg-surface-container transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-primary text-sm font-bold !text-white shadow-sm hover:opacity-95 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Đang lưu…' : isEditMode ? 'Lưu thay đổi' : 'Tạo cấp độ'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE MODAL */}
      {deleteModalOpen && deletingLevel && (
        <Modal open onClose={() => { if (!deleting) setDeleteModalOpen(false); }} maxWidth="max-w-md">
          <div className="p-6">
            <div className="flex items-center gap-3 text-error mb-3">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              <h3 className="text-lg font-bold text-on-surface">Xóa cấp độ học tập</h3>
            </div>

            {getLinkedCount(deletingLevel) > 0 ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                  <p className="font-bold mb-1">Không thể xóa vĩnh viễn cấp độ này!</p>
                  <p className="text-xs leading-relaxed">
                    Cấp độ <strong>{deletingLevel.name}</strong> đang có{' '}
                    <strong>{getLinkedCount(deletingLevel)} mục dữ liệu liên kết</strong> trong hệ thống:
                  </p>
                  <ul className="mt-2 list-disc list-inside text-xs space-y-0.5 text-amber-800">
                    {deletingLevel._count?.lessons ? <li>{deletingLevel._count.lessons} bài học</li> : null}
                    {deletingLevel._count?.vocabularies ? <li>{deletingLevel._count.vocabularies} từ vựng</li> : null}
                    {deletingLevel._count?.questions ? <li>{deletingLevel._count.questions} câu hỏi</li> : null}
                    {deletingLevel._count?.exams ? <li>{deletingLevel._count.exams} bài thi</li> : null}
                  </ul>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Để đảm bảo an toàn cho học liệu và hồ sơ học viên, hệ thống ngăn chặn xóa cứng. Bạn có thể chọn{' '}
                  <strong>"Ngừng hoạt động"</strong> để cấp độ này không xuất hiện trong các bộ lọc mới mà vẫn giữ nguyên dữ liệu đã có.
                </p>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(false)}
                    disabled={deleting}
                    className="px-4 py-2 rounded-xl border border-outline-variant text-sm font-semibold"
                  >
                    Đóng
                  </button>
                  {deletingLevel.isActive && (
                    <button
                      type="button"
                      onClick={handleQuickDeactivate}
                      disabled={deleting}
                      className="px-4 py-2 rounded-xl bg-amber-600 text-sm font-bold !text-white shadow-sm hover:bg-amber-700"
                    >
                      {deleting ? 'Đang cập nhật…' : 'Ngừng hoạt động cấp độ'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Bạn có chắc chắn muốn xóa cấp độ <strong>{deletingLevel.name}</strong> (<code>{deletingLevel.code}</code>)?
                </p>
                <p className="text-xs text-error font-medium">
                  Cấp độ này hiện chưa có dữ liệu liên kết nào. Hành động này sẽ xóa hoàn toàn và không thể hoàn tác.
                </p>
                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(false)}
                    disabled={deleting}
                    className="px-4 py-2 rounded-xl border border-outline-variant text-sm font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="px-4 py-2 rounded-xl bg-error text-sm font-bold !text-white shadow-sm hover:opacity-95"
                  >
                    {deleting ? 'Đang xóa…' : 'Xác nhận xóa'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
