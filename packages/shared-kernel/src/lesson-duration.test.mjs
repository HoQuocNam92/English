import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimateLessonMinutes } from './lesson-duration.cjs';

test('study estimates grow with readable content, vocabulary and code rather than a fixed duration', () => {
  const text = words => [{ type: 'rich_text', content: { text: 'word '.repeat(words) } }];
  assert.equal(estimateLessonMinutes(text(160)), 1);
  assert.equal(estimateLessonMinutes(text(800)), 5);
  assert.equal(estimateLessonMinutes([...text(800), { type: 'code', content: { text: 'const value = 1;' } }]), 7);
  assert.equal(estimateLessonMinutes(Array.from({ length: 8 }, () => ({ type: 'vocabulary_list', content: { term: 'test' } }))), 5);
  assert.equal(estimateLessonMinutes([]), 1);
});

test('markup and reference URLs do not inflate reading estimates', () => {
  assert.equal(estimateLessonMinutes([{ content: { text: '<p>Hello world</p>', url: 'https://example.test/' + 'x'.repeat(10000) } }]), 1);
  assert.equal(estimateLessonMinutes([{ content: { text: 'word '.repeat(1000000) } }]), 480);
});
