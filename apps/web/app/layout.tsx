import { SelectionTranslator } from '@/shared/ui/SelectionTranslator';
import type { Metadata } from 'next';
import './globals.css';
import { AppFeedbackProvider } from '@/shared/ui';

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
      </head>
      <body className="bg-background text-on-surface antialiased">
        <AppFeedbackProvider>{children}<SelectionTranslator /></AppFeedbackProvider>
      </body>
    </html>
  );
}
