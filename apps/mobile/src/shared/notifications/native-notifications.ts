import { isRunningInExpoGo, requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

type Notifications = typeof import('expo-notifications');
let notifications: Notifications | null | undefined;
function unavailable() {
  notifications = null;
  if (__DEV__) console.warn('[Thông báo] Bản cài hiện tại thiếu module native. Hãy build lại ứng dụng để dùng thông báo trên thiết bị.');
  return null;
}

/** Do not evaluate the notifications barrel in Expo Go or an older native build. */
export function getNativeNotifications(): Notifications | null {
  if (Platform.OS === 'web' || isRunningInExpoGo()) return null;
  if (notifications !== undefined) return notifications;
  if (Platform.OS === 'android' && !requireOptionalNativeModule('ExpoTopicSubscriptionModule')) return unavailable();
  try {
    notifications = require('expo-notifications') as Notifications;
    return notifications;
  } catch (error) {
    if (error instanceof Error && /Cannot find native module/.test(error.message)) return unavailable();
    throw error;
  }
}
