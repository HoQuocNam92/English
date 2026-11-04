import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
function load(path, mocks = {}) {
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  runInNewContext(code, { exports, URLSearchParams, Map, Set, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
  return exports;
}
const selection = load('./publication-selection.ts');
const rows = Array.from({ length: 205 }, (_, i) => ({ id: `id-${i}`, status: i < 150 ? 'draft' : 'published' }));
const tick = () => new Promise(resolve => setImmediate(resolve));
test('select-all gathers every matching page and rejects incomplete, drifting, duplicate or oversized snapshots', async () => {
  const pages = [];
  const result = await selection.collectPublicationSelection(async page => { pages.push(page); return { data: rows.slice((page - 1) * 100, page * 100), meta: { total: 205 } }; }, 205);
  assert.equal(result.length, 205); assert.deepEqual(pages, [1, 2, 3]);
  for (const response of [{ data: [], meta: { total: 205 } }, { data: rows, meta: { total: 206 } }, { data: [rows[0], rows[0]], meta: { total: 205 } }]) await assert.rejects(selection.collectPublicationSelection(async () => response, 205));
  await assert.rejects(selection.collectPublicationSelection(async () => { throw Error('network'); }, 205), /network/);
  await assert.rejects(selection.collectPublicationSelection(async () => { throw Error('should not fetch'); }, 10001), /10.000/);
  await assert.rejects(selection.collectPublicationSelection(async () => ({ data: rows, meta: { total: 205 } }), 205, () => true), /hủy/);
});

const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
const text = tree => typeof tree === 'string' || typeof tree === 'number' ? String(tree) : Array.isArray(tree) ? tree.map(text).join('') : tree?.props ? text(tree.props.children) : '';
function harness(initial = {}) {
  const state = []; let cursor = 0, effects = [], selected = new Set(initial.selected ?? []), confirms = 0;
  const gets = [], patches = [], messages = [];
  const react = {
    useState: init => { const index = cursor++; if (!(index in state)) state[index] = typeof init === 'function' ? init() : init; return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }]; },
    useRef: init => { const index = cursor++; return state[index] ??= { current: init }; },
    useEffect: (effect, deps) => { const index = cursor++; if (!state[index] || deps.some((value, i) => value !== state[index][i])) { state[index] = deps; effects.push(effect); } },
  };
  const jsx = (type, props) => ({ type, props });
  const api = {
    get: async url => { gets.push(url); if (initial.get) return initial.get(url); const params = new URLSearchParams(url.split('?')[1]); const page = Number(params.get('page')); if (initial.failSecond && page === 2) throw Error('Không thể tải trang 2'); return { data: rows.slice((page - 1) * 100, page * 100), meta: { total: rows.length } }; },
    patch: async (url, body) => { patches.push({ url, body }); return { updatedCount: body.ids.length - (initial.skipped ?? 0), skippedCount: initial.skipped ?? 0, requestedCount: body.ids.length }; },
  };
  const { PublicationBulkBar } = load('../ui/PublicationBulkBar.tsx', { react, 'react/jsx-runtime': { jsx, jsxs: jsx }, '@/shared/api/api-client': { apiClient: api }, './AppFeedback': { confirmDialog: async () => { confirms++; return initial.confirm !== false; } }, '../lib/publication-selection': selection });
  const props = { items: rows.slice(0, 10), total: rows.length, query: '/lessons?status=draft&type=case_study', endpoint: '/lessons/bulk-status', loading: false, onSelectionChange: value => { selected = value; }, onUpdated: message => { messages.push(message); }, ...initial.props };
  function render() { cursor = 0; effects = []; const tree = PublicationBulkBar({ ...props, selectedIds: selected }); const pending = effects; effects = []; pending.forEach(effect => effect()); return tree; }
  render();
  return { props, render, gets, patches, messages, get selected() { return selected; }, get confirms() { return confirms; }, button: label => nodes(render()).find(node => node.type === 'button' && text(node) === label), checkbox: () => nodes(render()).find(node => node.type === 'input') };
}

test('UI selects 10 then all 205 with the exact filters, keeps selection across pages, and clears on filter change', async () => {
  const h = harness();
  h.checkbox().props.onChange({ target: { checked: true } });
  assert.equal(h.selected.size, 10);
  h.button('Chọn tất cả 205 mục phù hợp bộ lọc').props.onClick(); await tick();
  assert.equal(h.selected.size, 205);
  assert.equal(h.gets.length, 3);
  assert.ok(h.gets.every(url => url.includes('status=draft') && url.includes('type=case_study')));
  h.props.items = rows.slice(10, 20); h.render(); assert.equal(h.selected.size, 205);
  h.props.query = '/lessons?status=published'; h.render(); assert.equal(h.selected.size, 0);
});

test('UI only enables the applicable transition, filters mixed selection, blocks double submissions, and reports actual counts', async () => {
  const h = harness({ skipped: 2 });
  assert.equal(h.button('Xuất bản').props.disabled, true);
  h.checkbox().props.onChange({ target: { checked: true } });
  assert.equal(h.button('Xuất bản').props.disabled, false);
  assert.equal(h.button('Chuyển về bản nháp').props.disabled, true);
  h.button('Chọn tất cả 205 mục phù hợp bộ lọc').props.onClick(); await tick();
  assert.equal(h.button('Chuyển về bản nháp').props.disabled, false);
  const publish = h.button('Xuất bản'); publish.props.onClick(); publish.props.onClick(); await tick();
  assert.equal(h.confirms, 1); assert.equal(h.patches.length, 1);
  assert.equal(h.patches[0].body.ids.length, 150);
  assert.ok(h.patches[0].body.ids.every(id => Number(id.split('-')[1]) < 150));
  assert.match(h.messages[0], /148/); assert.match(h.messages[0], /Bỏ qua 2/);
  assert.equal(h.selected.size, 0);
});

test('failed select-all never replaces selection with a partial set; published-only selection enables draft only', async () => {
  const h = harness({ failSecond: true });
  h.checkbox().props.onChange({ target: { checked: true } });
  h.button('Chọn tất cả 205 mục phù hợp bộ lọc').props.onClick(); await tick();
  assert.equal(h.selected.size, 10); assert.match(text(h.render()), /Không thể tải trang 2/);
  const published = harness({ props: { items: rows.slice(150, 160), total: 10 } });
  published.checkbox().props.onChange({ target: { checked: true } });
  assert.equal(published.button('Xuất bản').props.disabled, true);
  assert.equal(published.button('Chuyển về bản nháp').props.disabled, false);
});

test('late select-all is discarded even if a filter changes away and back before the response', async () => {
  let resolve;
  const response = new Promise(done => { resolve = done; });
  const h = harness({ get: () => response });
  h.checkbox().props.onChange({ target: { checked: true } });
  h.button('Chọn tất cả 205 mục phù hợp bộ lọc').props.onClick();
  const original = h.props.query;
  h.props.query = '/lessons?status=published'; h.render();
  h.props.query = original; h.render();
  resolve({ data: rows.slice(0, 100), meta: { total: 205 } }); await tick();
  assert.equal(h.selected.size, 0); assert.equal(h.patches.length, 0);
});

test('certificate publication selects every locally filtered match and sends boolean state atomically', async () => {
  const certificates = rows.slice(0, 100).map(row => ({ id: row.id, isActive: false }));
  const h = harness({ props: { items: certificates.slice(0, 10), allItems: certificates, total: 100, endpoint: '/certificates/bulk-activity', booleanStatus: true } });
  h.checkbox().props.onChange({ target: { checked: true } });
  h.button('Chọn tất cả 100 mục phù hợp bộ lọc').props.onClick(); await tick();
  assert.equal(h.selected.size, 100); assert.equal(h.gets.length, 0);
  h.button('Xuất bản').props.onClick(); await tick();
  assert.equal(h.patches[0].body.isActive, true);
  assert.equal(h.patches[0].body.status, undefined);
  assert.equal(h.patches[0].body.ids.length, 100);
  h.props.items = []; h.props.total = 0;
  assert.match(text(h.render()), /Đã xuất bản 100/);
});
