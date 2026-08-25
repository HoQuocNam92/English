import type { DashboardRepository, DashboardSummary } from '../ports/dashboard-repository';

export const getDashboardSummary = async (repository: DashboardRepository): Promise<DashboardSummary> => {
  return repository.getSummary();
};
