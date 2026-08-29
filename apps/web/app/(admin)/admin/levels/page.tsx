'use client';

import * as React from 'react';
import { PageHeader, Badge } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';

interface LevelItem {
  id: string;
  code: string;
  name: string;
  order: number;
  description: string;
  isActive: boolean;
  _count?: {
    lessons: number;
    vocabularies: number;
    questions: number;
    exams: number;
  };
}

const LEVEL_COLOR_MAP: Record<string, { bg: string; text: string; icon: string }> = {
  beginner: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'text-emerald-700', icon: 'signal_cellular_alt_1_bar' },
  intermediate: { bg: 'bg-blue-100 text-blue-800 border-blue-200', text: 'text-blue-700', icon: 'signal_cellular_alt_2_bar' },
  advanced: { bg: 'bg-purple-100 text-purple-800 border-purple-200', text: 'text-purple-700', icon: 'signal_cellular_alt' },
  professional: { bg: 'bg-amber-100 text-amber-800 border-amber-200', text: 'text-amber-700', icon: 'workspace_premium' },
};

export default function AdminLevelsPage() {
  const [levels, setLevels] = React.useState<LevelItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<{ data: LevelItem[] }>('/levels');
        setLevels(res.data ?? []);
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : 'Không thể tải danh sách cấp độ');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Cấp độ học tập"
        description="Quản lý và theo dõi các cấp độ năng lực tiếng Anh IT (CEFR & Tech Framework)"
      />

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Tổng cấp độ', value: loading ? '—' : String(levels.length), icon: 'stairs', color: 'text-primary' },
          { label: 'Tổng bài học theo cấp', value: loading ? '—' : String(levels.reduce((s, l) => s + (l._count?.lessons ?? 0), 0)), icon: 'auto_stories', color: 'text-secondary' },
          { label: 'Tổng từ vựng', value: loading ? '—' : String(levels.reduce((s, l) => s + (l._count?.vocabularies ?? 0), 0)), icon: 'translate', color: 'text-tertiary' },
          { label: 'Ngân hàng câu hỏi', value: loading ? '—' : String(levels.reduce((s, l) => s + (l._count?.questions ?? 0), 0)), icon: 'quiz', color: 'text-error' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-on-surface-variant">{stat.label}</p>
              <span className={`material-symbols-outlined text-[22px] ${stat.color}`}>{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Level Cards Grid */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-on-surface mb-4">Danh sách cấp độ</h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 space-y-3 animate-pulse">
                <div className="h-6 w-1/3 rounded bg-outline-variant/20" />
                <div className="h-4 w-full rounded bg-outline-variant/10" />
                <div className="h-10 w-full rounded bg-outline-variant/10" />
              </div>
            ))}
          </div>
        ) : levels.length === 0 ? (
          <div className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">stairs</span>
            <p className="text-sm text-on-surface-variant">Chưa có dữ liệu cấp độ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {levels.map((lvl) => {
              const meta = LEVEL_COLOR_MAP[lvl.code] ?? {
                bg: 'bg-gray-100 text-gray-800 border-gray-200',
                text: 'text-gray-700',
                icon: 'school',
              };

              return (
                <div
                  key={lvl.id}
                  className="rounded-2xl bg-surface-container-low border border-outline-variant/30 p-6 flex flex-col justify-between hover:shadow-sm transition-all"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${meta.bg}`}>
                          <span className="material-symbols-outlined text-[20px]">{meta.icon}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-on-surface">{lvl.name}</h3>
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                              Bậc {lvl.order}
                            </span>
                          </div>
                          <code className="text-xs text-on-surface-variant font-mono">{lvl.code}</code>
                        </div>
                      </div>
                      {lvl.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                          Ngừng
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-on-surface-variant leading-relaxed mb-4">{lvl.description}</p>
                  </div>

                  {/* Counters */}
                  <div className="grid grid-cols-4 gap-2 pt-4 border-t border-outline-variant/20 text-center">
                    <div className="bg-surface-container rounded-xl p-2.5">
                      <p className="text-xs text-on-surface-variant mb-0.5">Bài học</p>
                      <p className="text-sm font-bold text-on-surface">{lvl._count?.lessons ?? 0}</p>
                    </div>
                    <div className="bg-surface-container rounded-xl p-2.5">
                      <p className="text-xs text-on-surface-variant mb-0.5">Từ vựng</p>
                      <p className="text-sm font-bold text-on-surface">{lvl._count?.vocabularies ?? 0}</p>
                    </div>
                    <div className="bg-surface-container rounded-xl p-2.5">
                      <p className="text-xs text-on-surface-variant mb-0.5">Câu hỏi</p>
                      <p className="text-sm font-bold text-on-surface">{lvl._count?.questions ?? 0}</p>
                    </div>
                    <div className="bg-surface-container rounded-xl p-2.5">
                      <p className="text-xs text-on-surface-variant mb-0.5">Đề thi</p>
                      <p className="text-sm font-bold text-on-surface">{lvl._count?.exams ?? 0}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
