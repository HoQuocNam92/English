export function navigationRouteMatches(href: string, pathname: string, searchParams: Pick<URLSearchParams, 'get' | 'has'>) {
  const [path, query = ''] = href.split('?');
  const expected = new URLSearchParams(query);
  const nested = pathname.startsWith(`${path}/`) && path.split('/').length > 2;
  if (expected.size) return (pathname === path || nested) && [...expected].every(([key, value]) => searchParams.get(key) === value);
  return (pathname === path && (path !== '/admin/lessons' || !searchParams.has('type'))) || nested;
}
