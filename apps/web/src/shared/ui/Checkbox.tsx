import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <label className="relative inline-flex size-4 shrink-0">
      <input ref={ref} type="checkbox" className={cn('peer size-4 appearance-none rounded border border-input bg-card shadow-xs transition-colors checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50', className)} {...props} />
      <Check className="pointer-events-none absolute inset-0 size-4 scale-0 p-0.5 text-primary-foreground transition-transform peer-checked:scale-100" />
    </label>
  )
);
Checkbox.displayName = 'Checkbox';
