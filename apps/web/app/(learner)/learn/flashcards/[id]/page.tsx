'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isFlipped, setIsFlipped] = useState(false);

  // Batch learning state
  const [batchStart, setBatchStart] = useState(0);        // index in vocabList where current batch starts
  const [batchIdx, setBatchIdx] = useState(0);             // position within current batch
  const [masteredSet, setMasteredSet] = useState<Set<string>>(new Set()); // words answered correctly — never quiz again
  const [pendingWrongIds, setPendingWrongIds] = useState<string[]>([]);   // wrong word IDs from last quiz
  const batchNumberRef = useRef(1);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizResults, setQuizResults] = useState<{ vocabId: string; term: string; correct: boolean }[]>([]);
  const [allTimeResults, setAllTimeResults] = useState<{ vocabId: string; term: string; correct: boolean }[]>([]);

  // Compute current batch of words to learn
  const getCurrentBatch = useCallback(() => {
    if (pendingWrongIds.length > 0) {
      // After a quiz with wrong answers: take N new words to fill up, where N = number of wrong words
      const wrongWords = vocabList.filter(w => pendingWrongIds.includes(w.id));
      const alreadySeenIds = new Set([
        ...masteredSet,
        ...pendingWrongIds,
        ...vocabList.slice(0, batchStart + BATCH_SIZE).map(w => w.id),
      ]);
      const newFillWords = vocabList.filter(w => !alreadySeenIds.has(w.id)).slice(0, pendingWrongIds.length);
      return newFillWords; // Only show new words to learn; quiz will include wrong + new
    }
    // Normal batch: next BATCH_SIZE words from vocabList
    return vocabList.slice(batchStart, batchStart + BATCH_SIZE).filter(w => !masteredSet.has(w.id));
  }, [vocabList, batchStart, masteredSet, pendingWrongIds]);

  const currentBatch = getCurrentBatch();
  const currentWord = currentBatch[batchIdx];

  // Total progress
  const totalWords = vocabList.length;
  const masteredCount = masteredSet.size;

  // Check if all words have been mastered or we've gone through all batches
  const allDone = masteredCount >= totalWords || (batchStart >= totalWords && pendingWrongIds.length === 0);

  // Load vocab
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
      setBatchStart(0);
      setBatchIdx(0);
      setIsFlipped(false);
      setMasteredSet(new Set());
      setPendingWrongIds([]);
      setAllTimeResults([]);
      batchNumberRef.current = 1;
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
    const word = currentWord;
    if (!word) return;
    if (word.audioUrl) { void new Audio(word.audioUrl).play(); return; }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word.term);
      u.lang = 'en-US'; u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  // Navigation within batch
  const handleNext = () => {
    if (batchIdx + 1 < currentBatch.length) {
      setBatchIdx(batchIdx + 1);
      setIsFlipped(false);
    } else {
      // End of batch → auto start quiz
      autoStartQuiz();
    }
  };

  const handlePrev = () => {
    if (batchIdx > 0) { setBatchIdx(batchIdx - 1); setIsFlipped(false); }
  };

  // Auto quiz: quiz the current batch + any pending wrong words
  const autoStartQuiz = async () => {
    const batchIds = currentBatch.map(w => w.id);
    const quizIds = pendingWrongIds.length > 0
      ? [...pendingWrongIds, ...batchIds] // wrong + new words
      : batchIds;                          // first quiz of batch

    // Deduplicate
    const uniqueIds = [...new Set(quizIds)];
    await startQuiz(uniqueIds);
  };

  // Start quiz
  const startQuiz = async (vocabIds: string[]) => {
    try {
      const res: any = await apiClient.get(`/vocab-study/quiz?ids=${vocabIds.join(',')}`);
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
    const result = { vocabId: q.vocabularyId, term: q.answer, correct: isCorrect };
    setQuizResults(prev => [...prev, result]);
    setAllTimeResults(prev => [...prev, result]);
    try { await apiClient.post('/vocab-study/answer', { vocabularyId: q.vocabularyId, isCorrect }); } catch { /* best-effort */ }
  };

  // After finishing a quiz round
  const handleQuizComplete = () => {
    const correctIds = quizResults.filter(r => r.correct).map(r => r.vocabId);
    const wrongIds = quizResults.filter(r => !r.correct).map(r => r.vocabId);

    // Add correct answers to mastered set
    setMasteredSet(prev => {
      const next = new Set(prev);
      correctIds.forEach(id => next.add(id));
      return next;
    });

    if (wrongIds.length > 0) {
      // Still have wrong words — need to learn more new words then quiz again
      setPendingWrongIds(wrongIds);

      // Check if there are still new words available to learn
      const alreadySeenIds = new Set([
        ...masteredSet,
        ...correctIds,
        ...wrongIds,
        ...vocabList.slice(0, batchStart + BATCH_SIZE).map(w => w.id),
      ]);
      const remainingNew = vocabList.filter(w => !alreadySeenIds.has(w.id));

      if (remainingNew.length > 0) {
        // Go back to learn phase to show new words
        setBatchIdx(0);
        setPhase('learn');
      } else {
        // No more new words, just re-quiz the wrong ones
        startQuiz(wrongIds);
      }
    } else {
      // All correct! Move to next batch
      setPendingWrongIds([]);
      const nextBatchStart = batchStart + BATCH_SIZE;

      if (nextBatchStart >= vocabList.length) {
        // All words done!
        setPhase('summary');
      } else {
        // Advance to next batch
        setBatchStart(nextBatchStart);
        setBatchIdx(0);
        setIsFlipped(false);
        batchNumberRef.current += 1;
        setPhase('learn');
      }
    }
  };

  const nextQuestion = () => {
    if (quizIdx + 1 < questions.length) {
      setQuizIdx(quizIdx + 1); setUserAnswer(''); setSelectedOption(null); setShowResult(false);
    } else {
      handleQuizComplete();
    }
  };

  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;
  if (error || vocabList.length === 0) return <LearnerShell><div className="p-8 text-center text-slate-500">{error || 'Không có từ vựng nào.'}</div></LearnerShell>;

  const currentQ = questions[quizIdx];
  const batchNumber = batchNumberRef.current;
  const totalBatches = Math.ceil(vocabList.length / BATCH_SIZE);

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: LEARN
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === 'learn') {
    if (currentBatch.length === 0 || allDone) {
      // Edge case: no words to learn (all mastered)
      setPhase('summary');
      return <LearnerShell><LoadingSpinner /></LearnerShell>;
    }

    const isReviewBatch = pendingWrongIds.length > 0;
    const word = currentWord;
    if (!word) return <LearnerShell><LoadingSpinner /></LearnerShell>;

    return (
      <LearnerShell>
        <div className="space-y-6 w-full max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {lessonId === 'all' ? 'Toàn bộ từ vựng IT' : 'Từ vựng IT Chuyên ngành'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Học theo đợt {BATCH_SIZE} từ — tự động kiểm tra sau mỗi đợt
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
                {isReviewBatch ? `Học thêm từ mới (${pendingWrongIds.length} từ sai cần ôn)` : `Đợt ${batchNumber}/${totalBatches}`}
              </span>
              <Link href="/learn/lessons" className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-slate-200 bg-white">
                Về danh mục bài học
              </Link>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="material-symbols-outlined text-primary text-lg">trending_up</span>
            <div className="flex-1">
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Tiến độ tổng</span>
                <span>{masteredCount}/{totalWords} từ đã thuộc</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${totalWords > 0 ? (masteredCount / totalWords) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

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
                  <h2 className="text-4xl font-black tracking-tight text-primary lg:text-5xl">{word.term}</h2>
                  <p className="mt-3 text-sm text-slate-500">{[word.pronunciationIpa, word.partOfSpeech].filter(Boolean).join(' · ')}</p>
                  <button type="button" onClick={pronounce} aria-label={`Phát âm từ ${word.term}`} className="mt-5 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-md transition-transform hover:scale-105">
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
                    <div><p className="text-[11px] font-bold uppercase tracking-wider text-primary">Mặt sau</p><div className="mt-1 flex items-center gap-2"><h2 className="text-2xl font-black text-primary">{word.term}</h2><button type="button" onClick={pronounce} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20"><span className="material-symbols-outlined text-xl">volume_up</span></button></div></div>
                    <span className="material-symbols-outlined text-slate-400">flip</span>
                  </div>
                  <div className="mt-5 space-y-4">
                    <div><p className="text-[11px] font-bold uppercase tracking-wide text-primary">Nghĩa tiếng Việt</p><p className="mt-1 text-lg font-bold leading-relaxed text-slate-900">{word.definitionVi || 'Chưa có'}</p></div>
                    <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">English definition</p><p className="mt-1 text-sm leading-relaxed text-slate-700">{word.definitionEn || 'No definition'}</p></div>
                    {word.examples?.length > 0 && <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-primary">Ví dụ</p><p className="mt-2 text-sm font-semibold text-slate-800">{word.examples[0].sentenceEn}</p>{word.examples[0].translationVi && <p className="mt-1 text-sm text-slate-600">{word.examples[0].translationVi}</p>}</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Từ {batchIdx + 1} / {currentBatch.length}</span>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((batchIdx + 1) / currentBatch.length) * 100}%` }} />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button disabled={batchIdx === 0} onClick={handlePrev} className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition-colors">Từ trước</button>
                  <button onClick={handleNext} className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors">
                    {batchIdx + 1 >= currentBatch.length ? '🎯 Kiểm tra đợt này' : 'Từ tiếp theo'}
                  </button>
                </div>
                <button
                  onClick={autoStartQuiz}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 bg-primary hover:bg-indigo-700 !text-white"
                >
                  <span className="material-symbols-outlined !text-white text-base">quiz</span>
                  <span className="!text-white">Kiểm tra ngay ({currentBatch.length + pendingWrongIds.length} từ)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </LearnerShell>
    );
  }

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
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
                Đợt {batchNumber}
              </span>
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                {masteredCount} đã thuộc
              </span>
            </div>
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
  const finalMastered = masteredSet.size;
  const pct = totalWords > 0 ? Math.round((finalMastered / totalWords) * 100) : 0;
  const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚';

  // Deduplicate allTimeResults — show last result per vocabId
  const resultMap = new Map<string, { vocabId: string; term: string; correct: boolean }>();
  allTimeResults.forEach(r => resultMap.set(r.vocabId, r));
  const finalResults = Array.from(resultMap.values());
  const finalCorrect = finalResults.filter(r => r.correct).length;

  return (
    <LearnerShell>
      <div className="space-y-8 w-full max-w-3xl mx-auto">
        {/* Score */}
        <div className="text-center space-y-3">
          <div className={`mx-auto w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center ${pct >= 80 ? 'border-green-400' : pct >= 50 ? 'border-amber-400' : 'border-red-400'}`}>
            <span className="text-3xl">{emoji}</span>
            <span className="text-2xl font-black text-slate-900">{finalMastered}/{totalWords}</span>
            <span className="text-xs text-slate-500">từ đã thuộc</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {pct >= 80 ? 'Xuất sắc!' : pct >= 50 ? 'Khá tốt!' : 'Cần ôn thêm!'}
          </h1>
          <p className="text-sm text-slate-500">
            Bạn đã hoàn thành {batchNumber} đợt học · {finalCorrect}/{finalResults.length} câu trả lời đúng
          </p>
        </div>

        {/* Results list */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
          {finalResults.map((r, i) => (
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
          <button onClick={loadVocab} className="w-full py-3.5 rounded-xl text-sm font-black bg-primary hover:bg-indigo-700 !text-white transition-colors shadow-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base !text-white">replay</span>
            <span className="!text-white">Học lại từ đầu</span>
          </button>
          <Link href="/learn/lessons" className="block text-center py-3 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            Về trang chính
          </Link>
        </div>
      </div>
    </LearnerShell>
  );
}
