export const MAX_PUBLICATION_SELECTION = 10000;
export type PublicationItem = { id: string; status?: string; isActive?: boolean };
export const publicationState = (item: PublicationItem) => item.status ?? (item.isActive === true ? 'published' : item.isActive === false ? 'draft' : 'unknown');
export function eligiblePublicationIds(ids: Iterable<string>, known: Map<string, PublicationItem>, target: 'draft' | 'published') {
  const source = target === 'published' ? 'draft' : 'published';
  return [...ids].filter(id => known.has(id) && publicationState(known.get(id)!) === source);
}

// Capture explicit IDs rather than sending an unbounded "all" flag to mutation endpoints.
export async function collectPublicationSelection<T extends PublicationItem>(fetchPage: (page: number) => Promise<{ data: T[]; meta: { total: number } }>, expectedTotal: number, cancelled: () => boolean = () => false): Promise<T[]> {
  if (!Number.isInteger(expectedTotal) || expectedTotal < 1 || expectedTotal > MAX_PUBLICATION_SELECTION) throw new Error('Mỗi lần chọn tối đa 10.000 mục. Hãy thu hẹp bộ lọc.');
  const records = new Map<string, T>();
  for (let page = 1; records.size < expectedTotal; page++) {
    if (cancelled()) throw new Error('Đã hủy lựa chọn do bộ lọc thay đổi.');
    const result = await fetchPage(page);
    if (cancelled()) throw new Error('Đã hủy lựa chọn do bộ lọc thay đổi.');
    if (!Array.isArray(result?.data) || result.meta?.total !== expectedTotal || !result.data.length || result.data.some(item => !item || typeof item.id !== 'string' || !item.id || records.has(item.id)) || new Set(result.data.map(item => item.id)).size !== result.data.length) throw new Error('Danh sách đã thay đổi trong khi chọn. Hãy làm mới rồi chọn lại.');
    result.data.forEach(item => records.set(item.id, item));
    if (records.size > expectedTotal) throw new Error('Danh sách đã thay đổi trong khi chọn. Hãy làm mới rồi chọn lại.');
  }
  return [...records.values()];
}
