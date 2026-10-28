import { test } from 'node:test';
import assert from 'node:assert/strict';
import { goalProgress } from '../../../../../packages/shared-kernel/src/goal-progress.cjs';

test('goals preserve actual totals above the target while capping only the progress bar', () => {
  const words = goalProgress(16, 10, 'từ');
  assert.equal(words.value, 16); assert.equal(words.target, 10);
  assert.equal(words.percent, 100); assert.equal(words.remaining, 0);
  assert.equal(words.status, 'Vượt mục tiêu 6 từ');
  assert.equal(words.description, '16 từ đã hoàn thành, mục tiêu 10 từ');
  assert.equal(goalProgress(5, 2, 'bài').status, 'Vượt mục tiêu 3 bài');
  assert.equal(goalProgress(16, 30, 'phút').status, 'Còn 14 phút');
  assert.equal(goalProgress(16, 30, 'phút').percent, 53);
  assert.equal(goalProgress(10, 10, 'từ').status, 'Đã đạt mục tiêu');
});

test('missing and malformed goal data never produce invalid percentages or false completion', () => {
  for (const target of [0, undefined, NaN, Infinity, -10]) {
    const goal = goalProgress(16, target, 'từ');
    assert.equal(goal.value, 16); assert.equal(goal.percent, 0);
    assert.equal(goal.status, 'Chưa thiết lập mục tiêu');
  }
  assert.equal(goalProgress(-1, 10, 'từ').value, 0);
  assert.equal(goalProgress('8', '10', 'từ').percent, 80);
});
