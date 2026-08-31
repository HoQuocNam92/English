'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';

export default function LearnerQuizTakingPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const examId = unwrappedParams.id;
  const router = useRouter();
  
  const [exam, setExam] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    async function startExam() {
      try {
        const [attemptRes, examRes] = await Promise.all<any>([
          apiClient.post(`/exams/${examId}/attempts`, {}),
          apiClient.get(`/exams/${examId}`)
        ]);
        
        setAttemptId(attemptRes?.id || attemptRes?.data?.id || attemptRes);
        const examData = examRes?.data || examRes;
        setExam(examData);
        setTimeLeft((examData.durationMinutes || 60) * 60);
      } catch (err) {
        setError('Failed to load exam or start attempt');
      } finally {
        setLoading(false);
      }
    }
    if (examId) startExam();
  }, [examId]);

  useEffect(() => {
    if (timeLeft > 0 && !submitting) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && exam) {
      handleSubmit();
    }
  }, [timeLeft, submitting, exam]);

  const handleSelect = (questionId: string, optId: string) => {
    setAnswers({ ...answers, [questionId]: optId });
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    setSubmitting(true);
    
    const formattedAnswers = Object.keys(answers).map(qId => ({
      questionId: qId,
      selectedOptionIds: [answers[qId]]
    }));

    try {
      await apiClient.post(`/exams/attempts/${attemptId}/submit`, { answers: formattedAnswers });
      router.push(`/learn/quiz/result/${attemptId}`);
    } catch (err) {
      alert('Submit failed');
      setSubmitting(false);
    }
  };

  if (loading) return <LearnerShell><div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div></LearnerShell>;
  if (error || !exam) return <LearnerShell><div className="p-8 text-center text-red-500">{error}</div></LearnerShell>;

  const questions = exam.questions || [];
  const q = questions[currentIdx]?.question || questions[currentIdx] || {};
  const total = questions.length;
  const selectedOpt = answers[q.id];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
        {/* Exam Header Bar */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs flex flex-wrap justify-between items-center gap-4 sticky top-20 z-20">
          <div>
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">
              {exam.title}
            </span>
            <h2 className="text-base font-bold text-on-surface">Đề thi mô phỏng</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
              <span className="material-symbols-outlined text-[20px] text-primary">timer</span>
              <span className="font-mono text-sm font-extrabold text-primary">{formatTime(timeLeft)}</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 bg-primary hover:bg-indigo-700 !text-white font-bold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Đang nộp...' : 'Nộp bài thi'}
            </button>
          </div>
        </div>

        {/* 2-Column Question & Palette Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30">
                <span className="text-xs font-bold text-primary">Câu hỏi #{currentIdx + 1} / {total}</span>
              </div>

              <h3 className="text-base lg:text-lg font-bold text-on-surface leading-relaxed whitespace-pre-wrap">
                {q.prompt}
              </h3>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {q.options?.map((opt: any) => {
                  const isSelected = selectedOpt === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelect(q.id, opt.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                        isSelected
                          ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20'
                          : 'bg-surface-bright border-outline-variant/50 hover:border-primary/40'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-primary text-white' : 'bg-surface-container text-on-surface'
                        }`}
                      >
                        {opt.key || opt.id.substring(0,2)}
                      </div>
                      <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Nav Buttons */}
              <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(currentIdx - 1)}
                  className="px-4 py-2 border border-outline-variant rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Câu trước</span>
                </button>

                {currentIdx < total - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(currentIdx + 1)}
                    className="px-5 py-2 bg-primary hover:bg-indigo-700 !text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <span className="!text-white">Câu tiếp theo</span>
                    <span className="material-symbols-outlined text-[16px] !text-white">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 !text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    <span className="!text-white">Hoàn thành & Nộp bài</span>
                    <span className="material-symbols-outlined text-[16px] !text-white">check</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Question Palette (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-on-surface">Danh sách câu hỏi</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((item: any, idx: number) => {
                  const qId = item.question?.id || item.id;
                  const isAnswered = !!answers[qId];
                  const isCurrent = idx === currentIdx;

                  return (
                    <button
                      key={qId}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-9 rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? 'ring-2 ring-primary bg-primary text-white'
                          : isAnswered
                          ? 'bg-green-100 text-green-900 border border-green-300'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-outline-variant/30 space-y-2 text-[11px] text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-green-200 border border-green-400" />
                  <span>Đã trả lời ({Object.keys(answers).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-surface-container" />
                  <span>Chưa trả lời ({total - Object.keys(answers).length})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
