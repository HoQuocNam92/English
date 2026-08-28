'use client';
import * as React from 'react';
import { AppShell } from '@/shared/layout/AppShell';
import { RouteGuard } from '@/shared/layout/RouteGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['admin']}>
      <AppShell>{children}</AppShell>
    </RouteGuard>
  );
}
