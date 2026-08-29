'use client';

import * as React from 'react';
import { validateSearch, sanitizeSearch } from '@/shared/validation/validators';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (sanitized: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

/**
 * Reusable search input với:
 * - Real-time character validation (ký tự cấm)
 * - Length counter khi gần giới hạn
 * - No whitespace-only submit
 * - Sanitize trước khi gọi onSearch
 */
export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'Tìm kiếm...',
  maxLength = 100,
  className = '',
}: SearchInputProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    onChange(raw);

    // Validate on change if user has touched it
    if (touched && raw.trim().length > 0) {
      const result = validateSearch(raw);
      setError(result.valid ? null : result.error ?? null);
    } else if (raw.trim().length === 0) {
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (value.trim().length === 0) {
      // Clear search — allow empty to reset
      onSearch('');
      setError(null);
      return;
    }

    const result = validateSearch(value);
    if (!result.valid) {
      setError(result.error ?? 'Từ khóa không hợp lệ.');
      return;
    }

    setError(null);
    onSearch(sanitizeSearch(value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Block forbidden chars on keydown for immediate feedback
    const FORBIDDEN = new Set(['<', '>', '{', '}', '[', ']', '\\', '|', ';', '`', '$']);
    if (FORBIDDEN.has(e.key)) {
      e.preventDefault();
      setError(`Ký tự "${e.key}" không được phép trong tìm kiếm.`);
      setTimeout(() => setError(null), 2000);
    }
  };

  const remaining = maxLength - value.length;
  const showCounter = value.length >= maxLength * 0.8; // show when 80% full

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-1 flex-1 ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={() => setTouched(true)}
            placeholder={placeholder}
            maxLength={maxLength}
            autoComplete="off"
            spellCheck={false}
            className={`w-full rounded-xl border px-4 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 transition-colors
              ${error
                ? 'border-error bg-error-container/10 focus:ring-error/30'
                : 'border-outline-variant bg-surface-container-low focus:ring-primary/30'
              }`}
          />
          {showCounter && (
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono
              ${remaining < 10 ? 'text-error' : 'text-on-surface-variant'}`}>
              {remaining}
            </span>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          Tìm
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-error flex items-center gap-1 ml-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </form>
  );
}
