'use client';

import * as React from 'react';
import Link from 'next/link';
import { AppShell } from '@/shared/layout';
import { useLearnerProfileDetail } from '@/features/learner-profiles/presentation';

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const { profile, loading } = useLearnerProfileDetail(unwrappedParams.id);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="p-8 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/40">
          <span className="material-symbols-outlined text-4xl text-outline mb-2">person_off</span>
          <h3 className="text-base font-bold text-on-surface">Không tìm thấy thông tin học viên</h3>
          <p className="text-xs text-on-surface-variant mt-1 mb-4">Hồ sơ người học này không tồn tại trong hệ thống.</p>
          <Link
            href="/students"
            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors inline-block"
          >
            Quay lại danh sách
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex justify-between items-center">
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Link href="/students" className="hover:text-primary transition-colors">
              Hồ sơ người học
            </Link>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-primary font-semibold">{profile.displayName}</span>
          </nav>

          <Link
            href="/students"
            className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Danh sách</span>
          </Link>
        </div>

        {/* 2-Column Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Main Profile Info Card */}
            <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-primary text-on-primary font-extrabold text-2xl flex items-center justify-center border-4 border-surface shadow-sm">
                    {profile.avatarInitials || profile.displayName.charAt(0)}
                  </div>
                  <span className="absolute bottom-0 right-0 bg-primary-container text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-surface flex items-center gap-0.5">
                    PRO
                  </span>
                </div>

                <h3 className="text-lg font-bold text-on-surface mb-0.5">{profile.displayName}</h3>
                <p className="text-xs text-on-surface-variant mb-4">{profile.email}</p>

                <div className="flex flex-wrap justify-center gap-1.5 mb-5">
                  <span className="bg-surface-container text-on-surface-variant text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">school</span>
                    {profile.level}
                  </span>
                  <span className="bg-primary-fixed text-on-primary-fixed text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">cloud</span>
                    {profile.itField}
                  </span>
                </div>

                <div className="w-full flex gap-2">
                  <button className="flex-1 py-2 px-3 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-1.5 shadow-2xs">
                    <span className="material-symbols-outlined text-[16px]">mail</span>
                    <span>Gửi tin nhắn</span>
                  </button>
                  <button className="p-2 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-outline-variant/30 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Thành viên từ:</span>
                  <span className="font-semibold text-on-surface">{profile.joinedAtLabel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Lần đăng nhập cuối:</span>
                  <span className="font-semibold text-on-surface">{profile.lastActiveLabel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Trạng thái tài khoản:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 uppercase">
                    {profile.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Target Certification Goal Card */}
            <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[22px]">workspace_premium</span>
                <h4 className="text-sm font-bold text-on-surface">Mục tiêu chứng chỉ</h4>
              </div>

              <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/30 space-y-1">
                <span className="text-[10px] font-bold uppercase text-primary tracking-wider block">
                  {profile.certificateLevelLabel}
                </span>
                <p className="text-xs font-bold text-on-surface">{profile.certificateGoal}</p>
                <p className="text-[11px] text-on-surface-variant">🎯 Mục tiêu: {profile.careerGoal}</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Tiến độ ôn luyện</span>
                  <span className="font-bold text-on-surface">{profile.progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${profile.progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-outline text-right">Dự kiến hoàn thành: {profile.estimatedCompletionLabel}</p>
              </div>
            </div>
          </div>

          {/* Right Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
                <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Bài học đã học</span>
                <div className="text-xl font-extrabold text-on-surface">
                  {profile.completedLessons}/{profile.totalLessons}
                </div>
                <span className="text-[10px] text-green-600 font-semibold">{profile.lessonGrowthLabel}</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
                <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Điểm kiểm tra TB</span>
                <div className="text-xl font-extrabold text-on-surface">{profile.averageScore}%</div>
                <span className="text-[10px] text-green-600 font-semibold">{profile.averageScoreDeltaLabel}</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
                <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Bài test đã làm</span>
                <div className="text-xl font-extrabold text-on-surface">14 đề</div>
                <span className="text-[10px] text-outline">12 đạt / 2 chưa đạt</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
                <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Tổng giờ học</span>
                <div className="text-xl font-extrabold text-on-surface">28.5h</div>
                <span className="text-[10px] text-primary font-semibold">+4.2h tuần này</span>
              </div>
            </div>

            {/* Topic Mastery Progress */}
            <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
              <h4 className="text-sm font-bold text-on-surface mb-4">Mức độ thành thạo theo chủ đề</h4>
              <div className="space-y-4">
                {profile.topicProgress.map((topic) => (
                  <div key={topic.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-on-surface">{topic.title}</span>
                      <span className="font-bold text-on-surface">{topic.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          topic.tone === 'primary' ? 'bg-primary' : topic.tone === 'secondary' ? 'bg-secondary' : 'bg-ai-accent'
                        }`}
                        style={{ width: `${topic.progressPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Assessments History */}
            <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-on-surface">Lịch sử làm bài kiểm tra</h4>
                <span className="text-xs text-outline">{profile.recentAssessments.length} bài gần nhất</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/30 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase">
                      <th className="py-2.5 px-3">Bài thi / Quiz</th>
                      <th className="py-2.5 px-3">Thời gian nộp</th>
                      <th className="py-2.5 px-3">Thời lượng</th>
                      <th className="py-2.5 px-3">Điểm số</th>
                      <th className="py-2.5 px-3 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {profile.recentAssessments.map((a) => (
                      <tr key={a.id} className="hover:bg-surface-container-low/30">
                        <td className="py-3 px-3 font-semibold text-on-surface">{a.title}</td>
                        <td className="py-3 px-3 text-on-surface-variant">{a.submittedAtLabel}</td>
                        <td className="py-3 px-3 text-on-surface-variant">{a.durationLabel}</td>
                        <td className="py-3 px-3 font-bold text-on-surface">
                          {a.score}/{a.maxScore} ({Math.round((a.score / a.maxScore) * 100)}%)
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              a.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {a.status === 'passed' ? 'Đạt' : 'Cần ôn lại'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
