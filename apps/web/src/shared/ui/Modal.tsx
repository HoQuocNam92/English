'use client';

import * as React from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Max width class, e.g. 'max-w-md', 'max-w-lg', 'max-w-xl'. Default: 'max-w-lg' */
  maxWidth?: string;
}

/**
 * Shared modal wrapper that portals content to document.body.
 * Uses useEffect to ensure client-side mounting and avoid SSR mismatch.
 */
export function Modal({ open, onClose, children, maxWidth = 'max-w-lg' }: ModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!mounted || !open) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      className="p-4"
    >
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0 }}
        className="bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        className={`relative w-full ${maxWidth} bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant max-h-[90vh] overflow-y-auto`}
        style={{
          position: 'absolute',
          zIndex: 1,
          top: '50%',
          left: '50%',
          width: 'min(42rem, calc(100vw - 32px))',
          maxWidth: 'none',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {children}
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
}
