import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@techenglish/design-tokens';
import { AppText } from './AppText';

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="h3">{title}</AppText>
      <AppText style={styles.description}>{description}</AppText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.outline,
    borderRadius: radius.card,
    backgroundColor: colors.background
  },
  description: {
    color: colors.mutedText
  }
});
