import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mobileRoute } from './navigation.ts';
import { requestTimeoutMs } from './api/request-timeout.ts';
import { validateLearningTargets } from './utils/learning-targets.ts';

test('web agenda and recommendation links resolve to native screens without losing context', () => {
  assert.equal(mobileRoute('/learn'), '/(tabs)/home');
  assert.equal(mobileRoute('/learn/progress'), '/(tabs)/progress');
  assert.equal(mobileRoute('/learn/plan'), '/learning-plan');
  assert.equal(mobileRoute('/learn/flashcards/lesson-1'), '/flashcards/words?sourceLessonId=lesson-1');
  assert.equal(mobileRoute('/learn/flashcards/review/practice'), '/flashcards?mode=review');
  assert.equal(mobileRoute('/learn/flashcards/lesson-1/quiz?domainCode=CLOUD'), '/flashcards?domainCode=CLOUD&sourceLessonId=lesson-1&mode=quiz');
  assert.equal(mobileRoute('/learn/certifications/cert-1/topics/topic-1?lessonId=lesson-1'), '/certifications/topics/topic-1?lessonId=lesson-1&certificateId=cert-1');
  assert.equal(mobileRoute('/learn/quiz/result/attempt-1?certificateId=cert-1'), '/test-result/attempt-1?certificateId=cert-1');
});

test('AI-backed mobile flows get enough time to complete while ordinary requests remain bounded', () => {
  for (const path of ['/translation/selection', '/progress/me/agenda', '/recommendations/me?refresh=true', '/placement-test/plan']) {
    assert.equal(requestTimeoutMs(path), 60000);
  }
  assert.equal(requestTimeoutMs('/users/me'), 15000);
});

test('learning targets reject invalid input instead of silently replacing it with defaults', () => {
  assert.equal(validateLearningTargets('1', '1', '5'), null);
  assert.equal(validateLearningTargets('200', '50', '1440'), null);
  for (const vocabulary of ['', '0', '201', '1.5', '1e2', '-1']) {
    assert.ok(validateLearningTargets(vocabulary, '2', '30'));
  }
  assert.ok(validateLearningTargets('10', '51', '30'));
  assert.ok(validateLearningTargets('10', '2', '4'));
  assert.ok(validateLearningTargets('10', '2', '1441'));
});
