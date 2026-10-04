export function mobileRoute(href: string) {
  const route = href.replace(/^\/learn(?=\/|\?|$)/, '');
  const topic = route.match(/^\/certifications\/([^/]+)\/topics\/([^/?]+)(.*)$/);
  if (topic) return `/certifications/topics/${topic[2]}?certificateId=${topic[1]}`;
  if (route.startsWith('/quiz/result/')) return route.replace('/quiz/result/', '/test-result/');
  if (route.startsWith('/flashcards/studying')) return route.replace('/flashcards/studying', '/flashcards/dashboard');
  if (route.startsWith('/flashcards/explore')) return route.replace('/flashcards/explore', '/flashcards/dashboard');
  if (route === '/profile') return '/profile/edit';
  return route || '/(tabs)/home';
}
