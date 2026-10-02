'use client';

import type { ComponentProps, ReactNode } from 'react';
import Link from 'next/link';
import { Modal } from './Modal';
import { showToast } from './AppFeedback';
import { cn } from '@/shared/lib/cn';

/** Center the heading and fields together within the available content area. */
export function FormPageLayout({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('admin-form-page mx-auto w-full min-w-0 max-w-5xl', className)}>{children}</div>;
}

/** Consistent layout for creating records outside the list view. */
export function CreatePage({ backHref, children }: { backHref: string; children: ReactNode }) {
  return <FormPageLayout className="max-w-4xl space-y-5">
    <Link href={backHref} className="inline-flex items-center gap-2 rounded-lg py-1 text-sm font-medium text-on-surface-variant hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <span aria-hidden="true" className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
      Quay lại
    </Link>
    <section className="overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest shadow-sm">{children}</section>
  </FormPageLayout>;
}

/** Reuse existing form fields and validation for full pages and edit dialogs. */
export function FormSurface({ page = false, children, ...props }: ComponentProps<typeof Modal> & { page?: boolean }) {
  if (page) return <>{children}</>;
  return <Modal {...props}>{children}</Modal>;
}

export function completeCreation(router: { push: (href: string) => void }, href: string, message: string) {
  showToast(message, 'success');
  router.push(href);
}
