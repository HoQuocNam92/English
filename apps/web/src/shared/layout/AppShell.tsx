import * as React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Footer } from './Footer';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-on-surface antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen overflow-x-hidden">
        <Topbar />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
