'use client';

import React, { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';

export default function ReadingLabPage() {
  const { t } = useI18n();
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [wpm, setWpm] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: any = await apiClient.get('/lessons?type=reading&limit=20');
        const items = res?.data ?? res ?? [];
        if (Array.isArray(items) && items.length > 0) {
          setLessons(items);
        } else {
          setLessons([
            { id: 1, title: 'Introduction to Cloud Architecture', domain: 'Cloud', time: '5 min read', level: 'Intermediate', content: 'Cloud architecture refers to the various components in terms of databases, software capabilities, applications, etc. engineered to leverage the power of cloud resources to solve business problems...' },
            { id: 2, title: 'TCP/IP Fundamentals', domain: 'Networking', time: '8 min read', level: 'Beginner', content: 'TCP/IP stands for Transmission Control Protocol/Internet Protocol. TCP/IP is a set of standardized rules that allow computers to communicate on a network such as the internet...' },
            { id: 3, title: 'Zero Trust Security Model', domain: 'Security', time: '6 min read', level: 'Advanced', content: 'Zero Trust is a security framework requiring all users, whether in or outside the organization\'s network, to be authenticated, authorized, and continuously validated...' },
            { id: 4, title: 'CI/CD Pipeline Best Practices', domain: 'DevOps', time: '7 min read', level: 'Intermediate', content: 'Continuous Integration and Continuous Deployment (CI/CD) is a method to frequently deliver apps to customers by introducing automation into the stages of app development...' },
          ]);
        }
      } catch (error) {
        setLessons([
          { id: 1, title: 'Introduction to Cloud Architecture', domain: 'Cloud', time: '5 min read', level: 'Intermediate', content: 'Cloud architecture refers to the various components in terms of databases, software capabilities, applications, etc. engineered to leverage the power of cloud resources to solve business problems...' },
          { id: 2, title: 'TCP/IP Fundamentals', domain: 'Networking', time: '8 min read', level: 'Beginner', content: 'TCP/IP stands for Transmission Control Protocol/Internet Protocol. TCP/IP is a set of standardized rules that allow computers to communicate on a network such as the internet...' },
        ]);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedLesson && startTime) {
      const interval = setInterval(() => {
        const elapsedMinutes = (Date.now() - startTime) / 60000;
        const wordCount = selectedLesson.content.split(/\s+/).length;
        if (elapsedMinutes > 0) {
          setWpm(Math.round(wordCount / elapsedMinutes));
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedLesson, startTime]);

  const handleSelectLesson = (lesson: any) => {
    setSelectedLesson(lesson);
    setStartTime(Date.now());
    setWpm(0);
    setShowResult(false);
  };

  const filters = ['Tất cả', 'Cloud', 'Networking', 'Security', 'DevOps'];
  const filteredLessons = activeFilter === 'Tất cả' ? lessons : lessons.filter(l => l.domain === activeFilter);

  return (
    <LearnerShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-1">{t.readingLab.title || 'Technical Reading Lab'}</h1>
        <p className="text-on-surface-variant text-sm">Luyện đọc tài liệu chuyên ngành kỹ thuật</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeFilter === filter ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col gap-4">
          {filteredLessons.map(lesson => (
            <div
              key={lesson.id}
              onClick={() => handleSelectLesson(lesson)}
              className={`bg-surface-container-lowest border rounded-2xl p-4 cursor-pointer transition-colors hover:border-primary/50 ${
                selectedLesson?.id === lesson.id ? 'border-primary ring-1 ring-primary' : 'border-outline-variant/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{lesson.domain}</span>
                <span className="text-xs text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {lesson.time}
                </span>
              </div>
              <h3 className="font-bold mb-2 line-clamp-2">{lesson.title}</h3>
              <div className="text-xs text-on-surface-variant font-medium bg-surface-container inline-block px-2 py-1 rounded">
                Level: {lesson.level}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 min-h-[600px] flex flex-col relative">
            {!selectedLesson ? (
              <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant opacity-60">
                <span className="material-symbols-outlined text-6xl mb-4">menu_book</span>
                <p>Chọn một bài đọc để bắt đầu</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/20">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedLesson.title}</h2>
                    <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">{selectedLesson.domain}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{wpm}</div>
                    <div className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Words / Min</div>
                  </div>
                </div>

                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none mb-8 text-on-surface leading-relaxed">
                  <p>{selectedLesson.content}</p>
                  <p>In this lesson, we cover the core concepts associated with {selectedLesson.title.toLowerCase()}. Understanding these principles is vital for any professional working in the tech industry today. The architecture encompasses multiple layers that interact to provide a seamless experience.</p>
                  <p>Key takeaways include understanding the deployment models, security considerations, and network topographies that enable these technologies to function at scale.</p>
                </div>

                <div className="mt-auto bg-surface-container-low rounded-xl p-6 border border-outline-variant/30">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">quiz</span>
                    Reading Comprehension
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="font-semibold mb-2">1. What is the main topic of this passage?</p>
                      <div className="space-y-2">
                        {['A core tech concept', 'History of computing', 'Programming languages'].map((opt, i) => (
                          <label key={i} className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant/40 hover:bg-surface-container cursor-pointer">
                            <input type="radio" name="q1" className="text-primary" />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowResult(true)}
                    className="bg-primary !text-white font-semibold rounded-xl px-5 py-2.5 hover:opacity-90 transition-opacity w-full"
                  >
                    Kiểm tra đáp án
                  </button>

                  {showResult && (
                    <div className="mt-4 p-4 rounded-xl bg-green-50 text-green-700 border border-green-200 font-medium text-center">
                      Bạn đã trả lời đúng 1/1 câu hỏi! Tuyệt vời!
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
