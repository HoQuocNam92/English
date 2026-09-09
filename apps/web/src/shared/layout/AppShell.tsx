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
    <div className="flex h-screen overflow-hidden bg-background text-on-surface antialiased">
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
      <div className="flex min-w-0 w-full flex-col md:ml-[272px] md:w-[calc(100%-272px)] h-screen overflow-hidden">
        <Topbar onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)} />
        <main className="admin-canvas flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
