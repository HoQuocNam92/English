import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { mobileNotificationRoute } from './navigation.ts';
import * as lessonPresentation from '../../../../packages/shared-kernel/src/lesson-presentation.ts';
import { matchesFilterOption } from './utils/filter-options.ts';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
const label = node => typeof node === 'string' || typeof node === 'number' ? String(node) : Array.isArray(node) ? node.map(label).join('') : node?.props ? label(node.props.children) : '';
function mount(file, mocks, exportName = 'default') {
  let cursor = 0; const values = [], dependencies = [], effects = []; let focus;
  const useState = initial => {
    const slot = cursor++;
    if (!(slot in values)) values[slot] = typeof initial === 'function' ? initial() : initial;
    return [values[slot], value => { values[slot] = typeof value === 'function' ? value(values[slot]) : value; }];
  };
  const useEffect = (effect, deps) => { const slot = cursor++; if (!dependencies[slot] || deps?.some((value, index) => value !== dependencies[slot][index])) effects.push(effect); dependencies[slot] = deps; };
  const jsx = (type, props) => ({ type, props });
  const defaults = {
    react: { useState, useEffect, useRef: initial => { const slot = cursor++; return values[slot] ??= { current: initial }; }, useCallback: callback => callback, useMemo: callback => callback() },
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
    'react-native': { View: 'view', AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) } },
    'expo-router': { useFocusEffect: callback => { focus ??= callback; }, useLocalSearchParams: () => ({}), useRouter: () => ({ push() {} }) },
  };
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const exports = {};
  runInNewContext(code, { exports, require: name => { assert.ok(name in mocks || name in defaults, name); return mocks[name] ?? defaults[name]; }, setInterval: () => 1, clearInterval() {}, URLSearchParams, Map, Set });
  const render = (props = {}) => { cursor = 0; return nodes(exports[exportName](props)); };
  return { render, focus: () => focus(), flush: async () => { for (const effect of effects.splice(0)) effect(); for (let i = 0; i < 5; i++) await new Promise(resolve => setImmediate(resolve)); } };
}
const ui = { Text: 'text', Button: 'button', Badge: 'badge', Tabs: 'tabs', ListTools: 'list-tools', controlStyles: { card: {}, footer: {} } };
const feature = { FeatureScreen: 'screen', EmptyState: 'empty' };

test('native and EAS profiles use the deployed HTTPS API without a LAN override', () => {
  const apiUrl = 'https://api.techenglish.click/api/v1';
  const source = readFileSync(new URL('./config/env.ts', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  runInNewContext(code, { exports, process: { env: {} } });
  assert.equal(exports.API_BASE_URL, apiUrl);
  const profiles = JSON.parse(readFileSync(new URL('../../eas.json', import.meta.url), 'utf8')).build;
  for (const profile of Object.values(profiles)) assert.equal(profile.env.EXPO_PUBLIC_API_URL, apiUrl);
});

test('notification taps accept server routes and native routes while rejecting unrelated destinations', () => {
  for (const [input, output] of [
    ['/learn/plan', '/learning-plan'], ['/learning-plan', '/learning-plan'], ['/(tabs)/home', '/learning-plan'], ['/learn', '/learning-plan'], ['https://techenglish.click/learn', '/learning-plan'],
    ['/learn/certifications/c1/topics/t1?lessonId=l1', '/certifications/topics/t1?lessonId=l1&certificateId=c1'],
    ['https://techenglish.click/learn/lessons/l1', '/lessons/l1'],
    ['/learn/quiz/result/a1?certificateId=c1', '/test-result/a1?certificateId=c1'],
  ]) assert.equal(mobileNotificationRoute(input), output);
  for (const input of [undefined, null, '', '//evil.test/learn', 'https://evil.test/learn', '/admin', '/lessons/..', '/learn/../../admin', '/learn\\admin', 'javascript:alert(1)']) assert.equal(mobileNotificationRoute(input), '/learning-plan');
});

test('topic completion refreshes server eligibility and keeps certificate context for practice and results', async () => {
  let finished = false; const routes = []; const posts = [];
  const lesson = { id: 'l1', title: 'Kiến thức AWS', type: 'certification_review', progress: { status: 'in_progress' } };
  const harness = mount('../../app/certifications/topics/[id].tsx', {
    'expo-router': { useFocusEffect: callback => { focus ??= callback; }, useLocalSearchParams: () => ({ id: 't1', certificateId: 'c1' }), useRouter: () => ({ push: route => routes.push(route) }) },
    '../../../src/shared/ui/primitives': ui, '../../../src/shared/ui/FeatureScreen': feature,
    '../../../src/features/lessons/LessonExperience': { LessonExperience: 'lesson' },
    '../../../src/shared/api/api-client': { api: {
      get: async path => path.includes('/eligibility') ? { canStart: finished, latestAttempt: { id: 'a1' }, unavailableLabel: 'Cần học trước' } : { certificate: { id: 'c1', name: 'AWS' }, name: 'Chủ đề AWS', lessons: [{ ...lesson, progress: { status: finished ? 'completed' : 'in_progress' } }], exams: [{ id: 'e1', title: 'Luyện tập AWS', _count: { questions: 10 } }] },
      post: async (path, body) => { posts.push(body); finished = body.status === 'completed'; return { status: body.status }; },
    } },
  });
  let focus;
  harness.render(); await harness.flush(); await focus(); await harness.flush();
  let tree = harness.render(); await harness.flush();
  assert.ok(tree.some(node => node.type === 'badge' && label(node).includes('Đã làm bài')));
  assert.ok(tree.find(node => node.type === 'button' && label(node) === 'Cần học trước').props.disabled);
  await tree.find(node => node.type === 'button' && label(node) === 'Hoàn thành bài học').props.onPress();
  tree = harness.render();
  const repeat = tree.find(node => node.type === 'button' && label(node) === 'Làm lại');
  assert.equal(repeat.props.disabled, false); repeat.props.onPress();
  tree.find(node => node.type === 'button' && label(node) === 'Xem kết quả').props.onPress();
  assert.equal(routes[0], '/quiz/e1?certificateId=c1&topicId=t1');
  assert.equal(routes[1], '/test-result/a1?certificateId=c1&topicId=t1');
  assert.equal(posts.filter(body => body.status === 'completed').length, 1);
});

test('certificate exam deep links select the exam tab and open the first incomplete prerequisite', async () => {
  const routes = []; let focus;
  const harness = mount('../../app/certifications/[id].tsx', {
    'expo-router': { useFocusEffect: callback => { focus ??= callback; }, useLocalSearchParams: () => ({ id: 'c1', tab: 'exams', examId: 'e1' }), useRouter: () => ({ push: route => routes.push(route) }) },
    '../../../../packages/shared-kernel/src/lesson-presentation': lessonPresentation,
    '../../src/shared/ui/primitives': ui, '../../src/shared/ui/FeatureScreen': feature,
    '../../src/shared/api/api-client': { api: { get: async path => {
      if (path.includes('/eligibility')) return { canStart: false, requiredLessonIds: ['done', 'next'], latestAttempt: { id: 'a1' } };
      if (path === '/progress/me') return { progress: [{ resourceType: 'lesson', resourceId: 'done', status: 'completed' }], certProgress: [] };
      if (path.startsWith('/certification-study/')) return { topics: [] };
      return { id: 'c1', name: 'AWS', domains: [], exams: [{ id: 'e1', title: 'Practice', status: 'published', _count: { questions: 10 } }] };
    } } },
  });
  harness.render(); await harness.flush(); await focus(); await harness.flush(); let tree = harness.render();
  assert.equal(tree.find(node => node.type === 'tabs').props.value, 'exams');
  tree.find(node => node.type === 'button' && label(node) === 'Học bài bắt buộc').props.onPress();
  assert.match(routes[0], /^\/lessons\/next\?from=/); assert.ok(decodeURIComponent(routes[0]).includes('examId=e1'));
  tree.find(node => node.type === 'button' && label(node) === 'Cách tính tiến độ').props.onPress();
  tree = harness.render(); assert.ok(tree.some(node => node.type === 'text' && label(node) === lessonPresentation.certificateProgressExplanation));
});

test('certificate catalog searches exam titles and opens the exact selected exam', async () => {
  const routes = []; let focus;
  const harness = mount('../../app/certifications/index.tsx', {
    'expo-router': { useFocusEffect: callback => { focus ??= callback; }, useRouter: () => ({ push: route => routes.push(route) }) },
    '../../src/shared/ui/primitives': ui, '../../src/shared/ui/FeatureScreen': feature,
    '../../src/shared/utils/filter-options': { matchesFilterOption },
    '../../src/shared/api/api-client': { api: { get: async path => path === '/progress/me' ? { certProgress: [] } : { data: [{ id: 'c1', code: 'AWS', name: 'Cloud', provider: 'Amazon', exams: [{ id: 'e1', title: 'Đọc hiểu bảo mật' }] }] } } },
  });
  harness.render(); await focus(); await harness.flush(); let tree = harness.render();
  tree.find(node => node.type === 'list-tools').props.onSearch('doc hieu bao mat'); tree = harness.render();
  tree.find(node => node.type === 'button' && label(node) === 'Mở bài kiểm tra').props.onPress();
  assert.equal(routes[0].params.id, 'c1'); assert.equal(routes[0].params.examId, 'e1'); assert.equal(routes[0].params.tab, 'exams');
});


test('native notification taps wait for authentication and navigate on cold and warm starts', async () => {
  const routes = []; const recorded = []; let loggedIn = false; let pathname = '/'; let listener; let foreground; let cleared = 0;
  const recordNative = async (notification, read = false) => { recorded.push({ route: notification.request.content.data.route, read }); };
  const response = route => ({ notification: { date: 12345, request: { identifier: route, content: { title: 'Nhắc học', body: 'Đến giờ học', data: { route } } } } });
  const notifications = {
    addNotificationReceivedListener: callback => { foreground = callback; return { remove() {} }; },
    addNotificationResponseReceivedListener: callback => { listener = callback; return { remove() {} }; },
    getLastNotificationResponseAsync: async () => response('/learn/certifications/c1/topics/t1?lessonId=l1'),
    clearLastNotificationResponseAsync: async () => { cleared++; },
  };
  const harness = mount('./notifications/NotificationNavigation.tsx', {
    'react-native': { Platform: { OS: 'android' } },
    'expo-router': { useRouter: () => ({ push: route => routes.push(route) }), useRootNavigationState: () => ({ key: 'ready' }), usePathname: () => pathname },
    'expo-constants': { default: { executionEnvironment: 'standalone' }, ExecutionEnvironment: { StoreClient: 'expoGo' } },
    '../store/auth-context': { useAuth: () => ({ isLoggedIn: loggedIn, isLoading: false, user: loggedIn ? { id: 'u1' } : null }) },
    '../navigation': { mobileNotificationRoute }, 'expo-notifications': notifications,
    './NotificationHistoryProvider': { useNotificationHistory: () => ({ recordNative }) },
  }, 'NotificationNavigation');
  harness.render(); await harness.flush(); harness.render(); await harness.flush();
  assert.equal(routes.length, 0);
  assert.equal(recorded.length, 0);
  loggedIn = true; harness.render(); await harness.flush(); assert.equal(routes.length, 0);
  pathname = '/home'; harness.render(); await harness.flush();
  assert.equal(routes[0], '/certifications/topics/t1?lessonId=l1&certificateId=c1');
  assert.equal(cleared, 1);
  assert.deepEqual(recorded.map(item => item.read), [true]);
  listener(response('/learn/plan')); harness.render(); await harness.flush();
  assert.equal(routes[1], '/learning-plan');
  assert.deepEqual(recorded.map(item => item.read), [true, true]);
  foreground(response('/learn/plan').notification);
  assert.deepEqual(recorded.map(item => item.read), [true, true, false]);
});

test('native lesson guidance and source links use the same presentation as web', async () => {
  const links = [];
  const lesson = { id: 'l1', type: 'technical_reading', title: 'Đọc hiểu', sections: [
    { id: 'guide', title: 'Mục tiêu đọc', type: 'rich_text', content: { text: 'Xác định ý chính.' } },
    { id: 'read', title: 'Đoạn đọc tiếng Anh', type: 'rich_text', content: { text: 'The service is available.' } },
    { id: 'ref', title: 'Nguồn khái niệm và phạm vi bài học', type: 'rich_text', content: { text: 'Tham khảo https://example.org/guide' } },
  ] };
  const harness = mount('../features/lessons/LessonExperience.tsx', {
    '../../../../../packages/shared-kernel/src/lesson-presentation': lessonPresentation,
    '../../shared/ui/primitives': ui,
    'react-native': { View: 'view', ScrollView: 'scroll', StyleSheet: { create: value => value }, useWindowDimensions: () => ({ width: 390 }), Linking: { openURL: async url => { links.push(url); } }, Alert: { alert() {} } },
    '../../shared/ui/AppIcon': { MaterialIcons: 'icon' },
  }, 'LessonExperience');
  let tree = harness.render({ lesson });
  tree.find(node => node.type === 'button').props.onPress(); tree = harness.render({ lesson });
  assert.ok(tree.some(node => node.type === 'text' && label(node) === lessonPresentation.lessonStudyGuide));
  const reading = tree.find(node => typeof node.type === 'function' && node.type.name === 'Reading');
  const content = nodes(reading.type(reading.props));
  assert.ok(content.some(node => node.type === 'text' && label(node) === 'Nguồn tham khảo'));
  assert.equal(content.some(node => node.type === 'text' && label(node) === 'Mục tiêu đọc'), false);
  const source = content.find(node => typeof node.type === 'function' && node.type.name === 'LessonText' && node.props.text === 'https://example.org/guide');
  const link = nodes(source.type(source.props)).find(node => node.props?.accessibilityRole === 'link');
  link.props.onPress(); await harness.flush(); assert.equal(links[0], 'https://example.org/guide');
});

test('mobile results keep percentage thresholds and return to the originating certificate or topic', async () => {
  for (const topicId of [undefined, 't1']) {
    const routes = [];
    const harness = mount('../../app/test-result/[id].tsx', {
      '../../src/features/learning/LearningPathJourney': { LearningPathJourney: 'journey' },
      'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) },
      '../../src/shared/ui/primitives': { Text: 'text', TouchableOpacity: 'button' },
      'react-native': { View: 'view', ScrollView: 'scroll', ActivityIndicator: 'loading', StyleSheet: { create: value => value } },
      'expo-router': { useLocalSearchParams: () => ({ id: 'a1', topicId }), useRouter: () => ({ replace: route => routes.push(route) }) },
      'expo-status-bar': { StatusBar: 'status-bar' }, '../../src/shared/ui/AppIcon': { MaterialIcons: 'icon' },
      '@techenglish/design-tokens': { colors: {}, spacing: {} },
      '../../src/shared/utils/safeText': { safeText: (value, fallback = '') => value ?? fallback },
      'react-native-svg': { default: 'svg', Circle: 'circle' },
      '../../src/shared/api/api-client': { api: { get: async () => ({ score: 0, scorePercent: 75, passed: true, correctAnswersCount: 3, incorrectAnswersCount: 1, questionsSnapshot: [], exam: { certificateId: 'c1', title: 'AWS', passingScorePercent: 70 } }) } },
    });
    harness.render(); await harness.flush(); const tree = harness.render();
    assert.ok(tree.some(node => node.type === 'text' && label(node) === '75'));
    assert.ok(tree.some(node => node.type === 'text' && label(node) === '70%'));
    assert.equal(tree.some(node => node.type === 'text' && label(node) === '7 %'), false);
    tree.find(node => node.type === 'button' && label(node) === 'Quay lại luyện tập').props.onPress();
    assert.equal(routes[0], topicId ? '/certifications/topics/t1?certificateId=c1' : '/certifications/c1?tab=exams');
    assert.equal(tree.some(node => node.type === 'journey'), false);
  }
});
