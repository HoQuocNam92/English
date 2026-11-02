const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildAnnotations } = require('./reading-glossary.cjs');
const word = (term, definitionVi = 'nghĩa IT') => ({ id: term, term, definitionVi, definitionEn: 'technical meaning', status: 'published', tags: ['reviewed-meaning'] });

test('does not highlight ordinary or unreviewed words as technical terms', () => {
  const text = 'The team expects excitement in a new region. They turn to a reference.';
  assert.deepEqual(buildAnnotations(text, [word('Team'), word('Region'), { ...word('turn'), tags: [] }, { ...word('excitement'), tags: [] }, word('Reference')]), []);
});
test('matches whole technical phrases, regular plurals and hyphens without overlaps', () => {
  const text = 'A source of truth uses database transactions; dual-write operations update databases.';
  const annotations = buildAnnotations(text, [word('Source of truth'), word('Database transaction'), word('Database'), word('Dual write')]);
  assert.deepEqual(annotations.map(a => a.term), ['source of truth', 'database transactions', 'dual-write', 'databases']);
  for (const a of annotations) assert.equal(text.slice(a.start, a.end), a.term);
});
test('uses the lesson-specific reviewed definition before a global homonym', () => {
  const annotations = buildAnnotations('A backfill populates the new customer table.', [word('Backfill', 'Điền dữ liệu cũ vào cấu trúc mới.')], [word('Backfill', 'Xử lý bù dữ liệu lịch sử.')]);
  assert.equal(annotations[0].definitionVi, 'Điền dữ liệu cũ vào cấu trúc mới.');
});
test('never matches a technical substring inside a different word', () => {
  assert.deepEqual(buildAnnotations('The cachedatabase and databasesuffix are arbitrary identifiers.', [word('Database')]), []);
});
