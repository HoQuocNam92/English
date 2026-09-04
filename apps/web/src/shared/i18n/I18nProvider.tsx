'use client';

import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { vi } from './locales/vi';
import { en } from './locales/en';
import type { Translations } from './locales/vi';

type Locale = 'vi' | 'en';

const locales: Record<Locale, Translations> = { vi, en };

interface I18nContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'vi',
  t: vi,
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('techenglish.locale') as Locale) || 'vi';
    }
    return 'vi';
  });

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('techenglish.locale', l);
    document.documentElement.lang = l;
  };

  return (
    <I18nContext.Provider value={{ locale, t: locales[locale], setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
