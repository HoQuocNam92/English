import type { LearnerProfileDetail, LearnerProfileRepository } from '../ports/learner-profile-repository';

export const getLearnerProfileDetail = async (
  repository: LearnerProfileRepository,
  id: string
): Promise<LearnerProfileDetail | null> => {
  return repository.findById(id);
};
