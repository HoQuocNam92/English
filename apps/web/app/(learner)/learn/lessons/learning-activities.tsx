'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';

export function LearningActivities() {
  const [data, setData] = useState<any>({ certificates: [], vocabCount: 0, recentAttempts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);


  useEffect(() => {
    let current = true;
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [certificatesRes, vocabRes, progressRes] = await Promise.all<any>([
          apiClient.get('/certificates'),
          apiClient.get('/vocabulary?limit=1'),
          apiClient.get('/progress/me'),
        ]);
        
        if (!current) return;
        setData({
          certificates: certificatesRes?.data || certificatesRes || [],
          vocabCount: vocabRes?.meta?.total ?? 0,
          recentAttempts: progressRes?.recentAttempts || [],
        });
      } catch (err) {
        if (current) setError('Không thể tải hoạt động học tập. Vui lòng thử lại sau.');
      } finally {
        if (current) setLoading(false);
      }
    }
    loadData();
    return () => { current = false; };
  }, [reload]);

  if (loading) return <div className="mt-8"><LoadingSpinner /></div>;
  if (error) return <div role="alert" className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => setReload(value => value + 1)} className="mt-3 rounded-lg border border-red-300 px-4 py-2 font-semibold">Thử lại</button></div>;

  const practiceCategories = [
    {
      id: 'vocab',
      title: 'Luyện từ vựng',
      badge: `${data.vocabCount} TỪ`,
      description: 'Luyện tập từ vựng kỹ thuật, thuật ngữ và cụm từ thông dụng trong IT.',
      icon: 'sort_by_alpha',
      bgIcon: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
      badgeClass: 'text-blue-700 bg-blue-100',
      link: `/learn/flashcards`
    },
    {
      id: 'certifications',
      title: 'Luyện thi chứng chỉ',
      badge: `${data.certificates.length} CHỨNG CHỈ`,
      description: 'Chọn chứng chỉ, luyện câu hỏi theo domain và làm đề thi thử theo đúng cấu trúc kỳ thi.',
      icon: 'workspace_premium',
      bgIcon: 'bg-fuchsia-50 text-fuchsia-600 group-hover:bg-fuchsia-600 group-hover:text-white',
      badgeClass: 'text-fuchsia-700 bg-fuchsia-100',
      link: `/learn/certifications`
    }
  ];
  const recentActivities = data.recentAttempts.slice(0, 5);

  return (
      <div className="flex flex-col gap-8 mt-8">
        {/* Header */}
        <header>
          <h2 className="text-2xl font-bold text-on-background mb-2">Luyện tập</h2>
          <p className="text-[14px] leading-[20px] text-on-surface-variant">Chọn học từ vựng CNTT hoặc luyện thi chứng chỉ.</p>
        </header>

        {/* Categories Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {practiceCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-surface-white rounded-xl p-6 flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(15,23,24,0.08)] group cursor-pointer relative overflow-hidden border border-border-subtle"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${cat.bgIcon}`}>
                <span className="material-symbols-outlined transition-colors">{cat.icon}</span>
              </div>
              <h3 className="text-[20px] leading-[28px] font-semibold text-on-background mb-1">{cat.title}</h3>
              <p className="text-[12px] leading-[18px] text-on-surface-variant flex-grow mb-4">{cat.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className={`text-[12px] font-bold leading-[16px] tracking-[0.05em] px-2 py-1 rounded ${cat.badgeClass}`}>
                  {cat.badge}
                </span>
                <Link href={cat.link} className="text-[14px] font-semibold flex items-center gap-1 group-hover:underline text-primary">
                  Bắt đầu <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </section>

        {/* Recent Activities */}
        <section>
          <h2 className="text-[24px] leading-[32px] tracking-[-0.01em] font-bold text-on-background mb-6">Hoạt động gần đây</h2>
          <div className="bg-surface-white rounded-xl border border-border-subtle overflow-hidden">
            {!recentActivities.length && <p className="p-6 text-center text-[14px] text-on-surface-variant">Chưa có hoạt động học nào được ghi nhận.</p>}
            {recentActivities.map((activity: any) => <div key={activity.id} className="flex items-center justify-between border-b border-border-subtle p-4 last:border-b-0 hover:bg-surface-container-low">
              <div className="flex min-w-0 items-center gap-4"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activity.passed ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}><span className="material-symbols-outlined">{activity.passed ? 'check_circle' : 'quiz'}</span></div><div className="min-w-0"><h4 className="truncate text-[14px] font-semibold">{activity.exam?.title || 'Bài thi chứng chỉ'}</h4><p className="text-[12px] text-on-surface-variant">Lần thi ngày {new Date(activity.startedAt).toLocaleDateString('vi-VN')}</p></div></div>
              <div className="ml-4 flex shrink-0 items-center gap-4"><strong className="text-primary">{Math.round(activity.scorePercent ?? 0)}%</strong><Link href={`/learn/quiz/result/${activity.id}`} className="rounded-lg border border-border-subtle px-4 py-2 text-[14px] font-semibold">Xem kết quả</Link></div>
            </div>)}
          </div>
        </section>
      </div>
  );
}
