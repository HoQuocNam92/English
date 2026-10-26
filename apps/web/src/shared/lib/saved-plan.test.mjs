import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
const label = tree => typeof tree === 'string' ? tree : Array.isArray(tree) ? tree.map(label).join('') : tree?.props ? label(tree.props.children) : '';
function mount(error = '') {
  const ts = createRequire(import.meta.url)('typescript');
  const state = [null, false, error, false, false]; let cursor = 0; let reads = 0; const posts = [];
  const jsx = (type, props) => ({ type, props });
  const mocks = {
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
    react: { useState: () => { const index = cursor++; return [state[index], value => { state[index] = value; }]; }, useEffect() {}, useCallback: callback => callback },
    'next/link': 'link', '@/shared/layout': { LearnerShell: 'shell' },
    '@/shared/ui': { LoadingSpinner: 'loading' },
    '@/shared/ui/PlacementPlan': { PlacementPlan: 'plan' },
    '@/shared/ui/LearningPathJourney': { LearningPathJourney: 'journey' },
    '@/shared/api/api-client': { apiClient: {
      get: async () => { reads++; throw new Error('Unexpected follow-up read'); },
      post: async (path, body) => { posts.push({ path, body }); return { assessmentId: 'created', plan: { steps: [] } }; },
    } },
  };
  const source = readFileSync(new URL('../../../app/(learner)/learn/plan/page.tsx', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  runInNewContext(code, { exports, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
  return { render: () => { cursor = 0; return nodes(exports.default()); }, posts, reads: () => reads };
}

test('a learner without a saved plan can create one and immediately see the returned plan', async () => {
  const page = mount(); let tree = page.render();
  assert.ok(tree.some(node => node.type === 'h1' && label(node).includes('chưa tạo lộ trình')));
  tree.find(node => node.type === 'button' && label(node) === 'Tạo lộ trình theo mục tiêu').props.onClick();
  await new Promise(resolve => setImmediate(resolve));
  tree = page.render();
  assert.equal(tree.find(node => node.type === 'plan').props.result.assessmentId, 'created');
  assert.equal(page.posts[0].path, '/placement-test/plan'); assert.equal(page.reads(), 0);
});

test('failed loading shows retry instead of claiming the learner has no plan', () => {
  const tree = mount('Không thể kết nối đến máy chủ.').render();
  assert.ok(tree.some(node => node.props.role === 'alert'));
  assert.ok(tree.some(node => node.type === 'button' && label(node) === 'Thử lại'));
  assert.equal(tree.some(node => label(node).includes('Bạn chưa tạo lộ trình')), false);
});
