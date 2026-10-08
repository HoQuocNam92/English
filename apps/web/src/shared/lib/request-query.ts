/** Empty optional filters mean "all", so do not send them as IDs. */
export function withoutEmptyQueryValues(path: string): string {
  const index = path.indexOf('?');
  if (index < 0) return path;
  const query = new URLSearchParams(path.slice(index + 1));
  for (const key of [...query.keys()]) {
    if (query.getAll(key).every(value => !value.trim())) query.delete(key);
  }
  return `${path.slice(0, index)}${query.size ? `?${query}` : ''}`;
}
