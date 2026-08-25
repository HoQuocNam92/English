import type { DashboardRepository, DashboardSummary } from '../../application/ports/dashboard-repository';

const mockDashboardSummary: DashboardSummary = {
  stats: [
    {
      label: 'Active learners',
      value: '128',
      helper: '+12 this week'
    },
    {
      label: 'Published lessons',
      value: '42',
      helper: 'Across 7 IT domains'
    },
    {
      label: 'Average score',
      value: '84%',
      helper: 'Mock test performance'
    }
  ],
  recentActivities: [
    'Teacher Demo published a new lesson for Cloud Computing.',
    'Admin Demo reviewed the weekly learner progress summary.',
    'Twenty-two learners completed a technical vocabulary quiz.'
  ],
  recommendationTitle: 'AI recommendation preview',
  recommendationDescription:
    'Highlight weak topics, suggested next lessons, and practice priorities here once the recommendation module is connected.'
};

export class MockDashboardRepository implements DashboardRepository {
  async getSummary(): Promise<DashboardSummary> {
    return mockDashboardSummary;
  }
}
