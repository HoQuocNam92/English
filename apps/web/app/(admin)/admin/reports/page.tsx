'use client';

import * as React from 'react';
import { PageHeader, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalLessons: number;
    totalExams: number;
    totalVocab: number;
    passRate: number;
  };
  domainsDistribution: Array<{
    code: string;
    name: string;
    lessons: number;
    vocabularies: number;
    questions: number;
    exams: number;
    totalItems: number;
  }>;
  levelsDistribution: Array<{
    code: string;
    name: string;
    order: number;
    lessons: number;
    vocabularies: number;
    questions: number;
    exams: number;
  }>;
  weeklyActivity: Array<{
    day: string;
    studyHours: number;
    activeUsers: number;
  }>;
}

const DOMAIN_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
];

export default function AdminReportsPage() {
  const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<AnalyticsData>('/analytics/dashboard');
        setAnalytics(res);
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : 'Không thể tải dữ liệu báo cáo');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const totalDomainItems = analytics?.domainsDistribution.reduce((s, d) => s + d.totalItems, 0) || 1;
  const maxWeeklyHours = Math.max(...(analytics?.weeklyActivity.map((w) => w.studyHours) ?? [100]));

  const filteredDomains = analytics?.domainsDistribution.filter(
    (d) => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <main className="flex-1 overflow-y-auto p-margin bg-background">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <h2 className="font-headline-h1 text-headline-h1 text-on-surface">Báo cáo Tổng quan</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-sm">Hiệu suất học tập và tương tác của hệ thống.</p>
          </div>
          <div className="flex flex-wrap items-center gap-sm bg-surface-container-lowest p-sm rounded-lg border border-outline-variant">
            <select 
              defaultValue="month"
              onChange={(e) => {}}
              className="bg-transparent border-none text-interface-sb font-interface-sb text-on-surface focus:ring-0 cursor-pointer py-xs px-sm rounded hover:bg-surface-container-low transition-colors"
            >
              <option value="month">Tháng này</option>
              <option value="last_month">Tháng trước</option>
              <option value="year">Năm nay</option>
            </select>
            <div className="w-px h-4 bg-outline-variant"></div>
            <select className="bg-transparent border-none text-interface-sb font-interface-sb text-on-surface focus:ring-0 cursor-pointer py-xs px-sm rounded hover:bg-surface-container-low transition-colors">
              <option>Tất cả lĩnh vực</option>
              <option>Cloud Computing</option>
              <option>Cybersecurity</option>
              <option>Data Science</option>
            </select>
            <div className="w-px h-4 bg-outline-variant"></div>
            <select className="bg-transparent border-none text-interface-sb font-interface-sb text-on-surface focus:ring-0 cursor-pointer py-xs px-sm rounded hover:bg-surface-container-low transition-colors">
              <option>Tất cả chứng chỉ</option>
              <option>AWS Solutions Architect</option>
              <option>CompTIA Security+</option>
              <option>Azure Fundamentals</option>
            </select>
            <button className="ml-sm flex items-center justify-center p-xs bg-primary text-on-primary rounded hover:bg-primary-container transition-colors">
              <span className="material-symbols-outlined text-[18px]" data-icon="filter_list">filter_list</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-md">
              <span className="font-interface-sb text-interface-sb text-on-surface-variant">Tổng số người học</span>
              <span className="material-symbols-outlined text-primary" data-icon="group">group</span>
            </div>
            <div>
              <div className="font-headline-h1 text-headline-h1 text-on-surface">{loading ? '...' : analytics?.overview.totalUsers.toLocaleString()}</div>
              <div className="flex items-center gap-xs mt-xs text-[#16a34a] font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[14px]" data-icon="trending_up">trending_up</span>
                <span>+5.2% so với tháng trước</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-md">
              <span className="font-interface-sb text-interface-sb text-on-surface-variant">Người học hoạt động</span>
              <span className="material-symbols-outlined text-secondary" data-icon="local_fire_department">local_fire_department</span>
            </div>
            <div>
              <div className="font-headline-h1 text-headline-h1 text-on-surface">{loading ? '...' : analytics?.overview.activeUsers.toLocaleString()}</div>
              <div className="flex items-center gap-xs mt-xs text-[#16a34a] font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[14px]" data-icon="trending_up">trending_up</span>
                <span>+2.1% so với tháng trước</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-md">
              <span className="font-interface-sb text-interface-sb text-on-surface-variant">Tỷ lệ hoàn thành</span>
              <span className="material-symbols-outlined text-tertiary" data-icon="task_alt">task_alt</span>
            </div>
            <div>
              <div className="font-headline-h1 text-headline-h1 text-on-surface">{loading ? '...' : Math.round((analytics?.overview.passRate || 0)*100)}%</div>
              <div className="w-full bg-surface-container-high h-2 rounded-full mt-sm overflow-hidden">
                <div className="bg-tertiary h-full rounded-full" style={{ width: `${Math.round((analytics?.overview.passRate || 0)*100)}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-md">
              <span className="font-interface-sb text-interface-sb text-on-surface-variant">Điểm TB hệ thống</span>
              <span className="material-symbols-outlined text-primary-container" data-icon="school">school</span>
            </div>
            <div>
              <div className="font-headline-h1 text-headline-h1 text-on-surface">7.8<span className="text-headline-h3 text-on-surface-variant">/10</span></div>
              <div className="flex items-center gap-xs mt-xs text-[#dc2626] font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[14px]" data-icon="trending_down">trending_down</span>
                <span>-0.1 so với tháng trước</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          <div className="lg:col-span-2 bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="font-headline-h3 text-headline-h3 text-on-surface">Tiến độ học tập theo tuần</h3>
              <button className="text-on-surface-variant hover:text-primary p-xs rounded hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
              </button>
            </div>
            <div className="flex-1 relative w-full h-[300px] flex items-end">
              <div className="flex items-end justify-between gap-3 h-full w-full px-2">
                {(analytics?.weeklyActivity ?? [
                  { day: 'T2', studyHours: 42, activeUsers: 28 },
                  { day: 'T3', studyHours: 58, activeUsers: 35 },
                  { day: 'T4', studyHours: 65, activeUsers: 40 },
                  { day: 'T5', studyHours: 72, activeUsers: 46 },
                  { day: 'T6', studyHours: 85, activeUsers: 52 },
                  { day: 'T7', studyHours: 94, activeUsers: 59 },
                  { day: 'CN', studyHours: 76, activeUsers: 48 },
                ]).map((item) => {
                  const heightPercent = Math.round((item.studyHours / (maxWeeklyHours || 100)) * 100);
                  return (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end">
                      <span className="text-[10px] font-bold text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.studyHours}h
                      </span>
                      <div className="w-full bg-surface-container rounded-t-lg h-[80%] flex items-end overflow-hidden">
                        <div
                          className="w-full bg-primary rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                          style={{ height: `${Math.max(15, heightPercent)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-on-surface-variant">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="font-headline-h3 text-headline-h3 text-on-surface">Phân bố theo lĩnh vực</h3>
              <button className="text-on-surface-variant hover:text-primary p-xs rounded hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
              </button>
            </div>
            <div className="flex-1 relative w-full h-[200px] flex justify-center items-center">
              <div className="w-32 h-32 rounded-full border-[16px] border-surface-container-high relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[16px] border-transparent border-t-primary border-r-secondary border-b-tertiary opacity-90 transform rotate-45"></div>
                <span className="font-headline-h3 text-headline-h3 text-on-surface absolute z-10 text-center flex flex-col">IT</span>
              </div>
            </div>
            <div className="mt-md flex flex-col gap-sm">
              {(analytics?.domainsDistribution ?? []).slice(0,3).map((dom, idx) => {
                const bgClasses = ['bg-primary', 'bg-secondary', 'bg-tertiary'];
                return (
                  <div key={dom.code} className="flex items-center justify-between font-body-sm text-body-sm">
                    <div className="flex items-center gap-xs"><div className={`w-3 h-3 rounded-full ${bgClasses[idx%3]}`}></div><span className="truncate max-w-[100px]">{dom.name}</span></div>
                    <span className="font-interface-sb text-on-surface">{Math.round((dom.totalItems / totalDomainItems) * 100)}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-3 bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-all flex flex-col">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="font-headline-h3 text-headline-h3 text-on-surface">Điểm trung bình theo chứng chỉ</h3>
              <button className="text-on-surface-variant hover:text-primary p-xs rounded hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
              </button>
            </div>
            <div className="flex-1 relative w-full h-[300px]">
              <div className="flex items-end justify-between gap-6 h-full w-full px-2 pt-6">
                 {['AWS Architect', 'Azure Fund.', 'CompTIA Sec+', 'CCNA', 'CISSP', 'GCP Data Eng'].map((label, i) => {
                    const scores = [7.2, 8.5, 7.8, 6.9, 8.1, 7.5];
                    const heightPercent = Math.round((scores[i] / 10) * 100);
                    return (
                      <div key={label} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <span className="text-xs font-bold text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">
                          {scores[i]}
                        </span>
                        <div className="w-full bg-surface-container h-[80%] flex items-end">
                          <div
                            className="w-full bg-primary transition-all duration-500 group-hover:brightness-110 rounded-t-sm"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-on-surface-variant text-center leading-tight h-8">{label}</span>
                      </div>
                    );
                 })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}