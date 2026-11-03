'use client';
import { LookupDialog } from '@/shared/ui/LookupDialog';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Languages, X } from 'lucide-react';
import { apiClient } from '@/shared/api/api-client';
import { usePronunciation } from '@/shared/lib/use-pronunciation';
import { isEnglishSelection } from '@/shared/lib/english-selection';
import { getSelectionContext } from '@/shared/lib/selection-context';

export type LookupResult = { translation: string | null; definitionEn?: string; contextExplanation?: string; source: string; message?: string; partOfSpeech?: string; pronunciationIpa?: string; contextual?: boolean; exampleEn?: string; exampleVi?: string; contextDependent?: boolean; standaloneMeaning?: string; sourceSentence?: string };
type Selection = { text: string; context: string; x: number; y: number };

export function SelectionTranslator() {
  const pathname = usePathname();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { speaking, speechError, play, stop: stopSpeech } = usePronunciation();
  const request = useRef(0);
  const popup = useRef<HTMLDivElement>(null);
  const cache = useRef(new Map<string, LookupResult>());

  const dismiss = () => { stopSpeech(); request.current++; setSelection(null); setLoading(false); openRef.current = false; setOpen(false); };
  const translate = async (picked: Selection, initial?: LookupResult) => {
    openRef.current = true; setOpen(true);
    const version = ++request.current;
    stopSpeech();
    setSelection(picked); setResult(initial ?? null); setError(''); setLoading(true);
    // Reviewed per-sentence senses must not be replaced by a generic dictionary response.
    if (initial?.source === 'reading' && initial.contextDependent && initial.sourceSentence && initial.standaloneMeaning) { setLoading(false); return; }
    try {
      const key = JSON.stringify([picked.text.toLocaleLowerCase('en'), picked.context]);
      const data = cache.current.get(key) ?? await apiClient.post<LookupResult>('/translation/selection', { text: picked.text, context: picked.context });
      if (version !== request.current) return;
      const resolved = initial && (!data.contextual || !data.translation) ? initial : data;
      if (resolved.translation) { if (cache.current.size >= 200) cache.current.clear(); cache.current.set(key, resolved); }
      setResult(resolved);
    } catch (cause: any) { if (version === request.current && !initial) setError(cause?.message ?? 'Chưa dịch được. Vui lòng thử lại.'); }
    finally { if (version === request.current) setLoading(false); }
  };

  const pronounce = () => { if (selection && !speaking) void play(selection.text); };

  useEffect(() => { dismiss(); }, [pathname]);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const inspect = () => {
      if (openRef.current) return;
      const selected = window.getSelection();
      if (!selected || selected.isCollapsed || !selected.rangeCount) { if (!popup.current?.contains(document.activeElement)) dismiss(); return; }
      const node = selected.anchorNode?.parentElement;
      if (node?.closest('[data-selection-translation]')) return;
      if (node?.closest('input, textarea, [contenteditable="true"]')) { dismiss(); return; }
      const learningContent = node?.closest('[data-learning-content]');
      const endContent = selected.focusNode?.parentElement?.closest('[data-learning-content]');
      if (!learningContent || learningContent !== endContent) { dismiss(); return; }
      const text = selected.toString().trim().replace(/\s+/g, ' ');
      if (!isEnglishSelection(text)) { dismiss(); return; }
      const context = getSelectionContext(selected.getRangeAt(0), learningContent);
      const rect = selected.getRangeAt(0).getBoundingClientRect();
      if (!rect.width && !rect.height) return;
      const width = Math.min(190, window.innerWidth - 24);
      setSelection({ text, context, x: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), y: Math.max(12, Math.min(rect.bottom + 10, window.innerHeight - 65)) });
    };
    const changed = () => { clearTimeout(timer); timer = setTimeout(inspect, 350); };
    const pointer = (event: PointerEvent) => { if (!popup.current?.contains(event.target as Node)) changed(); };
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { clearTimeout(timer); dismiss(); } };
    const scroll = (event: Event) => { if (openRef.current || (event.target instanceof Node && popup.current?.contains(event.target))) return; clearTimeout(timer); dismiss(); };
    const lookup = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (!detail || typeof detail.text !== 'string' || !isEnglishSelection(detail.text) || typeof detail.context !== 'string') return;
      clearTimeout(timer);
      void translate({ text: detail.text, context: detail.context, x: 12, y: 12 }, detail.result);
    };
    window.addEventListener('reading-lookup', lookup);
    document.addEventListener('selectionchange', changed);
    document.addEventListener('pointerup', pointer);
    document.addEventListener('keydown', key);
    window.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', scroll);
    return () => { window.removeEventListener('reading-lookup', lookup); clearTimeout(timer); document.removeEventListener('selectionchange', changed); document.removeEventListener('pointerup', pointer); document.removeEventListener('keydown', key); window.removeEventListener('scroll', scroll, true); window.removeEventListener('resize', scroll); request.current++; };
  }, []);

  if (!selection) return null;
  if (open) return <LookupDialog text={selection.text} context={selection.context} result={result} loading={loading} error={error} speaking={speaking} speechError={speechError} onPronounce={pronounce} onClose={dismiss} onRetry={() => void translate(selection)} />;
  return <div ref={popup} data-selection-translation role="toolbar" aria-label="Tra cứu từ đã chọn" style={{ left: selection.x, top: selection.y }} onMouseDown={event => event.preventDefault()} className="fixed z-[10000] flex items-center gap-2 rounded-xl border border-primary/20 bg-white p-2 text-on-surface shadow-xl">
    <button type="button" onClick={() => void translate(selection)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"><Languages size={16} />Tra cứu</button>
    <button type="button" onClick={dismiss} aria-label="Đóng tra cứu" className="rounded-lg p-2 hover:bg-slate-100"><X size={16} /></button>
  </div>;
}
