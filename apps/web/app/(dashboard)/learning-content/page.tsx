'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/shared/layout';

interface ContentItem {
  id: string;
  title: string;
  domain: string;
  level: string;
  type: 'Vocabulary' | 'Technical Reading' | 'System Design' | 'Case Study' | 'API Docs';
  vocabCount: number;
  questionCount: number;
  status: 'Published' | 'Draft';
  lastUpdated: string;
}

const mockContentItems: ContentItem[] = [
  {
    id: 'lc-1',
    title: 'REST API Architecture & HTTP Status Codes',
    domain: 'Software Engineering',
    level: 'Intermediate',
    type: 'API Docs',
    vocabCount: 24,
    questionCount: 15,
    status: 'Published',
    lastUpdated: 'Hôm qua'
  },
  {
    id: 'lc-2',
    title: 'AWS Identity and Access Management (IAM) Policies',
    domain: 'Cloud Computing',
    level: 'Advanced',
    type: 'Technical Reading',
    vocabCount: 32,
    questionCount: 20,
    status: 'Published',
    lastUpdated: '2 ngày trước'
  },
  {
    id: 'lc-3',
    title: 'Kubernetes Pod Lifecycle & Container Orchestration',
    domain: 'DevOps',
    level: 'Advanced',
    type: 'System Design',
    vocabCount: 45,
    questionCount: 25,
    status: 'Published',
    lastUpdated: '18/08/2026'
  },
  {
    id: 'lc-4',
    title: 'Common Cybersecurity Attack Vectors (XSS, CSRF, SQLi)',
    domain: 'Cybersecurity',
    level: 'Beginner',
    type: 'Vocabulary',
    vocabCount: 18,
    questionCount: 10,
    status: 'Published',
    lastUpdated: '15/08/2026'
  },
  {
    id: 'lc-5',
    title: 'Microservices Communication: Synchronous vs Asynchronous',
    domain: 'Software Engineering',
    level: 'Professional',
    type: 'Case Study',
    vocabCount: 28,
    questionCount: 18,
    status: 'Draft',
    lastUpdated: '12/08/2026'
  }
];

export default function LearningContentPage() {
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredItems = mockContentItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = !domainFilter || item.domain === domainFilter;
    const matchesLevel = !levelFilter || item.level === levelFilter;
    const matchesType = !typeFilter || item.type === typeFilter;
    return matchesSearch && matchesDomain && matchesLevel && matchesType;
  });

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Nội dung học tập</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Quản lý và tổ chức kho bài học, từ vựng kỹ thuật và tài liệu theo chuyên ngành IT.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/lessons/editor"
              className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Thêm nội dung mới</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm bài học, chủ đề..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xs text-on-surface transition-all placeholder:text-outline"
            />
          </div>

          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface font-medium outline-none focus:border-primary"
          >
            <option value="">Tất cả Lĩnh vực</option>
            <option value="Cloud Computing">Cloud Computing</option>
            <option value="DevOps">DevOps</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Software Engineering">Software Engineering</option>
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface font-medium outline-none focus:border-primary"
          >
            <option value="">Tất cả Cấp độ</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Professional">Professional</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface font-medium outline-none focus:border-primary"
          >
            <option value="">Loại nội dung</option>
            <option value="Vocabulary">Vocabulary</option>
            <option value="Technical Reading">Technical Reading</option>
            <option value="System Design">System Design</option>
            <option value="Case Study">Case Study</option>
            <option value="API Docs">API Docs</option>
          </select>

          {(search || domainFilter || levelFilter || typeFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setDomainFilter('');
                setLevelFilter('');
                setTypeFilter('');
              }}
              className="p-2 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
              title="Đặt lại bộ lọc"
            >
              <span className="material-symbols-outlined text-[20px]">filter_alt_off</span>
            </button>
          )}
        </div>

        {/* Content Table */}
        <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3.5 px-6">Tiêu đề bài học / Tài liệu</th>
                  <th className="py-3.5 px-4">Lĩnh vực</th>
                  <th className="py-3.5 px-4">Cấp độ & Thể loại</th>
                  <th className="py-3.5 px-4">Dữ liệu</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-xs">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm shrink-0">
                          <span className="material-symbols-outlined text-[18px]">
                            {item.type === 'Vocabulary'
                              ? 'spellcheck'
                              : item.type === 'API Docs'
                              ? 'code'
                              : item.type === 'System Design'
                              ? 'architecture'
                              : 'article'}
                          </span>
                        </div>
                        <div>
                          <Link href="/lessons/editor" className="font-bold text-on-surface hover:text-primary transition-colors block">
                            {item.title}
                          </Link>
                          <span className="text-[10px] text-outline">Cập nhật: {item.lastUpdated}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-semibold text-on-surface">{item.domain}</span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary w-max">
                          {item.level}
                        </span>
                        <span className="text-[11px] text-on-surface-variant">{item.type}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-on-surface-variant text-[11px] space-y-0.5">
                        <p className="m-0">📖 {item.vocabCount} thuật ngữ</p>
                        <p className="m-0">❓ {item.questionCount} câu hỏi</p>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.status === 'Published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status === 'Published' ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href="/lessons/editor"
                          className="p-1.5 rounded hover:bg-surface-container text-outline hover:text-primary transition-colors"
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <button
                          onClick={() => alert(`Xem trước ${item.title}`)}
                          className="p-1.5 rounded hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
                          title="Xem trước"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
