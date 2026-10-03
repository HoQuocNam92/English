import { AppIcon } from '@/shared/ui/AppIcon';
import Link from 'next/link';

export function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <Link href="/landing" className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="w-9 h-9 shrink-0 rounded-xl bg-primary flex items-center justify-center shadow-sm">
        <AppIcon className=" text-[22px] !text-white " aria-hidden="true">terminal</AppIcon>
      </span>
      <span>
        <span className="font-black text-primary text-base leading-tight tracking-tight block">TechEnglish Pro</span>
        <span className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider leading-none block">IT English Platform</span>
      </span>
    </Link>
  );
}
