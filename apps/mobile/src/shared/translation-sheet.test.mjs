import { selectionPopupPosition } from './ui/selection-popup.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { lessonSourceParts } from '../../../../packages/shared-kernel/src/lesson-presentation.ts';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const { contextExcerpt } = require('../../../../packages/shared-kernel/src/context-excerpt.cjs');
const nodes = value => Array.isArray(value) ? value.flatMap(nodes) : value && typeof value === 'object' ? [value, ...nodes(value.props?.children)] : [];
const context = 'A release has several steps. '.repeat(20);
function harness() {
  let cursor = 0, requests = [];
  const state = [];
  const react = {
    useEffect() {},
    createContext: () => ({ Provider: 'provider' }), useContext: () => {},
    useState(initial) { const key = cursor++; if (!(key in state)) state[key] = initial; return [state[key], value => { state[key] = typeof value === 'function' ? value(state[key]) : value; }]; },
    useRef(initial) { const key = cursor++; return state[key] ??= { current: initial }; },
  };
  const mocks = {
    react,
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'react-native': { ActivityIndicator: 'spinner', KeyboardAvoidingView: 'keyboard', Modal: 'modal', Platform: { OS: 'android' }, ScrollView: 'scroll', StyleSheet: { create: value => value }, Text: 'text', TextInput: 'input', TouchableOpacity: 'button', View: 'view', useWindowDimensions: () => ({ width: 390, height: 844 }) },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 24, bottom: 24 }) },
    '@techenglish/design-tokens': { colors: { primary: '#4338ca', text: '#111827', mutedText: '#64748b', error: '#be123c' } },
    './AppIcon': { MaterialIcons: 'icon' }, './font-styles': { compactTextSize: value => value, interFontStyle: () => ({}) },
    'expo-speech': { stop: async () => {}, speak() {} },
    '../api/api-client': { subscribeSessionExpired: () => () => {}, api: { post: (path, body) => new Promise(resolve => requests.push({ path, body, resolve })) } },
    './rich-text': { renderRichTextChildren: value => value },
    './selection-popup': { selectionPopupPosition },
    '../../../../../packages/shared-kernel/src/context-excerpt.cjs': { contextExcerpt },
  };
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL('./ui/TranslationProvider.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(code, { exports, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
  const render = () => { cursor = 0; return exports.TranslationProvider({ children: null }); };
  const all = () => nodes(render());
  return { render, all, requests, open: (value, source = context) => render().props.value(value, source) };
}

test('selected phrase translates immediately with context and no editable field', () => {
  const h = harness(); h.open('steps');
  const all = h.all();
  assert.equal(all.some(node => node.type === 'input'), false);
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].body.text, 'steps');
  assert.equal(h.requests[0].body.context, context);
  const preview = all.find(node => node.type === 'text' && node.props.children === context);
  assert.equal(preview, undefined);
  const sheet = all.find(node => node.props.accessibilityViewIsModal);
  assert.equal(sheet.props.style.maxWidth, 360);
  assert.equal(sheet.props.style.maxHeight, '72%');
  const highlighted = all.find(node => node.type === 'text' && node.props.children === 'steps' && node.props.style.backgroundColor);
  assert.equal(highlighted.props.style.backgroundColor, '#e5ddff');
  assert.equal(all.some(node => node.props.accessibilityLabel === 'Xem toàn bộ ngữ cảnh'), false);
});

test('lookup excerpts preserve technical phrases and show one short paragraph around the match', () => {
  const source = 'An unrelated paragraph.\n\n' + 'Earlier sentences. '.repeat(40) + 'Use STATUS=open to filter tickets. ' + 'Later sentences. '.repeat(40);
  const excerpt = contextExcerpt(source, 'status=open');
  assert.equal(excerpt.highlight, 'STATUS=open');
  const shown = excerpt.before + excerpt.highlight + excerpt.after;
  assert.ok(shown.length <= 304);
  assert.equal(shown.includes('unrelated'), false);
  assert.equal(shown.includes('\n'), false);
  assert.equal(contextExcerpt('Select a  pull\n request.', 'pull request').highlight, 'pull request');
  assert.equal(contextExcerpt('No match here.', 'missing').highlight, '');
});

test('native lookup floats outside passage and only sends one translation when pressed', () => {
  const h = harness();
  let tree = h.render();
  tree.props.children.props.ref.current = { measureInWindow: callback => callback(0, 24, 390, 820) };
  tree.props.value('steps', context, { x: 300, y: 700, width: 55, height: 24 }, 'passage');
  const pill = h.all().find(node => node.props.accessibilityLabel === 'Dịch steps');
  assert.ok(pill);
  assert.equal(pill.props.style[0].position, 'absolute');
  assert.equal(pill.props.style[1].height, 44);
  assert.equal(pill.props.style[1].width, 100);
  assert.equal(h.requests.length, 0);
  pill.props.onPressIn(); pill.props.onPress();
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].body.text, 'steps');
});

test('lookup placement stays within a narrow phone screen at each edge', () => {
  for (const rect of [{ x: 0, y: 0, width: 30, height: 20 }, { x: 285, y: 530, width: 35, height: 20 }]) {
    const p = selectionPopupPosition(rect, { width: 320, height: 568 }, { top: 24, bottom: 24 });
    assert.ok(p.left >= 12 && p.left + p.width <= 308);
    assert.ok(p.top >= 32 && p.top + p.height <= 536);
    assert.equal(p.height, 44);
  }
});

test('changing selected phrase and closing discard stale translation responses', async () => {
  const h = harness(); h.open('steps');
  h.open('release');
  h.requests[0].resolve({ translation: 'stale-result' });
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(h.all().some(node => node.props.children === 'stale-result'), false);
  assert.equal(h.requests[1].body.text, 'release');
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
