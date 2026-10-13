import { RequiredMark } from '@/shared/ui/RequiredMark';
import * as React from 'react';
import { cn } from '@/shared/lib/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'> {
  label?: string;
  containerClassName?: string;
  hint?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, containerClassName, label, hint, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const controlId = id ?? generatedId;
    const field = <input ref={ref} id={controlId} aria-invalid={Boolean(error)} aria-describedby={error || hint ? `${controlId}-message` : undefined} className={cn('ui-control w-full px-4 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:opacity-60', error && '!border-error focus:!border-error focus:!ring-red-200', className)} {...props} />;
    if (!label && !hint && !error) return field;
    return <label htmlFor={controlId} className={cn('grid gap-1', containerClassName)}>{label ? <span className="text-sm font-semibold text-foreground">{label}{props.required && !label.includes('*') && <RequiredMark />}</span> : null}{field}{error || hint ? <span id={`${controlId}-message`} role={error ? 'alert' : undefined} className={cn('text-xs', error ? 'text-red-600' : 'text-muted-foreground')}>{error ?? hint}</span> : null}</label>;
  }
);
Input.displayName = 'Input';
