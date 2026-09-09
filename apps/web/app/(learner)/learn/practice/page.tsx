'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';

export default function LearnerPracticePage() {
  const [data, setData] = useState<any>({ exams: [], vocabCount: 0, lessons: [], readingCount: 0, progress: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    async function loadData() {
      try {
        const [examsRes, vocabRes, lessonsRes, readingRes, progressRes] = await Promise.all<any>([
          apiClient.get('/exams?limit=4&status=published'),
          apiClient.get('/vocabulary?limit=1'), 
          apiClient.get('/lessons?limit=100&status=published'),
          apiClient.get('/reading-lab/articles?limit=1'),
          apiClient.get('/progress/me'),
        ]);
        
        setData({
          exams: examsRes?.data || examsRes || [],
          vocabCount: vocabRes?.meta?.total ?? 0,
          lessons: lessonsRes?.data || [],
          readingCount: readingRes?.total ?? 0,
          progress: progressRes?.progress || [],
        });
      } catch (err) {
        setError('Failed to load practice data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;

  const practiceCategories = [
    {
      id: 'vocab',
      title: 'Từ vựng chuyên ngành',
      badge: `${data.vocabCount} TỪ`,
      description: 'Luyện tập từ vựng kỹ thuật, thuật ngữ và cụm từ thông dụng trong IT.',
      icon: 'sort_by_alpha',
      bgIcon: 'bg-primary-light text-primary group-hover:bg-primary-container group-hover:text-surface-white',
      badgeClass: 'text-tertiary bg-tertiary-fixed',
      link: `/learn/flashcards`
    },
    {
      id: 'reading',
      title: 'Đọc tài liệu',
      badge: `${data.readingCount} BÀI ĐỌC`,
      description: 'Cải thiện kỹ năng đọc hiểu tài liệu kỹ thuật, API docs và release notes.',
      icon: 'menu_book',
      bgIcon: 'bg-primary-light text-primary group-hover:bg-primary-container group-hover:text-surface-white',
      badgeClass: 'text-tertiary bg-tertiary-fixed',
      link: `/learn/reading-lab`
    },
    {
      id: 'tech-understanding',
      title: 'Bài thi & kiểm tra',
      badge: `${data.exams.length} BÀI KIỂM TRA`,
      description: 'Làm bài kiểm tra thông thường hoặc đề luyện thi chứng chỉ và nhận kết quả chấm điểm.',
      icon: 'integration_instructions',
      bgIcon: 'bg-primary-light text-primary group-hover:bg-primary-container group-hover:text-surface-white',
      badgeClass: 'text-tertiary bg-tertiary-fixed',
      link: `/learn/quiz/tech`
    },
    {
      id: 'scenario',
      title: 'Tình huống thực tế',
      badge: 'VÔ HẠN',
      description: 'Giao tiếp trong Daily Scrum, họp với khách hàng và báo cáo tiến độ.',
      icon: 'forum',
      bgIcon: 'bg-violet-200 text-violet-700 group-hover:bg-violet-600 group-hover:text-white',
      badgeClass: 'text-tertiary bg-tertiary-fixed',
      link: `/learn/practice/scenario/1`,
      isAi: true
    }
  ];
  const lessonById = new Map(data.lessons.map((lesson: any) => [lesson.id, lesson]));
  const recentActivities = data.progress
    .filter((item: any) => item.resourceType === 'lesson' && lessonById.has(item.resourceId))
    .slice(0, 5)
    .map((item: any) => ({ ...item, lesson: lessonById.get(item.resourceId) }));

  return (
    <LearnerShell>
      <div className="flex flex-col gap-8 pb-8 max-w-[1280px] mx-auto">
        {/* Header */}
        <header>
          <h1 className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-on-background mb-2">Luyện tập</h1>
          <p className="text-[14px] leading-[20px] text-on-surface-variant">Củng cố kiến thức tiếng Anh chuyên ngành CNTT của bạn.</p>
        </header>

        {/* Categories Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {practiceCategories.map((cat) => (
            <div
              key={cat.id}
              className={`bg-surface-white rounded-xl p-6 flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(15,23,24,0.08)] group cursor-pointer relative overflow-hidden ${cat.isAi ? 'border border-violet-200 bg-ai-accent' : 'border border-border-subtle'}`}
            >
              {cat.isAi && (
                <div className="absolute top-0 right-0 bg-violet-100 text-violet-700 text-[10px] font-bold leading-[16px] tracking-[0.05em] px-2 py-1 rounded-bl-lg">
                  KHÔNG GIỚI HẠN
                </div>
              )}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${cat.bgIcon}`}>
                <span className="material-symbols-outlined transition-colors">{cat.icon}</span>
              </div>
              <h3 className="text-[20px] leading-[28px] font-semibold text-on-background mb-1">{cat.title}</h3>
              <p className="text-[12px] leading-[18px] text-on-surface-variant flex-grow mb-4">{cat.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className={`text-[12px] font-bold leading-[16px] tracking-[0.05em] px-2 py-1 rounded ${cat.badgeClass}`}>
                  {cat.badge}
                </span>
                <Link href={cat.link} className={`text-[14px] font-semibold flex items-center gap-1 group-hover:underline ${cat.isAi ? 'text-violet-700' : 'text-primary'}`}>
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
              <div className="flex min-w-0 items-center gap-4"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activity.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}><span className="material-symbols-outlined">{activity.status === 'completed' ? 'check_circle' : 'pending'}</span></div><div className="min-w-0"><h4 className="truncate text-[14px] font-semibold">{activity.lesson.title}</h4><p className="text-[12px] text-on-surface-variant">{activity.lesson.domain?.name || 'CNTT'} · cập nhật {new Date(activity.updatedAt).toLocaleDateString('vi-VN')}</p></div></div>
              <div className="ml-4 flex shrink-0 items-center gap-4"><strong className="text-primary">{Math.round(activity.averageScorePercent ?? activity.completionPercent ?? 0)}%</strong><Link href={`/learn/lessons/${activity.resourceId}`} className="rounded-lg border border-border-subtle px-4 py-2 text-[14px] font-semibold">{activity.status === 'completed' ? 'Học lại' : 'Tiếp tục'}</Link></div>
            </div>)}
          </div>
        </section>
      </div>
    </LearnerShell>
  );
}
