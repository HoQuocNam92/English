import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export function FilterPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('rounded-xl border border-outline-variant bg-white p-4', className)} />;
}
