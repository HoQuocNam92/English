'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';

export default function LearnerQuizResultPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const attemptId = unwrappedParams.id;
  
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAttempt() {
      try {
        const res: any = await apiClient.get(`/exams/attempts/${attemptId}`);
        setAttempt(res?.data || res);
      } catch (err) {
        setError('Failed to load attempt result');
      } finally {
        setLoading(false);
      }
    }
    if (attemptId) loadAttempt();
  }, [attemptId]);

  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;
  if (error || !attempt) return <LearnerShell><div className="p-8 text-center text-red-500">{error || 'Not found'}</div></LearnerShell>;

  const rawScore = Number(attempt.scorePercent ?? attempt.score ?? 0);
  const scorePercent = Math.min(100, Math.max(0, Math.round(Number.isFinite(rawScore) ? rawScore : 0)));
  const isPassed = Boolean(attempt.isPassed ?? attempt.passed);
  const examTitle = attempt.exam?.title || 'Bài thi';
  const questions = Array.isArray(attempt.questionsSnapshot) ? attempt.questionsSnapshot : [];
  const correctCount = Number(attempt.correctAnswersCount ?? questions.filter((q: any) => q.isUserCorrect).length);
  const totalCount = Number(attempt.totalQuestions ?? questions.length);

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
        {/* Top Score Banner */}
        <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className={`w-28 h-24 rounded-2xl border flex flex-col items-center justify-center shrink-0 overflow-hidden ${isPassed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              <span className="text-3xl leading-none font-black tabular-nums">{scorePercent}%</span>
              <span className="text-[10px] font-extrabold uppercase">{isPassed ? 'ĐẠT CHUẨN' : 'CHƯA ĐẠT'}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {isPassed ? '🎉 Đã đạt' : 'Chưa đạt'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-on-surface">{examTitle}</h2>
              <p className="text-xs text-on-surface-variant">
                Đúng <strong>{correctCount}/{totalCount} câu</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/learn/quiz/tech"
              className="px-5 py-2.5 bg-primary hover:bg-indigo-700 !text-white font-bold text-xs rounded-xl transition-colors shadow-2xs text-center"
            >
              <span className="!text-white">Làm đề thi khác</span>
            </Link>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-on-surface">Xem lại đáp án chi tiết</h3>
          <div className="space-y-4">
            {questions.map((q: any, idx: number) => {
              const selectedIds = Array.isArray(q.userSelectedOptionIds) ? q.userSelectedOptionIds : [];
              const selectedOptions = q.options?.filter((o: any) => selectedIds.includes(o.id || o.key)) ?? [];
              const correctOptions = q.options?.filter((o: any) => o.isCorrect) ?? [];
              const isCorrect = Boolean(q.isUserCorrect);
              
              return (
                <div
                  key={q.id || idx}
                  className="p-5 rounded-xl bg-surface-bright border border-outline-variant/40 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isCorrect ? 'check' : 'close'}
                      </span>
                      {isCorrect ? 'Chính xác' : 'Chưa đúng'}
                    </span>
                    <span className="text-xs text-outline font-semibold">Câu #{idx + 1}</span>
                  </div>

                  <h4 className="text-xs lg:text-sm font-bold text-on-surface leading-relaxed whitespace-pre-wrap">{q.prompt}</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-3 rounded-lg bg-surface-container-low">
                    <div>
                      <span className="text-outline block text-[11px]">Bạn đã chọn:</span>
                      <span className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        {selectedOptions.length ? selectedOptions.map((o: any) => o.text).join(', ') : 'Không chọn'}
                      </span>
                    </div>
                    <div>
                      <span className="text-outline block text-[11px]">Đáp án đúng:</span>
                      <span className="font-bold text-green-700">
                        {correctOptions.length ? correctOptions.map((o: any) => o.text).join(', ') : 'Chưa có đáp án đúng'}
                      </span>
                    </div>
                  </div>

                  {q.explanation && (
                    <div className="p-3.5 rounded-lg bg-purple-50/80 border border-purple-200 text-xs space-y-1 mt-2">
                      <span className="font-bold text-ai-accent">💡 Giải thích kiến thức:</span>
                      <p className="text-on-surface leading-relaxed m-0">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
            {!questions.length && (
              <p className="py-8 text-center text-sm text-on-surface-variant">
                Chưa có dữ liệu câu hỏi để xem lại.
              </p>
            )}
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
