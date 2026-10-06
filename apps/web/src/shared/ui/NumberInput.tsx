'use client';

import * as React from 'react';

/** Native number input with plain decimal syntax; no exponent or silent clamping. */
export function NumberInput({ onChange, onKeyDown, step = 1, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const decimal = step === 'any' || Number(step) < 1;
  const negative = props.min !== undefined && Number(props.min) < 0;
  const syntax = decimal ? (negative ? /^-?\d*(?:\.\d*)?$/ : /^\d*(?:\.\d*)?$/) : (negative ? /^-?\d*$/ : /^\d*$/);

  return <input {...props} type="number" step={step}
    value={typeof props.value === 'number' && !Number.isFinite(props.value) ? '' : props.value}
    inputMode={decimal ? 'decimal' : 'numeric'}
    onKeyDown={event => {
      if (!event.ctrlKey && !event.metaKey && (['e', 'E', '+'].includes(event.key) || (!negative && event.key === '-') || (!decimal && [ '.', ',' ].includes(event.key)))) event.preventDefault();
      onKeyDown?.(event);
    }}
    onChange={event => {
      if (!syntax.test(event.target.value)) {
        event.target.value = String(props.value ?? '');
        event.target.setCustomValidity('Chỉ nhập số thông thường, không dùng dạng số mũ.');
        return;
      }
      event.target.setCustomValidity('');
      onChange?.(event);
    }} />;
}
