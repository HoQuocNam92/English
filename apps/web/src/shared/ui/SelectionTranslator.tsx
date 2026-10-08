'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Languages, X, RotateCcw, Volume2 } from 'lucide-react';
import { apiClient } from '@/shared/api/api-client';
import { isEnglishSelection } from '@/shared/lib/english-selection';

type Result = { translation: string | null; definitionEn?: string; source: string; message?: string; partOfSpeech?: string; pronunciationIpa?: string; contextual?: boolean };
type Selection = { text: string; context: string; x: number; y: number };

export function SelectionTranslator() {
  const pathname = usePathname();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const player = useRef<HTMLAudioElement | null>(null);
  const speechRequest = useRef(0);
  const request = useRef(0);
  const popup = useRef<HTMLDivElement>(null);
  const cache = useRef(new Map<string, Result>());

  const stopSpeech = () => { speechRequest.current++; player.current?.pause(); player.current = null; setSpeaking(false); };
  const dismiss = () => { stopSpeech(); request.current++; setSelection(null); setLoading(false); };
  const translate = async (picked: Selection) => {
    const version = ++request.current;
    stopSpeech(); setSpeechError('');
    setSelection(picked); setResult(null); setError(''); setLoading(true);
    try {
      const key = JSON.stringify([picked.text.toLocaleLowerCase('en'), picked.context]);
      const data = cache.current.get(key) ?? await apiClient.post<Result>('/translation/selection', { text: picked.text, context: picked.context });
      if (version !== request.current) return;
      if (data.translation) { if (cache.current.size >= 200) cache.current.clear(); cache.current.set(key, data); }
      setResult(data);
    } catch (cause: any) { if (version === request.current) setError(cause?.message ?? 'Chưa dịch được. Vui lòng thử lại.'); }
    finally { if (version === request.current) setLoading(false); }
  };

  const pronounce = async () => {
    if (!selection || speaking) return;
    const version = ++speechRequest.current;
    setSpeaking(true); setSpeechError('');
    try {
      const data = await apiClient.post<{ audio: string; mimeType: string }>('/translation/pronunciation', { text: selection.text });
      if (version !== speechRequest.current) return;
      const audio = new Audio(`data:${data.mimeType};base64,${data.audio}`);
      player.current = audio;
      audio.onended = () => { if (version === speechRequest.current) setSpeaking(false); };
      audio.onerror = () => { if (version === speechRequest.current) { setSpeaking(false); setSpeechError('Không phát được âm thanh. Vui lòng thử lại.'); } };
      await audio.play();
    } catch (cause: any) {
      if (version === speechRequest.current) { setSpeaking(false); setSpeechError(cause?.name === 'NotAllowedError' ? 'Trình duyệt đang chặn âm thanh. Cho phép âm thanh cho trang này rồi thử lại.' : cause?.message ?? 'Chưa phát được. Vui lòng thử lại.'); }
    }
  };
  useEffect(() => () => { speechRequest.current++; player.current?.pause(); }, []);

  useEffect(() => { dismiss(); }, [pathname]);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const inspect = () => {
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
      const block = node?.closest('p, li, h1, h2, h3, h4, td, blockquote');
      const surrounding = (block?.textContent ?? text).replace(/\s+/g, ' ').trim();
      const offset = surrounding.indexOf(text);
      const context = surrounding.slice(Math.max(0, offset - 500), Math.max(0, offset - 500) + 1600);
      const rect = selected.getRangeAt(0).getBoundingClientRect();
      if (!rect.width && !rect.height) return;
      const width = Math.min(340, window.innerWidth - 24);
      void translate({ text, context, x: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), y: Math.max(12, Math.min(rect.bottom + 10, window.innerHeight - 250)) });
    };
    const changed = () => { clearTimeout(timer); timer = setTimeout(inspect, 350); };
    const pointer = (event: PointerEvent) => { if (!popup.current?.contains(event.target as Node)) changed(); };
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { clearTimeout(timer); dismiss(); } };
    const scroll = () => { clearTimeout(timer); dismiss(); };
    document.addEventListener('selectionchange', changed);
    document.addEventListener('pointerup', pointer);
    document.addEventListener('keydown', key);
    window.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', scroll);
    return () => { clearTimeout(timer); document.removeEventListener('selectionchange', changed); document.removeEventListener('pointerup', pointer); document.removeEventListener('keydown', key); window.removeEventListener('scroll', scroll, true); window.removeEventListener('resize', scroll); request.current++; };
  }, []);

  if (!selection) return null;
  return <div ref={popup} data-selection-translation role="dialog" aria-label="Dịch nghĩa đoạn được chọn" style={{ left: selection.x, top: selection.y }} className="fixed z-[10000] max-h-[240px] w-[340px] max-w-[calc(100vw-24px)] overflow-y-auto rounded-2xl border border-primary/20 bg-white p-4 text-on-surface shadow-xl">
    <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-xs font-bold text-primary"><Languages size={16} />Anh → Việt</span><button onClick={dismiss} aria-label="Đóng bản dịch" className="rounded-lg p-1 hover:bg-slate-100"><X size={16} /></button></div>
    <p className="mt-2 line-clamp-3 text-sm font-bold">{selection.text}</p>
    {!loading && result?.translation && <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">{result.partOfSpeech && <span>{result.partOfSpeech}</span>}{result.pronunciationIpa && <span>{result.pronunciationIpa}</span>}<button aria-label="Nghe phát âm" disabled={speaking} onClick={() => void pronounce()} className="inline-flex items-center gap-1 text-primary"><Volume2 size={15} />{speaking ? 'Đang phát…' : 'Nghe'}</button></div>}
    {speechError && <p role="alert" className="mt-2 text-xs text-red-600">{speechError}</p>}
    <div aria-live="polite" className="mt-3 text-sm leading-6">{loading ? 'Đang dịch…' : error ? <><p className="text-red-600">{error}</p><button onClick={() => void translate(selection)} className="mt-2 inline-flex items-center gap-1 font-semibold text-primary"><RotateCcw size={14} />Thử lại</button></> : <><p>{result?.translation ?? result?.message}</p>{result?.definitionEn && <p className="mt-2 text-xs text-slate-500">{result.definitionEn}</p>}{result?.translation && <p className="mt-2 text-[10px] text-slate-400">{result.source === 'dictionary' ? 'Nghĩa từ điển chuyên ngành' : result.contextual ? 'Nghĩa theo ngữ cảnh · AI' : 'Nghĩa tham khảo · AI'}</p>}</>}</div>
  </div>;
}
