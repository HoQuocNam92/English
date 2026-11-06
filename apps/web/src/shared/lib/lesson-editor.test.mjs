import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const load = (relative, mocks = {}) => {
  const exports = {};
  const source = ts.transpileModule(readFileSync(new URL(relative, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  runInNewContext(source, { exports, URLSearchParams, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
  return exports;
};
const studio = load('../../../app/(admin)/admin/lessons/editor/LessonContentStudio.tsx', {
  react: React,
  'react/jsx-runtime': require('react/jsx-runtime'),
  '@/shared/ui/RichTextEditor': { RichTextEditor: ({ value, onChange, ...props }) => React.createElement('textarea', { value, onChange, ...props }) },
  '../../../../../../../packages/shared-kernel/src/rich-text': { richTextToPlainText: value => value.replace(/<[^>]*>/g, '').trim() },
  '@/shared/ui/RequiredMark': { RequiredMark: () => React.createElement('span', null, '*') },
  '@/shared/ui/AppIcon': { AppIcon: () => null },
  '@/shared/ui/ActionButton': { ActionGroup: ({ children }) => children, ActionButton: ({ label, onClick }) => React.createElement('button', { onClick }, label) },
  '@/shared/ui/Dropdown': { Dropdown: props => React.createElement('select', props) },
});
const raw = [
  { type: 'rich_text', title: 'Mục tiêu học tập', content: { text: 'Đọc và giải thích các thuật ngữ Git.' } },
  { type: 'vocabulary_list', title: 'Repository', content: { term: 'Repository', partOfSpeech: 'noun', definitionEn: 'A store of versioned files.', definitionVi: 'Kho lưu tệp được quản lý phiên bản.', text: 'Giải thích ví dụ đã lưu.' } },
];

test('editing mixed terminology sections preserves content and never creates a leading empty term', () => {
  const sections = studio.hydrateStudioSections('terminology', raw, ['import-techenglish-v5', 'internal-tag']);
  assert.deepEqual(JSON.parse(JSON.stringify(sections)), raw);
  let mutations = 0;
  const html = renderToStaticMarkup(React.createElement(studio.LessonContentStudio, { type: 'terminology', sections, onChange: () => mutations++ }));
  assert.equal(mutations, 0);
  assert.equal((html.match(/Thẻ thuật ngữ 01/g) ?? []).length, 1);
  assert.doesNotMatch(html, /Thẻ thuật ngữ 02|Term card|Content studio/);
  assert.match(html, /Nội dung bổ sung/);
  assert.match(html, /Đọc và giải thích các thuật ngữ Git/);
  assert.match(html, /Giải thích ví dụ đã lưu/);
  assert.match(html, /value="noun" selected="">Danh từ/);
});

test('empty or legacy saved lessons are not replaced with fabricated cards based on import tags', () => {
  assert.equal(studio.hydrateStudioSections('terminology', [], ['internal-tag']).length, 0);
  const legacy = [{ type: 'rich_text', title: 'Nội dung', content: { text: 'Nội dung thật đã có.' } }];
  assert.deepEqual(JSON.parse(JSON.stringify(studio.hydrateStudioSections('terminology', legacy, ['internal-tag']))), legacy);
  assert.equal(studio.createStudioTemplate('terminology').length, 1, 'only new-content flow creates a template');
  assert.equal(studio.hasStudioContent({ type: 'heading', title: 'Giới thiệu', content: {} }), true);
});

test('lesson editor activates its actual category and does not activate sibling categories', () => {
  const { navigationRouteMatches: matches } = load('./navigation-route.ts');
  for (const type of ['terminology', 'technical_reading', 'api_documentation', 'system_design', 'case_study']) {
    const query = new URLSearchParams({ id: 'saved-lesson', type });
    assert.equal(matches(`/admin/lessons?type=${type}`, '/admin/lessons/editor', query), true);
    assert.equal(matches('/admin/lessons?type=other', '/admin/lessons/editor', query), false);
  }
  assert.equal(matches('/admin/lessons', '/admin/lessons', new URLSearchParams()), true);
  assert.equal(matches('/admin/lessons', '/admin/lessons', new URLSearchParams('type=terminology')), false);
});

test('reading edit/save keeps every separate section, nested glossary and every question', () => {
  const sections = [
    { type: 'rich_text', title: 'Bài đọc tiếng Anh', content: { text: 'Source paragraph', itGlossary: [{ start: 0, end: 6, translation: 'nguồn' }] } },
    { type: 'rich_text', title: 'Bản dịch tiếng Việt', content: { text: 'Đoạn dịch tiếng Việt.' } },
    ...[1, 2, 3].map(n => ({ type: 'quiz', title: `Câu hỏi ${n}`, content: { question: `Question ${n}`, answer: `Answer ${n}`, evidence: `Evidence ${n}` } })),
  ];
  const hydrated = studio.hydrateStudioSections('technical_reading', sections);
  assert.deepEqual(JSON.parse(JSON.stringify(hydrated)), sections);
  const html = renderToStaticMarkup(React.createElement(studio.LessonContentStudio, { type: 'technical_reading', sections: hydrated, onChange() {} }));
  for (const n of [1, 2, 3]) for (const prefix of ['Question', 'Answer', 'Evidence']) assert.match(html, new RegExp(`${prefix} ${n}`));
  assert.match(html, /Đoạn dịch tiếng Việt/);
});
