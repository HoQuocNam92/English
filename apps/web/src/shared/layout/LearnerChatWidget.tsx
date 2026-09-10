'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { apiClient } from '@/shared/api/api-client';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export function LearnerChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function send(event?: FormEvent, suggestion?: string) {
    event?.preventDefault();
    const content = (suggestion ?? input).trim();
    if (content.length < 2 || loading) return;
    setMessages(current => [...current, { role: 'user', content }]);
    setInput(''); setError(''); setLoading(true);
    try {
      const response = await apiClient.post<{ answer: string }>('/ai-chat/public', { content });
      setMessages(current => [...current, { role: 'assistant', content: response.answer }]);
    } catch (cause: any) {
      setError(cause.message || 'AI chưa thể phản hồi. Vui lòng thử lại.');
    } finally { setLoading(false); }
  }

  return <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3">
    {open && <section className="flex h-[min(620px,calc(100vh-110px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-[26px] border border-primary/20 bg-white shadow-2xl">
      <header className="flex items-center justify-between bg-gradient-to-r from-primary to-secondary px-5 py-4 text-white">
        <div><p className="font-black text-white">TechEnglish AI</p><p className="text-xs text-white/80">RAG theo học liệu đã duyệt</p></div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Đóng trợ lý AI" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"><span className="material-symbols-outlined !text-white">close</span></button>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto bg-surface-container-lowest p-4">
        {!messages.length && <div className="flex h-full flex-col items-center justify-center text-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"><span className="material-symbols-outlined text-[32px]">smart_toy</span></div><h3 className="mt-4 text-lg font-black">Bạn cần hỗ trợ gì?</h3><p className="mt-2 max-w-64 text-sm text-on-surface-variant">Hỏi bài, sửa câu hoặc giải thích từ vựng chuyên ngành.</p></div>}
        {messages.map((message, index) => <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md border border-outline-variant/40 bg-white text-on-surface shadow-sm'}`}>{message.content}</div></div>)}
        {loading && <div className="w-fit rounded-2xl rounded-bl-md border bg-white px-4 py-3 text-sm text-on-surface-variant">AI đang suy nghĩ…</div>}
      </div>
      {!messages.length && <div className="flex flex-wrap gap-2 border-t px-4 py-3">{['REST API là gì?', 'Giải thích rate limiting', 'Từ vựng DevOps'].map(item => <button type="button" key={item} onClick={() => void send(undefined, item)} className="rounded-full border border-primary/30 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5">{item}</button>)}</div>}
      {error && <p className="px-4 pt-2 text-xs text-error">{error}</p>}
      <form onSubmit={send} className="flex gap-2 border-t bg-white p-4"><input minLength={2} maxLength={600} value={input} onChange={event => setInput(event.target.value)} placeholder="Nhập câu hỏi…" className="min-w-0 flex-1 rounded-2xl border border-outline-variant px-4 py-3 text-sm outline-none focus:border-primary" /><button disabled={loading || input.trim().length < 2} aria-label="Gửi câu hỏi" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"><span className="material-symbols-outlined !text-white">send</span></button></form>
    </section>}
    <button type="button" onClick={() => setOpen(value => !value)} aria-label={open ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'} className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl ring-4 ring-white transition hover:scale-105"><span className="material-symbols-outlined text-[28px] !text-white">{open ? 'close' : 'chat_bubble'}</span></button>
  </div>;
}
