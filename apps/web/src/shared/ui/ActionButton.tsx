'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/shared/lib/cn';

const actions = {
  view: { label: 'Xem chi tiết', icon: 'visibility', tone: 'text-on-surface-variant hover:bg-surface-container' },
  edit: { label: 'Chỉnh sửa', icon: 'edit', tone: 'text-primary hover:bg-primary/10' },
  publish: { label: 'Xuất bản', icon: 'publish', tone: 'text-emerald-700 hover:bg-emerald-50' },
  archive: { label: 'Lưu trữ', icon: 'archive', tone: 'text-amber-700 hover:bg-amber-50' },
  draft: { label: 'Chuyển về nháp', icon: 'edit_note', tone: 'text-amber-700 hover:bg-amber-50' },
  lock: { label: 'Khóa', icon: 'lock', tone: 'text-amber-700 hover:bg-amber-50' },
  unlock: { label: 'Mở khóa', icon: 'lock_open', tone: 'text-emerald-700 hover:bg-emerald-50' },
  remove: { label: 'Gỡ khỏi nhóm', icon: 'person_remove', tone: 'text-error hover:bg-error-container' },
  delete: { label: 'Xóa', icon: 'delete', tone: 'text-error hover:bg-error-container' },
} as const;

export interface ActionButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  action: keyof typeof actions;
  href?: string;
  loading?: boolean;
  label?: string;
}

export function ActionGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('flex flex-wrap items-center justify-end gap-2', className)} />;
}

/** Compact record actions; use Button for page actions and form submissions. */
export function ActionButton({ action, href, loading = false, label, title, disabled, className, ...props }: ActionButtonProps) {
  const config = actions[action];
  const text = label ?? config.label;
  const blocked = disabled || loading;
  const classes = cn(
    'inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    config.tone,
    className,
  );
  const content = <><span aria-hidden="true" className={cn('material-symbols-outlined text-[18px]', loading && 'animate-spin')}>{loading ? 'progress_activity' : config.icon}</span><span>{loading ? 'Đang xử lý...' : text}</span></>;

  if (href && !blocked) {
    return <Link href={href} className={classes} title={title ?? text} aria-label={props['aria-label'] ?? title ?? text}>{content}</Link>;
  }
  return <button {...props} type={props.type ?? 'button'} disabled={blocked} aria-busy={loading || undefined} title={title ?? text} aria-label={props['aria-label'] ?? title ?? text} className={classes}>{content}</button>;
}
