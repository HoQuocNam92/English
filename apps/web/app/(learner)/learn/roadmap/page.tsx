'use client';

import React, { useEffect, useState } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

interface Lesson {
  id: string;
  title: string;
  level: string;
  domain: string;
  order: number;
  status?: string;
  duration?: string;
}

interface ProgressData {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export default function RoadmapPage() {
  const { t } = useI18n();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [filter, setFilter] = useState(t.roadmap.all);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [lessonsRes, progressRes] = await Promise.all([
          apiClient.get<{ items: Lesson[] }>('/lessons?limit=50'),
          apiClient.get<ProgressData>('/progress/me')
        ]);
        setLessons(lessonsRes.items || []);
        setProgress(progressRes || { completedLessons: 0, totalLessons: 0, percentage: 0 });
      } catch (err) {
        console.error(err);
        // Fallback
        setLessons([
          { id: '1', title: 'Introduction to Cloud', level: t.roadmap.basic, domain: 'Cloud', order: 1, status: 'completed', duration: '15 min' },
          { id: '2', title: 'Docker Basics', level: t.roadmap.intermediate, domain: 'DevOps', order: 2, status: 'active', duration: '30 min' },
          { id: '3', title: 'Kubernetes Advanced', level: t.roadmap.advanced, domain: 'Cloud', order: 3, status: 'locked', duration: '45 min' },
        ]);
        setProgress({ completedLessons: 1, totalLessons: 3, percentage: 33 });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [t.roadmap.basic, t.roadmap.intermediate, t.roadmap.advanced]);

  const filteredLessons = lessons.filter(l => filter === t.roadmap.all || l.level === filter);

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">{t.roadmap.title}</h1>
          <p className="text-on-surface-variant">{t.roadmap.subtitle}</p>
        </div>

        {/* Progress summary card */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs flex items-center justify-between">
          <div>
            <h2 className="text-base md:text-lg font-bold text-on-surface">{t.roadmap.progressOverview}</h2>
            <p className="text-sm text-on-surface-variant mt-1">{t.roadmap.completedLessons} {progress?.completedLessons}/{progress?.totalLessons} {t.roadmap.lessons}</p>
          </div>
          <div className="w-1/3">
            <div className="flex justify-end mb-1 text-sm font-bold text-primary">{progress?.percentage}%</div>
            <div className="w-full bg-surface-container rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress?.percentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[t.roadmap.all, t.roadmap.basic, t.roadmap.intermediate, t.roadmap.advanced].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-surface-container-lowest border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-low'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs relative mt-4">
          <div className="absolute left-[39px] top-6 bottom-6 w-[2px] bg-outline-variant/30"></div>
          
          <div className="flex flex-col gap-8 relative z-10">
            {filteredLessons.map((lesson, i) => (
              <div key={lesson.id} className="flex gap-6 items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${lesson.status === 'completed' ? 'bg-green-600' : lesson.status === 'active' ? 'bg-primary ring-4 ring-primary/20' : 'bg-surface-container text-on-surface-variant'}`}>
                  {lesson.status === 'completed' ? <span className="material-symbols-outlined text-[20px]">check</span> : lesson.order}
                </div>
                
                <div className="flex-1 border border-outline-variant/40 rounded-xl p-4 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-indigo-50 text-primary border border-indigo-200 text-xs font-bold rounded-full px-2.5 py-0.5">{lesson.domain}</span>
                      <span className="text-xs text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span> {lesson.duration || '15 min'}
                      </span>
                    </div>
                    <h3 className="font-bold text-on-surface">{lesson.title}</h3>
                  </div>
                  
                  <div>
                    {lesson.status === 'completed' ? (
                      <button className="text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-xl" disabled>{t.roadmap.completed}</button>
                    ) : lesson.status === 'active' ? (
                      <button className="bg-primary !text-white font-bold rounded-xl px-4 py-2.5 hover:opacity-90">{t.roadmap.startNow}</button>
                    ) : (
                      <button className="text-on-surface-variant font-bold text-sm bg-surface-container px-4 py-2 rounded-xl flex items-center gap-1" disabled>
                        <span className="material-symbols-outlined text-[16px]">lock</span> {t.roadmap.locked}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
