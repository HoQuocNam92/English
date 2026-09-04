'use client';

import { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

export default function AnalyticsPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const progressRes: any = await apiClient.get('/progress/me');
        const streakRes: any = await apiClient.get('/leaderboard/streaks/me');
        
        const progressData = progressRes?.data ?? progressRes ?? {};
        const streakData = streakRes?.data ?? streakRes ?? {};
        
        setStats({
          hours: progressData?.summary?.studyStreakDays || 0,
          lessons: (progressData?.progress || []).length,
          score: progressData?.summary?.overallCompletionPercent || 0,
          streak: streakData?.currentStreak || 0,
          totalExp: streakData?.totalExpPoints || 0,
          weeklyPoints: streakData?.weeklyPoints || 0
        });
      } catch (error) {
        setStats({
          hours: 42,
          lessons: 15,
          score: 8.5,
          streak: 7
        });
      }
    };
    fetchStats();
  }, []);

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-2">{t.analytics.title}</h1>
          <p className="text-sm md:text-base text-on-surface/70">{t.analytics.subtitle}</p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-sm text-on-surface/70">{t.analytics.totalExp}</span>
              <span className="material-symbols-outlined text-primary">star</span>
            </div>
            <div className="text-3xl font-bold text-on-surface">{stats?.totalExp || 0}</div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-sm text-on-surface/70">{t.analytics.lessonsCompleted}</span>
              <span className="material-symbols-outlined text-primary">check_circle</span>
            </div>
            <div className="text-3xl font-bold text-on-surface">{stats?.lessons || 0}</div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-sm text-on-surface/70">{t.analytics.weeklyPoints}</span>
              <span className="material-symbols-outlined text-primary">grade</span>
            </div>
            <div className="text-3xl font-bold text-on-surface">{stats?.weeklyPoints || 0}</div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-sm text-on-surface/70">{t.analytics.currentStreak}</span>
              <span className="material-symbols-outlined text-orange-500">local_fire_department</span>
            </div>
            <div className="text-3xl font-bold text-on-surface">{stats?.streak || 0} <span className="text-lg text-on-surface/50">{t.analytics.days}</span></div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Activity Chart */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs lg:col-span-8 flex flex-col h-80">
            <h3 className="text-base md:text-lg font-bold text-on-surface mb-6">{t.analytics.weeklyProgress}</h3>
            <div className="flex-1 flex items-end justify-between gap-2 h-full pb-6 pt-4">
              {[40, 60, 30, 80, 50, 20, 90].map((val, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 w-full">
                  <div className="w-full bg-primary/20 rounded-t-sm relative h-full flex items-end">
                    <div className="w-full bg-primary rounded-t-sm transition-all" style={{ height: `${val}%` }}></div>
                  </div>
                  <span className="text-xs text-on-surface/60 font-medium">{'T' + (idx + 2 > 7 ? 'CN' : idx + 2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Topic Performance */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs lg:col-span-4 flex flex-col h-80">
            <h3 className="text-base md:text-lg font-bold text-on-surface mb-6">{t.analytics.progressByDomain}</h3>
            <div className="flex-1 flex flex-col justify-around">
              {[
                { name: 'Cloud Computing', val: 85, color: 'bg-primary' },
                { name: 'Cybersecurity', val: 60, color: 'bg-purple-500' },
                { name: 'Networking', val: 75, color: 'bg-blue-500' },
                { name: 'DevOps', val: 90, color: 'bg-indigo-500' },
              ].map((topic, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-32 text-xs md:text-sm text-on-surface/70 truncate">{topic.name}</div>
                  <div className="flex-1 h-2 bg-surface-container-low rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${topic.color}`} style={{ width: `${topic.val}%` }}></div>
                  </div>
                  <div className="w-10 text-right text-xs font-bold text-on-surface">{topic.val}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
            <span className="material-symbols-outlined text-primary mb-2">insights</span>
            <p className="text-sm font-medium">{t.analytics.insight1}</p>
          </div>
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
            <span className="material-symbols-outlined text-primary mb-2">favorite</span>
            <p className="text-sm font-medium">{t.analytics.insight2}</p>
          </div>
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
            <span className="material-symbols-outlined text-primary mb-2">trending_up</span>
            <p className="text-sm font-medium">{t.analytics.insight3}</p>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
