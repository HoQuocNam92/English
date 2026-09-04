import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/shared/theme';
import { I18nProvider } from '@/shared/i18n';

export const metadata: Metadata = {
  title: 'TechEnglish Pro',
  description: 'Nền tảng học tiếng Anh chuyên ngành CNTT',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        {/* Prevent flash of wrong theme - only apply dark if user explicitly chose it */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(localStorage.getItem('techenglish.theme')==='dark'){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className="bg-background text-on-surface antialiased">
        <ThemeProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
