'use client';

import { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

export default function CareerInsightsPage() {
  const { t } = useI18n();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const res: any = await apiClient.get('/auth/me');
        if (res) setUserData(res.data ?? res.user ?? res);
      } catch (error) {
        setUserData({ name: 'User' });
      }
    };
    fetchAuth();
  }, []);

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-1">{t.career.title}</h1>
          <p className="text-sm md:text-base text-on-surface/70">{t.career.subtitle}</p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Lĩnh vực quan tâm */}
          <div className="col-span-12 md:col-span-4 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 text-primary">
                <span className="material-symbols-outlined">cloud</span>
                <h2 className="text-sm font-bold uppercase tracking-wider">{t.career.interestedDomain}</h2>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Cloud Computing</h3>
              <p className="text-sm text-on-surface/70">Trọng tâm học tập hiện tại của bạn tập trung cao độ vào công nghệ điện toán đám mây và hạ tầng mạng.</p>
            </div>
            <div className="mt-6">
              <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[85%]"></div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-on-surface/70">
                <span>{t.career.interestLevel}</span>
                <span className="text-primary font-bold">{t.career.high} (85%)</span>
              </div>
            </div>
          </div>

          {/* Gợi ý nghề nghiệp từ AI */}
          <div className="col-span-12 md:col-span-8 bg-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-[120px] text-primary">auto_awesome</span>
            </div>
            <div className="flex items-center gap-2 mb-4 text-primary relative z-10">
              <span className="material-symbols-outlined">psychology</span>
              <h2 className="text-sm font-bold uppercase tracking-wider">{t.career.aiSuggestRole}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              {['AWS Cloud Engineer', 'Cloud Support Associate', 'Junior DevOps Engineer'].map((role, idx) => (
                <div key={idx} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 flex flex-col h-full hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined">dns</span>
                  </div>
                  <h4 className="font-bold text-on-surface mb-1">{role}</h4>
                  <p className="text-xs text-on-surface/70 flex-grow">{t.career.jobDesc} {role}.</p>
                  <div className="mt-4 flex items-center text-primary text-sm font-bold cursor-pointer hover:underline">
                    {t.career.explore} <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chứng chỉ đề xuất */}
          <div className="col-span-12 md:col-span-6 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-6 text-on-surface/70">
              <span className="material-symbols-outlined">workspace_premium</span>
              <h2 className="text-sm font-bold uppercase tracking-wider">{t.career.certSuggest}</h2>
            </div>
            <div className="flex flex-col gap-4">
              {['AWS Certified Cloud Practitioner', 'AWS Solutions Architect Associate'].map((cert, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-outline-variant/40">
                  <div className="w-12 h-12 flex-shrink-0 bg-surface-container-low rounded-lg flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-on-surface">{cert}</h4>
                    <p className="text-xs text-on-surface/70 mt-1">{t.career.examFee}: $150 • {t.career.prepTime}: 2-3 {t.common.months || 'tháng'}</p>
                  </div>
                  <button className="text-primary text-sm font-bold px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:bg-primary/5 transition-colors whitespace-nowrap">{t.career.details}</button>
                </div>
              ))}
            </div>
          </div>

          {/* Composite Column */}
          <div className="col-span-12 md:col-span-6 flex flex-col gap-6">
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs flex-grow">
              <div className="flex items-center gap-2 mb-4 text-on-surface/70">
                <span className="material-symbols-outlined">code</span>
                <h2 className="text-sm font-bold uppercase tracking-wider">{t.career.requiredSkills}</h2>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {['Linux', 'Networking', 'Docker', 'CI/CD'].map((skill) => (
                  <span key={skill} className="px-3 py-1.5 rounded-full border border-outline-variant/40 bg-surface-container-lowest text-sm font-bold text-on-surface flex items-center gap-1">
                    {skill} <span className="material-symbols-outlined text-[14px] text-primary">terminal</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs flex-grow">
              <div className="flex items-center gap-2 mb-4 text-on-surface/70">
                <span className="material-symbols-outlined">menu_book</span>
                <h2 className="text-sm font-bold uppercase tracking-wider">{t.career.priorityTopics}</h2>
              </div>
              <div className="flex flex-col gap-2">
                {['Cloud Fundamentals', 'Infrastructure Concepts'].map((topic, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded hover:bg-surface-container-low transition-colors group cursor-pointer border-b border-outline-variant/20 last:border-0">
                    <span className="text-sm font-bold text-on-surface">{topic}</span>
                    <span className="material-symbols-outlined text-outline-variant/60 group-hover:text-primary transition-colors">arrow_forward</span>
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
