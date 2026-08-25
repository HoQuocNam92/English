import * as React from 'react';
import { cn } from '@/shared/lib/cn';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}
export interface TableSectionProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}
export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export function Table({ className, ...props }: TableProps) {
  return <table className={cn('w-full border-collapse text-left', className)} {...props} />;
}

export function TableHeader({ className, ...props }: TableSectionProps) {
  return <thead className={cn(className)} {...props} />;
}

export function TableBody({ className, ...props }: TableSectionProps) {
  return <tbody className={cn(className)} {...props} />;
}

export function TableRow({ className, ...props }: TableRowProps) {
  return <tr className={cn(className)} {...props} />;
}

export function TableHead({ className, ...props }: TableHeadProps) {
  return <th className={cn('p-4 text-xs font-bold uppercase tracking-[0.05em]', className)} {...props} />;
}

export function TableCell({ className, ...props }: TableCellProps) {
  return <td className={cn('p-4 align-middle text-sm', className)} {...props} />;
}
