'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useAuth } from '@/features/auth/presentation';

type ProfileTab = 'info' | 'history';

export default function LearnerProfilePage() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ displayName: '', email: '', phoneNumber: '', bio: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    Promise.allSettled([
      apiClient.get<any>('/auth/me'),
      apiClient.get<any>('/learner-profiles/me'),
      apiClient.get<any>('/progress/me'),
    ]).then(([meResult, profileResult, progressResult]) => {
      const me = meResult.status === 'fulfilled' ? (meResult.value?.user ?? meResult.value) : null;
      const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
      const progress = progressResult.status === 'fulfilled' ? progressResult.value : null;
      setForm({
        displayName: me?.displayName ?? me?.name ?? '',
        email: me?.email ?? '',
        phoneNumber: me?.phoneNumber ?? me?.phone ?? '',
        bio: me?.bio ?? profile?.bio ?? '',
      });
      const items = progress?.history ?? progress?.progress ?? [];
      setHistory(Array.isArray(items) ? items : []);
    }).finally(() => setLoading(false));
  }, []);

  async function saveInfo(event: React.FormEvent) {
    event.preventDefault();
    setSavingInfo(true); setMessage(''); setError('');
    try {
      await apiClient.patch('/users/me', {
        displayName: form.displayName,
        phoneNumber: form.phoneNumber,
        bio: form.bio,
      });
      setMessage('Cập nhật hồ sơ thành công.');
    } catch (cause: any) {
      setError(cause?.message || 'Không thể cập nhật hồ sơ.');
    } finally { setSavingInfo(false); }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setMessage(''); setError('');
    if (password.newPassword.length < 6) return setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
    if (password.newPassword !== password.confirmPassword) return setError('Xác nhận mật khẩu không khớp.');
    setSavingPassword(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Đổi mật khẩu thành công.');
    } catch (cause: any) {
      setError(cause?.message || 'Không thể đổi mật khẩu.');
    } finally { setSavingPassword(false); }
  }

  if (loading) return <LearnerShell><div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div></LearnerShell>;

  const displayName = form.displayName || 'Học viên';
  return (
    <LearnerShell>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-16">
        <section className="flex flex-col justify-between gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-2xs md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-white">{displayName.charAt(0).toUpperCase()}</div>
            <div><h1 className="text-xl font-bold text-on-surface">{displayName}</h1><p className="mt-1 text-xs text-on-surface-variant">{form.email}</p></div>
          </div>
          <div className="flex gap-3">
            <Link href="/learn/lessons" className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold !text-white">Tiếp tục học</Link>
            <button type="button" onClick={signOut} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700">Đăng xuất</button>
          </div>
        </section>

        <div className="flex gap-2 border-b border-outline-variant/30 pb-2">
          <button onClick={() => setActiveTab('info')} className={`rounded-xl px-4 py-2 text-xs font-bold ${activeTab === 'info' ? 'bg-primary text-white' : 'text-on-surface-variant'}`}>Hồ sơ cá nhân</button>
          <button onClick={() => setActiveTab('history')} className={`rounded-xl px-4 py-2 text-xs font-bold ${activeTab === 'history' ? 'bg-primary text-white' : 'text-on-surface-variant'}`}>Lịch sử học tập</button>
        </div>

        {message && <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">{message}</p>}
        {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

        {activeTab === 'info' ? <div className="space-y-6">
          <form onSubmit={saveInfo} className="space-y-5 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
            <h2 className="font-bold text-on-surface">Chỉnh sửa thông tin</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tên hiển thị" value={form.displayName} onChange={(displayName) => setForm({ ...form, displayName })} />
              <Field label="Email" value={form.email} disabled />
              <Field label="Số điện thoại" value={form.phoneNumber} onChange={(phoneNumber) => setForm({ ...form, phoneNumber })} />
            </div>
            <label className="block text-xs font-semibold">Giới thiệu<textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="mt-1 w-full rounded-xl border border-outline-variant/60 bg-surface-bright px-3.5 py-2.5" /></label>
            <div className="flex justify-end"><button disabled={savingInfo} className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white disabled:opacity-50">{savingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}</button></div>
          </form>
          <form onSubmit={changePassword} className="space-y-4 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
            <h2 className="font-bold text-on-surface">Đổi mật khẩu</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <PasswordField label="Mật khẩu hiện tại" value={password.currentPassword} onChange={(currentPassword) => setPassword({ ...password, currentPassword })} />
              <PasswordField label="Mật khẩu mới" value={password.newPassword} onChange={(newPassword) => setPassword({ ...password, newPassword })} />
              <PasswordField label="Xác nhận mật khẩu" value={password.confirmPassword} onChange={(confirmPassword) => setPassword({ ...password, confirmPassword })} />
            </div>
            <div className="flex justify-end"><button disabled={savingPassword} className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white disabled:opacity-50">{savingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</button></div>
          </form>
        </div> : <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
          <h2 className="mb-4 font-bold text-on-surface">Lịch sử học tập</h2>
          {history.length ? <div className="space-y-3">{history.map((item, index) => <div key={item.id ?? index} className="rounded-xl border border-outline-variant/30 p-4"><p className="font-semibold">{item.title ?? item.resourceType ?? 'Nội dung học tập'}</p><p className="mt-1 text-xs text-on-surface-variant">Tiến độ: {Math.round(item.completionPercent ?? 0)}%</p></div>)}</div> : <p className="text-sm text-on-surface-variant">Chưa có lịch sử học tập.</p>}
        </section>}
      </div>
    </LearnerShell>
  );
}

function Field({ label, value, onChange, disabled = false }: { label: string; value: string; onChange?: (value: string) => void; disabled?: boolean }) {
  return <label className="text-xs font-semibold">{label}<input value={value} disabled={disabled} onChange={(e) => onChange?.(e.target.value)} className="mt-1 w-full rounded-xl border border-outline-variant/60 bg-surface-bright px-3.5 py-2.5 disabled:cursor-not-allowed disabled:opacity-60" /></label>;
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-xs font-semibold">{label}<input type="password" required value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-outline-variant/60 bg-surface-bright px-3.5 py-2.5" /></label>;
}
