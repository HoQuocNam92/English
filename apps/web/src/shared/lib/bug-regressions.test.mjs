import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withoutEmptyQueryValues } from './request-query.ts';
import { isEnglishSelection } from './english-selection.ts';
import { formatAttemptDuration } from './attempt-duration.ts';

test('all filters omit empty identifiers while preserving pagination and selected exam', () => {
  assert.equal(withoutEmptyQueryValues('/exams?certificateId=&page=1&limit=20'), '/exams?page=1&limit=20');
  assert.equal(withoutEmptyQueryValues('/progress?certificateId=%20%20&domainCode=cloud'), '/progress?domainCode=cloud');
  assert.equal(withoutEmptyQueryValues('/questions?examId=4936f4ab-59a9-4c51-b3da-61402e3be245&status='), '/questions?examId=4936f4ab-59a9-4c51-b3da-61402e3be245');
  assert.equal(withoutEmptyQueryValues('/exams?certificateId='), '/exams');
});
test('translation rejects fragments from Vietnamese UI and accepts English learning content', () => {
  for (const value of ['c; n', 'n; c', 'Dựa trên trình độ', 'tiếng Việt'.normalize('NFD'), ' ', 'word'.repeat(126)]) assert.equal(isEnglishSelection(value), false, value);
  for (const value of ['Requirement', 'in context', 'Scale resources; reduce costs.']) assert.equal(isEnglishSelection(value), true, value);
});
test('attempt duration derives timestamps and distinguishes missing data from a short attempt', () => {
  assert.equal(formatAttemptDuration({ timeSpentSeconds: 0, startedAt: '2026-10-07T01:00:00Z', submittedAt: '2026-10-07T01:03:42Z' }), '3 phút 42 giây');
  assert.equal(formatAttemptDuration({ timeSpentSeconds: null }), 'Chưa ghi nhận');
  assert.equal(formatAttemptDuration({}), 'Chưa ghi nhận');
  assert.equal(formatAttemptDuration({ startedAt: 'invalid', submittedAt: 'invalid' }), 'Chưa ghi nhận');
  assert.equal(formatAttemptDuration({ timeSpentSeconds: 0.2 }), 'Dưới 1 giây');
  assert.equal(formatAttemptDuration({ timeSpentSeconds: 61 }), '1 phút 1 giây');
});
