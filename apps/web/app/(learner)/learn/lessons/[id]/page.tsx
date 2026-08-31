'use client';

import * as React from 'react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';

export default function LearnerLessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const lessonId = unwrappedParams.id;
  
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLesson() {
      try {
        const res = await apiClient.get(`/lessons/${lessonId}`);
        setLesson(res);
      } catch (err) {
        setError('Failed to load lesson details');
      } finally {
        setLoading(false);
      }
    }
    if (lessonId) fetchLesson();
  }, [lessonId]);

  const markComplete = async () => {
    try {
      await apiClient.post(`/progress/mark-lesson/${lessonId}`, {});
      alert('Đã đánh dấu hoàn thành bài học!');
    } catch (err) {
      alert('Không thể đánh dấu hoàn thành.');
    }
  };

  if (loading) return <LearnerShell><div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div></LearnerShell>;
  if (error || !lesson) return <LearnerShell><div className="p-8 text-center text-red-500">{error || 'Lesson not found'}</div></LearnerShell>;

  const terms = lesson.vocabulary || [];
  const sections = lesson.sections || [];

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6">
        {/* Breadcrumb & Top Bar */}
        <div className="flex justify-between items-center">
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Link href="/learn/lessons" className="hover:text-primary transition-colors">
              Lộ trình học
            </Link>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-primary font-semibold">{lesson.title}</span>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={markComplete}
              className="px-4 py-2 bg-green-100 text-green-800 hover:bg-green-200 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Đánh dấu hoàn thành</span>
            </button>
            <Link
              href={`/learn/flashcards/${lesson.id}`}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors border border-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]">style</span>
              <span>Học Flashcards</span>
            </Link>
          </div>
        </div>

        {/* 2-Column Reader Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Theory Content (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
              <h1 className="text-xl lg:text-2xl font-extrabold text-on-surface tracking-tight">
                {lesson.title}
              </h1>
              <p className="text-xs lg:text-sm text-on-surface-variant leading-relaxed p-3.5 bg-surface-bright rounded-xl border border-outline-variant/30">
                {lesson.description}
              </p>

              {/* Formatted Reading Content */}
              <div className="pt-4 border-t border-outline-variant/30 text-xs lg:text-sm text-on-surface leading-relaxed space-y-4 font-sans">
                {sections.map((sec: any, idx: number) => (
                  <div key={idx} className="space-y-2">
                    <p className="whitespace-pre-wrap">{sec.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Vocabulary Glossary Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4 sticky top-24">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                <h3 className="text-sm font-bold text-on-surface">Thuật ngữ trong bài</h3>
                <span className="text-xs text-primary font-bold">{terms.length} từ vựng</span>
              </div>

              <div className="space-y-3">
                {terms.map((t: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-surface-bright border border-outline-variant/40 space-y-1.5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-primary">{t.term}</span>
                    </div>
                    <p className="text-xs font-semibold text-on-surface m-0">{t.definition}</p>
                  </div>
                ))}
                {terms.length === 0 && <p className="text-xs text-slate-500">Chưa có từ vựng cho bài học này.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
