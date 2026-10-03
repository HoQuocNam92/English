import { PublicHeader } from '@/shared/layout/PublicHeader';
import { Footer } from '@/shared/layout/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <PublicHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 sm:py-16">{children}</main>
      <Footer />
    </div>
  );
}
