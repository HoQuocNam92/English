'use client';
import * as React from 'react';
import { apiClient } from '@/shared/api/api-client';

function Spinner() {
  return <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
}

export default function AdminCalendarPage() {
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const now = new Date();

  React.useEffect(() => {
    apiClient.get<any>('/planner?limit=20')
      .then(res => setEvents(res?.data ?? res ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Lịch hoạt động</h1>
        <p className="text-sm text-on-surface-variant mt-1">Lịch trình và sự kiện của giáo viên và học viên.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-on-surface">
              {now.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-on-surface-variant py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const isToday = day === now.getDate();
              return (
                <div key={day} className={`aspect-square flex items-center justify-center rounded-lg text-sm cursor-pointer transition-colors ${isToday ? 'bg-primary text-on-primary font-bold' : 'hover:bg-surface-container text-on-surface'}`}>
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
          <h2 className="font-semibold text-on-surface mb-4">Sự kiện sắp tới</h2>
          {loading ? (
            <div className="text-center py-4"><Spinner /></div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-[40px] text-outline block mb-2">event</span>
              <p className="text-sm text-on-surface-variant">Chưa có sự kiện nào</p>
            </div>
          ) : (
            events.slice(0, 5).map((ev: any, i: number) => (
              <div key={ev.id ?? i} className="py-3 border-b border-outline-variant last:border-0">
                <p className="text-sm font-semibold text-on-surface">{ev.title ?? ev.name ?? 'Sự kiện'}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {ev.date ?? ev.scheduledAt ? new Date(ev.date ?? ev.scheduledAt).toLocaleDateString('vi-VN') : '—'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
