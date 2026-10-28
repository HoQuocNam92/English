import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const ts = createRequire(import.meta.url)('typescript');
function load(relative, dependencies = {}) {
  const code = ts.transpileModule(readFileSync(new URL(relative, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  runInNewContext(code, { exports, require: name => { assert.ok(name in dependencies, name); return dependencies[name]; } });
  return exports;
}
const navigation = load('../layout/navigation.ts');
const { adminPageAppearance, adminIconColor } = load('./admin-page-appearance.ts', { '../layout/navigation': navigation });
const flatten = item => [item, ...(item.children ?? []).flatMap(flatten)];

test('all admin and teacher navigation entries share icon and accent with their page headers', () => {
  const entries = [...navigation.combinedNavigation, ...navigation.teacherNavigation].flatMap(group => group.items.flatMap(flatten));
  for (const item of entries) {
    const appearance = adminPageAppearance(item.href.split('?')[0], item.icon, item.label);
    assert.equal(appearance.icon, item.icon, item.href);
    assert.equal(appearance.color, adminIconColor(item.icon), item.href);
    assert.match(appearance.color, /^#[0-9a-f]{6}$/, `Missing shared palette entry: ${item.icon}`);
  }
});

test('nested, loading and editing pages retain the feature identity instead of guessing from title', () => {
  assert.equal(adminPageAppearance('/admin/users/new', 'dashboard').icon, 'manage_accounts');
  assert.equal(adminPageAppearance('/admin/progress', undefined, 'Tiến độ học tập toàn hệ thống').icon, 'trending_up');
  assert.equal(adminPageAppearance('/admin/roles', 'shield').icon, 'admin_panel_settings');
  assert.equal(adminPageAppearance('/admin/levels').icon, 'stairs');
  assert.equal(adminPageAppearance('/admin/lessons/editor', 'api').icon, 'api');
  assert.equal(adminPageAppearance('/admin/students', undefined, 'Mục tiêu chứng chỉ của học viên').icon, 'verified');
  assert.equal(adminPageAppearance('/learn'), null);
});
