'use client';

import React, { useEffect, useState } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

export default function RoadmapPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const progressRes = await apiClient.get('/progress/me');
        setProgress((progressRes as any)?.data ?? progressRes ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <LearnerShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </LearnerShell>
    );
  }

  // Use provided design data
  const roadmapData = {
    title: 'AWS Certified Cloud Practitioner',
    overallProgress: 40,
    completedModules: 2,
    totalModules: 6,
    currentModule: {
      name: 'IAM',
      fullName: 'Identity and Access Management',
    },
    estTime: '2 tuần',
    modules: [
      { id: 1, title: 'Cloud Fundamentals', status: 'completed' },
      { id: 2, title: 'Global Infrastructure', status: 'completed' },
      { id: 3, title: 'IAM', subtitle: 'Identity and Access Management', status: 'active' },
      { id: 4, title: 'VPC', subtitle: 'Virtual Private Cloud', status: 'pending' },
      { id: 5, title: 'Monitoring', subtitle: 'CloudWatch & CloudTrail', status: 'pending' },
      { id: 6, title: 'Practice Test', status: 'locked', isExam: true },
    ]
  };

  return (
    <LearnerShell>
      <div className="flex flex-col">
        {/* Header Section */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-[30px] font-bold text-on-surface mb-2 tracking-tight">Lộ trình học tập</h1>
            <p className="text-[20px] font-semibold text-on-surface-variant">{roadmapData.title}</p>
          </div>
          {/* Quick Actions */}
          <button className="bg-primary hover:bg-primary-container text-white font-semibold text-[14px] py-2 px-6 rounded-[10px] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            Tiếp tục học
          </button>
        </header>

        {/* Bento Grid Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Progress Card */}
          <div className="bg-surface-white border border-border-subtle rounded-xl p-6 flex flex-col justify-between hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-[14px] text-on-surface-variant">Tiến độ tổng quan</span>
              <span className="material-symbols-outlined text-primary">analytics</span>
            </div>
            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="text-[24px] font-bold text-on-surface tracking-tight">{roadmapData.overallProgress}%</span>
                <span className="text-[12px] text-on-surface-variant">{roadmapData.completedModules}/{roadmapData.totalModules} học phần</span>
              </div>
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${roadmapData.overallProgress}%` }}></div>
              </div>
            </div>
          </div>

          {/* Current Stage Card */}
          <div className="bg-surface-white border border-border-subtle rounded-xl p-6 flex flex-col justify-between hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow border-l-4 border-l-secondary relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-ai-accent rounded-full opacity-50 pointer-events-none"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="font-semibold text-[14px] text-secondary">Học phần hiện tại</span>
              <span className="material-symbols-outlined text-secondary">school</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-[20px] font-semibold text-on-surface">{roadmapData.currentModule.name}</h3>
              <p className="text-[12px] text-on-surface-variant mt-1">{roadmapData.currentModule.fullName}</p>
            </div>
          </div>

          {/* Estimated Time Card */}
          <div className="bg-surface-white border border-border-subtle rounded-xl p-6 flex flex-col justify-between hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-[14px] text-on-surface-variant">Thời gian dự kiến còn lại</span>
              <span className="material-symbols-outlined text-outline">schedule</span>
            </div>
            <div>
              <span className="text-[24px] font-bold text-on-surface tracking-tight">{roadmapData.estTime}</span>
              <p className="text-[12px] text-on-surface-variant mt-1">Dựa trên tốc độ học hiện tại của bạn</p>
            </div>
          </div>
        </section>

        {/* Visual Roadmap Timeline */}
        <section className="bg-surface-white border border-border-subtle rounded-xl p-8">
          <h2 className="text-[20px] font-semibold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">map</span>
            Chi tiết lộ trình
          </h2>
          
          <div className="relative ml-2 mt-6">
            {roadmapData.modules.map((module, index) => {
              const isLast = index === roadmapData.modules.length - 1;
              const borderClass = module.status === 'completed' ? 'border-primary' : 'border-surface-container-highest';
              
              return (
                <div key={module.id} className={`relative pl-8 ${!isLast ? `pb-8 border-l-2 ${borderClass}` : ''}`}>
                  {/* Timeline Dot */}
                  {module.status === 'completed' && (
                    <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-sm z-10 ring-4 ring-surface-white">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                  )}
                  
                  {module.status === 'active' && (
                    <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-surface-white border-2 border-secondary flex items-center justify-center z-10 ring-4 ring-surface-white">
                      <div className="w-2.5 h-2.5 bg-secondary rounded-full"></div>
                    </div>
                  )}

                  {module.status === 'pending' && (
                    <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-surface-white border-2 border-surface-container-highest flex items-center justify-center z-10 ring-4 ring-surface-white"></div>
                  )}

                  {module.status === 'locked' && (
                    <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-surface-white border-2 border-surface-container-highest flex items-center justify-center z-10 ring-4 ring-surface-white">
                      <span className="material-symbols-outlined text-[14px] text-outline">lock</span>
                    </div>
                  )}

                  {/* Content Card */}
                  {module.status === 'completed' && (
                    <div className="bg-surface-container-lowest border border-border-subtle rounded-lg p-4 hover:bg-surface-container-low transition-colors group cursor-pointer flex justify-between items-center">
                      <div>
                        <span className="text-[12px] font-bold tracking-[0.05em] text-primary mb-1 block uppercase">Học phần {module.id} • Hoàn thành</span>
                        <h3 className="text-[14px] font-semibold text-on-surface group-hover:text-primary transition-colors">{module.title}</h3>
                      </div>
                      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
                    </div>
                  )}

                  {module.status === 'active' && (
                    <div className="bg-ai-accent border border-secondary rounded-lg p-4 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[12px] font-bold tracking-[0.05em] text-secondary mb-1 flex items-center gap-1 uppercase">
                            <span className="material-symbols-outlined text-[14px]">bolt</span>
                            Đang học
                          </span>
                          <h3 className="text-[14px] font-semibold text-on-surface">
                            {module.title} <span className="text-[12px] text-on-surface-variant font-normal">({module.subtitle})</span>
                          </h3>
                        </div>
                        <button className="text-secondary font-semibold text-[14px] hover:underline">Tiếp tục</button>
                      </div>
                    </div>
                  )}

                  {module.status === 'pending' && (
                    <div className="bg-surface-white border border-border-subtle rounded-lg p-4 opacity-70 hover:opacity-100 transition-opacity">
                      <div>
                        <span className="text-[12px] font-bold tracking-[0.05em] text-on-surface-variant mb-1 block uppercase">Học phần {module.id} • Chưa bắt đầu</span>
                        <h3 className="text-[14px] font-semibold text-on-surface">
                          {module.title} {module.subtitle && <span className="text-[12px] text-on-surface-variant font-normal">({module.subtitle})</span>}
                        </h3>
                      </div>
                    </div>
                  )}

                  {module.status === 'locked' && (
                    <div className="bg-surface-white border border-border-subtle border-dashed rounded-lg p-4 opacity-70">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[12px] font-bold tracking-[0.05em] text-on-surface-variant mb-1 block uppercase">Bài kiểm tra cuối khóa</span>
                          <h3 className="text-[14px] font-semibold text-on-surface">{module.title}</h3>
                        </div>
                        <span className="material-symbols-outlined text-outline">emoji_events</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </LearnerShell>
  );
}
