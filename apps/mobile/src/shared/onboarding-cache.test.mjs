import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');

test('completed onboarding survives reload and stays scoped to its account', async () => {
  const stored = new Map();
  let unavailable = false;
  const storage = {
    getItem: async key => { if (unavailable) throw new Error('Unavailable'); return stored.get(key) ?? null; },
    setItem: async (key, value) => { if (unavailable) throw new Error('Unavailable'); stored.set(key, value); },
  };
  const load = () => {
    const exports = {};
    const source = readFileSync(new URL('./store/onboarding-cache.ts', import.meta.url), 'utf8');
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    runInNewContext(code, { exports, require: () => ({ __esModule: true, default: storage }) });
    return exports;
  };
  const cache = load();
  assert.equal(await cache.hasCompletedOnboarding('first'), false);
  await cache.rememberCompletedOnboarding('first');
  assert.equal(await load().hasCompletedOnboarding('first'), true);
  assert.equal(await cache.hasCompletedOnboarding('second'), false);
  unavailable = true;
  assert.equal(await cache.hasCompletedOnboarding('first'), true);
  assert.equal(await load().hasCompletedOnboarding('first'), false);
  await cache.rememberCompletedOnboarding('second');
});
