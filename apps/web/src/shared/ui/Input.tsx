import * as React from 'react';
import { cn } from '@/shared/lib/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const controlId = id ?? generatedId;
    const field = <input ref={ref} id={controlId} aria-invalid={Boolean(error)} className={cn('ui-control w-full px-4 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:opacity-60', error && 'border-red-500 focus:border-red-500 focus:ring-red-200', className)} {...props} />;
    if (!label && !hint && !error) return field;
    return <label htmlFor={controlId} className="grid gap-1">{label ? <span className="text-sm font-semibold text-foreground">{label}</span> : null}{field}{error || hint ? <span className={cn('text-xs', error ? 'text-red-600' : 'text-muted-foreground')}>{error ?? hint}</span> : null}</label>;
  }
);
Input.displayName = 'Input';
