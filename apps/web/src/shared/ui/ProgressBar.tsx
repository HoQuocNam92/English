import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const progressVariants = cva('h-full rounded-full transition-all', {
  variants: {
    tone: {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      ai: 'bg-ai-accent'
    }
  },
  defaultVariants: {
    tone: 'primary'
  }
});

export interface ProgressBarProps extends VariantProps<typeof progressVariants> {
  value: number;
  max?: number;
  className?: string;
  trackClassName?: string;
}

export function ProgressBar({ value, max = 100, tone, className, trackClassName }: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div
      aria-label={`Progress ${percentage.toFixed(0)} percent`}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-background', trackClassName)}
    >
      <div className={cn(progressVariants({ tone }), className)} style={{ width: `${percentage}%` }} />
    </div>
  );
}
