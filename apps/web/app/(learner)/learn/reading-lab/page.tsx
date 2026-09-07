'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';

export default function ReadingLabPage() {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [articlesRes, categoriesRes] = await Promise.all<any>([
          apiClient.get('/reading-lab/articles').catch(() => ({ data: [] })),
          apiClient.get('/reading-lab/categories').catch(() => ({ data: [] }))
        ]);
        
        setArticles(articlesRes?.data || articlesRes || []);
        setCategories(categoriesRes?.data || categoriesRes || []);
      } catch (err) {
        // use fallback data matching design
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Mock data for UI since API might not exist yet
  const displayArticles = articles.length > 0 ? articles : [
    {
      id: '1',
      title: 'Understanding Kubernetes Architecture for Scalable Microservices',
      summary: 'A deep dive into the core components of Kubernetes, including control plane nodes, worker nodes, pods, and how they interact to provide orchestration for containerized applications.',
      isNew: true,
      category: 'Cloud',
      readTime: '12 min read',
      level: 'B2 Intermediate',
      isAiAssisted: true,
      aiConcepts: ['Orchestration', 'Control Plane', 'Pods'],
      termCount: 12,
      progress: 0
    },
    {
      id: '2',
      title: 'Serverless Computing: Pros, Cons, and Use Cases',
      summary: 'Evaluate when to use serverless architectures like AWS Lambda versus traditional container-based deployments, focusing on cost, cold starts, and vendor lock-in.',
      isNew: false,
      category: 'Cloud',
      readTime: '8 min read',
      level: 'B2 Intermediate',
      isAiAssisted: false,
      keyTerms: ['Cold Start', 'Vendor Lock-in', 'Stateless'],
      progress: 30
    },
    {
      id: '3',
      title: 'Implementing Zero Trust Architecture in Multi-Cloud Environments',
      summary: 'A comprehensive guide to applying zero trust security principles across heterogeneous cloud platforms, focusing on identity management and micro-segmentation.',
      isNew: false,
      category: 'Cloud',
      readTime: '15 min read',
      level: 'C1 Advanced',
      isAiAssisted: true,
      aiConcepts: ['Micro-segmentation', 'Identity Access Management', 'RBAC'],
      termCount: 18,
      progress: 0
    },
    {
      id: '4',
      title: 'Introduction to IaaS, PaaS, and SaaS',
      summary: 'A fundamental overview of the three main cloud computing service models, providing clear definitions and everyday examples to distinguish between them.',
      isNew: false,
      category: 'Cloud',
      readTime: '5 min read',
      level: 'B1 Beginner',
      isAiAssisted: false,
      keyTerms: ['Infrastructure', 'Platform', 'Software as a Service'],
      progress: 100
    }
  ];

  return (
    <LearnerShell>
      <div className="flex flex-col max-w-[1280px] mx-auto pb-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-[24px] md:text-[30px] font-bold text-on-surface mb-2 tracking-tight">Thư viện đọc hiểu CNTT</h1>
          <p className="text-[14px] text-on-surface-variant max-w-2xl">
            Nâng cao kỹ năng đọc hiểu tài liệu chuyên ngành với các bài báo, whitepaper và tài liệu kỹ thuật được tuyển chọn. AI hỗ trợ phân tích từ vựng và khái niệm khó.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar / Categories */}
          <aside className="md:col-span-3">
            <div className="bg-surface-white border border-border-subtle rounded-lg p-6 hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow duration-200 sticky top-24">
              <h3 className="text-[20px] font-semibold text-on-surface mb-4">Danh mục</h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <button className="w-full text-left px-4 py-2 rounded bg-primary-light text-primary text-[14px] font-semibold flex items-center justify-between group transition-colors">
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[20px]">cloud</span> Cloud Computing</span>
                    <span className="bg-surface-white text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">12</span>
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2 rounded hover:bg-surface-container-low text-on-surface-variant text-[14px] flex items-center justify-between group transition-colors">
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[20px]">security</span> Cybersecurity</span>
                    <span className="bg-surface-container-high text-on-surface-variant group-hover:bg-surface-white px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors">8</span>
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2 rounded hover:bg-surface-container-low text-on-surface-variant text-[14px] flex items-center justify-between group transition-colors">
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[20px]">data_object</span> Software Eng.</span>
                    <span className="bg-surface-container-high text-on-surface-variant group-hover:bg-surface-white px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors">15</span>
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2 rounded hover:bg-surface-container-low text-on-surface-variant text-[14px] flex items-center justify-between group transition-colors">
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[20px]">smart_toy</span> AI & Machine Learning</span>
                    <span className="bg-surface-container-high text-on-surface-variant group-hover:bg-surface-white px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors">24</span>
                  </button>
                </li>
              </ul>
              
              <hr className="border-t border-border-subtle my-4" />
              
              <h3 className="text-[14px] font-semibold text-on-surface mb-2">Mức độ</h3>
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="rounded border-border-subtle text-primary focus:ring-primary focus:ring-offset-0 h-4 w-4" />
                  <span className="text-[12px] text-on-surface-variant group-hover:text-on-surface">Beginner (B1)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="rounded border-border-subtle text-primary focus:ring-primary focus:ring-offset-0 h-4 w-4" />
                  <span className="text-[12px] text-on-surface-variant group-hover:text-on-surface">Intermediate (B2)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="rounded border-border-subtle text-primary focus:ring-primary focus:ring-offset-0 h-4 w-4" />
                  <span className="text-[12px] text-on-surface-variant group-hover:text-on-surface">Advanced (C1+)</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="md:col-span-9 flex flex-col gap-6">
            {/* Active Filters & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12px] text-on-surface-variant">Đang xem:</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface-white border border-border-subtle rounded-full text-[12px] font-bold tracking-[0.05em] uppercase text-on-surface">
                  Cloud Computing
                  <button className="text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined text-[14px]">close</span></button>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface-white border border-border-subtle rounded-full text-[12px] font-bold tracking-[0.05em] uppercase text-on-surface">
                  Intermediate (B2)
                  <button className="text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined text-[14px]">close</span></button>
                </span>
              </div>
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
                        <span className="material-symbols-outlined text-[16px]">psychology</span> AI Key Concepts
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
                      <button className="bg-primary hover:bg-primary-fixed-variant text-white text-[14px] font-semibold px-4 py-2 rounded transition-colors">Bắt đầu đọc</button>
                    ) : article.progress === 100 ? (
                      <button className="border border-border-subtle hover:bg-surface-container-low text-on-surface text-[14px] font-semibold px-4 py-2 rounded transition-colors">Đọc lại</button>
                    ) : (
                      <button className="border border-border-subtle hover:border-primary hover:text-primary text-on-surface text-[14px] font-semibold px-4 py-2 rounded transition-colors">Tiếp tục đọc</button>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-6">
              <button disabled className="w-8 h-8 flex items-center justify-center rounded border border-border-subtle text-outline hover:text-primary hover:border-primary transition-colors disabled:opacity-50">
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white text-[14px] font-semibold">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-border-subtle text-on-surface hover:text-primary hover:border-primary transition-colors text-[14px] font-semibold">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-border-subtle text-on-surface hover:text-primary hover:border-primary transition-colors text-[14px] font-semibold">3</button>
              <span className="text-outline">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-border-subtle text-outline hover:text-primary hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
