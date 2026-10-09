import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mobileRoute } from './navigation.ts';
import { requestTimeoutMs } from './api/request-timeout.ts';
import { validateLearningTargets } from './utils/learning-targets.ts';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { existsSync } from 'node:fs';
import { learningMenu } from './learning-menu.ts';

test('Google browser authentication never starts when opening native auth screens or when unconfigured', async () => {
  const require = createRequire(import.meta.url);
  const ts = require('typescript');
  const source = readFileSync(new URL('./ui/GoogleAuthButton.tsx', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  for (const platform of ['android', 'ios', 'web']) {
    let browserCalls = 0;
    let nativeCalls = 0;
    const jsx = (type, props) => ({ type, props });
    const mocks = {
      'react/jsx-runtime': { jsx, jsxs: jsx },
      react: { useEffect: callback => callback(), useRef: value => ({ current: value }) },
      'react-native': { Platform: { OS: platform } },
      'expo-auth-session/providers/google': { useIdTokenAuthRequest: config => {
        assert.ok(config.clientId);
        browserCalls++;
        return [{}, null, async () => {}];
      } },
      'expo-web-browser': { maybeCompleteAuthSession() {} },
      './primitives': { TouchableOpacity: 'button' },
    };
    const exports = {};
    runInNewContext(code, { exports, require: name => {
      assert.ok(name in mocks, `Unexpected import: ${name}`);
      return mocks[name];
    } });
    const errors = [];
    const props = { clientId: '', disabled: false, style: {}, children: 'Google', onNativePress: async () => { nativeCalls++; }, onIdToken: async () => {}, onError: message => errors.push(message) };
    const unconfiguredButton = exports.GoogleAuthButton(props);
    assert.equal(unconfiguredButton.type, 'button');
    unconfiguredButton.props.onPress();
    assert.equal(errors.length, 1);
    assert.match(errors[0], /chưa khả dụng/);
    assert.equal(nativeCalls, 0);
    assert.equal(browserCalls, 0);
    const button = exports.GoogleAuthButton({ ...props, clientId: 'configured-web-client' });
    if (platform === 'web') {
      button.type(button.props);
      assert.equal(browserCalls, 1);
      assert.equal(nativeCalls, 0);
    } else {
      assert.equal(browserCalls, 0);
      assert.equal(nativeCalls, 0);
      await button.props.onPress();
      assert.equal(nativeCalls, 1);
    }
  }
});

test('web agenda and recommendation links resolve to native screens without losing context', () => {
  assert.equal(mobileRoute('/learn'), '/(tabs)/home');
  assert.equal(mobileRoute('/learn/progress'), '/(tabs)/progress');
  assert.equal(mobileRoute('/learn/plan'), '/learning-plan');
  assert.equal(mobileRoute('/learn/flashcards/lesson-1'), '/flashcards/words?sourceLessonId=lesson-1');
  assert.equal(mobileRoute('/learn/flashcards/review/practice'), '/flashcards?mode=review');
  assert.equal(mobileRoute('/learn/flashcards/lesson-1/quiz?domainCode=CLOUD'), '/flashcards?domainCode=CLOUD&sourceLessonId=lesson-1&mode=quiz');
  assert.equal(mobileRoute('/learn/certifications/cert-1/topics/topic-1?lessonId=lesson-1'), '/certifications/topics/topic-1?lessonId=lesson-1&certificateId=cert-1');
  assert.equal(mobileRoute('/learn/quiz/result/attempt-1?certificateId=cert-1'), '/test-result/attempt-1?certificateId=cert-1');
  assert.equal(mobileRoute('/learn/flashcards'), '/flashcards/dashboard');
  assert.equal(mobileRoute('/learn/flashcards/history?page=2'), '/flashcards/history?page=2');
  assert.equal(mobileRoute('/learn/flashcards/dashboard'), '/flashcards/dashboard');
  assert.equal(mobileRoute('/learn/plan?refresh=true'), '/learning-plan?refresh=true');
  assert.equal(mobileRoute('/learn/profile?tab=history'), '/profile/history?tab=history');
  assert.equal(mobileRoute('/learn/profile?tab=goals'), '/profile/edit?tab=goals');
  assert.equal(mobileRoute('/learn?refresh=true'), '/(tabs)/home?refresh=true');
});

test('every learning menu destination exists and covers the learner areas', () => {
  const links = learningMenu.flatMap(group => group.items.map(item => item.href));
  for (const href of links) {
    const route = href.split('?')[0];
    const base = new URL(`../../app${route}`, import.meta.url);
    assert.ok(existsSync(new URL(`${base.href}.tsx`)) || existsSync(new URL(`${base.href}/index.tsx`)), `Missing menu destination ${route}`);
  }
  for (const route of ['/lessons', '/flashcards/dashboard', '/flashcards/explore', '/flashcards/history', '/certifications', '/catalog', '/learning-plan', '/placement-test', '/profile/edit', '/profile/history', '/(tabs)/progress']) {
    assert.ok(links.includes(route), `Learner feature not reachable: ${route}`);
  }
});

test('a learner without a saved plan can create one, including after a failed attempt', async () => {
  const require = createRequire(import.meta.url);
  const ts = require('typescript');
  const source = readFileSync(new URL('../../app/learning-plan.tsx', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const state = [];
  let cursor = 0;
  let focus;
  class ApiError extends Error { constructor(statusCode, message) { super(message); this.statusCode = statusCode; } }
  const jsx = (type, props) => ({ type, props });
  const mocks = {
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
    react: { useCallback: callback => callback, useState: initial => {
      const index = cursor++;
      if (!(index in state)) state[index] = initial;
      return [state[index], value => { state[index] = value; }];
    } },
    'react-native': { View: 'view' },
    'expo-router': { useFocusEffect: callback => { focus = callback; }, useRouter: () => ({ push() {} }) },
    '../src/shared/ui/FeatureScreen': { FeatureScreen: 'screen' },
    '../src/shared/ui/primitives': { Button: 'button', Text: 'text' },
    '../src/features/learning/PlacementPlan': { PlacementPlan: 'plan' },
    '../src/shared/api/api-client': { ApiError, api: { get: async () => { throw new ApiError(404, 'No assessment yet'); }, post: async () => { throw new ApiError(503, 'Server unavailable'); } } },
  };
  const exports = {};
  runInNewContext(code, { exports, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
  const render = () => { cursor = 0; return exports.default(); };
  render();
  focus();
  await new Promise(resolve => setImmediate(resolve));
  let screen = render();
  assert.equal(screen.props.error, '');
  assert.equal(screen.props.loading, false);
  const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
  const createButton = nodes(screen).find(node => node.type === 'button' && node.props.children === 'Tạo lộ trình theo mục tiêu');
  assert.ok(createButton, 'Create plan action must remain available after 404');
  await createButton.props.onPress();
  screen = render();
  assert.equal(screen.props.error, '');
  assert.ok(nodes(screen).some(node => node.type === 'text' && node.props.children === 'Server unavailable'));
  assert.ok(nodes(screen).some(node => node.type === 'button' && node.props.children === 'Tạo lộ trình theo mục tiêu'));
});

test('AI-backed mobile flows get enough time to complete while ordinary requests remain bounded', () => {
  for (const path of ['/translation/selection', '/progress/me/agenda', '/recommendations/me?refresh=true', '/placement-test/plan']) {
    assert.equal(requestTimeoutMs(path), 60000);
  }
  assert.equal(requestTimeoutMs('/users/me'), 15000);
});

test('learning targets reject invalid input instead of silently replacing it with defaults', () => {
  assert.equal(validateLearningTargets('1', '1', '5'), null);
  assert.equal(validateLearningTargets('200', '50', '1440'), null);
  for (const vocabulary of ['', '0', '201', '1.5', '1e2', '-1']) {
    assert.ok(validateLearningTargets(vocabulary, '2', '30'));
  }
  assert.ok(validateLearningTargets('10', '51', '30'));
  assert.ok(validateLearningTargets('10', '2', '4'));
  assert.ok(validateLearningTargets('10', '2', '1441'));
});

test('native buttons wrap interpolated quiz labels and numbers in Text while preserving icons', () => {
  const require = createRequire(import.meta.url);
  const ts = require('typescript');
  const React = require('react');
  const source = readFileSync(new URL('./ui/primitives.tsx', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const mocks = {
    './TranslationProvider': { useTranslation: () => () => {} },
    'react-native': { Text: 'native-text', TextInput: 'input', TouchableOpacity: 'native-button', ScrollView: 'scroll', View: 'view', StyleSheet: { create: value => value } },
    '@techenglish/design-tokens': { colors: { primary: 'blue', onPrimary: 'white' }, radius: {}, typography: {} },
  };
  const exports = {};
  runInNewContext(code, { exports, require: name => name in mocks ? mocks[name] : require(name) });
  const label = ['Làm Quiz · ', 'Cloud', ' · ', 10, ' câu'];
  const onPress = () => {};
  const button = exports.Button({ children: label, onPress, disabled: false });
  assert.equal(button.props.onPress, onPress);
  assert.equal(button.props.children.type, exports.Text);
  assert.equal(button.props.children.props.children, label);
  assert.equal(button.props.children.props.style.color, 'white');
  assert.equal(exports.Button({ children: 0 }).props.children.type, exports.Text);
  const icon = React.createElement('icon', { name: 'quiz' });
  const mixed = exports.Button({ children: [icon, 'Quiz ', 10] }).props.children;
  assert.equal(mixed[0].type, 'icon');
  assert.equal(mixed[1].type, exports.Text);
  assert.equal(mixed[2].type, exports.Text);
});
