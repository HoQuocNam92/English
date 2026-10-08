'use client';

import * as React from 'react';

export function BulkSelectionBar({
  pageCount,
  selectedCount,
  allPageSelected,
  onSelectPage,
  selectionLabel = 'Chọn trang này',
  children,
}: {
  pageCount: number;
  selectedCount: number;
  allPageSelected: boolean;
  onSelectPage: (selected: boolean) => void;
  selectionLabel?: string;
  children: React.ReactNode;
}) {
  if (!pageCount) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-3">
      <label className="mr-auto flex cursor-pointer items-center gap-2 text-sm font-semibold text-on-surface">
        <input
          type="checkbox"
          className="h-4 w-4 accent-primary"
          checked={allPageSelected}
          onChange={(event) => onSelectPage(event.target.checked)}
        />
        {selectionLabel} {selectedCount > 0 && `(${selectedCount} đã chọn)`}
      </label>
      {children}
    </div>
  );
}
