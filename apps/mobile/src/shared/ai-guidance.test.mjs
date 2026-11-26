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
test('mobile reuses home hero for daily AI and ranked suggestion, with goals displayed separately', () => {
  const data = { profile: {}, journey: { configured: true, targets: { vocabularyPerDay: 10, minutesPerDay: 30, examsPerWeek: 2 }, progress: { vocabularyToday: 14, studyMinutesToday: 30, examsWeek: 5 } }, certificates: [], attempts: [], reviewWords: [] };
  const guidance = { agenda: { aiSummary: 'Ưu tiên bảo mật hôm nay', tasks: [{ status: 'todo', action: 'Học tiếp', href: '/learn/lessons/core' }] }, recommendations: [{ title: 'Bảo mật Cloud', actionUrl: '/learn/certifications/cloud' }] };
  const state = [data, '', guidance], routes = []; let cursor = 0;
  const mocks = {
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
    react: { useState: () => [state[cursor++], () => {}], useCallback: f => f, useRef: current => ({ current }) },
    'expo-router': { useRouter: () => ({ push: route => routes.push(route) }), useFocusEffect() {} },
    'react-native': { View: 'view', ScrollView: 'scroll', ActivityIndicator: 'loading', useWindowDimensions: () => ({ width: 390 }), StyleSheet: { create: s => s } },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }, 'expo-status-bar': { StatusBar: 'status' },
    '../../src/shared/navigation': { mobileRoute }, '../../src/shared/utils/home-summary': { homeSummary },
    '../../src/shared/api/api-client': { api: {} }, '../../src/shared/ui/primitives': { Text: 'text', Button: 'button', TouchableOpacity: 'touch' },
    '../../src/shared/ui/AppIcon': { MaterialIcons: 'icon' }, '../../src/shared/notifications/NotificationBell': { NotificationBell: 'bell' },
    '../../../../packages/shared-kernel/src/selected-certificates': { selectedCertificates: () => [] },
  };
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL('../../app/(tabs)/home.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  runInNewContext(code, { exports, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
  const tree = exports.default(), all = nodes(tree);
  assert.ok(label(tree).includes('Ưu tiên bảo mật hôm nay'));
  assert.ok(label(tree).includes('Mục tiêu 10 từ/ngày')); assert.ok(label(tree).includes('Vượt mục tiêu 4 từ'));
  assert.ok(!label(tree).includes('/ 10 từ'));
  all.find(node => node.type === 'touch' && label(node) === 'Học tiếp').props.onPress();
  all.find(node => node.type === 'touch' && label(node) === 'Gợi ý: Bảo mật Cloud').props.onPress();
  assert.deepEqual(routes, ['/lessons/core', '/certifications/cloud']);
  data.journey = { configured: false };
  cursor = 0;
  const unfinished = exports.default();
  const setup = nodes(unfinished).filter(node => ['touch', 'button'].includes(node.type) && label(node).includes('Thiết lập'));
  assert.equal(setup.length, 1);
  assert.ok(!label(unfinished).includes('Mục tiêu hôm nay'));
  setup[0].props.onPress();
  assert.equal(routes.at(-1), '/(onboarding)/goal');
});
