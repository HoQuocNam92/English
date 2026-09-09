'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/presentation';
import { ThemeLanguageToggle } from '../ui/ThemeLanguageToggle';

export interface TopbarProps {
  onToggleMobileMenu?: () => void;
}

export function Topbar({ onToggleMobileMenu }: TopbarProps) {
  const { session, signOut } = useAuth();

  return (
    <header className="h-[72px] border-b border-outline-variant/50 bg-surface-container-lowest/95 backdrop-blur flex justify-between items-center w-full px-4 sm:px-8 z-30 shrink-0">
      {/* Mobile hamburger + brand */}
      <div className="flex items-center gap-2.5 md:hidden">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Mở menu"
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-primary text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[17px] fill-1">terminal</span>
          </div>
          <span className="font-bold text-primary text-sm">TechEnglish Pro</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative hidden sm:block w-72 lg:w-[420px]">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
          search
        </span>
        <input
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-outline-variant/60 bg-surface-container-low focus:bg-surface-container-lowest focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-[13px] text-on-surface transition-all placeholder:text-outline"
          placeholder="Tìm kiếm học viên, bài học, chứng chỉ..."
          type="text"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <ThemeLanguageToggle />
        <button className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors relative">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
        </button>
        <button className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors hidden sm:block">
          <span className="material-symbols-outlined text-[22px]">help_outline</span>
        </button>
        <div className="h-8 w-px bg-outline-variant/40 hidden sm:block" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container text-white font-bold text-xs flex items-center justify-center shadow-xs">
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
            className="p-2 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-error-container/20 transition-all cursor-pointer shrink-0 ml-1"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

