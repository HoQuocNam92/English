'use client';

import { useEffect, useRef, useState } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';

type Mode = 'qa' | 'vocabulary';
type Message = { id: string; role: 'user' | 'assistant'; content: string; metadata?: any };
const modes: Array<{ id: Mode; label: string; icon: string }> = [
  { id: 'qa', label: 'Hỏi theo tài liệu', icon: 'menu_book' },
  { id: 'vocabulary', label: 'Giải thích từ vựng', icon: 'translate' },
];
const modeCopy: Record<Mode, { heading: string; example: string; placeholder: string }> = {
  qa: { heading: 'Hỏi AI về tiếng Anh chuyên ngành IT', example: 'Ví dụ: “Khi nào dùng do và make?”', placeholder: 'Nhập câu hỏi tiếng Anh của bạn…' },
  vocabulary: { heading: 'Học từ vựng theo cụm và ngữ cảnh', example: 'Ví dụ: nhập “deploy” hoặc “production environment”.', placeholder: 'Nhập từ hoặc cụm từ cần học…' },
};

export default function AiCoachPage() {
  const [mode, setMode] = useState<Mode>('qa');
  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedText, setSelectedText] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savedTerms, setSavedTerms] = useState<Record<string, boolean>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { void startConversation(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  async function startConversation(selectedMode: Mode = mode) {
    setError(''); setQuiz(null); setMessages([]); setAnswers({}); setInput(''); setConversationId('');
    try {
      const lessonId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('lessonId') : null;
      const conversation: any = await apiClient.post('/ai-chat/conversations', { mode: selectedMode, lessonId: lessonId || undefined });
      setConversationId(conversation.id);
    } catch (err: any) { setError(err.message || 'Không thể bắt đầu cuộc trò chuyện.'); }
  }

  async function send(content = input, action?: 'grammar_check' | 'translate') {
    if (!content.trim() || loading || !conversationId) return;
    const optimistic: Message = { id: `local-${Date.now()}`, role: 'user', content };
    if (!action) { setMessages((current) => [...current, optimistic]); setInput(''); }
    setLoading(true); setError('');
    try {
      const response: any = await apiClient.post(`/ai-chat/conversations/${conversationId}/messages`, { content, mode, action });
      setMessages((current) => [...current, { ...response.message, metadata: { ...(response.message.metadata ?? {}), citations: response.result?.citations ?? [] } }]);
    } catch (err: any) {
      setError(err.message || 'Groq chưa phản hồi. Vui lòng thử lại.');
    } finally { setLoading(false); }
  }

  async function generateQuiz() {
    if (!conversationId || loading) return;
    if (!messages.length) { setError('Hãy trò chuyện hoặc sửa ít nhất một câu trước khi tạo Quiz.'); return; }
    setLoading(true); setError('');
    try { setQuiz(await apiClient.post(`/ai-chat/conversations/${conversationId}/quiz`, {})); }
    catch (err: any) { setError(err.message || 'Không thể tạo quiz.'); }
    finally { setLoading(false); }
  }

  function changeMode(next: Mode) {
    if (next === mode && !quiz) return;
    setMode(next); void startConversation(next);
  }

  async function sendFeedback(messageId: string, helpful: boolean) {
    try { await apiClient.post(`/ai-chat/messages/${messageId}/feedback`, { helpful }); }
    catch (err: any) { setError(err.message || 'Không thể gửi phản hồi.'); }
  }

  function speak(text: string) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }

  async function saveVocabulary(item: any) {
    const key = `${item.term}-${item.phrase || ''}`;
    try { await apiClient.post('/ai-chat/saved-vocabulary', { ...item, note: notes[key] || '' }); setSavedTerms((current) => ({ ...current, [key]: true })); }
    catch (err: any) { setError(err.message || 'Không thể lưu từ vựng.'); }
  }

  function captureSelection() {
    const text = window.getSelection()?.toString().trim() || '';
    setSelectedText(text.length >= 2 && text.length <= 500 ? text : '');
  }

  const score = quiz?.questions?.reduce((total: number, question: any) => total + (answers[question.id] === question.correctIndex ? 1 : 0), 0) ?? 0;

  return (
    <LearnerShell>
      <div className="mx-auto w-full min-w-0 max-w-5xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div><h1 className="text-2xl font-bold">AI Tutor RAG</h1><p className="mt-1 text-sm text-on-surface-variant">Câu trả lời chỉ dựa trên lesson và từ vựng đã được duyệt, kèm nguồn kiểm chứng.</p></div>
          <button onClick={() => startConversation()} className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-semibold hover:bg-surface-container">Cuộc trò chuyện mới</button>
        </div>

        <div className="flex flex-wrap gap-2 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-2">
          {modes.map((item) => { const active = item.id === mode; return <button type="button" aria-pressed={active} key={item.id} onClick={() => changeMode(item.id)} className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${active ? 'border-indigo-700 bg-indigo-600 text-white shadow-sm' : 'border-transparent text-on-surface hover:border-outline-variant hover:bg-surface-container'}`}><span className="material-symbols-outlined text-[19px]">{item.icon}</span>{item.label}</button>; })}
        </div>

        <section className="flex min-h-[620px] flex-col overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest shadow-sm">
          <div className="border-b border-outline-variant/40 px-5 py-4"><span className="font-semibold text-primary">AI:</span> {modeCopy[mode].heading}</div>
          <div onMouseUp={captureSelection} className="relative w-full min-w-0 flex-1 space-y-5 overflow-y-auto p-5">
            {selectedText && <div className="sticky top-0 z-20 mx-auto flex w-fit max-w-full items-center gap-2 rounded-xl border border-indigo-200 bg-white p-2 shadow-lg"><span className="max-w-48 truncate px-2 text-xs">“{selectedText}”</span><button type="button" onClick={() => { void send(selectedText, 'translate'); setSelectedText(''); }} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">Dịch nghĩa</button><button type="button" onClick={() => { void send(`Hãy giải thích từ hoặc cụm từ này trong ngữ cảnh tiếng Anh IT: ${selectedText}`); setSelectedText(''); }} className="rounded-lg border border-indigo-300 px-3 py-2 text-xs font-semibold text-indigo-700">AI giải thích</button><button type="button" onClick={() => setSelectedText('')} className="material-symbols-outlined text-[18px] text-on-surface-variant">close</button></div>}
            {!messages.length && !quiz && <div className="mx-auto mt-20 w-full px-6 text-center text-on-surface-variant" style={{ maxWidth: '28rem' }}><span className="material-symbols-outlined mb-3 block text-5xl text-primary">psychology</span><p className="w-full leading-6">{modeCopy[mode].example}</p></div>}
            {messages.map((message) => <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${message.role === 'user' ? 'rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-white' : 'space-y-3 rounded-2xl rounded-bl-sm bg-surface-container px-4 py-3'}`}>
                <p className="whitespace-pre-wrap leading-7">{message.content}</p>
                {message.metadata?.correctedText && <div className="rounded-lg bg-white/80 p-3"><p className="text-red-600">❌ {message.metadata.errors?.[0]?.original}</p><p className="text-green-700">✅ {message.metadata.correctedText}</p></div>}
                {message.metadata?.translationVi && <p className="rounded-lg bg-white/80 p-3 text-sm">🇻🇳 {message.metadata.translationVi}</p>}
                {message.metadata?.errors?.map((item: any, index: number) => <div key={index} className="border-l-2 border-amber-500 pl-3 text-sm"><b>{item.category}:</b> {item.explanationVi}</div>)}
                {message.metadata?.vocabulary?.map((item: any, index: number) => { const key = `${item.term}-${item.phrase || ''}`; return <div key={index} className="rounded-xl border border-violet-200 bg-white p-4 text-on-surface">
                  <div className="flex justify-between gap-3"><div><b className="text-lg">{item.phrase || item.term}</b><p className="text-sm text-primary">{item.pronunciation} · {item.partOfSpeech} · {item.level}</p></div><div className="flex gap-1"><button type="button" onClick={() => speak(item.phrase || item.term)} title="Nghe phát âm" className="material-symbols-outlined rounded-full p-2 text-primary hover:bg-violet-50">volume_up</button><button type="button" onClick={() => saveVocabulary(item)} title="Lưu từ vựng và ghi chú" className="material-symbols-outlined rounded-full p-2 text-primary hover:bg-violet-50">{savedTerms[key] ? 'bookmark_added' : 'bookmark_add'}</button></div></div>
                  <p className="mt-2">{item.meaningVi}</p>{item.example && <p className="mt-2 text-sm italic">{item.example}</p>}
                  {!!item.collocations?.length && <div className="mt-2 flex flex-wrap gap-1">{item.collocations.map((word: string) => <span key={word} className="rounded-full bg-violet-50 px-2 py-1 text-xs">{word}</span>)}</div>}
                  <textarea value={notes[key] || ''} onChange={(event) => setNotes((current) => ({ ...current, [key]: event.target.value }))} maxLength={2000} rows={2} placeholder="Ghi chú của bạn cho từ này…" className="mt-3 w-full resize-none rounded-lg border border-violet-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-200" />
                  {savedTerms[key] && <p className="mt-1 text-xs text-green-700">Đã lưu từ vựng và ghi chú.</p>}
                </div>; })}
                {message.role === 'assistant' && !!message.metadata?.citations?.length && <div className="border-t border-outline-variant/50 pt-3"><p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Nguồn tham khảo</p><div className="mt-2 space-y-2">{message.metadata.citations.map((citation: any) => <a key={`${citation.sourceType}-${citation.sourceId}`} href={citation.lessonId ? `/learn/lessons/${citation.lessonId}` : '#'} className="block rounded-lg bg-white p-2 text-xs text-primary"><b>[{citation.rank}] {citation.title}</b><span className="mt-1 block text-on-surface-variant">{citation.excerpt}</span></a>)}</div><div className="mt-2 flex gap-2"><button type="button" onClick={() => sendFeedback(message.id, true)} className="rounded-full bg-white px-3 py-1 text-xs">Hữu ích</button><button type="button" onClick={() => sendFeedback(message.id, false)} className="rounded-full bg-white px-3 py-1 text-xs">Chưa đúng</button></div></div>}
                {message.role === 'user' && <div className="mt-2 flex flex-wrap gap-2 text-xs text-on-surface">
                  <button onClick={() => send(message.content, 'grammar_check')} className="rounded-full bg-white px-3 py-1.5">Kiểm tra ngữ pháp</button>
                  <button onClick={() => send(message.content, 'translate')} className="rounded-full bg-white px-3 py-1.5">Dịch nghĩa</button>
                  <button onClick={() => speak(message.content)} className="rounded-full bg-white px-3 py-1.5">Nghe phát âm</button>
                </div>}
              </div>
            </div>)}

            {quiz && <div className="space-y-4"><div className="flex justify-between"><h2 className="text-xl font-bold">{quiz.title}</h2><span className="font-bold text-primary">{Object.keys(answers).length === 5 ? `${score}/5` : `${Object.keys(answers).length}/5 đã trả lời`}</span></div>
              {quiz.questions.map((question: any, index: number) => <div key={question.id} className="rounded-xl border border-outline-variant/50 p-4"><p className="font-semibold">{index + 1}. {question.question}</p><div className="mt-3 grid gap-2">{question.options.map((option: string, optionIndex: number) => <button key={option} onClick={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} className={`rounded-lg border p-3 text-left text-sm ${answers[question.id] === optionIndex ? 'border-primary bg-primary/10' : 'border-outline-variant/50'}`}>{option}</button>)}</div>{answers[question.id] !== undefined && <p className={`mt-3 text-sm ${answers[question.id] === question.correctIndex ? 'text-green-700' : 'text-red-700'}`}>{answers[question.id] === question.correctIndex ? 'Chính xác. ' : `Đáp án đúng: ${question.options[question.correctIndex]}. `}{question.explanationVi}</p>}</div>)}
            </div>}
            {loading && <div className="flex items-center gap-2 text-sm text-on-surface-variant"><span className="h-2 w-2 animate-pulse rounded-full bg-primary"/>AI đang suy nghĩ…</div>}
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <div ref={bottomRef}/>
          </div>
          {!quiz && <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="flex w-full min-w-0 gap-3 border-t border-outline-variant/40 p-4"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); } }} rows={2} maxLength={4000} placeholder={modeCopy[mode].placeholder} className="min-w-0 flex-1 resize-none rounded-xl border border-outline-variant px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"/><button disabled={loading || !input.trim() || !conversationId} className="shrink-0 rounded-xl bg-primary px-5 font-semibold text-white disabled:opacity-50">Gửi</button></form>}
        </section>
      </div>
    </LearnerShell>
  );
}
