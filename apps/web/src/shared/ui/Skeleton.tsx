import { cn } from '@/shared/lib/cn';

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-[var(--radius-control)] bg-gradient-to-r from-background via-surface to-background', className)} />;
}
