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
  assert.equal(formatAttemptDuration({ timeSpentSeconds: 59.9 }), '0 phút 59 giây');
  assert.equal(formatAttemptDuration({ startedAt: '2026-10-07T01:00:00Z', submittedAt: '2026-10-07T01:00:59.999Z' }), '0 phút 59 giây');
  assert.equal(formatAttemptDuration({ timeSpentSeconds: 61 }), '1 phút 1 giây');
});


test('role redirects leave restricted admin routes for the learner home', async () => {
  const { roleHome } = await import('./role-home.ts');
  assert.equal(roleHome(['learner']), '/learn');
  assert.equal(roleHome(['admin']), '/admin/dashboard');
  assert.equal(roleHome(['teacher']), '/admin/dashboard');
  assert.equal(roleHome(['teacher', 'learner']), '/admin/dashboard');
  assert.equal(roleHome([]), '/learn');
});

test('dropdown search finds labels anywhere, ignoring Vietnamese accents and word order', async () => {
  const { filterDropdownItems } = await import('./dropdown-search.ts');
  const items = [{ label: 'Tất cả bộ đề' }, ...Array.from({ length: 1000 }, (_, i) => ({ label: `Bộ đề AWS số ${i + 1}` }))];
  assert.deepEqual(filterDropdownItems(items, '1000 aws').map(result => result.index), [1000]);
  assert.deepEqual(filterDropdownItems([{ label: 'Điện toán đám mây' }, { label: 'Bảo mật' }], 'dien toan').map(result => result.index), [0]);
  assert.equal(filterDropdownItems(items, 'không tồn tại').length, 0);
  assert.equal(filterDropdownItems(items, '   ').length, 1001);
});

test('selection menus load records beyond the first hundred without dropping filters', async () => {
  const { loadAllPages } = await import('./load-all-pages.ts');
  const requested = [];
  const records = await loadAllPages(async page => {
    requested.push(page);
    return { data: Array.from({ length: 100 }, (_, index) => ({ id: (page - 1) * 100 + index + 1 })), meta: { totalPages: 10 } };
  });
  assert.deepEqual(requested, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(records.length, 1000);
  assert.equal(records[999].id, 1000);
  await assert.rejects(() => loadAllPages(async page => {
    if (page === 2) throw new Error('Network failure');
    return { data: [{ id: 1 }], meta: { totalPages: 2 } };
  }), /Network failure/);
});


test('question selection removes overlapping page records without merging distinct questions with the same prompt', async () => {
  const { loadAllPages } = await import('./load-all-pages.ts');
  const records = await loadAllPages(async page => ({
    data: page === 1
      ? [{ id: 'a', prompt: 'Same prompt' }, { id: 'b', prompt: 'Original' }]
      : [{ id: 'b', prompt: 'Updated' }, { id: 'c', prompt: 'Same prompt' }],
    meta: { totalPages: 2 },
  }), question => question.id);
  assert.deepEqual(records, [
    { id: 'a', prompt: 'Same prompt' },
    { id: 'b', prompt: 'Updated' },
    { id: 'c', prompt: 'Same prompt' },
  ]);
});

test('dashboard date filters use the Vietnam calendar at midnight and month rollover', async () => {
  const { dashboardDateRange } = await import('./dashboard-date-range.ts');
  const now = new Date('2026-09-30T18:00:00Z');
  assert.deepEqual(dashboardDateRange('month', now), { dateFrom: '2026-10-01', dateTo: '2026-10-01' });
  assert.deepEqual(dashboardDateRange('week', now), { dateFrom: '2026-09-25', dateTo: '2026-10-01' });
  assert.deepEqual(dashboardDateRange('year', now), { dateFrom: '2026-01-01', dateTo: '2026-10-01' });
});

test('exam question scope distinguishes similar domains and rejects mismatched levels', async () => {
  const { matchesExamScope } = await import('./exam-question-scope.ts');
  const cloud = { id: 'cloud', code: 'cloud' };
  const intermediate = { id: 'intermediate', code: 'B1' };
  assert.equal(matchesExamScope({ domainId: 'cloud', levelId: 'intermediate' }, cloud, intermediate), true);
  assert.equal(matchesExamScope({ domainId: 'cloud-services', domain: { code: 'cloud' }, levelId: 'intermediate' }, cloud, intermediate), false);
  assert.equal(matchesExamScope({ domainId: 'cloud', levelId: 'basic' }, cloud, intermediate), false);
  assert.equal(matchesExamScope({ domain: { id: 'cloud-services', code: 'cloud' }, level: { code: 'B1' } }, cloud, intermediate), false);
  assert.equal(matchesExamScope({ domain: { code: 'cloud' }, level: { code: 'B1' } }, cloud, intermediate), true);
  assert.equal(matchesExamScope({}, cloud, intermediate), false);
});
