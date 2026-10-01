'use client';

import { LevelBadge } from '@/shared/ui/LevelBadge';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';

interface PlacementQuestion {
  id: string;
  prompt: string;
  context?: string | null;
  options: Array<{ id: string; key: string; text: string }>;
}

interface PlacementResult {
  correct: number;
  total: number;
  percent: number;
  levelCode: string;
  levelName: string;
}

export default function PlacementTestPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<PlacementResult | null>(null);

  const destination = useMemo(() => {
    if (typeof window === 'undefined') return '/learn';
    const requested = new URLSearchParams(window.location.search).get('next');
    return requested?.startsWith('/learn') ? requested : '/learn';
  }, []);

  useEffect(() => {
    apiClient.get<{ data: PlacementQuestion[] }>('/placement-test')
      .then(response => setQuestions((response?.data ?? []).slice(0, 15)))
      .catch(error => setError(error instanceof Error ? error.message : 'Không thể tải bài kiểm tra.'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (Object.keys(answers).length !== questions.length) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await apiClient.post<PlacementResult>('/placement-test/submit', {
        answers: questions.map(question => ({ questionId: question.id, optionId: answers[question.id] })),
      });
      setResult(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Không thể chấm bài kiểm tra.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-surface"><LoadingSpinner /></main>;

  if (result) {
    return <main className="min-h-screen bg-surface px-5 py-10"><section className="mx-auto max-w-xl rounded-3xl border border-outline-variant bg-white p-8 text-center shadow-sm"><span className="material-symbols-outlined text-6xl text-primary">verified</span><p className="mt-4 text-xs font-bold uppercase tracking-wider text-primary">Kết quả kiểm tra</p><h1 className="mt-2 text-3xl font-black text-on-surface">Trình độ đề xuất: <LevelBadge level={result.levelName} className="text-lg" /></h1><p className="mt-3 text-sm text-on-surface-variant">Bạn trả lời đúng {result.correct}/{result.total} câu ({result.percent}%). Hệ thống đã dùng kết quả này để điều chỉnh lộ trình.</p><button type="button" onClick={() => router.replace(destination)} className="mt-8 rounded-xl bg-primary px-7 py-3 text-sm font-bold text-white">Bắt đầu học</button></section></main>;
  }

  return <main className="min-h-screen bg-surface px-5 py-8"><div className="mx-auto max-w-3xl"><div className="mb-7"><p className="text-xs font-bold uppercase tracking-wider text-primary">Kiểm tra đầu vào</p><h1 className="mt-1 text-3xl font-black text-on-surface">Xác định trình độ tiếng Anh</h1><p className="mt-2 text-sm text-on-surface-variant">{questions.length} câu · khoảng 5 phút · trả lời theo khả năng hiện tại của bạn</p></div>{questions.length === 0 ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900"><p>Hiện chưa có câu hỏi xếp trình độ.</p><button type="button" onClick={() => router.replace(destination)} className="mt-4 font-bold text-primary">Bỏ qua và bắt đầu học →</button></div> : <div className="space-y-5">{questions.map((question, index) => <section key={question.id} className="rounded-2xl border border-outline-variant bg-white p-5"><p className="text-xs font-bold text-primary">Câu {index + 1}/{questions.length}</p>{question.context && <p className="mt-3 rounded-lg bg-surface-container p-3 text-sm text-on-surface-variant">{question.context}</p>}<h2 className="mt-3 text-base font-bold text-on-surface">{question.prompt}</h2><div className="mt-4 grid gap-2">{question.options.map(option => <label key={option.id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm transition-colors ${answers[question.id] === option.id ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'}`}><input type="radio" name={question.id} checked={answers[question.id] === option.id} onChange={() => setAnswers(current => ({ ...current, [question.id]: option.id }))} /><span><strong className="mr-2 text-primary">{option.key}.</strong>{option.text}</span></label>)}</div></section>)}{error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}<div className="sticky bottom-4 flex items-center justify-between rounded-2xl border border-outline-variant bg-white/95 p-4 shadow-lg backdrop-blur"><span className="text-sm font-semibold text-on-surface-variant">Đã trả lời {Object.keys(answers).length}/{questions.length}</span><button type="button" disabled={submitting || Object.keys(answers).length !== questions.length} onClick={submit} className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white disabled:opacity-40">{submitting ? 'Đang chấm...' : 'Xem kết quả'}</button></div></div>}</div></main>;
}
