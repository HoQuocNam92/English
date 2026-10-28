import { useEffect, useState } from 'react';
import { usePathname, useRootNavigationState, useRouter } from 'expo-router';
import { getNativeNotifications } from './native-notifications';
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
    const notifications = getNativeNotifications();
    if (!notifications) return;
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
    void getNativeNotifications()?.clearLastNotificationResponseAsync().catch(() => undefined);
  }, [pendingRoute, isLoggedIn, isLoading, navigation?.key, pathname, router]);
  return null;
}
