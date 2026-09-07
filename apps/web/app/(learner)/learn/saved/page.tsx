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
  imageUrl?: string;
}

export default function SavedLessonsPage() {
  const { t } = useI18n();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  useEffect(() => {
    async function fetchSaved() {
      try {
        const savedIds = JSON.parse(localStorage.getItem('techenglish.savedLessons') || '[]');
        if (savedIds.length === 0) {
          // Add some mock data if empty for demo based on html
          setLessons([
            { id: '1', title: 'Advanced Penetration Testing Terminology', description: 'Bài học chuyên sâu về thuật ngữ an ninh mạng.', level: 'Advanced', domain: 'Cybersecurity', duration: '20 min', progress: 65, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL0U0P16ybdvYCypdSnMVkp9h4WLIcUhq7PK7Oh9KBx8vcQzVSMm4kBd-echa88RXs72eFVpPHAHmNc_5Ja0BiAupIcPjknU5e91eEDCXPu74EdJOKnO04Otn3oaQLHxV0oLyT5vZgTQxksOSInOtvgVdWz-7gRl9IT8ddzdUOgmWXtd98YjeOYkcBZ8PXF1lHwdsu5rYoDgftFkxnNsko4Vl9ZYGFKMvWyI3TP8IWBD_Cp_z22Ao' },
            { id: '2', title: 'AWS Infrastructure Concepts & Vocabulary', description: 'AWS concepts.', level: 'Intermediate', domain: 'Cloud Computing', duration: '40 min', progress: 30, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdnv2YbfjS44nEpfDu3ga3NMrvZGh4mQny6ReCuCsPe6jtgb20mBw8Zu29_iD9_uG6U-cemMUqVbilFeeAETEtdhX9F-FSaXYVMtD0zWndqVXPA5LcYifmzqXzkPPQPyCslQyxxTwvXlg9h87i2o7ftCreHq7Er73oDuwQjB0k10ZK6NmjgsGnxXjeHJz3qJBn8UivlL8f7Xl0AicHFefRsMuqpRyvcGlUUUOY-Q2XBHn-RENjlLg' },
            { id: '3', title: 'Neural Networks: Academic Discourse', description: 'AI vocabulary.', level: 'Advanced', domain: 'Data Science', duration: '30 min', progress: 0, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQNNgwfoVxL7Nkaw5m54TCcXCnmObHXwxTWsYs2fPyKiUSCodRRp8Ej-V51Zx9-yXDzPInkInwgecb7joPs_WUW7ZsAnvrYj4a3z2wrapBJTbSemDZzgvzqgoS5uq0Ljr_-sGqos4zVJ2uPq8LyZnQOX-GjNqU-8vZUwD-1R4XVK6wg5KbzVbkGFOAMUHYiIvG3j8RgSh4Zd3EGkUP185uufcs8plM3SwZjLjpO2dmyOIlZNLXg1g' },
            { id: '4', title: 'Agile Methodology Foundations', description: 'Agile process basics.', level: 'Beginner', domain: 'Software Engineering', duration: '15 min', progress: 100, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQhT5V64SenN8A7DaTUR9JxOMmT5sbpZq69B3lnW5wb3JznBM-MsxH9G-vp7LKfX3OCKiJOtGvi5as9jBiJ-4VzkGNQfSqvaD6nsBsvXpK2BAzp4p3D-QKaDPSs750_xp9db5ovI8WRT5XeYrhOqqas1sikS_msEkgjqW3rYZun3v-j0REErDP4-C9BUZhWxqTerWHcXQMYKa3qT3mH4K-9yKoCIjmqfUk8B-iAVfePdElyQHS8Uw' }
          ]);
          setLoading(false);
          return;
        }
        
        const res = await apiClient.get<{ items: Lesson[] }>('/lessons?limit=50');
        const allLessons = res.items || [];
        
        // Filter by saved IDs
        const saved = allLessons.filter((l: Lesson) => savedIds.includes(l.id)).map((l: Lesson) => ({
          ...l,
          progress: Math.floor(Math.random() * 100), // mock progress
          description: l.description || 'Bài học chuyên sâu về ' + l.title,
          level: l.level || 'Intermediate',
          domain: l.domain || 'Cloud Computing'
        }));
        setLessons(saved.length > 0 ? saved : []);
      } catch (err) {
        console.error(err);
        setLessons([
          { id: '1', title: 'Advanced Penetration Testing Terminology', description: 'Bài học chuyên sâu về thuật ngữ an ninh mạng.', level: 'Advanced', domain: 'Cybersecurity', duration: '20 min', progress: 65, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL0U0P16ybdvYCypdSnMVkp9h4WLIcUhq7PK7Oh9KBx8vcQzVSMm4kBd-echa88RXs72eFVpPHAHmNc_5Ja0BiAupIcPjknU5e91eEDCXPu74EdJOKnO04Otn3oaQLHxV0oLyT5vZgTQxksOSInOtvgVdWz-7gRl9IT8ddzdUOgmWXtd98YjeOYkcBZ8PXF1lHwdsu5rYoDgftFkxnNsko4Vl9ZYGFKMvWyI3TP8IWBD_Cp_z22Ao' },
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

  const filtered = lessons.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = topicFilter ? l.domain.toLowerCase().includes(topicFilter.toLowerCase()) : true;
    const matchesLevel = levelFilter ? l.level.toLowerCase().includes(levelFilter.toLowerCase()) : true;
    return matchesSearch && matchesTopic && matchesLevel;
  });

  return (
    <LearnerShell>
      {/* Header & Toolbar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[30px] font-bold text-on-surface mb-2" style={{ lineHeight: '38px', letterSpacing: '-0.02em' }}>Bài học đã lưu</h1>
          <p className="text-on-surface-variant text-[14px]">Tiếp tục hành trình học thuật với các module kỹ thuật chuyên sâu bạn đã đánh dấu.</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Tìm trong mục đã lưu..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-[36px] pr-2 py-2 rounded-md border border-outline-variant text-[12px] focus:outline-none focus:ring-2 focus:ring-primary min-w-[200px] bg-surface-container-lowest text-on-surface" 
            />
          </div>
          <div className="relative">
            <select 
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="appearance-none bg-surface-container-lowest border border-outline-variant text-on-surface-variant text-[12px] py-2 pl-3 pr-[36px] rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Chủ đề (Tất cả)</option>
              <option value="cybersecurity">Cybersecurity</option>
              <option value="data science">Data Science</option>
              <option value="cloud">Cloud Computing</option>
              <option value="software">Software Engineering</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">arrow_drop_down</span>
          </div>
          <div className="relative">
            <select 
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="appearance-none bg-surface-container-lowest border border-outline-variant text-on-surface-variant text-[12px] py-2 pl-3 pr-[36px] rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Trình độ (Tất cả)</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">arrow_drop_down</span>
          </div>
        </div>
      </div>

      {/* Saved Lessons Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(lesson => (
            <div key={lesson.id} className="bg-surface-container-lowest rounded-lg border border-outline-variant overflow-hidden flex flex-col group relative hover:shadow-[0_4px_6px_-1px_rgba(15,23,24,0.1)] hover:-translate-y-0.5 transition-all">
              <div className="h-[140px] w-full relative">
                {lesson.imageUrl ? (
                  <img src={lesson.imageUrl} alt={lesson.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-outline text-4xl">image</span>
                  </div>
                )}
                
                <button 
                  aria-label="Remove bookmark" 
                  onClick={() => removeSaved(lesson.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-surface-container-lowest/90 backdrop-blur rounded-full flex items-center justify-center text-primary shadow-sm hover:bg-surface-container-lowest transition-colors z-10"
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                </button>
                
                <div className="absolute bottom-2 left-2 bg-surface-container-highest/80 backdrop-blur px-2 py-1 rounded text-[12px] font-bold text-on-surface flex items-center gap-1 uppercase tracking-[0.05em]">
                  <span className="material-symbols-outlined text-[16px]">signal_cellular_alt</span> {lesson.level}
                </div>
              </div>
              
              <div className="p-4 flex flex-col flex-grow">
                <div className="text-primary text-[12px] font-bold mb-1 uppercase tracking-wider">{lesson.domain}</div>
                <h3 className="font-semibold text-[14px] text-on-surface mb-2 line-clamp-2 leading-tight">{lesson.title}</h3>
                
                <div className="mt-auto pt-4">
                  <div className="flex justify-between items-center mb-1 text-[12px] text-on-surface-variant">
                    <span>Tiến độ</span>
                    <span className="font-medium text-primary">{lesson.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${lesson.progress}%` }}></div>
                  </div>
                  <Link href={`/learn/lessons/${lesson.id}`} className="w-full py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold text-[14px] rounded-md transition-colors flex justify-center items-center gap-1">
                    {lesson.progress === 100 ? 'Ôn tập lại' : (lesson.progress === 0 ? 'Bắt đầu học' : 'Tiếp tục học')} 
                    <span className="material-symbols-outlined text-[18px]">
                      {lesson.progress === 100 ? 'replay' : (lesson.progress === 0 ? 'play_arrow' : 'arrow_forward')}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-6xl text-outline mb-4">bookmark_border</span>
          <h3 className="text-lg font-bold text-on-surface mb-2">Không tìm thấy bài học</h3>
          <p className="text-on-surface-variant max-w-md mb-6">Bạn chưa lưu bài học nào hoặc không có kết quả phù hợp với tìm kiếm.</p>
          <Link href="/learn/lessons" className="bg-primary text-white font-bold rounded-xl px-6 py-2.5 hover:opacity-90">
            Khám phá bài học
          </Link>
        </div>
      )}
    </LearnerShell>
  );
}
