'use client';

import { useState, useEffect, useCallback } from 'react';
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight mb-1">
            Mã giảm giá (Voucher)
          </h1>
          <p className="text-sm text-on-surface-variant">{total} voucher trong hệ thống</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tạo Voucher
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã hoặc tên..."
            className="w-full pl-11 pr-4 py-2.5 text-sm border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-on-surface"
          />
        </div>
      </div>

      {/* Table */}
      {error && <div className="p-4 rounded-xl bg-error-container text-on-error-container text-sm font-semibold border border-error/20">{error}</div>}
      <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="text-left px-5 py-4 font-semibold text-on-surface-variant">Mã</th>
                <th className="text-left px-5 py-4 font-semibold text-on-surface-variant">Tên</th>
                <th className="text-left px-5 py-4 font-semibold text-on-surface-variant">Giảm giá</th>
                <th className="text-left px-5 py-4 font-semibold text-on-surface-variant">Lượt dùng</th>
                <th className="text-left px-5 py-4 font-semibold text-on-surface-variant">Hiệu lực</th>
                <th className="text-left px-5 py-4 font-semibold text-on-surface-variant">Trạng thái</th>
                <th className="text-right px-5 py-4 font-semibold text-on-surface-variant">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-on-surface-variant font-medium">Đang tải...</td></tr>
              ) : vouchers.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-on-surface-variant font-medium">Chưa có voucher nào.</td></tr>
              ) : vouchers.map((v) => {
                const isExpired = new Date(v.endDate) < now;
                const isNotStarted = new Date(v.startDate) > now;
                return (
                  <tr key={v.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md text-sm border border-primary/20">
                        {v.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-on-surface font-semibold">{v.name}</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-on-surface text-base">
                        {v.discountType === 'percentage'
                          ? `${v.discountValue}%`
                          : `${v.discountValue.toLocaleString('vi-VN')}đ`}
                      </div>
                      {v.maxDiscountAmount && (
                        <div className="text-xs text-on-surface-variant mt-1">tối đa {v.maxDiscountAmount.toLocaleString('vi-VN')}đ</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-on-surface font-medium">
                      {v.usedCount}
                      {v.usageLimit && <span className="text-on-surface-variant"> / {v.usageLimit}</span>}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-on-surface-variant space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        {new Date(v.startDate).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        {new Date(v.endDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        !v.isActive ? 'bg-surface-container-low text-on-surface-variant border border-outline-variant'
                          : isExpired ? 'bg-error-container text-on-error-container border border-error/20'
                          : isNotStarted ? 'bg-[#fff8e1] text-[#f57f17] border border-[#ffe082]'
                          : 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]'
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {!v.isActive ? 'block' : isExpired ? 'timer_off' : isNotStarted ? 'schedule' : 'check_circle'}
                        </span>
                        {!v.isActive ? 'Đã tắt' : isExpired ? 'Hết hạn' : isNotStarted ? 'Chưa bắt đầu' : 'Đang hoạt động'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(v)}
                          className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors border border-transparent hover:border-outline-variant"
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleToggle(v)}
                          className={`p-2 rounded-lg transition-colors border border-transparent hover:border-outline-variant ${v.isActive ? 'hover:bg-error-container text-on-surface-variant hover:text-error' : 'hover:bg-[#e6f4ea] text-on-surface-variant hover:text-[#137333]'}`}
                          title={v.isActive ? 'Tắt voucher' : 'Bật voucher'}
                        >
                          <span className="material-symbols-outlined text-[18px]">{v.isActive ? 'toggle_off' : 'toggle_on'}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(v)}
                          className="p-2 rounded-lg hover:bg-error-container text-on-surface-variant hover:text-error transition-colors border border-transparent hover:border-outline-variant"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-outline-variant">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-container-low/50">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">local_offer</span>
                {editId ? 'Chỉnh sửa Voucher' : 'Tạo Voucher mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-surface-container-low rounded-lg text-on-surface-variant transition-colors border border-transparent hover:border-outline-variant">
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Mã Voucher <span className="text-error">*</span></label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    disabled={!!editId}
                    placeholder="VD: SUMMER30"
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:bg-surface-container-low disabled:text-on-surface-variant font-mono text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Tên hiển thị <span className="text-error">*</span></label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="VD: Giảm 30% mùa hè"
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Loại giảm giá <span className="text-error">*</span></label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm(f => ({ ...f, discountType: e.target.value as any }))}
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface bg-white"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">
                    Giá trị giảm <span className="text-error">*</span> {form.discountType === 'percentage' ? '(%)' : '(VNĐ)'}
                  </label>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={(e) => setForm(f => ({ ...f, discountValue: Number(e.target.value) }))}
                    min={1}
                    max={form.discountType === 'percentage' ? 100 : undefined}
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Đơn hàng tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm(f => ({ ...f, minOrderAmount: Number(e.target.value) }))}
                    min={0}
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Giảm tối đa (VNĐ)</label>
                  <input
                    type="number"
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm(f => ({ ...f, maxDiscountAmount: e.target.value }))}
                    min={0}
                    placeholder="Không giới hạn"
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">Giới hạn lượt dùng</label>
                <input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                  min={1}
                  placeholder="Không giới hạn"
                  className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Ngày bắt đầu <span className="text-error">*</span></label>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Ngày kết thúc <span className="text-error">*</span></label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-on-surface cursor-pointer">
                  Kích hoạt ngay sau khi tạo
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant bg-surface-container-low/50">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-white rounded-lg border border-transparent hover:border-outline-variant transition-colors shadow-sm"
              >
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
                ) : editId ? 'Cập nhật' : 'Tạo Voucher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
