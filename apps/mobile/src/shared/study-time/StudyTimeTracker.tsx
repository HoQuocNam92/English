import { useEffect } from 'react';
import { AppState } from 'react-native';
import { usePathname } from 'expo-router';
import { useAuth } from '../store/auth-context';
import { api } from '../api/api-client';

export function StudyTimeTracker() {
  const path = usePathname();
  const { user } = useAuth();
  const studying = /^\/(lessons\/[^/]+|flashcards(?:$|\/index$)|quiz\/[^/]+|placement-test$|certifications\/[^/]+\/topics\/[^/]+)/.test(path);
  useEffect(() => {
    if (!user || !studying) return;
    let session: { id: string; start: number; ready: boolean } | null = null;
    const send = (current: NonNullable<typeof session>) => api.post('/learner-profiles/me/study-time', { sessionId: current.id, seconds: Math.min(86400, Math.floor((Date.now() - current.start) / 1000)) }).catch(() => undefined);
    const begin = () => {
      if (session) return;
      const current = { id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2), start: Date.now(), ready: false };
      session = current;
      void api.post('/learner-profiles/me/study-time', { sessionId: current.id, seconds: 0 }).then(() => { current.ready = true; current.start = Date.now(); }).catch(() => { if (session === current) session = null; });
    };
    const stop = () => { if (session?.ready) void send(session); session = null; };
    if (AppState.currentState === 'active') begin();
    const timer = setInterval(() => { if (AppState.currentState === 'active') { if (!session) begin(); else if (session.ready) void send(session); } }, 15000);
    const listener = AppState.addEventListener('change', state => { if (state === 'active') begin(); else stop(); });
    return () => { clearInterval(timer); listener.remove(); stop(); };
  }, [user?.id, studying, path]);
  return null;
}
