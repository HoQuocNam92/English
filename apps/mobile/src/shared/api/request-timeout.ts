// AI-backed requests use the same longer timeout as the web client.
export function requestTimeoutMs(path: string): number {
  const endpoint = path.split('?')[0];
  return endpoint.startsWith('/placement-test/') || [
    '/translation/selection',
    '/translation/pronunciation',
    '/progress/me/agenda',
    '/recommendations/me',
  ].includes(endpoint) ? 60000 : 15000;
}
