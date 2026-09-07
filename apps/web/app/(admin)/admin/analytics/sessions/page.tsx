'use client';
import * as React from 'react';
import { apiClient } from '@/shared/api/api-client';

function Spinner() {
  return <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
}

export default function AdminAnalyticsSessionsPage() {
  const [overview, setOverview] = React.useState<any>(null);
  const [trend, setTrend] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.allSettled([
      apiClient.get<any>('/analytics/sessions/overview'),
      apiClient.get<any>('/analytics/sessions/trend'),
    ]).then(([ov, tr]) => {
      if (ov.status === 'fulfilled') setOverview(ov.value);
      if (tr.status === 'fulfilled') setTrend(tr.value?.data ?? tr.value ?? []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Phân tích phiên học</h1>
        <p className="text-sm text-on-surface-variant mt-1">Thống kê hoạt động và mức độ tương tác của học viên.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center"><Spinner /></div>
      ) : (
        <>
          {overview && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(overview).map(([k, v]: any) => (
                <div key={k} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
                  <p className="text-xs text-on-surface-variant capitalize mb-1">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-2xl font-bold text-on-surface">{typeof v === 'number' ? v.toLocaleString('vi-VN') : String(v)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
            <h2 className="font-semibold text-on-surface mb-4">Xu hướng phiên học</h2>
            {trend.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-[40px] text-outline block mb-2">trending_up</span>
                <p className="text-sm text-on-surface-variant">Chưa có dữ liệu xu hướng</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant">
                {trend.slice(0, 10).map((row: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-2.5 text-sm">
                    <span className="text-on-surface-variant">{row.date ?? row.period ?? row.label ?? `Ngày ${i + 1}`}</span>
                    <span className="font-semibold text-on-surface">{(row.count ?? row.sessions ?? row.value ?? 0).toLocaleString('vi-VN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
