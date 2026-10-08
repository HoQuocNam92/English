import { useTranslation } from './TranslationProvider';
import React from 'react';
import { Text as NativeText, TextInput as NativeInput, TouchableOpacity as NativeButton, ScrollView, View, StyleSheet, type TextProps, type TextInputProps, type TouchableOpacityProps } from 'react-native';
import { colors, radius, typography } from '@techenglish/design-tokens';

// Shared typography and touch targets. Screen-specific layouts stay in style props.
const TextDepth = React.createContext(false);
type AppTextProps = TextProps & { focusable?: boolean };
export function Text({ style, children, focusable, ...props }: AppTextProps) {
  const translate = useTranslation();
  const nested = React.useContext(TextDepth);
  const resolved = StyleSheet.flatten(style);
  const text = plainText(children);
  const nativeProps = { ...props, ...(focusable === undefined ? {} : { focusable }) } as TextProps;
  return <NativeText {...nativeProps} onLongPress={props.onLongPress ?? (props.selectable && text.trim() ? () => translate(text) : undefined)} style={[
    !nested && { fontFamily: typography.fontFamily, fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight, color: colors.text },
    resolved?.fontSize && !resolved.lineHeight ? { lineHeight: Math.ceil(resolved.fontSize * 1.4) } : undefined, style,
  ]}><TextDepth.Provider value={true}>{children}</TextDepth.Provider></NativeText>;
}
export const TextInput = React.forwardRef<React.ElementRef<typeof NativeInput>, TextInputProps>(function TextInput({ style, ...props }, ref) {
  return <NativeInput ref={ref} placeholderTextColor={colors.outline} {...props} style={[{ fontFamily: typography.fontFamily, fontSize: 14, color: colors.text, minHeight: 44 }, style]} />;
});
export function TouchableOpacity({ style, ...props }: TouchableOpacityProps) {
  return <NativeButton accessibilityRole="button" activeOpacity={0.8} {...props} style={[{ minHeight: 44, justifyContent: 'center' }, style]} />;
}
export const controlStyles = StyleSheet.create({
  button: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.control, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  card: { backgroundColor: colors.surfaceWhite, borderColor: colors.outlineVariant, borderWidth: 1, borderRadius: radius.card, padding: 16 },
  footer: { marginTop: 'auto', paddingTop: 16, flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 8 },
});
export function Button({ children, style, ...props }: TouchableOpacityProps) { return <TouchableOpacity {...props} style={[controlStyles.button, { backgroundColor: colors.primary }, props.disabled && { opacity: 0.5 }, style]}>{typeof children === 'string' ? <Text style={{ color: colors.onPrimary, fontWeight: '700', textAlign: 'center' }}>{children}</Text> : children}</TouchableOpacity>; }
export function Tabs({ items, value, onChange }: { items: { value: string; label: string }[]; value: string; onChange: (value: string) => void }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 4, gap: 4, backgroundColor: colors.surfaceWhite, borderRadius: radius.card }}>{items.map(item => <TouchableOpacity key={item.value} onPress={() => onChange(item.value)} accessibilityRole="tab" accessibilityState={{ selected: value === item.value }} style={[controlStyles.button, { backgroundColor: value === item.value ? colors.primaryLight : colors.surfaceWhite }]}><Text style={{ color: value === item.value ? colors.primary : colors.mutedText, fontWeight: '600' }}>{item.label}</Text></TouchableOpacity>)}</ScrollView>;
}

function plainText(value: React.ReactNode): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(plainText).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(value)) return plainText(value.props.children);
  return '';
}

export function Badge({ children, tone = 'primary' }: { children: React.ReactNode; tone?: 'primary' | 'success' | 'warning' | 'muted' }) {
  const palette = { primary: [colors.primaryLight, colors.primary], success: ['#dcfce7', '#15803d'], warning: ['#fef3c7', '#b45309'], muted: [colors.surfaceContainerLow, colors.mutedText] }[tone];
  return <View style={{ alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: palette[0] }}><Text style={{ color: palette[1], fontSize: 12, lineHeight: 18, fontWeight: '600' }}>{children}</Text></View>;
}
export function ListTools({ search, onSearch, placeholder, filters, value, onFilter }: { search: string; onSearch: (value: string) => void; placeholder: string; filters: { value: string; label: string }[]; value: string; onFilter: (value: string) => void }) {
  return <View style={[controlStyles.card, { gap: 12, marginBottom: 16 }]}><View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><TextInput accessibilityLabel={placeholder} value={search} onChangeText={onSearch} placeholder={placeholder} style={{ flex: 1, minWidth: 0, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.control, paddingHorizontal: 12 }} />{search ? <TouchableOpacity onPress={() => onSearch('')} accessibilityLabel="Xóa tìm kiếm"><Text style={{ color: colors.primary }}>Xóa</Text></TouchableOpacity> : null}</View><Tabs items={filters} value={value} onChange={onFilter} /></View>;
}
