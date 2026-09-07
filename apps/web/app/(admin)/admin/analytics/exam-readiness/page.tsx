'use client';
import * as React from 'react';
import { apiClient } from '@/shared/api/api-client';

function Spinner() {
  return <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
}

export default function AdminExamReadinessPage() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiClient.get<any>('/exam-readiness/me')
      .then(res => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const items: any[] = data?.certificates ?? data?.exams ?? (data && !Array.isArray(data) ? [data] : data ?? []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Sẵn sàng kiểm tra</h1>
        <p className="text-sm text-on-surface-variant mt-1">Đánh giá mức độ sẵn sàng cho các bài kiểm tra chứng chỉ.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center"><Spinner /></div>
      ) : items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-outline block mb-3">workspace_premium</span>
          <p className="text-on-surface-variant">Chưa có dữ liệu đánh giá</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item: any, i: number) => {
            const score = item.readinessScore ?? item.score ?? 0;
            return (
              <div key={item.id ?? i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
                <h3 className="font-semibold text-on-surface mb-1">{item.name ?? item.title ?? 'Chứng chỉ'}</h3>
                <p className="text-xs text-on-surface-variant mb-4">{item.description ?? ''}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all bg-primary" style={{ width: `${score}%` }} />
                  </div>
                  <span className="text-sm font-bold text-on-surface whitespace-nowrap">{score}%</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-2">
                  {item.readyStatus ?? (score >= 70 ? 'Sẵn sàng' : 'Cần ôn thêm')}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
