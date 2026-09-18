'use client';

import * as React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Sync with localStorage on client mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('techenglish_sidebar_collapsed');
      if (saved === 'true') {
        setIsCollapsed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleCollapse = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('techenglish_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface antialiased">
      {/* Desktop sticky sidebar */}
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />

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
      <div
        className={`flex min-w-0 w-full flex-col ${
          isCollapsed ? 'md:ml-[76px] md:w-[calc(100%-76px)]' : 'md:ml-[272px] md:w-[calc(100%-272px)]'
        } h-screen overflow-hidden transition-all duration-300 ease-in-out`}
      >
        <Topbar
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
          isSidebarCollapsed={isCollapsed}
          onToggleSidebar={handleToggleCollapse}
        />
        <main className="admin-canvas flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
