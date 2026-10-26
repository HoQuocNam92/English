import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

function client(response) {
  const ts = createRequire(import.meta.url)('typescript');
  const code = ts.transpileModule(readFileSync(new URL('./api/api-client.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  const mocks = {
    '@react-native-async-storage/async-storage': { __esModule: true, default: { getItem: async () => null } },
    '../config/env': { API_BASE_URL: 'https://example.test/api/v1' },
    './request-timeout': { requestTimeoutMs: () => 15000 },
  };
  runInNewContext(code, { exports, require: name => { assert.ok(name in mocks, name); return mocks[name]; }, fetch: async () => response, AbortController, setTimeout, clearTimeout, __DEV__: false });
  return exports;
}

test('native plan requests accept absent plans from new and legacy servers', async () => {
  for (const body of ['', 'null']) assert.equal(await client(new Response(body)).api.get('/placement-test/result'), null);
});

test('native requests do not treat malformed or unexpectedly empty responses as missing plans', async () => {
  for (const [path, body] of [['/placement-test/result', '{'], ['/progress/me', '']]) {
    const { api, ApiError } = client(new Response(body));
    await assert.rejects(api.get(path), error => error instanceof ApiError && error.message === 'Máy chủ trả về dữ liệu không hợp lệ. Vui lòng thử lại.');
  }
});
