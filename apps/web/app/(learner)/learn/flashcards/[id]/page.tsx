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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
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
      setCurrentPage(1);
    } catch {
      setError('Không thể tải danh sách từ vựng.');
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    if (lessonId) loadLessonVocabs();
  }, [lessonId, loadLessonVocabs]);

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

  const totalPages = Math.max(1, Math.ceil(displayWords.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedWords = displayWords.slice(startIndex, startIndex + pageSize);

  const goToPage = (p: number) => {
    const page = Math.min(Math.max(1, p), totalPages);
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 140, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

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

        {/* SRS Alert Banner if words need review in this lesson */}
        {stats.needsReview > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-xl">alarm</span>
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-amber-950">
                  Bài học có <strong>{stats.needsReview} từ vựng</strong> đã đến hạn ôn tập (SRS)!
                </div>
                <div className="text-[11px] text-amber-800/80">
                  Ôn tập đúng chu kỳ giúp khắc sâu từ vựng vào trí nhớ dài hạn.
                </div>
              </div>
            </div>
            <Link
              href={`/learn/flashcards/${lessonId}/practice?onlyNeedsReview=true`}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
            >
              <span className="material-symbols-outlined text-base">play_circle</span>
              <span>Ôn ngay {stats.needsReview} từ đến hạn</span>
            </Link>
          </div>
        )}

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
            <Link
              href={`/learn/flashcards/${lessonId}/quiz`}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-primary hover:border-primary/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
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

        {/* Word Counter & Pagination Overview */}
        <div className="flex flex-wrap items-center justify-between text-xs font-bold text-slate-500 pt-2 border-t border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <span>List có {displayWords.length} từ</span>
            {totalPages > 1 && (
              <span className="text-slate-400 font-normal">
                (Đang hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, displayWords.length)})
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {stats.needsReview > 0 && (
              <span className="text-amber-600 font-bold">Cần ôn: {stats.needsReview}</span>
            )}
            {stats.remembered > 0 && (
              <span className="text-emerald-600">Đã nhớ: {stats.remembered}/{stats.total} từ</span>
            )}
            {totalPages > 1 && (
              <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                Trang {currentPage} / {totalPages}
              </span>
            )}
          </div>
        </div>

        {/* Vocabulary Cards List (Vertical List View) */}
        <div className="space-y-4">
          {paginatedWords.map((word: any, index: number) => {
            const wordIndex = startIndex + index + 1;
            return (
              <div
                key={word.id || `${currentPage}-${index}`}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between gap-4 hover:shadow-xs transition-shadow relative"
              >
                {/* Word Details */}
                <div className="space-y-3 flex-1">
                  {/* Term, Part of Speech, IPA & Audio */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-slate-300">#{wordIndex}</span>
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
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500 font-medium">
              Hiển thị <strong className="text-slate-800">{startIndex + 1} - {Math.min(startIndex + pageSize, displayWords.length)}</strong> trong tổng số <strong className="text-slate-800">{displayWords.length}</strong> từ
            </div>

            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1 shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
                <span>Trước</span>
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs font-bold text-slate-400">
                        ...
                      </span>
                    );
                  }
                  const pageNum = Number(p);
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => goToPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                        isActive
                          ? 'bg-primary text-white shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1 shadow-2xs"
              >
                <span>Sau</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Confirm Stop Studying */}
        {confirmStopModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="bg-white rounded-3xl max-w-[480px] w-full p-6 space-y-5 shadow-xl animate-in fade-in zoom-in-95">
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
