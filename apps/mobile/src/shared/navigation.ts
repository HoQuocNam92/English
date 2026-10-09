export function mobileRoute(href: string) {
  const withoutHash = href.split('#')[0];
  const separator = withoutHash.indexOf('?');
  const pathname = separator < 0 ? withoutHash : withoutHash.slice(0, separator);
  const query = new URLSearchParams(separator < 0 ? '' : withoutHash.slice(separator + 1));
  const route = pathname.replace(/^\/learn(?=\/|$)/, '').replace(/\/$/, '');
  const finish = (destination: string) => `${destination}${query.size ? `?${query}` : ''}`;
  const topic = route.match(/^\/certifications\/([^/]+)\/topics\/([^/]+)$/);
  if (topic) {
    query.set('certificateId', topic[1]);
    return finish(`/certifications/topics/${topic[2]}`);
  }
  if (route.startsWith('/quiz/result/')) return finish(route.replace('/quiz/result/', '/test-result/'));
  if (['/flashcards', '/flashcards/studying', '/flashcards/dashboard'].includes(route)) return finish('/flashcards/dashboard');
  if (['/flashcards/explore', '/flashcards/history', '/flashcards/words'].includes(route)) return finish(route);
  if (route === '/plan') return finish('/learning-plan');
  if (route === '/profile') return finish(query.get('tab') === 'history' ? '/profile/history' : '/profile/edit');
  if (route === '/progress') return finish('/(tabs)/progress');
  if (route === '/practice') return finish('/(tabs)/practice');
  const vocabulary = route.match(/^\/flashcards\/([^/]+)\/(practice|quiz)$/);
  if (vocabulary) {
    if (vocabulary[1] === 'review') query.set('mode', 'review');
    else if (vocabulary[1] !== 'all') query.set('sourceLessonId', vocabulary[1]);
    if (vocabulary[2] === 'quiz') query.set('mode', 'quiz');
    return finish('/flashcards');
  }
  const words = route.match(/^\/flashcards\/([^/]+)$/);
  if (words) {
    if (words[1] !== 'all') query.set('sourceLessonId', words[1]);
    return finish('/flashcards/words');
  }
  return finish(route || '/(tabs)/home');
}
