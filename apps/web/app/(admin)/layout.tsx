'use client';
import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppShell } from '@/shared/layout/AppShell';
import { RouteGuard } from '@/shared/layout/RouteGuard';
import { useAuth } from '@/features/auth/presentation';

const TEACHER_ROUTES = [
  '/admin/dashboard', '/admin/learning-content', '/admin/lessons',
  '/admin/questions', '/admin/tests',
  '/admin/test-results', '/admin/progress', '/admin/learning-paths',
  '/admin/community', '/admin/notifications',
];

function AdminRoleBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useAuth();
  const roles = session?.user?.roles ?? (session?.user?.role ? [session.user.role] : []);
  // A stale/misconfigured multi-role session must not elevate a teacher to admin.
  const isAdmin = roles.includes('admin') && !roles.includes('teacher');
  const allowed = isAdmin || TEACHER_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  React.useEffect(() => { if (session && !allowed) router.replace('/admin/dashboard'); }, [session, allowed, router]);
  if (session && !allowed) return null;
  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['admin', 'teacher']}>
      <AdminRoleBoundary><AppShell>{children}</AppShell></AdminRoleBoundary>
    </RouteGuard>
  );
}
