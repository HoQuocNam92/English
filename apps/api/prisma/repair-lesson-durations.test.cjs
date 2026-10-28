const { test } = require('node:test');
const assert = require('node:assert/strict');
const { repairSeededLessonDurations } = require('./repair-lesson-durations.cjs');

test('repair estimates only untouched seed defaults and leaves edited or configured lessons intact', async () => {
  const date = new Date('2026-10-01T00:00:00Z');
  const writes = [];
  const p = { lesson: {
    findMany: async query => {
      assert.equal(query.where.estimatedMinutes, 12);
      assert.equal(query.where.slug.startsWith, 'aws-clf-c02-knowledge-');
      return [
        { id: 'seeded', createdAt: date, updatedAt: date, sections: [{ content: { text: 'word '.repeat(800) } }] },
        { id: 'edited', createdAt: date, updatedAt: new Date(+date + 86400000), sections: [] },
      ];
    },
    updateMany: async query => { writes.push(query); return { count: 1 }; },
  } };
  assert.deepEqual(await repairSeededLessonDurations(p), { checked: 2, updated: 1 });
  assert.equal(writes.length, 1);
  assert.deepEqual(writes[0], { where: { id: 'seeded', estimatedMinutes: 12 }, data: { estimatedMinutes: 5 } });
});
