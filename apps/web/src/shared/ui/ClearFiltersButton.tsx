'use client';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export function ClearFiltersButton({ className, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'>) {
  return <button {...props} type="button" className={cn('ui-button ui-button-outline h-11 w-24 flex-none whitespace-nowrap self-end justify-self-start px-4 text-sm', className)}>Xóa lọc</button>;
}
