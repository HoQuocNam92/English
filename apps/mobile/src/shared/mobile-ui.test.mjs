import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { homeSummary } from './utils/home-summary.ts';
import { matchesFilterOption } from './utils/filter-options.ts';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
function mount(file, mocks, args = {}) {
  let index = 0; const state = [];
  const useState = initial => { const slot = index++; if (!(slot in state)) state[slot] = typeof initial === 'function' ? initial() : initial; return [state[slot], value => { state[slot] = typeof value === 'function' ? value(state[slot]) : value; }]; };
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const defaults = { react: { useState }, 'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: 'fragment' } };
  runInNewContext(code, { exports, require: name => name === 'react' ? { ...defaults.react, ...mocks.react } : name in mocks ? mocks[name] : name in defaults ? defaults[name] : require(name) });
  const Component = exports.default ?? exports.FilterSelect ?? exports.ReminderTimePicker;
  return { render: () => { index = 0; return nodes(Component(args)); }, exports };
}

test('home uses current targets and actual progress including over-completed goals', () => {
  const journey = { configured: true, targets: { vocabularyPerDay: 10, minutesPerDay: 30, examsPerWeek: 2 }, progress: { vocabularyToday: 8, studyMinutesToday: 8, examsWeek: 1 } };
  const summary = homeSummary(journey);
  assert.equal(summary.title, 'Còn 2 từ và 22 phút nữa là đạt mục tiêu hôm nay');
  assert.deepEqual(summary.metrics.map(item => item.percent), [80, 27, 50]);
  assert.equal(homeSummary({ ...journey, progress: { vocabularyToday: 16, studyMinutesToday: 35, examsWeek: 5 } }).complete, true);
  assert.equal(homeSummary({ ...journey, progress: { vocabularyToday: 16, studyMinutesToday: 35, examsWeek: 5 } }).metrics[2].percent, 100);
  assert.equal(homeSummary(null).configured, false);
});

test('dropdown searches Vietnamese, commits a selected ID and closes without changes on dismissal', () => {
  const chosen = []; const dimensions = { width: 360, height: 640 };
  const view = mount('./ui/FilterSelect.tsx', {
    react: { useRef: () => ({ current: { measureInWindow: callback => callback(20, 550, 160, 50) } }) },
    'react-native': { View: 'view', Modal: 'modal', Pressable: 'pressable', FlatList: 'list', Keyboard: { dismiss() {} }, StyleSheet: { create: value => value }, useWindowDimensions: () => dimensions },
    'react-native-paper': { Searchbar: 'search' },
    './primitives': { Text: 'text', TouchableOpacity: 'touch' }, './AppIcon': { MaterialIcons: 'icon' },
    '../utils/filter-options': { matchesFilterOption },
  }, { label: 'Chuyên ngành', value: '', items: [{ value: '', label: 'Tất cả' }, { value: 'SOFTWARE_ENG', label: 'Kỹ thuật phần mềm' }, { value: 'CLOUD', label: 'Điện toán đám mây' }], onChange: value => chosen.push(value) });
  const show = () => view.render().find(node => node.props?.accessibilityLabel === 'Chuyên ngành: Tất cả').props.onPress();
  show(); let tree = view.render();
  assert.equal(tree.find(node => node.type === 'modal').props.visible, true);
  const position = tree.find(node => node.props?.accessibilityViewIsModal).props.style[1];
  assert.ok(position.top >= 32 && position.top < 550, 'menu opens above an anchor near the bottom');
  assert.ok(position.left + position.width <= dimensions.width - 16);
  tree.find(node => node.type === 'search').props.onChangeText('ky thuat');
  let list = view.render().find(node => node.type === 'list');
  assert.equal(list.props.data.length, 1);
  list.props.renderItem({ item: list.props.data[0] }).props.onPress();
  assert.deepEqual(chosen, ['SOFTWARE_ENG']);
  assert.equal(view.render().find(node => node.type === 'modal').props.visible, false);
  show(); view.render().find(node => node.type === 'pressable').props.onPress();
  assert.deepEqual(chosen, ['SOFTWARE_ENG']);
  assert.equal(view.render().find(node => node.type === 'search').props.value, '');
});

test('native Android clock saves exact minutes and cancel leaves the saved reminder unchanged', () => {
  let picker; const saved = [];
  const view = mount('./ui/ReminderTimePicker.tsx', {
    'react-native': { View: 'view', Modal: 'modal', Platform: { OS: 'android' }, StyleSheet: { create: value => value } },
    '@react-native-community/datetimepicker': { __esModule: true, default: 'picker', DateTimePickerAndroid: { open: props => { picker = props; } } },
    './primitives': { Text: 'text', TouchableOpacity: 'touch', Button: 'button' }, './AppIcon': { MaterialIcons: 'icon' },
  }, { value: '08:20', onChange: time => saved.push(time) });
  view.render().find(node => node.props?.accessibilityLabel === 'Giờ nhắc học: 08:20').props.onPress();
  assert.equal(picker.value.getHours(), 8); assert.equal(picker.value.getMinutes(), 20);
  assert.equal(picker.display, 'clock'); assert.equal(picker.is24Hour, true);
  const date = new Date(); date.setHours(20, 7, 0, 0);
  picker.onChange({ type: 'dismissed' }, date); assert.deepEqual(saved, []);
  picker.onChange({ type: 'set' }, date); assert.deepEqual(saved, ['20:07']);
});
