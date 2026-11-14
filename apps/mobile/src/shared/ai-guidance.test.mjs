import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { homeSummary } from './utils/home-summary.ts';
import { mobileRoute } from './navigation.ts';
const require = createRequire(import.meta.url), ts = require('typescript');
const jsx = (type, props) => ({ type, props });
const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
const label = tree => typeof tree === 'string' || typeof tree === 'number' ? String(tree) : Array.isArray(tree) ? tree.map(label).join('') : tree?.props ? label(tree.props.children) : '';
test('mobile reuses home hero and provides real lesson and exam actions with safe catalog fallbacks', async () => {
  const data = { profile: {}, journey: { configured: true, targets: { vocabularyPerDay: 10, minutesPerDay: 30, examsPerWeek: 2 }, progress: { vocabularyToday: 14, studyMinutesToday: 30, examsWeek: 5 } }, certificates: [], attempts: [], reviewWords: [] };
  const guidance = { agenda: { aiSummary: 'Ưu tiên bảo mật hôm nay', tasks: [{ status: 'todo', action: 'Học tiếp', href: '/learn/lessons/core' }] }, recommendations: [{ title: 'Bảo mật Cloud', actionUrl: '/learn/certifications/cloud' }] };
  const state = [data, '', guidance], routes = [], focus = []; let cursor = 0;
  const mocks = {
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
    react: { useState: () => { const i = cursor++; return [state[i], value => { state[i] = typeof value === 'function' ? value(state[i]) : value; }]; }, useCallback: f => f, useRef: current => ({ current }) },
    'expo-router': { useRouter: () => ({ push: route => routes.push(route) }), useFocusEffect(callback) { focus.push(callback); } },
    'react-native': { View: 'view', ScrollView: 'scroll', ActivityIndicator: 'loading', useWindowDimensions: () => ({ width: 390 }), StyleSheet: { create: s => s } },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }, 'expo-status-bar': { StatusBar: 'status' },
    '../../src/shared/navigation': { mobileRoute }, '../../src/shared/utils/home-summary': { homeSummary },
    '../../src/shared/api/api-client': { api: {} }, '../../src/shared/ui/primitives': { Text: 'text', Button: 'button', TouchableOpacity: 'touch' },
    '../../src/shared/ui/AppIcon': { MaterialIcons: 'icon' }, '../../src/shared/notifications/NotificationBell': { NotificationBell: 'bell' },
    '../../../../packages/shared-kernel/src/selected-certificates': { selectedCertificates: () => [] },
  };
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL('../../app/(tabs)/home.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  runInNewContext(code, { exports, URLSearchParams, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
  const tree = exports.default(), all = nodes(tree);
  assert.ok(label(tree).includes('Ưu tiên bảo mật hôm nay'));
  assert.ok(label(tree).includes('Mục tiêu 10 từ/ngày')); assert.ok(label(tree).includes('Vượt mục tiêu 4 từ'));
  assert.ok(!label(tree).includes('/ 10 từ'));
  all.find(node => node.type === 'touch' && label(node) === 'Học tiếp').props.onPress();
  all.find(node => node.type === 'touch' && label(node) === 'Gợi ý: Bảo mật Cloud').props.onPress();
  assert.deepEqual(routes, ['/lessons/core', '/certifications/cloud']);
  data.journey.progress.examsWeek = 0;
  data.journey.progress.studyMinutesToday = 0;
  data.exams = [{ id: 'recommended', title: 'Bài thi catalog trùng', durationMinutes: 20 }];
  Object.assign(guidance.agenda.tasks[0], { kind: 'lesson', title: 'Bài học API kế tiếp', minutes: 15 });
  guidance.recommendations.push({ type: 'exam', title: 'Bài kiểm tra API đề xuất', actionUrl: '/learn/quiz/recommended', reason: 'Phù hợp trình độ' });
  cursor = 0;
  const actionable = exports.default(), actions = nodes(actionable);
  assert.ok(label(actionable).includes('Bài học đề xuất'));
  assert.ok(label(actionable).includes('Bài thi đề xuất'));
  assert.ok(!label(actionable).includes('Bài thi catalog trùng'), 'same exam must only appear once');
  actions.find(node => node.type === 'touch' && label(node).includes('Bài học API kế tiếp')).props.onPress();
  assert.equal(routes.at(-1), '/lessons/core');
  actions.find(node => node.type === 'touch' && label(node) === 'Học bài ngay').props.onPress();
  assert.equal(routes.at(-1), '/lessons/core');
  actions.find(node => node.type === 'touch' && label(node) === 'Làm 2 bài nữa').props.onPress();
  assert.equal(routes.at(-1), '/quiz/recommended');
  actions.find(node => node.type === 'touch' && label(node).includes('Bài kiểm tra API đề xuất')).props.onPress();
  assert.equal(routes.at(-1), '/quiz/recommended');
  assert.equal(data.journey.progress.examsWeek, 0, 'opening learning content must not count an exam as completed');
  guidance.agenda.tasks = []; guidance.recommendations = []; data.exams = [];
  cursor = 0;
  const empty = nodes(exports.default());
  empty.find(node => node.type === 'touch' && label(node) === 'Học bài ngay').props.onPress();
  assert.equal(routes.at(-1), '/(tabs)/learning');
  empty.find(node => node.type === 'touch' && label(node) === 'Làm 2 bài nữa').props.onPress();
  assert.equal(routes.at(-1), '/certifications');
  data.journey = { configured: false };
  cursor = 0;
  const unfinished = exports.default();
  const setup = nodes(unfinished).filter(node => ['touch', 'button'].includes(node.type) && label(node).includes('Thiết lập'));
  assert.equal(setup.length, 1);
  assert.ok(!label(unfinished).includes('Mục tiêu hôm nay'));
  setup[0].props.onPress();
  assert.equal(routes.at(-1), '/(onboarding)/goal');
  const requests = [];
  let finishCatalog;
  mocks['../../src/shared/api/api-client'].api.get = async path => {
    requests.push(path);
    if (path === '/learner-profiles/me') return { level: { code: 'beginner' }, certGoals: [{ certificateId: 'selected-cert' }] };
    if (path === '/learner-profiles/me/journey') return { configured: true };
    if (path.startsWith('/exams?')) return new Promise(resolve => { finishCatalog = () => resolve({ data: [
      { id: 'eligible', title: 'Open exam', status: 'published', _count: { questions: 5 } },
      { id: 'future', title: 'Not open yet', status: 'published', availableFrom: '2100-01-01', _count: { questions: 5 } },
      { id: 'expired', title: 'Closed exam', status: 'published', availableUntil: '2000-01-01', _count: { questions: 5 } },
      { id: 'draft', title: 'Draft exam', status: 'draft', _count: { questions: 5 } },
      { id: 'empty', title: 'Empty exam', status: 'published', _count: { questions: 0 } },
    ] }); });
    return { data: [], words: [] };
  };
  cursor = 0; focus.length = 0;
  exports.default(); focus[0]();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(state[0].profile.level.code, 'beginner', 'Home must render without waiting for optional exam suggestions');
  assert.equal(state[0].examsLoading, true);
  finishCatalog();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(state[0].examsLoading, false);
  const catalogRequest = requests.find(path => path.startsWith('/exams?'));
  assert.ok(catalogRequest.includes('levelCode=beginner'));
  assert.ok(catalogRequest.includes('certificateId=selected-cert'));
  assert.equal(JSON.stringify(state[0].exams.map(exam => exam.id)), JSON.stringify(['eligible']));
});
