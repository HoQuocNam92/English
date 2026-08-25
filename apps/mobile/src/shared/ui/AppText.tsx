import type { ReactNode } from 'react';
import { Text, type TextProps } from 'react-native';
import { colors, typography } from '@techenglish/design-tokens';

type TextVariant = 'body' | 'small' | 'h1' | 'h3' | 'interface';

const variantStyles: Record<TextVariant, TextProps['style']> = {
  body: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight
  },
  small: {
    color: colors.mutedText,
    fontFamily: typography.fontFamily,
    fontSize: typography.small.fontSize,
    lineHeight: typography.small.lineHeight
  },
  h1: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: typography.h1.fontSize,
    lineHeight: typography.h1.lineHeight,
    fontWeight: `${typography.h1.fontWeight}` as '700'
  },
  h3: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: typography.h3.fontSize,
    lineHeight: typography.h3.lineHeight,
    fontWeight: `${typography.h3.fontWeight}` as '600'
  },
  interface: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontSize: typography.interface.fontSize,
    lineHeight: typography.interface.lineHeight,
    fontWeight: `${typography.interface.fontWeight}` as '600'
  }
};

export interface AppTextProps extends TextProps {
  children: ReactNode;
  variant?: TextVariant;
}

export function AppText({ children, variant = 'body', style, ...props }: AppTextProps) {
  return (
    <Text {...props} style={[variantStyles[variant], style]}>
      {children}
    </Text>
  );
}
