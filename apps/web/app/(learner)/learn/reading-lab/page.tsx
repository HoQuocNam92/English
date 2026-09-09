'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';

export default function ReadingLabPage() {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [levelId, setLevelId] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1); }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const query = new URLSearchParams({ page: String(page), limit: '6' });
        if (categoryId) query.set('domainId', categoryId);
        if (levelId) query.set('levelId', levelId);
        if (debouncedSearch) query.set('search', debouncedSearch);
        const [articlesRes, categoriesRes, levelsRes] = await Promise.all<any>([
          apiClient.get(`/reading-lab/articles?${query}`).catch(() => ({ items: [], total: 0, totalPages: 1 })),
          categories.length ? Promise.resolve(categories) : apiClient.get('/reading-lab/categories').catch(() => []),
          levels.length ? Promise.resolve(levels) : apiClient.get('/levels').catch(() => ({ data: [] }))
        ]);
        
        const payload = articlesRes?.data || articlesRes || {};
        const items = Array.isArray(payload) ? payload : (payload.items || []);
        setArticles(items.map((item: any) => ({
          ...item,
          category: item.domain?.name || 'CNTT',
          readTime: `${item.estimatedMinutes || 0} phút đọc`,
          level: item.level?.name || item.level?.code || 'Chưa phân loại',
          summary: item.summary || 'Bài đọc kỹ thuật.',
          progress: Number(item.progress?.completionPercent || 0),
          isAiAssisted: Array.isArray(item.keyConcepts) && item.keyConcepts.length > 0,
          aiConcepts: item.keyConcepts || [],
          keyTerms: item.keyConcepts || [],
          termCount: item.keyConcepts?.length || 0,
          isNew: item.publishedAt ? Date.now() - new Date(item.publishedAt).getTime() < 14 * 86400000 : false,
        })));
        setTotal(Number(payload.total ?? items.length));
        setTotalPages(Math.max(1, Number(payload.totalPages ?? 1)));
        if (!categories.length) setCategories(categoriesRes?.data || categoriesRes || []);
        if (!levels.length) setLevels(levelsRes?.data || levelsRes || []);
      } catch (err) {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [page, categoryId, levelId, debouncedSearch]);

  const displayArticles = articles;

  return (
    <LearnerShell>
      <div className="mx-auto flex w-full min-w-0 max-w-[1280px] flex-col pb-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-[24px] md:text-[30px] font-bold text-on-surface mb-2 tracking-tight">Thư viện đọc hiểu CNTT</h1>
          <p className="w-full text-[14px] leading-6 text-on-surface-variant" style={{ maxWidth: '42rem' }}>
            Nâng cao kỹ năng đọc hiểu tài liệu chuyên ngành với các bài báo, whitepaper và tài liệu kỹ thuật được tuyển chọn, kèm từ vựng và khái niệm trọng tâm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar / Categories */}
          <aside className="md:col-span-3">
            <div className="bg-surface-white border border-border-subtle rounded-lg p-6 hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow duration-200 sticky top-24">
              <h3 className="text-[20px] font-semibold text-on-surface mb-4">Danh mục</h3>
              <ul className="flex flex-col gap-2">
                <li><button type="button" onClick={() => { setCategoryId(''); setPage(1); }} className={`w-full px-4 py-2 rounded text-[14px] flex items-center gap-2 ${!categoryId ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface hover:bg-primary/10'}`}><span className="material-symbols-outlined text-[20px]">apps</span>Tất cả danh mục</button></li>
                {categories.map((category) => <li key={category.id}><button type="button" onClick={() => { setCategoryId(category.id); setPage(1); }} className={`w-full px-4 py-2 rounded text-[14px] flex items-center gap-2 text-left ${categoryId === category.id ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface hover:bg-primary/10'}`}><span className="material-symbols-outlined text-[20px]">{category.icon || 'folder'}</span>{category.name}</button></li>)}
                {!categories.length && !loading && <li className="text-[12px] text-on-surface-variant">Chưa có danh mục bài đọc.</li>}
              </ul>
              
              <hr className="border-t border-border-subtle my-4" />
              
              <h3 className="text-[14px] font-semibold text-on-surface mb-2">Mức độ</h3>
              <div className="flex flex-col gap-1">
                {levels.map(level => <label key={level.id} className="flex items-center gap-2 cursor-pointer group"><input type="radio" name="reading-level" checked={levelId === level.id} onChange={() => { setLevelId(level.id); setPage(1); }} className="border-border-subtle text-primary focus:ring-primary h-4 w-4" /><span className="text-[12px] text-on-surface-variant group-hover:text-on-surface">{level.name} ({level.code})</span></label>)}
                {levelId && <button type="button" onClick={() => { setLevelId(''); setPage(1); }} className="mt-2 text-left text-xs font-semibold text-primary hover:underline">Bỏ lọc mức độ</button>}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex w-full min-w-0 flex-col gap-6 md:col-span-9">
            {/* Active Filters & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-[12px] text-on-surface-variant">{total} bài đọc đã xuất bản</div>
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                <input 
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm bài đọc..." 
                  className="w-full pl-8 pr-2 py-2 bg-surface-white border border-border-subtle rounded text-[12px] focus:border-primary focus:ring-2 focus:ring-primary-light transition-all outline-none" 
                />
              </div>
            </div>

            {/* Reading Cards Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {!loading && !displayArticles.length && <div className="xl:col-span-2 w-full rounded-lg border border-border-subtle bg-surface-white p-8 text-center text-on-surface-variant">Không có bài đọc phù hợp. Nội dung chỉ xuất hiện khi có bài Technical Reading đã được xuất bản.</div>}
              {displayArticles.map((article: any) => (
                <article key={article.id} className={`bg-surface-white border border-border-subtle rounded-lg p-4 hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow duration-200 flex flex-col h-full relative overflow-hidden ${article.progress === 100 ? 'opacity-70' : ''}`}>
                  
                  {article.isNew && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-[12px] font-bold tracking-[0.05em] uppercase px-2 py-1 rounded-bl z-10 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> Mới
                    </div>
                  )}
                  {article.progress === 100 && (
                    <div className="absolute top-0 right-0 bg-surface-container-highest text-on-surface-variant text-[12px] font-bold tracking-[0.05em] uppercase px-2 py-1 rounded-bl z-10 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> Hoàn thành
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2 text-outline text-[12px] font-bold tracking-[0.05em] uppercase">
                    <span className="bg-surface-container-low px-2 py-1 rounded text-on-surface-variant">{article.category}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> {article.readTime}</span>
                    <span className={`flex items-center gap-1 ${article.level.includes('C1') ? 'text-error' : ''}`}><span className="material-symbols-outlined text-[16px]">trending_up</span> {article.level}</span>
                  </div>
                  
                  <h2 className="text-[20px] font-semibold text-on-surface mb-2 line-clamp-2">{article.title}</h2>
                  <p className="text-[12px] text-on-surface-variant mb-4 line-clamp-3 flex-grow">{article.summary}</p>
                  
                  {article.isAiAssisted ? (
                    <div className="bg-ai-accent border border-[#7C3AED] rounded p-2 mb-4">
                      <div className="flex items-center gap-1 mb-1 text-secondary text-[14px] font-semibold">
                        <span className="material-symbols-outlined text-[16px]">psychology</span> Khái niệm trọng tâm
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {article.aiConcepts?.map((c: string) => (
                          <span key={c} className="text-[11px] bg-surface-white border border-secondary-fixed text-secondary px-2 py-0.5 rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface-container-lowest border border-border-subtle rounded p-2 mb-4">
                      <div className="flex items-center gap-1 mb-1 text-on-surface-variant text-[14px] font-semibold">
                        <span className="material-symbols-outlined text-[16px]">library_books</span> Key Terms
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {article.keyTerms?.map((c: string) => (
                          <span key={c} className="text-[11px] bg-surface-container-low text-on-surface-variant px-2 py-0.5 rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-subtle">
                    {article.progress === 0 && article.termCount ? (
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-surface-container-high border border-surface-white flex items-center justify-center text-[10px] text-on-surface-variant font-bold">+{article.termCount}</div>
                        <span className="ml-1 pl-1 text-[11px] text-on-surface-variant">thuật ngữ kỹ thuật</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-on-surface-variant w-1/2">
                        <div className="w-full bg-surface-variant rounded-full h-1.5 w-16 overflow-hidden">
                          <div className={`h-1.5 rounded-full ${article.progress === 100 ? 'bg-tertiary' : 'bg-primary'}`} style={{ width: `${article.progress}%` }}></div>
                        </div>
                        <span>{article.progress}%</span>
                      </div>
                    )}
                    
                    {article.progress === 0 ? (
                      <Link href={`/learn/lessons/${article.id}`} className="bg-primary hover:bg-primary-fixed-variant text-white text-[14px] font-semibold px-4 py-2 rounded transition-colors">Bắt đầu đọc</Link>
                    ) : article.progress === 100 ? (
                      <Link href={`/learn/lessons/${article.id}`} className="border border-border-subtle hover:bg-surface-container-low text-on-surface text-[14px] font-semibold px-4 py-2 rounded transition-colors">Đọc lại</Link>
                    ) : (
                      <Link href={`/learn/lessons/${article.id}`} className="border border-border-subtle hover:border-primary hover:text-primary text-on-surface text-[14px] font-semibold px-4 py-2 rounded transition-colors">Tiếp tục đọc</Link>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && <div className="flex justify-center items-center gap-2 mt-6">
              <button type="button" onClick={() => setPage(value => Math.max(1, value - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded border border-border-subtle text-outline hover:text-primary hover:border-primary transition-colors disabled:opacity-50">
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => <button type="button" key={pageNumber} onClick={() => setPage(pageNumber)} className={`w-8 h-8 flex items-center justify-center rounded border text-[14px] font-semibold ${pageNumber === page ? 'border-primary bg-primary text-white' : 'border-border-subtle text-on-surface hover:border-primary hover:text-primary'}`}>{pageNumber}</button>)}
              <button type="button" onClick={() => setPage(value => Math.min(totalPages, value + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded border border-border-subtle text-outline hover:text-primary hover:border-primary transition-colors disabled:opacity-50">
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>}
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
