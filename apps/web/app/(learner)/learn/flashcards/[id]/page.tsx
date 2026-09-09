'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';

export default function LearnerVocabularyFlashcardsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const lessonId = unwrappedParams.id;

  const [vocabList, setVocabList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [learnedMap, setLearnedMap] = useState<Record<string, boolean>>({});
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    async function loadVocab() {
      try {
        const query = lessonId === 'all' ? '/vocabulary?status=published&limit=3000' : `/vocabulary?lessonId=${lessonId}&limit=3000`;
        const res: any = await apiClient.get(query);
        const items = res?.data || res || [];
        setVocabList(items);
      } catch (err) {
        setError('Failed to load flashcards');
      } finally {
        setLoading(false);
      }
    }
    if (lessonId) loadVocab();
  }, [lessonId]);

  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;
  if (error || vocabList.length === 0) return <LearnerShell><div className="p-8 text-center text-slate-500">Không có từ vựng nào trong bài học này.</div></LearnerShell>;

  const currentWord = vocabList[selectedIdx];
  const total = vocabList.length;

  const handleNext = () => {
    if (selectedIdx < total - 1) {
      setSelectedIdx(selectedIdx + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (selectedIdx > 0) {
      setSelectedIdx(selectedIdx - 1);
      setIsFlipped(false);
    }
  };

  const toggleLearned = (id: string) => {
    setLearnedMap({ ...learnedMap, [id]: !learnedMap[id] });
  };
  const pronounce = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (currentWord.audioUrl) {
      void new Audio(currentWord.audioUrl).play();
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentWord.term);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };
  const isCurrentLearned = !!learnedMap[currentWord.id];

  return (
    <LearnerShell>
      <div className="space-y-6 w-full max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{lessonId === 'all' ? 'Toàn bộ từ vựng IT' : 'Từ vựng IT Chuyên ngành'}</h1>
          </div>
          <Link
            href="/learn/lessons"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
          >
            Về danh mục bài học
          </Link>
        </div>

        <div className="flex flex-col gap-6 items-center w-full">
          <div className="w-full">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xs overflow-hidden">
              <div className="h-[380px] w-full [perspective:1200px]">
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={isFlipped ? 'Xem mặt trước của thẻ' : 'Lật thẻ để xem nghĩa'}
                  onClick={() => setIsFlipped(!isFlipped)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setIsFlipped(!isFlipped);
                    }
                  }}
                  className="relative h-full w-full cursor-pointer text-left [transform-style:preserve-3d] transition-transform duration-500 ease-out"
                  style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                >
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-8 text-center shadow-sm"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
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

                  <div
                    className="absolute inset-0 overflow-y-auto rounded-2xl border border-primary/20 bg-white p-6 shadow-sm lg:p-8"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                      <div><p className="text-[11px] font-bold uppercase tracking-wider text-primary">Mặt sau</p><div className="mt-1 flex items-center gap-2"><h2 className="text-2xl font-black text-primary">{currentWord.term}</h2><button type="button" onClick={pronounce} aria-label={`Phát âm từ ${currentWord.term}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20"><span className="material-symbols-outlined text-xl">volume_up</span></button></div></div>
                      <span className="material-symbols-outlined text-slate-400">flip</span>
                    </div>
                    <div className="mt-5 space-y-4">
                      <div><p className="text-[11px] font-bold uppercase tracking-wide text-primary">Nghĩa tiếng Việt</p><p className="mt-1 text-lg font-bold leading-relaxed text-slate-900">{currentWord.definitionVi || 'Chưa có định nghĩa tiếng Việt.'}</p></div>
                      <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">English definition</p><p className="mt-1 text-sm leading-relaxed text-slate-700">{currentWord.definitionEn || 'No English definition available.'}</p></div>
                      {currentWord.aiExplanation && <div className="rounded-xl bg-violet-50 p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-violet-700">Giải thích thêm</p><p className="mt-1 text-sm leading-relaxed text-slate-700">{currentWord.aiExplanation}</p></div>}
                      {currentWord.examples?.length > 0 && <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-primary">Ví dụ</p><p className="mt-2 text-sm font-semibold text-slate-800">{currentWord.examples[0].sentenceEn}</p>{currentWord.examples[0].translationVi && <p className="mt-1 text-sm text-slate-600">{currentWord.examples[0].translationVi}</p>}</div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
                    Từ {selectedIdx + 1} / {total}
                  </span>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${((selectedIdx + 1) / total) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      disabled={selectedIdx === 0}
                      onClick={handlePrev}
                      className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      Từ trước
                    </button>
                    <button
                      disabled={selectedIdx === total - 1}
                      onClick={handleNext}
                      className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      Từ tiếp theo
                    </button>
                  </div>

                  <button
                    onClick={() => toggleLearned(currentWord.id)}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                      isCurrentLearned
                        ? 'bg-green-600 hover:bg-green-700 !text-white'
                        : 'bg-primary hover:bg-indigo-700 !text-white'
                    }`}
                  >
                    <span className="!text-white">
                      {isCurrentLearned ? 'Đã thuộc từ này' : 'Đánh dấu đã học'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
