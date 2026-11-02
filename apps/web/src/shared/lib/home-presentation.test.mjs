import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseDocument } from 'htmlparser2';
import { goalProgress } from '../../../../../packages/shared-kernel/src/goal-progress.cjs';
import { selectedCertificates } from '../../../../../packages/shared-kernel/src/selected-certificates.ts';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = readFileSync(new URL('../../../app/(learner)/learn/page.tsx', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const walk = node => [node, ...(node.children ?? []).flatMap(walk)];
const text = node => node.type === 'text' ? node.data : (node.children ?? []).map(text).join('');
function render(journey, guidance = {}) {
  let state = 0;
  const data = { profile: { level: { name: 'Trung cấp' }, domains: [], certGoals: [] }, journey, attempts: [{ id: 'a1', score: 100, totalQuestions: 100, exam: { id: 'e1', title: 'Bài kiểm tra' } }], reviewWords: [], reviewUnavailable: false, certificates: [] };
  const mocks = {
    react: { ...React, useEffect() {}, useState: () => [[data, false, guidance][state++], () => {}] },
    'next/link': { default: ({ children, href, ...props }) => React.createElement('a', { href, ...props }, children) },
    '../../../../../packages/shared-kernel/src/goal-progress.cjs': { goalProgress },
    '../../../../../packages/shared-kernel/src/selected-certificates': { selectedCertificates },
    '@/shared/layout': { LearnerShell: ({ children }) => React.createElement('main', null, children) },
    '@/shared/api/api-client': { apiClient: {} }, '@/shared/ui': { LoadingSpinner: () => null },
    '@/shared/ui/LevelBadge': { LevelBadge: ({ children }) => React.createElement('span', null, children) },
  };
  const exports = {};
  runInNewContext(code, { exports, require: name => name in mocks ? mocks[name] : require(name) });
  return walk(parseDocument(renderToStaticMarkup(exports.default())));
}

test('home action buttons retain their destinations and consistently include icons in every goal state', () => {
  for (const progress of [null, { vocabularyToday: 8, studyMinutesToday: 8, examsWeek: 1 }, { vocabularyToday: 16, studyMinutesToday: 16, examsWeek: 5 }, { vocabularyToday: 16, studyMinutesToday: 30, examsWeek: 5 }]) {
    const nodes = render(progress ? { configured: true, targets: { vocabularyPerDay: 10, minutesPerDay: 30, examsPerWeek: 2 }, progress } : { configured: false });
    const buttons = nodes.filter(node => node.name === 'a' && /min-h-\d/.test(node.attribs?.class ?? ''));
    assert.ok(buttons.length >= 4);
    for (const button of buttons) {
      assert.ok(walk(button).some(node => node.name === 'svg'), `Missing icon: ${text(button)}`);
      assert.ok(button.attribs.href.startsWith('/learn/'));
    }
  }
});

test('home renders a prominent actual total with a smaller target and explicit exceeded-goal text', () => {
  const nodes = render({ configured: true, targets: { vocabularyPerDay: 10, minutesPerDay: 30, examsPerWeek: 2 }, progress: { vocabularyToday: 16, studyMinutesToday: 16, examsWeek: 5 } });
  const ratio = nodes.find(node => node.attribs?.['aria-label'] === '16 từ đã hoàn thành, mục tiêu 10 từ');
  assert.ok(ratio);
  assert.ok(walk(ratio).some(node => node.name === 'strong' && text(node) === '16' && node.attribs.class.includes('text-[30px]')));
  assert.ok(walk(ratio).some(node => node.name === 'span' && text(node) === 'từ đã hoàn thành' && node.attribs.class.includes('text-xs')));
  assert.ok(nodes.some(node => node.name === 'p' && text(node) === 'Mục tiêu 10 từ/ngày'));
  assert.ok(!nodes.some(node => node.type === 'text' && /\/ 10 từ/.test(node.data)));
  assert.ok(nodes.some(node => node.type === 'text' && node.data === 'Vượt mục tiêu 6 từ'));
  assert.ok(nodes.some(node => node.type === 'text' && node.data === 'Vượt mục tiêu 3 bài'));
  for (const bar of nodes.filter(node => node.attribs?.role === 'progressbar')) assert.ok(Number(bar.attribs['aria-valuenow']) <= 100);
});

test('AI daily guidance and ranked recommendation reuse the existing home hero', () => {
  const journey = { configured: true, targets: { vocabularyPerDay: 10, minutesPerDay: 30, examsPerWeek: 2 }, progress: { vocabularyToday: 14, studyMinutesToday: 1 } };
  const plain = render(journey);
  const guided = render(journey, { agenda: { aiSummary: 'Ôn chủ đề yếu hôm nay', tasks: [{ status: 'todo', href: '/learn/lessons/core', reason: 'Học kiến thức trước' }] }, recommendations: [{ actionUrl: '/learn/certifications/cloud', actionText: 'Ôn bảo mật', title: 'Bảo mật Cloud', reason: 'Củng cố phần yếu' }] });
  assert.ok(guided.some(node => node.name === 'a' && node.attribs.href === '/learn/lessons/core'));
  assert.ok(guided.some(node => node.name === 'a' && text(node) === 'Gợi ý: Bảo mật Cloud' && node.attribs.href === '/learn/certifications/cloud'));
  assert.ok(guided.some(node => node.name === 'p' && text(node) === 'Ôn chủ đề yếu hôm nay'));
  assert.equal(guided.filter(node => node.name === 'section').length, plain.filter(node => node.name === 'section').length);
});
