import { MD3LightTheme, PaperProvider, configureFonts } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@techenglish/design-tokens';
import type { ReactNode } from 'react';
import { interFontStyle } from './font-styles';
import { MaterialIcons, hasAppIcon } from './AppIcon';

export const mobileTheme = {
  ...MD3LightTheme,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: '#ffffff',
    primaryContainer: '#eeecff',
    onPrimaryContainer: '#29216b',
    secondary: '#5b647c',
    secondaryContainer: '#eef1f8',
    onSecondaryContainer: '#27324b',
    background: '#f7f8fc',
    surface: '#ffffff',
    surfaceVariant: '#f0f2f8',
    onSurface: '#17213a',
    onSurfaceVariant: '#59657c',
    outline: '#7a859a',
    outlineVariant: '#e4e8f1',
    error: '#ba1a1a',
    elevation: { ...MD3LightTheme.colors.elevation, level1: '#ffffff', level2: '#f5f4ff' },
  },
  fonts: configureFonts({ config: Object.fromEntries(Object.entries(MD3LightTheme.fonts).map(([variant, font]) => [variant, { ...font, ...interFontStyle('fontWeight' in font ? font.fontWeight : '400'), letterSpacing: 0 }])) }),
};

export function MobileUIProvider({ children }: { children: ReactNode }) {
  return <PaperProvider theme={mobileTheme} settings={{ icon: props => hasAppIcon(props.name) ? <MaterialIcons {...props} name={props.name as keyof typeof MaterialIcons.glyphMap} /> : <MaterialCommunityIcons {...props} name={props.name as keyof typeof MaterialCommunityIcons.glyphMap} /> }}>{children}</PaperProvider>;
}
