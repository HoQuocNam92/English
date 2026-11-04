import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toVietnameseErrorMessage } from './error-message.ts';

test('array validation identifies the actual field instead of each', () => {
  assert.equal(toVietnameseErrorMessage('each value in ids must be a UUID'), 'Danh sách mục đã chọn không có mã định danh hợp lệ.');
  assert.equal(toVietnameseErrorMessage('each value in selectedOptionIds must be a UUID'), 'Danh sách đáp án không có mã định danh hợp lệ.');
  assert.equal(toVietnameseErrorMessage('email must be an email'), 'Email không đúng định dạng.');
});
