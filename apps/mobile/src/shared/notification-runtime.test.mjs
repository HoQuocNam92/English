import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = readFileSync(new URL('./notifications/native-notifications.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function runtime({ go = false, platform = 'android', available = true, error } = {}) {
  let imports = 0; let checks = 0; const warnings = [];
  const module = { setNotificationHandler() {} }; const exports = {};
  runInNewContext(code, { exports, Error, __DEV__: true, console: { warn: message => warnings.push(message) }, require: name => {
    if (name === 'expo') return { isRunningInExpoGo: () => go, requireOptionalNativeModule: () => { checks++; return available ? {} : null; } };
    if (name === 'react-native') return { Platform: { OS: platform } };
    assert.equal(name, 'expo-notifications'); imports++; if (error) throw error; return module;
  } });
  return { get: exports.getNativeNotifications, module, warnings, imports: () => imports, checks: () => checks };
}

test('Expo Go and web never evaluate native notification imports', () => {
  for (const config of [{ go: true }, { platform: 'web' }]) {
    const app = runtime(config);
    assert.equal(app.imports(), 0);
    assert.equal(app.get(), null);
    assert.equal(app.checks(), 0);
    assert.equal(app.imports(), 0);
  }
});
test('older native builds without the topic module keep startup working and report once', () => {
  const app = runtime({ available: false });
  assert.equal(app.get(), null); assert.equal(app.get(), null);
  assert.equal(app.imports(), 0); assert.equal(app.warnings.length, 1);
});
test('supported native builds load notifications lazily once and retain the API', () => {
  const app = runtime();
  assert.equal(app.imports(), 0);
  assert.equal(app.get(), app.module); assert.equal(app.get(), app.module);
  assert.equal(app.imports(), 1); assert.equal(app.warnings.length, 0);
});
test('other missing native notification modules are handled without hiding unrelated code errors', () => {
  const missing = runtime({ error: new Error("Cannot find native module 'ExpoBadgeModule'") });
  assert.equal(missing.get(), null); assert.equal(missing.warnings.length, 1);
  const unrelated = runtime({ error: new Error('Unexpected application error') });
  assert.throws(() => unrelated.get(), /Unexpected application error/);
});

test('root layout exports normally and defers optional notification setup until mount', () => {
  let accesses = 0; const effects = []; const exports = {};
  const mocks = {
    '../src/shared/study-time/StudyTimeTracker': { StudyTimeTracker: 'study-time' },
    '../src/shared/notifications/NotificationNavigation': { NotificationNavigation: 'notification-navigation' },
    '../src/shared/notifications/NotificationHistoryProvider': { NotificationHistoryProvider: 'history' },
    '../src/shared/ui/paper-theme': { MobileUIProvider: 'paper' },
    '../src/shared/ui/TranslationProvider': { TranslationProvider: 'translation' },
    '../src/shared/notifications/native-notifications': { getNativeNotifications: () => { accesses++; return null; } },
    '../src/shared/ui/font-assets': { interFonts: {} },
    '../src/shared/store/auth-context': { AuthProvider: 'auth' },
    '../src/shared/store/theme-context': { ThemeProvider: 'theme' },
    '@expo/vector-icons': { MaterialIcons: { font: {} }, MaterialCommunityIcons: { font: {} } },
    'expo-font': { useFonts: () => [true, null] },
    'expo-router': { Stack: 'stack' },
    'react-native-safe-area-context': { SafeAreaProvider: 'safe-area' },
    react: { useEffect: callback => effects.push(callback) },
  };
  const layout = ts.transpileModule(readFileSync(new URL('../../app/_layout.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  runInNewContext(layout, { exports, require: name => name in mocks ? mocks[name] : require(name) });
  assert.equal(typeof exports.default, 'function'); assert.equal(accesses, 0);
  assert.ok(exports.default()); assert.equal(accesses, 0);
  effects.forEach(callback => callback()); assert.equal(accesses, 1);
});
