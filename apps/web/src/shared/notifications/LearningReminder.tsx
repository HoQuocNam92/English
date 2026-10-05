'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, X } from 'lucide-react';
import { useAuth } from '@/features/auth/presentation';
import { apiClient } from '@/shared/api/api-client';

type Reminder = { id: string; title: string; body: string };

export function LearningReminder() {
  const { session } = useAuth();
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const account = session?.user.email;
  useEffect(() => {
    setReminder(null);
    if (!account) return;
    let active = true;
    let busy = false;
    const load = async () => {
      if (busy || document.visibilityState !== 'visible') return;
      busy = true;
      try {
        const pending = await apiClient.get<Reminder[]>('/notifications/pending');
        if (active) setReminder(pending[0] ?? null);
      } catch { /* Retry on the next poll if the server is unavailable. */ }
      finally { busy = false; }
    };
    void load();
    const timer = window.setInterval(load, 30000);
    window.addEventListener('focus', load);
    document.addEventListener('visibilitychange', load);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', load);
      document.removeEventListener('visibilitychange', load);
    };
  }, [account]);
  const dismiss = async () => {
    if (!reminder) return;
    try {
      await apiClient.patch(`/notifications/${reminder.id}/read`, {});
      setReminder(null);
    } catch { /* Keep the reminder visible so dismissal can be retried. */ }
  };
  if (!reminder) return null;

  return (
    <aside role="status" aria-live="polite" className="fixed bottom-5 right-5 z-[9999] w-[min(380px,calc(100vw-40px))] rounded-2xl border border-primary/20 bg-white p-5 shadow-xl">
      <div className="flex items-start gap-3">
        <Bell className="mt-1 shrink-0 text-primary" size={23} />
        <div className="flex-1"><h2 className="font-bold text-on-surface">{reminder.title}</h2><p className="mt-1 text-sm leading-6 text-on-surface-variant">{reminder.body}</p><Link href="/learn" onClick={() => void dismiss()} className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Học ngay</Link></div>
        <button type="button" aria-label="Đóng nhắc học" onClick={() => void dismiss()} className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container"><X size={18} /></button>
      </div>
    </aside>
  );
}
