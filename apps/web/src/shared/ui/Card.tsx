import * as React from 'react';
import { cn } from '@/shared/lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <section
      className={cn('rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[0_1px_3px_rgba(15,23,24,0.06)]', className)}
      {...props}
    />
  );
}
