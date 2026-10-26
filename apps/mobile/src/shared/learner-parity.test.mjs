import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNotificationHistory } from './notifications/notification-history.ts';
import { dashboardDateRange, vocabularyActivityRange } from '../../../../packages/shared-kernel/src/dashboard-date-range.ts';
import { mobileRoute } from './navigation.ts';

const notice = (id, createdAt = 1) => ({ id, createdAt, title: 'Nhắc học', message: 'Học hôm nay', read: false, href: '/learn/plan' });
const memoryStorage = () => { const values = new Map(); return { values, getItem: async key => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); } }; };

test('notification receipt during storage hydration and read-all retains the new unread notice', async () => {
  let release;
  const storage = memoryStorage(); storage.getItem = () => new Promise(resolve => { release = resolve; });
  const history = createNotificationHistory(storage);
  const initial = history.load('u1'); const arriving = history.add('u1', notice('incoming', 2));
  const markAll = history.markRead('u1'); const later = history.add('u1', notice('later', 3));
  await Promise.resolve(); release(JSON.stringify([notice('saved')]));
  await Promise.all([initial, arriving, markAll, later]);
  const items = await history.load('u1');
  assert.deepEqual(items.map(item => [item.id, item.read]), [['later', false], ['incoming', true], ['saved', true]]);
});

test('notification history persists per account and duplicate deliveries preserve read state', async () => {
  const storage = memoryStorage(); const history = createNotificationHistory(storage);
  await history.add('alice', notice('n1')); await history.markRead('alice', 'n1');
  await history.add('alice', notice('n1', 9)); await history.add('bob', notice('n2'));
  const restored = createNotificationHistory(storage);
  assert.deepEqual((await restored.load('alice')).map(item => [item.id, item.read]), [['n1', true]]);
  assert.deepEqual((await restored.load('bob')).map(item => item.id), ['n2']);
});

test('notification history caps at 100 newest entries and tolerates unavailable storage', async () => {
  const history = createNotificationHistory({ getItem: async () => { throw Error('unavailable'); }, setItem: async () => { throw Error('full'); } });
  await Promise.all(Array.from({ length: 105 }, (_, i) => history.add('u1', notice(String(i), i))));
  const items = await history.load('u1'); assert.equal(items.length, 100); assert.equal(items[0].id, '104'); assert.equal(items.at(-1).id, '5');
  await history.markRead('u1'); assert.ok((await history.load('u1')).every(item => item.read));
});

test('date presets share the web Vietnam timezone at month and year boundaries', () => {
  const now = new Date('2025-12-31T18:00:00Z');
  assert.deepEqual(dashboardDateRange('month', now), { dateFrom: '2026-01-01', dateTo: '2026-01-01' });
  assert.deepEqual(dashboardDateRange('year', now), { dateFrom: '2026-01-01', dateTo: '2026-01-01' });
  assert.deepEqual(dashboardDateRange('week', now), { dateFrom: '2025-12-26', dateTo: '2026-01-01' });
});

test('custom activity dates reject future, reversed, malformed and excessive ranges', () => {
  const now = new Date('2026-10-26T03:00:00Z');
  for (const [from, to] of [['2026-10-27', '2026-10-27'], ['2026-10-26', '2026-10-25'], ['2026-02-30', '2026-03-01'], ['2025-01-01', '2026-10-26'], ['', '2026-10-26']]) assert.equal(vocabularyActivityRange('custom', from, to, now).valid, false);
  const range = vocabularyActivityRange('custom', '2024-01-01', '2024-12-31', now);
  assert.equal(range.valid, true); assert.equal(range.count, 366);
});

test('legacy learner web routes resolve to the same native lesson filters', () => {
  assert.equal(mobileRoute('/learn/reading-lab'), '/lessons?type=technical_reading');
  assert.equal(mobileRoute('/learn/practice/scenario/s1'), '/lessons?type=case_study');
  assert.equal(mobileRoute('/learn/dashboard'), '/(tabs)/home');
});
