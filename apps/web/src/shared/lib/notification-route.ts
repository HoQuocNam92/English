/** Notifications may navigate only to learning pages on this origin. */
export function notificationRoute(route: unknown): string {
  if (typeof route !== 'string' || !/^\/learn(?:[/?#]|$)/.test(route) || /[\\\u0000-\u0020]/.test(route)) return '/learn/plan';
  try {
    const url = new URL(route, 'https://learning.invalid');
    if (url.origin !== 'https://learning.invalid' || !/^\/learn(?:\/|$)/.test(url.pathname)) return '/learn/plan';
    return url.pathname + url.search + url.hash;
  } catch { return '/learn/plan'; }
}
