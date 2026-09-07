'use client';
import * as React from 'react';
import { apiClient } from '@/shared/api/api-client';

function Spinner() {
  return <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
}

export default function AdminSmartReviewPage() {
  const [focusTopics, setFocusTopics] = React.useState<any[]>([]);
  const [recommendedLessons, setRecommendedLessons] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.allSettled([
      apiClient.get<any>('/smart-review/focus-topics'),
      apiClient.get<any>('/smart-review/recommended-lessons'),
    ]).then(([ft, rl]) => {
      if (ft.status === 'fulfilled') setFocusTopics(ft.value?.data ?? ft.value ?? []);
      if (rl.status === 'fulfilled') setRecommendedLessons(rl.value?.data ?? rl.value ?? []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Ôn tập thông minh</h1>
        <p className="text-sm text-on-surface-variant mt-1">Hệ thống AI phân tích và đề xuất nội dung ôn tập phù hợp.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
            <h2 className="font-semibold text-on-surface mb-4">Chủ đề cần tập trung</h2>
            {focusTopics.length === 0 ? (
              <p className="text-center text-on-surface-variant py-4">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3">
                {focusTopics.map((t: any, i: number) => (
                  <div key={t.id ?? i} className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-on-surface">{t.name ?? t.topic}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-surface-container-high h-1.5 rounded-full">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${t.score ?? t.mastery ?? 50}%` }} />
                        </div>
                        <span className="text-xs text-on-surface-variant">{t.score ?? t.mastery ?? 50}%</span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${(t.score ?? t.mastery ?? 50) < 60 ? 'bg-error-container text-on-error-container' : 'bg-primary/10 text-primary'}`}>
                      {(t.score ?? t.mastery ?? 50) < 60 ? 'Cần ôn' : 'Tốt'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
            <h2 className="font-semibold text-on-surface mb-4">Bài học đề xuất</h2>
            {recommendedLessons.length === 0 ? (
              <p className="text-center text-on-surface-variant py-4">Chưa có đề xuất</p>
            ) : (
              <div className="space-y-3">
                {recommendedLessons.slice(0, 5).map((l: any, i: number) => (
                  <div key={l.id ?? i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-low transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-[16px]">menu_book</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{l.title}</p>
                      <p className="text-xs text-on-surface-variant">{l.type ?? ''} · {l.domain?.name ?? 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
