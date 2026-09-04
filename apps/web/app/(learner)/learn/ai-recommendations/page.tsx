'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

interface Recommendation {
  topic: string;
  hint: string;
  resourceId?: string;
  strengths: { topic: string; description: string }[];
  weaknesses: { topic: string; progress: number; label: string }[];
  learningPath: { step: number; title: string; description: string; current: boolean }[];
}

export default function AIRecommendationsPage() {
  const { t } = useI18n();
  const [data, setData] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiClient.get<Recommendation>('/recommendations/my');
        setData(res);
      } catch (err) {
        console.error(err);
        // Fallback dummy data if API fails
        setData({
          topic: 'React Hooks',
          hint: 'Your understanding of useEffect needs improvement.',
          strengths: [
            { topic: 'JavaScript Basics', description: 'Good understanding of variables and functions.' },
            { topic: 'HTML/CSS', description: 'Strong layout skills.' }
          ],
          weaknesses: [
            { topic: 'useEffect Lifecycle', progress: 40, label: 'Needs work' },
            { topic: 'Advanced State Management', progress: 30, label: 'Beginner' }
          ],
          learningPath: [
            { step: 1, title: 'Basics', description: 'Learn hooks', current: false },
            { step: 2, title: 'Intermediate', description: 'Deep dive into useEffect', current: true },
            { step: 3, title: 'Advanced', description: 'Custom hooks', current: false }
          ]
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <LearnerShell>
        <div className="flex flex-col gap-6">
          <p>Loading...</p>
        </div>
      </LearnerShell>
    );
  }

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-on-surface">AI Phân Tích & Khuyến Nghị</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* LEFT 8-col */}
          <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
            
            {/* Điểm mạnh */}
            <section className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs">
              <h2 className="text-base md:text-lg font-bold text-on-surface mb-4">Điểm mạnh</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data?.strengths.map((item, i) => (
                  <div key={i} className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3 items-start">
                    <span className="material-symbols-outlined text-green-600 mt-0.5">check_circle</span>
                    <div>
                      <h3 className="font-bold text-green-900">{item.topic}</h3>
                      <p className="text-sm text-green-700">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Điểm cần cải thiện */}
            <section className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs">
              <h2 className="text-base md:text-lg font-bold text-on-surface mb-4">Điểm cần cải thiện</h2>
              <div className="flex flex-col gap-4">
                {data?.weaknesses.map((item, i) => (
                  <div key={i} className="border-l-4 border-amber-400 bg-amber-50 rounded-r-xl p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-amber-900">{item.topic}</h3>
                      <span className="bg-indigo-50 text-primary border border-indigo-200 text-xs font-bold rounded-full px-2.5 py-0.5 inline-block mt-2">
                        {item.label}
                      </span>
                    </div>
                    <div className="w-24 bg-surface-container rounded-full h-2">
                      <div className="bg-amber-400 h-2 rounded-full" style={{ width: `\${item.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Lộ trình đề xuất */}
            <section className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-2xs">
              <h2 className="text-base md:text-lg font-bold text-on-surface mb-4">Lộ trình đề xuất</h2>
              <div className="flex flex-col gap-6 relative">
                <div className="absolute left-4 top-4 bottom-4 w-[2px] bg-outline-variant/30"></div>
                {data?.learningPath.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm \${step.current ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-surface-container text-on-surface-variant'}`}>
                      {step.step}
                    </div>
                    <div className="pt-1">
                      <h3 className={`font-bold \${step.current ? 'text-primary' : 'text-on-surface'}`}>{step.title}</h3>
                      <p className="text-sm text-on-surface-variant mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* RIGHT 4-col */}
          <div className="col-span-1 md:col-span-4">
            <div className="sticky top-24 bg-[#F5F3FF] border border-[#DDD6FE] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-[#5B21B6]">
                <span className="material-symbols-outlined">auto_awesome</span>
                <h2 className="text-lg font-bold">AI Phân Tích</h2>
              </div>
              <p className="text-[#4C1D95] mb-4 text-sm leading-relaxed">
                {data?.hint}
              </p>
              <ul className="flex flex-col gap-3 mb-6">
                <li className="flex gap-2 text-sm text-[#5B21B6]">
                  <span className="material-symbols-outlined text-[18px]">{t.aiRecommendations.title || 'priority'}</span>
                  <span>Tập trung vào {data?.topic}</span>
                </li>
              </ul>
              <Link href="/learn/lessons" className="block w-full text-center bg-primary !text-white font-bold rounded-xl px-4 py-2.5 hover:opacity-90">
                Học ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
