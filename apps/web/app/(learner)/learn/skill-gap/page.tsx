'use client';

import { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import Link from 'next/link';
import { useI18n } from '@/shared/i18n';

export default function SkillGapPage() {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res: any = await apiClient.get('/progress/me');
      setData({
        role: "Cloud Solutions Architect",
        match: 87,
        skills: [
          { name: 'Networking', current: 60, target: 80 },
          { name: 'Cloud', current: 85, target: 90 },
          { name: 'Security', current: 50, target: 80 },
          { name: 'Linux', current: 75, target: 70 },
          { name: 'Scripting', current: 40, target: 70 },
        ],
        priorities: ['Scripting', 'Security', 'Networking']
      });
    } catch (e) {
      setData({
        role: "Cloud Solutions Architect",
        match: 87,
        skills: [
          { name: 'Networking', current: 60, target: 80 },
          { name: 'Cloud', current: 85, target: 90 },
          { name: 'Security', current: 50, target: 80 },
          { name: 'Linux', current: 75, target: 70 },
          { name: 'Scripting', current: 40, target: 70 },
        ],
        priorities: ['Scripting', 'Security', 'Networking']
      });
    }
  };

  if (!data) return <LearnerShell><div className="p-8 text-center">Loading...</div></LearnerShell>;

  return (
    <LearnerShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-on-surface">{t.skillGap.title || 'Skill Gap Analysis'}</h1>
        
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 flex justify-between items-center">
          <div>
            <h2 className="text-gray-500 text-sm font-medium">Target Role</h2>
            <div className="text-2xl font-bold">{data.role}</div>
          </div>
          <div className="text-right">
            <h2 className="text-gray-500 text-sm font-medium">Match</h2>
            <div className="text-3xl font-bold text-primary">{data.match}%</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6">
            <h3 className="font-bold mb-6 text-lg">Bảng so sánh kỹ năng</h3>
            <div className="space-y-6">
              {data.skills.map((skill: any) => {
                const gap = skill.target - skill.current;
                const isGapLarge = gap > 30;
                const isMet = gap <= 0;
                return (
                  <div key={skill.name}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-medium">{skill.name}</span>
                      {isGapLarge ? (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded font-medium">Cần cải thiện</span>
                      ) : isMet ? (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">Đạt</span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-medium">Gần đạt</span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${skill.current}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Hiện tại: {skill.current}%</span>
                      <span>Yêu cầu: {skill.target}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6">
              <h3 className="font-bold mb-4 text-lg">Ưu tiên học</h3>
              <div className="space-y-4">
                {data.priorities.map((p: string, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 border rounded-xl">
                    <span className="font-medium">{p}</span>
                    <Link href="/learn/lessons" className="text-sm bg-primary !text-white px-3 py-1.5 rounded-lg hover:opacity-90">
                      Học ngay
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6">
              <h3 className="font-bold mb-4 text-lg">Lộ trình đề xuất</h3>
              <div className="space-y-4 border-l-2 border-gray-200 ml-3 pl-4 relative">
                <div className="relative">
                  <div className="absolute w-3 h-3 bg-primary rounded-full -left-[23px] top-1.5"></div>
                  <h4 className="font-medium">1. Cải thiện Scripting cơ bản</h4>
                  <p className="text-sm text-gray-500">Ước tính: 2 tuần</p>
                </div>
                <div className="relative">
                  <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[23px] top-1.5"></div>
                  <h4 className="font-medium">2. Bổ sung kiến thức Security</h4>
                  <p className="text-sm text-gray-500">Ước tính: 3 tuần</p>
                </div>
                <div className="relative">
                  <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[23px] top-1.5"></div>
                  <h4 className="font-medium">3. Nâng cao Networking</h4>
                  <p className="text-sm text-gray-500">Ước tính: 2 tuần</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
