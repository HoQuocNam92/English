'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/shared/layout';

interface TestItem {
  id: string;
  title: string;
  certTag: string;
  domain: string;
  questionCount: number;
  durationMinutes: number;
  attemptsCount: number;
  passRate: string;
  status: 'Active' | 'Draft' | 'Archived';
}

const mockTests: TestItem[] = [
  {
    id: 't-1',
    title: 'AWS Certified Solutions Architect Associate (SAA-C03) Mock #1',
    certTag: 'AWS SAA',
    domain: 'Cloud Computing',
    questionCount: 65,
    durationMinutes: 90,
    attemptsCount: 2450,
    passRate: '78.5%',
    status: 'Active'
  },
  {
    id: 't-2',
    title: 'CompTIA Security+ (SY0-701) Comprehensive Quiz',
    certTag: 'CompTIA Sec+',
    domain: 'Cybersecurity',
    questionCount: 50,
    durationMinutes: 60,
    attemptsCount: 1820,
    passRate: '71.2%',
    status: 'Active'
  },
  {
    id: 't-3',
    title: 'REST API & Microservices Terminology Assessment',
    certTag: 'General SE',
    domain: 'Software Engineering',
    questionCount: 30,
    durationMinutes: 40,
    attemptsCount: 3100,
    passRate: '86.0%',
    status: 'Active'
  },
  {
    id: 't-4',
    title: 'Google Professional Data Engineer Practice Exam #2',
    certTag: 'Google PDE',
    domain: 'Data Engineering',
    questionCount: 50,
    durationMinutes: 75,
    attemptsCount: 940,
    passRate: '64.8%',
    status: 'Draft'
  }
];

export default function TestManagementPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Draft'>('All');

  const filtered = mockTests.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(search.toLowerCase()) || test.certTag.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'All' || test.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Quản lý bài kiểm tra & Đề thi</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Tạo mới, tổ chức ngân hàng đề thi đánh giá năng lực tiếng Anh và ôn luyện chứng chỉ CNTT.
            </p>
          </div>
          <Link
            href="/tests/builder"
            className="px-4 py-2.5 bg-primary hover:bg-indigo-700 !text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] !text-white">add</span>
            <span className="!text-white">Tạo bài thi mới</span>
          </Link>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Tổng số đề thi</span>
            <div className="text-2xl font-extrabold text-on-surface">128</div>
            <span className="text-[10px] text-primary font-semibold">12 bộ đề chứng chỉ</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Đang mở thi</span>
            <div className="text-2xl font-extrabold text-green-600">114</div>
            <span className="text-[10px] text-outline">Sẵn sàng làm bài</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Lượt đã hoàn thành</span>
            <div className="text-2xl font-extrabold text-on-surface">28,910</div>
            <span className="text-[10px] text-green-600 font-semibold">+840 tuần này</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Điểm TB toàn hệ thống</span>
            <div className="text-2xl font-extrabold text-on-surface">76.4%</div>
            <span className="text-[10px] text-primary font-semibold">Tỷ lệ đỗ 79.2%</span>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-2">
            {(['All', 'Active', 'Draft'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === tab ? 'bg-primary !text-white' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {tab === 'All' ? 'Tất cả' : tab === 'Active' ? 'Đang mở' : 'Bản nháp'}
              </button>
            ))}
          </div>

          <div className="relative w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm đề thi..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-outline-variant/60 bg-surface-bright focus:border-primary text-xs text-on-surface outline-none"
            />
          </div>
        </div>

        {/* Tests Table */}
        <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase">
                  <th className="py-3.5 px-6">Tên đề thi / Bài kiểm tra</th>
                  <th className="py-3.5 px-4">Chuyên ngành</th>
                  <th className="py-3.5 px-4">Quy mô đề</th>
                  <th className="py-3.5 px-4">Lượt làm & Tỷ lệ đạt</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filtered.map((test) => (
                  <tr key={test.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="py-4 px-6 max-w-md">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold shrink-0">
                          <span className="material-symbols-outlined text-[18px]">quiz</span>
                        </div>
                        <div>
                          <span className="font-bold text-on-surface block">{test.title}</span>
                          <span className="text-[10px] text-primary font-semibold">{test.certTag}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-on-surface">{test.domain}</td>

                    <td className="py-4 px-4">
                      <p className="m-0 font-bold text-on-surface">{test.questionCount} câu hỏi</p>
                      <span className="text-[10px] text-outline">⏱ {test.durationMinutes} phút</span>
                    </td>

                    <td className="py-4 px-4">
                      <p className="m-0 font-bold text-on-surface">{test.attemptsCount.toLocaleString()} lượt</p>
                      <span className="text-[10px] text-green-600 font-semibold">Tỷ lệ đạt: {test.passRate}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          test.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {test.status === 'Active' ? 'Đang mở' : 'Bản nháp'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href="/tests/builder"
                          className="p-1.5 rounded hover:bg-surface-container text-outline hover:text-primary transition-colors"
                          title="Chỉnh sửa đề"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <Link
                          href="/test-results"
                          className="p-1.5 rounded hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
                          title="Xem kết quả học viên"
                        >
                          <span className="material-symbols-outlined text-[18px]">assessment</span>
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
