'use client';
import { AppIcon } from '@/shared/ui/AppIcon';

import { ActionButton, ActionGroup } from '@/shared/ui/ActionButton';
import { LevelBadge } from '@/shared/ui/LevelBadge';
import { Dropdown } from '@/shared/ui/Dropdown';
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
  const [editingGoals, setEditingGoals] = React.useState(false);
  const [savingGoals, setSavingGoals] = React.useState(false);
  const [goalOptions, setGoalOptions] = React.useState<{ levels: any[]; domains: any[]; certificates: any[]; careerGoals: any[] }>({ levels: [], domains: [], certificates: [], careerGoals: [] });
  const [goalForm, setGoalForm] = React.useState({ levelCode: '', domainCodes: [] as string[], certificateCodes: [] as string[], careerGoalCodes: [] as string[] });

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

  const openGoalEditor = async () => {
    setError(null);
    setGoalForm({ levelCode: student?.learnerProfile?.level ?? '', domainCodes: student?.learnerProfile?.domains ?? [], certificateCodes: student?.learnerProfile?.certGoals ?? [], careerGoalCodes: student?.learnerProfile?.careerGoals ?? [] });
    setEditingGoals(true);
    try {
      const [levelsResult, domainsResult, certificatesResult, careerGoalsResult] = await Promise.all([
        apiClient.get<any>('/levels'), apiClient.get<any>('/domains'), apiClient.get<any>('/certificates'), apiClient.get<any>('/career-goals'),
      ]);
      setGoalOptions({ levels: levelsResult?.data ?? levelsResult ?? [], domains: domainsResult?.data ?? domainsResult ?? [], certificates: certificatesResult?.data ?? certificatesResult ?? [], careerGoals: careerGoalsResult?.data ?? careerGoalsResult ?? [] });
    } catch (cause) { setError(cause instanceof ApiClientError ? cause.message : 'Không thể tải đầy đủ danh mục hồ sơ học tập'); }
  };

  const saveGoals = async () => {
    setSavingGoals(true); setError(null);
    try {
      await apiClient.put(`/learner-profiles/${studentId}/goals`, goalForm);
      const refreshed: any = await apiClient.get(`/users/${studentId}`);
      setStudent(refreshed?.data ?? refreshed);
      setEditingGoals(false);
    } catch (cause) { setError(cause instanceof ApiClientError ? cause.message : 'Không thể cập nhật mục tiêu học tập'); }
    finally { setSavingGoals(false); }
  };

  const displayName = student?.displayName || student?.email || 'Học viên';
  const email = student?.email || '';
  const status = student?.status || 'active';
  const level = student?.learnerProfile?.level || 'Chưa thiết lập';
  const domains = student?.learnerProfile?.domains ?? [];
  const certGoals = student?.learnerProfile?.certGoals ?? [];
  const createdAt = student?.createdAt ? new Date(student.createdAt).toLocaleDateString('vi-VN') : '—';
  const lastLogin = student?.lastLoginAt
    ? `${new Date(student.lastLoginAt).toLocaleDateString('vi-VN')} ${new Date(student.lastLoginAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
    : 'Chưa ghi nhận';

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
          <AppIcon className=" text-[18px]">arrow_back</AppIcon>
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
          <AppIcon className=" text-[20px]">error</AppIcon>
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
                    <AppIcon className=" text-[12px]">school</AppIcon>
                    PRO
                  </span>
                </div>

                <h2 className="font-headline-h3 text-headline-h3 text-on-surface mb-1">{displayName}</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-3">{email}</p>

                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <LevelBadge level={level} />
                  {domains.length > 0 &&
                    domains.map((d: string) => (
                      <span
                        key={d}
                        className="bg-tertiary-fixed text-on-tertiary-fixed font-label-caps text-xs px-3 py-1 rounded-full flex items-center gap-1"
                      >
                        <AppIcon className=" text-[14px]">code</AppIcon>
                        {d}
                      </span>
                    ))}
                </div>

                <ActionGroup><ActionButton action="edit" label="Chỉnh sửa hồ sơ học tập" onClick={() => void openGoalEditor()} /></ActionGroup>

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
                <AppIcon className=" text-primary text-[20px]">target</AppIcon>
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
                    <AppIcon className="">library_books</AppIcon>
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
                    <AppIcon className="">grade</AppIcon>
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
                            <AppIcon className="">quiz</AppIcon>
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
                          <AppIcon className=" text-outline group-hover:text-primary transition-colors">
                            chevron_right
                          </AppIcon>
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
      {editingGoals && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Chỉnh sửa hồ sơ học tập">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold">Chỉnh sửa hồ sơ học tập</h2><p className="mt-1 text-sm text-on-surface-variant">Cập nhật trình độ, lĩnh vực quan tâm và mục tiêu chứng chỉ.</p></div><button type="button" onClick={() => setEditingGoals(false)} aria-label="Đóng"><AppIcon className="">close</AppIcon></button></div>
            <label className="mt-6 block text-sm font-bold">Trình độ tiếng Anh<Dropdown value={goalForm.levelCode} onChange={event => setGoalForm(current => ({ ...current, levelCode: event.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-outline-variant bg-white px-3 font-normal"><option value="">Chọn trình độ</option>{goalOptions.levels.map(item => <option key={item.id} value={item.code}>{item.name}</option>)}</Dropdown></label>
            <fieldset className="mt-5"><legend className="text-sm font-bold">Lĩnh vực CNTT quan tâm</legend><div className="mt-2 grid gap-2 rounded-xl border border-outline-variant p-4 sm:grid-cols-2">{goalOptions.domains.map(item => <label key={item.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={goalForm.domainCodes.includes(item.code)} onChange={event => setGoalForm(current => ({ ...current, domainCodes: event.target.checked ? [...current.domainCodes, item.code] : current.domainCodes.filter(code => code !== item.code) }))} className="accent-primary" />{item.name}</label>)}</div></fieldset>
            <fieldset className="mt-5"><legend className="text-sm font-bold">Mục tiêu nghề nghiệp</legend><div className="mt-2 grid gap-2 rounded-xl border border-outline-variant p-4 sm:grid-cols-2">{goalOptions.careerGoals.map(item => <label key={item.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={goalForm.careerGoalCodes.includes(item.code)} onChange={event => setGoalForm(current => ({ ...current, careerGoalCodes: event.target.checked ? [...current.careerGoalCodes, item.code] : current.careerGoalCodes.filter(code => code !== item.code) }))} className="accent-primary" />{item.name}</label>)}</div></fieldset>
            <fieldset className="mt-5"><legend className="text-sm font-bold">Mục tiêu chứng chỉ</legend><div className="mt-2 grid gap-2 rounded-xl border border-outline-variant p-4 sm:grid-cols-2">{goalOptions.certificates.map(item => <label key={item.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={goalForm.certificateCodes.includes(item.code)} onChange={event => setGoalForm(current => ({ ...current, certificateCodes: event.target.checked ? [...current.certificateCodes, item.code] : current.certificateCodes.filter(code => code !== item.code) }))} className="accent-primary" />{item.code} - {item.name}</label>)}</div></fieldset>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setEditingGoals(false)} className="rounded-xl border border-outline-variant px-4 py-2.5 text-sm font-bold">Hủy</button><button type="button" disabled={savingGoals} onClick={() => void saveGoals()} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">{savingGoals ? 'Đang lưu...' : 'Lưu hồ sơ'}</button></div>
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
