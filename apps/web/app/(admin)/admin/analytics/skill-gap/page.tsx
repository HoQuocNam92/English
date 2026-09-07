'use client';
import * as React from 'react';
import { apiClient } from '@/shared/api/api-client';

function Spinner() {
  return <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
}

export default function AdminSkillGapPage() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiClient.get<any>('/skill-gap/me')
      .then(res => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const gaps: any[] = data?.gaps ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Phân tích kỹ năng</h1>
        <p className="text-sm text-on-surface-variant mt-1">Phân tích khoảng cách kỹ năng và đề xuất cải thiện.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center"><Spinner /></div>
      ) : gaps.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-outline block mb-3">psychology</span>
          <p className="text-on-surface-variant">Chưa có dữ liệu phân tích kỹ năng</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gaps.map((gap: any, i: number) => (
            <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-on-surface">{gap.skill ?? gap.topic ?? gap.name ?? 'Kỹ năng'}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">{gap.domain ?? ''}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  gap.priority === 'high' ? 'bg-error-container text-on-error-container' :
                  gap.priority === 'medium' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
                  'bg-primary-fixed text-on-primary-fixed'
                }`}>{gap.priority === 'high' ? 'Cao' : gap.priority === 'medium' ? 'Trung bình' : 'Thấp'}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${gap.currentLevel ?? gap.score ?? 50}%` }} />
                </div>
                <span className="text-sm font-semibold text-on-surface whitespace-nowrap">{gap.currentLevel ?? gap.score ?? 50}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
