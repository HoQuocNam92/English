import { Dropdown } from '@/shared/ui/Dropdown';
import * as React from 'react';
import { cn } from '@/shared/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select({ className, label, id, options, placeholder, error, ...props }, ref) {
  const generatedId = React.useId();
  const controlId = id ?? generatedId;
  return (
    <label htmlFor={controlId} className="grid gap-1">
      {label ? <span className="text-sm font-semibold text-foreground">{label}</span> : null}
      <span className="relative block">
      <Dropdown
        ref={ref}
        id={controlId}
        aria-invalid={Boolean(error)}
        className={cn(
          'ui-control w-full appearance-none px-4 pr-9 text-sm text-foreground disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:opacity-60',
          error && 'border-destructive',
          className
        )}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </Dropdown>
      </span>
      {error ? <span className="text-xs font-normal text-destructive">{error}</span> : null}
    </label>
  );
});
