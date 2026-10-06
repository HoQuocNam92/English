'use client';
import { Children, useState, type ReactNode } from 'react';
import { Pagination } from './Pagination';

/** Paginate local collections after their page-specific filters have been applied. */
export function PaginatedList({ children, className, enabled = true, as: Container = 'div' }: { children: ReactNode; className?: string; enabled?: boolean; as?: 'div' | 'ul' }) {
  const items = Children.toArray(children);
  const signature = items.map((item: any) => item?.key ?? '').join('|');
  const [position, setPosition] = useState({ signature: '', page: 1 });
  const [limit, setLimit] = useState(10);
  const totalPages = Math.max(1, Math.ceil(items.length / limit));
  const page = signature === position.signature ? Math.min(position.page, totalPages) : 1;
  return <div><Container className={className}>{enabled ? items.slice((page - 1) * limit, page * limit) : items}</Container>{enabled && totalPages > 1 && <Pagination className="mt-4" page={page} limit={limit} total={items.length} totalPages={totalPages} onPageChange={page => setPosition({ signature, page })} onLimitChange={value => { setLimit(value); setPosition({ signature, page: 1 }); }} />}</div>;
}
