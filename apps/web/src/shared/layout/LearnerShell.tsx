'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/presentation';
import { Footer } from './Footer';

interface LearnerShellProps {
  children: React.ReactNode;
}

const navLinks = [
  { href: '/learn', label: 'Trang chủ', icon: 'home' },
  { href: '/learn/lessons', label: 'Lộ trình học', icon: 'menu_book' },
  { href: '/learn/practice', label: 'Luyện tập & Thi thử', icon: 'quiz' },
  { href: '/learn/progress', label: 'Tiến độ cá nhân', icon: 'trending_up' }
];

export function LearnerShell({ children }: LearnerShellProps) {
  const pathname = usePathname();
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-200 bg-white sticky top-0 w-full z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Brand & Nav */}
          <div className="flex items-center gap-8">
            <Link href="/learn" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[22px] !text-white">school</span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-primary text-base leading-tight tracking-tight">
                  TechEnglish Pro
                </span>
                <span className="text-[10px] text-slate-500 leading-none font-bold uppercase tracking-wider">
                  Learner Portal
                </span>
              </div>
            </Link>

            {/* Nav Items (Desktop) */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((item) => {
                const isActive =
                  item.href === '/learn' ? pathname === '/learn' : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-primary !text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${isActive ? '!text-white' : 'text-slate-500'}`}>
                      {item.icon}
                    </span>
                    <span className={isActive ? '!text-white' : 'text-slate-700'}>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Tools */}
          <div className="flex items-center gap-4">
            {/* Streak Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
              <span className="text-sm">🔥</span>
              <span className="text-xs font-bold text-amber-900">5 ngày liên tiếp</span>
            </div>

            {/* Switch to Admin */}
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors border border-slate-200 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-700">admin_panel_settings</span>
              <span className="hidden sm:inline">Xem Quản trị viên</span>
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* User Profile */}
            <Link href="/learn/profile" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-primary font-black text-xs flex items-center justify-center group-hover:ring-2 group-hover:ring-primary transition-all">
                {session?.user?.displayName ? session.user.displayName.charAt(0) : 'N'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900 leading-tight m-0">
                    {session?.user?.displayName ?? 'Nguyễn Hoàng Nam'}
                  </p>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-primary font-bold leading-tight m-0">
                  AWS Cloud Practitioner
                </p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
