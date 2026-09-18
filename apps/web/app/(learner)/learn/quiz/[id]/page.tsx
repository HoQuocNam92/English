'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';

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
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

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

  const executeSubmit = async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);
    
    const formattedAnswers = Object.entries(answers)
      .filter(([_, optIds]) => optIds && optIds.length > 0)
      .map(([qId, optIds]) => ({
        questionId: qId,
        selectedOptionIds: optIds
      }));

    try {
      await apiClient.post(`/exams/attempts/${attemptId}/submit`, { answers: formattedAnswers });
      router.push(`/learn/quiz/result/${attemptId}`);
    } catch (err: any) {
      alert(err?.message || 'Không thể nộp bài thi. Vui lòng thử lại.');
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && !submitting) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && exam && !submitting) {
      setShowSubmitModal(false);
      executeSubmit();
    }
  }, [timeLeft, submitting, exam]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSubmitModal && !submitting) {
        setShowSubmitModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSubmitModal, submitting]);

  const handleSelect = (questionId: string, optId: string, isMultiple = false) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        if (current.includes(optId)) {
          return { ...prev, [questionId]: current.filter(id => id !== optId) };
        } else {
          return { ...prev, [questionId]: [...current, optId] };
        }
      } else {
        return { ...prev, [questionId]: [optId] };
      }
    });
  };

  const handleRequestSubmit = () => {
    setShowSubmitModal(true);
  };

  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;
  if (error || !exam) return <LearnerShell><div className="p-8 text-center text-red-500">{error}</div></LearnerShell>;

  const questions = exam.questions || [];
  const qItem = questions[currentIdx];
  const q = qItem?.question || qItem || {};
  const isMultiple = q.type === 'multiple_choice';
  const total = questions.length;
  const currentAnswers = answers[q.id] || [];

interface UnansweredQuestion {
  index: number;
  id: string;
  isAnswered: boolean;
}

  const unansweredQuestions: UnansweredQuestion[] = questions
    .map((item: any, idx: number): UnansweredQuestion => {
      const qId = item.question?.id || item.id;
      const qAns = answers[qId] || [];
      const isAnswered = qAns.length > 0;
      return { index: idx + 1, id: qId, isAnswered };
    })
    .filter((item: UnansweredQuestion) => !item.isAnswered);

  const answeredCount = total - unansweredQuestions.length;
  const unansweredCount = unansweredQuestions.length;

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
              onClick={handleRequestSubmit}
              disabled={submitting}
              className="px-5 py-2 bg-primary hover:bg-indigo-700 !text-white font-bold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
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
                {isMultiple ? (
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200/60 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_box</span>
                    Chọn nhiều đáp án
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-on-surface-variant bg-surface-container px-2.5 py-0.5 rounded-md">
                    Chọn 1 đáp án
                  </span>
                )}
              </div>

              <h3 className="text-base lg:text-lg font-bold text-on-surface leading-relaxed whitespace-pre-wrap">
                {q.prompt}
              </h3>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {q.options?.map((opt: any, oIdx: number) => {
                  const isSelected = currentAnswers.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelect(q.id, opt.id, isMultiple)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3.5 ${
                        isSelected
                          ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20'
                          : 'bg-surface-bright border-outline-variant/50 hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 flex-1">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected ? 'bg-primary text-white' : 'bg-surface-container text-on-surface'
                          }`}
                        >
                          {opt.key || String.fromCharCode(65 + oIdx)}
                        </div>
                        <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                          {opt.text}
                        </span>
                      </div>

                      {isMultiple ? (
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'bg-primary border-primary text-white' : 'border-outline-variant bg-surface-container/40'
                          }`}
                        >
                          {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
                        </div>
                      ) : (
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'border-primary' : 'border-outline-variant'
                          }`}
                        >
                          {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Nav Buttons */}
              <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(currentIdx - 1)}
                  className="px-4 py-2 border border-outline-variant rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Câu trước</span>
                </button>

                {currentIdx < total - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(currentIdx + 1)}
                    className="px-5 py-2 bg-primary hover:bg-indigo-700 !text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <span className="!text-white">Câu tiếp theo</span>
                    <span className="material-symbols-outlined text-[16px] !text-white">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    onClick={handleRequestSubmit}
                    disabled={submitting}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 !text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm disabled:opacity-50 cursor-pointer"
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
                  const isAnswered = (answers[qId] || []).length > 0;
                  const isCurrent = idx === currentIdx;

                  return (
                    <button
                      key={qId || idx}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                  <span>Đã trả lời ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-surface-container" />
                  <span>Chưa trả lời ({unansweredCount})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation & Unanswered Warning Modal */}
      {showSubmitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => !submitting && setShowSubmitModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {unansweredCount > 0 ? (
              /* Case 1: Has Unanswered Questions */
              <>
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[26px]">warning</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface">Chưa hoàn thành bài thi</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Bạn vẫn còn <span className="font-bold text-amber-700">{unansweredCount}</span> câu chưa trả lời trên tổng số <span className="font-bold">{total}</span> câu.
                    </p>
                  </div>
                </div>

                {/* List of Unanswered Question Badges */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-2.5">
                  <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                    Các câu chưa trả lời ({unansweredCount}):
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {unansweredQuestions.map(item => (
                      <button
                        key={item.id || item.index}
                        type="button"
                        onClick={() => {
                          setCurrentIdx(item.index - 1);
                          setShowSubmitModal(false);
                        }}
                        title={`Bấm để tới câu hỏi #${item.index}`}
                        className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>Câu #{item.index}</span>
                        <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    💡 Bạn có thể bấm vào số câu ở trên để xem lại và hoàn thành câu hỏi.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/50 text-xs text-on-surface-variant">
                  ⚠️ <strong>Lưu ý:</strong> Nếu nộp bài ngay bây giờ, các câu chưa trả lời sẽ bị tính <strong>0 điểm</strong>.
                </div>

                {/* Modal Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    disabled={submitting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit_note</span>
                    Tiếp tục làm bài
                  </button>
                  <button
                    type="button"
                    onClick={executeSubmit}
                    disabled={submitting}
                    className="py-2.5 px-4 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        <span>Đang nộp...</span>
                      </>
                    ) : (
                      <span>Vẫn nộp bài</span>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Case 2: All Questions Answered */
              <>
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-green-100 border border-green-200 text-green-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[26px]">task_alt</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface">Xác nhận nộp bài thi</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Bạn đã hoàn thành toàn bộ <span className="font-bold text-green-700">{total}/{total}</span> câu hỏi!
                    </p>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Bạn có chắc chắn muốn nộp bài để kết thúc phần thi không? Sau khi nộp bài, bạn sẽ xem được điểm số và đáp án chi tiết.
                </p>

                {/* Modal Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    disabled={submitting}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-outline-variant hover:bg-surface-container font-semibold text-xs text-on-surface transition-colors cursor-pointer"
                  >
                    Kiểm tra lại
                  </button>
                  <button
                    type="button"
                    onClick={executeSubmit}
                    disabled={submitting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        <span>Đang nộp...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">check</span>
                        <span>Nộp bài ngay</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </LearnerShell>
  );
}

