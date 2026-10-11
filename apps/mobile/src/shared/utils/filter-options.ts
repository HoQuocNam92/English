export function matchesFilterOption(label: string, query: string): boolean {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLocaleLowerCase('vi');
  const text = normalize(label);
  return normalize(query).trim().split(/\s+/).every(word => text.includes(word));
}
