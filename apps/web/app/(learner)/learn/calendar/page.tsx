'use client';

import React, { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

export default function CalendarPage() {
  const { t } = useI18n();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const from = `${year}-${month}-01`;
        const to = `${year}-${month}-31`;
        
        const res: any = await apiClient.get(`/planner/my?from=${from}&to=${to}`);
        const items = res?.data ?? res ?? [];
        if (Array.isArray(items) && items.length > 0) {
          setPlans(items);
        } else {
          setPlans([
            { id: 1, date: `${year}-${month}-05`, title: 'Cloud Architecture Basics', status: 'completed' },
            { id: 2, date: `${year}-${month}-12`, title: 'Network Protocols', status: 'completed' },
            { id: 3, date: `${year}-${month}-18`, title: 'Kubernetes Introduction', status: 'upcoming' },
            { id: 4, date: `${year}-${month}-25`, title: 'AWS Security Exam Prep', status: 'upcoming' },
          ]);
        }
      } catch (error) {
        setPlans([]);
      }
    };
    fetchPlans();
  }, [currentDate]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month) === 0 ? 6 : getFirstDayOfMonth(year, month) - 1; // Adjust for Monday start

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const selectedDateStr = selectedDay ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}` : null;
  const dayPlans = selectedDateStr ? plans.filter(p => p.date === selectedDateStr) : [];

  const completedCount = plans.filter(p => p.status === 'completed').length;

  return (
    <LearnerShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-1">{t.calendar.title || 'Learning Calendar'}</h1>
        <p className="text-on-surface-variant text-sm">Lên kế hoạch và theo dõi tiến độ học tập</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 flex flex-col gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{monthNames[month]} / {year}</h2>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="w-10 h-10 rounded-full border border-outline-variant/50 flex items-center justify-center hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button onClick={nextMonth} className="w-10 h-10 rounded-full border border-outline-variant/50 flex items-center justify-center hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-outline-variant/30 rounded-xl overflow-hidden border border-outline-variant/30">
              {dayNames.map(d => (
                <div key={d} className="bg-surface-container-low text-center py-3 font-semibold text-sm text-on-surface-variant">
                  {d}
                </div>
              ))}
              
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-surface-container-lowest min-h-[100px] p-2 opacity-50"></div>
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = plans.filter(p => p.date === dateStr);
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                const isSelected = selectedDay === day;

                return (
                  <div 
                    key={day} 
                    onClick={() => handleDayClick(day)}
                    className={`bg-surface-container-lowest min-h-[100px] p-2 cursor-pointer transition-colors hover:bg-surface-container-low ${isToday ? 'ring-2 ring-primary ring-inset bg-primary/5' : ''} ${isSelected && !isToday ? 'bg-surface-container' : ''}`}
                  >
                    <div className={`font-semibold text-sm mb-1 ${isToday ? 'text-primary' : ''}`}>{day}</div>
                    <div className="flex flex-col gap-1">
                      {dayEvents.map(ev => (
                        <div key={ev.id} className={`text-[10px] p-1 px-1.5 rounded truncate font-medium ${ev.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-indigo-100 text-indigo-800 border border-indigo-200'}`}>
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Tổng quan tháng</h3>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 bg-surface-container rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary">{plans.length}</div>
                <div className="text-xs text-on-surface-variant mt-1">Đã lên kế hoạch</div>
              </div>
              <div className="flex-1 bg-green-50 rounded-xl p-4 text-center border border-green-100">
                <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                <div className="text-xs text-green-700 mt-1">Hoàn thành</div>
              </div>
            </div>

            <button className="bg-primary !text-white font-semibold rounded-xl px-5 py-3 w-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">add</span>
              Thêm kế hoạch
            </button>
          </div>

          {selectedDay && (
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">event_note</span>
                Ngày {selectedDay}/{month + 1}
              </h3>
              
              {dayPlans.length > 0 ? (
                <div className="space-y-3">
                  {dayPlans.map(plan => (
                    <div key={plan.id} className="p-3 border border-outline-variant/50 rounded-xl flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${plan.status === 'completed' ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{plan.title}</div>
                        <div className="text-xs text-on-surface-variant capitalize">{plan.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">calendar_add_on</span>
                  <p className="text-sm">Không có kế hoạch nào trong ngày này.</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Sắp tới</h3>
            <div className="space-y-4">
              {plans.filter(p => p.status === 'upcoming').slice(0, 3).map(plan => (
                <div key={plan.id} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs text-on-surface-variant font-bold">{new Date(plan.date).getDate()}</span>
                    <span className="text-[10px] text-primary font-bold">Th{new Date(plan.date).getMonth() + 1}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-1">{plan.title}</div>
                    <div className="text-xs text-on-surface-variant">Chưa hoàn thành</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
