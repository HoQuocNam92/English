'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/presentation';

interface RouteGuardProps {
  children: React.ReactNode;
  /** Roles allowed to access this route. Empty = any authenticated user. */
  allowedRoles?: string[];
  /** Where to redirect if role doesn't match (default: role-based dashboard) */
  redirectTo?: string;
}

export function RouteGuard({ children, allowedRoles = [], redirectTo }: RouteGuardProps) {
  const router = useRouter();
  const { session, loading } = useAuth();

  React.useEffect(() => {
    if (loading) return;

    // Not logged in → go to login
    if (!session) {
      router.replace('/login');
      return;
    }

    // Wrong role → redirect to own dashboard
    if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
      const fallback = redirectTo ?? '/admin/dashboard';
      router.replace(fallback);
    }
  }, [session, loading, allowedRoles, redirectTo, router]);

  // Show nothing while checking
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[40px] text-primary animate-spin">
            progress_activity
          </span>
          <p className="text-sm text-on-surface-variant">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  // Not authed / wrong role — render nothing while redirect is in flight
  if (!session) return null;
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) return null;

  return <>{children}</>;
}
