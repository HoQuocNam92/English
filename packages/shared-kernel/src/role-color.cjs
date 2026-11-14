const ROLE_COLORS = Object.freeze({
  amber: { name: 'Hổ phách', foreground: '#92400e', background: '#fef3c7' },
  indigo: { name: 'Chàm', foreground: '#4338ca', background: '#e0e7ff' },
  blue: { name: 'Xanh dương', foreground: '#1d4ed8', background: '#dbeafe' },
  violet: { name: 'Tím', foreground: '#6d28d9', background: '#ede9fe' },
  emerald: { name: 'Xanh lá', foreground: '#047857', background: '#d1fae5' },
  teal: { name: 'Xanh ngọc', foreground: '#0f766e', background: '#ccfbf1' },
  rose: { name: 'Hồng', foreground: '#be123c', background: '#ffe4e6' },
  orange: { name: 'Cam', foreground: '#9a3412', background: '#ffedd5' },
});
const ROLE_COLOR_KEYS = Object.freeze(Object.keys(ROLE_COLORS));
const SYSTEM_COLORS = { SUPER_ADMIN: 'amber', admin: 'indigo', teacher: 'blue', learner: 'violet' };
const isRoleColor = value => typeof value === 'string' && Object.hasOwn(ROLE_COLORS, value);
function roleColor(code, savedColor) {
  if (isRoleColor(savedColor)) return savedColor;
  if (Object.hasOwn(SYSTEM_COLORS, code)) return SYSTEM_COLORS[code];
  const sum = Array.from(String(code ?? '').toLowerCase()).reduce((total, char) => total + char.codePointAt(0), 0);
  return ROLE_COLOR_KEYS[sum % ROLE_COLOR_KEYS.length];
}
function roleColorStyle(code, savedColor) {
  const item = ROLE_COLORS[roleColor(code, savedColor)];
  return { color: item.foreground, backgroundColor: item.background };
}
module.exports = { ROLE_COLORS, ROLE_COLOR_KEYS, isRoleColor, roleColor, roleColorStyle };
