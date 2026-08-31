'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';

export default function LearnerHomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, profileRes, progressRes, lessonsRes, recsRes, attemptsRes] = await Promise.all<any>([
          apiClient.get('/auth/me'),
          apiClient.get('/learner-profiles/me'),
          apiClient.get('/progress/me'),
          apiClient.get('/lessons?limit=4&status=published'),
          apiClient.get('/recommendations/my'),
          apiClient.get('/exams/attempts/my?limit=3')
        ]);
        
        setData({
          me: meRes,
          profile: profileRes,
          progress: progressRes,
          lessons: lessonsRes?.data || lessonsRes || [],
          recommendations: recsRes?.data || recsRes || [],
          attempts: attemptsRes?.data || attemptsRes || []
        });
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <LearnerShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </LearnerShell>
    );
  }

  if (error) {
    return (
      <LearnerShell>
        <div className="text-center text-red-500 py-8">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary text-white rounded">Thử lại</button>
        </div>
      </LearnerShell>
    );
  }

  const { me, profile, progress, lessons, recommendations, attempts } = data;
  const userName = me?.displayName || 'Bạn';
  const levelName = profile?.level?.name || 'N/A';
  const domainName = profile?.domains?.[0]?.domain?.name || 'N/A';
  const certGoal = profile?.certGoals?.[0]?.certificate?.name || 'N/A';
  const overallProgress = progress?.summary?.overallCompletionPercent ?? 0;
  const rec = recommendations[0];

  return (
    <LearnerShell>
      <div className="space-y-8 w-full">
        {/* 1. Hero Area */}
        <section className="space-y-4 w-full">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Chào {userName}, hôm nay bạn muốn học gì?
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Tiếp tục hành trình chinh phục tiếng Anh IT của bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">school</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trình độ</p>
                <p className="text-base font-black text-slate-900">{levelName}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">cloud</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lĩnh vực IT</p>
                <p className="text-base font-black text-slate-900">{domainName}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mục tiêu chứng chỉ</p>
                <p className="text-base font-black text-slate-900">{certGoal}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 12-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8 w-full min-w-0">
            {/* Bento Card: Current Learning Goal */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/60 rounded-bl-full pointer-events-none -mr-8 -mt-8" />

              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                      Mục tiêu hiện tại
                    </span>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                      {certGoal}
                    </h2>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[28px]">cloud_done</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700">Tiến độ tổng thể</span>
                    <span className="text-primary font-black text-sm">{overallProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/learn/lessons"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-indigo-700 !text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-xs"
                  >
                    <span className="!text-white">Tiếp tục học</span>
                    <span className="material-symbols-outlined text-[18px] !text-white">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Tiếp tục học Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900">Tiếp tục học</h3>
                <Link
                  href="/learn/lessons"
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span>Xem toàn bộ giáo trình</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>

              {lessons?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lessons.slice(0, 2).map((les: any) => (
                    <div key={les.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                      <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex flex-col justify-between !text-white relative">
                        <span className="self-start px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs text-[10px] font-extrabold uppercase !text-white">
                          {les.domain?.name || 'Khác'}
                        </span>
                        <h4 className="font-extrabold text-sm !text-white drop-shadow-xs">{les.title}</h4>
                      </div>
                      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {les.description}
                        </p>
                        <Link
                          href={`/learn/lessons/${les.id}`}
                          className="w-full py-2.5 text-center border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-xs rounded-xl transition-colors block"
                        >
                          Tiếp tục học
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Chưa có bài học nào.</p>
              )}
            </div>
          </div>

          {/* Right Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6 w-full min-w-0">
            {/* AI Recommendation Box */}
            {rec && (
              <div className="bg-[#F5F3FF] border border-[#7C3AED]/30 rounded-3xl p-6 space-y-4 shadow-2xs">
                <div className="flex items-center gap-2 text-[#5B21B6] font-black text-xs uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[20px] text-[#7C3AED]">psychology</span>
                  <span>Đề xuất cho bạn</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Dựa trên kết quả học tập gần đây, bạn nên xem qua:
                </p>
                <div className="bg-white border border-purple-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{rec.title}</h4>
                  </div>
                  <Link
                    href={`/learn/lessons/${rec.resourceId}`}
                    className="w-9 h-9 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-800 flex items-center justify-center transition-colors shrink-0"
                    title="Học ngay"
                  >
                    <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Recent Exam Results */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-slate-500">assignment_turned_in</span>
                <span>Kết quả kiểm tra gần đây</span>
              </h3>
              <div className="space-y-2">
                {attempts?.length > 0 ? attempts.map((attempt: any) => (
                  <div key={attempt.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{attempt.exam?.title || 'Bài thi'}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-primary block">{attempt.scorePercent}%</span>
                      <Link
                        href={`/learn/quiz/result/${attempt.id}`}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        Xem kết quả
                      </Link>
                    </div>
                  </div>
                )) : <p className="text-xs text-slate-500">Chưa có bài thi nào.</p>}
              </div>
            </div>

            {/* Recent Timeline Activities */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-slate-500">history</span>
                <span>Hoạt động gần đây</span>
              </h3>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
                <ul className="relative border-l-2 border-slate-200 ml-2 space-y-4 text-xs">
                  <li className="relative pl-4">
                    <div className="absolute w-2.5 h-2.5 bg-primary rounded-full -left-[6px] top-1 ring-4 ring-white" />
                    <p className="text-slate-800 leading-snug">
                      Đã hoàn thành <strong>{progress?.summary?.completedLessonsCount ?? 0}</strong> bài học
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
