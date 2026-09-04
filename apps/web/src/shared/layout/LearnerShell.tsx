'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/presentation';
import { useI18n } from '../i18n';
import { Footer } from './Footer';
import { ThemeLanguageToggle } from '../ui/ThemeLanguageToggle';

interface LearnerShellProps {
  children: React.ReactNode;
}

export function LearnerShell({ children }: LearnerShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useAuth();
  const { t } = useI18n();

  const navLinks = [
    { href: '/learn', label: t.nav.home, exactMatch: true },
    { href: '/learn/lessons', label: t.nav.learning, exactMatch: false },
    { href: '/learn/practice', label: t.nav.practice, exactMatch: false },
    { href: '/learn/progress', label: t.nav.progress, exactMatch: false },
    { href: '/learn/roadmap', label: t.nav.roadmap, exactMatch: false },
    { href: '/learn/achievements', label: t.nav.achievements, exactMatch: false },
  ];
  
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const displayName = session?.user?.displayName ?? 'Người dùng';
  const initial = displayName.charAt(0).toUpperCase();
  const isAdminOrTeacher = session?.user?.role === 'admin' || session?.user?.role === 'teacher';

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col antialiased">
      {/* ── TopNav ─────────────────────────────────────────────────── */}
      <nav className="bg-surface-container-lowest sticky top-0 w-full z-50 h-16 border-b border-outline-variant shadow-sm">
        <div className="flex items-center justify-between max-w-[1280px] mx-auto px-8 w-full h-full">

          {/* Left: Brand + Nav */}
          <div className="flex items-center gap-8">
            <Link href="/learn" className="text-[24px] font-bold text-primary tracking-tight leading-tight">
              TechEnglish Pro
            </Link>

            <div className="hidden md:flex items-center h-full gap-6">
              {navLinks.map((item) => {
                const isActive = item.exactMatch
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`h-full flex items-center text-[14px] font-semibold transition-colors duration-200 border-b-2 ${
                      isActive
                        ? 'text-primary border-primary pb-[2px]'
                        : 'text-on-surface-variant border-transparent hover:text-primary'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              
              {/* More Dropdown */}
              <div className="relative h-full flex items-center" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={`h-full flex items-center gap-1 text-[14px] font-semibold transition-colors duration-200 border-b-2 cursor-pointer ${
                    moreOpen ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-primary'
                  }`}
                >
                  {t.nav.explore}
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </button>
                {moreOpen && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                    {[
                      { href: '/learn/mock-interview', label: t.nav.mockInterview, icon: 'record_voice_over' },
                      { href: '/learn/writing-practice', label: t.nav.writingPractice, icon: 'edit_document' },
                      { href: '/learn/smart-review', label: t.nav.smartReview, icon: 'psychology' },
                      { href: '/learn/reading-lab', label: t.nav.readingLab, icon: 'menu_book' },
                      { href: '/learn/dictionary', label: t.nav.dictionary, icon: 'library_books' },
                      { href: '/learn/calendar', label: t.nav.calendar, icon: 'calendar_month' },
                      { href: '/learn/community', label: t.nav.community, icon: 'forum' },
                      { href: '/learn/path-generator', label: t.nav.pathGenerator, icon: 'route' },
                      { href: '/learn/skill-gap', label: t.nav.skillGap, icon: 'troubleshoot' },
                      { href: '/learn/exam-readiness', label: t.nav.examReadiness, icon: 'quiz' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold transition-colors ${
                          pathname.startsWith(item.href) ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Search + Notifications + Avatar */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-surface-container-low rounded-full px-3 py-2 border border-outline-variant gap-2">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '20px' }}>search</span>
              <input
                className="bg-transparent border-none outline-none text-[14px] text-on-surface w-48 placeholder:text-on-surface-variant"
                placeholder={t.common.search}
                type="text"
              />
            </div>

            <ThemeLanguageToggle />

            <button aria-label="notifications" onClick={() => router.push('/learn/notifications')} className="p-2 text-on-surface-variant hover:text-primary transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {isAdminOrTeacher && (
              <Link
                href="/admin/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant text-[12px] font-bold text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>admin_panel_settings</span>
                {t.nav.admin}
              </Link>
            )}

            <Link
              href="/learn/profile"
              className="w-8 h-8 rounded-full bg-primary border border-outline-variant flex items-center justify-center hover:ring-2 hover:ring-primary transition-all cursor-pointer"
            >
              <span className="text-white font-bold text-sm">{initial}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Page Content ───────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-8 py-8 pb-16">
        {children}
      </main>

      {/* ── Shared Footer ──────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
