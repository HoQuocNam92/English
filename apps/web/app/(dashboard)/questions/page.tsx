'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/shared/layout';

interface QuestionItem {
  id: string;
  code: string;
  prompt: string;
  type: 'Multiple Choice' | 'Scenario' | 'Reading Comprehension';
  domain: string;
  level: string;
  certTag: string;
  accuracyRate: string;
  status: 'Active' | 'Review';
}

const mockQuestions: QuestionItem[] = [
  {
    id: 'q-1',
    code: 'Q-AWS-0102',
    prompt: 'Which AWS service is primarily used to provide scalable, object-based storage accessible over HTTP/HTTPS?',
    type: 'Multiple Choice',
    domain: 'Cloud Computing',
    level: 'Beginner',
    certTag: 'AWS Cloud Practitioner',
    accuracyRate: '88%',
    status: 'Active'
  },
  {
    id: 'q-2',
    code: 'Q-SEC-0204',
    prompt: 'A company suffered a credential-stuffing attack. Which security mechanism best mitigates this risk by requiring a second factor?',
    type: 'Scenario',
    domain: 'Cybersecurity',
    level: 'Intermediate',
    certTag: 'CompTIA Security+',
    accuracyRate: '72%',
    status: 'Active'
  },
  {
    id: 'q-3',
    code: 'Q-DEV-0315',
    prompt: 'In Kubernetes, what is the role of an Ingress Controller compared to a standard NodePort Service?',
    type: 'Multiple Choice',
    domain: 'DevOps',
    level: 'Advanced',
    certTag: 'CKA Certified',
    accuracyRate: '61%',
    status: 'Active'
  },
  {
    id: 'q-4',
    code: 'Q-SWE-0402',
    prompt: 'Read the architectural diagram and API specification below. Why is idempotency critical when designing the payment webhook?',
    type: 'Reading Comprehension',
    domain: 'Software Engineering',
    level: 'Professional',
    certTag: 'System Design Pro',
    accuracyRate: '54%',
    status: 'Review'
  }
];

export default function QuestionBankPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const filtered = mockQuestions.filter((q) => {
    const matchesSearch = q.prompt.toLowerCase().includes(search.toLowerCase()) || q.code.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || q.type === typeFilter;
    const matchesDomain = !domainFilter || q.domain === domainFilter;
    const matchesLevel = !levelFilter || q.level === levelFilter;
    return matchesSearch && matchesType && matchesDomain && matchesLevel;
  });

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Ngân hàng câu hỏi (Question Bank)</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Kho câu hỏi trắc nghiệm, bài đọc hiểu và tình huống kỹ thuật chuyên ngành IT.
            </p>
          </div>
          <Link
            href="/questions/editor"
            className="px-4 py-2.5 bg-primary hover:bg-indigo-700 !text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] !text-white">add</span>
            <span className="!text-white">Tạo câu hỏi mới</span>
          </Link>
        </div>

        {/* 5-Column Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
          <div className="sm:col-span-2 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo nội dung câu hỏi, mã đề..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright focus:border-primary outline-none text-xs text-on-surface"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface font-medium outline-none focus:border-primary"
          >
            <option value="">Tất cả dạng câu hỏi</option>
            <option value="Multiple Choice">Multiple Choice</option>
            <option value="Scenario">Scenario-based</option>
            <option value="Reading Comprehension">Reading Comprehension</option>
          </select>

          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface font-medium outline-none focus:border-primary"
          >
            <option value="">Tất cả chuyên ngành</option>
            <option value="Cloud Computing">Cloud Computing</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="DevOps">DevOps</option>
            <option value="Software Engineering">Software Engineering</option>
          </select>
        </div>

        {/* Questions Table */}
        <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase">
                  <th className="py-3.5 px-6">Mã & Nội dung câu hỏi</th>
                  <th className="py-3.5 px-4">Loại & Chuyên ngành</th>
                  <th className="py-3.5 px-4">Chứng chỉ & Cấp độ</th>
                  <th className="py-3.5 px-4">Tỷ lệ đúng</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="py-4 px-6 max-w-md">
                      <span className="font-mono text-[11px] font-bold text-primary block mb-0.5">{q.code}</span>
                      <Link href="/questions/editor" className="font-semibold text-on-surface hover:text-primary transition-colors line-clamp-2">
                        {q.prompt}
                      </Link>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container text-on-surface mb-1">
                        {q.type}
                      </span>
                      <p className="m-0 text-[11px] text-on-surface-variant font-medium">{q.domain}</p>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-on-surface block text-[11px]">{q.certTag}</span>
                      <span className="text-[10px] text-outline">Level: {q.level}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-extrabold text-on-surface block">{q.accuracyRate}</span>
                      <span className="text-[10px] text-green-600">Độ chuẩn xác cao</span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href="/questions/editor"
                          className="p-1.5 rounded hover:bg-surface-container text-outline hover:text-primary transition-colors"
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
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
