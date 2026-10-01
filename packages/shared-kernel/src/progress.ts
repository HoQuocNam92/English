export type LearningGoal = 'vocabulary' | 'certification' | 'both';

export interface ProgressMilestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  xp: number;
  color: 'violet' | 'blue' | 'fuchsia' | 'orange' | 'amber';
  unlocked: boolean;
  progressPercent: number;
}

export interface ProgressAttempt {
  id: string;
  exam?: { title?: string | null } | null;
  passed?: boolean | null;
  scorePercent?: number | null;
}

export interface ProgressPayload {
  milestones?: ProgressMilestone[] | null;
  gamification?: {
    totalXp?: number | null;
    unlockedCount?: number | null;
    totalMilestones?: number | null;
    studyStreak?: number | null;
    learningGoal?: LearningGoal | null;
  } | null;
  recentAttempts?: ProgressAttempt[] | null;
}

const nonNegative = (value: unknown): number => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0;
const percent = (value: unknown): number => Math.min(100, Math.round(nonNegative(value)));

export function progressViewModel(data: ProgressPayload | null | undefined) {
  const milestones = Array.isArray(data?.milestones) ? data.milestones : [];
  const game = data?.gamification;
  const totalMilestones = milestones.length;
  const unlockedCount = milestones.filter(item => item.unlocked).length;
  const learningGoal: LearningGoal = game?.learningGoal === 'certification' || game?.learningGoal === 'both' ? game.learningGoal : 'vocabulary';
  return {
    milestones: milestones.map(item => ({ ...item, progressPercent: percent(item.progressPercent) })),
    recentAttempts: Array.isArray(data?.recentAttempts) ? data.recentAttempts.slice(0, 3) : [],
    totalMilestones,
    unlockedCount,
    overallPercent: totalMilestones ? Math.round(unlockedCount / totalMilestones * 100) : 0,
    totalXp: nonNegative(game?.totalXp),
    studyStreak: nonNegative(game?.studyStreak),
    learningGoal,
    includesVocabulary: learningGoal === 'vocabulary' || learningGoal === 'both',
    includesCertification: learningGoal === 'certification' || learningGoal === 'both',
  };
}
