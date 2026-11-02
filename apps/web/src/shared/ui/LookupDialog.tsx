'use client';
import { useEffect, useRef } from 'react';
import { Lightbulb, RotateCcw, Volume2, X } from 'lucide-react';
import type { LookupResult } from './SelectionTranslator';

type Props = {
  text: string; context: string; result: LookupResult | null; loading: boolean; error: string;
  speaking: boolean; speechError: string; onPronounce: () => void; onClose: () => void; onRetry: () => void;
};
function Field({ label, value, wide = false }: { label: string; value?: string | null; wide?: boolean }) {
  return <div className={wide ? 'sm:col-span-2' : ''}><p className="mb-1 text-sm font-semibold text-slate-600">{label}</p><div className="min-h-11 whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-900">{value || '—'}</div></div>;
}
export function LookupDialog(props: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef(props.onClose);
  close.current = props.onClose;
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.showModal();
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);
  const result = props.result;
  return <dialog ref={dialog} data-selection-translation aria-label="Tra cứu từ theo ngữ cảnh" onCancel={event => { event.preventDefault(); close.current(); }} onClick={event => { if (event.target === dialog.current) { const rect = dialog.current.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close.current(); } }} className="m-auto max-h-[90dvh] w-[680px] max-w-[calc(100vw-24px)] overflow-y-auto rounded-2xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm">
    <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4"><h2 className="font-bold">Tra cứu theo ngữ cảnh</h2><button type="button" autoFocus onClick={props.onClose} aria-label="Đóng hộp tra cứu" className="rounded-lg p-2 hover:bg-slate-100"><X size={18} /></button></div>
    <div className="space-y-4 p-5" aria-busy={props.loading}>
      <div aria-live="polite" className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-sm leading-6 text-blue-800"><Lightbulb size={18} className="mt-1 shrink-0" /><p>{props.loading ? 'Đang tra nghĩa theo câu và đoạn văn…' : result?.contextExplanation || (result?.contextual ? 'Nghĩa phù hợp với ngữ cảnh của đoạn đang đọc.' : 'Nghĩa tham khảo từ từ điển.')}</p></div>
      {props.error && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700"><p>{props.error}</p><button type="button" onClick={props.onRetry} className="mt-2 inline-flex items-center gap-2 font-semibold"><RotateCcw size={15} />Thử lại</button></div>}
      <div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><div className="mb-1 flex items-center gap-3"><p className="text-sm font-semibold text-slate-600">Từ / cụm từ</p><button type="button" disabled={props.speaking} onClick={props.onPronounce} aria-label="Nghe phát âm" className="inline-flex items-center gap-1 text-xs text-primary"><Volume2 size={15} />{props.speaking ? 'Đang phát…' : 'Nghe'}</button></div><div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-semibold">{props.text}</div></div>
        <Field label="Từ loại" value={result?.partOfSpeech} /><Field label="Phiên âm (IPA)" value={result?.pronunciationIpa} />
        <Field label="Nghĩa tiếng Việt" value={result?.translation ?? result?.message} /><Field label="Định nghĩa tiếng Anh" value={result?.definitionEn} />
        <Field label="Ví dụ (EN)" value={result?.exampleEn} /><Field label="Dịch ví dụ (VI)" value={result?.exampleVi} />
      </div>
      {props.speechError && <p role="alert" className="text-sm text-red-600">{props.speechError}</p>}
      <details className="rounded-xl border border-slate-200 p-3 text-sm"><summary className="cursor-pointer font-semibold text-slate-600">Ngữ cảnh trong bài</summary><p className="mt-2 whitespace-pre-wrap leading-7 text-slate-600">{props.context}</p></details>
    </div>
    <div className="sticky bottom-0 flex justify-end border-t border-slate-100 bg-white px-5 py-4"><button type="button" onClick={props.onClose} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white">Đóng</button></div>
  </dialog>;
}
