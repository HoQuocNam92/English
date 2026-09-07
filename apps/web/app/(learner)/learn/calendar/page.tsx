'use client';

import { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

export default function CalendarPage() {
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [calendarData, setCalendarData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [goals, setGoals] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const results = await Promise.allSettled([
          apiClient.get('/planner/calendar'),
          apiClient.get('/planner/today-tasks'),
          apiClient.get('/planner/monthly-goals/me'),
        ]);

        const get = (r: PromiseSettledResult<any>) =>
          r.status === 'fulfilled' ? r.value : null;

        const [calRes, tasksRes, goalsRes] = results;
        
        const cData = get(calRes);
        const tData = get(tasksRes);
        const gData = get(goalsRes);

        setCalendarData(cData?.data ?? cData ?? null);
        setTasks(tData?.data ?? tData ?? []);
        setGoals(gData?.data ?? gData ?? null);

      } catch (err: any) {
        setError(err?.message ?? 'Không thể tải dữ liệu lịch học');
      } finally {
        setLoading(false);
      }
    }
    loadData();
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

  // Fallback data if API is empty
  const fallbackTasks = tasks.length > 0 ? tasks : [
    { id: 1, title: 'Reading: API Guide', time: 'Hôm nay, 14:00', type: 'reading', completed: false },
    { id: 2, title: 'Mock: HR Screen', time: 'Hôm nay, 19:30', type: 'mock', completed: false },
    { id: 3, title: 'Vocab: IT Terms', time: 'Hoàn thành lúc 09:00', type: 'vocab', completed: true },
  ];

  return (
    <LearnerShell>
      {/* Header Section */}
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-on-surface mb-1 tracking-tight">Lịch học cá nhân</h1>
          <p className="text-[14px] text-on-surface-variant">Quản lý lộ trình và theo dõi tiến độ hoàn thành mục tiêu.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-white border border-border-subtle rounded-lg p-1">
          <button 
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded text-[14px] font-semibold transition-colors ${viewMode === 'month' ? 'bg-primary-light text-primary' : 'text-on-surface-variant hover:bg-surface-bright'}`}
          >
            Tháng
          </button>
          <button 
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded text-[14px] font-semibold transition-colors ${viewMode === 'week' ? 'bg-primary-light text-primary' : 'text-on-surface-variant hover:bg-surface-bright'}`}
          >
            Tuần
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Calendar (8 cols) */}
        <section className="md:col-span-8 flex flex-col gap-6">
          {/* Calendar Container */}
          <div className="bg-surface-white border border-border-subtle rounded-xl overflow-hidden shadow-sm flex flex-col">
            {/* Calendar Toolbar */}
            <div className="p-4 flex justify-between items-center border-b border-border-subtle bg-surface-bright">
              <div className="flex items-center gap-4">
                <button className="p-1 rounded hover:bg-surface-variant transition-colors text-on-surface-variant">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <h2 className="text-[20px] font-semibold">Tháng 10, 2024</h2>
                <button className="p-1 rounded hover:bg-surface-variant transition-colors text-on-surface-variant">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
              <button className="bg-primary text-white px-4 py-2 rounded-lg text-[14px] font-semibold hover:bg-primary-container transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Thêm lịch
              </button>
            </div>
            
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-border-subtle bg-surface-bright text-[12px] font-bold text-on-surface-variant text-center py-2 uppercase tracking-[0.05em]">
              <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-[1px] bg-border-subtle">
              {/* Week 1 */}
              <div className="bg-surface-white min-h-[120px] p-2 hover:bg-surface-bright transition-colors text-on-surface-variant opacity-50"><span className="font-semibold text-[14px]">30</span></div>
              <div className="bg-surface-white min-h-[120px] p-2 hover:bg-surface-bright transition-colors text-on-surface-variant opacity-50">
                <span className="font-semibold text-[14px]">1</span>
                <div className="mt-2 rounded px-1.5 py-0.5 text-[11px] font-semibold truncate bg-primary-light text-primary border border-primary-fixed-dim">Vocab: IT Terms</div>
              </div>
              <div className="bg-surface-white min-h-[120px] p-2 hover:bg-surface-bright transition-colors">
                <span className="font-semibold text-[14px]">2</span>
                <div className="mt-2 rounded px-1.5 py-0.5 text-[11px] font-semibold truncate bg-secondary-fixed text-secondary-fixed-dim border border-secondary-fixed-dim">Reading: Tech Docs</div>
              </div>
              <div className="bg-surface-white min-h-[120px] p-2 hover:bg-surface-bright transition-colors"><span className="font-semibold text-[14px]">3</span></div>
              <div className="bg-surface-white min-h-[120px] p-2 hover:bg-surface-bright transition-colors">
                <span className="font-semibold text-[14px]">4</span>
                <div className="mt-2 rounded px-1.5 py-0.5 text-[11px] font-semibold truncate bg-tertiary-fixed text-tertiary border border-tertiary-fixed-dim">Practice Test 1</div>
              </div>
              <div className="bg-surface-white min-h-[120px] p-2 hover:bg-surface-bright transition-colors"><span className="font-semibold text-[14px]">5</span></div>
              <div className="bg-surface-bright min-h-[120px] p-2 hover:bg-surface-bright transition-colors"><span className="font-semibold text-[14px] text-error">6</span></div>
              
              {/* Week 2 */}
              <div className="bg-surface-white min-h-[120px] p-2 hover:bg-surface-bright transition-colors">
                <span className="font-semibold text-[14px]">7</span>
                <div className="mt-2 rounded px-1.5 py-0.5 text-[11px] font-semibold truncate bg-primary-light text-primary border border-primary-fixed-dim">Vocab: Networking</div>
              </div>
              <div className="bg-primary-light min-h-[120px] p-2 border-2 border-primary ring-2 ring-primary-light rounded-sm relative z-10">
                <span className="font-semibold text-[14px] text-primary">8</span>
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary"></div>
                <div className="mt-2 rounded px-1.5 py-0.5 text-[11px] font-semibold truncate bg-secondary-fixed text-secondary-fixed-dim border border-secondary-fixed-dim">Reading: API Guide</div>
                <div className="mt-[2px] rounded px-1.5 py-0.5 text-[11px] font-semibold truncate bg-error-container text-on-error-container border border-error-container">Mock: HR Screen</div>
              </div>
              <div className="bg-surface-white min-h-[120px] p-2 hover:bg-surface-bright transition-colors"><span className="font-semibold text-[14px]">9</span></div>
              <div className="bg-surface-white min-h-[120px] p-2 hover:bg-surface-bright transition-colors">
                <span className="font-semibold text-[14px]">10</span>
                <div className="mt-2 rounded px-1.5 py-0.5 text-[11px] font-semibold truncate bg-tertiary-fixed text-tertiary border border-tertiary-fixed-dim">Grammar Review</div>
              </div>
              <div className="bg-surface-white min-h-[120px] p-2 hover:bg-surface-bright transition-colors"><span className="font-semibold text-[14px]">11</span></div>
              <div className="bg-surface-white min-h-[120px] p-2 hover:bg-surface-bright transition-colors">
                <span className="font-semibold text-[14px]">12</span>
                <div className="mt-2 rounded px-1.5 py-0.5 text-[11px] font-semibold truncate bg-tertiary-fixed text-tertiary border border-tertiary-fixed-dim">Practice Test 2</div>
              </div>
              <div className="bg-surface-bright min-h-[120px] p-2 hover:bg-surface-bright transition-colors"><span className="font-semibold text-[14px] text-error">13</span></div>
            </div>
          </div>

          {/* AI Insights & Streaks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-ai-accent border border-secondary-container rounded-xl p-6 flex flex-col justify-between hover:-translate-y-[2px] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-all">
              <div>
                <div className="flex items-center gap-2 mb-2 text-secondary">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  <span className="font-semibold text-[14px]">Gợi ý từ AI</span>
                </div>
                <p className="text-[14px] text-on-surface mb-4">Dựa trên kết quả bài Mock Interview gần nhất, bạn nên tăng cường luyện tập phần "System Design Vocabulary".</p>
              </div>
              <button className="self-start text-secondary border border-secondary-container bg-surface-white px-4 py-2 rounded-lg text-[14px] font-semibold hover:bg-secondary-fixed transition-colors">
                Thêm vào lịch
              </button>
            </div>
            
            <div className="bg-surface-white border border-border-subtle rounded-xl p-6 flex flex-col justify-center items-center text-center hover:-translate-y-[2px] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-all relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary to-transparent"></div>
              <div className="relative z-10">
                <span className="material-symbols-outlined text-4xl text-primary mb-2">local_fire_department</span>
                <h3 className="text-[24px] font-bold text-on-surface mb-1">7 Ngày</h3>
                <p className="text-[12px] text-on-surface-variant">Chuỗi học tập liên tục</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Tasks & Goals (4 cols) */}
        <aside className="md:col-span-4 flex flex-col gap-6">
          {/* Upcoming Tasks */}
          <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[20px] font-semibold text-on-surface">Nhiệm vụ sắp tới</h3>
              <button className="text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined">more_horiz</span></button>
            </div>
            <div className="flex flex-col gap-2">
              {fallbackTasks.map((task, idx) => (
                <div key={task.id || idx} className={`flex items-start gap-4 p-2 hover:bg-surface-bright rounded-lg transition-colors border border-transparent hover:border-border-subtle group ${task.completed ? 'opacity-60' : ''}`}>
                  {task.completed ? (
                    <div className="mt-1 w-5 h-5 rounded bg-primary border-2 border-primary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white text-[14px]">check</span>
                    </div>
                  ) : (
                    <div className="mt-1 w-5 h-5 rounded border-2 border-border-subtle flex-shrink-0 cursor-pointer group-hover:border-primary transition-colors"></div>
                  )}
                  
                  <div className="flex-grow">
                    <p className={`text-[14px] font-semibold text-on-surface ${task.completed ? 'line-through' : ''}`}>{task.title}</p>
                    <p className="text-[12px] text-on-surface-variant flex items-center gap-1">
                      {!task.completed && <span className="material-symbols-outlined text-[14px]">schedule</span>}
                      {task.time}
                    </p>
                  </div>
                  {!task.completed && (
                    <div className={`w-2 h-2 rounded-full mt-2 ${task.type === 'mock' ? 'bg-error-container' : 'bg-secondary-fixed-dim'}`}></div>
                  )}
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-primary font-semibold text-[14px] hover:bg-primary-light rounded-lg transition-colors">
              Xem tất cả nhiệm vụ
            </button>
          </div>

          {/* Goal Tracking */}
          <div className="bg-surface-white border border-border-subtle rounded-xl p-6 shadow-sm">
            <h3 className="text-[20px] font-semibold text-on-surface mb-4">Mục tiêu tháng 10</h3>
            <div className="flex flex-col gap-4">
              {/* Goal 1 */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[14px] font-semibold text-on-surface">Hoàn thành 20 bài Reading</span>
                  <span className="text-[12px] font-bold text-primary tracking-[0.05em]">12/20</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              {/* Goal 2 */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[14px] font-semibold text-on-surface">Học 300 từ vựng chuyên ngành</span>
                  <span className="text-[12px] font-bold text-secondary tracking-[0.05em]">210/300</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              {/* Goal 3 */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[14px] font-semibold text-on-surface">Thực hành 4 Mock Interviews</span>
                  <span className="text-[12px] font-bold text-tertiary tracking-[0.05em]">1/4</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </LearnerShell>
  );
}
