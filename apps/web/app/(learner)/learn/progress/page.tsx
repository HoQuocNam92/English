'use client';

import { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';

export default function LearnerPersonalProgressPage() {
  const [data, setData] = useState<any>({ progress: null, profile: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [progressRes, profileRes] = await Promise.all<any>([
          apiClient.get('/progress/me'),
          apiClient.get('/learner-profiles/me')
        ]);
        setData({
          progress: progressRes,
          profile: profileRes
        });
      } catch (err) {
        setError('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LearnerShell><div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div></LearnerShell>;
  if (error || !data.progress) return <LearnerShell><div className="p-8 text-center text-red-500">{error || 'Empty state'}</div></LearnerShell>;

  const { progress, profile } = data;
  const overallCompletion = progress?.summary?.overallCompletionPercent ?? 0;
  const certGoal = profile?.certGoals?.[0]?.certificate?.name || 'N/A';
  const domains = profile?.domains || [];
  const recentAttempts = progress?.recentAttempts || [];

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Báo cáo Năng lực & Tiến độ Cá nhân</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Theo dõi sự tiến bộ, tỷ lệ ghi nhớ thuật ngữ và mức độ sẵn sàng thi chứng chỉ quốc tế.
          </p>
        </div>

        {/* Certificate Readiness Hero Card */}
        <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  MỤC TIÊU
                </span>
                <span className="text-xs font-semibold text-primary">{certGoal}</span>
              </div>
              <h3 className="text-xl font-extrabold text-on-surface">Độ sẵn sàng: {overallCompletion}%</h3>
            </div>
          </div>

          <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${overallCompletion}%` }} />
          </div>
        </div>

        {/* 2-Column Skills & Pathways */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Domain Skills (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-on-surface">Độ thành thạo theo chuyên ngành</h3>
            <div className="space-y-4">
              {domains.length > 0 ? domains.map((d: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-on-surface">{d.domain?.name} ({d.domain?.code})</span>
                  </div>
                </div>
              )) : <p className="text-xs text-slate-500">Chưa có dữ liệu chuyên ngành.</p>}
            </div>
          </div>

          {/* Recent Exam Attempts (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-on-surface">Kết quả thi gần đây</h3>
            <div className="space-y-2.5 text-xs">
              {recentAttempts.length > 0 ? recentAttempts.map((attempt: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-surface-bright border border-outline-variant/30">
                  <span className="flex-1 font-semibold text-on-surface">Bài thi #{attempt.examId || idx + 1}</span>
                  <span className={`font-bold ${attempt.passed ? 'text-green-600' : 'text-red-500'}`}>{attempt.scorePercent}%</span>
                </div>
              )) : <p className="text-slate-500">Chưa có dữ liệu bài thi.</p>}
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
