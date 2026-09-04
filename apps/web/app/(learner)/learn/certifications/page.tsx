'use client';

import React, { useEffect, useState } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

interface CertGoal {
  id: string;
  name: string;
  progress: number;
  startDate: string;
}

interface Exam {
  id: string;
  name: string;
  date: string;
}

export default function CertificationsPage() {
  const { t } = useI18n();
  const [goal, setGoal] = useState<CertGoal | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [authRes, examsRes] = await Promise.all([
          apiClient.get<any>('/auth/me'),
          apiClient.get<{ items: Exam[] }>('/exams?limit=20')
        ]);
        setGoal(authRes?.certGoals?.[0] || { id: '1', name: 'AWS Certified Solutions Architect', progress: 65, startDate: '2026-01-01' });
        setExams(examsRes.items || []);
      } catch (err) {
        console.error(err);
        setGoal({ id: '1', name: 'AWS Certified Solutions Architect', progress: 65, startDate: '2026-01-01' });
        setExams([
          { id: '1', name: 'AWS SAA-C03', date: '2026-10-15' },
          { id: '2', name: 'AZ-900', date: '2026-11-20' }
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const circleRadius = 40;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - ((goal?.progress || 0) / 100) * circumference;

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-on-surface">Tiến độ Chứng chỉ</h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
            
            {/* Active cert goal card */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface-container" />
                  <circle cx="64" cy="64" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary transition-all duration-1000 ease-in-out" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-bold text-on-surface">{goal?.progress}%</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface mb-2">{goal?.name || 'Mục tiêu hiện tại'}</h2>
                <p className="text-on-surface-variant text-sm mb-4">Bắt đầu từ: {goal?.startDate}</p>
                <button className="bg-primary !text-white font-bold rounded-xl px-4 py-2.5 hover:opacity-90">
                  Tiếp tục ôn thi
                </button>
              </div>
            </div>

            {/* Other Tracks */}
            <h2 className="text-base md:text-lg font-bold text-on-surface mt-2">Các chứng chỉ khác</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Azure Fundamentals', progress: 30, completed: 12, total: 40, icon: 'cloud' },
                { name: 'CKA Kubernetes', progress: 0, completed: 0, total: 55, icon: 'memory' }
              ].map((track, i) => (
                <div key={i} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-2xs">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">{track.icon}</span>
                    </div>
                    <h3 className="font-bold text-on-surface">{track.name}</h3>
                  </div>
                  <div className="mb-2 flex justify-between text-xs text-on-surface-variant font-medium">
                    <span>{track.completed}/{track.total} bài học</span>
                    <span>{track.progress}%</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1.5 mb-4">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `\${track.progress}%` }}></div>
                  </div>
                  <button className="w-full bg-surface-container hover:bg-surface-container-high text-primary font-bold rounded-xl px-4 py-2 transition-colors">
                    {track.progress > 0 ? 'Tiếp tục' : 'Bắt đầu'}
                  </button>
                </div>
              ))}
            </div>

          </div>

          <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
            {/* Upcoming exams */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs">
              <h2 className="text-base md:text-lg font-bold text-on-surface mb-4">Lịch thi sắp tới</h2>
              {exams.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {exams.map(exam => (
                    <div key={exam.id} className="p-3 border border-outline-variant/40 rounded-xl bg-surface-container-lowest flex items-center gap-3">
                      <div className="bg-red-50 text-red-600 rounded-lg p-2 text-center w-14 shrink-0">
                        <div className="text-xs font-bold uppercase">{new Date(exam.date).toLocaleString('default', { month: 'short' })}</div>
                        <div className="text-lg font-bold">{new Date(exam.date).getDate()}</div>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{exam.name}</h4>
                        <p className="text-xs text-on-surface-variant">Lên kế hoạch dự thi</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">Chưa có lịch thi nào được lên kế hoạch.</p>
              )}
            </div>

            {/* Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-amber-800 mb-2">
                <span className="material-symbols-outlined">{t.certifications.title || 'lightbulb'}</span>
                <h3 className="font-bold">Mẹo ôn thi</h3>
              </div>
              <p className="text-sm text-amber-900 leading-relaxed">
                Nên dành ít nhất 30 phút mỗi ngày để ôn tập flashcards và làm 1 bài thi thử vào cuối tuần để quen với áp lực thời gian.
              </p>
            </div>
          </div>
        </div>

      </div>
    </LearnerShell>
  );
}
