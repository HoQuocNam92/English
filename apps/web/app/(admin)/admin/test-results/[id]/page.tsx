'use client';

import * as React from 'react';
import Link from 'next/link';
import { apiClient, ApiClientError } from '@/shared/api/api-client';

export default function AdminTestResultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = React.use(params);
  const attemptId = unwrappedParams.id;

  const [attempt, setAttempt] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!attemptId) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    apiClient
      .get<any>(`/exams/attempts/${attemptId}`)
      .then((res) => {
        if (mounted) {
          setAttempt(res?.data ?? res);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof ApiClientError ? err.message : 'Không thể tải chi tiết bài thi');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [attemptId]);

  const learnerName =
    attempt?.learner?.userDetail?.displayName || attempt?.learner?.email || 'Người học';
  const learnerEmail = attempt?.learner?.email || '';
  const examTitle = attempt?.exam?.title || 'Bài kiểm tra';
  const domainName = attempt?.exam?.domain?.name || 'General IT';
  const levelName = attempt?.exam?.level?.name || 'All Levels';
  const rawScore = attempt?.scorePercent ?? attempt?.score ?? 0;
  const scorePercent = Math.round(Number.isFinite(rawScore) ? rawScore : 0);
  const isPassed = Boolean(attempt?.isPassed ?? attempt?.passed);

  const durationSec =
    attempt?.timeSpentSeconds ??
    (attempt?.submittedAt && attempt?.startedAt
      ? Math.max(
          0,
          Math.round(
            (new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000
          )
        )
      : 0);
  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;
  const timeFormatted = `${mins}m ${secs}s`;

  const submittedDate = attempt?.submittedAt || attempt?.completedAt || attempt?.createdAt;
  const dateFormatted = submittedDate ? new Date(submittedDate).toLocaleString('vi-VN') : '—';

  const questions = Array.isArray(attempt?.questionsSnapshot) ? attempt.questionsSnapshot : [];
  const correctCount =
    attempt?.correctAnswersCount ?? questions.filter((q: any) => q.isUserCorrect).length;
  const totalCount = attempt?.totalQuestions ?? questions.length;

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-margin bg-surface">
      {/* Top back navigation */}
      <div className="mb-md">
        <Link
          href="/admin/test-results"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Quay lại danh sách bài thi</span>
        </Link>
      </div>

      <div className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h2 className="font-headline-h1 text-headline-h1 text-on-surface mb-xs">
            Chi tiết kết quả thi
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
            <span>{examTitle}</span>
            <span>•</span>
            <span>{domainName}</span>
            {levelName && (
              <>
                <span>•</span>
                <span>{levelName}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-on-surface-variant gap-3 bg-surface-container-lowest rounded-2xl border border-outline-variant">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Đang tải chi tiết kết quả...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-xs">
            <div>
              <span className="text-xs text-on-surface-variant uppercase font-semibold">Học viên</span>
              <div className="mt-1 font-semibold text-on-surface text-base">{learnerName}</div>
              {learnerEmail && <div className="text-xs text-on-surface-variant truncate">{learnerEmail}</div>}
            </div>

            <div>
              <span className="text-xs text-on-surface-variant uppercase font-semibold">Điểm số</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={`text-2xl font-black ${isPassed ? 'text-green-600' : 'text-error'}`}>
                  {scorePercent} / 100
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isPassed ? 'Đạt' : 'Không đạt'}
                </span>
              </div>
              <div className="text-xs text-on-surface-variant">
                Đúng {correctCount}/{totalCount} câu
              </div>
            </div>

            <div>
              <span className="text-xs text-on-surface-variant uppercase font-semibold">Thời gian làm</span>
              <div className="mt-1 font-semibold text-on-surface text-base">{timeFormatted}</div>
              <div className="text-xs text-on-surface-variant">Tổng thời gian thi</div>
            </div>

            <div>
              <span className="text-xs text-on-surface-variant uppercase font-semibold">Nộp lúc</span>
              <div className="mt-1 font-semibold text-on-surface text-base">{dateFormatted}</div>
              <div className="text-xs text-on-surface-variant">Thời gian hệ thống</div>
            </div>
          </div>

          {/* Question Review */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
              <h3 className="font-headline-h3 text-headline-h3 text-on-surface">
                Chi tiết bài làm ({questions.length} câu hỏi)
              </h3>
              <span className="text-sm text-on-surface-variant font-medium">
                Số câu đạt: <strong className="text-on-surface">{correctCount}</strong> / {totalCount}
              </span>
            </div>

            {questions.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant bg-surface-container-low rounded-xl">
                Không có dữ liệu câu hỏi trong bài làm này.
              </div>
            ) : (
              questions.map((q: any, idx: number) => {
                const selectedIds = Array.isArray(q.userSelectedOptionIds) ? q.userSelectedOptionIds : [];
                const isCorrect = Boolean(q.isUserCorrect);
                const options = Array.isArray(q.options) ? q.options : [];

                return (
                  <div
                    key={q.id || idx}
                    className={`p-5 rounded-xl border transition-all ${
                      isCorrect ? 'bg-surface-bright border-outline-variant/60' : 'bg-red-500/5 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <p className="font-semibold text-on-surface text-sm leading-relaxed">
                          {q.title || q.content || `Câu hỏi ${idx + 1}`}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                          isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isCorrect ? 'check_circle' : 'cancel'}
                        </span>
                        {isCorrect ? 'Đúng' : 'Sai'}
                      </span>
                    </div>

                    {/* Options */}
                    <div className="space-y-2 mt-3 ml-8">
                      {options.map((opt: any, optIdx: number) => {
                        const optId = opt.id || opt.key || String(optIdx);
                        const isSelected = selectedIds.includes(optId);
                        const isOptCorrect = Boolean(opt.isCorrect);

                        let stateClass = 'border-outline-variant/40 bg-surface';
                        if (isOptCorrect && isSelected) {
                          stateClass = 'border-green-500 bg-green-50 text-green-900';
                        } else if (isOptCorrect && !isSelected) {
                          stateClass = 'border-green-300 bg-green-50/50 text-green-900';
                        } else if (isSelected && !isOptCorrect) {
                          stateClass = 'border-red-400 bg-red-50 text-red-900';
                        }

                        return (
                          <div
                            key={optId}
                            className={`p-3 rounded-lg border flex items-center justify-between text-sm ${stateClass}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                                  isSelected
                                    ? isOptCorrect
                                      ? 'border-green-600 bg-green-600 text-white'
                                      : 'border-red-600 bg-red-600 text-white'
                                    : isOptCorrect
                                    ? 'border-green-600 text-green-600'
                                    : 'border-outline-variant text-on-surface-variant'
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt.text || opt.content}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              {isSelected && (
                                <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-medium">
                                  Học viên chọn
                                </span>
                              )}
                              {isOptCorrect && (
                                <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 font-medium flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px]">check</span>
                                  Đáp án đúng
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="mt-3 ml-8 p-3 rounded-lg bg-surface-container text-xs text-on-surface-variant flex items-start gap-2 border border-outline-variant/40">
                        <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">
                          info
                        </span>
                        <div>
                          <strong className="text-on-surface font-medium">Giải thích: </strong>
                          {q.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      <div className="h-24 md:h-8"></div>
    </main>
  );
}
