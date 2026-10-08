'use client';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function BackButton({ fallbackHref, children = 'Quay lại' }: { fallbackHref: string; children?: ReactNode }) {
  const router = useRouter();
  return <button type="button" onClick={() => window.history.length > 1 ? router.back() : router.push(fallbackHref.startsWith('/') && !fallbackHref.startsWith('//') ? fallbackHref : '/learn')} className="inline-flex items-center gap-2 rounded-lg py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
    <ArrowLeft size={18} aria-hidden="true" />{children}
  </button>;
}
