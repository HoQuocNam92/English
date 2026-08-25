import { useEffect, useMemo, useState } from 'react';
import type { LearnerProfileDetail } from '../application/ports';
import { getLearnerProfileDetail } from '../application/use-cases';
import { MockLearnerProfileRepository } from '../infrastructure/mock';

export function useLearnerProfileDetail(id: string) {
  const repository = useMemo(() => new MockLearnerProfileRepository(), []);
  const [profile, setProfile] = useState<LearnerProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const nextProfile = await getLearnerProfileDetail(repository, id);
      setProfile(nextProfile);
      setLoading(false);
    })();
  }, [id, repository]);

  return {
    profile,
    loading
  };
}
