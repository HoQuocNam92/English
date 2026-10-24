const { test } = require('node:test');
const assert = require('node:assert/strict');
const { capitalize, changes, sectionContent } = require('./audit-content-capitalization.cjs');

test('capitalizes English and Vietnamese initials, preserving remaining spelling', () => {
  assert.equal(capitalize('variable'), 'Variable');
  assert.equal(capitalize('định nghĩa biến.'), 'Định nghĩa biến.');
  assert.equal(capitalize('AWS IAM'), 'AWS IAM');
  assert.equal(capitalize(capitalize('function')), 'Function');
});
test('preserves code and technical identifiers', () => {
  for (const value of ['returnValue', 'user_id', '/orders', 'https://example.com', 'const x = 2', '<p>variable</p>']) assert.equal(capitalize(value), value);
  const section = { type: 'code', content: { text: 'return value', language: 'typescript' } };
  assert.deepEqual(sectionContent(section), section.content);
  assert.deepEqual(sectionContent({ type: 'rich_text', content: { term: 'variable', path: '/orders', text: 'return value' } }), { term: 'Variable', path: '/orders', text: 'return value' });
});
test('audit identifies stored glossary terms and becomes empty after correction', () => {
  const lesson = { id: 'lesson', title: 'Bài học', summary: 'Tóm tắt', keyConcepts: ['variable'], sections: [{ id: 'section', type: 'vocabulary_list', content: { term: 'variable', definitionVi: 'biến chương trình.' } }] };
  const edits = changes({ lessons: [lesson] });
  assert.equal(edits.length, 2);
  Object.assign(lesson, edits.find(x => x.model === 'lesson').data);
  Object.assign(lesson.sections[0], edits.find(x => x.model === 'lessonSection').data);
  assert.deepEqual(changes({ lessons: [lesson] }), []);
});
test('duplicate vocabulary terms retain their identity while definitions can be corrected', () => {
  const edits = changes({ vocabulary: [
    { id: 'lower', domainId: 'software', term: 'variable', definitionEn: 'a value.', definitionVi: 'Biến.' },
    { id: 'upper', domainId: 'software', term: 'Variable', definitionEn: 'A value.', definitionVi: 'Biến.' },
  ] });
  assert.equal(edits.length, 1);
  assert.deepEqual(edits[0].data, { definitionEn: 'A value.' });
});
