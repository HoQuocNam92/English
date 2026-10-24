'use client';
import { AppIcon } from '@/shared/ui/AppIcon';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/presentation';
import { Footer } from './Footer';

interface LearnerShellProps {
  children: React.ReactNode;
}

export function LearnerShell({ children }: LearnerShellProps) {
  const pathname = usePathname();
  const { session } = useAuth();
  const navLinks = [
    { href: '/learn', label: 'Trang chủ', exactMatch: true, icon: 'home', color: 'icon-home' },
    { href: '/learn/lessons', label: 'Bài học', exactMatch: false, icon: 'menu_book', color: 'icon-learning' },
    { href: '/learn/plan', label: 'Lộ trình', exactMatch: false, icon: 'route', color: 'icon-learning' },
    { href: '/learn/certifications', label: 'Chứng chỉ', exactMatch: false, icon: 'workspace_premium', color: 'icon-certificate' },
    { href: '/learn/progress', label: 'Tiến độ', exactMatch: false, icon: 'monitoring', color: 'icon-progress' },
  ];

  const displayName = session?.user?.displayName ?? 'Người dùng';
  const initial = displayName.charAt(0).toUpperCase();
  const isAdminOrTeacher = session?.user?.role === 'admin' || session?.user?.role === 'teacher';

  return (
    <div className="learner-canvas min-h-screen bg-background text-on-surface flex flex-col antialiased">
      {/* ── TopNav ─────────────────────────────────────────────────── */}
      <header className="bg-surface-container-lowest sticky top-0 w-full z-50 border-b border-outline-variant shadow-sm">
        <div className="flex h-16 items-center justify-between gap-3 max-w-[1280px] mx-auto px-[var(--page-gutter)] w-full">

          {/* Left: Brand + Nav */}
          <div className="flex min-w-0 items-center gap-6">
            <Link href="/learn" className="flex items-center gap-2.5 whitespace-nowrap">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
                <AppIcon className=" text-[22px] !text-white ">terminal</AppIcon>
              </div>
              <div>
                <span className="block text-base font-black leading-tight tracking-tight text-primary">TechEnglish Pro</span>
                <span className="block text-[10px] font-semibold uppercase leading-none tracking-wider text-on-surface-variant">IT English Platform</span>
              </div>
            </Link>

            <nav aria-label="Điều hướng học tập" className="hidden lg:flex items-center h-full gap-4">
              {navLinks.map((item) => {
                const isActive = item.exactMatch
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group h-full flex items-center gap-1.5 text-[13px] font-semibold transition-colors duration-200 border-b-2 whitespace-nowrap ${
                      isActive
                        ? 'text-primary border-primary pb-[2px]'
                        : 'text-on-surface-variant border-transparent hover:text-primary'
                    }`}
                  >
                    <AppIcon className={` !flex h-6 w-6 shrink-0 items-center justify-center text-center text-[19px] !leading-none transition-transform group-hover:scale-110 ${item.color} ${isActive ? '' : ''}`}>{item.icon}</AppIcon>
                    {item.label}
                  </Link>
                );
              })}

            </nav>
          </div>

          {/* Right: Admin access + Avatar */}
          <div className="flex items-center gap-4">
            {isAdminOrTeacher && (
              <Link
                href="/admin/dashboard"
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant text-[12px] font-bold text-on-surface-variant hover:text-primary transition-colors"
              >
                <AppIcon className=" icon-certificate" style={{ fontSize: '16px' }}>admin_panel_settings</AppIcon>
                {'Quản trị'}
              </Link>
            )}

            <Link
              href="/learn/profile"
              aria-label="Hồ sơ cá nhân"
              className="learner-header-avatar shrink-0 w-8 h-8 rounded-full bg-primary border border-outline-variant flex items-center justify-center hover:ring-2 hover:ring-primary transition-all cursor-pointer"
            >
              <span className="text-white font-bold text-sm">{initial}</span>
            </Link>
          </div>
        </div>
        <nav aria-label="Điều hướng học tập trên điện thoại" className="grid grid-cols-5 gap-1 border-t border-outline-variant/40 px-2 py-1.5 lg:hidden">
          {navLinks.map(item => {
            const isActive = item.exactMatch ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold leading-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${isActive ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
            >
              <AppIcon aria-hidden="true" className={`text-[21px] ${isActive ? 'text-primary' : item.color}`}>{item.icon}</AppIcon>
              <span>{item.label}</span>
            </Link>;
          })}
        </nav>
      </header>

      {/* ── Page Content ───────────────────────────────────────────── */}
      <main className="learner-page flex-1 w-full max-w-[1280px] mx-auto">
        {children}
      </main>

      {/* ── Shared Footer ──────────────────────────────────────────── */}
      <Footer learner />
    </div>
  );
}
