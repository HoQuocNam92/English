import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import * as richText from '../../../../packages/shared-kernel/src/rich-text.ts';

const ts = createRequire(import.meta.url)('typescript');
const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];

test('only a selection within the passage offers translation and lookup sends that phrase with context', async () => {
  let selected = '', state = '', listener, root, inside = true;
  const requests = [];
  const context = 'A function contract does not save an empty cart.';
  const jsx = (type, props) => ({ type, props });
  const mocks = {
    'react/jsx-runtime': { jsx, jsxs: jsx },
    react: {
      useRef: () => root ??= { current: { contains: () => inside, innerText: context } },
      useState: () => [state, value => { state = value; }],
      useEffect: callback => { callback(); },
      createElement: (type, props, children) => ({ type, props: { ...props, children } }),
    },
    '../../../../../packages/shared-kernel/src/rich-text': richText,
  };
  const source = readFileSync(new URL('./ui/SelectedText.tsx', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const exports = {};
  runInNewContext(code, {
    exports, require: name => { assert.ok(name in mocks, name); return mocks[name]; },
    document: { addEventListener: (_, callback) => { listener = callback; }, removeEventListener() {} },
    window: { getSelection: () => ({ rangeCount: 1, getRangeAt: () => ({ commonAncestorContainer: {} }), toString: () => selected, removeAllRanges: () => { selected = ''; } }) },
  });
  const render = () => nodes(exports.default({ content: context, fontSize: 15, lineHeight: 21, color: '#111', fontWeight: '400', onLookup: async (...args) => { requests.push(args); } }));
  assert.equal(render().some(node => node.type === 'button'), false);
  selected = 'function contract'; listener();
  assert.equal(requests.length, 0, 'selection alone must allow adjusting the highlighted phrase');
  const button = render().find(node => node.type === 'button');
  assert.ok(button);
  button.props.onClick();
  assert.deepEqual(requests, [['function contract', context]]);
  assert.equal(render().some(node => node.type === 'button'), false);
  selected = 'empty cart'; inside = false; listener();
  assert.equal(render().some(node => node.type === 'button'), false);
});
