const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildCurriculum, validate } = require('./seed-software-curriculum.cjs');

test('Software has 50 distinct complete terms and ten lessons of all six genres at each level', () => {
  const tiers = validate();
  assert.deepEqual(tiers.map(tier => tier.level), ['beginner', 'intermediate', 'advanced', 'professional']);
  assert.equal(new Set(tiers.flatMap(tier => tier.words.map(word => word[0].toLowerCase()))).size, 200);
  for (const tier of tiers) {
    assert.equal(tier.lessons.length, 10);
    assert.equal(tier.words.length, 50);
    assert.equal(new Set(tier.lessons.flatMap(lesson => lesson.words.map(word => word[0]))).size, 50);
    assert.deepEqual([...new Set(tier.lessons.map(lesson => lesson.type))].sort(), ['api_documentation', 'case_study', 'system_design', 'technical_reading', 'terminology', 'vocabulary']);
    for (const lesson of tier.lessons) {
      assert.ok(lesson.words.length >= 7);
      assert.ok(lesson.sections.some(section => /tham khảo|Nguồn/.test(section.title)));
      assert.ok(lesson.sections.some(section => section.content.definitionEn || /tiếng Anh|Specification|English/.test(section.title)));
    }
    for (const row of tier.words) {
      assert.equal(row.length, 5);
      assert.ok(row[0].trim().length > 1 && row.slice(1).every(value => value.trim().length > 10));
      assert.ok(row[0].length <= 150 && row[1].length <= 1000 && row[2].length <= 1000 && row[3].length <= 500 && row[4].length <= 500);
    }
  }
});

test('content audit rejects an absent tier, repeated vocabulary, or missing lesson', () => {
  const tiers = buildCurriculum();
  tiers[0].words[1] = tiers[0].words[0];
  assert.throws(() => validate(tiers), /Repeated term/);
  const incomplete = buildCurriculum(); incomplete[2].lessons.pop();
  assert.throws(() => validate(incomplete), /Incomplete/);
  assert.throws(() => validate(incomplete.slice(1)), /four Software levels/);
});
