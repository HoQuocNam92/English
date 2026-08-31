'use client';

import { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';

export default function LearnerProfileSettingsPage() {
  const [formData, setFormData] = useState({ displayName: '', email: '', phoneNumber: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadMe() {
      try {
        const res: any = await apiClient.get('/auth/me');
        const user = res?.user || res;
        setFormData({
          displayName: user.displayName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          bio: user.bio || ''
        });
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    loadMe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await apiClient.patch('/users/me', {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio
      });
      setSuccess('Đã cập nhật hồ sơ thành công!');
      alert('Đã cập nhật hồ sơ thành công!');
    } catch (err: any) {
      setError(err.message || 'Validation error or server error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LearnerShell><div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div></LearnerShell>;

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-12">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Hồ sơ Học viên</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Quản lý thông tin cá nhân của bạn.
          </p>
        </div>

        {/* Profile Info Card */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary font-black text-2xl flex items-center justify-center shadow-xs">
            {formData.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-on-surface">{formData.displayName}</h3>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">{formData.email}</p>
          </div>
        </div>

        {/* Form Settings */}
        <form onSubmit={handleSave} className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-on-surface">Thông tin cá nhân</h3>
          
          {error && <div className="p-3 bg-red-100 text-red-700 text-xs rounded">{error}</div>}
          {success && <div className="p-3 bg-green-100 text-green-700 text-xs rounded">{success}</div>}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface">Họ và tên</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container text-xs text-outline outline-none cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface">Số điện thoại</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface">Giới thiệu (Bio)</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary font-medium"
              rows={3}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary hover:bg-primary-container disabled:opacity-50 text-on-primary font-bold text-xs rounded-xl transition-colors shadow-2xs"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </LearnerShell>
  );
}
