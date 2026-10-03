'use client';
import { AppIcon } from '@/shared/ui/AppIcon';

import * as React from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
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
  /** Show the label in menus or when the surrounding context needs it. */
  showLabel?: boolean;
}

/** Use one consistent overflow menu for record actions of any group size. */
export function ActionGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const items = React.Children.toArray(children);
  const compactMenu = items.length > 0 && items.every(item => React.isValidElement(item) && item.type === ActionButton);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const menuId = React.useId();
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  React.useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;
    const rect = trigger.getBoundingClientRect();
    const height = menu.getBoundingClientRect().height;
    setPosition({
      left: Math.max(8, Math.min(rect.right - 192, window.innerWidth - 200)),
      top: Math.max(8, rect.bottom + height + 8 <= window.innerHeight ? rect.bottom + 6 : rect.top - height - 6),
    });
    (menu.querySelector<HTMLElement>('button:not(:disabled), a[href]') ?? menu).focus();
    const outside = (event: PointerEvent) => {
      if (!trigger.contains(event.target as Node) && !menu.contains(event.target as Node)) setOpen(false);
    };
    const close = () => setOpen(false);
    const scroll = (event: Event) => { if (!menu.contains(event.target as Node)) close(); };
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', scroll, true);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', scroll, true);
    };
  }, [open]);

  const closeWithFocus = () => { setOpen(false); triggerRef.current?.focus(); };
  return <div {...props} className={cn('flex items-center justify-end gap-1', className)}>
    {compactMenu ? <>
      <button ref={triggerRef} type="button" title="Thao tác" aria-label="Thao tác" aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => setOpen(value => !value)} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); } }}>
        <AppIcon aria-hidden="true" className="" style={{ fontSize: 18 }}>more_horiz</AppIcon>
      </button>
      {open && createPortal(<div ref={menuRef} id={menuId} role="menu" tabIndex={-1} aria-label="Thao tác" style={position}
        className="fixed z-[100] w-48 max-h-[calc(100dvh-16px)] overflow-y-auto rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-1 shadow-lg"
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node) && !triggerRef.current?.contains(event.relatedTarget as Node)) setOpen(false); }}
        onKeyDown={event => {
          if (event.key === 'Escape') { event.preventDefault(); closeWithFocus(); }
          if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            const enabled = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]'));
            const index = enabled.indexOf(document.activeElement as HTMLElement);
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length;
            enabled[next]?.focus();
          }
        }}>
        {items.map(item => {
          const element = item as React.ReactElement<ActionButtonProps>;
          return React.cloneElement(element, {
            showLabel: true,
            role: 'menuitem',
            className: cn('w-full justify-start border-0 bg-transparent px-2.5 text-xs', element.props.className),
            onClick: event => { closeWithFocus(); element.props.onClick?.(event); },
          });
        })}
      </div>, document.body)}
    </> : items}
  </div>;
}

/** Compact record actions; use Button for page actions and form submissions. */
export function ActionButton({ action, href, loading = false, label, showLabel = false, title, disabled, className, ...props }: ActionButtonProps) {
  const config = actions[action];
  const text = label ?? config.label;
  const blocked = disabled || loading;
  const classes = cn(
    'inline-flex h-8 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    showLabel ? 'px-2.5' : 'w-8',
    config.tone,
    className,
  );
  const content = <><AppIcon aria-hidden="true" className={cn('', loading && 'animate-spin')} style={{ fontSize: 16 }}>{loading ? 'progress_activity' : config.icon}</AppIcon><span className={showLabel ? undefined : 'sr-only'}>{loading ? 'Đang xử lý...' : text}</span></>;

  if (href && !blocked) {
    return <Link href={href} onClick={props.onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined} role={props.role} tabIndex={props.tabIndex} className={classes} title={title ?? text} aria-label={props['aria-label'] ?? title ?? text}>{content}</Link>;
  }
  return <button {...props} type={props.type ?? 'button'} disabled={blocked} aria-busy={loading || undefined} title={title ?? text} aria-label={props['aria-label'] ?? title ?? text} className={classes}>{content}</button>;
}
