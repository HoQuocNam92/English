import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radius, spacing } from '@techenglish/design-tokens';
import { AppText } from './AppText';

export interface AppInputProps extends TextInputProps {
  label?: string;
}

export function AppInput({ label, style, ...props }: AppInputProps) {
  return (
    <View style={styles.wrapper}>
      {label ? <AppText variant="interface">{label}</AppText> : null}
      <TextInput {...props} style={[styles.input, style]} placeholderTextColor={colors.mutedText} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  }
});
