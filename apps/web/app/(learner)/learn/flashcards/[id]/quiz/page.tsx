'use client';
import { showToast } from '@/shared/ui/AppFeedback';
import { AppIcon, IconText } from '@/shared/ui/AppIcon';

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
  optionExplanations?: { option: string; correct: boolean; explanation: string }[];
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
        lessonId === 'all' ? '/vocab-study/quiz-words' : `/vocab-study/quiz-words?sourceLessonId=${lessonId}`
      );
      const words = sessionRes?.words ?? [];
      if (!words.length) {
        setError('Hãy học từ vựng trước. Quiz chỉ kiểm tra những từ bạn đã học.');
        return;
      }
      const ids = words.slice(0, 20).map((w: any) => w.id);
      const quizRes: any = await apiClient.post('/vocab-study/quiz', { vocabIds: ids });
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

  const submitAnswer = async (choice?: string) => {
    const q = questions[quizIdx];
    if (!q || showResult) return;
    const ans = q.type === 'fill_blank' ? userAnswer.trim() : choice ?? selectedOption ?? '';
    if (choice !== undefined) setSelectedOption(choice);
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
      setPhase('summary'); showToast('Bạn đã hoàn thành bài kiểm tra từ vựng.', 'success', 'Hoàn thành');
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
        <div className="space-y-8 w-full py-8">
          <div className="text-center space-y-3">
            <div className={`mx-auto w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center ${pct >= 80 ? 'border-green-400' : pct >= 50 ? 'border-amber-400' : 'border-red-400'}`}>
              <span className="text-3xl"><IconText>{pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚'}</IconText></span>
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
                <AppIcon className={` ${r.correct ? 'text-green-500' : 'text-red-500'}`}>
                  {r.correct ? 'check_circle' : 'cancel'}
                </AppIcon>
                <span className="flex-1 font-semibold text-slate-800">{r.term}</span>
                <span className={`text-xs font-bold ${r.correct ? 'text-green-600' : 'text-red-500'}`}>
                  {r.correct ? 'Đúng' : 'Sai'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button onClick={loadQuiz} className="flex-1 py-3.5 rounded-xl text-sm font-black bg-primary hover:bg-indigo-700 !text-white transition-colors shadow-sm flex items-center justify-center gap-2">
              <AppIcon className=" text-base !text-white">replay</AppIcon>
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
      <div className="space-y-6 w-full py-8">
        <div className="flex justify-between items-center">
          <div>
            <Link href={`/learn/flashcards/${lessonId}`} className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1 mb-1">
              <AppIcon className=" text-sm">arrow_back</AppIcon>
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
            {currentQ.type === 'fill_blank' ? 'Điền từ vào chỗ trống' : 'Chọn nghĩa đúng của từ'}
          </p>
          <p className="text-xl font-black text-slate-900 leading-relaxed">{currentQ.prompt}</p>
          {currentQ.hint && <p className="text-sm text-slate-500 italic"><IconText>{"💡 "}</IconText>{currentQ.hint}</p>}

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
                    onClick={() => void submitAnswer(opt)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all ${cls}`}
                  >
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-600">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-base font-semibold text-slate-800 flex-1">{showResult && <span className="mb-1 block text-xs">{isAnswer ? 'Đáp án đúng' : 'Bạn đã chọn · Chưa đúng'}</span>}{opt}</span>
                    {showResult && isAnswer && <AppIcon className=" text-green-600">check_circle</AppIcon>}
                    {showResult && isSelected && !isAnswer && <AppIcon className=" text-red-500">cancel</AppIcon>}
                  </button>
                );
              })}
            </div>
          )}

          {showResult && <details key={quizIdx} className="rounded-xl border border-slate-200 text-sm"><summary className="cursor-pointer px-4 py-3 font-semibold text-primary">Xem chi tiết</summary><div className="border-t border-slate-100 px-4 py-3 leading-6 text-slate-700"><p className="font-semibold text-emerald-700">Đáp án đúng: {currentQ.answer}</p><p className="mt-2">{currentQ.optionExplanations?.find(item => item.option === (isCorrectAnswer ? currentQ.answer : selectedOption))?.explanation ?? 'Lựa chọn cần khớp với nghĩa của từ trong câu hỏi.'}</p></div></details>}

        </div>

        {!showResult && currentQ.type === 'multiple_choice' ? null : !showResult ? (
          <button
            disabled={currentQ.type === 'fill_blank' ? !userAnswer.trim() : !selectedOption}
            onClick={() => void submitAnswer()}
            className="w-full py-4 rounded-xl text-sm font-black bg-primary hover:bg-indigo-700 !text-white transition-colors disabled:opacity-40 shadow-sm"
          >
            Kiểm tra
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="w-full py-4 rounded-xl text-sm font-black bg-primary hover:bg-indigo-700 !text-white transition-colors shadow-sm"
          >
            <IconText>{quizIdx + 1 < questions.length ? 'Câu tiếp theo →' : 'Xem kết quả'}</IconText>
          </button>
        )}
      </div>
    </LearnerShell>
  );
}
