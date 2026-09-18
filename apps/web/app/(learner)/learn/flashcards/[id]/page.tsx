'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';

const BATCH_SIZE = 20;

type Phase = 'learn' | 'quiz' | 'summary';

interface QuizQuestion {
  type: 'fill_blank' | 'multiple_choice';
  vocabularyId: string;
  prompt: string;
  hint?: string;
  options?: string[];
  answer: string;
}

export default function LearnerVocabularyFlashcardsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const lessonId = unwrappedParams.id;

  const [phase, setPhase] = useState<Phase>('learn');
  const [vocabList, setVocabList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedSet, setLearnedSet] = useState<Set<string>>(new Set());

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizResults, setQuizResults] = useState<{ vocabId: string; term: string; correct: boolean }[]>([]);
  const [quizRound, setQuizRound] = useState(1);

  // Load vocab - limited to BATCH_SIZE
  const loadVocab = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = lessonId === 'all'
        ? '/vocab-study/session'
        : `/vocab-study/session?lessonId=${lessonId}`;
      const res: any = await apiClient.get(query);
      const words = res?.words ?? [];
      setVocabList(Array.isArray(words) ? words : []);
      setSelectedIdx(0);
      setIsFlipped(false);
      setPhase('learn');
    } catch {
      setError('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => { if (lessonId) loadVocab(); }, [lessonId, loadVocab]);

  // Pronounce
  const pronounce = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const word = vocabList[selectedIdx];
    if (!word) return;
    if (word.audioUrl) { void new Audio(word.audioUrl).play(); return; }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word.term);
      u.lang = 'en-US'; u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  // Navigation
  const handleNext = () => {
    if (selectedIdx + 1 < vocabList.length) {
      setSelectedIdx(selectedIdx + 1); setIsFlipped(false);
    } else {
      startQuiz();
    }
  };

  // Mark word as learned
  const markAsLearned = async () => {
    const word = vocabList[selectedIdx];
    if (!word || learnedSet.has(word.id)) return;
    setLearnedSet(prev => new Set(prev).add(word.id));
    try { await apiClient.post('/vocab-study/answer', { vocabularyId: word.id, isCorrect: true }); } catch { /* best-effort */ }
  };
  const handlePrev = () => {
    if (selectedIdx > 0) { setSelectedIdx(selectedIdx - 1); setIsFlipped(false); }
  };

  // Start quiz
  const startQuiz = async (vocabIds?: string[]) => {
    const ids = vocabIds ?? vocabList.map(w => w.id);
    try {
      const res: any = await apiClient.get(`/vocab-study/quiz?ids=${ids.join(',')}`);
      setQuestions(res?.questions ?? []);
      setQuizIdx(0); setUserAnswer(''); setSelectedOption(null);
      setShowResult(false); setQuizResults([]);
      setPhase('quiz');
    } catch {
      setError('Không thể tạo quiz');
    }
  };

  // Submit quiz answer
  const submitAnswer = async () => {
    const q = questions[quizIdx];
    if (!q) return;
    const ans = q.type === 'fill_blank' ? userAnswer.trim() : selectedOption ?? '';
    const isCorrect = ans.toLowerCase() === q.answer.toLowerCase();
    setShowResult(true);
    setQuizResults(prev => [...prev, { vocabId: q.vocabularyId, term: q.answer, correct: isCorrect }]);
    try { await apiClient.post('/vocab-study/answer', { vocabularyId: q.vocabularyId, isCorrect }); } catch { /* best-effort */ }
  };

  const nextQuestion = () => {
    if (quizIdx + 1 < questions.length) {
      setQuizIdx(quizIdx + 1); setUserAnswer(''); setSelectedOption(null); setShowResult(false);
    } else {
      const wrongIds = quizResults.filter(r => !r.correct).map(r => r.vocabId);
      if (wrongIds.length > 0 && quizRound < 3) {
        setQuizRound(prev => prev + 1);
        startQuiz(wrongIds);
      } else {
        setPhase('summary');
      }
    }
  };

  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;
  if (error || vocabList.length === 0) return <LearnerShell><div className="p-8 text-center text-slate-500">{error || 'Không có từ vựng nào.'}</div></LearnerShell>;

  const currentWord = vocabList[selectedIdx];
  const currentQ = questions[quizIdx];
  const correctCount = quizResults.filter(r => r.correct).length;
  const wrongResults = quizResults.filter(r => !r.correct);

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: LEARN
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === 'learn') return (
    <LearnerShell>
      <div className="space-y-6 w-full max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {lessonId === 'all' ? 'Toàn bộ từ vựng IT' : 'Từ vựng IT Chuyên ngành'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">Học tối đa {BATCH_SIZE} từ mỗi phiên — sau đó kiểm tra</p>
          </div>
          <Link href="/learn/lessons" className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-slate-200 bg-white">
            Về danh mục bài học
          </Link>
        </div>

        {/* Warning banner when at batch limit */}
        {vocabList.length >= BATCH_SIZE && selectedIdx >= BATCH_SIZE - 3 && (
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
            <span className="material-symbols-outlined text-amber-600">info</span>
            <p className="text-sm font-medium">Bạn đã học {vocabList.length} từ! Hoàn thành bài kiểm tra trước khi học thêm nhé.</p>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xs overflow-hidden">
          {/* Flip card */}
          <div className="h-[380px] w-full [perspective:1200px]">
            <div
              role="button" tabIndex={0}
              aria-label={isFlipped ? 'Xem mặt trước' : 'Lật thẻ để xem nghĩa'}
              onClick={() => setIsFlipped(!isFlipped)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsFlipped(!isFlipped); } }}
              className="relative h-full w-full cursor-pointer text-left [transform-style:preserve-3d] transition-transform duration-500 ease-out"
              style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              {/* Front */}
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-8 text-center shadow-sm" style={{ backfaceVisibility: 'hidden' }}>
                <span className="material-symbols-outlined mb-5 text-4xl text-primary/60">style</span>
                <h2 className="text-4xl font-black tracking-tight text-primary lg:text-5xl">{currentWord.term}</h2>
                <p className="mt-3 text-sm text-slate-500">{[currentWord.pronunciationIpa, currentWord.partOfSpeech].filter(Boolean).join(' · ')}</p>
                <button type="button" onClick={pronounce} aria-label={`Phát âm từ ${currentWord.term}`} className="mt-5 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-md transition-transform hover:scale-105">
                  <span className="material-symbols-outlined !text-white">volume_up</span>
                </button>
                <div className="mt-10 flex items-center gap-2 text-xs font-bold text-primary">
                  <span className="material-symbols-outlined text-lg">touch_app</span>
                  Chạm vào thẻ để xem nghĩa
                </div>
              </div>
              {/* Back */}
              <div className="absolute inset-0 overflow-y-auto rounded-2xl border border-primary/20 bg-white p-6 shadow-sm lg:p-8" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div><p className="text-[11px] font-bold uppercase tracking-wider text-primary">Mặt sau</p><div className="mt-1 flex items-center gap-2"><h2 className="text-2xl font-black text-primary">{currentWord.term}</h2><button type="button" onClick={pronounce} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20"><span className="material-symbols-outlined text-xl">volume_up</span></button></div></div>
                  <span className="material-symbols-outlined text-slate-400">flip</span>
                </div>
                <div className="mt-5 space-y-4">
                  <div><p className="text-[11px] font-bold uppercase tracking-wide text-primary">Nghĩa tiếng Việt</p><p className="mt-1 text-lg font-bold leading-relaxed text-slate-900">{currentWord.definitionVi || 'Chưa có'}</p></div>
                  <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">English definition</p><p className="mt-1 text-sm leading-relaxed text-slate-700">{currentWord.definitionEn || 'No definition'}</p></div>
                  {currentWord.examples?.length > 0 && <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-primary">Ví dụ</p><p className="mt-2 text-sm font-semibold text-slate-800">{currentWord.examples[0].sentenceEn}</p>{currentWord.examples[0].translationVi && <p className="mt-1 text-sm text-slate-600">{currentWord.examples[0].translationVi}</p>}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Từ {selectedIdx + 1} / {vocabList.length}</span>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((selectedIdx + 1) / vocabList.length) * 100}%` }} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex gap-2 w-full sm:w-auto">
                <button disabled={selectedIdx === 0} onClick={handlePrev} className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition-colors">Từ trước</button>
                <button onClick={markAsLearned} disabled={learnedSet.has(currentWord.id)}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    learnedSet.has(currentWord.id)
                      ? 'bg-green-50 border border-green-300 text-green-700'
                      : 'bg-emerald-500 hover:bg-emerald-600 !text-white'
                  }`}>
                  <span className={`material-symbols-outlined text-sm ${learnedSet.has(currentWord.id) ? 'text-green-600' : '!text-white'}`}>
                    {learnedSet.has(currentWord.id) ? 'check_circle' : 'bookmark_add'}
                  </span>
                  <span className={learnedSet.has(currentWord.id) ? '' : '!text-white'}>
                    {learnedSet.has(currentWord.id) ? 'Đã đánh dấu' : 'Đánh dấu đã học'}
                  </span>
                </button>
                <button onClick={handleNext} className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors">
                  {selectedIdx + 1 >= vocabList.length ? '🎯 Bắt đầu kiểm tra' : 'Từ tiếp theo'}
                </button>
              </div>
              <button
                onClick={() => startQuiz()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 bg-primary hover:bg-indigo-700 !text-white"
              >
                <span className="material-symbols-outlined !text-white text-base">quiz</span>
                <span className="!text-white">Kiểm tra ngay ({vocabList.length} từ)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: QUIZ
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === 'quiz' && currentQ) {
    const isCorrectAnswer = showResult && (
      currentQ.type === 'fill_blank'
        ? userAnswer.trim().toLowerCase() === currentQ.answer.toLowerCase()
        : selectedOption?.toLowerCase() === currentQ.answer.toLowerCase()
    );

    return (
      <LearnerShell>
        <div className="space-y-6 w-full max-w-3xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-slate-900">Kiểm tra từ vựng</h1>
            {quizRound > 1 && <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">Vòng {quizRound}</span>}
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">Câu {quizIdx + 1}/{questions.length}</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${((quizIdx + 1) / questions.length) * 100}%` }} />
            </div>
          </div>

          {/* Question card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {currentQ.type === 'fill_blank' ? 'Điền từ vào chỗ trống' : 'Chọn từ đúng cho nghĩa'}
            </p>
            <p className="text-xl font-black text-slate-900 leading-relaxed">{currentQ.prompt}</p>
            {currentQ.hint && <p className="text-sm text-slate-500 italic">💡 {currentQ.hint}</p>}

            {/* Fill-in-blank */}
            {currentQ.type === 'fill_blank' && (
              <input
                type="text" autoFocus
                value={userAnswer} onChange={e => setUserAnswer(e.target.value)}
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

            {/* Multiple choice */}
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
                    <button key={i} disabled={showResult} onClick={() => setSelectedOption(opt)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all ${cls}`}>
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

            {/* Feedback */}
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

          {/* Action button */}
          {!showResult ? (
            <button
              disabled={currentQ.type === 'fill_blank' ? !userAnswer.trim() : !selectedOption}
              onClick={submitAnswer}
              className="w-full py-4 rounded-xl text-sm font-black bg-primary hover:bg-indigo-700 !text-white transition-colors disabled:opacity-40 shadow-sm"
            >
              Kiểm tra
            </button>
          ) : (
            <button onClick={nextQuestion} className="w-full py-4 rounded-xl text-sm font-black bg-primary hover:bg-indigo-700 !text-white transition-colors shadow-sm">
              {quizIdx + 1 < questions.length ? 'Câu tiếp theo →' : 'Xem kết quả'}
            </button>
          )}
        </div>
      </LearnerShell>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 3: SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  const totalAnswered = quizResults.length;
  const pct = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚';

  return (
    <LearnerShell>
      <div className="space-y-8 w-full max-w-3xl mx-auto">
        {/* Score */}
        <div className="text-center space-y-3">
          <div className={`mx-auto w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center ${pct >= 80 ? 'border-green-400' : pct >= 50 ? 'border-amber-400' : 'border-red-400'}`}>
            <span className="text-3xl">{emoji}</span>
            <span className="text-2xl font-black text-slate-900">{correctCount}/{totalAnswered}</span>
            <span className="text-xs text-slate-500">từ đã thuộc</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {pct >= 80 ? 'Xuất sắc!' : pct >= 50 ? 'Khá tốt!' : 'Cần ôn thêm!'}
          </h1>
        </div>

        {/* Results list */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
          {quizResults.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <span className={`material-symbols-outlined ${r.correct ? 'text-green-500' : 'text-red-500'}`}>
                {r.correct ? 'check_circle' : 'cancel'}
              </span>
              <span className="flex-1 font-semibold text-slate-800">{r.term}</span>
              <span className={`text-xs font-bold ${r.correct ? 'text-green-600' : 'text-red-500'}`}>
                {r.correct ? 'Thuộc' : 'Chưa thuộc'}
              </span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {wrongResults.length > 0 && (
            <button onClick={() => startQuiz(wrongResults.map(r => r.vocabId))} className="w-full py-3.5 rounded-xl text-sm font-bold border-2 border-primary text-primary hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">replay</span>
              Ôn lại {wrongResults.length} từ chưa thuộc
            </button>
          )}
          <button onClick={loadVocab} className="w-full py-3.5 rounded-xl text-sm font-black bg-primary hover:bg-indigo-700 !text-white transition-colors shadow-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base !text-white">school</span>
            <span className="!text-white">Học thêm từ mới</span>
          </button>
          <Link href="/learn/lessons" className="block text-center py-3 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            Về trang chính
          </Link>
        </div>
      </div>
    </LearnerShell>
  );
}
