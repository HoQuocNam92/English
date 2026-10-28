export function goalProgress(actual: unknown, goal: unknown, unit: string): {
  value: number;
  target: number;
  remaining: number;
  exceeded: number;
  percent: number;
  status: string;
  description: string;
};
