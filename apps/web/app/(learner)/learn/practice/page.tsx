'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';

export default function LearnerPracticePage() {
  const [data, setData] = useState<any>({ exams: [], vocabCount: 0, lessons: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [examsRes, vocabRes, lessonsRes] = await Promise.all<any>([
          apiClient.get('/exams?limit=4&status=published'),
          apiClient.get('/vocabulary?limit=1'), // just to get total count if headers or metadata provides it, or just pass limit=100
          apiClient.get('/lessons?limit=1')
        ]);
        
        setData({
          exams: examsRes?.data || examsRes || [],
          vocabCount: vocabRes?.total || (vocabRes?.data || vocabRes || []).length,
          lessons: lessonsRes?.data || lessonsRes || []
        });
      } catch (err) {
        setError('Failed to load practice data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LearnerShell><div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></LearnerShell>;

  const { exams, vocabCount, lessons } = data;
  const firstLessonId = lessons[0]?.id || 'unknown';
  const firstExamId = exams[0]?.id || 'unknown';

  const practiceCategories = [
    {
      id: 'vocab',
      title: 'Flashcards Thuật ngữ Chuyên sâu (SRS)',
      badge: 'Spaced Repetition',
      description: 'Hệ thống lặp lại ngắt quãng giúp bạn ghi nhớ thuật ngữ IT vĩnh viễn.',
      stats: `${vocabCount || 0} thẻ từ vựng`,
      icon: 'style',
      color: 'text-primary',
      bgBadge: 'bg-primary/10 text-primary',
      link: `/learn/flashcards/${firstLessonId}`
    },
    {
      id: 'scenario',
      title: 'Xử lý Tình huống Thực tế (Scenario-Based)',
      badge: 'Real-world Architecture',
      description: 'Đọc mô tả sự cố hệ thống (Outage, Latency, Data Leak) và chọn giải pháp kỹ thuật tối ưu.',
      stats: `Luyện tập tình huống`,
      icon: 'psychology',
      color: 'text-ai-accent',
      bgBadge: 'bg-ai-accent/10 text-ai-accent',
      link: `/learn/practice/scenario/scen-1`
    },
    {
      id: 'mock-exam',
      title: 'Thi thử (Mock Exam)',
      badge: 'Format chuẩn',
      description: 'Mô phỏng kỳ thi thật có bấm giờ, chấm điểm đỗ/trượt.',
      stats: `${exams.length} đề thi`,
      icon: 'military_tech',
      color: 'text-amber-600',
      bgBadge: 'bg-amber-100 text-amber-900',
      link: `/learn/quiz/${firstExamId}`
    }
  ];

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Trung tâm Luyện tập & Thi thử</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Rèn luyện phản xạ thuật ngữ và giải quyết các bài toán kiến trúc thực tế.
          </p>
        </div>

        {/* Practice Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {practiceCategories.map((cat) => (
            <div
              key={cat.id}
              className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs hover:border-primary/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className={`material-symbols-outlined text-[26px] ${cat.color} group-hover:text-white`}>
                      {cat.icon}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${cat.bgBadge}`}>
                    {cat.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors mb-2">
                  {cat.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                  {cat.description}
                </p>
              </div>

              <div className="pt-4 border-t border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <span className="text-[11px] font-semibold text-outline">{cat.stats}</span>
                <Link
                  href={cat.link}
                  className="px-4 py-2 bg-primary hover:bg-indigo-700 !text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span className="!text-white">Bắt đầu luyện</span>
                  <span className="material-symbols-outlined text-[16px] !text-white">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LearnerShell>
  );
}
