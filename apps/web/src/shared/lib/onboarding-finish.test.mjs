import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url), ts = require('typescript');
const jsx = (type, props) => ({ type, props });
const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
const label = tree => typeof tree === 'string' ? tree : Array.isArray(tree) ? tree.map(label).join('') : tree?.props ? label(tree.props.children) : '';

test('all web onboarding goals save before navigating to the learner home', async () => {
  for (const goal of ['vocabulary', 'certification', 'both']) for (const step of [1, 2, 4]) {
    if (goal === 'both' && step === 2) continue;
    const state = [step, goal, [{ id: 'aws', code: 'AWS', name: 'AWS' }], goal === 'certification' ? [] : [{ id: 'cloud', code: 'CLOUD', name: 'Cloud' }], 'AWS', goal === 'vocabulary' ? ['CLOUD'] : [], 'beginner', [{ code: 'beginner' }], 10, 2, 30, false, '20:00', false, false, ''];
    const calls = []; let cursor = 0;
    const mocks = {
      'react/jsx-runtime': { jsx, jsxs: jsx },
      react: { useState: () => { const i = cursor++; return [state[i], value => { state[i] = typeof value === 'function' ? value(state[i]) : value; }]; }, useEffect() {}, useId: () => 'field' },
      'next/navigation': { useRouter: () => ({ replace: url => calls.push(url) }) },
      'lucide-react': new Proxy({}, { get: () => 'icon' }),
      '@/shared/ui/RequiredMark': { RequiredMark: 'required' },
      '@/shared/ui/AppIcon': { AppIcon: 'icon', IconText: 'text' },
      '@/shared/ui/LevelBadge': { LevelBadge: 'badge' },
      '@/shared/notifications/firebase-client': { registerWebLearningNotifications: async () => false },
      '@/shared/api/api-client': { apiClient: { post: async (url, data) => {
        assert.equal(url, '/learner-profiles/me/complete-onboarding');
        assert.equal(data.learningGoal, goal);
        assert.equal(JSON.stringify(data.domainCodes), JSON.stringify(goal === 'vocabulary' ? ['CLOUD'] : []));
        assert.equal(JSON.stringify(data.certificateCodes), JSON.stringify(goal === 'certification' ? ['AWS'] : []));
        calls.push('save');
      } } },
    };
    const exports = {};
    const code = ts.transpileModule(readFileSync(new URL('../../../app/(learner)/onboarding/page.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    runInNewContext(code, { exports, window: { dispatchEvent() {} }, CustomEvent: class {}, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
    const tree = exports.default();
    if (step === 1) {
      nodes(tree).find(node => node.type === 'button' && label(node).startsWith('Tiếp tục')).props.onClick();
      assert.equal(state[0], goal === 'both' ? 3 : 2);
      continue;
    }
    if (step === 2) {
      assert.equal(label(tree).includes('Chuyên ngành IT'), goal !== 'certification');
      const certificateHeading = nodes(tree).some(node => node.type === 'h2' && label(node).includes('Chứng chỉ mục tiêu'));
      assert.equal(certificateHeading, goal !== 'vocabulary');
      assert.equal(label(tree).includes('Chưa có đủ nội dung'), false);
      const next = nodes(tree).find(node => node.type === 'button' && label(node).startsWith('Tiếp tục'));
      assert.equal(next.props.disabled, false);
      continue;
    }
    assert.ok(!label(tree).includes('kiểm tra đầu vào'));
    await nodes(tree).find(node => node.type === 'button' && label(node).startsWith('Tạo lộ trình')).props.onClick();
    assert.deepEqual(calls, ['save', '/learn']);
  }
});
