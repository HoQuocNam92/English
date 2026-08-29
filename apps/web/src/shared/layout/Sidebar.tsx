'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminNavigation, teacherNavigation, type NavigationGroup } from './navigation';
import { useAuth } from '@/features/auth/presentation';

function NavGroup({ group, role }: { group: NavigationGroup; role: string }) {
  const pathname = usePathname();
  const isTeacher = role === 'teacher';

  return (
    <div className="mb-1">
      <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50">
        {group.group}
      </p>
      {group.items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href.split('/').length > 2 && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? isTeacher
                  ? 'text-secondary bg-secondary/10 font-bold shadow-xs'
                  : 'text-primary bg-primary-fixed/50 font-bold shadow-xs'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                isActive
                  ? isTeacher
                    ? 'text-secondary fill-1'
                    : 'text-primary fill-1'
                  : 'text-outline'
              }`}
            >
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
            {item.badge ? (
              <span
                className={`ml-auto px-1.5 py-0.5 text-[10px] rounded text-on-primary font-bold ${
                  isTeacher ? 'bg-secondary' : 'bg-primary'
                }`}
              >
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  const { session, signOut } = useAuth();
  const role = session?.user?.role ?? 'admin';

  const navGroups = role === 'teacher' ? teacherNavigation : adminNavigation;
  const portalLabel = role === 'teacher' ? 'Teacher Portal' : 'Admin Portal';
  const portalIcon = role === 'teacher' ? 'school' : 'terminal';
  const roleDisplay = role === 'teacher' ? 'Giảng viên' : 'Quản trị viên';

  return (
    <aside className="w-[260px] h-screen fixed left-0 top-0 border-r border-outline-variant/40 bg-surface-container-lowest z-40 hidden md:flex flex-col py-6">
      {/* Brand Header */}
      <div className="px-6 mb-6">
        <Link
          href={role === 'teacher' ? '/teacher/dashboard' : '/admin/dashboard'}
          className="flex items-center gap-2"
        >
          <div
            className={`w-8 h-8 rounded-lg text-on-primary flex items-center justify-center shadow-sm ${
              role === 'teacher' ? 'bg-secondary' : 'bg-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] fill-1">{portalIcon}</span>
          </div>
          <div>
            <h1
              className={`text-base font-bold tracking-tight ${
                role === 'teacher' ? 'text-secondary' : 'text-primary'
              }`}
            >
              IT English
            </h1>
            <p className="text-[11px] text-on-surface-variant font-medium">{portalLabel}</p>
          </div>
        </Link>
      </div>

      {/* Role badge */}
      <div className="px-6 mb-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            role === 'teacher'
              ? 'bg-secondary/10 text-secondary'
              : 'bg-primary/10 text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">
            {role === 'teacher' ? 'school' : 'shield_person'}
          </span>
          {roleDisplay}
        </span>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 space-y-3 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => (
          <NavGroup key={group.group} group={group} role={role} />
        ))}
      </nav>

      {/* Bottom User Profile */}
      <div className="px-4 mt-auto pt-4 border-t border-outline-variant/30">
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-container-low/60">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 text-on-primary ${
                role === 'teacher' ? 'bg-secondary' : 'bg-primary'
              }`}
            >
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
            className="p-2 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
