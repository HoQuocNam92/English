import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const ts = createRequire(import.meta.url)('typescript');
function client(fetch) {
  const storage = new Map([['access_token', 'old-access'], ['refresh_token', 'old-refresh'], ['user', '{}']]);
  const mocks = {
    '@react-native-async-storage/async-storage': { __esModule: true, default: { getItem: async key => storage.get(key) ?? null, setItem: async (key, value) => storage.set(key, value), removeItem: async key => storage.delete(key) } },
    '../config/env': { API_BASE_URL: 'https://example.test' }, './request-timeout': { requestTimeoutMs: () => 15000 }, '../utils/display-labels': { localizeApiDisplayFields: data => data },
  };
  const exports = {};
  const code = ts.transpileModule(readFileSync(new URL('./api/api-client.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(code, { exports, require: name => mocks[name], fetch: (...args) => fetch(...args, storage), AbortController, setTimeout, clearTimeout, __DEV__: false });
  return { ...exports, storage };
}
const denied = () => new Response('{"message":"Unauthorized"}', { status: 401 });

test('revoked refresh clears native session and notifies navigation immediately', async () => {
  const c = client(async () => denied()); let expired = 0;
  c.subscribeSessionExpired(() => expired++);
  await assert.rejects(c.api.get('/lessons'), error => error.statusCode === 401);
  assert.equal(expired, 1); assert.equal(c.storage.size, 0);
});
test('401 after a successful refresh also forces native signout', async () => {
  const c = client(async url => url.endsWith('/auth/refresh') ? new Response('{"accessToken":"refreshed"}') : denied());
  let expired = 0; c.subscribeSessionExpired(() => expired++);
  await assert.rejects(c.api.get('/lessons'), error => error.statusCode === 401);
  assert.equal(expired, 1); assert.equal(c.storage.size, 0);
});
test('network and temporary refresh failures never sign the user out', async () => {
  for (const status of [0, 503]) {
    const c = client(async url => { if (!url.endsWith('/auth/refresh')) return denied(); if (!status) throw Error('offline'); return new Response('{}', { status }); });
    let expired = 0; c.subscribeSessionExpired(() => expired++);
    await assert.rejects(c.api.get('/lessons'));
    assert.equal(expired, 0); assert.equal(c.storage.get('access_token'), 'old-access');
  }
});
test('wrong current password does not revoke a valid local session', async () => {
  const c = client(async () => denied()); let expired = 0; c.subscribeSessionExpired(() => expired++);
  await assert.rejects(c.api.post('/users/me/change-password', {}));
  assert.equal(expired, 0); assert.equal(c.storage.get('access_token'), 'old-access');
});
test('a delayed 401 from an older login cannot clear the new login', async () => {
  const c = client(async (url, _options, storage) => { if (!url.endsWith('/auth/refresh')) { storage.set('access_token', 'new-login'); storage.delete('refresh_token'); } return denied(); });
  let expired = 0; c.subscribeSessionExpired(() => expired++);
  await assert.rejects(c.api.get('/lessons'));
  assert.equal(expired, 0); assert.equal(c.storage.get('access_token'), 'new-login');
});
