'use client';
import { useState } from 'react';

/** Keep the displayed page and the scope of its selection checkbox identical. */
export function useSelectionPage<T extends { id: string }>(items: T[]) {
  const signature = JSON.stringify(items.map(item => item.id));
  const [position, setPosition] = useState({ signature: '', page: 1 });
  const [limit, setLimit] = useState(10);
  const totalPages = Math.max(1, Math.ceil(items.length / limit));
  const page = position.signature === signature ? Math.min(position.page, totalPages) : 1;
  return {
    items: items.slice((page - 1) * limit, page * limit),
    page, limit, totalPages,
    setPage: (next: number) => setPosition({ signature, page: next }),
    setLimit: (next: number) => { setLimit(next); setPosition({ signature, page: 1 }); },
  };
}
