import { useTranslation } from './TranslationProvider';
import React from 'react';
import { Button as PaperButton, Chip, Searchbar, TouchableRipple } from 'react-native-paper';
import { Text as NativeText, TextInput as NativeInput, TouchableOpacity as NativeButton, ScrollView, View, StyleSheet, type TextProps, type TextInputProps, type TouchableOpacityProps } from 'react-native';
import { colors, radius, typography } from '@techenglish/design-tokens';

// Shared typography and touch targets. Screen-specific layouts stay in style props.
const TextDepth = React.createContext(false);
type AppTextProps = TextProps & { focusable?: boolean };
export function Text({ style, children, focusable, ...props }: AppTextProps) {
  const translate = useTranslation();
  const nested = React.useContext(TextDepth);
  const resolved = StyleSheet.flatten(style);
  const fontSize = !nested ? Math.max(13, resolved?.fontSize ?? 15) : resolved?.fontSize;
  const lineHeight = fontSize ? Math.max(resolved?.lineHeight ?? 0, Math.ceil(fontSize * 1.45)) : undefined;
  const text = plainText(children);
  const nativeProps = { ...props, ...(focusable === undefined ? {} : { focusable }) } as TextProps;
  return <NativeText {...nativeProps} onLongPress={props.onLongPress ?? (props.selectable && text.trim() ? () => translate(text) : undefined)} style={[
    !nested && { fontFamily: typography.fontFamily, fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight, color: colors.text },
    style, { fontSize, lineHeight },
  ]}><TextDepth.Provider value={true}>{children}</TextDepth.Provider></NativeText>;
}
export const TextInput = React.forwardRef<React.ElementRef<typeof NativeInput>, TextInputProps>(function TextInput({ style, ...props }, ref) {
  return <NativeInput ref={ref} placeholderTextColor={colors.outline} {...props} style={[{ fontFamily: typography.fontFamily, fontSize: 15, color: colors.text, minWidth: 0, minHeight: 48 }, style]} />;
});
export function TouchableOpacity({ style, ...props }: TouchableOpacityProps) {
  return <NativeButton accessibilityRole="button" activeOpacity={0.8} {...props} style={[{ minHeight: 48, justifyContent: 'center' }, style]} />;
}
export const controlStyles = StyleSheet.create({
  button: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.control, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  card: { backgroundColor: colors.surfaceWhite, borderColor: '#e4e8f1', borderWidth: 1, borderRadius: 20, padding: 20 },
  footer: { paddingTop: 12, flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 10 },
});
export function Button({ children, style, activeOpacity, ...props }: TouchableOpacityProps & { mode?: 'contained' | 'outlined' | 'text' | 'tonal' }) {
  const items = React.Children.toArray(children);
  const labelStyle = { color: props.mode && props.mode !== 'contained' ? colors.primary : colors.onPrimary, fontSize: 15, fontWeight: '700' as const, textAlign: 'center' as const };
  const isText = (child: React.ReactNode) => typeof child === 'string' || typeof child === 'number';
  // JSX labels with interpolations are arrays, and native buttons cannot render raw text.
  const content = items.every(isText)
    ? <Text style={labelStyle}>{children}</Text>
    : React.Children.map(children, child => isText(child) ? <Text style={labelStyle}>{child}</Text> : child);
  if (items.every(isText) && plainText(children).length > 30) {
    const { mode = 'contained', ...touchProps } = props;
    const backgroundColor = mode === 'contained' ? colors.primary : mode === 'tonal' ? '#eeecff' : 'transparent';
    return <TouchableRipple {...touchProps} accessibilityRole="button" accessibilityState={{ ...props.accessibilityState, disabled: props.disabled }} style={[{ minHeight: 52, maxWidth: '100%', flexShrink: 1, justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 14, backgroundColor, borderWidth: mode === 'outlined' ? 1 : 0, borderColor: '#c9c2ff', opacity: props.disabled ? 0.45 : 1 }, style]}>{content}</TouchableRipple>;
  }
  return <PaperButton {...props} mode={props.mode === 'tonal' ? 'contained-tonal' : props.mode ?? 'contained'} contentStyle={{ minHeight: 52, paddingVertical: 4 }} labelStyle={labelStyle} style={[{ borderRadius: 14, flexShrink: 1 }, style]}>{content}</PaperButton>;
}
export function Tabs({ items, value, onChange }: { items: { value: string; label: string }[]; value: string; onChange: (value: string) => void }) {
  if (!items.length) return null;
  return <ScrollView horizontal style={{ flexGrow: 0, flexShrink: 0 }} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4, alignItems: 'center' }}>{items.map(item => <Chip key={item.value} selected={value === item.value} showSelectedCheck={false} onPress={() => onChange(item.value)} accessibilityRole="tab" accessibilityState={{ selected: value === item.value }} style={{ backgroundColor: value === item.value ? '#eeecff' : '#ffffff', borderWidth: 1, borderColor: value === item.value ? '#c9c2ff' : '#e4e8f1', borderRadius: 12 }} textStyle={{ color: value === item.value ? colors.primary : colors.mutedText, fontSize: 14, fontWeight: '600', marginVertical: 12 }}>{item.label}</Chip>)}</ScrollView>;
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
  return <View style={{ gap: 12, marginBottom: 20 }}><Searchbar accessibilityLabel={placeholder} placeholder={placeholder} value={search} onChangeText={onSearch} style={{ backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e4e8f1' }} inputStyle={{ fontSize: 15, minHeight: 52 }} /><Tabs items={filters} value={value} onChange={onFilter} /></View>;
}
