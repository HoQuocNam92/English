import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url), ts = require('typescript');
const jsx = (type, props) => ({ type, props });
const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
const label = tree => typeof tree === 'string' || typeof tree === 'number' ? String(tree) : Array.isArray(tree) ? tree.map(label).join('') : tree?.props ? label(tree.props.children) : '';
const exports = {};
const source = readFileSync(new URL('../features/vocabulary/FlashcardSessionScore.tsx', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const mocks = {
  'react/jsx-runtime': { jsx, jsxs: jsx },
  'react-native': { View: 'view', StyleSheet: { create: value => value } },
  '../../shared/ui/primitives': { Text: 'text' },
};
runInNewContext(code, { exports, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
const render = props => exports.FlashcardSessionScore({ completed: 20, total: 20, batches: 1, answers: [], selfReportedCount: 0, colors: { onSurface: '#111', onSurfaceVariant: '#444' }, ...props });

test('twenty self-marked words show completion without inventing quiz accuracy or excellence', () => {
  const text = label(render({ selfReportedCount: 20 }));
  assert.ok(text.includes('20/20'));
  assert.ok(text.includes('20 từ tự đánh dấu đã biết'));
  assert.ok(text.includes('Đã hoàn thành phiên học'));
  assert.ok(text.includes('chưa có kết quả kiểm tra'));
  assert.ok(!text.includes('0/0'));
  assert.ok(!text.includes('Xuất sắc'));
});

test('actual attempts determine quiz feedback even when every word is completed', () => {
  const text = label(render({ answers: [{ correct: false }, { correct: false }, { correct: false }, { correct: true }], selfReportedCount: 19 }));
  assert.ok(text.includes('1/4 lượt trả lời đúng'));
  assert.ok(text.includes('Cần ôn thêm!'));
  assert.ok(!text.includes('Xuất sắc'));
  assert.ok(label(render({ answers: [{ correct: true }] })).includes('Xuất sắc!'));
});

test('long description stays outside the fixed-size circle and numeric score can fit large fonts', () => {
  const tree = render();
  const circle = tree.props.children[0];
  assert.ok(!label(circle).includes('từ hoàn tất'));
  assert.ok(label(tree.props.children[1]).includes('từ hoàn tất'));
  const score = nodes(circle).find(node => node.type === 'text' && label(node) === '20/20');
  assert.equal(score.props.adjustsFontSizeToFit, true);
  assert.equal(score.props.numberOfLines, 1);
});

test('empty session does not praise or print zero quiz attempts', () => {
  const text = label(render({ completed: 0, total: 0 }));
  assert.ok(text.includes('Chưa có kết quả'));
  assert.ok(!text.includes('lượt trả lời đúng'));
  assert.ok(!text.includes('Xuất sắc'));
});
