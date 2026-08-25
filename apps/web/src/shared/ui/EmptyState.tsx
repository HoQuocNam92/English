import * as React from 'react';
import { cn } from '@/shared/lib/cn';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div className={cn('grid gap-3 rounded-[var(--radius-card)] border border-dashed border-outline bg-background p-6', className)} {...props}>
      <strong className="text-xl font-semibold text-foreground">{title}</strong>
      <p className="m-0 text-sm leading-5 text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
