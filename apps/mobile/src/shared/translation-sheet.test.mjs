import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { lessonSourceParts } from '../../../../packages/shared-kernel/src/lesson-presentation.ts';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const nodes = value => Array.isArray(value) ? value.flatMap(nodes) : value && typeof value === 'object' ? [value, ...nodes(value.props?.children)] : [];
const context = 'A release has several steps. '.repeat(20);
function harness() {
  let cursor = 0, requests = [];
  const state = [];
  const react = {
    createContext: () => ({ Provider: 'provider' }), useContext: () => {},
    useState(initial) { const key = cursor++; if (!(key in state)) state[key] = initial; return [state[key], value => { state[key] = typeof value === 'function' ? value(state[key]) : value; }]; },
    useRef(initial) { const key = cursor++; return state[key] ??= { current: initial }; },
  };
  const mocks = {
    react,
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'react-native': { ActivityIndicator: 'spinner', KeyboardAvoidingView: 'keyboard', Modal: 'modal', Platform: { OS: 'android' }, ScrollView: 'scroll', StyleSheet: { create: value => value }, Text: 'text', TextInput: 'input', TouchableOpacity: 'button', View: 'view', useWindowDimensions: () => ({ width: 390 }) },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 24, bottom: 24 }) },
    '@techenglish/design-tokens': { colors: { primary: '#4338ca', text: '#111827', mutedText: '#64748b', error: '#be123c' } },
    './AppIcon': { MaterialIcons: 'icon' }, './font-styles': { compactTextSize: value => value, interFontStyle: () => ({}) },
    'expo-speech': { stop: async () => {}, speak() {} },
    '../api/api-client': { api: { post: (path, body) => new Promise(resolve => requests.push({ path, body, resolve })) } },
    './rich-text': { renderRichTextChildren: value => value },
  };
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL('./ui/TranslationProvider.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(code, { exports, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
  const render = () => { cursor = 0; return exports.TranslationProvider({ children: null }); };
  const all = () => nodes(render());
  return { render, all, requests, open: value => render().props.value(value) };
}

test('translation sheet puts input first, collapses long context and keeps action outside scrolling content', () => {
  const h = harness(); h.open(context);
  const all = h.all();
  const scroll = all.find(node => node.type === 'scroll');
  const input = all.find(node => node.type === 'input');
  const preview = all.find(node => node.type === 'text' && node.props.children === context);
  assert.equal(preview.props.numberOfLines, 3);
  assert.ok(all.indexOf(input) < all.indexOf(preview));
  assert.equal(input.props.underlineColorAndroid, 'transparent');
  assert.equal(nodes(scroll).some(node => node.type === 'button' && node.props.onPress && node.props.accessibilityState?.disabled !== undefined), false);
  const expand = all.find(node => node.props.accessibilityLabel === 'Xem toàn bộ ngữ cảnh');
  expand.props.onPress();
  assert.equal(h.all().find(node => node.type === 'text' && node.props.children === context).props.numberOfLines, undefined);
});

test('editing selection and closing the sheet discard stale translation responses', async () => {
  const h = harness(); h.open(context);
  h.all().find(node => node.type === 'input').props.onChangeText('step');
  let translate = h.all().find(node => node.type === 'button' && node.props.accessibilityState?.disabled === false);
  translate.props.onPress();
  assert.equal(h.requests[0].body.text, 'step');
  assert.equal(h.requests[0].body.context, context);
  h.all().find(node => node.type === 'input').props.onChangeText('release');
  h.requests[0].resolve({ translation: 'stale-result' });
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(h.all().some(node => node.props.children === 'stale-result'), false);
  translate = h.all().find(node => node.type === 'button' && node.props.accessibilityState?.disabled === false);
  translate.props.onPress();
  h.all().find(node => node.props.accessibilityLabel === 'Đóng bản dịch').props.onPress();
  h.requests[1].resolve({ translation: 'closed-result' });
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(h.all().find(node => node.type === 'modal').props.visible, false);
  assert.equal(h.all().some(node => node.props.children === 'closed-result'), false);
});

test('source links use distinct destinations and collapse an exact repeated source-list entry', () => {
  const parts = lessonSourceParts('Nguồn: https://git-scm.com/book/en/v2/Git-Branching | https://git-scm.com/book/en/v2/Git-Branching | https://docs.github.com/en/pull-requests');
  const links = parts.filter(part => part.href);
  assert.equal(links.length, 2);
  assert.notEqual(links[0].text, links[1].text);
  assert.match(links[0].text, /git-scm.com/);
  assert.match(links[1].text, /docs.github.com/);
  assert.equal(parts.map(part => part.text).join('').includes('| |'), false);
});
