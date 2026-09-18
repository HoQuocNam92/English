'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import { ExamAttemptDetailModal } from '../../test-results/ExamAttemptDetailModal';

export default function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = React.use(params);
  const studentId = unwrappedParams.id;

  const [student, setStudent] = React.useState<any>(null);
  const [progressData, setProgressData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!studentId) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.allSettled([
      apiClient.get<any>(`/users/${studentId}`),
      apiClient.get<any>(`/progress/learners/${studentId}`),
    ])
      .then(([userRes, progRes]) => {
        if (!mounted) return;

        if (userRes.status === 'fulfilled') {
          setStudent(userRes.value?.data ?? userRes.value);
        } else {
          setError(
            userRes.reason instanceof ApiClientError
              ? userRes.reason.message
              : 'Không thể tải thông tin học viên'
          );
        }

        if (progRes.status === 'fulfilled') {
          setProgressData(progRes.value?.data ?? progRes.value);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [studentId]);

  const displayName = student?.displayName || student?.email || 'Học viên';
  const email = student?.email || '';
  const status = student?.status || 'active';
  const level = student?.learnerProfile?.level || 'Chưa thiết lập';
  const domains = student?.learnerProfile?.domains ?? [];
  const careerGoals = student?.learnerProfile?.careerGoals ?? [];
  const certGoals = student?.learnerProfile?.certGoals ?? [];
  const createdAt = student?.createdAt ? new Date(student.createdAt).toLocaleDateString('vi-VN') : '—';
  const lastLogin = student?.lastLoginAt ? new Date(student.lastLoginAt).toLocaleString('vi-VN') : 'Chưa ghi nhận';

  const summary = progressData?.summary;
  const completedLessons = summary?.completedLessons ?? 0;
  const overallCompletion = summary?.overallCompletionPercent ?? 0;
  const avgScore = summary?.averageScorePercent != null ? Math.round(summary.averageScorePercent) : null;
  const recentAttempts = progressData?.recentAttempts ?? [];
  const certProgress = progressData?.certProgress ?? [];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-margin bg-surface">
      {/* Top back navigation */}
      <div className="mb-md">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Quay lại danh sách người học</span>
        </Link>
      </div>

      <div className="mb-lg">
        <h2 className="font-headline-h1 text-headline-h1 text-on-surface mb-xs">Hồ sơ người học</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Xem thông tin chi tiết, lộ trình và kết quả học tập của học viên.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-on-surface-variant gap-3 bg-surface-container-lowest rounded-2xl border border-outline-variant">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Đang tải hồ sơ học viên...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-3">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter max-w-[1440px]">
          {/* Left Column: Profile Card & Cert Goals */}
          <div className="lg:col-span-4 space-y-gutter">
            {/* Student Info Card */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-xs">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  {student?.avatarUrl ? (
                    <img
                      src={student.avatarUrl}
                      alt={displayName}
                      className="w-24 h-24 rounded-full border-4 border-surface shadow-sm object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-surface shadow-sm bg-primary-fixed flex items-center justify-center text-on-primary-fixed text-3xl font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 bg-primary-container text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-surface flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">school</span>
                    PRO
                  </span>
                </div>

                <h2 className="font-headline-h3 text-headline-h3 text-on-surface mb-1">{displayName}</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-3">{email}</p>

                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <span className="bg-surface-container text-on-surface-variant font-label-caps text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">school</span>
                    {level}
                  </span>
                  {domains.length > 0 &&
                    domains.map((d: string) => (
                      <span
                        key={d}
                        className="bg-tertiary-fixed text-on-tertiary-fixed font-label-caps text-xs px-3 py-1 rounded-full flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">code</span>
                        {d}
                      </span>
                    ))}
                </div>

                {careerGoals.length > 0 && (
                  <div className="mb-4 text-xs text-on-surface-variant">
                    <span className="font-medium text-on-surface">Mục tiêu: </span>
                    {careerGoals.join(', ')}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-outline-variant space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Thành viên từ</span>
                  <span className="text-on-surface font-medium">{createdAt}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Lần đăng nhập cuối</span>
                  <span className="text-on-surface font-medium">{lastLogin}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Trạng thái</span>
                  <span
                    className={`font-semibold text-xs px-2.5 py-0.5 rounded-full ${
                      status === 'active'
                        ? 'text-green-700 bg-green-100'
                        : status === 'suspended'
                        ? 'text-red-700 bg-red-100'
                        : 'text-gray-700 bg-gray-100'
                    }`}
                  >
                    {status === 'active' ? 'Đang học' : status === 'suspended' ? 'Tạm khoá' : 'Chưa kích hoạt'}
                  </span>
                </div>
              </div>
            </div>

            {/* Target Certificates Card */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[20px]">target</span>
                <h3 className="font-interface-sb text-interface-sb text-on-surface">Mục tiêu chứng chỉ</h3>
              </div>

              {certProgress.length === 0 ? (
                <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant text-sm text-on-surface-variant text-center">
                  Học viên chưa đăng ký chứng chỉ mục tiêu cụ thể.
                </div>
              ) : (
                <div className="space-y-3">
                  {certProgress.map((cp: any) => (
                    <div
                      key={cp.certificateId}
                      className="bg-surface-container-low p-4 rounded-lg border border-outline-variant relative overflow-hidden"
                    >
                      <h4 className="font-semibold text-sm text-on-surface mb-1">{cp.certificateName}</h4>
                      <p className="text-on-surface-variant text-xs mb-3">
                        Đã hoàn thành: {cp.completedLessons}/{cp.totalLessons} bài học
                      </p>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-lg font-bold text-primary">{cp.completionPercent}%</span>
                        {cp.avgScore != null && (
                          <span className="text-on-surface-variant text-xs">
                            Điểm thi TB: <strong>{cp.avgScore}%</strong>
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-surface-variant rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, cp.completionPercent)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Progress & Recent Attempts */}
          <div className="lg:col-span-8 space-y-gutter">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Radial Progress */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-xs flex flex-col items-center justify-center">
                <h3 className="font-interface-sb text-interface-sb text-on-surface w-full text-left mb-3">
                  Tổng quan tiến độ
                </h3>
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container-high"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="text-primary transition-all duration-500"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${overallCompletion}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="font-headline-h2 text-headline-h2 text-on-surface leading-none">
                      {overallCompletion}%
                    </span>
                    <span className="text-[9px] text-on-surface-variant font-label-caps mt-1">HOÀN THÀNH</span>
                  </div>
                </div>
              </div>

              {/* Lesson Counter */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                    <span className="material-symbols-outlined">library_books</span>
                  </div>
                </div>
                <div>
                  <p className="text-on-surface-variant text-sm mt-3">Bài học đã hoàn thành</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-headline-h1 text-headline-h1 text-on-surface">{completedLessons}</h3>
                    <span className="text-on-surface-variant text-sm">bài học</span>
                  </div>
                </div>
              </div>

              {/* Score Average */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                    <span className="material-symbols-outlined">grade</span>
                  </div>
                </div>
                <div>
                  <p className="text-on-surface-variant text-sm mt-3">Điểm thi trung bình</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-headline-h1 text-headline-h1 text-on-surface">
                      {avgScore != null ? avgScore : '—'}
                    </h3>
                    <span className="text-on-surface-variant text-sm">{avgScore != null ? '/ 100' : ''}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Exam Attempts */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs overflow-hidden">
              <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
                <h3 className="font-headline-h3 text-headline-h3 text-on-surface">
                  Kết quả bài kiểm tra gần đây
                </h3>
                <span className="text-xs text-on-surface-variant">
                  Tổng số: {recentAttempts.length} lượt thi
                </span>
              </div>

              {recentAttempts.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant text-sm">
                  Học viên chưa làm bài thi nào.
                </div>
              ) : (
                <ul className="divide-y divide-outline-variant">
                  {recentAttempts.map((attempt: any) => {
                    const isPassed = Boolean(attempt.passed ?? ((attempt.scorePercent ?? 0) >= 70));
                    const score = Math.round(Number(attempt.scorePercent ?? attempt.score ?? 0));
                    const examTitle = attempt.exam?.title || 'Bài thi';
                    const dateStr = attempt.startedAt
                      ? new Date(attempt.startedAt).toLocaleDateString('vi-VN')
                      : '—';

                    return (
                      <li
                        key={attempt.id}
                        onClick={() => setSelectedAttemptId(attempt.id)}
                        className="p-5 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-on-surface-variant group-hover:bg-primary-fixed group-hover:text-primary transition-colors shrink-0">
                            <span className="material-symbols-outlined">quiz</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-on-surface mb-0.5 group-hover:text-primary transition-colors">
                              {examTitle}
                            </h4>
                            <p className="text-xs text-on-surface-variant">{dateStr}</p>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-4">
                          <div className="flex flex-col items-end">
                            <span
                              className={`text-base font-bold ${
                                isPassed ? 'text-green-600' : 'text-error'
                              }`}
                            >
                              {score} <span className="text-xs text-on-surface-variant font-normal">/ 100</span>
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold mt-1 ${
                                isPassed
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {isPassed ? 'Đạt' : 'Không đạt'}
                            </span>
                          </div>
                          <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
                            chevron_right
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="h-24 md:h-8"></div>

      {/* Detail Modal for attempts */}
      <ExamAttemptDetailModal
        attemptId={selectedAttemptId}
        onClose={() => setSelectedAttemptId(null)}
      />
    </div>
  );
}