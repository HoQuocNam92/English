import type {
  LearnerProfileFilterOptions,
  LearnerProfileRepository
} from '../ports/learner-profile-repository';

export const getLearnerProfileFilterOptions = async (
  repository: LearnerProfileRepository
): Promise<LearnerProfileFilterOptions> => {
  return repository.getFilterOptions();
};
