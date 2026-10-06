import Link from 'next/link';
import { BrandLogo } from './BrandLogo';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/30 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <BrandLogo />
        <Link href="/login" className="px-5 py-2 text-sm font-bold text-on-primary bg-primary rounded-full hover:bg-primary/90 transition-colors">Đăng nhập</Link>
      </div>
    </header>
  );
}
