import { useEffect, useMemo, useState } from 'react';
import type { UserRole } from '@techenglish/contracts';
import type { UserListItem } from '../application/ports';
import { listUsers } from '../application/use-cases';
import { MockUserRepository } from '../infrastructure/mock';

export function useUsers(search: string, role: UserRole | 'all') {
  const repository = useMemo(() => new MockUserRepository(), []);
  const [items, setItems] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    void (async () => {
      const nextItems = await listUsers(repository, { search, role });
      setItems(nextItems);
      setLoading(false);
    })();
  }, [repository, role, search]);

  return {
    items,
    loading
  };
}
