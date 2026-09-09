'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';

export default function FlashcardsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [level, setLevel] = useState('');
  const [vocabCount, setVocabCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [lessonRes, vocabularyRes] = await Promise.all<any>([
          apiClient.get('/lessons?status=published&limit=100'),
          apiClient.get('/vocabulary?status=published&limit=1'),
        ]);
        const data = lessonRes?.data ?? lessonRes ?? [];
        setLessons(Array.isArray(data) ? data : []);
        setVocabCount(vocabularyRes?.meta?.total ?? 0);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const domains = Array.from(new Map(lessons.filter(l => l.domain).map(l => [l.domain.code, l.domain])).values());
  const levels = Array.from(new Map(lessons.filter(l => l.level).map(l => [l.level.code, l.level])).values());
  const filtered = lessons.filter((lesson) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch = !keyword || lesson.title?.toLowerCase().includes(keyword) || lesson.domain?.name?.toLowerCase().includes(keyword);
    return (lesson._count?.vocabularies ?? 0) > 0 && matchesSearch && (!domain || lesson.domain?.code === domain) && (!level || lesson.level?.code === level);
  });

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
          <h1 className="text-[30px] leading-[38px] tracking-[-0.02em] font-bold text-on-background mb-2">Từ vựng chuyên ngành</h1>
          <p className="text-[14px] leading-[20px] text-on-surface-variant">Chọn bài học để luyện tập từ vựng kỹ thuật IT.</p>
        </header>

        <div className="grid w-full gap-3 rounded-xl border border-border-subtle bg-white p-4 md:grid-cols-[minmax(260px,1fr)_220px_220px_auto]">
          <label className="relative block min-w-0">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên bài học hoặc lĩnh vực..." className="h-11 w-full rounded-lg border border-border-subtle bg-surface-container-low pl-10 pr-4 text-[14px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </label>
          <select value={domain} onChange={e => setDomain(e.target.value)} className="h-11 rounded-lg border border-border-subtle bg-surface-container-low px-3 text-sm outline-none focus:border-primary">
            <option value="">Tất cả lĩnh vực</option>
            {domains.map((item: any) => <option key={item.code} value={item.code}>{item.name}</option>)}
          </select>
          <select value={level} onChange={e => setLevel(e.target.value)} className="h-11 rounded-lg border border-border-subtle bg-surface-container-low px-3 text-sm outline-none focus:border-primary">
            <option value="">Tất cả trình độ</option>
            {levels.map((item: any) => <option key={item.code} value={item.code}>{item.name}</option>)}
          </select>
          <button type="button" onClick={() => { setSearch(''); setDomain(''); setLevel(''); }} className="h-11 whitespace-nowrap px-3 text-sm font-bold text-primary hover:underline">Xóa lọc</button>
        </div>

        <Link href="/learn/flashcards/all" className="flex items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 transition-all hover:border-primary hover:shadow-sm">
          <div className="flex items-center gap-4"><span className="material-symbols-outlined flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">library_books</span><div><h2 className="font-bold text-on-surface">Luyện toàn bộ kho từ vựng</h2><p className="mt-1 text-sm text-on-surface-variant">Không giới hạn theo bài học · {vocabCount.toLocaleString('vi-VN')} từ đã xuất bản</p></div></div>
          <span className="material-symbols-outlined text-primary">arrow_forward</span>
        </Link>

        {!filtered.length ? (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-4 block">sort_by_alpha</span>
            <p className="text-[16px]">Không tìm thấy bộ từ vựng phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((lesson: any) => (
              <Link
                key={lesson.id}
                href={`/learn/flashcards/${lesson.id}`}
                className="bg-surface-white border border-border-subtle rounded-xl p-5 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(15,23,24,0.08)] transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">sort_by_alpha</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-on-background group-hover:text-primary transition-colors line-clamp-2">{lesson.title}</h3>
                  <p className="text-[12px] text-on-surface-variant mt-1">{lesson.domain?.name || 'CNTT'} · {lesson.level?.name || 'Intermediate'}</p>
                  <p className="mt-2 text-xs font-bold text-primary">{lesson._count?.vocabularies ?? 0} từ đã liên kết</p>
                </div>
                <div className="flex items-center gap-1 text-primary text-[13px] font-semibold mt-auto">
                  Luyện tập <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
