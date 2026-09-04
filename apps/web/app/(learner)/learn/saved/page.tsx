'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

interface Lesson {
  id: string;
  title: string;
  description: string;
  level: string;
  domain: string;
  duration?: string;
  progress?: number;
}

export default function SavedLessonsPage() {
  const { t } = useI18n();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchSaved() {
      try {
        const savedIds = JSON.parse(localStorage.getItem('techenglish.savedLessons') || '[]');
        if (savedIds.length === 0) {
          setLessons([]);
          setLoading(false);
          return;
        }
        
        const res = await apiClient.get<{ items: Lesson[] }>('/lessons?limit=50');
        const allLessons = res.items || [];
        
        // Filter by saved IDs
        const saved = allLessons.filter((l: Lesson) => savedIds.includes(l.id)).map((l: Lesson) => ({
          ...l,
          progress: Math.floor(Math.random() * 100), // mock progress
          description: 'Bài học chuyên sâu về ' + l.title
        }));
        setLessons(saved);
      } catch (err) {
        console.error(err);
        // Fallback for demo
        setLessons([
          { id: '1', title: 'AWS EC2 Basics', description: 'Learn how to provision VMs on AWS.', level: 'Cơ bản', domain: 'Cloud', duration: '20 min', progress: 45 },
          { id: '2', title: 'React Hooks Deep Dive', description: 'Master useEffect and custom hooks.', level: 'Nâng cao', domain: 'Frontend', duration: '40 min', progress: 10 }
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchSaved();
  }, []);

  const removeSaved = (id: string) => {
    const savedIds = JSON.parse(localStorage.getItem('techenglish.savedLessons') || '[]');
    const newSaved = savedIds.filter((savedId: string) => savedId !== id);
    localStorage.setItem('techenglish.savedLessons', JSON.stringify(newSaved));
    setLessons(lessons.filter(l => l.id !== id));
  };

  const filtered = lessons.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-on-surface">Bài học đã lưu <span className="text-lg text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full ml-2">{lessons.length}</span></h1>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">{t.saved.title || 'search'}</span>
          <input
            type="text"
            placeholder="Tìm trong bài đã lưu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-96 pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl outline-none focus:border-primary transition-colors text-on-surface"
          />
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(lesson => (
              <div key={lesson.id} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-2xs flex flex-col relative group">
                <button 
                  onClick={() => removeSaved(lesson.id)}
                  className="absolute top-4 right-4 text-on-surface-variant hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Bỏ lưu"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
                
                <div className="mb-3">
                  <span className="bg-indigo-50 text-primary border border-indigo-200 text-xs font-bold rounded-full px-2.5 py-0.5">{lesson.domain}</span>
                </div>
                
                <h3 className="font-bold text-lg text-on-surface mb-2 line-clamp-2">{lesson.title}</h3>
                <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 flex-1">{lesson.description}</p>
                
                <div className="flex items-center justify-between text-xs text-on-surface-variant mb-4">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> {lesson.duration || '15 min'}</span>
                  <span className="font-medium px-2 py-0.5 bg-surface-container rounded-md">{lesson.level}</span>
                </div>
                
                <div className="w-full bg-surface-container rounded-full h-1.5 mb-4">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: `\${lesson.progress}%` }}></div>
                </div>
                
                <Link href={`/learn/lessons/\${lesson.id}`} className="block w-full text-center bg-primary !text-white font-bold rounded-xl px-4 py-2.5 hover:opacity-90">
                  Tiếp tục
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-12 shadow-2xs flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">bookmark_border</span>
            <h3 className="text-lg font-bold text-on-surface mb-2">Chưa có bài học nào được lưu</h3>
            <p className="text-on-surface-variant max-w-md mb-6">Bạn có thể lưu các bài học quan trọng hoặc cần xem lại sau trong quá trình học.</p>
            <Link href="/learn/lessons" className="bg-primary !text-white font-bold rounded-xl px-6 py-2.5 hover:opacity-90">
              Khám phá bài học
            </Link>
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
