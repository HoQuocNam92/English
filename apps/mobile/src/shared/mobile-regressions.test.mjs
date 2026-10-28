import { buildLearningTrail } from '../../../../packages/shared-kernel/src/learning-trail.ts';
import { matchesFilterOption } from './utils/filter-options.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { interFontStyle } from './ui/font-styles.ts';
import { mobileRoute } from './navigation.ts';
import { requestTimeoutMs } from './api/request-timeout.ts';
import { validateLearningTargets } from './utils/learning-targets.ts';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { existsSync } from 'node:fs';
import { learningMenu } from './learning-menu.ts';

test('native journey uses the topic trail, omits calendar UI and requires level confirmation', async () => {
  const ts = createRequire(import.meta.url)('typescript');
  const source = readFileSync(new URL('../features/learning/LearningPathJourney.tsx', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const lesson = { id: 'lesson', title: 'Intermediate Cloud', href: '/learn/lessons/lesson', completed: false, estimatedMinutes: 225, vocabularyCount: 8 };
  const path = { configured: true, level: { code: 'intermediate', name: 'Trung cấp' }, domains: [{ id: 'cloud', name: 'Cloud', available: true, lessons: [lesson], nextLesson: lesson, state: 'in_progress', assessment: null }], completedLessons: 0, totalLessons: 1, dailyMinutes: 30, canAdvance: false, allCompleted: false, nextLevel: { name: 'Nâng cao' } };
  let state = [path, false, '', false, {}]; let cursor = 0; let confirmation; const posts = []; const routes = [];
  const jsx = (type, props) => ({ type, props });
  const mocks = {
    'react/jsx-runtime': { jsx, jsxs: jsx },
    react: { useCallback: callback => callback, useRef: value => ({ current: value }), useState: () => { const index = cursor++; return [state[index], value => { state[index] = value; }]; } },
    'expo-router': { useFocusEffect() {}, useRouter: () => ({ push: route => routes.push(route) }) },
    'react-native': { View: 'view', ActivityIndicator: 'loading', AppState: {}, Alert: { alert: (...args) => { confirmation = args; } } },
    '../../shared/ui/primitives': { Text: 'text', Button: 'button', controlStyles: { card: {} } },
    '../../shared/api/api-client': { api: { post: async (url, body) => { posts.push({ url, body }); return path; } } },
    '../../shared/navigation': { mobileRoute },
    '../../../../../packages/shared-kernel/src/learning-trail': { buildLearningTrail },
    './ContinuationPlans': { ContinuationPlans: 'continuation' },
    './LearningTrail': { LearningTrail: 'trail' },
  };
  const exports = {};
  runInNewContext(code, { exports, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
  const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
  const render = () => { cursor = 0; return nodes(exports.LearningPathJourney({ full: true })); };
  let tree = render();
  assert.ok(tree.some(node => node.type === 'trail'));
  assert.equal(tree.some(node => node.type === 'text' && node.props.children === 'Lịch bài mới theo tuần'), false);
  tree.find(node => node.type === 'button' && node.props.children === 'Học bài tiếp theo').props.onPress();
  assert.equal(routes[0], '/lessons/lesson');
  assert.equal(posts.length, 0);
  assert.equal(tree.some(node => node.type === 'button' && Array.isArray(node.props.children) && node.props.children[0] === 'Học tiếp '), false);
  path.canAdvance = true; path.allCompleted = true; path.domains[0].state = 'complete';
  tree = render();
  tree.find(node => node.type === 'button' && node.props.children === 'Học tiếp Nâng cao').props.onPress();
  assert.equal(posts.length, 0, 'opening confirmation must not promote');
  confirmation[2][1].onPress();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(posts[0].url, '/progress/me/learning-path/advance');
  assert.equal(posts[0].body.fromLevelCode, 'intermediate');
});

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
    '../src/features/learning/LearningPathJourney': { LearningPathJourney: 'livepath' },
    '../src/shared/api/api-client': { ApiError, api: { get: async () => { throw new ApiError(404, 'No assessment yet'); }, post: async () => { throw new ApiError(503, 'Server unavailable'); } } },
  };
  const exports = {};
  runInNewContext(code, { exports, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
  const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
  const expand = tree => {
    if (Array.isArray(tree)) return tree.map(expand);
    if (!tree || typeof tree !== 'object') return tree;
    if (typeof tree.type === 'function') return expand(tree.type(tree.props));
    return { ...tree, props: { ...tree.props, children: expand(tree.props?.children) } };
  };
  const render = () => { cursor = 0; return expand(exports.default()); };
  const initial = render();
  nodes(initial).find(node => node.type === 'livepath').props.onAvailability(false);
  render();
  focus();
  await new Promise(resolve => setImmediate(resolve));
  let screen = render();
  assert.equal(screen.props.error, undefined);
  const createButton = nodes(screen).find(node => node.type === 'button' && node.props.children === 'Tạo lại kế hoạch theo mục tiêu');
  assert.ok(createButton, 'Create plan action must remain available after 404');
  await createButton.props.onPress();
  screen = render();
  assert.equal(screen.props.error, undefined);
  assert.ok(nodes(screen).some(node => node.type === 'text' && node.props.children === 'Server unavailable'));
  assert.ok(nodes(screen).some(node => node.type === 'button' && node.props.children === 'Tạo lại kế hoạch theo mục tiêu'));
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
    './AppIcon': { MaterialIcons: 'material-icon' },
    './ClearFiltersButton': { ClearFiltersButton: 'clear-filters' },
    './TranslationProvider': { useTranslation: () => () => {} },
    './rich-text': { renderRichTextChildren: value => value, richTextToPlainText: value => value },
    './font-styles': { interFontStyle },
    'react-native-paper': { Button: 'paper-button', TouchableRipple: 'paper-ripple', Chip: 'chip', Searchbar: 'searchbar' },
    'react-native': { Text: 'native-text', TextInput: 'input', TouchableOpacity: 'native-button', ScrollView: 'scroll', View: 'view', StyleSheet: { create: value => value } },
    '@techenglish/design-tokens': { colors: { primary: 'blue', onPrimary: 'white' }, radius: {}, typography: {} },
  };
  const exports = {};
  runInNewContext(code, { exports, require: name => name in mocks ? mocks[name] : require(name) });
  const label = ['Làm Quiz · ', 'Cloud', ' · ', 10, ' câu'];
  const onPress = () => {};
  const button = exports.Button({ children: label, onPress, disabled: false });
  assert.equal(button.type, 'paper-button');
  assert.equal(button.props.contentStyle.minHeight, 52);
  assert.equal(button.props.onPress, onPress);
  assert.equal(button.props.children.type, exports.Text);
  assert.equal(button.props.children.props.children, label);
  assert.equal(button.props.children.props.style.color, 'white');
  assert.equal(exports.Button({ children: 0 }).props.children.type, exports.Text);
  const longLabel = 'Làm Quiz · AWS Certified Developer: Associate · 20 câu';
  const longButton = exports.Button({ children: longLabel, disabled: true });
  assert.equal(longButton.type, 'paper-ripple');
  const longText = longButton.props.children.props.children[1].props.children;
  assert.equal(longText.props.children, longLabel);
  assert.equal(longText.props.numberOfLines, undefined);
  const iconButton = exports.Button({ children: 'Học bài bắt buộc', icon: 'menu-book' });
  assert.equal(iconButton.props.icon({color:'blue',size:20}).props.name, 'menu-book');
  assert.equal(longButton.props.accessibilityState.disabled, true);
  const icon = React.createElement('icon', { name: 'quiz' });
  const nativeAction = exports.TouchableOpacity({ children: [icon, React.createElement(exports.Text, null, 'Hoàn thành bài học')] });
  assert.equal(nativeAction.props.accessibilityLabel, 'Hoàn thành bài học');
  const mixed = exports.Button({ children: [icon, 'Quiz ', 10] }).props.children;
  assert.equal(mixed[0].type, 'icon');
  assert.equal(mixed[1].type, exports.Text);
  assert.equal(mixed[2].type, exports.Text);
  let search = 'AWS'; let status = 'completed';
  const tools = exports.ListTools({ search, onSearch: value => { search = value; }, placeholder: 'Tìm', filters: [{ value: 'all', label: 'Tất cả' }], value: status, onFilter: value => { status = value; } });
  tools.props.children.at(-1).props.onPress();
  assert.equal(search, '');
  assert.equal(status, 'all');
});

test('filter choices support accents, mixed case and multiple words across large lists', () => {
  const choices = Array.from({ length: 1000 }, (_, index) => `Bộ đề Chuyên ngành ${index}`);
  assert.deepEqual(choices.filter(label => matchesFilterOption(label, 'CHUYEN bo 999')), ['Bộ đề Chuyên ngành 999']);
  assert.equal(matchesFilterOption('Chứng chỉ Đám mây', 'dam CHỨNG'), true);
  assert.equal(matchesFilterOption('Chứng chỉ Đám mây', 'bảo mật'), false);
  assert.equal(matchesFilterOption('Bất kỳ', '  '), true);
});

test('known words show saved all-time totals and remain accessible when previewing a card', async () => {
  const require = createRequire(import.meta.url);
  const ts = require('typescript');
  const code = ts.transpileModule(readFileSync(new URL('../../app/flashcards/index.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const state = [], effects = [], requests = [], routes = [];
  let cursor = 0, focus, failCount = false;
  const jsx = (type, props) => ({ type, props });
  class Value { interpolate() { return 0; } setValue() {} }
  const mocks = {
    'react/jsx-runtime': { jsx, jsxs: jsx },
    react: {
      useState: initial => {
        const index = cursor++;
        if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
        return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
      },
      useCallback: callback => callback, useRef: current => ({ current }), useEffect: callback => effects.push(callback),
    },
    'react-native': { ScrollView: 'scroll', View: 'view', KeyboardAvoidingView: 'keyboard', Animated: { Value, View: 'animated' }, Alert: { alert() {} }, Dimensions: { get: () => ({ width: 390 }) }, Platform: { OS: 'ios' }, StyleSheet: { create: value => value } },
    'expo-router': { useLocalSearchParams: () => ({ mode: 'preview', vocabularyId: 'known' }), useRouter: () => ({ push: route => routes.push(route) }), useFocusEffect: callback => { focus = callback; } },
    'expo-speech': { stop: async () => {} },
    '../../src/shared/api/api-client': { api: { get: async path => {
      requests.push(path);
      if (path.startsWith('/vocab-study/history')) {
        if (failCount) throw new Error('Offline');
        return { data: [], meta: { total: 30 } };
      }
      return { word: { id: 'known', term: 'API', studyStatus: 'mastered', definitionVi: 'Giao diện', examples: [] } };
    } } },
    '../../src/shared/store/theme-context': { useTheme: () => ({ colors: {} }) },
    '../../src/shared/ui/primitives': { Button: 'button', Text: 'text', TextInput: 'input', TouchableOpacity: 'touch' },
    '../../src/shared/ui/FilterSelect': { FilterSelect: 'filter' },
    '../../src/shared/ui/AppIcon': { MaterialIcons: 'icon' },
    '../../src/shared/ui/FeatureScreen': { FeatureScreen: 'screen', EmptyState: 'empty' },
  };
  const exports = {};
  runInNewContext(code, { exports, URLSearchParams, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
  const render = () => { cursor = 0; return exports.default(); };
  const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
  const label = tree => nodes(tree).filter(node => node.type === 'text').map(node => node.props.children).flat().join('');
  render(); effects[0](); focus();
  await new Promise(resolve => setImmediate(resolve));
  let screen = render();
  assert.ok(requests.includes('/vocab-study/history?period=all&rating=mastered&limit=1'));
  const knownButton = nodes(screen).find(node => node.type === 'touch' && label(node).includes('Từ đã biết'));
  assert.ok(knownButton); assert.match(label(knownButton), /Từ đã biết \(30\)/);
  assert.notEqual(knownButton.props.disabled, true);
  knownButton.props.onPress();
  assert.equal(routes[0].pathname, '/flashcards/history');
  assert.equal(routes[0].params.period, 'all'); assert.equal(routes[0].params.rating, 'mastered');
  failCount = true; focus();
  await new Promise(resolve => setImmediate(resolve));
  screen = render();
  assert.ok(label(screen).includes('Chưa tải được số từ đã biết'));
  assert.ok(!label(screen).includes('(0)'));
  failCount = false;
  nodes(screen).find(node => node.type === 'touch' && label(node).includes('Chạm để thử lại')).props.onPress();
  await new Promise(resolve => setImmediate(resolve));
  assert.ok(label(render()).includes('Từ đã biết (30)'));
});
