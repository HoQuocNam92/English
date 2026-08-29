'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/presentation';

export function Topbar() {
  const { session, signOut } = useAuth();

  return (
    <header className="h-16 border-b border-outline-variant/40 bg-surface-container-lowest flex justify-between items-center w-full px-6 lg:px-8 z-30 shrink-0 sticky top-0">
      {/* Mobile brand text */}
      <div className="flex items-center gap-2 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-primary text-on-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px] fill-1">terminal</span>
          </div>
          <span className="font-bold text-primary text-sm">TechEnglish Pro</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative hidden sm:block w-72 lg:w-96">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
          search
        </span>
        <input
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs text-on-surface transition-all placeholder:text-outline"
          placeholder="Tìm kiếm học viên, bài học, chứng chỉ..."
          type="text"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors relative">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
        </button>
        <button className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors hidden sm:block">
          <span className="material-symbols-outlined text-[22px]">help_outline</span>
        </button>
        <div className="h-8 w-px bg-outline-variant/40 hidden sm:block" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center shadow-xs">
            {session?.user?.displayName ? session.user.displayName.charAt(0) : 'A'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-on-surface leading-tight">
              {session?.user?.displayName ?? 'Admin User'}
            </p>
            <p className="text-[10px] text-on-surface-variant leading-tight capitalize">
              {session?.user?.role ?? 'Admin'}
            </p>
          </div>
          <button
            type="button"
            onClick={signOut}
            title="Đăng xuất"
            aria-label="Đăng xuất"
            className="p-2 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer shrink-0 ml-1"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
