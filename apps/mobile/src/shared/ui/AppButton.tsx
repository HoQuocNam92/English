import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@techenglish/design-tokens';
import { AppText } from './AppText';

type ButtonVariant = 'primary' | 'secondary';

export interface AppButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
}

export function AppButton({ children, onPress, variant = 'primary', disabled = false }: AppButtonProps) {
  const variantStyle = variant === 'primary' ? styles.primary : styles.secondary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.base, variantStyle, disabled && styles.disabled, pressed && !disabled && styles.pressed]}
    >
      <View>
        <AppText style={variant === 'primary' ? styles.primaryText : styles.secondaryText} variant="interface">
          {children}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.control,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.outlineVariant
  },
  disabled: {
    opacity: 0.6
  },
  pressed: {
    opacity: 0.85
  },
  primaryText: {
    color: colors.surface
  },
  secondaryText: {
    color: colors.text
  }
});
