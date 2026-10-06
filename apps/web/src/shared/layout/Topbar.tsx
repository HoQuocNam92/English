'use client';
import { AppIcon } from '@/shared/ui/AppIcon';

import Link from 'next/link';
import * as React from 'react';
import { useAuth } from '@/features/auth/presentation';
import { apiClient } from '@/shared/api/api-client';

export interface TopbarProps {
  onToggleMobileMenu?: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export function Topbar({ onToggleMobileMenu }: TopbarProps) {
  const { session, signOut } = useAuth();
  const [passwordOpen, setPasswordOpen] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = React.useState('');
  const [passwordSaving, setPasswordSaving] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const submitPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
    }
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới.';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
    } else if (passwordForm.currentPassword && passwordForm.newPassword === passwordForm.currentPassword) {
      newErrors.newPassword = 'Mật khẩu mới không được trùng với mật khẩu hiện tại.';
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.';
    } else if (passwordForm.newPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu mới không khớp.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});
    setPasswordSaving(true);
    setPasswordMessage('');
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMessage('');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setFieldErrors({});
      setPasswordOpen(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Không thể đổi mật khẩu.';
      const lower = msg.toLowerCase();
      if (
        lower.includes('hiện tại') ||
        lower.includes('current password') ||
        lower.includes('mật khẩu không đúng') ||
        lower.includes('mật khẩu không chính xác') ||
        lower.includes('sai mật khẩu')
      ) {
        setFieldErrors({ currentPassword: msg });
      } else if (lower.includes('mật khẩu mới') || lower.includes('new password')) {
        setFieldErrors({ newPassword: msg });
      } else if (lower.includes('xác nhận') || lower.includes('confirm')) {
        setFieldErrors({ confirmPassword: msg });
      } else {
        setPasswordMessage(msg);
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <>
    <header className="h-14 border-b border-outline-variant/50 bg-surface-container-lowest/95 backdrop-blur flex justify-between items-center w-full px-4 sm:px-8 z-30 shrink-0">
      {/* Mobile navigation */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger + brand */}
        <div className="flex items-center gap-2.5 md:hidden">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Mở menu"
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <AppIcon className=" text-[24px]">menu</AppIcon>
          </button>
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary text-white flex items-center justify-center shadow-xs">
              <AppIcon className=" text-[17px] ">terminal</AppIcon>
            </div>
            <span className="font-bold text-primary text-sm">TechEnglish Pro</span>
          </Link>
        </div>

      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {session?.user?.displayName ? session.user.displayName.charAt(0) : 'A'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-on-surface leading-tight">
              {session?.user?.displayName ?? 'Người dùng'}
            </p>
            <p className="text-[10px] text-on-surface-variant leading-tight capitalize">
              {session?.user?.role === 'admin' ? 'Quản trị viên' : session?.user?.role === 'teacher' ? 'Giảng viên' : 'Người học'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setPasswordMessage(''); setPasswordOpen(true); }}
            title="Đổi mật khẩu"
            aria-label="Đổi mật khẩu"
            className="rounded-lg p-2 text-on-surface-variant transition-all hover:bg-surface-container-high hover:text-primary"
          >
            <AppIcon className=" text-[18px]">key</AppIcon>
          </button>
          <button
            type="button"
            onClick={signOut}
            title="Đăng xuất"
            aria-label="Đăng xuất"
            className="p-2 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-error-container/20 transition-all cursor-pointer shrink-0 ml-1"
          >
            <AppIcon className=" text-[18px]">logout</AppIcon>
          </button>
        </div>
      </div>
    </header>
      {passwordOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4" role="presentation" onMouseDown={() => setPasswordOpen(false)}>
          <section className="w-full max-w-md rounded-2xl border border-outline-variant bg-white p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="change-password-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div><h2 id="change-password-title" className="text-xl font-bold text-on-surface">Đổi mật khẩu</h2><p className="mt-1 text-sm text-on-surface-variant">Cập nhật mật khẩu đăng nhập của tài khoản hiện tại.</p></div>
              <button type="button" aria-label="Đóng" onClick={() => setPasswordOpen(false)} className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low"><AppIcon className="">close</AppIcon></button>
            </div>
            <form onSubmit={submitPassword} noValidate className="mt-5 space-y-4">
              {[
                ['currentPassword', 'Mật khẩu hiện tại'],
                ['newPassword', 'Mật khẩu mới'],
                ['confirmPassword', 'Xác nhận mật khẩu mới'],
              ].map(([name, label]) => {
                const err = fieldErrors[name];
                return (
                  <div key={name} className="space-y-1">
                    <label className="block text-sm font-semibold text-on-surface">
                      {label}
                      <input
                        type="password"
                        value={passwordForm[name as keyof typeof passwordForm]}
                        onChange={(event) => {
                          setPasswordForm((current) => ({ ...current, [name]: event.target.value }));
                          if (fieldErrors[name]) setFieldErrors((current) => ({ ...current, [name]: '' }));
                        }}
                        className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition-colors ${
                          err
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/15'
                        }`}
                      />
                    </label>
                    {err && (
                      <p className="flex items-center gap-1 text-xs font-medium text-red-600">
                        <AppIcon className="text-[14px]">error</AppIcon>
                        <span>{err}</span>
                      </p>
                    )}
                  </div>
                );
              })}
              {passwordMessage ? <p role="status" className={`rounded-xl px-3 py-2 text-sm ${passwordMessage.includes('thành công') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{passwordMessage}</p> : null}
              <div className="flex justify-end gap-2 pt-1"><button type="button" onClick={() => setPasswordOpen(false)} className="h-10 rounded-xl border border-outline-variant px-4 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low">Hủy</button><button type="submit" disabled={passwordSaving} className="h-10 rounded-xl bg-primary px-4 text-sm font-bold text-white disabled:opacity-60">{passwordSaving ? 'Đang lưu...' : 'Cập nhật mật khẩu'}</button></div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
