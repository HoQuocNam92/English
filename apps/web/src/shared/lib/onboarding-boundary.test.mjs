import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url), ts = require('typescript');

test('navigation and remount reuse completed onboarding, while another account is checked', async () => {
  const completed = new Set();
  let userId = 'first', pathname = '/learn', requests = 0;
  let state = [], cursor = 0, pending = [];
  const router = { replace: () => assert.fail('Completed learner must remain on the requested page') };
  const mocks = {
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    react: {
      useState(initial) { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], value => { state[i] = value; }]; },
      useEffect(fn) { pending.push(fn); },
    },
    'next/navigation': { usePathname: () => pathname, useRouter: () => router },
    '@/features/auth/presentation': { useAuth: () => ({ session: { user: { id: userId } } }) },
    '@/shared/api/api-client': { apiClient: { get: async () => { requests++; return { onboardingCompleted: true }; } } },
    '../../../../../packages/shared-kernel/src/post-login-destination': { postLoginDestination: async ({ loadProfile }) => { await loadProfile(); return '/learn'; } },
    './onboarding-cache': { hasCompletedOnboarding: id => completed.has(id), rememberCompletedOnboarding: id => completed.add(id) },
    '@/shared/ui': { LoadingSpinner: 'spinner' },
  };
  const exports = {};
  const source = readFileSync(new URL('../auth/LearnerOnboardingBoundary.tsx', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  runInNewContext(code, { exports, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
  const render = () => { cursor = 0; pending = []; return exports.LearnerOnboardingBoundary({ children: 'page' }); };
  const settle = async () => { pending.forEach(fn => fn()); await new Promise(resolve => setImmediate(resolve)); };
  render(); await settle();
  assert.equal(requests, 1);
  assert.equal(render().props.children, 'page');
  pathname = '/learn/lessons';
  assert.equal(render().props.children, 'page'); await settle();
  assert.equal(requests, 1);
  state = [];
  assert.equal(render().props.children, 'page'); await settle();
  assert.equal(requests, 1);
  userId = 'second';
  assert.notEqual(render().props.children, 'page'); await settle();
  assert.equal(requests, 2);
});
