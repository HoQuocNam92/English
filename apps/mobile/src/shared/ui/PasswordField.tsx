import { forwardRef, useState, type ComponentRef } from 'react';
import { View, StyleSheet, type TextInputProps } from 'react-native';
import { Text, TextInput, TouchableOpacity } from './primitives';
import { RequiredMark } from './RequiredMark';
import { MaterialIcons } from './AppIcon';
import { colors } from '@techenglish/design-tokens';

type Props = Omit<TextInputProps, 'secureTextEntry'> & { label: string; error?: string; showHint?: boolean };
export const PasswordField = forwardRef<ComponentRef<typeof TextInput>, Props>(function PasswordField({ label, error, showHint, editable = true, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return <View style={s.group}>
    <Text style={s.label}>{label}<RequiredMark /></Text>
    <View style={[s.wrapper, error ? s.invalid : null]}>
      <MaterialIcons name="lock-outline" size={20} color={colors.outline} />
      <TextInput ref={ref} accessibilityLabel={label} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" underlineColorAndroid="transparent" {...props} editable={editable} secureTextEntry={!visible} style={s.input} />
      <TouchableOpacity accessibilityLabel={`${visible ? 'Ẩn' : 'Hiện'} ${label.toLowerCase()}`} accessibilityState={{ disabled: !editable }} disabled={!editable} onPress={() => setVisible(value => !value)} style={s.eye}>
        <MaterialIcons name={visible ? 'visibility-off' : 'visibility'} size={20} color={colors.outline} />
      </TouchableOpacity>
    </View>
    {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
    {showHint && <Text style={s.hint}>Mật khẩu từ 6 đến 72 ký tự. Nên chứa chữ hoa, chữ số và ký tự đặc biệt.</Text>}
  </View>;
});
const s = StyleSheet.create({
  group: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, backgroundColor: '#ffffff', paddingHorizontal: 12, minHeight: 56 },
  input: { flex: 1, minWidth: 0, fontSize: 14, color: colors.text, backgroundColor: 'transparent' },
  eye: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  invalid: { borderColor: '#dc2626' },
  error: { color: '#dc2626', fontSize: 12, marginLeft: 4 },
  hint: { color: colors.mutedText, fontSize: 11, lineHeight: 16 },
});
