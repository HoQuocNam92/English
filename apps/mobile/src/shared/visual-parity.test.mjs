import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { interFontStyle } from './ui/font-styles.ts';
import { iconColors } from './ui/icon-colors.ts';

const require = createRequire(import.meta.url);
const webRequire = createRequire(new URL('../../../web/package.json', import.meta.url));
const icons = JSON.parse(readFileSync(new URL('./ui/icon-nodes.json', import.meta.url), 'utf8'));

test('mobile navigation keeps the web semantic icon colors in both tab states', () => {
  const css = readFileSync(new URL('../../../web/app/globals.css', import.meta.url), 'utf8');
  for (const [name, color] of Object.entries(iconColors)) {
    assert.match(css, new RegExp(`--icon-${name}: ${color};`));
  }
  const ts = require('typescript');
  const source = readFileSync(new URL('../../app/(tabs)/_layout.tsx', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const Tabs = Object.assign(() => {}, { Screen: 'screen' });
  const mocks = {
    'react-native': { View: 'view' }, 'expo-router': { Tabs },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ bottom: 0 }) },
    '../../src/shared/ui/AppIcon': { MaterialIcons: 'icon' },
    '../../src/shared/ui/icon-colors': { iconColors },
    '../../src/shared/ui/font-styles': { interFontStyle },
    '../../src/shared/store/theme-context': { useTheme: () => ({ colors: { primary: 'purple', outline: 'gray' } }) },
  };
  const exports = {};
  runInNewContext(code, { exports, require: name => name in mocks ? mocks[name] : require(name) });
  const tabs = exports.default().props.children;
  for (const [tab, semantic, icon] of [['home', 'home', 'home'], ['learning', 'learning', 'menu-book'], ['plan', 'learning', 'route'], ['certificates', 'certificate', 'workspace-premium'], ['progress', 'progress', 'monitoring'], ['profile', 'profile', 'person']]) {
    const options = tabs.find(item => item.props.name === tab).props.options;
    for (const focused of [true, false]) {
      const rendered = options.tabBarIcon({ focused }).props.children;
      assert.equal(rendered.props.color, iconColors[semantic]);
      assert.equal(rendered.props.name, icon);
    }
  }
});

test('native font weights select actual Inter faces and preserve monospace', () => {
  for (const weight of [400, 500, 600, 700, 800, 900]) {
    assert.deepEqual(interFontStyle(String(weight)), { fontFamily: `Inter-${weight}`, fontWeight: 'normal' });
    const file = readFileSync(new URL(`../../assets/fonts/Inter-${weight}.ttf`, import.meta.url));
    const tables = {};
    for (let index = 0; index < file.readUInt16BE(4); index++) {
      const offset = 12 + index * 16;
      tables[file.toString('ascii', offset, offset + 4)] = file.readUInt32BE(offset + 8);
    }
    assert.equal(file.readUInt16BE(tables['OS/2'] + 4), weight);
    assert.equal(tables.fvar, undefined, 'font must be a static instance on Android');
    assert.ok(tables.cmap, 'retain Vietnamese and English glyph mappings');
  }
  assert.equal(interFontStyle('bold').fontFamily, 'Inter-700');
  assert.equal(interFontStyle().fontFamily, 'Inter-400');
  assert.deepEqual(interFontStyle('800', 'monospace'), {});
  assert.deepEqual(interFontStyle('normal', 'Inter-700'), {}, 'nested labels retain the selected face');
});

test('native icons use exactly the web Lucide SVG geometry', () => {
  const lucide = webRequire('lucide-react');
  const source = readFileSync(new URL('../../../web/src/shared/ui/AppIcon.tsx', import.meta.url), 'utf8');
  let checked = 0;
  for (const match of source.matchAll(/^\s*(?:"([^"]+)"|(\w+)): (\w+),?$/gm)) {
    const component = lucide[match[3]];
    if (!component) continue;
    const name = (match[1] ?? match[2]).replaceAll('_', '-');
    assert.deepEqual(icons[name], component.render({}, null).props.iconNode, name);
    checked++;
  }
  assert.ok(checked > 100);
  assert.deepEqual(icons['notifications-none'], icons.notifications);
  assert.deepEqual(icons['person-outline'], icons.person);
});

test('native icon renderer keeps web stroke width, size and accessible labels', () => {
  const ts = require('typescript');
  const source = readFileSync(new URL('./ui/AppIcon.tsx', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const mocks = {
    '@expo/vector-icons': { MaterialIcons: Object.assign(() => {}, { glyphMap: {} }) },
    'react-native-svg': { default: 'svg', Circle: 'circle', Ellipse: 'ellipse', Line: 'line', Path: 'path', Polygon: 'polygon', Polyline: 'polyline', Rect: 'rect', __esModule: true },
    './icon-nodes.json': icons,
  };
  const exports = {};
  runInNewContext(code, { exports, require: name => name in mocks ? mocks[name] : require(name) });
  for (const name of ['terminal', 'home', 'menu-book', 'school', 'translate', 'route', 'notifications-none', 'done-all']) {
    const icon = exports.MaterialIcons({ name, size: 32, color: '#3525cd', accessibilityLabel: 'Lộ trình' });
    assert.equal(icon.type, 'svg', name);
    assert.equal(icon.props.width, 32);
    assert.equal(icon.props.strokeWidth, 2);
    assert.equal(icon.props.stroke, '#3525cd');
    assert.equal(icon.props.accessibilityLabel, 'Lộ trình');
  }
});
