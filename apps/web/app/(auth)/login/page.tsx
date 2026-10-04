'use client';
import { AppIcon } from '@/shared/ui/AppIcon';

import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/presentation';
import { API_BASE_URL } from '@/shared/config/env';

export default function LoginPage() {
  const router = useRouter();
  const { session, loading, submitting, error, submitLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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
      const result = await submitLogin({ email, password, rememberMe });
      const role = (result as any)?.user?.role ?? 'learner';
      router.push((role === 'admin' || role === 'teacher') ? '/admin/dashboard' : '/learn');
    } catch {
      // Handled by auth state
    }
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
    <div className="flex min-h-screen flex-col bg-white text-on-surface">
      <main className="flex flex-1 w-full bg-background antialiased overflow-hidden">
      {/* Left Section (45% Visual/Brand) */}
      <section className="hidden lg:flex w-[45%] flex-col relative bg-surface-container-low border-r border-outline-variant/30 overflow-hidden">
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col h-full p-8 xl:p-12">

          <div className="mt-8 max-w-[90%] xl:mt-12">
            <h2 className="text-3xl xl:text-4xl font-extrabold text-on-surface mb-4 leading-tight">
              Nền tảng học tiếng Anh chuyên ngành CNTT
            </h2>
            <p className="text-sm xl:text-base text-on-surface-variant max-w-[85%] leading-relaxed">
              Trang bị từ vựng và kỹ năng giao tiếp chuyên sâu dành riêng cho lập trình viên và kỹ sư phần mềm.
            </p>
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
        {/* Form Container */}
        <div className="w-full max-w-[420px] flex flex-col py-8">
          <Link href="/" className="mb-6 inline-flex w-fit items-center gap-2 rounded-lg py-2 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary"><span aria-hidden="true">←</span>Quay lại trang chủ</Link>
          <div className="mb-8 text-left">
            <h2 className="text-2xl lg:text-3xl font-bold text-on-surface mb-2 tracking-tight">Chào mừng trở lại</h2>
            <p className="text-sm text-on-surface-variant">Đăng nhập để quản lý hệ thống học tập</p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <AppIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline  text-[20px]">
                  mail
                </AppIcon>
                <input
                  className="w-full h-12 pl-11 pr-4 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline/70"
                  id="email"
                  name="email"
                  autoComplete="username"
                  placeholder="email@example.com"
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
                <AppIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline  text-[20px]">
                  lock
                </AppIcon>
                <input
                  className="w-full h-12 pl-11 pr-11 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline/70"
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  className="absolute right-1 top-0 !h-full w-10 !p-0 flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
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
                  Duy trì đăng nhập
                </span>
              </label>
              <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline transition-colors">
                Quên mật khẩu?
              </Link>
            </div>

            {error ? (
              <div role="alert" aria-live="polite" className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-800 flex items-start gap-3 shadow-sm">
                <AppIcon className=" flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-[19px] text-red-600">error</AppIcon>
                <div>
                  <p className="text-sm font-bold">Đăng nhập không thành công</p>
                  <p className="mt-0.5 text-xs leading-5">{error}</p>
                </div>
              </div>
            ) : null}

            {/* Submit Button */}
            <button
              className="w-full h-12 bg-primary hover:bg-indigo-700 !text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
              type="submit"
              disabled={submitting || loading}
            >
              <span className="!text-white">{submitting ? 'Đang xác thực...' : 'Đăng nhập'}</span>
              <AppIcon className=" text-[18px] !text-white group-hover:translate-x-1 transition-transform">
                arrow_forward
              </AppIcon>
            </button>

            {/* Register Link */}
            <div className="mt-2 pt-4 border-t border-outline-variant/30 text-center">
              <p className="text-sm text-on-surface-variant">
                Chưa có tài khoản?{' '}
                <Link href="/register" className="font-bold text-primary hover:underline transition-colors">
                  Đăng ký ngay
                </Link>
              </p>
            </div>

            <div className="relative flex items-center justify-center my-0.5">
              <div className="border-t border-outline-variant/40 w-full" />
              <span className="bg-surface-container-lowest px-3 text-[11px] text-outline font-semibold absolute uppercase">hoặc</span>
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.href = `${API_BASE_URL}/auth/google`;
              }}
              className="w-full h-11 bg-white hover:bg-slate-50 border border-outline-variant text-on-surface font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-3 shadow-2xs cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Đăng nhập bằng Google</span>
            </button>
          </form>


        </div>
      </section>
      </main>
    </div>
  );
}
