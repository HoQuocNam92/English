import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@techenglish/design-tokens';

export interface AppCardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function AppCard({ children, style }: AppCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    padding: spacing.lg
  }
});
