'use client';

import { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import Link from 'next/link';
import { useI18n } from '@/shared/i18n';

export default function ExamReadinessPage() {
  const { t } = useI18n();
  const [exam, setExam] = useState('AWS SAA');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [exam]);

  const fetchData = async () => {
    try {
      const res: any = await apiClient.get('/progress/me');
      // Mock data based on exam
      setData({
        score: 72,
        domains: [
          { name: 'Cloud Concepts', score: 80 },
          { name: 'Security', score: 65 },
          { name: 'Networking', score: 70 },
        ],
        strengths: ['Compute Services', 'Storage Basics'],
        weaknesses: ['IAM Policies', 'VPC Peering'],
        recommended: [
          { title: 'Mastering IAM Policies', time: '45 mins' },
          { title: 'Advanced VPC Configurations', time: '60 mins' },
          { title: 'Security Best Practices', time: '40 mins' }
        ]
      });
    } catch (e) {
      setData({
        score: 72,
        domains: [
          { name: 'Cloud Concepts', score: 80 },
          { name: 'Security', score: 65 },
          { name: 'Networking', score: 70 },
        ],
        strengths: ['Compute Services', 'Storage Basics'],
        weaknesses: ['IAM Policies', 'VPC Peering'],
        recommended: [
          { title: 'Mastering IAM Policies', time: '45 mins' },
          { title: 'Advanced VPC Configurations', time: '60 mins' },
          { title: 'Security Best Practices', time: '40 mins' }
        ]
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getStrokeColor = (score: number) => {
    if (score >= 75) return '#22c55e';
    if (score >= 50) return '#eab308';
    return '#ef4444';
  };

  if (!data) return <LearnerShell><div className="p-8">Loading...</div></LearnerShell>;

  return (
    <LearnerShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-on-surface">{t.examReadiness.title || 'Exam Readiness'}</h1>
          <select 
            className="border border-outline-variant/60 rounded-xl px-4 py-2 bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={exam} onChange={(e) => setExam(e.target.value)}
          >
            <option>AWS SAA</option>
            <option>CKA</option>
            <option>Azure AZ-900</option>
          </select>
        </div>
        
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 text-center py-10">
          <h2 className="text-lg font-medium mb-4">Your Readiness Score for {exam}</h2>
          
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="10" fill="none" />
              <circle 
                cx="50" cy="50" r="40" 
                stroke={getStrokeColor(data.score)} 
                strokeWidth="10" fill="none" 
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - data.score / 100)}`}
                className="transition-all duration-1000 ease-in-out"
              />
            </svg>
            <div className="absolute text-5xl font-bold flex flex-col items-center">
              <span className={getScoreColor(data.score)}>{data.score}%</span>
            </div>
          </div>
          <p className="mt-4 text-gray-500">You are close to the target passing score of 75%.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 col-span-1 md:col-span-1">
            <h3 className="font-bold mb-4">Domain Scores</h3>
            <div className="space-y-4">
              {data.domains.map((d: any) => (
                <div key={d.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{d.name}</span>
                    <span className="font-medium">{d.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${d.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 col-span-1">
            <h3 className="font-bold mb-4 text-green-700">Strengths ✓</h3>
            <ul className="space-y-2">
              {data.strengths.map((s: string, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {s}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 col-span-1">
            <h3 className="font-bold mb-4 text-red-700">Weaknesses ✗</h3>
            <ul className="space-y-2">
              {data.weaknesses.map((w: string, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-red-500">✗</span> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Kế hoạch ôn tập</h3>
            <Link href="/learn/quiz" className="bg-primary !text-white font-semibold rounded-xl px-5 py-2.5 hover:opacity-90 transition-opacity">
              Luyện thi ngay
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.recommended.map((r: any, i: number) => (
              <div key={i} className="border rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold">{r.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">Est. {r.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
