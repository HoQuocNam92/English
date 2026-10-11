export function normalizeDropdownSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLocaleLowerCase().trim();
}

export function filterDropdownItems<T extends { label: string }>(items: T[], query: string) {
  const terms = normalizeDropdownSearch(query).split(/\s+/).filter(Boolean);
  return items.map((item, index) => ({ item, index }))
    .filter(({ item }) => terms.every(term => normalizeDropdownSearch(item.label).includes(term)));
}
