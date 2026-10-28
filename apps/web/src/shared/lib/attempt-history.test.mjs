import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const ts = createRequire(import.meta.url)('typescript');
const jsx = (type, props) => ({ type, props });
const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
const label = tree => typeof tree === 'string' ? tree : Array.isArray(tree) ? tree.map(label).join('') : tree?.props ? label(tree.props.children) : '';
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
  const data = { profile: null, journey: null, certificates: [], reviewWords: [], attempts: [
    { id: 'attempt-new', examId: 'same-exam', exam: { title: 'Cloud practice' }, status: 'graded', score: 75, completedAt: '2026-10-26T10:00:00Z' },
    { id: 'attempt-old', examId: 'same-exam', exam: { title: 'Cloud practice' }, status: 'graded', score: 25, completedAt: '2026-10-25T10:00:00Z' },
  ] };
  const state = [data, false]; let index = 0;
  const component = load('../../../app/(learner)/learn/page.tsx', {
    react: { useState: () => [state[index++], () => {}], useEffect() {} },
    'next/link': 'link', '@/shared/layout': { LearnerShell: 'shell' },
    'lucide-react': { ArrowRight: 'arrow', Play: 'play', Settings2: 'settings' },
    '@/shared/api/api-client': { apiClient: {} }, '@/shared/ui': { LoadingSpinner: 'spinner' },
    '@/shared/ui/LevelBadge': { LevelBadge: 'level' },
    '../../../../../packages/shared-kernel/src/selected-certificates': { selectedCertificates: () => [] },
  }).default;
  const tree = nodes(component());
  const entries = tree.filter(node => node.type === 'article');
  assert.equal(entries.length, 2);
  entries.forEach((entry, index) => {
    const links = nodes(entry).filter(node => node.type === 'link');
    assert.equal(links.find(node => label(node) === 'Xem kết quả').props.href, `/learn/quiz/result/${data.attempts[index].id}`);
    assert.equal(links.find(node => label(node) === 'Làm lại').props.href, '/learn/quiz/same-exam');
  });
});

test('the shared result action always uses the attempt identifier', () => {
  const { AttemptResultLink } = load('../ui/AttemptResultLink.tsx', { 'next/link': 'link' });
  assert.equal(AttemptResultLink({ attemptId: 'attempt-42' }).props.href, '/learn/quiz/result/attempt-42');
});
