import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');

function harness() {
  let slot = 0, calls = 0, effects = [], timers = [];
  const state = [], listeners = new Map();
  class FakeNode { contains() { return false; } }
  const content = new FakeNode();
  const parent = { closest: selector => selector === '[data-learning-content]' ? content : null };
  const selected = { isCollapsed: false, rangeCount: 1, anchorNode: { parentElement: parent }, focusNode: { parentElement: parent }, toString: () => 'independent', getRangeAt: () => ({ getBoundingClientRect: () => ({ width: 80, height: 20, left: 100, bottom: 150 }) }) };
  const events = { addEventListener: (name, callback) => listeners.set(name, callback), removeEventListener: name => listeners.delete(name) };
  const react = {
    useState(initial) { const key = slot++; if (!(key in state)) state[key] = initial; return [state[key], value => { state[key] = value; }]; },
    useRef(initial) { const key = slot++; if (!(key in state)) state[key] = { current: initial }; return state[key]; },
    useEffect(callback) { const key = slot++; if (!(key in state)) { state[key] = true; effects.push(callback); } },
  };
  const Dialog = () => null;
  const mocks = {
    react,
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'next/navigation': { usePathname: () => '/learn/lessons/test' },
    'lucide-react': { Languages: () => null, X: () => null },
    '@/shared/ui/LookupDialog': { LookupDialog: Dialog },
    '@/shared/api/api-client': { apiClient: { post: async () => { calls++; return { translation: 'độc lập', contextual: true }; } } },
    '@/shared/lib/use-pronunciation': { usePronunciation: () => ({ speaking: false, speechError: '', play() {}, stop() {} }) },
    '@/shared/lib/english-selection': { isEnglishSelection: text => !!text },
    '@/shared/lib/selection-context': { getSelectionContext: () => 'The page starts two independent requests.' },
  };
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL('../ui/SelectionTranslator.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(code, { exports, require: name => { assert.ok(name in mocks, name); return mocks[name]; }, Node: FakeNode, window: { ...events, getSelection: () => selected, innerWidth: 1000, innerHeight: 800 }, document: { ...events, activeElement: null }, setTimeout: callback => { timers.push(callback); return callback; }, clearTimeout: callback => { timers = timers.filter(item => item !== callback); } });
  const render = () => { slot = 0; const result = exports.SelectionTranslator(); const current = effects; effects = []; current.forEach(effect => effect()); return result; };
  return { render, Dialog, calls: () => calls, event: (name, event = {}) => listeners.get(name)?.(event), flush: () => { const pending = timers; timers = []; pending.forEach(callback => callback()); } };
}

test('selection only opens a lookup button; an explicit click calls translation and opens the modal', async () => {
  const h = harness();
  h.render(); h.event('selectionchange'); h.flush();
  const toolbar = h.render();
  assert.equal(toolbar.props.role, 'toolbar');
  assert.equal(h.calls(), 0);
  toolbar.props.children[0].props.onClick();
  await new Promise(setImmediate);
  const modal = h.render();
  assert.equal(h.calls(), 1);
  assert.equal(modal.type, h.Dialog);
  assert.equal(modal.props.result.translation, 'độc lập');
});
test('scrolling or changing the browser selection inside an open lookup does not dismiss it', async () => {
  const h = harness();
  h.render(); h.event('selectionchange'); h.flush();
  h.render().props.children[0].props.onClick();
  await new Promise(setImmediate);
  h.event('scroll', { target: {} }); h.event('selectionchange'); h.flush();
  assert.equal(h.render().type, h.Dialog);
  h.event('keydown', { key: 'Escape' });
  assert.equal(h.render(), null);
});

test('a reviewed contextual reading sense opens directly without a generic AI lookup overwriting it', () => {
  const h = harness(); h.render();
  h.event('reading-lookup', { detail: { text: 'image', context: 'The team releases a new image with a rolling update.', result: { translation: 'bản đóng gói phần mềm', contextDependent: true, standaloneMeaning: 'hình ảnh', sourceSentence: 'The team releases a new image with a rolling update.', source: 'reading', contextual: true } } });
  assert.equal(h.calls(), 0);
  const modal = h.render();
  assert.equal(modal.props.result.translation, 'bản đóng gói phần mềm');
  assert.equal(modal.props.result.standaloneMeaning, 'hình ảnh');
});

test('lookup modal shows dictionary fields and examples without note or save controls', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL('../ui/LookupDialog.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(code, { exports, require });
  const html = renderToStaticMarkup(React.createElement(exports.LookupDialog, { text: 'independent', context: 'Two independent requests.', result: { translation: 'độc lập', exampleEn: 'These requests are independent.', exampleVi: 'Các yêu cầu này độc lập với nhau.' }, loading: false, error: '', speaking: false, speechError: '', onPronounce() {}, onClose() {}, onRetry() {} }));
  assert.match(html, /<dialog/);
  assert.match(html, /These requests are independent\./);
  assert.match(html, /Phiên âm/);
  assert.doesNotMatch(html, /Ghi chú|Lưu từ|<textarea|<form/);
});
