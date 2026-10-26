import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { usePathname, useRootNavigationState, useRouter } from 'expo-router';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useAuth } from '../store/auth-context';
import { mobileNotificationRoute } from '../navigation';
import { useNotificationHistory } from './NotificationHistoryProvider';
import type { Notification } from 'expo-notifications';

export function NotificationNavigation() {
  const router = useRouter();
  const navigation = useRootNavigationState();
  const pathname = usePathname();
  const { isLoggedIn, isLoading, user } = useAuth();
  const { recordNative } = useNotificationHistory();
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const [pendingNotification, setPendingNotification] = useState<Notification | null>(null);
  useEffect(() => {
    if (Platform.OS === 'web' || Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return;
    const notifications = require('expo-notifications') as typeof import('expo-notifications');
    let active = true;
    let received = false;
    const foreground = notifications.addNotificationReceivedListener(notification => { void recordNative(notification); });
    const subscription = notifications.addNotificationResponseReceivedListener(response => {
      received = true;
      if (active) { setPendingRoute(mobileNotificationRoute(response.notification.request.content.data?.route)); setPendingNotification(response.notification); }
    });
    void notifications.getLastNotificationResponseAsync().then(response => {
      if (active && !received && response) { setPendingRoute(mobileNotificationRoute(response.notification.request.content.data?.route)); setPendingNotification(response.notification); }
    }).catch(() => undefined);
    return () => { active = false; subscription.remove(); foreground.remove(); };
  }, [recordNative]);
  useEffect(() => {
    if (!pendingNotification || !user?.id) return;
    void recordNative(pendingNotification, true);
    setPendingNotification(null);
  }, [pendingNotification, user?.id, recordNative]);
  useEffect(() => {
    if (!pendingRoute || isLoading || !isLoggedIn || !navigation?.key || ['/', '/login', '/register'].includes(pathname)) return;
    router.push(pendingRoute as any);
    setPendingRoute(null);
    const notifications = require('expo-notifications') as typeof import('expo-notifications');
    void notifications.clearLastNotificationResponseAsync().catch(() => undefined);
  }, [pendingRoute, isLoggedIn, isLoading, navigation?.key, pathname, router]);
  return null;
}
