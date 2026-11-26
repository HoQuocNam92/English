import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { postLoginDestination } from '../../../../packages/shared-kernel/src/post-login-destination.ts';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const jsx = (type, props) => ({ type, props });
const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
const label = tree => typeof tree === 'string' ? tree : Array.isArray(tree) ? tree.map(label).join('') : tree?.props ? label(tree.props.children) : '';

test('finishing each mobile learning goal saves setup and opens home without a placement-test option', async () => {
  for (const goal of ['vocabulary', 'certification', 'both']) {
    const calls = [], routes = [];
    const stored = { onboarding_goal: goal, onboarding_level: 'beginner', onboarding_domains: '["CLOUD"]', onboarding_certificate_code: 'AWS', onboarding_certificate_id: 'cert-id' };
    const mocks = {
      'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
      react: { useState: value => [value, () => {}] },
      'expo-router': { useRouter: () => ({ replace: route => routes.push(route) }) },
      'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) },
      'react-native': { View: 'view', ScrollView: 'scroll', ActivityIndicator: 'loading', StyleSheet: { create: value => value }, Alert: { alert: (...args) => assert.fail(args.join(': ')) } },
      'expo-status-bar': { StatusBar: 'status' },
      '@techenglish/design-tokens': { colors: {}, spacing: {} },
      '@react-native-async-storage/async-storage': { __esModule: true, default: { multiGet: async keys => keys.map(key => [key, stored[key]]), multiRemove: async () => calls.push('clear-draft') } },
      '../../src/shared/ui/primitives': { Text: 'text', TextInput: 'input', TouchableOpacity: 'touch' },
      '../../src/shared/ui/RequiredMark': { RequiredMark: 'required' },
      '../../src/shared/ui/AppIcon': { MaterialIcons: 'icon' },
      '../../src/shared/utils/learning-targets': { validateLearningTargets: () => null },
      '../../src/shared/notifications/learning-reminders': { scheduleLearningReminder: async () => true },
      '../../src/shared/api/api-client': { api: { post: async (url, data) => {
        assert.equal(url, '/learner-profiles/me/complete-onboarding');
        assert.equal(data.learningGoal, goal);
        assert.equal(JSON.stringify(data.domainCodes), JSON.stringify(goal === 'vocabulary' ? ['CLOUD'] : []));
        assert.equal(JSON.stringify(data.certificateCodes), JSON.stringify(goal === 'certification' ? ['AWS'] : []));
        calls.push('save');
      } } },
    };
    const exports = {};
    const code = ts.transpileModule(readFileSync(new URL('../../app/(onboarding)/plan.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    runInNewContext(code, { exports, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
    const tree = exports.default();
    assert.ok(!label(tree).includes('kiểm tra đầu vào'));
    await nodes(tree).find(node => node.type === 'touch' && label(node) === 'Tạo lộ trình').props.onPress();
    assert.deepEqual(calls, ['save', 'clear-draft']);
    assert.deepEqual(routes, ['/(tabs)/home']);
  }
});

test('email login opens onboarding for an unfinished account and home for a returning learner', async () => {
  for (const completed of [false, true]) {
    const state = []; let cursor = 0; const routes = []; const calls = [];
    const mocks = {
      'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
      react: { useState: initial => { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], value => { state[i] = value; }]; } },
      'expo-router': { useRouter: () => ({ replace: route => routes.push(route) }) },
      'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0 }) },
      'react-native': { View: 'view', ScrollView: 'scroll', ActivityIndicator: 'loading', StyleSheet: { create: value => value }, Alert: {}, TurboModuleRegistry: {} },
      'expo-status-bar': { StatusBar: 'status' }, expo: {},
      'react-native-svg': { default: 'svg', Path: 'path' },
      '@techenglish/design-tokens': { colors: {}, spacing: {} },
      '../../src/shared/ui/primitives': { Text: 'text', TextInput: 'input', Button: 'button', TouchableOpacity: 'touch' },
      '../../src/shared/ui/RequiredMark': { RequiredMark: 'required' },
      '../../src/shared/ui/AppIcon': { MaterialIcons: 'icon' },
      '../../src/shared/ui/GoogleAuthButton': { GoogleAuthButton: 'google' },
      '../../src/shared/store/auth-context': { useAuth: () => ({ login: async () => { calls.push('login'); } }) },
      '../../src/shared/utils/validators': { validateEmail: () => null },
      '../../src/shared/api/api-client': { api: { get: async path => { calls.push(path); return { onboardingCompleted: completed }; } } },
      '../../../../packages/shared-kernel/src/post-login-destination': { postLoginDestination },
    };
    const exports = {};
    const source = readFileSync(new URL('../../app/(auth)/login.tsx', import.meta.url), 'utf8');
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    runInNewContext(code, { exports, process: { env: {} }, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
    const render = () => { cursor = 0; return nodes(exports.default()); };
    let tree = render();
    const inputs = tree.filter(node => node.type === 'input');
    inputs[0].props.onChangeText('learner@gmail.com');
    inputs[1].props.onChangeText('Password123!');
    tree = render();
    await tree.find(node => node.type === 'button' && node.props.children === 'Đăng nhập').props.onPress();
    assert.deepEqual(calls, ['login', '/learner-profiles/me']);
    assert.equal(routes[0], completed ? '/(tabs)/home' : '/(onboarding)/goal');
  }
});
