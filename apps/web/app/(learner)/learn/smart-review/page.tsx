'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';

export default function SmartReviewPage() {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [focusTopics, setFocusTopics] = useState<any>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [analysisRes, topicsRes] = await Promise.all<any>([
          apiClient.get('/smart-review/analysis').catch(() => ({})),
          apiClient.get('/smart-review/focus-topics').catch(() => ({ data: [] }))
        ]);
        
        setAnalysis(analysisRes?.data || analysisRes || {});
        setFocusTopics(topicsRes?.data || topicsRes || []);
      } catch (err) {
        // using default fallback if api not implemented
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <LearnerShell>
      <div className="flex flex-col max-w-[1280px] mx-auto pb-12">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-[24px] md:text-[30px] font-bold text-on-surface mb-2 tracking-tight">Ôn tập thông minh</h1>
          <p className="text-[14px] text-on-surface-variant max-w-3xl">
            AI đã phân tích quá trình học của bạn và đề xuất lộ trình ôn tập tối ưu để khắc phục các lỗi thường gặp.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* AI Analysis Card (Spans 8 cols) */}
          <div className="md:col-span-8 bg-surface-white rounded-lg border border-border-subtle p-6 hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-ai-accent rounded-full border border-[#7C3AED]">
                <span className="material-symbols-outlined text-[#7C3AED]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <h2 className="text-[20px] font-semibold text-on-surface">Phân tích lỗi lặp lại</h2>
            </div>
            
            <div className="h-64 w-full bg-surface-container-low rounded flex items-center justify-center mb-6 relative overflow-hidden">
              <div className="absolute bottom-0 w-full h-full flex items-end justify-around px-4 pb-4 gap-2">
                {/* Chart Bars */}
                <div className="flex flex-col items-center gap-2 w-1/4">
                  <div className="w-full bg-error opacity-80 rounded-t h-[80%] transition-all hover:opacity-100 cursor-pointer"></div>
                  <span className="text-[12px] text-on-surface-variant text-center leading-tight">HTTP Status<br/>Codes</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-1/4">
                  <div className="w-full bg-primary opacity-60 rounded-t h-[65%] transition-all hover:opacity-100 cursor-pointer"></div>
                  <span className="text-[12px] text-on-surface-variant text-center leading-tight">Networking<br/>Concepts</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-1/4">
                  <div className="w-full bg-primary opacity-40 rounded-t h-[40%] transition-all hover:opacity-100 cursor-pointer"></div>
                  <span className="text-[12px] text-on-surface-variant text-center leading-tight">REST API<br/>Verbs</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-1/4">
                  <div className="w-full bg-primary opacity-20 rounded-t h-[20%] transition-all hover:opacity-100 cursor-pointer"></div>
                  <span className="text-[12px] text-on-surface-variant text-center leading-tight">JSON<br/>Parsing</span>
                </div>
              </div>
              {/* Chart Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none opacity-20">
                <div className="border-t border-on-surface-variant w-full"></div>
                <div className="border-t border-on-surface-variant w-full"></div>
                <div className="border-t border-on-surface-variant w-full"></div>
                <div className="border-t border-on-surface-variant w-full"></div>
              </div>
            </div>
            
            <p className="text-[14px] text-on-surface-variant">
              Dựa trên kết quả bài tập gần đây, bạn đang gặp khó khăn chủ yếu ở phần <strong className="text-error font-semibold">HTTP Status Codes</strong> (tỉ lệ lỗi 42%) và <strong className="text-on-surface font-semibold">Networking Concepts</strong>. AI đề xuất tập trung ôn luyện hai chủ đề này.
            </p>
          </div>

          {/* Focus Topics (Spans 4 cols) */}
          <div className="md:col-span-4 bg-ai-accent rounded-lg border border-[#7C3AED] p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#7C3AED]">target</span>
              <h2 className="text-[20px] font-semibold text-on-surface">Chủ đề cần tập trung</h2>
            </div>
            
            <div className="space-y-4 flex-grow">
              {/* Topic 1 */}
              <div className="bg-surface-white rounded p-4 border border-border-subtle hover:border-primary transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-[14px] font-semibold text-on-surface group-hover:text-primary transition-colors">HTTP Status Codes</h3>
                  <span className="text-[12px] font-bold tracking-[0.05em] text-error bg-error-container px-2 py-1 rounded uppercase">Ưu tiên cao</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">history</span>
                  <span className="text-[12px]">Sai 15/36 câu gần nhất</span>
                </div>
              </div>
              
              {/* Topic 2 */}
              <div className="bg-surface-white rounded p-4 border border-border-subtle hover:border-primary transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-[14px] font-semibold text-on-surface group-hover:text-primary transition-colors">Networking Concepts</h3>
                  <span className="text-[12px] font-bold tracking-[0.05em] text-secondary bg-secondary-fixed px-2 py-1 rounded uppercase">Cần ôn tập</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">history</span>
                  <span className="text-[12px]">Sai 8/20 câu gần nhất</span>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-6 bg-primary text-white text-[14px] font-semibold py-2 px-4 rounded-[10px] hover:bg-opacity-90 transition-opacity flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">play_arrow</span>
              Bắt đầu phiên ôn tập
            </button>
          </div>

          {/* Recommended Lessons (Spans 6 cols) */}
          <div className="md:col-span-6 bg-surface-white rounded-lg border border-border-subtle p-6 hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">menu_book</span>
                Bài học đề xuất
              </h2>
              <Link href="/learn/lessons" className="text-[14px] font-semibold text-primary hover:underline">Xem tất cả</Link>
            </div>
            
            <div className="space-y-4">
              {/* Lesson Item */}
              <div className="flex gap-4 p-4 rounded border border-border-subtle hover:bg-surface-container-lowest transition-colors cursor-pointer">
                <div className="w-16 h-16 bg-primary-light rounded flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>dns</span>
                </div>
                <div className="flex-grow">
                  <h4 className="text-[14px] font-semibold text-on-surface mb-1">Phân biệt 4xx và 5xx Errors</h4>
                  <p className="text-[12px] text-on-surface-variant line-clamp-2">Hiểu rõ sự khác biệt giữa lỗi Client và lỗi Server trong giao tiếp HTTP...</p>
                </div>
                <button className="text-primary p-2 hover:bg-primary-light rounded-full self-center transition-colors">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
              
              {/* Lesson Item */}
              <div className="flex gap-4 p-4 rounded border border-border-subtle hover:bg-surface-container-lowest transition-colors cursor-pointer">
                <div className="w-16 h-16 bg-primary-light rounded flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>router</span>
                </div>
                <div className="flex-grow">
                  <h4 className="text-[14px] font-semibold text-on-surface mb-1">TCP/IP vs OSI Model</h4>
                  <p className="text-[12px] text-on-surface-variant line-clamp-2">Ôn tập lại các tầng mạng và giao thức tương ứng trong thực tế...</p>
                </div>
                <button className="text-primary p-2 hover:bg-primary-light rounded-full self-center transition-colors">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recommended Quizzes (Spans 6 cols) */}
          <div className="md:col-span-6 bg-surface-white rounded-lg border border-border-subtle p-6 hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">quiz</span>
                Quiz đề xuất
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Quiz Card */}
              <div className="border border-border-subtle rounded-lg p-4 flex flex-col justify-between hover:border-primary hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all cursor-pointer">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="p-1.5 bg-primary-light text-primary rounded-md">
                      <span className="material-symbols-outlined text-[14px]">http</span>
                    </span>
                    <span className="text-[12px] font-bold tracking-[0.05em] uppercase text-on-surface-variant">15 Câu</span>
                  </div>
                  <h4 className="text-[14px] font-semibold text-on-surface mb-1">Mini Test: HTTP Codes</h4>
                  <p className="text-[12px] text-on-surface-variant">Tập trung vào các mã lỗi thường gặp trong API.</p>
                </div>
                <div className="mt-4 pt-4 border-t border-border-subtle flex justify-between items-center">
                  <span className="text-[12px] text-on-surface-variant">~10 phút</span>
                  <span className="text-[14px] font-semibold text-primary">Làm ngay</span>
                </div>
              </div>
              
              {/* Quiz Card */}
              <div className="border border-border-subtle rounded-lg p-4 flex flex-col justify-between hover:border-primary hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all cursor-pointer">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="p-1.5 bg-primary-light text-primary rounded-md">
                      <span className="material-symbols-outlined text-[14px]">lan</span>
                    </span>
                    <span className="text-[12px] font-bold tracking-[0.05em] uppercase text-on-surface-variant">20 Câu</span>
                  </div>
                  <h4 className="text-[14px] font-semibold text-on-surface mb-1">Networking Basics</h4>
                  <p className="text-[12px] text-on-surface-variant">Kiểm tra từ vựng tiếng Anh chuyên ngành mạng.</p>
                </div>
                <div className="mt-4 pt-4 border-t border-border-subtle flex justify-between items-center">
                  <span className="text-[12px] text-on-surface-variant">~15 phút</span>
                  <span className="text-[14px] font-semibold text-primary">Làm ngay</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </LearnerShell>
  );
}
