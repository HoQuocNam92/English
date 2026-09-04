'use client';

import { useTheme } from '../theme';
import { useI18n } from '../i18n';

export function ThemeLanguageToggle() {
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex items-center gap-2">
      {/* Language toggle */}
      <button
        onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-outline-variant/50 text-xs font-bold text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors"
        title={t.common.language}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>translate</span>
        {locale === 'vi' ? 'VI' : 'EN'}
      </button>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-outline-variant/50 text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors"
        title={theme === 'dark' ? t.common.lightMode : t.common.darkMode}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
          {theme === 'dark' ? 'light_mode' : 'dark_mode'}
        </span>
      </button>
    </div>
  );
}
