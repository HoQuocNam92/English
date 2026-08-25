'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/shared/layout';

interface LessonItem {
  id: string;
  order: number;
  title: string;
  domain: string;
  level: string;
  durationMinutes: number;
  termsCount: number;
  exercisesCount: number;
  status: 'Published' | 'Draft';
}

const mockLessons: LessonItem[] = [
  {
    id: 'les-1',
    order: 1,
    title: 'Understanding REST APIs & HTTP Methods',
    domain: 'Software Engineering',
    level: 'Beginner',
    durationMinutes: 20,
    termsCount: 8,
    exercisesCount: 5,
    status: 'Published'
  },
  {
    id: 'les-2',
    order: 2,
    title: 'JSON Data Formats & Error Handling In APIs',
    domain: 'Software Engineering',
    level: 'Intermediate',
    durationMinutes: 25,
    termsCount: 12,
    exercisesCount: 6,
    status: 'Published'
  },
  {
    id: 'les-3',
    order: 3,
    title: 'AWS Cloud Foundations: Compute, Storage & Networking',
    domain: 'Cloud Computing',
    level: 'Intermediate',
    durationMinutes: 35,
    termsCount: 18,
    exercisesCount: 10,
    status: 'Published'
  },
  {
    id: 'les-4',
    order: 4,
    title: 'CI/CD Pipelines: GitHub Actions & Continuous Deployment',
    domain: 'DevOps',
    level: 'Advanced',
    durationMinutes: 30,
    termsCount: 14,
    exercisesCount: 8,
    status: 'Published'
  },
  {
    id: 'les-5',
    order: 5,
    title: 'Microservices Communication with gRPC & Protocol Buffers',
    domain: 'Software Engineering',
    level: 'Professional',
    durationMinutes: 45,
    termsCount: 22,
    exercisesCount: 12,
    status: 'Draft'
  }
];

export default function LessonManagementPage() {
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');

  const filteredLessons = mockLessons.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = !domain || item.domain === domain;
    return matchesSearch && matchesDomain;
  });

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Quản lý bài học</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Sắp xếp giáo trình, biên soạn bài học lý thuyết và thuật ngữ tiếng Anh chuyên ngành.
            </p>
          </div>
          <Link
            href="/lessons/editor"
            className="px-4 py-2.5 bg-primary hover:bg-indigo-700 !text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] !text-white">add</span>
            <span className="!text-white">Soạn bài học mới</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm bài học..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs text-on-surface transition-all placeholder:text-outline"
            />
          </div>

          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface font-medium outline-none focus:border-primary"
          >
            <option value="">Tất cả chuyên ngành</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Cloud Computing">Cloud Computing</option>
            <option value="DevOps">DevOps</option>
            <option value="Cybersecurity">Cybersecurity</option>
          </select>
        </div>

        {/* Lesson Cards List */}
        <div className="space-y-3">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/50 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center font-bold text-sm text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary transition-colors shrink-0">
                  #{lesson.order}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                      {lesson.level}
                    </span>
                    <span className="text-xs font-semibold text-on-surface-variant">{lesson.domain}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        lesson.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {lesson.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                    {lesson.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-outline">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {lesson.durationMinutes} phút
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">translate</span>
                      {lesson.termsCount} thuật ngữ
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">quiz</span>
                      {lesson.exercisesCount} câu hỏi kiểm tra
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Link
                  href="/lessons/editor"
                  className="px-3.5 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Chỉnh sửa</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
