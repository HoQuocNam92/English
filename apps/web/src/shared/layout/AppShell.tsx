'use client';

import * as React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-background text-on-surface antialiased">
      {/* Desktop sticky sidebar */}
      <Sidebar />

      {/* Mobile drawer overlay */}
      {mobileMenuOpen ? (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-surface-container-lowest shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar isMobile onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      ) : null}

      {/* Main content container */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <Topbar onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)} />
        <main className="flex-1 p-5 md:p-8">{children}</main>
        <footer className="py-3.5 px-6 border-t border-outline-variant/30 text-xs text-on-surface-variant flex flex-col sm:flex-row justify-between items-center gap-2 bg-surface-container-lowest mt-auto">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">TechEnglish Pro</span>
            <span className="text-outline">·</span>
            <span>Cổng Quản trị & Giảng viên</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-on-surface-variant/70">
            <span>Phiên bản 1.0.0</span>
            <span className="text-outline">·</span>
            <span>Hệ thống bảo mật</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
