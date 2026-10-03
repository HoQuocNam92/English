'use client';
import { AppIcon } from '@/shared/ui/AppIcon';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { combinedNavigation, teacherNavigation, type NavigationGroup, type NavigationItem } from './navigation';
import { useAuth } from '@/features/auth/presentation';

function NavItem({ item, isCollapsed }: { item: NavigationItem; isCollapsed?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [itemPath, itemQuery = ''] = item.href.split('?');
  const expectedQuery = new URLSearchParams(itemQuery);
  const queryMatches = [...expectedQuery.entries()].every(([key, value]) => searchParams.get(key) === value);
  const isLessonIndex = itemPath === '/admin/lessons' && expectedQuery.size === 0;
  const routeMatches = expectedQuery.size > 0
    ? pathname === itemPath && queryMatches
    : (pathname === itemPath && (!isLessonIndex || !searchParams.has('type')))
      || (pathname.startsWith(`${itemPath}/`) && itemPath.split('/').length > 2);
  const level = item.level ?? 0;
  const childIsActive = item.children?.some((child) => {
    const [childPath, childQuery = ''] = child.href.split('?');
    const query = new URLSearchParams(childQuery);
    return (pathname === childPath || pathname.startsWith(`${childPath}/`)) && [...query.entries()].every(([key, value]) => searchParams.get(key) === value);
  }) ?? false;
  // A child owns the selected state; its parent only stays expanded.
  const isActive = routeMatches && !childIsActive;
  const [expanded, setExpanded] = useState(childIsActive);
  useEffect(() => { if (childIsActive) setExpanded(true); }, [childIsActive]);

  if (isCollapsed) {
    return (
      <Link
        href={item.href}
        aria-current={isActive || childIsActive ? 'page' : undefined}
        title={item.badge ? `${item.label} (${item.badge})` : item.label}
        className={`group relative flex h-10 w-10 mx-auto items-center justify-center rounded-xl text-[13px] font-medium transition-all duration-200 ${
          isActive || childIsActive
            ? 'text-primary bg-primary/10 font-semibold shadow-xs ring-1 ring-primary/30'
            : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
        }`}
      >
        <AppIcon className={` text-[20px] transition-colors ${
            isActive || childIsActive ? 'text-primary ' : `nav-icon-${item.icon} group-hover:scale-110`
          }`}>
          {item.icon}
        </AppIcon>
        {item.badge ? (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-surface-container-lowest" />
        ) : null}
      </Link>
    );
  }

  return (
    <div>
      <div className="flex items-center">
        <Link
          href={item.href}
          aria-current={isActive ? 'page' : undefined}
          className={`group flex min-w-0 flex-1 items-center rounded-xl transition-all duration-200 ${
        level === 2
          ? 'ml-9 min-h-8 gap-2 px-2.5 py-1.5 text-[11px] font-medium border-l border-outline-variant/60 rounded-l-none'
          : level === 1
            ? 'ml-9 min-h-8 gap-2 px-2.5 py-1.5 text-[11px] font-medium border-l border-outline-variant/60 rounded-l-none'
            : 'min-h-10 gap-3 px-3.5 py-2.5 text-[13px] font-semibold'
      } ${
        isActive
            ? 'text-primary bg-primary/10 font-semibold shadow-[inset_3px_0_0_var(--primary)]'
            : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
      }`}
        >
          <AppIcon className={` transition-colors ${level === 2 ? 'text-[16px]' : level === 1 ? 'text-[18px]' : 'text-[20px]'} ${
              isActive ? 'text-primary ' : `nav-icon-${item.icon} group-hover:scale-110`
            }`}>
            {item.icon}
          </AppIcon>
          <span className="truncate">{item.label}</span>
          {item.badge ? <span className="ml-auto px-1.5 py-0.5 text-[10px] rounded bg-primary text-white font-bold">{item.badge}</span> : null}
        </Link>
        {item.children?.length ? (
          <button type="button" onClick={() => setExpanded(value => !value)} aria-label={`${expanded ? 'Thu gọn' : 'Mở rộng'} ${item.label}`} aria-expanded={expanded} className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-primary">
            <AppIcon className=" text-[18px]">{expanded ? 'expand_less' : 'expand_more'}</AppIcon>
          </button>
        ) : null}
      </div>
      {item.children?.length && expanded ? (
        <div className="mt-0.5 space-y-0.5">
          {item.children.map(child => <NavItem key={child.href} item={child} />)}
        </div>
      ) : null}
    </div>
  );
}

function NavGroup({ group, isAdmin, isCollapsed }: { group: NavigationGroup; isAdmin: boolean; isCollapsed?: boolean }) {
  // Lọc items theo role: teacher không thấy adminOnly items
  const visibleItems = group.items.filter((item) => isAdmin || !item.adminOnly);
  if (visibleItems.length === 0) return null;

  return (
    <div className="mb-4">
      {isCollapsed ? (
        <div className="my-2 mx-2 border-t border-outline-variant/30" />
      ) : (
        <p className="px-3.5 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/55">
          {group.group}
        </p>
      )}
      <div className={isCollapsed ? 'space-y-1.5' : 'space-y-0.5'}>
        {visibleItems.map((item) => (
          <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
        ))}
      </div>
    </div>
  );
}

export interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isMobile = false, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { session, signOut } = useAuth();
  const roles = session?.user?.roles ?? (session?.user?.role ? [session.user.role] : []);
  // Prefer the least-privileged core role if legacy data contains both roles.
  const isAdmin = roles.includes('admin') && !roles.includes('teacher');

  const roleDisplay = isAdmin ? 'Quản trị viên' : 'Giảng viên';

  // Lọc groups theo role: teacher không thấy adminOnly groups
  const visibleGroups = isAdmin ? combinedNavigation : teacherNavigation;

  const containerClasses = isMobile
    ? 'w-full h-full bg-surface-container-lowest flex flex-col py-5'
    : `${
        isCollapsed ? 'w-[76px]' : 'w-[272px]'
      } h-screen fixed left-0 top-0 border-r border-outline-variant/50 bg-surface-container-lowest z-40 hidden md:flex flex-col py-6 shadow-[4px_0_24px_rgba(15,23,42,0.025)] transition-all duration-300 ease-in-out`;

  return (
    <aside className={containerClasses}>
      {/* Brand Header */}
      {isCollapsed && !isMobile ? (
        <div className="px-2 mb-6 flex flex-col items-center gap-3">
          <Link
            href="/admin/dashboard"
            title={isAdmin ? 'TechEnglish Pro — Khu vực quản trị' : 'Khu vực giảng viên'}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-tertiary text-white shadow-[0_8px_18px_rgba(53,37,205,0.22)]"
          >
            <AppIcon className=" text-[24px] ">school</AppIcon>
          </Link>
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Mở rộng menu"
            aria-label="Mở rộng menu"
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors cursor-pointer"
          >
            <AppIcon className=" text-[20px]">menu</AppIcon>
          </button>
        </div>
      ) : (
        <div className="px-5 mb-7 flex items-center justify-between">
          <Link href="/admin/dashboard" onClick={onClose} className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-tertiary text-white shadow-[0_8px_18px_rgba(53,37,205,0.22)]">
              <AppIcon className=" text-[24px] ">school</AppIcon>
            </div>
            <div className="min-w-0">
              <h1 className="text-[17px] font-bold tracking-tight text-on-surface leading-tight truncate">
                {isAdmin ? 'TechEnglish Pro' : 'Khu vực giảng viên'}
              </h1>
              <p className="text-[11px] text-on-surface-variant mt-1">{isAdmin ? 'Khu vực quản trị' : 'Giảng viên'}</p>
            </div>
          </Link>
          {!isMobile && onToggleCollapse ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Thu gọn menu"
              title="Thu gọn sidebar"
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors cursor-pointer"
            >
              <AppIcon className=" text-[20px]">menu_open</AppIcon>
            </button>
          ) : null}
          {isMobile ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng menu"
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <AppIcon className=" text-[20px]">close</AppIcon>
            </button>
          ) : null}
        </div>
      )}

      {/* Role badge */}
      <div className="hidden">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
          <AppIcon className=" text-[13px]">
            {isAdmin ? 'shield_person' : 'school'}
          </AppIcon>
          {roleDisplay}
        </span>
      </div>

      {/* Navigation Groups */}
      <nav className={`flex-1 ${isCollapsed && !isMobile ? 'px-1.5' : 'px-3'} space-y-1 overflow-y-auto custom-scrollbar`}>
        {visibleGroups.map((group) => (
          <NavGroup key={group.group} group={group} isAdmin={isAdmin} isCollapsed={isCollapsed && !isMobile} />
        ))}
      </nav>

      {/* Bottom User Profile */}
      <div className={`${isCollapsed && !isMobile ? 'px-2' : 'px-4'} mt-auto pt-4 border-t border-outline-variant/50`}>
        {isCollapsed && !isMobile ? (
          <div className="flex flex-col items-center gap-2.5 py-1">
            <div
              title={`${session?.user?.displayName ?? 'Demo User'} (${roleDisplay})`}
              className="w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 text-white bg-primary shadow-xs cursor-default"
            >
              {session?.user?.displayName ? session.user.displayName.charAt(0) : '?'}
            </div>
            <button
              type="button"
              onClick={signOut}
              title="Đăng xuất khỏi hệ thống"
              aria-label="Đăng xuất"
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-error-container/20 transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <AppIcon className=" text-[18px]">logout</AppIcon>
            </button>
          </div>
        ) : (
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
              <AppIcon className=" text-[18px]">logout</AppIcon>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
