'use client';

import { Dropdown } from '@/shared/ui/Dropdown';
import { ChevronLeft, ChevronRight, Rows3 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  className?: string;
}

const buildVisiblePages = (page: number, totalPages: number): Array<number | 'ellipsis'> => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  }

  if (page >= totalPages - 3) {
    return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages];
};

export function Pagination({
  className,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 20, 30, 40],
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = total === 0 ? 0 : Math.min(page * limit, total);
  const visiblePages = buildVisiblePages(page, safeTotalPages);
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-outline-variant/20 bg-surface-container-lowest px-5 py-4 max-w-full overflow-hidden sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-on-surface-variant">
          Hiển thị {start}–{end} trong tổng số {total}
        </span>
        {onLimitChange && (
          <label className="relative inline-flex items-center gap-2 rounded-xl border border-outline-variant/50 bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:border-primary/40 hover:bg-primary/5">
            <Rows3 className="h-4 w-4 text-sky-600" />
            <span>Số dòng</span>
            <Dropdown
              aria-label="Số dòng trên mỗi trang"
              className="pagination-size-select h-7 w-12 cursor-pointer bg-transparent p-0 text-center font-bold leading-7 text-on-surface outline-none [text-align-last:center]"
              value={limit}
              onChange={(event) => onLimitChange(Number(event.target.value))}
            >
              {limitOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </Dropdown>
          </label>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex max-w-full flex-wrap items-center gap-1">
          <button
            aria-label="Trang trước"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/50 text-on-surface-variant transition-colors hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {visiblePages.map((entry, index) =>
            entry === 'ellipsis' ? (
              <span className="px-2 text-sm text-on-surface-variant" key={`ellipsis-${index}`}>
                ...
              </span>
            ) : (
              <button
                className={cn(
                  'flex h-9 min-w-9 items-center justify-center rounded-[var(--radius-control)] px-3 text-sm font-semibold transition-colors',
                  entry === page ? 'bg-primary text-white shadow-sm' : 'text-on-surface hover:bg-primary/5'
                )}
                aria-current={entry === page ? 'page' : undefined}
                aria-label={`Trang ${entry}`}
                key={entry}
                onClick={() => onPageChange(entry)}
                type="button"
              >
                {entry}
              </button>
            )
          )}

          <button
            aria-label="Trang sau"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/50 text-on-surface-variant transition-colors hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
            disabled={page >= safeTotalPages}
            onClick={() => onPageChange(page + 1)}
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
