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
    if (!s.isActive) return { label: 'Đã tắt', color: 'bg-slate-100 text-slate-500', icon: 'block' };
    if (new Date(s.endTime) < now) return { label: 'Đã kết thúc', color: 'bg-red-50 text-red-600', icon: 'timer_off' };
    if (new Date(s.startTime) > now) return { label: 'Sắp diễn ra', color: 'bg-amber-50 text-amber-700', icon: 'schedule' };
    return { label: 'Đang diễn ra', color: 'bg-green-50 text-green-700', icon: 'bolt' };
  };

  const getDiscountedPrice = (s: FlashSale) => {
    const base = PLAN_PRICES[s.planId];
    if (!base) return null;
    return Math.floor(base * (1 - s.discountPercent / 100));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-amber-500">flash_on</span>
            Flash Sale
          </h1>
          <p className="text-sm text-slate-500 mt-1">{total} chương trình trong hệ thống</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary !text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px] !text-white">add</span>
          Tạo Flash Sale
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên chương trình</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Gói</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Giảm giá</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Đang tải...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Chưa có Flash Sale nào.</td></tr>
              ) : sales.map((s) => {
                const status = getSaleStatus(s);
                const discountedPrice = getDiscountedPrice(s);
                const basePrice = PLAN_PRICES[s.planId];
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{s.title}</div>
                      {s.description && (
                        <div className="text-xs text-slate-400 truncate max-w-[200px]">{s.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        {PLAN_LABELS[s.planId] ?? s.planId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-lg font-black text-amber-600">{s.discountPercent}%</span>
                      {basePrice && discountedPrice !== null && (
                        <div className="text-xs">
                          <span className="line-through text-slate-400">{basePrice.toLocaleString('vi-VN')}đ</span>
                          <span className="text-green-600 font-bold ml-1">{discountedPrice.toLocaleString('vi-VN')}đ</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      <div>{new Date(s.startTime).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</div>
                      <div className="text-slate-400">→ {new Date(s.endTime).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${status.color}`}>
                        <span className="material-symbols-outlined text-[13px]">{status.icon}</span>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary transition-colors" title="Chỉnh sửa">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleToggle(s)}
                          className={`p-1.5 rounded-lg transition-colors ${s.isActive ? 'hover:bg-red-50 text-slate-500 hover:text-red-600' : 'hover:bg-green-50 text-slate-500 hover:text-green-600'}`}
                          title={s.isActive ? 'Tắt Flash Sale' : 'Bật Flash Sale'}
                        >
                          <span className="material-symbols-outlined text-[18px]">{s.isActive ? 'toggle_off' : 'toggle_on'}</span>
                        </button>
                        <button onClick={() => handleDelete(s)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors" title="Xóa">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">flash_on</span>
                {editId ? 'Chỉnh sửa Flash Sale' : 'Tạo Flash Sale mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên chương trình *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="VD: Flash Sale Tháng 9"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả ngắn</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Ưu đãi đặc biệt chỉ trong 24h"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gói áp dụng *</label>
                  <select
                    value={form.planId}
                    onChange={(e) => setForm(f => ({ ...f, planId: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {Object.entries(PLAN_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v} — {PLAN_PRICES[k]?.toLocaleString('vi-VN')}đ</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">% Giảm giá (1–99) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.discountPercent}
                      onChange={(e) => setForm(f => ({ ...f, discountPercent: Number(e.target.value) }))}
                      min={1} max={99}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    {PLAN_PRICES[form.planId] && (
                      <p className="text-xs text-green-600 font-bold mt-1">
                        → {Math.floor(PLAN_PRICES[form.planId] * (1 - form.discountPercent / 100)).toLocaleString('vi-VN')}đ
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian bắt đầu *</label>
                  <input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) => setForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian kết thúc *</label>
                  <input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="saleActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="saleActive" className="text-sm font-semibold text-slate-700">
                  Kích hoạt ngay sau khi tạo
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-primary !text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Tạo Flash Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
