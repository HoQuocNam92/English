'use client';

import * as React from 'react';
import { AppIcon } from './AppIcon';

type Notice = { id: string; message: string; title: string; createdAt: number; read: boolean };
const EVENT = 'techenglish:notification-history';

export function recordNotification(message: string, title: string, id = crypto.randomUUID()) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { id, message, title, createdAt: Date.now(), read: false } }));
}

export function NotificationBell({ userId }: { userId?: string }) {
  const [items, setItems] = React.useState<Notice[]>([]);
  const [open, setOpen] = React.useState(false);
  const root = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const panelId = React.useId();
  React.useEffect(() => {
    setOpen(false);
    setItems([]);
    if (!userId) return;
    const key = `techenglish:notifications:${userId}`;
    let current: Notice[] = [];
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
      if (Array.isArray(saved)) current = saved.filter((n): n is Notice => n && typeof n.id === 'string' && typeof n.title === 'string' && typeof n.message === 'string' && typeof n.createdAt === 'number' && typeof n.read === 'boolean').slice(0, 100);
    } catch { /* History remains available in memory when storage is unavailable. */ }
    setItems(current);
    const receive = (event: Event) => {
      const notice = (event as CustomEvent<Notice>).detail;
      if (current.some(item => item.id === notice.id)) return;
      current = [notice, ...current].slice(0, 100);
      setItems(current);
      try { localStorage.setItem(key, JSON.stringify(current)); } catch { /* Storage may be full. */ }
    };
    const update = (event: Event) => {
      current = (event as CustomEvent<Notice[]>).detail;
      setItems(current);
      try { localStorage.setItem(key, JSON.stringify(current)); } catch { /* Keep in-memory state. */ }
    };
    window.addEventListener(EVENT, receive);
    window.addEventListener(`${EVENT}:update`, update);
    return () => {
      window.removeEventListener(EVENT, receive);
      window.removeEventListener(`${EVENT}:update`, update);
    };
  }, [userId]);
  React.useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  const update = (next: Notice[]) => window.dispatchEvent(new CustomEvent(`${EVENT}:update`, { detail: next }));
  const unread = items.filter(item => !item.read).length;
  return <div ref={root} className="relative shrink-0">
    <button ref={trigger} type="button" aria-label={`Thông báo${unread ? `, ${unread} chưa đọc` : ''}`} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)} className="relative flex h-10 w-10 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-high focus-visible:outline-primary">
      <AppIcon className="text-[22px]">notifications</AppIcon>
      {unread > 0 && <span className="absolute -right-1 top-0 rounded-full bg-red-600 px-1.5 text-[10px] font-bold leading-4 text-white">{unread > 99 ? '99+' : unread}</span>}
    </button>
    {open && <section id={panelId} aria-label="Lịch sử thông báo" className="absolute right-0 top-12 z-[60] w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-xl max-sm:fixed max-sm:right-4 max-sm:top-16">
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant/50 p-4"><h2 className="font-bold text-on-surface">Thông báo</h2>{unread > 0 && <button type="button" onClick={() => update(items.map(item => ({ ...item, read: true })))} className="text-xs font-semibold text-primary">Đọc tất cả</button>}</div>
      <div className="max-h-[60vh] overflow-y-auto">
        {items.length === 0 ? <p className="p-8 text-center text-sm text-on-surface-variant">Chưa có thông báo nào.</p> : <ul>{items.map(item => <li key={item.id}><button type="button" onClick={() => update(items.map(n => n.id === item.id ? { ...n, read: true } : n))} className={`w-full border-b border-outline-variant/30 p-4 text-left hover:bg-surface-container-low ${!item.read ? 'bg-primary/5' : ''}`}>
          <div className="flex items-center gap-2"><span className="flex-1 font-semibold text-sm text-on-surface">{item.title}</span>{!item.read && <span aria-label="Chưa đọc" className="h-2 w-2 rounded-full bg-primary" />}</div>
          <p className="mt-1 break-words text-sm text-on-surface-variant">{item.message}</p><time dateTime={new Date(item.createdAt).toISOString()} className="mt-2 block text-xs text-on-surface-variant">{new Date(item.createdAt).toLocaleString('vi-VN')}</time>
        </button></li>)}</ul>}
      </div>
      <p className="p-3 text-xs text-on-surface-variant">Lưu tối đa 100 thông báo gần nhất trên trình duyệt này.</p>
    </section>}
  </div>;
}
