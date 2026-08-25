'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/presentation';

export default function LoginPage() {
  const router = useRouter();
  const { session, loading, submitting, error, submitLogin, signOut } = useAuth();
  const [email, setEmail] = useState('admin@techenglish.edu.vn');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const currentRole = useMemo(() => session?.user.role ?? 'guest', [session]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await submitLogin({ email, password });
      router.push('/dashboard');
    } catch {
      // Handled by auth state
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('password123');
  };

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

          {session ? (
            <div className="flex flex-col gap-4 p-5 rounded-xl bg-surface-container-low border border-outline-variant/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
                  {session.user.displayName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-on-surface">{session.user.displayName}</h4>
                  <p className="text-xs text-on-surface-variant">{session.user.email} · Vai trò: <span className="font-medium text-primary uppercase">{currentRole}</span></p>
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <Link
                  href="/dashboard"
                  className="flex-1 h-11 bg-primary text-on-primary rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-sm"
                >
                  <span>Vào Dashboard</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="px-4 h-11 border border-outline-variant rounded-lg font-medium text-on-surface hover:bg-surface-container transition-all"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
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
                    placeholder="admin@techenglish.edu.vn"
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
              <div className="mt-4 pt-4 border-t border-outline-variant/30 flex flex-col gap-2">
                <span className="text-xs font-medium text-outline">Đăng nhập nhanh cho bản Demo:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@techenglish.pro')}
                    className="flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40 transition-colors text-center"
                  >
                    👑 Admin Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('teacher@techenglish.pro')}
                    className="flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40 transition-colors text-center"
                  >
                    🎓 Teacher Demo
                  </button>
                </div>
              </div>
            </form>
          )}

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
