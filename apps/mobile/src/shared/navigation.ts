export function mobileRoute(href: string) {
  const route = href.replace(/^\/learn(?=\/|\?|$)/, '');
  const topic = route.match(/^\/certifications\/([^/]+)\/topics\/([^/?]+)(.*)$/);
  if (topic) return `/certifications/topics/${topic[2]}?certificateId=${topic[1]}`;
  if (route.startsWith('/quiz/result/')) return route.replace('/quiz/result/', '/test-result/');
  if (route.startsWith('/flashcards/studying')) return route.replace('/flashcards/studying', '/flashcards/dashboard');
  if (route.startsWith('/flashcards/explore')) return route;
  if (route === '/plan') return '/learning-plan';
  const vocabulary = route.match(/^\/flashcards\/([^/?]+)\/(practice|quiz)(.*)$/);
  if (vocabulary) {
    const query = new URLSearchParams(vocabulary[3].replace(/^\?/, ''));
    if (vocabulary[1] === 'review') { query.set('mode', 'review'); }
    else if (vocabulary[1] !== 'all') query.set('sourceLessonId', vocabulary[1]);
    if (vocabulary[2] === 'quiz') query.set('mode', 'quiz');
    return `/flashcards${query.size ? `?${query}` : ''}`;
  }
  if (route === '/profile') return '/profile/edit';
  return route || '/(tabs)/home';
}
