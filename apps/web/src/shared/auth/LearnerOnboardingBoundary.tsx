'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/presentation';
import { apiClient } from '@/shared/api/api-client';
import { postLoginDestination } from '../../../../../packages/shared-kernel/src/post-login-destination';

export function LearnerOnboardingBoundary({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const onboarding = pathname.startsWith('/onboarding');
  const [checked, setChecked] = useState('');
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const key = `${session?.user.id}:${pathname}`;

  useEffect(() => {
    if (!session || onboarding) return;
    let active = true;
    setError(false);
    void postLoginDestination({ loadProfile: () => apiClient.get<any>('/learner-profiles/me') })
      .then(destination => {
        if (!active) return;
        if (destination === '/onboarding') router.replace(destination);
        else setChecked(key);
      })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [session, onboarding, key, router, retry]);

  if (onboarding) return <>{children}</>;
  if (checked !== key) return <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6"><p role={error ? 'alert' : 'status'}>{error ? 'Chưa kiểm tra được lộ trình học. Vui lòng thử lại.' : 'Đang kiểm tra lộ trình học…'}</p>{error && <button onClick={() => setRetry(value => value + 1)} className="rounded-xl bg-primary px-5 py-3 font-semibold text-white">Thử lại</button>}</main>;
  return <>{children}</>;
}
