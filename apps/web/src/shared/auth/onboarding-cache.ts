const completed = new Set<string>();
const key = (userId: string) => `techenglish.onboarding-completed:${userId}`;

export function hasCompletedOnboarding(userId: string): boolean {
  if (completed.has(userId)) return true;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage.getItem(key(userId)) === 'true') {
      completed.add(userId);
      return true;
    }
  } catch { /* The current page can still remember completion without browser storage. */ }
  return false;
}

export function rememberCompletedOnboarding(userId: string): void {
  completed.add(userId);
  try { window.sessionStorage.setItem(key(userId), 'true'); } catch { /* Optional persistence. */ }
}
