import { useEffect, useMemo, useState } from 'react';
import type { DashboardSummary } from '../application/ports/dashboard-repository';
import { getDashboardSummary } from '../application/use-cases';
import { MockDashboardRepository } from '../infrastructure/mock';

export function useDashboard() {
  const repository = useMemo(() => new MockDashboardRepository(), []);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const nextSummary = await getDashboardSummary(repository);
      setSummary(nextSummary);
      setLoading(false);
    })();
  }, [repository]);

  return {
    summary,
    loading
  };
}
