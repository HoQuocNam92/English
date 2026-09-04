'use client';

import React, { useEffect, useState } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

interface PlannedLesson {
  id: string;
  title: string;
  duration: number; // minutes
}

interface WeeklyPlan {
  [day: string]: PlannedLesson[];
}

export default function PlannerPage() {
  const { t } = useI18n();
  const [plan, setPlan] = useState<WeeklyPlan>({});
  const [loading, setLoading] = useState(true);

  const DAYS = [t.planner.mon, t.planner.tue, t.planner.wed, t.planner.thu, t.planner.fri, t.planner.sat, t.planner.sun];

  useEffect(() => {
    // Load from local storage
    try {
      const stored = localStorage.getItem('techenglish.weeklyPlan');
      if (stored) {
        setPlan(JSON.parse(stored));
      } else {
        // Mock default
        setPlan({
          [t.planner.mon]: [{ id: '1', title: 'React Basics', duration: 20 }],
          [t.planner.wed]: [{ id: '2', title: 'Docker Intro', duration: 30 }],
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [t.planner.mon, t.planner.wed]);

  const totalMinutes = Object.values(plan).flat().reduce((sum, l) => sum + (l.duration || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const todayIndex = new Date().getDay(); // 0 is Sunday
  const todayLabel = todayIndex === 0 ? t.planner.sun : DAYS[todayIndex - 1];

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-on-surface">{t.planner.subtitle}</h1>
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-2xs overflow-x-auto">
              <div className="min-w-[800px] flex divide-x divide-outline-variant/30">
                {DAYS.map(day => {
                  const isToday = day === todayLabel;
                  return (
                    <div key={day} className={`flex-1 min-h-[400px] flex flex-col ${isToday ? 'bg-indigo-50/50' : 'bg-surface-container-lowest'}`}>
                      <div className={`p-3 text-center border-b border-outline-variant/30 font-bold ${isToday ? 'text-primary bg-indigo-50 border-primary' : 'text-on-surface-variant'}`}>
                        {day}
                      </div>
                      <div className="p-3 flex-1 flex flex-col gap-2">
                        {plan[day]?.map((lesson, i) => (
                          <div key={i} className="bg-white border border-outline-variant/40 rounded-lg p-2 text-sm shadow-sm cursor-grab active:cursor-grabbing hover:border-primary transition-colors">
                            <div className="font-semibold text-on-surface line-clamp-2">{lesson.title}</div>
                            <div className="text-xs text-on-surface-variant mt-1">{lesson.duration} min</div>
                          </div>
                        ))}
                        <button className="mt-2 w-full py-2 border-2 border-dashed border-outline-variant/50 rounded-lg text-on-surface-variant text-sm hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">add</span> {t.planner.addBtn}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="xl:col-span-1 flex flex-col gap-6">
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs">
              <h2 className="font-bold text-on-surface mb-2">{t.planner.weekSummary}</h2>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-3xl font-bold text-primary">{totalHours}</span>
                <span className="text-on-surface-variant mb-1">{t.planner.estimatedHours}</span>
              </div>
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-lg p-3">
                <span className="material-symbols-outlined">local_fire_department</span>
                <span className="font-bold text-sm">{t.planner.streakAlert}</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs">
              <h2 className="font-bold text-on-surface mb-4">{t.planner.recommended}</h2>
              <div className="flex flex-col gap-3">
                {[
                  { title: 'Kubernetes Pods', time: '15 min' },
                  { title: 'Advanced CSS Grid', time: '25 min' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-outline-variant/40 rounded-xl hover:border-primary transition-colors cursor-pointer">
                    <div>
                      <div className="font-bold text-sm text-on-surface">{item.title}</div>
                      <div className="text-xs text-on-surface-variant">{item.time}</div>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-surface-container hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
