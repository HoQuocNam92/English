import AsyncStorage from '@react-native-async-storage/async-storage';

const key = (userId: string) => `techenglish.onboarding-completed:${userId}`;
const completed = new Set<string>();

export function isOnboardingCompletionCached(userId: string): boolean {
  return completed.has(userId);
}

export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    if (completed.has(userId)) return true;
    if (await AsyncStorage.getItem(key(userId)) !== 'true') return false;
    completed.add(userId);
    return true;
  } catch {
    return false;
  }
}

export async function rememberCompletedOnboarding(userId: string): Promise<void> {
  completed.add(userId);
  await AsyncStorage.setItem(key(userId), 'true').catch(() => {});
}
