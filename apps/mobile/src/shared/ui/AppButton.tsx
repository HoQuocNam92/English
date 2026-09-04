import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@techenglish/design-tokens';
import { AppText } from './AppText';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface AppButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export function AppButton({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
}: AppButtonProps) {
  const bg = {
    primary: colors.primary,
    secondary: colors.surfaceContainerLow,
    ghost: 'transparent',
    danger: colors.errorContainer,
  }[variant];

  const textColor = {
    primary: colors.onPrimary,       // #ffffff — trắng trên nền xanh
    secondary: colors.text,
    ghost: colors.primary,
    danger: colors.onErrorContainer,
  }[variant];

  const borderColor = {
    primary: colors.primary,
    secondary: colors.borderSubtle,
    ghost: colors.borderSubtle,
    danger: colors.errorContainer,
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, borderColor },
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        pressed && !(disabled || loading) && styles.pressed,
      ]}
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <AppText style={[styles.label, { color: textColor }]} variant="interface">
            {children}
          </AppText>
        )}
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
    borderWidth: 1,
  },
  fullWidth: {
    width: '100%',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    // color will be set inline per variant
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.82,
  },
  // Legacy aliases kept for backward compat
  primaryText: {
    color: colors.onPrimary,
  },
  secondaryText: {
    color: colors.text,
  },
});
