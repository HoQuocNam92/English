import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeColors {
  background: string;
  surface: string;
  surfaceContainer: string;
  surfaceContainerLow: string;
  surfaceContainerLowest: string;
  onSurface: string;
  onSurfaceVariant: string;
  primary: string;
  onPrimary: string;
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
  surfaceContainer: '#eceef0',
  surfaceContainerLow: '#f2f4f6',
  surfaceContainerLowest: '#ffffff',
  onSurface: '#191c1e',
  onSurfaceVariant: '#464555',
  primary: '#3525cd',
  onPrimary: '#ffffff',
  outline: '#777587',
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
  surfaceContainer: '#1d2022',
  surfaceContainerLow: '#191c1e',
  surfaceContainerLowest: '#0a0d0e',
  onSurface: '#e1e3e5',
  onSurfaceVariant: '#c2c7cb',
  primary: '#c3c0ff',
  onPrimary: '#1b00a8',
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
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    AsyncStorage.getItem('techenglish.theme').then(saved => {
      if (saved === 'light' || saved === 'dark') {
        setThemeState(saved);
      } else {
        setThemeState(systemScheme === 'dark' ? 'dark' : 'light');
      }
    });
  }, [systemScheme]);

  const setTheme = async (t: Theme) => {
    setThemeState(t);
    await AsyncStorage.setItem('techenglish.theme', t);
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{
      theme,
      colors: theme === 'dark' ? darkColors : lightColors,
      toggleTheme,
      setTheme,
      isDark: theme === 'dark',
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
