'use client';
import { showToast } from '@/shared/ui/AppFeedback';
import { AppIcon } from '@/shared/ui/AppIcon';

import Link from 'next/link';
import { PublicHeader } from '@/shared/layout/PublicHeader';
import { Footer } from '@/shared/layout/Footer';
import { useState } from 'react';
import { API_BASE_URL } from '@/shared/config/env';
import { toVietnameseErrorMessage } from '@/shared/lib/error-message';

const API_URL = API_BASE_URL;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(toVietnameseErrorMessage(data?.message, res.status));
      } else if (data?.resetLinkSent === true) {
        setSent(true); showToast('Liên kết đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.', 'success');
      } else {
        setError('Máy chủ chưa xác nhận gửi liên kết. Vui lòng thử lại sau khi backend được cập nhật.');
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
          {sent ? (
            /* Success state */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AppIcon className=" text-[32px] text-green-600">mark_email_read</AppIcon>
              </div>
              <h2 className="text-xl font-bold text-on-surface mb-2">Kiểm tra hộp thư!</h2>
              <p className="text-sm text-on-surface-variant mb-2">
                Liên kết đã được gửi đến <strong className="text-on-surface">{email}</strong>.
              </p>
              <p className="text-xs text-on-surface-variant mb-6">
                Liên kết có hiệu lực trong <strong>15 phút</strong>. Kiểm tra cả hộp thư Spam nếu không thấy.
              </p>

              <button
                type="button"
                onClick={() => { setSent(false); setEmail(''); }}
                className="mt-3 text-xs text-on-surface-variant hover:text-primary transition-colors underline"
              >
                Gửi lại về email khác
              </button>
            </div>
          ) : (
            /* Email input form */
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-on-surface mb-1">Quên mật khẩu?</h2>
                <p className="text-sm text-on-surface-variant">
                  Nhập email đăng ký của bạn. Chúng tôi sẽ gửi liên kết để bạn đặt lại mật khẩu.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <AppIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline  text-[20px]">
                      mail
                    </AppIcon>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline/60"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-error-container text-on-error-container text-xs flex items-center gap-2">
                    <AppIcon className=" text-[16px]">error</AppIcon>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !email}
                  className="w-full h-12 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <AppIcon className="animate-spin  text-[18px]">progress_activity</AppIcon>
                  ) : (
                    <AppIcon className=" text-[18px]">send</AppIcon>
                  )}
                  {submitting ? 'Đang gửi...' : 'Gửi liên kết'}
                </button>
              </form>
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
