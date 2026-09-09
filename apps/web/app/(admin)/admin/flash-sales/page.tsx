'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/shared/api/api-client';

const PLAN_LABELS: Record<string, string> = {
  pro_monthly: 'PRO Tháng',
  pro_quarterly: 'PRO Quý (3 tháng)',
  pro_halfyear: 'PRO Nửa năm',
  pro_yearly: 'PRO Năm',
};

const PLAN_PRICES: Record<string, number> = {
  pro_monthly: 99000,
  pro_quarterly: 249000,
  pro_halfyear: 449000,
  pro_yearly: 799000,
};

interface FlashSale {
  id: string;
  title: string;
  description: string | null;
  planId: string;
  discountPercent: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = {
  title: '',
  description: '',
  planId: 'pro_yearly',
  discountPercent: 20,
  startTime: '',
  endTime: '',
  isActive: true,
};

export default function AdminFlashSalesPage() {
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>('/flash-sales?limit=50');
      setSales(res?.data ?? res ?? []);
      setTotal(res?.meta?.total ?? (res?.data ?? res ?? []).length);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSales(); }, [loadSales]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (s: FlashSale) => {
    setEditId(s.id);
    setForm({
      title: s.title,
      description: s.description ?? '',
      planId: s.planId,
      discountPercent: s.discountPercent,
      startTime: s.startTime ? s.startTime.slice(0, 16) : '',
      endTime: s.endTime ? s.endTime.slice(0, 16) : '',
      isActive: s.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        discountPercent: Number(form.discountPercent),
        description: form.description || undefined,
        startTime: form.startTime ? new Date(form.startTime).toISOString() : undefined,
        endTime: form.endTime ? new Date(form.endTime).toISOString() : undefined,
      };
      if (editId) {
        await apiClient.patch(`/flash-sales/${editId}`, payload);
      } else {
        await apiClient.post('/flash-sales', payload);
      }
      setShowModal(false);
      await loadSales();
    } catch (err: any) {
      alert(err.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (s: FlashSale) => {
    try {
      await apiClient.patch(`/flash-sales/${s.id}/toggle`, {});
      await loadSales();
    } catch (err: any) {
      alert(err.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (s: FlashSale) => {
    if (!confirm(`Xóa Flash Sale "${s.title}"?`)) return;
    try {
      await apiClient.delete(`/flash-sales/${s.id}`);
      await loadSales();
    } catch (err: any) {
      alert(err.message || 'Xóa thất bại');
    }
  };

  const now = new Date();

  const getSaleStatus = (s: FlashSale) => {
    if (!s.isActive) return { label: 'Đã tắt', color: 'bg-surface-container-low text-on-surface-variant border border-outline-variant', icon: 'block' };
    if (new Date(s.endTime) < now) return { label: 'Đã kết thúc', color: 'bg-error-container text-on-error-container border border-error/20', icon: 'timer_off' };
    if (new Date(s.startTime) > now) return { label: 'Sắp diễn ra', color: 'bg-[#fff8e1] text-[#f57f17] border border-[#ffe082]', icon: 'schedule' };
    return { label: 'Đang diễn ra', color: 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]', icon: 'bolt' };
  };

  const getDiscountedPrice = (s: FlashSale) => {
    const base = PLAN_PRICES[s.planId];
    if (!base) return null;
    return Math.floor(base * (1 - s.discountPercent / 100));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[28px] text-[#f5b400]">flash_on</span>
            Flash Sale
          </h1>
          <p className="text-sm text-on-surface-variant">{total} chương trình trong hệ thống</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tạo Flash Sale
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="text-left px-5 py-4 font-semibold text-on-surface-variant">Tên chương trình</th>
                <th className="text-left px-5 py-4 font-semibold text-on-surface-variant">Gói</th>
                <th className="text-left px-5 py-4 font-semibold text-on-surface-variant">Giảm giá</th>
                <th className="text-left px-5 py-4 font-semibold text-on-surface-variant">Thời gian</th>
                <th className="text-left px-5 py-4 font-semibold text-on-surface-variant">Trạng thái</th>
                <th className="text-right px-5 py-4 font-semibold text-on-surface-variant">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-on-surface-variant font-medium">Đang tải...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-on-surface-variant font-medium">Chưa có Flash Sale nào.</td></tr>
              ) : sales.map((s) => {
                const status = getSaleStatus(s);
                const discountedPrice = getDiscountedPrice(s);
                const basePrice = PLAN_PRICES[s.planId];
                return (
                  <tr key={s.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-on-surface text-base">{s.title}</div>
                      {s.description && (
                        <div className="text-sm text-on-surface-variant mt-1">{s.description}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-on-surface bg-surface-container-low border border-outline-variant px-2.5 py-1 rounded-md">
                        {PLAN_LABELS[s.planId] ?? s.planId}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-lg font-bold text-[#d93025]">{s.discountPercent}%</span>
                      {basePrice && discountedPrice !== null && (
                        <div className="text-sm mt-1">
                          <span className="line-through text-on-surface-variant">{basePrice.toLocaleString('vi-VN')}đ</span>
                          <span className="text-[#137333] font-bold ml-1.5">{discountedPrice.toLocaleString('vi-VN')}đ</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-on-surface-variant space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        {new Date(s.startTime).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        {new Date(s.endTime).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                        <span className="material-symbols-outlined text-[14px]">{status.icon}</span>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors border border-transparent hover:border-outline-variant" title="Chỉnh sửa">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleToggle(s)}
                          className={`p-2 rounded-lg transition-colors border border-transparent hover:border-outline-variant ${s.isActive ? 'hover:bg-error-container text-on-surface-variant hover:text-error' : 'hover:bg-[#e6f4ea] text-on-surface-variant hover:text-[#137333]'}`}
                          title={s.isActive ? 'Tắt Flash Sale' : 'Bật Flash Sale'}
                        >
                          <span className="material-symbols-outlined text-[18px]">{s.isActive ? 'toggle_off' : 'toggle_on'}</span>
                        </button>
                        <button onClick={() => handleDelete(s)} className="p-2 rounded-lg hover:bg-error-container text-on-surface-variant hover:text-error transition-colors border border-transparent hover:border-outline-variant" title="Xóa">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-outline-variant">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-container-low/50">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f5b400]">flash_on</span>
                {editId ? 'Chỉnh sửa Flash Sale' : 'Tạo Flash Sale mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-container-low rounded-lg text-on-surface-variant transition-colors border border-transparent hover:border-outline-variant">
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Tên chương trình <span className="text-error">*</span></label>
                <input
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="VD: Flash Sale Tháng 9"
                  className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Mô tả ngắn</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Ưu đãi đặc biệt chỉ trong 24h"
                  className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Gói áp dụng <span className="text-error">*</span></label>
                  <select
                    value={form.planId}
                    onChange={(e) => setForm(f => ({ ...f, planId: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface bg-white"
                  >
                    {Object.entries(PLAN_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v} — {PLAN_PRICES[k]?.toLocaleString('vi-VN')}đ</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">% Giảm giá (1–99) <span className="text-error">*</span></label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.discountPercent}
                      onChange={(e) => setForm(f => ({ ...f, discountPercent: Number(e.target.value) }))}
                      min={1} max={99}
                      className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                    />
                    {PLAN_PRICES[form.planId] && (
                      <p className="text-xs text-[#137333] font-bold mt-2">
                        → {Math.floor(PLAN_PRICES[form.planId] * (1 - form.discountPercent / 100)).toLocaleString('vi-VN')}đ
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Thời gian bắt đầu <span className="text-error">*</span></label>
                  <input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) => setForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Thời gian kết thúc <span className="text-error">*</span></label>
                  <input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input
                  id="saleActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant"
                />
                <label htmlFor="saleActive" className="text-sm font-semibold text-on-surface cursor-pointer">
                  Kích hoạt ngay sau khi tạo
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant bg-surface-container-low/50">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-white rounded-lg border border-transparent hover:border-outline-variant transition-colors shadow-sm">
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Đang lưu...
                  </>
                ) : editId ? 'Cập nhật' : 'Tạo Flash Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
