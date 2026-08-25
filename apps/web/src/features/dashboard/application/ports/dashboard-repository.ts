export interface DashboardStat {
  label: string;
  value: string;
  helper: string;
}

export interface DashboardSummary {
  stats: DashboardStat[];
  recentActivities: string[];
  recommendationTitle: string;
  recommendationDescription: string;
}

export interface DashboardRepository {
  getSummary(): Promise<DashboardSummary>;
}
