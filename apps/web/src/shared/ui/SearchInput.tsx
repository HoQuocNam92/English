'use client';

import * as React from 'react';
import { validateSearch, validateSearchRealtime, sanitizeSearch, findInvalidChar } from '@/shared/validation/validators';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (sanitized: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

/**
 * Reusable validated search input:
 * - Realtime character-by-character validation (chặn ký tự cấm tức thì)
 * - Validation độ dài (min, max)
 * - Chặn submit chỉ chứa toàn khoảng trắng (no whitespace-only)
 * - Hiển thị bộ đếm ký tự (Character counter)
 * - Nút xoá nhanh (Clear button)
 * - Hiển thị lỗi rõ ràng ngay dưới input
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
  const [isFocused, setIsFocused] = React.useState(false);

  // Realtime validate khi value thay đổi
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    onChange(raw);

    if (raw.length === 0) {
      setError(null);
      return;
    }

    const check = validateSearchRealtime(raw);
    if (!check.valid) {
      setError(check.error ?? 'Dữ liệu nhập không hợp lệ.');
    } else {
      setError(null);
    }
  };

  // Submit search
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Nếu để trống -> reset bộ lọc về rỗng (cho phép hiển thị toàn bộ data)
    if (value.length === 0 || value.trim().length === 0) {
      if (value.length > 0 && value.trim().length === 0) {
        setError('Từ khóa không được chỉ chứa khoảng trắng.');
        return;
      }
      setError(null);
      onSearch('');
      return;
    }

    const result = validateSearch(value);
    if (!result.valid) {
      setError(result.error ?? 'Từ khóa không hợp lệ.');
      return;
    }

    setError(null);
    onSearch(result.sanitized ?? sanitizeSearch(value));
  };

  // Chặn phím chứa ký tự cấm ngay khi gõ
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const invalidChar = findInvalidChar(e.key);
    if (invalidChar) {
      e.preventDefault();
      setError(`Ký tự "${e.key}" không được phép trong tìm kiếm.`);
      setTimeout(() => {
        // Tự động kiểm tra lại chuỗi hiện tại
        const currentCheck = validateSearchRealtime(value);
        setError(currentCheck.valid ? null : currentCheck.error ?? null);
      }, 2500);
    }
  };

  // Nút clear text
  const handleClear = () => {
    onChange('');
    setError(null);
    onSearch('');
  };

  const charCount = value.length;
  const isNearLimit = charCount >= maxLength * 0.8;

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-1 flex-1 ${className}`}>
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          {/* Search Icon */}
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
            search
          </span>

          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            maxLength={maxLength}
            autoComplete="off"
            spellCheck={false}
            className={`w-full rounded-xl border pl-10 pr-16 py-2 text-sm text-on-surface transition-all
              ${error
                ? 'border-red-500 bg-red-50/20 text-on-surface focus:outline-none focus:ring-2 focus:ring-red-300'
                : isFocused
                  ? 'border-primary bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary/20'
                  : 'border-outline-variant/60 bg-surface-container-low hover:border-outline-variant'
              }`}
          />

          {/* Action buttons inside input right side: Clear + Counter */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {value.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Xoá tìm kiếm"
                className="w-5 h-5 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}

            {isNearLimit && (
              <span className={`text-[10px] font-mono font-medium px-1 rounded ${
                charCount >= maxLength ? 'text-red-600 bg-red-100' : 'text-on-surface-variant bg-surface-container'
              }`}>
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!!error}
          className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
        >
          Tìm
        </button>
      </div>

      {/* Thông báo lỗi validation */}
      {error && (
        <div className="flex items-center gap-1.5 px-1 py-0.5 text-xs text-red-600 animate-fadeIn">
          <span className="material-symbols-outlined text-[14px]">error</span>
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}
