'use client';

import { getApp, getApps, initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { apiClient } from '@/shared/api/api-client';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export async function registerWebLearningNotifications({ requestPermission = true }: { requestPermission?: boolean } = {}) {
  if (typeof window === 'undefined' || !(await isSupported())) return false;
  if (!config.apiKey || !config.projectId || !config.messagingSenderId || !config.appId || !process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) return false;
  const permission = requestPermission ? await Notification.requestPermission() : Notification.permission;
  if (permission !== 'granted') return false;
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const app = getApps().length ? getApp() : initializeApp(config);
  const messaging = getMessaging(app);
  const token = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, serviceWorkerRegistration: registration });
  if (!token) return false;
  await apiClient.post('/notifications/subscriptions', { token, platform: 'web' });
  onMessage(messaging, payload => {
    if (Notification.permission === 'granted') new Notification(payload.notification?.title || 'TechEnglish Pro', { body: payload.notification?.body });
  });
  return true;
}
