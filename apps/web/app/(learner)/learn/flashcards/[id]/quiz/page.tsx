'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';

interface QuizQuestion {
  type: 'fill_blank' | 'multiple_choice';
  vocabularyId: string;
  prompt: string;
  hint?: string;
  options?: string[];
  answer: string;
}

export default function VocabularyQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const lessonId = unwrappedParams.id;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizResults, setQuizResults] = useState<{ vocabId: string; term: string; correct: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<'quiz' | 'summary'>('quiz');

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Get session words for this lesson
      const sessionRes: any = await apiClient.get(
        lessonId === 'all' ? '/vocab-study/session' : `/vocab-study/session?lessonId=${lessonId}`
      );
      const words = sessionRes?.words ?? [];
      if (!words.length) {
        setError('Không có từ vựng nào để kiểm tra.');
        return;
      }
      const ids = words.slice(0, 20).map((w: any) => w.id);
      const quizRes: any = await apiClient.get(`/vocab-study/quiz?ids=${ids.join(',')}`);
      setQuestions(quizRes?.questions ?? []);
      setQuizIdx(0);
      setUserAnswer('');
      setSelectedOption(null);
      setShowResult(false);
      setQuizResults([]);
      setPhase('quiz');
    } catch {
      setError('Không thể tải bài kiểm tra.');
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (lessonId) loadQuiz();
  }, [lessonId, loadQuiz]);

  const submitAnswer = async () => {
    const q = questions[quizIdx];
    if (!q) return;
    const ans = q.type === 'fill_blank' ? userAnswer.trim() : selectedOption ?? '';
    const isCorrect = ans.toLowerCase() === q.answer.toLowerCase();
    setShowResult(true);
    const result = { vocabId: q.vocabularyId, term: q.answer, correct: isCorrect };
    setQuizResults(prev => [...prev, result]);
    try {
      await apiClient.post('/vocab-study/answer', { vocabularyId: q.vocabularyId, isCorrect });
    } catch {
      /* best-effort */
    }
  };

  const nextQuestion = () => {
    if (quizIdx + 1 < questions.length) {
      setQuizIdx(quizIdx + 1);
      setUserAnswer('');
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setPhase('summary');
    }
  };

  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;
  if (error || questions.length === 0) {
    return (
      <LearnerShell>
        <div className="p-8 text-center text-slate-500 space-y-4">
          <p>{error || 'Không có câu hỏi nào.'}</p>
          <Link href={`/learn/flashcards/${lessonId}`} className="inline-block px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold">
            Về bài học
          </Link>
        </div>
      </LearnerShell>
    );
  }

  const currentQ = questions[quizIdx];

  if (phase === 'summary') {
    const total = quizResults.length;
    const correctCount = quizResults.filter(r => r.correct).length;
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <LearnerShell>
        <div className="space-y-8 w-full max-w-3xl mx-auto py-8">
          <div className="text-center space-y-3">
            <div className={`mx-auto w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center ${pct >= 80 ? 'border-green-400' : pct >= 50 ? 'border-amber-400' : 'border-red-400'}`}>
              <span className="text-3xl">{pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚'}</span>
              <span className="text-2xl font-black text-slate-900">{correctCount}/{total}</span>
              <span className="text-xs text-slate-500">câu đúng</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              {pct >= 80 ? 'Xuất sắc!' : pct >= 50 ? 'Khá tốt!' : 'Cần ôn thêm!'}
            </h1>
            <p className="text-sm text-slate-500">
              Bạn đã hoàn thành bài kiểm tra ({pct}% chính xác)
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {quizResults.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <span className={`material-symbols-outlined ${r.correct ? 'text-green-500' : 'text-red-500'}`}>
                  {r.correct ? 'check_circle' : 'cancel'}
                </span>
                <span className="flex-1 font-semibold text-slate-800">{r.term}</span>
                <span className={`text-xs font-bold ${r.correct ? 'text-green-600' : 'text-red-500'}`}>
                  {r.correct ? 'Đúng' : 'Sai'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button onClick={loadQuiz} className="flex-1 py-3.5 rounded-xl text-sm font-black bg-primary hover:bg-indigo-700 !text-white transition-colors shadow-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base !text-white">replay</span>
              <span className="!text-white">Làm lại</span>
            </button>
            <Link href={`/learn/flashcards/${lessonId}`} className="flex-1 py-3.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-center">
              Về trang bài học
            </Link>
          </div>
        </div>
      </LearnerShell>
    );
  }

  const isCorrectAnswer = showResult && (
    currentQ.type === 'fill_blank'
      ? userAnswer.trim().toLowerCase() === currentQ.answer.toLowerCase()
      : selectedOption?.toLowerCase() === currentQ.answer.toLowerCase()
  );

  return (
    <LearnerShell>
      <div className="space-y-6 w-full max-w-3xl mx-auto py-8">
        <div className="flex justify-between items-center">
          <div>
            <Link href={`/learn/flashcards/${lessonId}`} className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1 mb-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Về bài học
            </Link>
            <h1 className="text-2xl font-black text-slate-900">Kiểm tra từ vựng</h1>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
            Câu {quizIdx + 1}/{questions.length}
          </span>
        </div>

        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${((quizIdx + 1) / questions.length) * 100}%` }} />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {currentQ.type === 'fill_blank' ? 'Điền từ vào chỗ trống' : 'Chọn từ đúng cho nghĩa'}
          </p>
          <p className="text-xl font-black text-slate-900 leading-relaxed">{currentQ.prompt}</p>
          {currentQ.hint && <p className="text-sm text-slate-500 italic">💡 {currentQ.hint}</p>}

          {currentQ.type === 'fill_blank' && (
            <input
              type="text"
              autoFocus
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && userAnswer.trim() && !showResult) submitAnswer(); }}
              disabled={showResult}
              placeholder="Nhập từ tiếng Anh..."
              className={`w-full px-5 py-4 rounded-xl border-2 text-lg font-bold transition-colors outline-none ${
                showResult
                  ? isCorrectAnswer ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'
                  : 'border-slate-200 focus:border-primary bg-slate-50'
              }`}
            />
          )}

          {currentQ.type === 'multiple_choice' && currentQ.options && (
            <div className="space-y-3">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isAnswer = opt.toLowerCase() === currentQ.answer.toLowerCase();
                let cls = 'border-slate-200 bg-white hover:border-primary/40';
                if (showResult) {
                  if (isAnswer) cls = 'border-green-400 bg-green-50';
                  else if (isSelected && !isAnswer) cls = 'border-red-400 bg-red-50';
                } else if (isSelected) {
                  cls = 'border-primary bg-indigo-50';
                }
                return (
                  <button
                    key={i}
                    disabled={showResult}
                    onClick={() => setSelectedOption(opt)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all ${cls}`}
                  >
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-600">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-base font-semibold text-slate-800 flex-1">{opt}</span>
                    {showResult && isAnswer && <span className="material-symbols-outlined text-green-600">check_circle</span>}
                    {showResult && isSelected && !isAnswer && <span className="material-symbols-outlined text-red-500">cancel</span>}
                  </button>
                );
              })}
            </div>
          )}

          {showResult && (
            <div className={`flex items-center gap-3 px-5 py-4 rounded-xl ${isCorrectAnswer ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <span className={`material-symbols-outlined text-2xl ${isCorrectAnswer ? 'text-green-600' : 'text-red-500'}`}>
                {isCorrectAnswer ? 'check_circle' : 'highlight_off'}
              </span>
              <div>
                <p className={`font-black ${isCorrectAnswer ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrectAnswer ? 'Chính xác! 🎉' : 'Chưa đúng'}
                </p>
                {!isCorrectAnswer && <p className="text-red-600 text-sm mt-1">Đáp án đúng: <span className="font-black">{currentQ.answer}</span></p>}
              </div>
            </div>
          )}
        </div>

        {!showResult ? (
          <button
            disabled={currentQ.type === 'fill_blank' ? !userAnswer.trim() : !selectedOption}
            onClick={submitAnswer}
            className="w-full py-4 rounded-xl text-sm font-black bg-primary hover:bg-indigo-700 !text-white transition-colors disabled:opacity-40 shadow-sm"
          >
            Kiểm tra
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="w-full py-4 rounded-xl text-sm font-black bg-primary hover:bg-indigo-700 !text-white transition-colors shadow-sm"
          >
            {quizIdx + 1 < questions.length ? 'Câu tiếp theo →' : 'Xem kết quả'}
          </button>
        )}
      </div>
    </LearnerShell>
  );
}
