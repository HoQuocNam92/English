'use client';
import { AppIcon } from '@/shared/ui/AppIcon';

import * as React from 'react';
import ReactDOM from 'react-dom';

type ToastKind = 'success' | 'error' | 'info' | 'warning';
type ToastDetail = { message: string; kind?: ToastKind; title?: string; automatic?: boolean };
type ConfirmDetail = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning' | 'primary';
  resolve: (value: boolean) => void;
};

const TOAST_EVENT = 'techenglish:toast';
const CONFIRM_EVENT = 'techenglish:confirm';

export function showToast(message: string, kind: ToastKind = 'info', title?: string) {
  window.dispatchEvent(new CustomEvent<ToastDetail>(TOAST_EVENT, { detail: { message, kind, title } }));
}

export function confirmDialog(message: string, options: Omit<ConfirmDetail, 'message' | 'resolve'> = {}) {
  return new Promise<boolean>((resolve) => {
    window.dispatchEvent(new CustomEvent<ConfirmDetail>(CONFIRM_EVENT, { detail: { ...options, message, resolve } }));
  });
}

const toastStyle: Record<ToastKind, { icon: string; accent: string; bg: string; defaultTitle: string }> = {
  success: { icon: 'check_circle', accent: 'text-emerald-600', bg: 'bg-emerald-50', defaultTitle: 'Thành công' },
  error: { icon: 'error', accent: 'text-red-600', bg: 'bg-red-50', defaultTitle: 'Có lỗi xảy ra' },
  warning: { icon: 'warning', accent: 'text-amber-600', bg: 'bg-amber-50', defaultTitle: 'Lưu ý' },
  info: { icon: 'info', accent: 'text-blue-600', bg: 'bg-blue-50', defaultTitle: 'Thông báo' },
};

export function AppFeedbackProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const [toast, setToast] = React.useState<(ToastDetail & { id: number }) | null>(null);
  const automaticTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [confirmation, setConfirmation] = React.useState<ConfirmDetail | null>(null);

  React.useEffect(() => { setMounted(true); }, []);
  React.useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<ToastDetail>).detail;
      if (automaticTimer.current) clearTimeout(automaticTimer.current);
      // Page-specific wording overrides the generic API completion for the same action.
      if (detail.automatic) automaticTimer.current = setTimeout(() => setToast({ ...detail, id: Date.now() }), 200);
      else setToast({ ...detail, id: Date.now() });
    };
    const onConfirm = (event: Event) => setConfirmation((event as CustomEvent<ConfirmDetail>).detail);
    window.addEventListener(TOAST_EVENT, onToast);
    window.addEventListener(CONFIRM_EVENT, onConfirm);
    return () => {
      if (automaticTimer.current) clearTimeout(automaticTimer.current);
      window.removeEventListener(TOAST_EVENT, onToast);
      window.removeEventListener(CONFIRM_EVENT, onConfirm);
    };
  }, []);
  React.useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const closeConfirm = (answer: boolean) => {
    confirmation?.resolve(answer);
    setConfirmation(null);
  };

  const overlays = mounted ? ReactDOM.createPortal(
    <>
      {toast && (() => {
        const style = toastStyle[toast.kind ?? 'info'];
        return (
          <div role={toast.kind === 'error' ? 'alert' : 'status'} aria-live={toast.kind === 'error' ? 'assertive' : 'polite'} className="fixed right-4 top-20 z-[10000] w-[min(390px,calc(100vw-32px))] animate-in slide-in-from-top-3 fade-in">
            <div className="flex gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-[0_18px_55px_rgba(15,23,42,0.18)]">
              <AppIcon className={` !flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-center !leading-none ${style.bg} ${style.accent}`}>{style.icon}</AppIcon>
              <div className="min-w-0 flex-1"><p className="font-bold text-on-surface">{toast.title ?? style.defaultTitle}</p><p className="mt-0.5 text-sm leading-5 text-on-surface-variant">{toast.message}</p></div>
              <button type="button" onClick={() => setToast(null)} className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container" aria-label="Đóng"><AppIcon className=" text-[18px]">close</AppIcon></button>
            </div>
          </div>
        );
      })()}
      {confirmation && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-surface-container-lowest shadow-[0_28px_90px_rgba(15,23,42,0.28)]">
            <div className="p-6 text-center">
              <AppIcon className={` mx-auto !flex h-16 w-16 items-center justify-center rounded-2xl text-center text-[32px] !leading-none ${confirmation.tone === 'danger' ? 'bg-red-100 text-red-600' : confirmation.tone === 'primary' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>{confirmation.tone === 'danger' ? 'delete_forever' : confirmation.tone === 'primary' ? 'help' : 'warning'}</AppIcon>
              <h2 className="mt-4 text-xl font-bold text-on-surface">{confirmation.title ?? 'Xác nhận thao tác'}</h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{confirmation.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-outline-variant/50 bg-surface-container-low p-4">
              <button type="button" onClick={() => closeConfirm(false)} className="h-11 rounded-xl border border-outline-variant bg-white font-semibold text-on-surface hover:bg-slate-50">{confirmation.cancelLabel ?? 'Hủy'}</button>
              <button type="button" onClick={() => closeConfirm(true)} className={`h-11 rounded-xl font-semibold text-white shadow-sm ${confirmation.tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:opacity-90'}`}>{confirmation.confirmLabel ?? 'Xác nhận'}</button>
            </div>
          </div>
        </div>
      )}
    </>, document.body) : null;

  return <>{children}{overlays}</>;
}
