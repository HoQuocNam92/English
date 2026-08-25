import type { PaginatedResult } from '@techenglish/contracts';
import type {
  LearnerProfileListFilters,
  LearnerProfileListItem,
  LearnerProfileRepository
} from '../ports/learner-profile-repository';

export const listLearnerProfiles = async (
  repository: LearnerProfileRepository,
  input: LearnerProfileListFilters
): Promise<PaginatedResult<LearnerProfileListItem>> => {
  return repository.list(input);
};
