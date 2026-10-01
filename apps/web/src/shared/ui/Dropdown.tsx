'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { LevelBadge } from '@/shared/ui/LevelBadge';
import { isKnownLevel } from '@/shared/lib/level-theme';

type Item = { value: string; label: string; disabled: boolean };

/** Keeps native form values and change events while rendering a consistent menu. */
export const Dropdown = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Dropdown({ children, className, style, id, disabled, ...props }, forwardedRef) {
    const nativeRef = React.useRef<HTMLSelectElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const menuId = React.useId();
    const [items, setItems] = React.useState<Item[]>([]);
    const [selected, setSelected] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [active, setActive] = React.useState(-1);
    const [position, setPosition] = React.useState({ left: 0, top: 0, width: 0, maxHeight: 280 });
    const search = React.useRef({ text: '', time: 0 });
    React.useImperativeHandle(forwardedRef, () => nativeRef.current!, []);

    React.useLayoutEffect(() => {
      const select = nativeRef.current;
      if (!select) return;
      const next = Array.from(select.options, option => ({ value: option.value, label: option.text, disabled: option.disabled || (option.parentElement instanceof HTMLOptGroupElement && option.parentElement.disabled) }));
      setItems(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
      setSelected(select.value);
    });

    const close = React.useCallback(() => setOpen(false), []);
    React.useEffect(() => {
      if (!open) return;
      const place = () => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const below = window.innerHeight - rect.bottom - 16;
        const above = rect.top - 16;
        const upwards = below < 180 && above > below;
        const maxHeight = Math.min(280, Math.max(80, upwards ? above : below));
        const height = Math.min(maxHeight, items.length * 42 + 16);
        const width = Math.min(Math.max(rect.width, 180), window.innerWidth - 24);
        setPosition({ left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), top: upwards ? rect.top - height - 8 : rect.bottom + 8, width, maxHeight });
      };
      place();
      const outside = (event: PointerEvent) => {
        if (!triggerRef.current?.contains(event.target as Node) && !menuRef.current?.contains(event.target as Node)) close();
      };
      const scroll = (event: Event) => { if (!menuRef.current?.contains(event.target as Node)) close(); };
      document.addEventListener('pointerdown', outside);
      window.addEventListener('resize', close);
      window.addEventListener('scroll', scroll, true);
      return () => {
        document.removeEventListener('pointerdown', outside);
        window.removeEventListener('resize', close);
        window.removeEventListener('scroll', scroll, true);
      };
    }, [open, items.length, close]);
    React.useEffect(() => {
      if (open) menuRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [active, open]);
    React.useEffect(() => { if (disabled) close(); }, [disabled, close]);

    const show = () => {
      setActive(items.findIndex(item => item.value === selected && !item.disabled));
      setOpen(true);
    };
    const choose = (index: number) => {
      const item = items[index];
      const select = nativeRef.current;
      if (!item || item.disabled || !select) return;
      select.value = item.value;
      setSelected(item.value);
      select.dispatchEvent(new Event('change', { bubbles: true }));
      close();
      triggerRef.current?.focus();
    };
    const keyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        if (!open) show();
        const enabled = items.map((item, index) => item.disabled ? -1 : index).filter(index => index >= 0);
        const current = enabled.indexOf(active);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1 : event.key === 'ArrowDown' ? Math.min(current + 1, enabled.length - 1) : Math.max(current - 1, 0);
        setActive(enabled[next] ?? -1);
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (open) choose(active); else show();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        close();
      } else if (event.key === 'Tab') close();
      else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const now = Date.now();
        search.current = { text: (now - search.current.time < 700 ? search.current.text : '') + event.key.toLocaleLowerCase(), time: now };
        const match = items.findIndex(item => !item.disabled && item.label.toLocaleLowerCase().startsWith(search.current.text));
        if (match >= 0) { if (!open) show(); setActive(match); }
      }
    };
    const selectedItem = items.find(item => item.value === selected);
    return <>
      <select {...props} ref={nativeRef} disabled={disabled} tabIndex={-1} aria-hidden="true" className="dropdown-native" onFocus={() => triggerRef.current?.focus()}>{children}</select>
      <button
        ref={triggerRef} id={id} type="button" role="combobox" disabled={disabled}
        aria-label={props['aria-label']} aria-labelledby={props['aria-labelledby']}
        aria-describedby={props['aria-describedby']} aria-invalid={props['aria-invalid']} aria-required={props.required}
        aria-expanded={open} aria-controls={open ? menuId : undefined}
        aria-activedescendant={open && active >= 0 ? `${menuId}-${active}` : undefined}
        className={cn(className, 'dropdown-trigger', open && 'dropdown-trigger-open')}
        style={style} onClick={() => open ? close() : show()} onKeyDown={keyDown}
        onBlur={event => { if (!menuRef.current?.contains(event.relatedTarget as Node)) close(); }}
      >
        <span className="dropdown-value">{selectedItem && isKnownLevel(selectedItem.label) ? <LevelBadge level={selectedItem.label} /> : selectedItem?.label ?? '\u00a0'}</span>
        <ChevronDown aria-hidden="true" className={cn('dropdown-chevron', open && 'rotate-180')} />
      </button>
      {open && createPortal(<div ref={menuRef} id={menuId} role="listbox" aria-label={props['aria-label']} className="dropdown-menu" style={position} onMouseDown={event => event.preventDefault()}>
        {items.map((item, index) => <div key={index} id={`${menuId}-${index}`} role="option" aria-selected={item.value === selected} aria-disabled={item.disabled} data-index={index}
          className={cn('dropdown-option', item.value === selected && 'dropdown-option-selected', active === index && 'dropdown-option-active', item.disabled && 'dropdown-option-disabled')}
          onPointerMove={() => { if (!item.disabled) setActive(index); }} onClick={() => choose(index)}>
          <span>{isKnownLevel(item.label) ? <LevelBadge level={item.label} /> : item.label}</span>{item.value === selected && <Check aria-hidden="true" className="size-4 shrink-0" />}
        </div>)}
      </div>, document.body)}
    </>;
  }
);
