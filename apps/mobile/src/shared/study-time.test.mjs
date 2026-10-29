import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
test('study clock counts foreground learning seconds and stops in background', async () => {
  let now = 100000, tick, change, cleanup;
  const requests = [];
  const appState = { currentState: 'active', addEventListener: (_, fn) => { change = fn; return { remove() {} }; } };
  const mocks = {
    react: { useEffect: effect => { cleanup = effect(); } },
    'react-native': { AppState: appState },
    'expo-router': { usePathname: () => '/flashcards' },
    '../store/auth-context': { useAuth: () => ({ user: { id: 'learner' } }) },
    '../api/api-client': { api: { post: async (_, body) => { requests.push(body); } } },
  };
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL('./study-time/StudyTimeTracker.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  runInNewContext(code, { exports, Date: { now: () => now }, setInterval: fn => { tick = fn; return 1; }, clearInterval() {}, require: name => mocks[name] });
  exports.StudyTimeTracker(); await Promise.resolve();
  now += 60000; tick(); await Promise.resolve();
  assert.equal(requests.at(-1).seconds, 60);
  const original = requests.at(-1).sessionId;
  appState.currentState = 'background'; change('background');
  now += 1200000; tick();
  assert.equal(requests.at(-1).seconds, 60);
  appState.currentState = 'active'; change('active'); await Promise.resolve();
  assert.notEqual(requests.at(-1).sessionId, original);
  now += 15000; tick(); await Promise.resolve();
  assert.equal(requests.at(-1).seconds, 15);
  cleanup();
});
