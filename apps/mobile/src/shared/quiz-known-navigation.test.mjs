import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { dailyVocabularyProgress } from './utils/daily-vocabulary.ts';

test('known quiz words advance after saving, discard repeats and include the final word in the summary', async () => {
  const ts = createRequire(import.meta.url)('typescript');
  const slots = [], effects = [], posts = [], pending = [], alerts = [];
  let cursor = 0;
  const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
  const text = tree => typeof tree === 'string' ? tree : Array.isArray(tree) ? tree.map(text).join('') : tree?.props ? text(tree.props.children) : '';
  const jsx = (type, props) => ({ type, props });
  class Value { interpolate() { return 0; } setValue() {} }
  const question = id => ({ vocabularyId: id, type: 'multiple_choice', prompt: `Question ${id}`, answer: id, options: [id, 'Other'] });
  const mocks = {
    'react/jsx-runtime': { jsx, jsxs: jsx },
    react: {
      useState: initial => { const index = cursor++; if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial; return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }]; },
      useRef: initial => { const index = cursor++; return slots[index] ??= { current: initial }; },
      useCallback: callback => callback, useEffect: callback => effects.push(callback),
    },
    'react-native': { View: 'view', ScrollView: 'scroll', KeyboardAvoidingView: 'keyboard', Animated: { Value, View: 'animated' }, Alert: { alert: (...args) => alerts.push(args) }, Dimensions: { get: () => ({ width: 360 }) }, Platform: { OS: 'android' }, StyleSheet: { create: value => value } },
    'expo-router': { useLocalSearchParams: () => ({ mode: 'quiz' }), useRouter: () => ({}), useFocusEffect() {} },
    'expo-speech': { stop: async () => {}, speak() {} },
    '../../src/shared/api/api-client': { api: {
      get: async path => path.startsWith('/vocab-study/history') ? { meta: { total: 2 } }
        : path.startsWith('/vocab-study/quiz-words') ? { words: [{ id: 'A' }, { id: 'B' }] }
        : { id: path.split('/').at(-1), term: path.split('/').at(-1), studyStatus: 'learning', examples: [] },
      post: (path, body) => {
        posts.push({ path, body });
        return path === '/vocab-study/quiz' ? Promise.resolve({ questions: [question('A'), question('B'), question('A')] })
          : new Promise((resolve, reject) => pending.push({ resolve, reject }));
      },
    } },
    '../../src/shared/store/theme-context': { useTheme: () => ({ colors: {} }) },
    '../../src/shared/ui/primitives': { Text: 'text', Button: 'button', TouchableOpacity: 'touch', TextInput: 'input' },
    '../../src/shared/ui/FilterSelect': { FilterSelect: 'filter' },
    '../../src/shared/ui/AppIcon': { MaterialIcons: 'icon' },
    '../../src/shared/ui/FeatureScreen': { FeatureScreen: 'screen', EmptyState: 'empty' },
    '../../src/features/vocabulary/FlashcardSessionScore': { FlashcardSessionScore: 'score' },
    '../../src/shared/utils/daily-vocabulary': { dailyVocabularyProgress },
  };
  const code = ts.transpileModule(readFileSync(new URL('../../app/flashcards/index.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const exports = {};
  runInNewContext(code, { exports, URLSearchParams, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
  const render = () => { cursor = 0; return nodes(exports.default()); };
  const known = tree => tree.find(node => node.type === 'touch' && text(node) === 'Đã biết');
  render(); effects[0](); await new Promise(resolve => setImmediate(resolve));
  let tree = render();
  const first = known(tree).props.onPress();
  await known(tree).props.onPress();
  assert.equal(pending.length, 1, 'double tapping must not write twice');
  assert.ok(render().some(node => node.type === 'text' && text(node) === 'Question A'));
  pending[0].reject(new Error('Offline')); await first;
  assert.equal(alerts.length, 1);
  assert.ok(render().some(node => node.type === 'text' && text(node) === 'Question A'), 'failed save must stay on the current question');
  const retry = known(render()).props.onPress(); pending[1].resolve({}); await retry;
  tree = render();
  assert.ok(tree.some(node => node.type === 'text' && text(node) === 'Question B'), 'successful save must advance without Continue');
  const last = known(tree).props.onPress(); pending[2].resolve({}); await last;
  const score = render().find(node => node.type === 'score');
  assert.ok(score, 'last distinct word must finish instead of replaying A');
  assert.equal(score.props.completed, 2);
  assert.equal(score.props.selfReportedCount, 2);
  assert.equal(score.props.answers.length, 0, 'self-reported knowledge must not count as correct quiz answers');
  assert.equal(posts.some(post => post.path === '/vocab-study/answer'), false);
});
