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
  const [lessons, setLessons] = useState<any[]>([]);
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
      apiClient.get<any>('/lessons?limit=100&status=published'),
    ]).then(([meResult, profileResult, progressResult, lessonsResult]) => {
      const me = meResult.status === 'fulfilled' ? (meResult.value?.user ?? meResult.value) : null;
      const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
      const progress = progressResult.status === 'fulfilled' ? progressResult.value : null;
      const lessonsData = lessonsResult.status === 'fulfilled' ? (lessonsResult.value?.data ?? lessonsResult.value ?? []) : [];
      setLessons(Array.isArray(lessonsData) ? lessonsData : []);
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="font-bold text-lg text-on-surface">Lịch sử học tập</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Các bài học bạn đã tham gia và tiến độ hoàn thành.
              </p>
            </div>
            {history.length > 0 && (
              <span className="text-xs font-semibold px-3 py-1 bg-surface-container rounded-full text-on-surface-variant w-fit">
                Tổng cộng: {history.length} bài
              </span>
            )}
          </div>

          {history.length ? (
            <div className="space-y-4">
              {(() => {
                const lessonMap = new Map(lessons.map((l: any) => [l.id, l]));
                return history.map((item, index) => {
                  const lesson = item.lesson || lessonMap.get(item.resourceId);
                  const title = lesson?.title || item.title || (item.resourceType === 'lesson' ? 'Bài học chuyên ngành' : item.resourceType);
                  const domainName = lesson?.domain?.name;
                  const levelName = lesson?.level?.name;
                  const percent = Math.round(item.completionPercent ?? 0);
                  const isCompleted = item.status === 'completed' || percent >= 100;
                  const dateStr = item.updatedAt || item.completedAt || item.startedAt;
                  const lessonId = item.resourceId;

                  return (
                    <div
                      key={item.id ?? index}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-outline-variant/40 bg-surface-bright p-4 hover:border-primary/40 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                          <span className="material-symbols-outlined text-[22px]">
                            {isCompleted ? 'check_circle' : 'play_circle'}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                              {isCompleted ? 'Đã hoàn thành' : 'Đang học'}
                            </span>
                            {domainName && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container text-on-surface-variant border border-outline-variant/40">
                                {domainName}
                              </span>
                            )}
                            {levelName && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container text-on-surface-variant border border-outline-variant/40">
                                {levelName}
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-[15px] text-on-surface truncate" title={title}>
                            {title}
                          </h3>

                          <div className="mt-2 flex items-center gap-3">
                            <div className="w-32 bg-surface-container h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isCompleted ? 'bg-green-600' : 'bg-primary'}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-on-surface-variant">
                              {percent}%
                            </span>
                            {dateStr && (
                              <span className="text-xs text-on-surface-variant/70">
                                • Cập nhật {formatRelativeDate(dateStr)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {item.resourceType === 'lesson' && lessonId && (
                        <div className="flex shrink-0 items-center gap-2 sm:self-center">
                          <Link
                            href={`/learn/lessons/${lessonId}`}
                            className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              isCompleted
                                ? 'border border-outline-variant hover:bg-surface-container text-on-surface'
                                : 'bg-primary text-white hover:opacity-95'
                            }`}
                          >
                            <span>{isCompleted ? 'Xem lại' : 'Học tiếp'}</span>
                            <span className="material-symbols-outlined text-[16px]">
                              {isCompleted ? 'refresh' : 'arrow_forward'}
                            </span>
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-3">
                <span className="material-symbols-outlined text-2xl">menu_book</span>
              </div>
              <p className="text-sm font-semibold text-on-surface">Chưa có lịch sử học tập</p>
              <p className="text-xs text-on-surface-variant mt-1 mb-4">
                Bắt đầu học các bài học chuyên ngành IT để tích lũy kiến thức ngay hôm nay!
              </p>
              <Link
                href="/learn/lessons"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90"
              >
                <span>Khám phá bài học</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          )}
        </section>}
      </div>
    </LearnerShell>
  );
}

function formatRelativeDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return 'hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

function Field({ label, value, onChange, disabled = false }: { label: string; value: string; onChange?: (value: string) => void; disabled?: boolean }) {
  return <label className="text-xs font-semibold">{label}<input value={value} disabled={disabled} onChange={(e) => onChange?.(e.target.value)} className="mt-1 w-full rounded-xl border border-outline-variant/60 bg-surface-bright px-3.5 py-2.5 disabled:cursor-not-allowed disabled:opacity-60" /></label>;
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="text-xs font-semibold">{label}<input type="password" required value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-outline-variant/60 bg-surface-bright px-3.5 py-2.5" /></label>;
}
