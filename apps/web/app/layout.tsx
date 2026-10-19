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
      <body className="bg-background text-on-surface antialiased">
        <AppFeedbackProvider>{children}<SelectionTranslator /></AppFeedbackProvider>
      </body>
    </html>
  );
}
