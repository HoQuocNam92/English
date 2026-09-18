'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';

type Rating = 'easy' | 'medium' | 'hard' | 'mastered';

export default function FlashcardPracticePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const lessonId = unwrappedParams.id;
  const router = useRouter();

  const [lesson, setLesson] = useState<any>(null);
  const [words, setWords] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  // Settings & modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSkippedModal, setShowSkippedModal] = useState(false);
  const [autoPronounce, setAutoPronounce] = useState(true);
  const [confirmStopModal, setConfirmStopModal] = useState(false);
  const [stopping, setStopping] = useState(false);

  // Tracking in current session
  const [skippedWords, setSkippedWords] = useState<any[]>([]);
  const [sessionResults, setSessionResults] = useState<{
    word: any;
    rating: Rating;
  }[]>([]);

  // Load practice words
  const loadPracticeSession = useCallback(async (filterOnlyNew: boolean) => {
    setLoading(true);
    setError('');
    try {
      if (lessonId === 'all') {
        const res: any = await apiClient.get('/vocab-study/session');
        const allWords = res?.words ?? [];
        const filtered = filterOnlyNew ? allWords.filter((w: any) => w.studyStatus !== 'mastered') : allWords;
        setLesson({ id: 'all', title: 'Toàn bộ từ vựng IT Chuyên ngành' });
        setWords(filtered);
        setCurrentIdx(0);
        setIsFlipped(false);
        setIsFinished(false);
      } else {
        const query = `/vocab-study/practice-session/${lessonId}${filterOnlyNew ? '?onlyNew=true' : ''}`;
        const res: any = await apiClient.get(query);
        if (!res || !res.words) {
          setError('Không thể tải bài học để luyện tập.');
          return;
        }
        setLesson(res.lesson);
        setWords(res.words);
        setCurrentIdx(0);
        setIsFlipped(false);
        setIsFinished(false);
      }
    } catch {
      setError('Lỗi kết nối khi tải danh sách từ vựng.');
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (lessonId) {
      loadPracticeSession(onlyNew);
    }
  }, [lessonId, onlyNew, loadPracticeSession]);

  const currentWord = words[currentIdx];

  // Auto pronounce when word changes
  useEffect(() => {
    if (currentWord && autoPronounce && !isFinished) {
      if (currentWord.audioUrl) {
        void new Audio(currentWord.audioUrl).play();
      } else if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(currentWord.term);
        u.lang = 'en-US';
        u.rate = 0.85;
        window.speechSynthesis.speak(u);
      }
    }
  }, [currentWord, autoPronounce, isFinished]);

  // Pronounce button handler
  const pronounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentWord) return;
    if (currentWord.audioUrl) {
      void new Audio(currentWord.audioUrl).play();
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(currentWord.term);
      u.lang = 'en-US';
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  // Submit Rating
  const handleRate = async (rating: Rating) => {
    if (!currentWord) return;

    // Record session result
    setSessionResults(prev => [...prev, { word: currentWord, rating }]);

    if (rating === 'mastered') {
      setSkippedWords(prev => [...prev, currentWord]);
    }

    // Call API in background
    try {
      await apiClient.post('/vocab-study/rate', {
        vocabularyId: currentWord.id,
        rating,
      });
    } catch {
      /* best effort */
    }

    // If hard, optionally repeat at end of queue
    if (rating === 'hard') {
      setWords(prev => [...prev, currentWord]);
    }

    // Next card
    if (currentIdx + 1 < words.length) {
      setCurrentIdx(currentIdx + 1);
      setIsFlipped(false);
    } else {
      setIsFinished(true);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || loading || !currentWord) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === '1') {
        handleRate('easy');
      } else if (e.key === '2') {
        handleRate('medium');
      } else if (e.key === '3') {
        handleRate('hard');
      } else if (e.key === '4') {
        handleRate('mastered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentWord, isFinished, loading]);

  // Stop studying list
  const handleStopStudying = async () => {
    if (lessonId === 'all') {
      router.push('/learn/flashcards');
      return;
    }
    setStopping(true);
    try {
      await apiClient.post('/vocab-study/toggle-studying', {
        lessonId,
        isStudying: false,
      });
      setConfirmStopModal(false);
      router.push('/learn/flashcards');
    } catch {
      alert('Không thể cập nhật trạng thái.');
    } finally {
      setStopping(false);
    }
  };

  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;
  if (error || words.length === 0) {
    return (
      <LearnerShell>
        <div className="p-12 text-center text-slate-500 space-y-4 max-w-lg mx-auto">
          <span className="material-symbols-outlined text-5xl text-slate-300">task_alt</span>
          <h2 className="text-xl font-bold text-slate-800">
            {error || 'Không có từ vựng nào để ôn tập!'}
          </h2>
          <p className="text-xs text-slate-500">
            Bạn đã thuộc hết các từ trong bài hoặc không có từ mới nào theo bộ lọc.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            {onlyNew && (
              <button
                onClick={() => setOnlyNew(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors"
              >
                Ôn lại toàn bộ bài
              </button>
            )}
            <Link
              href={`/learn/flashcards/${lessonId}`}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors"
            >
              Về bài học
            </Link>
          </div>
        </div>
      </LearnerShell>
    );
  }

  // Summary View
  if (isFinished) {
    const totalRated = sessionResults.length;
    const masteredCount = sessionResults.filter(r => r.rating === 'mastered' || r.rating === 'easy').length;
    const hardCount = sessionResults.filter(r => r.rating === 'hard').length;

    return (
      <LearnerShell>
        <div className="w-full max-w-2xl mx-auto px-4 py-10 space-y-8">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-4xl shadow-xs">
              🎉
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              Hoàn thành phiên luyện tập!
            </h1>
            <p className="text-xs text-slate-500">
              Bạn đã ôn qua {totalRated} lượt từ vựng trong bài học này.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-slate-900">{totalRated}</div>
              <div className="text-[11px] font-bold text-slate-400 mt-0.5">Tổng lượt ôn</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-emerald-600">{masteredCount}</div>
              <div className="text-[11px] font-bold text-emerald-700 mt-0.5">Dễ / Đã biết</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-amber-600">{hardCount}</div>
              <div className="text-[11px] font-bold text-amber-700 mt-0.5">Từ khó cần ôn</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setSessionResults([]);
                loadPracticeSession(onlyNew);
              }}
              className="flex-1 py-3.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">replay</span>
              Luyện tập tiếp
            </button>
            <Link
              href={`/learn/flashcards/${lessonId}`}
              className="flex-1 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors text-center"
            >
              Về danh sách bài học
            </Link>
          </div>
        </div>
      </LearnerShell>
    );
  }

  return (
    <LearnerShell>
      <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Header Title */}
        <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
          Luyện tập: {lesson?.title || 'Từ vựng'}
        </h1>

        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600 pt-1">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              href={`/learn/flashcards/${lessonId}`}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              &lt;&lt; Xem tất cả
            </Link>
            <span>·</span>
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">settings</span>
              Cài đặt
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setShowSkippedModal(true)}
              className="hover:text-primary transition-colors"
            >
              Các từ đã bỏ qua ({skippedWords.length})
            </button>
            <span>·</span>
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700">
              <input
                type="checkbox"
                checked={onlyNew}
                onChange={e => setOnlyNew(e.target.checked)}
                className="w-3.5 h-3.5 text-primary rounded-xs border-slate-300 focus:ring-primary"
              />
              <span>Chỉ ôn từ mới</span>
            </label>
          </div>

          <button
            type="button"
            onClick={() => setConfirmStopModal(true)}
            className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">archive</span>
            <span>Dừng học list từ này</span>
          </button>
        </div>

        {/* Notice Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs leading-relaxed">
          Chú ý: bạn được học tối đa 20 từ mới một ngày. Đây là lượng từ phù hợp để bạn có thể học hiệu quả.
        </div>

        {/* Card Progress Indicator */}
        <div className="flex justify-between items-center text-xs font-bold text-slate-500 pt-1">
          <span>Thẻ {currentIdx + 1} / {words.length}</span>
          <span className="text-[11px] text-slate-400">Phím tắt: Space (lật), 1-4 (đánh giá)</span>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* FLASHCARD (3D FLIP CONTAINER) */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <div className="h-[360px] sm:h-[400px] w-full [perspective:1200px]">
          <div
            role="button"
            tabIndex={0}
            aria-label={isFlipped ? 'Xem mặt trước' : 'Lật thẻ để xem nghĩa'}
            onClick={() => setIsFlipped(!isFlipped)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsFlipped(!isFlipped);
              }
            }}
            className="relative h-full w-full cursor-pointer text-left [transform-style:preserve-3d] transition-transform duration-500 ease-out"
            style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            {/* FRONT SIDE */}
            <div
              className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs"
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Top Tag: "Từ mới" or "Cần ôn tập" */}
              <div className="flex justify-end">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    currentWord.isMastered
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : currentWord.isNeedsReview
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  {currentWord.isMastered ? 'Đã nhớ' : currentWord.isNeedsReview ? 'Cần ôn tập' : 'Từ mới'}
                </span>
              </div>

              {/* Center Content */}
              <div className="flex flex-col items-center justify-center text-center space-y-3 my-auto">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                    {currentWord.term}
                  </h2>
                  <button
                    type="button"
                    onClick={pronounce}
                    aria-label={`Phát âm từ ${currentWord.term}`}
                    className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-primary hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-xl">volume_up</span>
                  </button>
                </div>

                <p className="text-sm font-semibold text-slate-500">
                  {[currentWord.partOfSpeech && `(${currentWord.partOfSpeech})`, currentWord.pronunciationIpa && `/${currentWord.pronunciationIpa}/`].filter(Boolean).join(' ')}
                </p>
              </div>

              {/* Bottom Flip Hint & Icon */}
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold pt-2">
                <span className="text-[11px] text-slate-400">Chạm thẻ để xem nghĩa</span>
                <span className="material-symbols-outlined text-slate-400 text-xl hover:text-primary transition-colors">
                  sync
                </span>
              </div>
            </div>

            {/* BACK SIDE */}
            <div
              className="absolute inset-0 flex flex-col justify-between overflow-y-auto rounded-3xl border border-indigo-200 bg-white p-6 sm:p-8 shadow-xs"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-slate-900">{currentWord.term}</h3>
                  <button
                    type="button"
                    onClick={pronounce}
                    className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:bg-primary hover:text-white flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-base">volume_up</span>
                  </button>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Mặt sau
                </span>
              </div>

              {/* Content Body */}
              <div className="space-y-4 my-auto py-2">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Định nghĩa:
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-1">
                    {currentWord.definitionVi || 'Chưa có định nghĩa tiếng Việt'}
                  </div>
                  {currentWord.definitionEn && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      {currentWord.definitionEn}
                    </div>
                  )}
                </div>

                {currentWord.examples && currentWord.examples.length > 0 && (
                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-xs text-slate-800 space-y-1">
                    <div className="font-bold text-primary text-[11px] uppercase tracking-wide">
                      Ví dụ:
                    </div>
                    <p className="font-semibold">{currentWord.examples[0].sentenceEn}</p>
                    {currentWord.examples[0].translationVi && (
                      <p className="text-slate-600 italic">{currentWord.examples[0].translationVi}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Flip Icon */}
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">Chạm thẻ để lật lại</span>
                <span className="material-symbols-outlined text-slate-400 text-xl">sync</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* 4 RATING BUTTONS BAR */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {/* Dễ */}
            <button
              type="button"
              onClick={() => handleRate('easy')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-emerald-50 text-emerald-600 transition-colors group"
            >
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
                sentiment_satisfied
              </span>
              <span className="text-xs font-bold mt-1">Dễ</span>
            </button>

            {/* Trung bình */}
            <button
              type="button"
              onClick={() => handleRate('medium')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-amber-50 text-amber-600 transition-colors group"
            >
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
                sentiment_neutral
              </span>
              <span className="text-xs font-bold mt-1">Trung bình</span>
            </button>

            {/* Khó */}
            <button
              type="button"
              onClick={() => handleRate('hard')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors group"
            >
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
                sentiment_dissatisfied
              </span>
              <span className="text-xs font-bold mt-1">Khó</span>
            </button>

            {/* Đã biết, loại khỏi danh sách ôn tập */}
            <button
              type="button"
              onClick={() => handleRate('mastered')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors group text-center"
            >
              <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:scale-110 group-hover:text-primary transition-transform">
                fast_forward
              </span>
              <span className="text-[11px] font-bold leading-tight mt-1 text-slate-600 line-clamp-2">
                Đã biết, loại khỏi danh sách ôn tập
              </span>
            </button>
          </div>
        </div>

        {/* Modal: Settings */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-slate-900">Cài đặt luyện tập</h3>
              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-slate-700 font-semibold">Tự động phát âm khi qua từ mới</span>
                  <input
                    type="checkbox"
                    checked={autoPronounce}
                    onChange={e => setAutoPronounce(e.target.checked)}
                    className="w-4 h-4 text-primary rounded-xs"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold mt-4"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Modal: Skipped Words */}
        {showSkippedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl max-h-[80vh] flex flex-col">
              <h3 className="text-base font-bold text-slate-900">
                Từ đã đánh dấu &quot;Đã biết&quot; ({skippedWords.length})
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 text-xs divide-y divide-slate-100">
                {skippedWords.length === 0 ? (
                  <p className="text-slate-400 py-4 text-center">Chưa có từ nào bị bỏ qua trong phiên này.</p>
                ) : (
                  skippedWords.map((w, idx) => (
                    <div key={idx} className="pt-2 flex justify-between items-center">
                      <span className="font-bold text-slate-800">{w.term}</span>
                      <span className="text-slate-500">{w.definitionVi}</span>
                    </div>
                  ))
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowSkippedModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Modal: Confirm Stop Studying */}
        {confirmStopModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">archive</span>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Dừng học list từ này?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bài học sẽ được gỡ khỏi danh sách <strong>&quot;Đang học&quot;</strong> trên Dashboard. Toàn bộ tiến độ và từ vựng bạn đã nhớ vẫn được bảo lưu.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmStopModal(false)}
                  disabled={stopping}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleStopStudying}
                  disabled={stopping}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  {stopping ? 'Đang xử lý...' : 'Dừng học'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
