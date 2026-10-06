import { apiClient, type PaginatedResponse } from './api-client';
// Picker options must include records beyond the first page.
export async function loadListOptions<T>(path: string): Promise<T[]> {
 const separator = path.includes('?') ? '&' : '?';
 const first = await apiClient.get<PaginatedResponse<T>>(`${path}${separator}page=1&limit=100`);
 const rows = [...first.data];
 for (let page = 2; page <= first.meta.totalPages; page++) {
  const result = await apiClient.get<PaginatedResponse<T>>(`${path}${separator}page=${page}&limit=100`);
  rows.push(...result.data);
 }
 return rows;
}
