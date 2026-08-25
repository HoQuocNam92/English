import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const badgeVariants = cva(
  'inline-flex min-h-7 items-center justify-center rounded-full border px-3 text-xs font-semibold',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-background text-foreground',
        primary: 'border-primary-container bg-primary-container text-primary-foreground',
        ai: 'border-ai-accent bg-violet-50 text-ai-accent'
      }
    },
    defaultVariants: {
      tone: 'neutral'
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
