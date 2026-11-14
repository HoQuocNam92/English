'use client';
import { ROLE_COLORS, ROLE_COLOR_KEYS, roleColorStyle } from '@techenglish/shared-kernel/role-color';

export function RoleColorPicker({ code, value, onChange }: { code: string; value: string; onChange: (color: string) => void }) {
  return <fieldset><legend className="mb-2 text-sm font-semibold">Màu nhận diện</legend><div className="flex flex-wrap gap-2">
    <button type="button" aria-pressed={!value} onClick={() => onChange('')} className={`rounded-lg border px-3 py-2 text-sm ${!value ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant'}`} style={roleColorStyle(code)}>Tự động</button>
    {ROLE_COLOR_KEYS.map(color => <button key={color} type="button" aria-label={`Màu ${ROLE_COLORS[color].name}`} aria-pressed={value === color} onClick={() => onChange(color)} style={roleColorStyle(code, color)} className={`min-h-10 rounded-lg border px-3 py-2 text-sm font-semibold ${value === color ? 'border-current ring-2 ring-current' : 'border-transparent'}`}>{ROLE_COLORS[color].name}{value === color ? ' ✓' : ''}</button>)}
  </div><p className="mt-2 text-xs text-on-surface-variant">Tự động chọn màu theo mã vai trò. Màu được lưu khi bạn hoàn tất.</p></fieldset>;
}
