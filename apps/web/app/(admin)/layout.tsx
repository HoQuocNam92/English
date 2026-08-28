import * as React from 'react';
import { AppShell } from '@/shared/layout/AppShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
