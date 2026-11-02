import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const source = readFileSync(new URL('../ui/ReadingGlossary.tsx', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
runInNewContext(code, { exports, require });
const render = (text, glossary) => renderToStaticMarkup(React.createElement(exports.ReadingGlossary, { text, glossary }));
test('renders only reviewed exact spans as accessible highlight buttons and keeps the paragraph intact', () => {
  const text = 'The database stores orders.';
  const html = render(text, { text, annotations: [{ start: 4, end: 12, term: 'database', definitionVi: 'cơ sở dữ liệu' }] });
  assert.match(html, /aria-label="Xem nghĩa IT: database"/);
  assert.match(html, /aria-expanded="false"/);
  assert.equal(html.replace(/<[^>]+>/g, ''), text);
  assert.doesNotMatch(html, /cơ sở dữ liệu/);
});
test('does not highlight when a reading changed after its annotation was generated', () => {
  assert.equal(render('Updated text.', { text: 'Old text.', annotations: [{ start: 0, end: 3, term: 'Old', definitionVi: 'cũ' }] }), 'Updated text.');
});
test('ignores invalid offsets and renders strings as escaped text', () => {
  const text = 'Read <script>alert(1)</script> safely.';
  const html = render(text, { text, annotations: [{ start: -1, end: 4, term: 'Read', definitionVi: 'đọc' }] });
  assert.doesNotMatch(html, /<script>|<button/);
  assert.match(html, /&lt;script&gt;/);
});
