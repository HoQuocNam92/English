import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dailyVocabularyProgress } from './utils/daily-vocabulary.ts';

test('daily vocabulary switches from a target fraction to completion and separate extra words', () => {
  assert.deepEqual(dailyVocabularyProgress(19, 20), { label: 'Hôm nay: 19/20 từ mới', extra: 0 });
  assert.deepEqual(dailyVocabularyProgress(20, 20), { label: 'Đã đạt mục tiêu 20 từ hôm nay', extra: 0 });
  assert.deepEqual(dailyVocabularyProgress(22, 20), { label: 'Đã đạt mục tiêu 20 từ hôm nay', extra: 2 });
  assert.deepEqual(dailyVocabularyProgress(22), { label: 'Hôm nay đã học 22 từ mới', extra: 0 });
});
