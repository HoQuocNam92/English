'use client';
import { Children, cloneElement, isValidElement, useState, type ReactElement, type ReactNode } from 'react';
import { Pagination } from './Pagination';

export function PaginatedTable({ children, enabled = true }: { children: ReactElement; enabled?: boolean }) {
  const table = children as ReactElement<{ children?: ReactNode }>;
  const sections = Children.toArray(table.props.children);
  const body = sections.find(item => isValidElement(item) && item.type === 'tbody') as ReactElement<{ children?: ReactNode }> | undefined;
  const rows = Children.toArray(body?.props.children);
  const signature = rows.map((row: any) => row.key ?? '').join('|');
  const [position, setPosition] = useState({ signature: '', page: 1 });
  const [limit, setLimit] = useState(10);
  const totalPages = Math.max(1, Math.ceil(rows.length / limit));
  const page = position.signature === signature ? Math.min(position.page, totalPages) : 1;
  const content = enabled && body ? cloneElement(table, {}, sections.map(section => section === body ? cloneElement(body, {}, rows.slice((page - 1) * limit, page * limit)) : section)) : table;
  return <><div className="overflow-x-auto">{content}</div>{enabled && rows.length > 0 && <Pagination page={page} limit={limit} total={rows.length} totalPages={totalPages} onPageChange={page => setPosition({ signature, page })} onLimitChange={value => { setLimit(value); setPosition({ signature, page: 1 }); }} />}</>;
}
