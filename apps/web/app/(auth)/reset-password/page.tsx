'use client';
import { showToast } from '@/shared/ui/AppFeedback';
import { IconText, AppIcon } from '@/shared/ui/AppIcon';

import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { PublicHeader } from '@/shared/layout/PublicHeader';
import { Footer } from '@/shared/layout/Footer';
import { API_BASE_URL } from '@/shared/config/env';
import { toVietnameseErrorMessage } from '@/shared/lib/error-message';

const API_URL = API_BASE_URL;

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [linkStatus, setLinkStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLinkStatus('checking');
    if (!/^[a-f0-9]{64}$/.test(token)) {
      setError('Liên kết đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu liên kết mới.');
      setLinkStatus('invalid');
      return;
    }
    fetch(`${API_URL}/auth/validate-password-reset`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }),
    }).then(async res => {
      const data = await res.json();
      if (!active) return;
      if (res.ok && data.valid === true) { setLinkStatus('valid'); setError(''); }
      else { setLinkStatus('invalid'); setError(toVietnameseErrorMessage(data?.message, res.status)); }
    }).catch(() => {
      if (active) { setLinkStatus('invalid'); setError('Không thể kiểm tra liên kết. Vui lòng tải lại trang.'); }
    });
    return () => { active = false; };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (linkStatus !== 'valid' || !/^[a-f0-9]{64}$/.test(token)) return;

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 72) {
      setError('Mật khẩu phải có từ 6 đến 72 ký tự');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(toVietnameseErrorMessage(data?.message, res.status));
      } else {
        setSuccess(true); showToast('Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.', 'success');
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch {
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-on-surface">
      <PublicHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-[420px]">
        <div className="bg-white border border-outline-variant/40 rounded-2xl p-8">
          {success ? (
            /* Success state */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AppIcon className=" text-[32px] text-green-600">check_circle</AppIcon>
              </div>
              <h2 className="text-xl font-bold text-on-surface mb-2">Đặt lại thành công!</h2>
              <p className="text-sm text-on-surface-variant mb-4">
                Mật khẩu của bạn đã được đặt lại. Đang chuyển về trang đăng nhập...
              </p>
              <div className="flex justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <Link
                href="/login"
                className="mt-4 block text-sm font-semibold text-primary hover:underline"
              >
                <IconText>{"\n                Đăng nhập ngay →\n              "}</IconText></Link>
            </div>
          ) : linkStatus === 'checking' ? (
            <p role="status" className="text-sm text-on-surface-variant">Đang kiểm tra liên kết...</p>
          ) : linkStatus === 'invalid' ? (
            <div><h1 className="text-xl font-bold">Không thể đặt lại mật khẩu</h1><p role="alert" className="mt-4 text-sm text-red-700">{error}</p><Link href="/forgot-password" className="mt-5 inline-block font-semibold text-primary">Yêu cầu liên kết mới</Link></div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-on-surface mb-1">Đặt lại mật khẩu</h2>
                <p className="text-sm text-on-surface-variant">
                  Liên kết đã được xác nhận. Nhập mật khẩu mới để hoàn tất.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="newPassword">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <AppIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline  text-[20px]">
                      lock
                    </AppIcon>
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mật khẩu mới"
                      required
                      minLength={6}
                      maxLength={72}
                      className="w-full h-12 pl-11 pr-11 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="absolute right-1 top-0 !h-full w-10 !p-0 flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Tối thiểu 6 ký tự (nên chứa chữ hoa, chữ số và ký tự đặc biệt).
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="confirmPassword">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <AppIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline  text-[20px]">
                      lock_reset
                    </AppIcon>
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      required
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline/60"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-error-container text-on-error-container text-xs flex items-start gap-2">
                    <AppIcon className=" text-[16px] shrink-0 mt-0.5">error</AppIcon>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || linkStatus !== 'valid' || newPassword.length < 6 || newPassword.length > 72 || newPassword !== confirmPassword}
                  className="w-full h-12 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <AppIcon className="animate-spin  text-[18px]">progress_activity</AppIcon>
                  ) : (
                    <AppIcon className=" text-[18px]">vpn_key</AppIcon>
                  )}
                  {submitting ? 'Đang xác thực...' : 'Đặt lại mật khẩu'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link
                  href="/forgot-password"
                  className="text-xs text-on-surface-variant hover:text-primary transition-colors underline"
                >
                  Yêu cầu liên kết mới
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Nhớ mật khẩu rồi?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
