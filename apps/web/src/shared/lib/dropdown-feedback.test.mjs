import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

test('certificate menus offer searchable choices even with fewer than ten records', () => {
  const ts = createRequire(import.meta.url)('typescript');
  const jsx = (type, props) => ({ type, props });
  const choices = [{ value: '', label: 'Tất cả chứng chỉ' }, { value: 'aws', label: 'AWS Cloud Practitioner' }, { value: 'cka', label: 'Certified Kubernetes Administrator' }];
  const state = ['', choices, '', true, -1, { left: 0, top: 0, width: 260, maxHeight: 280 }];
  let cursor = 0;
  const mocks = {
    react: { forwardRef: callback => callback, useRef: () => ({ current: null }), useId: () => 'test-menu', useState: () => [state[cursor++], () => {}], useImperativeHandle() {}, useLayoutEffect() {}, useEffect() {}, useCallback: callback => callback, useMemo: callback => callback() },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-dom': { createPortal: element => element },
    'lucide-react': { Check: 'check', ChevronDown: 'chevron' },
    '@/shared/lib/dropdown-search': { filterDropdownItems: items => items.map((item, index) => ({ item, index })) },
    '@/shared/lib/cn': { cn: (...classes) => classes.filter(Boolean).join(' ') },
    '@/shared/ui/LevelBadge': { LevelBadge: 'level' },
    '@/shared/lib/level-theme': { isKnownLevel: () => false },
  };
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL('../ui/Dropdown.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  runInNewContext(code, { exports, document: { body: {} }, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
  const tree = exports.Dropdown({ 'aria-label': 'Mục tiêu chứng chỉ' }, null);
  const nodes = node => !node || typeof node !== 'object' ? [] : Array.isArray(node) ? node.flatMap(nodes) : [node, ...nodes(node.props?.children)];
  const input = nodes(tree).find(node => node.type === 'input' && node.props.role === 'combobox');
  assert.ok(input);
  assert.equal(input.props['aria-label'], 'Tìm trong Mục tiêu chứng chỉ');
  assert.equal(nodes(tree).filter(node => node.props?.role === 'option').length, choices.length);
});
