'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function ForgotPasswordPage() {
  const router = useRouter();
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
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? 'Đã xảy ra lỗi. Vui lòng thử lại.');
      } else {
        setSent(true);
      }
    } catch {
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-background text-on-surface antialiased items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <span className="material-symbols-outlined text-primary text-[28px] fill-1">terminal</span>
          <span className="text-xl font-bold text-primary">TechEnglish Pro</span>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-8">
          {sent ? (
            /* Success state */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px] text-green-600">mark_email_read</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface mb-2">Kiểm tra hộp thư!</h2>
              <p className="text-sm text-on-surface-variant mb-2">
                Nếu email <strong className="text-on-surface">{email}</strong> tồn tại trên hệ thống, bạn sẽ nhận được mã OTP trong vài phút.
              </p>
              <p className="text-xs text-on-surface-variant mb-6">
                Mã OTP có hiệu lực trong <strong>15 phút</strong>. Kiểm tra cả hộp thư Spam nếu không thấy.
              </p>
              <Link
                href={`/reset-password?email=${encodeURIComponent(email)}`}
                className="block w-full h-11 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[18px]">vpn_key</span>
                Nhập mã OTP &amp; đặt lại mật khẩu
              </Link>
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
                  Nhập email đăng ký của bạn. Chúng tôi sẽ gửi mã OTP 6 số để đặt lại mật khẩu.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-[20px]">
                      mail
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline/60"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-error-container text-on-error-container text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !email}
                  className="w-full h-12 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  )}
                  {submitting ? 'Đang gửi...' : 'Gửi mã OTP'}
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
  );
}
