import * as React from 'react';
import { cn } from '@/shared/lib/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'> {
  label?: string;
}

export function Input({ className, label, id, ...props }: InputProps) {
  return (
    <label className="grid gap-1">
      {label ? <span className="text-sm font-semibold text-foreground">{label}</span> : null}
      <input
        id={id}
        className={cn(
          'min-h-11 w-full rounded-[var(--radius-control)] border border-border bg-surface px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20',
          className
        )}
        {...props}
      />
    </label>
  );
}
