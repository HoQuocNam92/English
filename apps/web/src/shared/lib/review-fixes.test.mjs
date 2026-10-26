import { test } from 'node:test';
import assert from 'node:assert/strict';
import { notificationRoute } from './notification-route.ts';

test('learning reminders keep internal destinations and reject unsafe or unrelated routes', () => {
  for (const route of ['/learn', '/learn/plan', '/learn/lessons/abc?from=%2Flearn%2Fplan', '/learn?tab=next']) assert.equal(notificationRoute(route), route);
  for (const route of [undefined, null, '', 'https://evil.test/learn', '//evil.test/learn', '/admin', '/learning', '/learn/../admin', '/learn/\\evil', '/learn\n']) assert.equal(notificationRoute(route), '/learn/plan');
});

import { lessonReadingText } from '../../../../../packages/shared-kernel/src/lesson-presentation.ts';

test('reference sections keep actual links and English reading passages remain unchanged', () => {
  assert.equal(lessonReadingText('Nguồn tham khảo', 'Tài liệu minh họa. Nguồn kỹ thuật: https://example.org/guide'), 'https://example.org/guide');
  assert.equal(lessonReadingText('Nguồn tham khảo', '', 'https://example.org/guide'), 'https://example.org/guide');
  assert.equal(lessonReadingText('Đoạn đọc tiếng Anh', 'Only the owner may access this resource.'), 'Only the owner may access this resource.');
  assert.equal(lessonReadingText('Nguồn tham khảo', 'Tài liệu nội bộ'), 'Tài liệu nội bộ');
});
