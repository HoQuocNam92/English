'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';

export default function LearnerVocabularyFlashcardsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const lessonId = unwrappedParams.id;

  const [vocabList, setVocabList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [learnedMap, setLearnedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadVocab() {
      try {
        const res: any = await apiClient.get(`/vocabulary?lessonId=${lessonId}&limit=50`);
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

  if (loading) return <LearnerShell><div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div></LearnerShell>;
  if (error || vocabList.length === 0) return <LearnerShell><div className="p-8 text-center text-slate-500">Không có từ vựng nào trong bài học này.</div></LearnerShell>;

  const currentWord = vocabList[selectedIdx];
  const total = vocabList.length;

  const handleNext = () => {
    if (selectedIdx < total - 1) setSelectedIdx(selectedIdx + 1);
  };

  const handlePrev = () => {
    if (selectedIdx > 0) setSelectedIdx(selectedIdx - 1);
  };

  const toggleLearned = (id: string) => {
    setLearnedMap({ ...learnedMap, [id]: !learnedMap[id] });
  };
  const isCurrentLearned = !!learnedMap[currentWord.id];

  return (
    <LearnerShell>
      <div className="space-y-6 w-full max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Từ vựng IT Chuyên ngành</h1>
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
            <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[400px]">
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <h2 className="text-2xl lg:text-3xl font-black text-primary tracking-tight">
                    {currentWord.term}
                  </h2>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Ý nghĩa & Định nghĩa
                </h4>
                <p className="text-lg font-black text-slate-900">{currentWord.definition}</p>
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
