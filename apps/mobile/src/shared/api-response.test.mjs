import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { localizeApiDisplayFields } from './utils/display-labels.ts';

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
    '../utils/display-labels': { localizeApiDisplayFields },
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

test('API metadata uses Vietnamese across profile and filter responses without changing IDs', async () => {
  const body = { data: [{ id: 'domain-1', code: 'SOFTWARE_ENG', name: 'Software Engineering' }, { id: 'domain-2', code: 'CLOUD', name: 'Cloud Computing' }, { id: 'domain-3', code: 'CYBERSEC', name: 'Cybersecurity' }] };
  const result = await client(new Response(JSON.stringify(body))).api.get('/domains?activeOnly=true');
  assert.equal(result.data.map(item => item.name).join('|'), 'Kỹ thuật phần mềm|Điện toán đám mây|An ninh mạng');
  assert.equal(result.data[0].id, 'domain-1');
  assert.equal(result.data[0].code, 'SOFTWARE_ENG');
  assert.equal(body.data[0].name, 'Software Engineering');
  const levels = await client(new Response(JSON.stringify({ data: ['Beginner', 'Intermediate', 'Advanced', 'Professional'].map(name => ({ name })) }))).api.get('/levels');
  assert.equal(levels.data.map(item => item.name).join('|'), 'Cơ bản|Trung cấp|Nâng cao|Chuyên nghiệp');
  const profile = { level: { code: 'intermediate', name: 'Intermediate' }, domains: [{ domain: body.data[0] }], nextLevel: { name: 'Advanced' }, levelName: 'Intermediate', lesson: { name: 'Software Engineering', content: 'Cloud Computing', term: 'Intermediate' }, certificate: { name: 'AWS Certified Cloud Practitioner' } };
  const localized = await client(new Response(JSON.stringify(profile))).api.get('/learner-profiles/me');
  assert.equal(localized.level.name, 'Trung cấp');
  assert.equal(localized.level.code, 'intermediate');
  assert.equal(localized.nextLevel.name, 'Nâng cao');
  assert.equal(localized.domains[0].domain.name, 'Kỹ thuật phần mềm');
  assert.equal(localized.lesson.name, profile.lesson.name);
  assert.equal(localized.lesson.content, profile.lesson.content);
  assert.equal(localized.certificate.name, profile.certificate.name);
});
