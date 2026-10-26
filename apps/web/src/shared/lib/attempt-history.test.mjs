import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const ts = createRequire(import.meta.url)('typescript');
const jsx = (type, props) => ({ type, props });
const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
function load(relative, mocks) {
  const source = readFileSync(new URL(relative, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const exports = {};
  runInNewContext(code, { exports, require: name => {
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
    assert.ok(name in mocks, `Unexpected dependency ${name}`); return mocks[name];
  } });
  return exports;
}

test('clicking a home history entry opens that specific attempt result, including retakes of the same exam', () => {
  const data = { attempts: [
    { id: 'attempt-new', examId: 'same-exam', exam: { title: 'Cloud practice' }, status: 'graded', score: 75, completedAt: '2026-10-26T10:00:00Z' },
    { id: 'attempt-old', examId: 'same-exam', exam: { title: 'Cloud practice' }, status: 'graded', score: 25, completedAt: '2026-10-25T10:00:00Z' },
  ] };
  const state = [data, false, '', false]; let index = 0;
  const component = load('../../../app/(learner)/learn/page.tsx', {
    react: { useState: () => [state[index++], () => {}], useEffect() {} },
    'next/link': 'link', '@/shared/layout': { LearnerShell: 'shell' },
    '@/shared/api/api-client': { apiClient: {} }, '@/shared/ui': { LoadingSpinner: 'spinner' },
    '@/shared/ui/AppIcon': { IconText: 'icon-text', AppIcon: 'icon' },
    '@/shared/ui/LevelBadge': { LevelBadge: 'level' },
    '@/shared/ui/AttemptResultLink': { AttemptResultLink: 'result-action' },
    '../../../../../packages/shared-kernel/src/selected-certificates': { selectedCertificates: () => [] },
  }).default;
  const tree = nodes(component());
  const activities = tree.filter(node => node.type === 'link' && node.props.className === 'group block');
  assert.deepEqual(activities.map(node => node.props.href), ['/learn/quiz/result/attempt-new', '/learn/quiz/result/attempt-old']);
  assert.equal(tree.some(node => node.props?.href === '/learn/quiz/same-exam'), false);
});

test('the shared result action always uses the attempt identifier', () => {
  const { AttemptResultLink } = load('../ui/AttemptResultLink.tsx', { 'next/link': 'link' });
  assert.equal(AttemptResultLink({ attemptId: 'attempt-42' }).props.href, '/learn/quiz/result/attempt-42');
});
