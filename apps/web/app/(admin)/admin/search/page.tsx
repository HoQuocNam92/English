'use client';
import { PaginatedList } from '@/shared/ui/PaginatedList';
import { AppIcon } from '@/shared/ui/AppIcon';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/shared/api/api-client';

type SearchItem = { id: string; title: string; subtitle?: string; href: string; icon: string };
type SearchGroup = { title: string; items: SearchItem[] };

const unwrapItems = (value: any): any[] => Array.isArray(value) ? value : (value?.data ?? []);

async function fetchAllSearchResults(path: string, isActive: () => boolean) {
  const items: any[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const response: any = await apiClient.get(`${path}&page=${page}&limit=100`);
    items.push(...unwrapItems(response));
    totalPages = response?.meta?.totalPages ?? 1;
    page++;
  } while (isActive() && page <= totalPages);
  return items;
}

export default function AdminGlobalSearchPage() {
  const searchParams = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const [groups, setGroups] = React.useState<SearchGroup[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query) { setGroups([]); return; }
    let active = true;
    setLoading(true);
    const encoded = encodeURIComponent(query);
    void Promise.allSettled([
      fetchAllSearchResults(`/students?search=${encoded}`, () => active),
      fetchAllSearchResults(`/vocabulary?search=${encoded}`, () => active),
      fetchAllSearchResults(`/questions?search=${encoded}`, () => active),
      fetchAllSearchResults(`/exams?search=${encoded}`, () => active),
      apiClient.get<any>('/certificates'),
    ]).then((results) => {
      if (!active) return;
      const values = results.map(result => result.status === 'fulfilled' ? unwrapItems(result.value) : []);
      const normalized = query.toLocaleLowerCase('vi');
      const certs = values[4].filter((item: any) => [item.name, item.code, item.provider].some(value => String(value ?? '').toLocaleLowerCase('vi').includes(normalized)));
      setGroups([
        { title: 'Học viên', items: values[0].map((item: any) => ({ id: item.id, title: item.displayName ?? item.email, subtitle: item.email, href: `/admin/students/${item.id}`, icon: 'person' })) },
        { title: 'Từ vựng', items: values[1].map((item: any) => ({ id: item.id, title: item.term, subtitle: item.definitionVi ?? item.definitionEn, href: `/admin/learning-content?search=${encoded}`, icon: 'translate' })) },
        { title: 'Câu hỏi', items: values[2].map((item: any) => ({ id: item.id, title: item.prompt, subtitle: item.domain?.name, href: `/admin/questions?search=${encoded}`, icon: 'quiz' })) },
        { title: 'Đề thi', items: values[3].map((item: any) => ({ id: item.id, title: item.title, subtitle: item.domain?.name, href: `/admin/tests?search=${encoded}`, icon: 'assignment' })) },
        { title: 'Chứng chỉ', items: certs.map((item: any) => ({ id: item.id, title: item.name, subtitle: [item.code, item.provider].filter(Boolean).join(' · '), href: `/admin/certifications/${item.id}`, icon: 'workspace_premium' })) },
      ].filter(group => group.items.length > 0));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query]);

  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <main className="min-w-0 flex-1 bg-background p-4 sm:p-6 lg:p-margin">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div>
          <Link href="/admin/dashboard" className="mb-4 inline-flex text-sm font-semibold text-primary">← Quay lại tổng quan</Link>
          <h1 className="font-headline-h1 text-headline-h1 text-on-surface">Kết quả tìm kiếm</h1>
          <p className="mt-2 text-sm text-on-surface-variant">{loading ? 'Đang tìm trong hệ thống…' : `${total} kết quả cho “${query}”`}</p>
        </div>
        {!loading && total === 0 && <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-10 text-center text-on-surface-variant"><AppIcon className=" mb-2 text-4xl">search_off</AppIcon><p>Không tìm thấy dữ liệu phù hợp.</p></div>}
        <div className="grid gap-5 lg:grid-cols-2">
          {groups.map(group => <section key={group.title} className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest"><h2 className="border-b border-outline-variant px-5 py-4 text-base font-bold">{group.title} <span className="ml-1 text-sm font-normal text-on-surface-variant">({group.items.length})</span></h2><PaginatedList className="divide-y divide-outline-variant/60">{group.items.map(item => <Link key={`${group.title}-${item.id}`} href={item.href} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-container-low"><AppIcon className=" text-primary">{item.icon}</AppIcon><span className="min-w-0"><span className="block truncate text-sm font-semibold text-on-surface">{item.title}</span>{item.subtitle && <span className="block truncate text-xs text-on-surface-variant">{item.subtitle}</span>}</span><AppIcon className=" ml-auto text-lg text-outline">chevron_right</AppIcon></Link>)}</PaginatedList></section>)}
        </div>
      </div>
    </main>
  );
}
