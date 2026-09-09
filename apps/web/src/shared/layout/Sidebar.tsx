'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { combinedNavigation, teacherNavigation, type NavigationGroup, type NavigationItem } from './navigation';
import { useAuth } from '@/features/auth/presentation';

function NavItem({ item }: { item: NavigationItem }) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href ||
    (item.href.split('/').length > 2 && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      className={`group flex min-h-10 items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
        isActive
          ? 'text-primary bg-primary/10 font-semibold shadow-[inset_3px_0_0_var(--primary)]'
          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
      }`}
    >
      <span
        className={`material-symbols-outlined text-[20px] transition-colors ${
          isActive ? 'text-primary fill-1' : 'text-outline group-hover:text-primary'
        }`}
      >
        {item.icon}
      </span>
      <span className="truncate">{item.label}</span>
      {item.badge ? (
        <span className="ml-auto px-1.5 py-0.5 text-[10px] rounded bg-primary text-white font-bold">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function NavGroup({ group, isAdmin }: { group: NavigationGroup; isAdmin: boolean }) {
  // Lọc items theo role: teacher không thấy adminOnly items
  const visibleItems = group.items.filter((item) => isAdmin || !item.adminOnly);
  if (visibleItems.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="px-3.5 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/55">
        {group.group}
      </p>
      {visibleItems.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
    </div>
  );
}

export interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobile = false, onClose }: SidebarProps) {
  const { session, signOut } = useAuth();
  const roles = session?.user?.roles ?? (session?.user?.role ? [session.user.role] : []);
  // Prefer the least-privileged core role if legacy data contains both roles.
  const isAdmin = roles.includes('admin') && !roles.includes('teacher');

  const roleDisplay = isAdmin ? 'Quản trị viên' : 'Giảng viên';

  // Lọc groups theo role: teacher không thấy adminOnly groups
  const visibleGroups = isAdmin ? combinedNavigation : teacherNavigation;

  const containerClasses = isMobile
    ? 'w-full h-full bg-surface-container-lowest flex flex-col py-5'
    : 'w-[272px] h-screen fixed left-0 top-0 border-r border-outline-variant/50 bg-surface-container-lowest z-40 hidden md:flex flex-col py-6 shadow-[4px_0_24px_rgba(15,23,42,0.025)]';

  return (
    <aside className={containerClasses}>
      {/* Brand Header */}
      <div className="px-5 mb-7 flex items-center justify-between">
        <Link href="/admin/dashboard" onClick={onClose} className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-tertiary text-white shadow-[0_8px_18px_rgba(53,37,205,0.22)]">
            <span className="material-symbols-outlined text-[24px] fill-1">school</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-[17px] font-bold tracking-tight text-on-surface leading-tight truncate">
              {isAdmin ? 'TechEnglish Pro' : 'Teacher Workspace'}
            </h1>
            <p className="text-[11px] text-on-surface-variant mt-1">{isAdmin ? 'Admin workspace' : 'Giảng viên'}</p>
          </div>
        </Link>
        {isMobile ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng menu"
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        ) : null}
      </div>

      {/* Role badge */}
      <div className="hidden">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-[13px]">
            {isAdmin ? 'shield_person' : 'school'}
          </span>
          {roleDisplay}
        </span>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {visibleGroups.map((group) => (
          <NavGroup key={group.group} group={group} isAdmin={isAdmin} />
        ))}
      </nav>

      {/* Bottom User Profile */}
      <div className="px-4 mt-auto pt-4 border-t border-outline-variant/50">
        <div className="flex items-center justify-between gap-2 rounded-xl bg-surface-container-low px-3 py-2.5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center shrink-0 text-white bg-primary">
              {session?.user?.displayName ? session.user.displayName.charAt(0) : '?'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-on-surface truncate">
                {session?.user?.displayName ?? 'Demo User'}
              </p>
              <p className="text-[10px] text-on-surface-variant truncate uppercase">
                {roleDisplay}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            title="Đăng xuất khỏi hệ thống"
            aria-label="Đăng xuất"
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-error-container/20 transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

