import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROLE_COLORS, ROLE_COLOR_KEYS, roleColor, roleColorStyle, isRoleColor } from './role-color.cjs';

test('system defaults and future custom roles always receive a stable palette color', () => {
  assert.equal(roleColor('SUPER_ADMIN'), 'amber');
  assert.equal(roleColor('admin'), 'indigo');
  assert.equal(roleColor('teacher'), 'blue');
  assert.equal(roleColor('learner'), 'violet');
  for (const code of ['future_role', 'reviewer_2030', 'constructor', '__proto__']) {
    assert.ok(ROLE_COLOR_KEYS.includes(roleColor(code)));
    assert.deepEqual(roleColorStyle(code), roleColorStyle(code));
  }
  assert.equal(roleColor('future_role', 'rose'), 'rose');
  assert.equal(isRoleColor('__proto__'), false);
  assert.equal(isRoleColor('#fff'), false);
});

test('every palette text/background pair has WCAG AA contrast for normal text', () => {
  const luminance = hex => {
    const values = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
  };
  for (const [name, item] of Object.entries(ROLE_COLORS)) {
    const contrast = (luminance(item.background) + 0.05) / (luminance(item.foreground) + 0.05);
    assert.ok(contrast >= 4.5, `${name}: ${contrast}`);
  }
});
