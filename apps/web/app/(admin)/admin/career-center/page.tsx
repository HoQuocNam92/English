'use client';
import * as React from 'react';
import { apiClient } from '@/shared/api/api-client';

function Spinner() {
  return <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
}

export default function AdminCareerCenterPage() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiClient.get<any>('/career-prep')
      .then(res => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const items: any[] = data?.data ?? data?.jobs ?? data?.paths ?? (Array.isArray(data) ? data : []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Trung tâm nghề nghiệp</h1>
        <p className="text-sm text-on-surface-variant mt-1">Hỗ trợ chuẩn bị nghề nghiệp và lộ trình phát triển sự nghiệp IT.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center"><Spinner /></div>
      ) : items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-16 text-center">
          <span className="material-symbols-outlined text-[56px] text-outline block mb-4">work</span>
          <h3 className="font-semibold text-on-surface text-lg mb-2">Chưa có dữ liệu nghề nghiệp</h3>
          <p className="text-sm text-on-surface-variant">Tính năng đang được phát triển.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item: any, i: number) => (
            <div key={item.id ?? i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:shadow-sm transition-all">
              <h3 className="font-semibold text-on-surface mb-1">{item.title ?? item.name ?? item.role}</h3>
              <p className="text-sm text-on-surface-variant line-clamp-3">{item.description ?? ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
