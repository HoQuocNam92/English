import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const buildVisiblePages = (page: number, totalPages: number): Array<number | 'ellipsis'> => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, 'ellipsis', totalPages];
  }

  if (page >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', page, 'ellipsis', totalPages];
};

export function Pagination({ className, page, limit, total, totalPages, onPageChange }: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = total === 0 ? 0 : Math.min(page * limit, total);
  const visiblePages = buildVisiblePages(page, safeTotalPages);

  return (
    <div className={cn('flex flex-col gap-3 border-t border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <span className="text-sm text-muted-foreground">
        Showing {start} to {end} of {total} entries
      </span>

      <div className="flex items-center gap-1">
        <button
          aria-label="Previous page"
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border border-border text-muted-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {visiblePages.map((entry, index) =>
          entry === 'ellipsis' ? (
            <span className="px-2 text-sm text-muted-foreground" key={`ellipsis-${index}`}>
              ...
            </span>
          ) : (
            <button
              className={cn(
                'flex h-9 min-w-9 items-center justify-center rounded-[var(--radius-control)] px-3 text-sm font-semibold transition-colors',
                entry === page ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-background'
              )}
              key={entry}
              onClick={() => onPageChange(entry)}
              type="button"
            >
              {entry}
            </button>
          )
        )}

        <button
          aria-label="Next page"
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border border-border text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page >= safeTotalPages}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
