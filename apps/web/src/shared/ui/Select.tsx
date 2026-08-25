import * as React from 'react';
import { cn } from '@/shared/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
}

export function Select({ className, label, id, options, placeholder, ...props }: SelectProps) {
  return (
    <label className="grid gap-1">
      {label ? <span className="text-sm font-semibold text-foreground">{label}</span> : null}
      <select
        id={id}
        className={cn(
          'min-h-11 w-full rounded-[var(--radius-control)] border border-border bg-surface px-4 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
          className
        )}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
