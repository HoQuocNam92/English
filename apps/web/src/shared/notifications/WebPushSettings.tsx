'use client';
import { useEffect } from 'react';
import { registerWebLearningNotifications } from './firebase-client';

// Restore an existing notification registration without rendering diagnostic controls.
export function WebPushSettings({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled || !('Notification' in window) || Notification.permission !== 'granted') return;
    void registerWebLearningNotifications({ requestPermission: false }).catch(() => undefined);
  }, [enabled]);
  return null;
}
