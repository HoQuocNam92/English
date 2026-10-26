export type Notice = { id: string; title: string; message: string; createdAt: number; read: boolean; href?: string; serverId?: string };
type Storage = { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<unknown> };

/** Serialized per account so a notification arriving during hydration/read-all is retained. */
export function createNotificationHistory(storage: Storage) {
  const cache = new Map<string, Notice[]>();
  const queues = new Map<string, Promise<unknown>>();
  const listeners = new Map<string, Set<(items: Notice[]) => void>>();
  const key = (userId: string) => `techenglish:notifications:${userId}`;
  const run = (userId: string, update?: (items: Notice[]) => Notice[]) => {
    const job = (queues.get(userId) ?? Promise.resolve()).then(async () => {
      if (!cache.has(userId)) {
        let items: Notice[] = [];
        try {
          const saved: unknown = JSON.parse(await storage.getItem(key(userId)) ?? '[]');
          if (Array.isArray(saved)) {
            const ids = new Set<string>();
            items = saved.filter((n): n is Notice => {
              if (!n || typeof n.id !== 'string' || ids.has(n.id) || typeof n.title !== 'string' || typeof n.message !== 'string' || !Number.isFinite(n.createdAt) || typeof n.read !== 'boolean') return false;
              ids.add(n.id); return true;
            }).sort((a, b) => b.createdAt - a.createdAt).slice(0, 100);
          }
        } catch { /* Match web: retain in-memory history if storage is unavailable. */ }
        cache.set(userId, items);
      }
      const items = update ? update(cache.get(userId)!).sort((a, b) => b.createdAt - a.createdAt).slice(0, 100) : cache.get(userId)!;
      cache.set(userId, items);
      for (const notify of listeners.get(userId) ?? []) notify([...items]);
      if (update) try { await storage.setItem(key(userId), JSON.stringify(items)); } catch { /* Keep the visible history usable. */ }
      return [...items];
    });
    queues.set(userId, job.catch(() => undefined));
    return job;
  };
  return {
    load: (userId: string) => run(userId),
    add: (userId: string, notice: Notice) => run(userId, items => items.some(item => item.id === notice.id) ? items : [notice, ...items]),
    markRead: (userId: string, id?: string) => run(userId, items => items.map(item => !id || item.id === id ? { ...item, read: true } : item)),
    subscribe(userId: string, listener: (items: Notice[]) => void) {
      const group = listeners.get(userId) ?? new Set();
      group.add(listener); listeners.set(userId, group);
      return () => { group.delete(listener); };
    },
  };
}
