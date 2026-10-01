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
  background: '#f7f9fb',
  surface: '#f7f9fb',
  surfaceVariant: '#e2e1ec',
  surfaceContainer: '#eceef0',
  surfaceContainerLow: '#f2f4f6',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerHigh: '#e6e8ea',
  onSurface: '#191c1e',
  onSurfaceVariant: '#464555',
  primary: '#3525cd',
  onPrimary: '#ffffff',
  primaryContainer: '#e0e0ff',
  onPrimaryContainer: '#02006d',
  secondary: '#5d5d72',
  onSecondary: '#ffffff',
  outline: '#6b687b',
  outlineVariant: '#c7c4d8',
  error: '#ba1a1a',
  success: '#10b981',
  card: '#ffffff',
  border: '#e2e8f0',
  text: '#191c1e',
  textSecondary: '#464555',
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
