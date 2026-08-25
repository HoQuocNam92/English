'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { primaryNavigation } from './navigation';
import { useAuth } from '@/features/auth/presentation';

export function Sidebar() {
  const pathname = usePathname();
  const { session, signOut } = useAuth();

  return (
    <aside className="w-[260px] h-screen fixed left-0 top-0 border-r border-outline-variant/40 bg-surface-container-lowest z-40 hidden md:flex flex-col py-6">
      {/* Brand Header */}
      <div className="px-6 mb-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[20px] fill-1">terminal</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-primary tracking-tight">IT English Admin</h1>
            <p className="text-[11px] text-on-surface-variant font-medium">Management Portal</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {primaryNavigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'text-primary bg-primary-fixed/50 font-bold shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${isActive ? 'text-primary fill-1' : 'text-outline'}`}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
              {item.badge ? (
                <span className="ml-auto px-1.5 py-0.5 text-[10px] rounded bg-primary text-on-primary font-bold">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Profile Card */}
      <div className="px-4 mt-auto pt-4 border-t border-outline-variant/30">
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-container-low/60">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shrink-0">
              {session?.user?.displayName ? session.user.displayName.charAt(0) : 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-on-surface truncate">
                {session?.user?.displayName ?? 'Admin Demo'}
              </p>
              <p className="text-[10px] text-on-surface-variant truncate uppercase">
                {session?.user?.role ?? 'System Admin'}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            title="Đăng xuất"
            className="p-1.5 rounded text-outline hover:text-error hover:bg-error-container/30 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
