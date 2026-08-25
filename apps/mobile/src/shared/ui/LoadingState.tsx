import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@techenglish/design-tokens';
import { AppText } from './AppText';

export interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Loading content...' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} />
      <AppText style={styles.label}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg
  },
  label: {
    color: colors.mutedText
  }
});
