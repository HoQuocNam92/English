'use client';

import { LearningReminder } from '@/shared/notifications/LearningReminder';
import { RouteGuard } from '@/shared/layout/RouteGuard';

export default function LearnerAreaLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['learner']} redirectTo="/admin/dashboard">
      <LearningReminder />
      {children}
    </RouteGuard>
  );
}
