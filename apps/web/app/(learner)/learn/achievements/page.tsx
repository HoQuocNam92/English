'use client';

import { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

export default function AchievementsPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res: any = await apiClient.get('/gamification/my-streak');
        if (res) setStats(res.data ?? res);
      } catch (error) {
        setStats({ streak: 7, exp: 1250, badges: 4, rank: 124 });
      }
    };
    fetchStats();
  }, []);

  const earnedBadges = [
    { id: 1, name: 'Hoàn thành 10 bài học', desc: 'Chăm chỉ mỗi ngày', icon: 'menu_book', color: 'text-primary' },
    { id: 2, name: 'Hoàn thành 100 từ vựng', desc: 'Mở rộng vốn từ', icon: 'sort_by_alpha', color: 'text-purple-600' },
    { id: 3, name: 'Đạt 8.0+ trong 5 bài kiểm tra', desc: 'Thành tích xuất sắc', icon: 'military_tech', color: 'text-blue-600' },
    { id: 4, name: 'Học liên tiếp 7 ngày', desc: 'Kỷ luật thép', icon: 'workspace_premium', color: 'text-orange-500' },
  ];

  const milestones = [
    { id: 1, title: 'Bắt đầu hành trình', desc: 'Hoàn thành bài kiểm tra đầu vào.', active: true },
    { id: 2, title: 'Mầm non từ vựng', desc: 'Học 50 từ vựng đầu tiên.', active: true },
    { id: 3, title: 'Chuyên gia giao tiếp', desc: 'Hoàn thành khóa học Giao tiếp Cơ bản.', active: false, progress: 40 },
  ];

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-2">{t.achievements.title}</h1>
          <p className="text-sm md:text-base text-on-surface/70">{t.achievements.subtitle}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Streak Section */}
          <section className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs relative overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500">local_fire_department</span>
                  {t.achievements.streakTitle}
                </h2>
                <p className="text-sm text-on-surface/70 mt-1">{t.achievements.streakSubtitle}</p>
              </div>
              <div className="bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 text-center">
                <span className="block text-2xl font-bold text-primary leading-none">{stats?.streak || 0}</span>
                <span className="text-xs font-bold text-primary mt-1 block uppercase">{t.achievements.streakDays}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-auto relative z-10 pt-4">
              {[t.planner.mon, t.planner.tue, t.planner.wed, t.planner.thu, t.planner.fri, t.planner.sat, t.planner.sun].map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                  <span className={`text-sm ${idx === 6 ? 'font-bold text-primary' : 'text-on-surface/70'}`}>{day}</span>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${idx <= 6 ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface/30'} ${idx === 6 ? 'ring-4 ring-primary/20' : ''}`}>
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Milestones Timeline */}
          <section className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs flex flex-col">
            <h2 className="text-lg font-bold text-on-surface mb-6">{t.achievements.milestonesTitle}</h2>
            <div className="flex flex-col gap-6 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-outline-variant/40 z-0"></div>
              {milestones.map((ms, idx) => (
                <div key={ms.id} className={`flex items-start gap-4 relative z-10 ${!ms.active ? 'opacity-60' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${ms.active ? 'bg-primary' : 'bg-surface-container-low border-2 border-outline-variant/40'}`}>
                    {ms.active && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-on-surface">{ms.title}</h3>
                    <p className="text-sm text-on-surface/70 mt-1">{ms.desc}</p>
                    {ms.progress !== undefined && (
                      <div className="w-full h-2 bg-surface-container-low rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-outline-variant rounded-full" style={{ width: `${ms.progress}%` }}></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Badges Grid */}
          <section className="col-span-12">
            <h2 className="text-lg md:text-xl font-bold text-on-surface mb-4">{t.achievements.earnedBadgesTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {earnedBadges.map(badge => (
                <div key={badge.id} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 ${badge.color}`}>
                    <span className="material-symbols-outlined text-[32px]">{badge.icon}</span>
                  </div>
                  <h3 className="font-bold text-on-surface mb-1">{badge.name}</h3>
                  <p className="text-sm text-on-surface/70">{badge.desc}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </LearnerShell>
  );
}
