'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/shared/layout/AppShell';
import { apiClient } from '@/shared/api/api-client';

interface Voucher {
  id: string;
  code: string;
  name: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = {
  code: '',
  name: '',
  discountType: 'percentage' as 'percentage' | 'fixed',
  discountValue: 0,
  minOrderAmount: 0,
  maxDiscountAmount: '',
  usageLimit: '',
  startDate: '',
  endDate: '',
  isActive: true,
};

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const loadVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>(`/vouchers?limit=50${search ? `&search=${search}` : ''}`);
      setVouchers(res?.data ?? res ?? []);
      setTotal(res?.meta?.total ?? (res?.data ?? res ?? []).length);
    } catch {
      setError('Không thể tải danh sách voucher.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { loadVouchers(); }, [loadVouchers]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (v: Voucher) => {
    setEditId(v.id);
    setForm({
      code: v.code,
      name: v.name,
      discountType: v.discountType,
      discountValue: v.discountValue,
      minOrderAmount: v.minOrderAmount,
      maxDiscountAmount: v.maxDiscountAmount?.toString() ?? '',
      usageLimit: v.usageLimit?.toString() ?? '',
      startDate: v.startDate ? v.startDate.slice(0, 16) : '',
      endDate: v.endDate ? v.endDate.slice(0, 16) : '',
      isActive: v.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      };
      if (editId) {
        await apiClient.patch(`/vouchers/${editId}`, payload);
      } else {
        await apiClient.post('/vouchers', payload);
      }
      setShowModal(false);
      await loadVouchers();
    } catch (err: any) {
      alert(err.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (v: Voucher) => {
    try {
      await apiClient.patch(`/vouchers/${v.id}/toggle`, {});
      await loadVouchers();
    } catch (err: any) {
      alert(err.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (v: Voucher) => {
    if (!confirm(`Xóa voucher "${v.code}"?`)) return;
    try {
      await apiClient.delete(`/vouchers/${v.id}`);
      await loadVouchers();
    } catch (err: any) {
      alert(err.message || 'Xóa thất bại');
    }
  };

  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Mã giảm giá (Voucher)
          </h1>
          <p className="text-sm text-slate-500 mt-1">{total} voucher trong hệ thống</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tạo Voucher
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã hoặc tên..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Table */}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Mã</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Giảm giá</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Lượt dùng</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Hiệu lực</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Đang tải...</td></tr>
              ) : vouchers.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Chưa có voucher nào.</td></tr>
              ) : vouchers.map((v) => {
                const isExpired = new Date(v.endDate) < now;
                const isNotStarted = new Date(v.startDate) > now;
                return (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-primary bg-indigo-50 px-2 py-0.5 rounded text-xs">
                        {v.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{v.name}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900">
                        {v.discountType === 'percentage'
                          ? `${v.discountValue}%`
                          : `${v.discountValue.toLocaleString('vi-VN')}đ`}
                      </span>
                      {v.maxDiscountAmount && (
                        <span className="text-xs text-slate-400 block">tối đa {v.maxDiscountAmount.toLocaleString('vi-VN')}đ</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {v.usedCount}
                      {v.usageLimit && <span className="text-slate-400">/{v.usageLimit}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      <div>{new Date(v.startDate).toLocaleDateString('vi-VN')}</div>
                      <div>→ {new Date(v.endDate).toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        !v.isActive ? 'bg-slate-100 text-slate-500'
                          : isExpired ? 'bg-red-50 text-red-600'
                          : isNotStarted ? 'bg-amber-50 text-amber-700'
                          : 'bg-green-50 text-green-700'
                      }`}>
                        <span className="material-symbols-outlined text-[13px]">
                          {!v.isActive ? 'block' : isExpired ? 'timer_off' : isNotStarted ? 'schedule' : 'check_circle'}
                        </span>
                        {!v.isActive ? 'Đã tắt' : isExpired ? 'Hết hạn' : isNotStarted ? 'Chưa bắt đầu' : 'Đang hoạt động'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(v)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary transition-colors"
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleToggle(v)}
                          className={`p-1.5 rounded-lg transition-colors ${v.isActive ? 'hover:bg-red-50 text-slate-500 hover:text-red-600' : 'hover:bg-green-50 text-slate-500 hover:text-green-600'}`}
                          title={v.isActive ? 'Tắt voucher' : 'Bật voucher'}
                        >
                          <span className="material-symbols-outlined text-[18px]">{v.isActive ? 'toggle_off' : 'toggle_on'}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(v)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                          title="Xóa"
                        >
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                {editId ? 'Chỉnh sửa Voucher' : 'Tạo Voucher mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mã Voucher *</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    disabled={!!editId}
                    placeholder="VD: SUMMER30"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên hiển thị *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="VD: Giảm 30% mùa hè"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Loại giảm giá *</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm(f => ({ ...f, discountType: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Giá trị giảm * {form.discountType === 'percentage' ? '(%)' : '(VNĐ)'}
                  </label>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={(e) => setForm(f => ({ ...f, discountValue: Number(e.target.value) }))}
                    min={1}
                    max={form.discountType === 'percentage' ? 100 : undefined}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Đơn hàng tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm(f => ({ ...f, minOrderAmount: Number(e.target.value) }))}
                    min={0}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giảm tối đa (VNĐ)</label>
                  <input
                    type="number"
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm(f => ({ ...f, maxDiscountAmount: e.target.value }))}
                    min={0}
                    placeholder="Không giới hạn"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Giới hạn lượt dùng</label>
                <input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                  min={1}
                  placeholder="Không giới hạn"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày bắt đầu *</label>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày kết thúc *</label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">
                  Kích hoạt ngay sau khi tạo
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Tạo Voucher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
