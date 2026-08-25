import { useEffect, useMemo, useState } from 'react';
import type {
  LearnerProfileFilterOptions,
  LearnerProfileListFilters,
  LearnerProfileListItem
} from '../application/ports';
import { getLearnerProfileFilterOptions, listLearnerProfiles } from '../application/use-cases';
import { MockLearnerProfileRepository } from '../infrastructure/mock';

export function useLearnerProfiles(initialFilters: LearnerProfileListFilters = { page: 1, limit: 10 }) {
  const repository = useMemo(() => new MockLearnerProfileRepository(), []);
  const [items, setItems] = useState<LearnerProfileListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<LearnerProfileListFilters>(initialFilters);
  const [filterOptions, setFilterOptions] = useState<LearnerProfileFilterOptions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const [res, opts] = await Promise.all([
        listLearnerProfiles(repository, filters),
        getLearnerProfileFilterOptions(repository)
      ]);
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setFilterOptions(opts);
      setLoading(false);
    })();
  }, [filters, repository]);

  return {
    items,
    total,
    totalPages,
    filters,
    setFilters,
    filterOptions,
    loading
  };
}
