'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type Annotation = { start: number; end: number; term: string; definitionVi: string; definitionEn?: string };
export function ReadingGlossary({ text, glossary }: { text: string; glossary?: unknown }) {
  const [active, setActive] = useState<number | null>(null);
  const [position, setPosition] = useState({ left: 12, top: 12 });
  useEffect(() => {
    if (active === null) return;
    const close = () => setActive(null);
    const outside = (event: PointerEvent) => { if (!(event.target as Element)?.closest('[data-it-glossary]')) close(); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [active]);
  const data = glossary as { text?: string; annotations?: Annotation[] } | undefined;
  if (data?.text !== text || !Array.isArray(data.annotations)) return <>{text}</>;
  const parts = [];
  let cursor = 0;
  for (const [index, item] of data.annotations.entries()) {
    if (!Number.isInteger(item.start) || !Number.isInteger(item.end) || item.start < cursor || item.end > text.length || item.end <= item.start || text.slice(item.start, item.end) !== item.term || typeof item.definitionVi !== 'string') continue;
    parts.push(text.slice(cursor, item.start));
    parts.push(<button key={index} data-it-glossary type="button" aria-expanded={active === index} aria-label={`Xem nghĩa IT: ${item.term}`} onClick={event => {
      const rect = event.currentTarget.getBoundingClientRect();
      setPosition({ left: Math.max(12, Math.min(rect.left, window.innerWidth - 300)), top: Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - 252)) });
      setActive(active === index ? null : index);
    }} className="rounded bg-amber-100 px-0.5 font-semibold text-inherit underline decoration-amber-500 decoration-dotted underline-offset-4 hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{item.term}</button>);
    cursor = item.end;
  }
  parts.push(text.slice(cursor));
  const selected = active === null ? undefined : data.annotations[active];
  return <>{parts}{selected && createPortal(<div data-it-glossary role="status" style={position} className="fixed z-[10001] max-h-60 w-72 max-w-[calc(100vw-24px)] overflow-y-auto rounded-xl border border-primary/20 bg-white p-4 text-left text-sm font-normal leading-6 text-slate-800 shadow-lg"><p className="text-xs font-bold text-primary">Nghĩa IT trong bài · {selected.term}</p><p className="mt-1">{selected.definitionVi}</p>{selected.definitionEn && <p className="mt-1 text-xs text-slate-500">{selected.definitionEn}</p>}<button type="button" onClick={() => setActive(null)} className="mt-2 text-xs font-semibold text-primary">Đóng</button></div>, document.body)}</>;
}
