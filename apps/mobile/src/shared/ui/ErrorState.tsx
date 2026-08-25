import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@techenglish/design-tokens';
import { AppText } from './AppText';

export interface ErrorStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="h3" style={styles.title}>
        {title}
      </AppText>
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
    borderColor: colors.error,
    borderRadius: radius.card,
    backgroundColor: '#fff5f5'
  },
  title: {
    color: colors.error
  },
  description: {
    color: colors.mutedText
  }
});
