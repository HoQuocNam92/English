'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/presentation';

export default function LoginPage() {
  const router = useRouter();
  const { session, loading, submitting, error, submitLogin, signOut } = useAuth();
  const [email, setEmail] = useState('learner1@techenglish.pro');
  const [password, setPassword] = useState('Demo@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const currentRole = useMemo(() => session?.user.role ?? 'guest', [session]);

  // Nếu đã đăng nhập → tự động chuyển thẳng vào trang tương ứng
  useEffect(() => {
    if (!loading && session) {
      const role = session.user.role;
      if (role === 'admin' || role === 'teacher') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/learn');
      }
    }
  }, [session, loading, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const result = await submitLogin({ email, password });
      const role = (result as any)?.user?.role ?? 'learner';
      router.push((role === 'admin' || role === 'teacher') ? '/admin/dashboard' : '/learn');
    } catch {
      // Handled by auth state
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('Demo@123456');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session) return null;

  return (
    <main className="flex min-h-screen w-full bg-background text-on-surface antialiased overflow-hidden">
      {/* Left Section (45% Visual/Brand) */}
      <section className="hidden lg:flex w-[45%] flex-col relative bg-surface-container-low border-r border-outline-variant/30 overflow-hidden">
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col h-full p-8 xl:p-12 justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[32px] fill-1">terminal</span>
              <h1 className="text-2xl font-bold tracking-tight text-primary">TechEnglish Pro</h1>
            </div>
          </div>

          <div className="my-auto max-w-[90%]">
            <h2 className="text-3xl xl:text-4xl font-extrabold text-on-surface mb-4 leading-tight">
              Nền tảng học tiếng Anh chuyên ngành CNTT
            </h2>
            <p className="text-sm xl:text-base text-on-surface-variant max-w-[85%] leading-relaxed">
              Trang bị từ vựng và kỹ năng giao tiếp chuyên sâu dành riêng cho lập trình viên và kỹ sư phần mềm.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-outline">
            <span>© 2026 TechEnglish Pro. Khóa luận tốt nghiệp KLCN028.</span>
          </div>
        </div>

        {/* Illustration Area with Decorative Gradient */}
        <div className="absolute right-0 bottom-0 w-[85%] h-[60%] bg-primary-fixed-dim/20 rounded-tl-[80px] overflow-hidden flex items-end justify-end shadow-[-10px_-10px_30px_rgba(53,37,205,0.03)] border-t border-l border-white/50">
          <div
            className="w-full h-full bg-cover bg-center opacity-85"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAIDhDSUS9gfJAei2cBW1eMp0gr4d_9b0LAn3amQ2PNvJxJ_z-POb6ry3lP_56ZoE5ywrQvDTQrDdTCF3zH52GA7wqAVzXt8Xo1AMomGyWKHB4dsRsBnj_4u1CzMUiG5qgHQEpgSymAmWoSjFUcZEKBvb3ebM6LktcjEJ_431ysp334QCkFZOvRRy47JJFbhz0l_U7cyXwocQEb7yRO0GhxvUyJg_6ewZk9-36fANLz5BciRctpuwc')"
            }}
          />
        </div>

        {/* Abstract decorative blur elements */}
        <div className="absolute top-[20%] right-[10%] w-36 h-36 bg-secondary-fixed/40 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="absolute bottom-[40%] left-[5%] w-52 h-52 bg-tertiary-fixed/30 rounded-full blur-3xl -z-0 pointer-events-none" />
      </section>

      {/* Right Section (55% Login Form) */}
      <section className="w-full lg:w-[55%] flex items-center justify-center bg-surface-container-lowest p-6 md:p-12 lg:p-16 relative">
        {/* Mobile Logo */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[28px] fill-1">terminal</span>
          <span className="text-xl font-bold text-primary">TechEnglish Pro</span>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-[420px] flex flex-col py-8">
          <div className="mb-8 text-left">
            <h2 className="text-2xl lg:text-3xl font-bold text-on-surface mb-2 tracking-tight">Chào mừng trở lại</h2>
            <p className="text-sm text-on-surface-variant">Đăng nhập để quản lý hệ thống học tập</p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {/* Google OAuth Login Button */}
              <button
                type="button"
                onClick={() => {
                  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
                  window.location.href = `${apiBase}/auth/google`;
                }}
                className="w-full h-11 bg-white hover:bg-slate-50 border border-outline-variant text-on-surface font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-3 shadow-2xs cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Đăng nhập bằng Google</span>
              </button>

              <div className="relative flex items-center justify-center my-0.5">
                <div className="border-t border-outline-variant/40 w-full" />
                <span className="bg-surface-container-lowest px-3 text-[11px] text-outline font-semibold absolute uppercase">hoặc Email</span>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-on-surface" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-[20px]">
                    mail
                  </span>
                  <input
                    className="w-full h-12 pl-11 pr-4 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline/70"
                    id="email"
                    name="email"
                    placeholder="learner1@techenglish.pro"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-on-surface" htmlFor="password">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline material-symbols-outlined text-[20px]">
                    lock
                  </span>
                  <input
                    className="w-full h-12 pl-11 pr-11 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline/70"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer flex items-center justify-center"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Form Utilities */}
              <div className="flex items-center justify-between mt-1">
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer accent-primary"
                  />
                  <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
                    Ghi nhớ đăng nhập
                  </span>
                </label>
                <a className="text-xs font-semibold text-primary hover:underline transition-colors" href="#">
                  Quên mật khẩu?
                </a>
              </div>

              {error ? (
                <div className="p-3 rounded-lg bg-error-container text-on-error-container text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{error}</span>
                </div>
              ) : null}

              {/* Submit Button */}
              <button
                className="w-full h-12 bg-primary hover:bg-indigo-700 !text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
                type="submit"
                disabled={submitting || loading}
              >
                <span className="!text-white">{submitting ? 'Đang xác thực...' : 'Đăng nhập'}</span>
                <span className="material-symbols-outlined text-[18px] !text-white group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>

              {/* Quick login helper badges */}
              <div className="mt-2 pt-4 border-t border-outline-variant/30 flex flex-col gap-2">
                <span className="text-xs font-medium text-outline">Đăng nhập nhanh cho bản Demo:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('learner1@techenglish.pro')}
                    className="flex-1 py-1.5 px-2 rounded-md text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-primary border border-indigo-200 transition-colors text-center"
                  >
                    👨‍🎓 Học viên
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@techenglish.pro')}
                    className="flex-1 py-1.5 px-2 rounded-md text-xs font-medium bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40 transition-colors text-center"
                  >
                    👑 Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('nguyen.thanh@techenglish.pro')}
                    className="flex-1 py-1.5 px-2 rounded-md text-xs font-medium bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40 transition-colors text-center"
                  >
                    🎓 Teacher
                  </button>
                </div>
              </div>

              {/* Register Link */}
              <div className="mt-2 pt-4 border-t border-outline-variant/30 text-center">
                <p className="text-sm text-on-surface-variant">
                  Chưa có tài khoản?{' '}
                  <Link href="/register" className="font-bold text-primary hover:underline transition-colors">
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </form>

          {/* Security Note */}
          <div className="mt-8 pt-4 border-t border-outline-variant/30 flex items-center justify-center gap-1.5 text-outline">
            <span className="material-symbols-outlined text-[16px]">shield</span>
            <span className="text-xs">Cổng quản trị bảo mật nội bộ</span>
          </div>
        </div>
      </section>
    </main>
  );
}
