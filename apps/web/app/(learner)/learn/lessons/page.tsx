'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';

export default function LearnerLessonsPage() {
  const [data, setData] = useState<{ modules: any[], progress: any }>({ modules: [], progress: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [lessonsRes, progressRes] = await Promise.all<any>([
          apiClient.get('/lessons?limit=50'),
          apiClient.get('/progress/my/lessons').catch(() => [])
        ]);

        const lessons = lessonsRes?.data || lessonsRes || [];
        
        // Group lessons by domain name
        const modulesMap: Record<string, any[]> = {};
        lessons.forEach((les: any) => {
          const domainName = les.domain?.name ?? 'Khác';
          if (!modulesMap[domainName]) modulesMap[domainName] = [];
          modulesMap[domainName].push(les);
        });

        const modules = Object.keys(modulesMap).map((domainName, idx) => ({
          id: `mod-${idx}`,
          title: domainName,
          description: `Các bài học thuộc lĩnh vực ${domainName}`,
          progress: 0, // could map from progress data if available
          lessons: modulesMap[domainName]
        }));

        setData({ modules, progress: progressRes });
      } catch (err) {
        setError('Failed to load lessons');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LearnerShell><div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></LearnerShell>;
  if (error) return <LearnerShell><div className="text-center text-red-500 py-10">{error} <button onClick={() => window.location.reload()}>Retry</button></div></LearnerShell>;

  const { modules, progress } = data;
  const overallProgress = progress?.summary?.overallCompletionPercent ?? 0;

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Lộ trình học tập</h2>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/50 shadow-2xs">
            <span className="text-xs text-on-surface-variant font-medium">Tiến độ chung:</span>
            <span className="text-sm font-extrabold text-primary">{overallProgress}% Hoàn thành</span>
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-6">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-outline-variant/30">
                <div>
                  <h3 className="text-base font-bold text-on-surface">{mod.title}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">{mod.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mod.lessons.map((les: any) => (
                  <div
                    key={les.id}
                    className="p-4 rounded-xl bg-surface-bright border border-outline-variant/40 hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-on-surface line-clamp-2 mb-2">{les.title}</h4>
                      <p className="text-[11px] text-on-surface-variant m-0 mb-4 line-clamp-2">{les.description}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-outline-variant/30">
                      <Link
                        href={`/learn/lessons/${les.id}`}
                        className="py-1 text-center rounded border border-outline-variant/60 hover:bg-surface-container text-[11px] font-semibold text-on-surface transition-colors"
                      >
                        Lý thuyết
                      </Link>
                      <Link
                        href={`/learn/flashcards/${les.id}`}
                        className="py-1 text-center rounded bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold transition-colors"
                      >
                        Từ vựng
                      </Link>
                      <Link
                        href={`/learn/quiz/${les.id}`}
                        className="py-1 text-center rounded bg-primary hover:bg-indigo-700 !text-white text-[11px] font-bold transition-colors"
                      >
                        Quiz
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {modules.length === 0 && <p className="text-center text-slate-500 py-10">Chưa có bài học nào được xuất bản.</p>}
        </div>
      </div>
    </LearnerShell>
  );
}
