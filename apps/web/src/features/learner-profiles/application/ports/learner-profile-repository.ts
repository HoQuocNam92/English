import type { PaginatedResult, PaginationInput } from '@techenglish/contracts';

export interface LearnerProfileTopicProgress {
  id: string;
  title: string;
  progressPercent: number;
  tone: 'primary' | 'secondary' | 'ai';
}

export interface LearnerProfileAssessment {
  id: string;
  title: string;
  submittedAtLabel: string;
  durationLabel: string;
  score: number;
  maxScore: number;
  status: 'passed' | 'needs-review';
}

export interface LearnerProfileSummary {
  id: string;
  displayName: string;
  email: string;
  avatarInitials: string;
  level: string;
  itField: string;
  interests: string[];
  careerGoal: string;
  certificateGoal: string;
  certificateLevelLabel: string;
  progressPercent: number;
}

export interface LearnerProfileListFilters extends PaginationInput {
  level?: string;
  itField?: string;
  careerGoal?: string;
  certificateGoal?: string;
}

export interface LearnerProfileListItem extends LearnerProfileSummary {}

export interface LearnerProfileFilterOptions {
  levels: string[];
  itFields: string[];
  careerGoals: string[];
  certificateGoals: string[];
}

export interface LearnerProfileDetail extends LearnerProfileSummary {
  joinedAtLabel: string;
  lastActiveLabel: string;
  status: 'active' | 'inactive';
  estimatedCompletionLabel: string;
  completedLessons: number;
  totalLessons: number;
  lessonGrowthLabel: string;
  averageScore: number;
  averageScoreDeltaLabel: string;
  topicProgress: LearnerProfileTopicProgress[];
  recentAssessments: LearnerProfileAssessment[];
}

export interface LearnerProfileRepository {
  list(input: LearnerProfileListFilters): Promise<PaginatedResult<LearnerProfileListItem>>;
  getFilterOptions(): Promise<LearnerProfileFilterOptions>;
  findById(id: string): Promise<LearnerProfileDetail | null>;
}
