'use client';
import * as React from 'react';
import { apiClient } from '@/shared/api/api-client';

function Spinner() {
  return <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
}

export default function AdminLearningPathsPage() {
  const [paths, setPaths] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiClient.get<any>('/learning-paths/me')
      .then(res => setPaths(res?.data ?? (Array.isArray(res) ? res : [res].filter(Boolean))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Lộ trình học tập</h1>
          <p className="text-sm text-on-surface-variant mt-1">Quản lý các lộ trình học tập chuyên ngành IT.</p>
        </div>
        <button className="bg-primary text-on-primary font-semibold text-sm px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tạo lộ trình
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center"><Spinner /></div>
      ) : paths.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-16 text-center">
          <span className="material-symbols-outlined text-[56px] text-outline block mb-4">route</span>
          <h3 className="font-semibold text-on-surface text-lg mb-2">Chưa có lộ trình nào</h3>
          <p className="text-sm text-on-surface-variant">Tạo lộ trình học tập đầu tiên cho học viên.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paths.map((p: any, i: number) => (
            <div key={p.id ?? i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">route</span>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface">{p.name ?? p.title ?? 'Lộ trình'}</h3>
                  <p className="text-xs text-on-surface-variant">{p.lessonCount ?? p.steps?.length ?? 0} bài học</p>
                </div>
              </div>
              {p.description && <p className="text-sm text-on-surface-variant line-clamp-2">{p.description}</p>}
              <div className="mt-3 pt-3 border-t border-outline-variant">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-surface-container-high h-1.5 rounded-full">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${p.progress ?? p.completionRate ?? 0}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-on-surface">{p.progress ?? p.completionRate ?? 0}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
