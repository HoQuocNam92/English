'use client';

import { LearningReminder } from '@/shared/notifications/LearningReminder';
import { RouteGuard } from '@/shared/layout/RouteGuard';
import { LearnerOnboardingBoundary } from '@/shared/auth/LearnerOnboardingBoundary';

export default function LearnerAreaLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['learner']} redirectTo="/admin/dashboard">
      <LearnerOnboardingBoundary><LearningReminder />{children}</LearnerOnboardingBoundary>
    </RouteGuard>
  );
}
