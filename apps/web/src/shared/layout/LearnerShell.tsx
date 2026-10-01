'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/presentation';
import { useI18n } from '../i18n';
import { Footer } from './Footer';

interface LearnerShellProps {
  children: React.ReactNode;
}

export function LearnerShell({ children }: LearnerShellProps) {
  const pathname = usePathname();
  const { session } = useAuth();
  const { t } = useI18n();
  const navLinks = [
    { href: '/learn', label: t.nav.home, exactMatch: true, icon: 'home', color: 'icon-home' },
    { href: '/learn/lessons', label: 'Bài học', exactMatch: false, icon: 'menu_book', color: 'icon-learning' },
    { href: '/learn/certifications', label: t.nav.certifications, exactMatch: false, icon: 'workspace_premium', color: 'icon-certificate' },
    { href: '/learn/progress', label: t.nav.progress, exactMatch: false, icon: 'monitoring', color: 'icon-progress' },
  ];

  const displayName = session?.user?.displayName ?? 'Người dùng';
  const initial = displayName.charAt(0).toUpperCase();
  const isAdminOrTeacher = session?.user?.role === 'admin' || session?.user?.role === 'teacher';

  return (
    <div className="learner-canvas min-h-screen bg-background text-on-surface flex flex-col antialiased">
      {/* ── TopNav ─────────────────────────────────────────────────── */}
      <nav className="bg-surface-container-lowest sticky top-0 w-full z-50 h-16 border-b border-outline-variant shadow-sm">
        <div className="flex items-center justify-between max-w-[1280px] mx-auto px-8 w-full h-full">

          {/* Left: Brand + Nav */}
          <div className="flex items-center gap-6">
            <Link href="/learn" className="flex items-center gap-2.5 whitespace-nowrap">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
                <span className="material-symbols-outlined text-[22px] !text-white fill-1">terminal</span>
              </div>
              <div>
                <span className="block text-base font-black leading-tight tracking-tight text-primary">TechEnglish Pro</span>
                <span className="block text-[10px] font-semibold uppercase leading-none tracking-wider text-on-surface-variant">IT English Platform</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center h-full gap-4">
              {navLinks.map((item) => {
                const isActive = item.exactMatch
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group h-full flex items-center gap-1.5 text-[13px] font-semibold transition-colors duration-200 border-b-2 whitespace-nowrap ${
                      isActive
                        ? 'text-primary border-primary pb-[2px]'
                        : 'text-on-surface-variant border-transparent hover:text-primary'
                    }`}
                  >
                    <span className={`material-symbols-outlined !flex h-6 w-6 shrink-0 items-center justify-center text-center text-[19px] !leading-none transition-transform group-hover:scale-110 ${item.color} ${isActive ? 'fill-1' : ''}`}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}

            </div>
          </div>

          {/* Right: Admin access + Avatar */}
          <div className="flex items-center gap-4">
            {isAdminOrTeacher && (
              <Link
                href="/admin/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant text-[12px] font-bold text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined icon-certificate" style={{ fontSize: '16px' }}>admin_panel_settings</span>
                {t.nav.admin}
              </Link>
            )}

            <Link
              href="/learn/profile"
              className="learner-header-avatar shrink-0 w-8 h-8 rounded-full bg-primary border border-outline-variant flex items-center justify-center hover:ring-2 hover:ring-primary transition-all cursor-pointer"
            >
              <span className="text-white font-bold text-sm">{initial}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Page Content ───────────────────────────────────────────── */}
      <main className="learner-page flex-1 w-full max-w-[1280px] mx-auto">
        {children}
      </main>

      {/* ── Shared Footer ──────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
