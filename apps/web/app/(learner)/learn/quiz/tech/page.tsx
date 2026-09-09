'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';

export default function TechQuizListPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res: any = await apiClient.get('/exams?status=published&limit=50');
        const data = res?.data ?? res ?? [];
        setExams(Array.isArray(data) ? data : []);
      } catch {
        setError('Không thể tải danh sách bài kiểm tra.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;

  return (
    <LearnerShell>
      <div className="max-w-[1280px] mx-auto flex flex-col gap-8 pb-8">
        <header>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/learn/practice" className="text-[14px] text-on-surface-variant hover:text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Luyện tập
            </Link>
          </div>
          <h1 className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-on-background mb-2">Hiểu biết kỹ thuật</h1>
          <p className="text-[14px] leading-[20px] text-on-surface-variant">Kiểm tra kiến thức qua các bài thi mô phỏng chuyên ngành IT.</p>
        </header>

        {error && <div className="text-red-500 text-[14px]">{error}</div>}

        {!exams.length && !error ? (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-4 block">integration_instructions</span>
            <p className="text-[16px]">Chưa có bài kiểm tra nào được xuất bản.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam: any) => (
              <div key={exam.id} className="bg-surface-white border border-border-subtle rounded-xl p-5 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(15,23,24,0.08)] transition-all duration-200 group">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">integration_instructions</span>
                  </div>
                  <span className="text-[11px] font-bold bg-tertiary-fixed text-tertiary px-2 py-0.5 rounded">
                    {exam._count?.questions ?? 0} CÂU
                  </span>
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-on-background group-hover:text-primary transition-colors line-clamp-2">{exam.title}</h3>
                  <p className="text-[12px] text-on-surface-variant mt-1 line-clamp-2">{exam.description || 'Bài kiểm tra kỹ năng kỹ thuật chuyên sâu.'}</p>
                </div>
                <div className="flex items-center gap-3 text-[12px] text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">timer</span>
                    {exam.durationMinutes} phút
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span>
                    {exam.level?.name || exam.domain?.name || 'Intermediate'}
                  </span>
                </div>
                <Link
                  href={`/learn/quiz/${exam.id}`}
                  className="mt-auto flex items-center justify-center gap-2 bg-primary hover:bg-indigo-700 text-white font-semibold text-[14px] py-2.5 px-4 rounded-lg transition-colors"
                >
                  Bắt đầu kiểm tra
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
