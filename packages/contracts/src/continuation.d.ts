export interface ContinuationStep {
  id: string;
  day: number;
  title: string;
  description: string;
  href: string;
  minutes: number;
  kind: 'vocabulary' | 'lesson' | 'practice';
}
export interface ContinuationPlan {
  id: string;
  kind: 'review' | 'application' | 'certificate';
  title: string;
  objective: string;
  reason: string;
  durationDays: number;
  dailyMinutes: number;
  steps: ContinuationStep[];
}
export interface ActiveContinuation {
  recordId: string;
  startedAt: string;
  completedStepIds: string[];
  plan: ContinuationPlan;
}
export interface ContinuationOptions {
  eligible: boolean;
  plans: ContinuationPlan[];
  active: ActiveContinuation | null;
  certificateMessage?: string;
}
