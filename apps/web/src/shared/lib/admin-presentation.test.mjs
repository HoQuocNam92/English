import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseDocument } from 'htmlparser2';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const walk = node => [node, ...(node.children ?? []).flatMap(walk)];
const text = node => node.type === 'text' ? node.data : (node.children ?? []).map(text).join('');
function component(path) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const exports = {};
  const mocks = {
    'next/link': { default: ({ children, href, ...props }) => React.createElement('a', { href, ...props }, children) },
    '@/shared/lib/cn': { cn: (...values) => values.filter(Boolean).join(' ') },
    '@/shared/ui/Dropdown': { Dropdown: ({ children, ...props }) => React.createElement('select', props, children) },
  };
  runInNewContext(code, { exports, require: name => name in mocks ? mocks[name] : require(name) });
  return exports;
}
const render = (Component, props) => walk(parseDocument(renderToStaticMarkup(React.createElement(Component, props))));

test('pagination exposes only selectable page numbers and size, including the last page of a large list', () => {
  const { Pagination } = component('../ui/Pagination.tsx');
  for (const page of [1, 27, 53]) {
    const nodes = render(Pagination, { page, totalPages: 53, total: 1574, limit: 30, onPageChange() {}, onLimitChange() {} });
    assert.equal(nodes.filter(node => node.name === 'input').length, 0);
    assert.equal(nodes.filter(node => node.attribs?.['aria-current'] === 'page').length, 1);
    assert.ok(nodes.some(node => node.name === 'button' && text(node) === '53'));
    assert.ok(nodes.some(node => node.name === 'select' && node.attribs['aria-label'] === 'Số dòng trên mỗi trang'));
    assert.ok(!nodes.some(node => node.type === 'text' && /Đến trang/.test(node.data)));
  }
});

test('reports distinguish an actual zero score from a certificate with no attempts', () => {
  const { CertificateScoreChart } = component('../ui/ReportCharts.tsx');
  const nodes = render(CertificateScoreChart, { loading: false, data: [
    { id: 'a', code: 'ACTUAL_ZERO', name: 'Bài thi đã làm', attempts: 2, averageScore: 0, passRate: 0 },
    { id: 'b', code: 'NO_ATTEMPTS', name: 'Chưa thi', attempts: 0, averageScore: 0, passRate: 0 },
  ] });
  assert.equal(nodes.filter(node => node.attribs?.role === 'img').length, 1);
  assert.ok(nodes.some(node => node.attribs?.['aria-label'] === 'Bài thi đã làm: 0/100 điểm, 2 lượt thi'));
  assert.ok(nodes.some(node => node.name === 'summary' && /1 chứng chỉ chưa có lượt thi/.test(text(node))));
});

test('specialty distribution derives catalog size and percentages from supplied records and links to editable source data', () => {
  const { ContentDistribution } = component('../ui/ContentDistribution.tsx');
  const data = [{ code: 'CUSTOM', name: 'Chuyên ngành mới', lessons: 1, vocabularies: 1, questions: 1, exams: 1, totalItems: 4 }];
  const nodes = render(ContentDistribution, { loading: false, data });
  assert.ok(nodes.some(node => node.attribs?.['aria-label'] === 'Chuyên ngành mới: 4 học liệu, 100.0%'));
  assert.ok(nodes.some(node => node.name === 'a' && node.attribs.href === '/admin/domains'));
  const empty = render(ContentDistribution, { loading: false, data: [{ ...data[0], totalItems: 0 }] });
  assert.ok(empty.some(node => node.attribs?.['aria-label'] === 'Chuyên ngành mới: 0 học liệu, 0.0%'));
});

test('completion chart keeps actual item counts and handles an empty period', () => {
  const { CompletionChart } = component('../ui/ReportCharts.tsx');
  const nodes = render(CompletionChart, { loading: false, data: { completedLearners: 2, completedItems: 18, topLearners: [{ learnerId: '1', displayName: 'A', completedItems: 12 }, { learnerId: '2', displayName: 'B', completedItems: 6 }] } });
  assert.ok(nodes.some(node => node.attribs?.['aria-label'] === 'B: 6 nội dung'));
  const bars = nodes.filter(node => node.attribs?.role === 'img');
  assert.equal(bars.length, 2);
  assert.match(bars[1].children[0].attribs.style, /width:50%/);
  assert.ok(render(CompletionChart, { loading: false }).some(node => node.type === 'text' && /Chưa có học viên hoàn thành/.test(node.data)));
});
