'use client';

import { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    // Mock data for analytics
    setData({
      totalHours: 42,
      vocabLearned: 120,
      lessonsCompleted: 15,
      avgScore: 8.5
    });
  }, []);

  return (
    <LearnerShell>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-[30px] font-bold text-on-surface mb-2">Phân tích học tập</h1>
          <p className="text-[14px] text-on-surface-variant">Theo dõi tiến độ và hiệu suất học tập kỹ thuật của bạn.</p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Tổng giờ học', value: '42h', icon: 'schedule', color: 'text-primary' },
            { label: 'Từ vựng đã học', value: '120', icon: 'menu_book', color: 'text-secondary' },
            { label: 'Bài học hoàn thành', value: '15', icon: 'check_circle', color: 'text-tertiary' },
            { label: 'Điểm trung bình', value: '8.5/10', icon: 'grade', color: 'text-primary-container' },
          ].map((card, i) => (
            <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-[14px] text-on-surface-variant">{card.label}</span>
                <span className={`material-symbols-outlined ${card.color}`}>{card.icon}</span>
              </div>
              <div className="text-[24px] font-bold text-on-surface">{card.value}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* Study Time Trend (Line Chart) */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 lg:col-span-8 flex flex-col h-96">
            <h3 className="text-[20px] font-semibold text-on-surface mb-6">Xu hướng thời gian học</h3>
            <div className="flex-1 relative w-full h-full">
              <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                <path d="M0,40 Q10,30 20,35 T40,20 T60,25 T80,10 T100,5" fill="none" stroke="#3525cd" strokeWidth="2"></path>
                <circle cx="20" cy="35" r="1.5" fill="#ffffff" stroke="#3525cd" strokeWidth="1"></circle>
                <circle cx="40" cy="20" r="1.5" fill="#ffffff" stroke="#3525cd" strokeWidth="1"></circle>
                <circle cx="60" cy="25" r="1.5" fill="#ffffff" stroke="#3525cd" strokeWidth="1"></circle>
                <circle cx="80" cy="10" r="1.5" fill="#ffffff" stroke="#3525cd" strokeWidth="1"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 pb-[20%]">
                <div className="w-full border-b border-outline-variant"></div>
                <div className="w-full border-b border-outline-variant"></div>
                <div className="w-full border-b border-outline-variant"></div>
                <div className="w-full border-b border-outline-variant"></div>
              </div>
            </div>
          </div>

          {/* Vocabulary Growth (Area Chart) */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 lg:col-span-4 flex flex-col h-96">
            <h3 className="text-[20px] font-semibold text-on-surface mb-6">Tăng trưởng từ vựng</h3>
            <div className="flex-1 relative w-full h-full">
              <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#712ae2" stopOpacity="0.4"></stop>
                    <stop offset="100%" stopColor="#712ae2" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <path d="M0,45 L0,40 Q25,35 50,20 T100,10 L100,45 Z" fill="url(#areaGradient)"></path>
                <path d="M0,40 Q25,35 50,20 T100,10" fill="none" stroke="#712ae2" strokeWidth="2"></path>
              </svg>
            </div>
          </div>

          {/* Topic Performance (Bar Chart) */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 lg:col-span-6 flex flex-col min-h-[320px]">
            <h3 className="text-[20px] font-semibold text-on-surface mb-6">Hiệu suất theo chủ đề</h3>
            <div className="flex-1 flex flex-col justify-around gap-4">
              {[
                { label: 'Cloud Computing', percent: 85, color: 'bg-primary' },
                { label: 'Cybersecurity', percent: 60, color: 'bg-secondary' },
                { label: 'Networking', percent: 75, color: 'bg-tertiary' },
                { label: 'DevOps', percent: 90, color: 'bg-[#4f46e5]' },
              ].map((bar, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-32 text-[12px] text-on-surface-variant truncate">{bar.label}</div>
                  <div className="flex-1 h-2 bg-surface-container-low rounded-full overflow-hidden">
                    <div className={`h-full ${bar.color} rounded-full`} style={{ width: `${bar.percent}%` }}></div>
                  </div>
                  <div className="w-10 text-right text-[12px] font-bold text-on-surface">{bar.percent}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 lg:col-span-6 flex flex-col min-h-[320px]">
            <h3 className="text-[20px] font-semibold text-on-surface mb-6">Mức độ hoạt động hàng tuần</h3>
            <div className="flex-1 flex items-center justify-center overflow-x-auto">
              <div className="flex gap-1 pb-2">
                {[
                  [0,1,0,2,3,0,1],
                  [1,2,3,4,2,1,0],
                  [0,0,1,2,4,3,1],
                  [2,3,4,4,3,2,1],
                  [1,1,2,3,2,0,0],
                  [3,4,4,2,1,1,0]
                ].map((col, cIdx) => (
                  <div key={cIdx} className="flex flex-col gap-1">
                    {col.map((val, rIdx) => {
                      const colors = ['bg-surface-container-low', 'bg-[#EEF2FF]', 'bg-[#d8e2ff]', 'bg-[#c3c0ff]', 'bg-primary'];
                      return (
                        <div key={rIdx} className={`w-3 h-3 rounded-sm ${colors[val]}`}></div>
                      );
                    })}
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
