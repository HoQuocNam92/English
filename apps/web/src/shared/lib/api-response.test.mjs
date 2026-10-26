import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

function client(response) {
  const ts = createRequire(import.meta.url)('typescript');
  const source = readFileSync(new URL('../api/api-client.ts', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mocks = {
    './mutation-feedback': { mutationSuccessMessage: () => null },
    '../lib/request-query': { withoutEmptyQueryValues: path => path },
    '@/shared/lib/level-label': { localizeLevelFields: value => value },
    '@/shared/storage': { sessionStorageTarget: () => ({ getItem: () => null }), clearAuthSession() {} },
    '@/shared/config/env': { API_BASE_URL: 'https://example.test/api/v1' },
    '@/shared/lib/error-message': { toVietnameseErrorMessage: message => message },
  };
  const exports = {};
  runInNewContext(code, { exports, require: name => { assert.ok(name in mocks, name); return mocks[name]; }, fetch: async () => response, Response, FormData, AbortController, setTimeout, clearTimeout });
  return exports;
}

test('missing placement plans accept both JSON null and legacy empty HTTP 200 bodies', async () => {
  for (const body of ['', '  ', 'null']) {
    assert.equal(await client(new Response(body)).apiClient.get('/placement-test/result'), null);
  }
});

test('saved placement results remain available and HTTP 204 mutations do not require JSON', async () => {
  const result = await client(new Response('{"assessmentId":"saved","plan":{"steps":[]}}')).apiClient.get('/placement-test/result');
  assert.equal(result.assessmentId, 'saved'); assert.equal(result.plan.steps.length, 0);
  assert.equal(await client(new Response(null, { status: 204 })).apiClient.delete('/notifications/item'), undefined);
});

test('malformed or unexpected empty success bodies give a readable error without pretending data is absent', async () => {
  for (const [path, body] of [['/placement-test/result', '{'], ['/progress/me/learning-path', ''], ['/progress/me', '<html>error</html>']]) {
    const api = client(new Response(body));
    await assert.rejects(api.apiClient.get(path), error => error instanceof api.ApiClientError && error.message === 'Máy chủ trả về dữ liệu không hợp lệ. Vui lòng thử lại.');
  }
});
