'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/presentation';
import { apiClient } from '@/shared/api/api-client';
import { postLoginDestination } from '../../../../../packages/shared-kernel/src/post-login-destination';
import { hasCompletedOnboarding, rememberCompletedOnboarding } from './onboarding-cache';
import { LoadingSpinner } from '@/shared/ui';

export function LearnerOnboardingBoundary({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const onboarding = pathname.startsWith('/onboarding');
  const [checked, setChecked] = useState('');
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const key = session?.user.id ?? '';

  useEffect(() => {
    if (!key || onboarding || checked === key) return;
    if (hasCompletedOnboarding(key)) { setChecked(key); return; }
    let active = true;
    setError(false);
    void postLoginDestination({ loadProfile: () => apiClient.get<any>('/learner-profiles/me') })
      .then(destination => {
        if (!active) return;
        if (destination === '/onboarding') router.replace(destination);
        else { rememberCompletedOnboarding(key); setChecked(key); }
      })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [onboarding, key, checked, router, retry]);

  if (onboarding) return <>{children}</>;
  if (!key || (checked !== key && !hasCompletedOnboarding(key))) return <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">{error ? <><p role="alert">Chưa kiểm tra được lộ trình học. Vui lòng thử lại.</p><button onClick={() => setRetry(value => value + 1)} className="rounded-xl bg-primary px-5 py-3 font-semibold text-white">Thử lại</button></> : <LoadingSpinner />}</main>;
  return <>{children}</>;
}
