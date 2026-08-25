import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@techenglish/design-tokens';
import { AppText } from './AppText';

export interface ScreenHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function ScreenHeader({ eyebrow, title, description, action }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        {eyebrow ? <AppText style={styles.eyebrow} variant="interface">{eyebrow}</AppText> : null}
        <AppText variant="h1">{title}</AppText>
        {description ? <AppText style={styles.description}>{description}</AppText> : null}
      </View>
      {action ? <View>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md
  },
  copy: {
    gap: spacing.xs
  },
  eyebrow: {
    color: colors.primary
  },
  description: {
    color: colors.mutedText
  }
});
