'use client';
import { useEffect } from 'react';
import { API_BASE_URL } from '@/shared/config/env';
import { apiClient } from '@/shared/api/api-client';
import { AUTH_SESSION_KEY, clearAuthSession, sessionStorageTarget } from '@/shared/storage';

// Bearer token stays in the request header, never in an EventSource URL or audit log.
export function SessionMonitor() {
  useEffect(() => {
    let stopped = false, retry: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    const connect = async () => {
      try {
        const session = JSON.parse(sessionStorageTarget().getItem(AUTH_SESSION_KEY) ?? 'null');
        if (!session?.accessToken || stopped) return;
        const response = await fetch(`${API_BASE_URL}/auth/session-events`, { headers: { Authorization: `Bearer ${session.accessToken}` }, signal: controller.signal, cache: 'no-store' });
        if (response.status === 401) { await apiClient.get('/auth/me'); return; }
        if (!response.ok || !response.body) return;
        const reader = response.body.getReader(), decoder = new TextDecoder(); let pending = '';
        try {
          while (!stopped) {
            const next = await reader.read(); if (next.done) break;
            pending += decoder.decode(next.value, { stream: true }).replace(/\r/g, '');
            let end: number;
            while ((end = pending.indexOf('\n\n')) >= 0) {
              const event = pending.slice(0, end); pending = pending.slice(end + 2);
              if (/^event:\s*revoked$/m.test(event)) { stopped = true; clearAuthSession(); window.location.replace('/login'); return; }
            }
          }
        } finally { await reader.cancel().catch(() => {}); }
      } catch { /* A network outage is not evidence of a revoked session. */ }
      finally { if (!stopped) retry = setTimeout(() => void connect(), 5000); }
    };
    void connect();
    return () => { stopped = true; controller.abort(); if (retry) clearTimeout(retry); };
  }, []);
  return null;
}
