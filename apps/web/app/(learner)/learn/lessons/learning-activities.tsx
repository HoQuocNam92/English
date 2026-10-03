'use client';
import { AppIcon } from '@/shared/ui/AppIcon';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { apiClient } from '@/shared/api/api-client';

export function LearningActivities() {
  const [data, setData] = useState<any>({ recentAttempts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);


  useEffect(() => {
    let current = true;
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const progressRes = await apiClient.get<{ recentAttempts?: any[] }>('/progress/me');
        if (!current) return;
        setData({ recentAttempts: progressRes?.recentAttempts ?? [] });
      } catch (err) {
        if (current) setError('Không thể tải hoạt động học tập. Vui lòng thử lại sau.');
      } finally {
        if (current) setLoading(false);
      }
    }
    loadData();
    return () => { current = false; };
  }, [reload]);

  if (loading) return <div role="status" aria-label="Đang tải hoạt động học tập" className="mt-6 grid gap-4 md:grid-cols-2">{[0, 1].map(index => <div key={index} className="animate-pulse rounded-2xl border border-outline-variant/50 bg-white p-5"><div className="h-10 w-10 rounded-xl bg-slate-100" /><div className="mt-4 h-5 w-40 rounded bg-slate-100" /><div className="mt-3 h-4 w-3/4 rounded bg-slate-100" /></div>)}</div>;
  if (error) return <div role="alert" className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => setReload(value => value + 1)} className="mt-3 rounded-lg border border-red-300 px-4 py-2 font-semibold">Thử lại</button></div>;

  const recentActivities = data.recentAttempts.slice(0, 5);

  return (
      <div className="flex flex-col gap-8 mt-8">
        {/* Recent Activities */}
        <section>
          <h2 className="text-[24px] leading-[32px] tracking-[-0.01em] font-bold text-on-background mb-6">Hoạt động gần đây</h2>
          <div className="bg-surface-white rounded-xl border border-border-subtle overflow-hidden">
            {!recentActivities.length && <p className="p-6 text-center text-[14px] text-on-surface-variant">Chưa có hoạt động học nào được ghi nhận.</p>}
            {recentActivities.map((activity: any) => <div key={activity.id} className="flex items-center justify-between border-b border-border-subtle p-4 last:border-b-0 hover:bg-surface-container-low">
              <div className="flex min-w-0 items-center gap-4"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activity.passed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}><AppIcon className="">{activity.passed ? 'check_circle' : 'quiz'}</AppIcon></div><div className="min-w-0"><h4 className="truncate text-[14px] font-semibold">{activity.exam?.title || 'Bài thi chứng chỉ'}</h4><p className="text-[12px] text-on-surface-variant">Lần thi ngày {new Date(activity.startedAt).toLocaleDateString('vi-VN')}</p></div></div>
              <div className="ml-4 flex shrink-0 items-center gap-4"><strong className="text-primary">{Math.round(activity.scorePercent ?? 0)}%</strong><Link href={`/learn/quiz/result/${activity.id}`} className="rounded-lg border border-border-subtle px-4 py-2 text-[14px] font-semibold">Xem kết quả</Link></div>
            </div>)}
          </div>
        </section>
      </div>
  );
}
