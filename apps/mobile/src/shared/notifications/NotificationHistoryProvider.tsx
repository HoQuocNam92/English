import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import type { Notification } from 'expo-notifications';
import { api } from '../api/api-client';
import { useAuth } from '../store/auth-context';
import { createNotificationHistory, type Notice } from './notification-history';

const history = createNotificationHistory(AsyncStorage);
type HistoryContext = { items: Notice[]; loaded: boolean; error: string; refresh(): Promise<void>; markRead(id?: string): Promise<void>; recordNative(notification: Notification, read?: boolean): Promise<void> };
const Context = createContext<HistoryContext | null>(null);

export function NotificationHistoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth(); const userId = user?.id;
  const scope = useRef({ userId });
  if (scope.current.userId !== userId) scope.current = { userId };
  const polling = useRef<typeof scope.current | null>(null);
  const [state, setState] = useState<{ userId?: string; items: Notice[]; loaded: boolean }>({ items: [], loaded: false });
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    if (!userId) return;
    const session = scope.current;
    if (polling.current === session) return;
    polling.current = session;
    try {
      const pending = await api.get<{ id: string; title: string; body: string; route?: string; createdAt?: string }[]>('/notifications/pending');
      if (scope.current !== session) return;
      await Promise.all(pending.map(notice => history.add(userId, { id: notice.id, serverId: notice.id, title: notice.title, message: notice.body, createdAt: Date.parse(notice.createdAt ?? '') || Date.now(), read: false, href: notice.route })));
      if (scope.current === session) setError('');
    } catch { if (scope.current === session) setError('Chưa tải được nhắc học mới. Bạn vẫn có thể xem lịch sử đã lưu.'); }
    finally { if (polling.current === session) polling.current = null; }
  }, [userId]);
  useEffect(() => {
    setError('');
    if (!userId) return;
    let active = true;
    const unsubscribe = history.subscribe(userId, items => { if (active) setState({ userId, items, loaded: true }); });
    void history.load(userId);
    void refresh();
    const timer = setInterval(() => { if (AppState.currentState === 'active') void refresh(); }, 30000);
    const subscription = AppState.addEventListener('change', value => { if (value === 'active') void refresh(); });
    return () => { active = false; unsubscribe(); clearInterval(timer); subscription.remove(); };
  }, [userId, refresh]);
  const recordNative = useCallback(async (notification: Notification, read = false) => {
    if (!userId) return;
    const { identifier, content } = notification.request;
    const id = `${identifier}:${notification.date}`;
    await history.add(userId, { id, title: content.title || 'Nhắc học', message: content.body || '', href: typeof content.data?.route === 'string' ? content.data.route : undefined, createdAt: notification.date || Date.now(), read });
    if (read) await history.markRead(userId, id);
  }, [userId]);
  const items = state.userId === userId ? state.items : [];
  const markRead = async (id?: string) => {
    if (!userId) return;
    const session = scope.current;
    const unread = items.filter(item => (!id || item.id === id) && !item.read && item.serverId);
    await history.markRead(userId, id);
    if (scope.current !== session) return;
    await Promise.allSettled(unread.map(item => api.patch(`/notifications/${item.serverId}/read`, {})));
  };
  return <Context.Provider value={{ items, loaded: !userId || state.userId === userId && state.loaded, error, refresh, markRead, recordNative }}>{children}</Context.Provider>;
}
export function useNotificationHistory() {
  const context = useContext(Context);
  if (!context) throw new Error('NotificationHistoryProvider is missing');
  return context;
}
