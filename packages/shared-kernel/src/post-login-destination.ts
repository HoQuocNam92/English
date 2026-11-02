type Options = { role?: string; mobile?: boolean; loadProfile: () => Promise<{ onboardingCompleted?: boolean } | null> };
/** Onboarding belongs after login; network failures must not silently skip it. */
export async function postLoginDestination({ role = 'learner', mobile = false, loadProfile }: Options): Promise<string> {
  if (role === 'admin' || role === 'teacher') return '/admin/dashboard';
  const onboarding = mobile ? '/(onboarding)/goal' : '/onboarding';
  try {
    const profile = await loadProfile();
    return profile?.onboardingCompleted === true ? (mobile ? '/(tabs)/home' : '/learn') : onboarding;
  } catch (error) {
    const status = (error as { status?: number; statusCode?: number })?.status ?? (error as { statusCode?: number })?.statusCode;
    if (status === 404) return onboarding;
    throw error;
  }
}
