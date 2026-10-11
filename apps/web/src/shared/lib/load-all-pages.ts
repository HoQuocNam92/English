/** Load every page so selection menus do not silently omit records after page one. */
export async function loadAllPages<T>(fetchPage: (page: number) => Promise<{ data: T[]; meta: { totalPages: number } }>): Promise<T[]> {
  const first = await fetchPage(1);
  const items = [...first.data];
  for (let page = 2; page <= first.meta.totalPages; page++) {
    const result = await fetchPage(page);
    items.push(...result.data);
  }
  return items;
}
