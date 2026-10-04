import { colors as palette, iconColors } from '@techenglish/design-tokens';
import React, { createContext, useContext, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceContainer: string;
  surfaceContainerLow: string;
  surfaceContainerLowest: string;
  surfaceContainerHigh: string;
  onSurface: string;
  onSurfaceVariant: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  outline: string;
  outlineVariant: string;
  error: string;
  success: string;
  card: string;
  border: string;
  text: string;
  textSecondary: string;
}

export const lightColors: ThemeColors = {
  background: palette.background,
  surface: palette.surfaceWhite,
  surfaceVariant: palette.primaryLight,
  surfaceContainer: palette.surfaceContainer,
  surfaceContainerLow: palette.surfaceContainerLow,
  surfaceContainerLowest: palette.surfaceWhite,
  surfaceContainerHigh: palette.surfaceContainerHigh,
  onSurface: palette.text,
  onSurfaceVariant: palette.mutedText,
  primary: palette.primary,
  onPrimary: palette.onPrimary,
  primaryContainer: palette.primaryFixed,
  onPrimaryContainer: palette.onPrimaryFixedVariant,
  secondary: palette.secondary,
  onSecondary: palette.onSecondary,
  outline: palette.outline,
  outlineVariant: palette.outlineVariant,
  error: palette.error,
  success: iconColors.success,
  card: palette.surfaceWhite,
  border: palette.outlineVariant,
  text: palette.text,
  textSecondary: palette.mutedText,
};

export const darkColors: ThemeColors = {
  background: '#0f1112',
  surface: '#191c1e',
  surfaceVariant: '#464555',
  surfaceContainer: '#1d2022',
  surfaceContainerLow: '#191c1e',
  surfaceContainerLowest: '#0a0d0e',
  surfaceContainerHigh: '#282a2d',
  onSurface: '#e1e3e5',
  onSurfaceVariant: '#c2c7cb',
  primary: '#c3c0ff',
  onPrimary: '#1b00a8',
  primaryContainer: '#1b00a8',
  onPrimaryContainer: '#e0e0ff',
  secondary: '#c5c4dd',
  onSecondary: '#2f2f42',
  outline: '#8c9196',
  outlineVariant: '#3f4346',
  error: '#ffb4ab',
  success: '#34d399',
  card: '#1d2022',
  border: '#3f4346',
  text: '#e1e3e5',
  textSecondary: '#c2c7cb',
};

interface ThemeContextValue {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  colors: lightColors,
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const setTheme = (_t: Theme) => {};
  const toggleTheme = () => {};

  return (
    <ThemeContext.Provider value={{
      theme: 'light',
      colors: lightColors,
      toggleTheme,
      setTheme,
      isDark: false,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
