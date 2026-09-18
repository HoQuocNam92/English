'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';

export default function LessonVocabularyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const lessonId = unwrappedParams.id;
  const router = useRouter();

  const [lessonData, setLessonData] = useState<{
    lesson: any;
    words: any[];
    stats: { total: number; remembered: number; needsReview: number; newCount: number; isStudying: boolean };
  } | null>(null);

  const [displayWords, setDisplayWords] = useState<any[]>([]);
  const [isRandom, setIsRandom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmStopModal, setConfirmStopModal] = useState(false);
  const [stopping, setStopping] = useState(false);

  const loadLessonVocabs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (lessonId === 'all') {
        const sessionRes: any = await apiClient.get('/vocab-study/session');
        const words = sessionRes?.words ?? [];
        setLessonData({
          lesson: {
            id: 'all',
            title: 'Toàn bộ từ vựng IT Chuyên ngành',
            summary: 'Tất cả các từ vựng kỹ thuật trong hệ thống',
            domain: { name: 'CNTT' },
            author: 'TechEnglish',
          },
          words,
          stats: {
            total: words.length,
            remembered: 0,
            needsReview: words.length,
            newCount: 0,
            isStudying: true,
          },
        });
        setDisplayWords(words);
      } else {
        const res: any = await apiClient.get(`/vocab-study/lesson/${lessonId}`);
        if (!res) {
          setError('Không tìm thấy bài học');
          return;
        }
        setLessonData(res);
        setDisplayWords(res.words || []);
      }
    } catch {
      setError('Không thể tải danh sách từ vựng.');
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (lessonId) loadLessonVocabs();
  }, [lessonId, loadLessonVocabs]);

  // Handle Random Sort
  const toggleRandomSort = () => {
    if (!lessonData) return;
    if (!isRandom) {
      // Shuffle
      const shuffled = [...displayWords].sort(() => Math.random() - 0.5);
      setDisplayWords(shuffled);
      setIsRandom(true);
    } else {
      // Restore original
      setDisplayWords(lessonData.words);
      setIsRandom(false);
    }
  };

  // Pronounce word
  const pronounce = (e: React.MouseEvent, word: any) => {
    e.stopPropagation();
    if (word.audioUrl) {
      void new Audio(word.audioUrl).play();
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word.term);
      u.lang = 'en-US';
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

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
  if (error || !lessonData) {
    return (
      <LearnerShell>
        <div className="p-12 text-center text-slate-500 space-y-4">
          <p>{error || 'Không tìm thấy bài học.'}</p>
          <Link href="/learn/flashcards" className="inline-block px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold">
            Về danh sách Flashcards
          </Link>
        </div>
      </LearnerShell>
    );
  }

  const { lesson, stats } = lessonData;

  return (
    <LearnerShell>
      <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <div>
          <Link
            href="/learn/flashcards"
            className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Danh mục Flashcards
          </Link>
        </div>

        {/* Header Title */}
        <div className="space-y-2">
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            Flashcards: {lesson.title}
          </h1>
          {lesson.summary && (
            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
              {lesson.summary}
            </p>
          )}
        </div>

        {/* Primary Action Button: Luyện tập Flashcards */}
        <div>
          <Link
            href={`/learn/flashcards/${lessonId}/practice`}
            className="w-full py-4 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all shadow-xs flex items-center justify-center gap-2 text-base font-black text-center group"
          >
            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">
              style
            </span>
            <span>Luyện tập flashcards</span>
          </Link>
        </div>

        {/* Secondary Sub-actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleRandomSort}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                isRandom
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-sm">shuffle</span>
              <span>{isRandom ? 'Đang xem ngẫu nhiên' : 'Xem ngẫu nhiên'}</span>
            </button>

            <Link
              href={`/learn/flashcards/${lessonId}/quiz`}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-primary hover:border-primary/40 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-sm text-indigo-600">quiz</span>
              <span>Kiểm tra trắc nghiệm (Quiz)</span>
            </Link>
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

        {/* Word Counter */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
          <span>List có {displayWords.length} từ</span>
          {stats.remembered > 0 && (
            <span className="text-emerald-600">Đã nhớ: {stats.remembered}/{stats.total} từ</span>
          )}
        </div>

        {/* Vocabulary Cards List (Vertical List View) */}
        <div className="space-y-4">
          {displayWords.map((word: any, index: number) => (
            <div
              key={word.id || index}
              className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between gap-4 hover:shadow-xs transition-shadow"
            >
              {/* Word Details */}
              <div className="space-y-3 flex-1">
                {/* Term, Part of Speech, IPA & Audio */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {word.term}
                  </h3>
                  {word.partOfSpeech && (
                    <span className="text-xs font-semibold text-slate-500">
                      ({word.partOfSpeech})
                    </span>
                  )}
                  {word.pronunciationIpa && (
                    <span className="text-xs font-medium text-slate-400">
                      /{word.pronunciationIpa}/
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={e => pronounce(e, word)}
                    aria-label={`Phát âm từ ${word.term}`}
                    className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">volume_up</span>
                  </button>

                  {word.isMastered && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                      Đã nhớ
                    </span>
                  )}
                </div>

                {/* Definition */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Định nghĩa:
                  </div>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">
                    {word.definitionVi || 'Chưa có định nghĩa tiếng Việt'}
                  </div>
                </div>

                {/* Examples */}
                {word.examples && word.examples.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Ví dụ:
                    </div>
                    <div className="text-xs text-slate-700 pl-2 border-l-2 border-indigo-200 space-y-0.5">
                      <p className="font-semibold">{word.examples[0].sentenceEn}</p>
                      {word.examples[0].translationVi && (
                        <p className="text-slate-500 italic">{word.examples[0].translationVi}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Word Illustration / Image */}
              {word.imageUrl && (
                <div className="sm:w-36 sm:h-28 w-full h-36 flex-shrink-0 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                  <img
                    src={word.imageUrl}
                    alt={word.term}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal Confirm Stop Studying */}
        {confirmStopModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-xl animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">archive</span>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Dừng học list từ này?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bài học sẽ được gỡ khỏi danh sách <strong>&quot;Đang học&quot;</strong> trên Dashboard. Toàn bộ tiến độ và từ vựng bạn đã nhớ vẫn được bảo lưu an toàn.
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
