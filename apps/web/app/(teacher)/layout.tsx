'use client';
import * as React from 'react';
import { AppShell } from '@/shared/layout/AppShell';
import { RouteGuard } from '@/shared/layout/RouteGuard';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['teacher']}>
      <AppShell>{children}</AppShell>
    </RouteGuard>
  );
}
