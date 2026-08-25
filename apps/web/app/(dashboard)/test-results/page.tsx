'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/shared/layout';

interface TestResultRow {
  id: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string;
  testTitle: string;
  domain: string;
  score: number;
  maxScore: number;
  percentage: number;
  durationMinutes: number;
  submittedAt: string;
  status: 'Passed' | 'Failed';
}

const mockResults: TestResultRow[] = [
  {
    id: 'res-1',
    studentName: 'Nguyễn Văn An',
    studentEmail: 'an.nguyen@example.com',
    studentAvatar: 'A',
    testTitle: 'AWS Certified Solutions Architect Associate Mock #1',
    domain: 'Cloud Computing',
    score: 58,
    maxScore: 65,
    percentage: 89,
    durationMinutes: 68,
    submittedAt: '10 phút trước',
    status: 'Passed'
  },
  {
    id: 'res-2',
    studentName: 'Trần Thị Mai',
    studentEmail: 'mai.tran@example.com',
    studentAvatar: 'M',
    testTitle: 'CompTIA Security+ Comprehensive Quiz',
    domain: 'Cybersecurity',
    score: 34,
    maxScore: 50,
    percentage: 68,
    durationMinutes: 45,
    submittedAt: '35 phút trước',
    status: 'Failed'
  },
  {
    id: 'res-3',
    studentName: 'Lê Hoàng Phúc',
    studentEmail: 'phuc.le@example.com',
    studentAvatar: 'P',
    testTitle: 'REST API & Microservices Assessment',
    domain: 'Software Engineering',
    score: 28,
    maxScore: 30,
    percentage: 93,
    durationMinutes: 22,
    submittedAt: '2 giờ trước',
    status: 'Passed'
  },
  {
    id: 'res-4',
    studentName: 'Phạm Minh Đức',
    studentEmail: 'duc.pham@example.com',
    studentAvatar: 'D',
    testTitle: 'Google Professional Data Engineer Mock #2',
    domain: 'Data Engineering',
    score: 46,
    maxScore: 50,
    percentage: 92,
    durationMinutes: 55,
    submittedAt: '4 giờ trước',
    status: 'Passed'
  }
];

export default function TestResultsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = mockResults.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.testTitle.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Kết quả kiểm tra & Bảng điểm</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Theo dõi và quản lý lịch sử nộp bài thi của học viên toàn hệ thống.
            </p>
          </div>
          <button
            onClick={() => alert('Xuất báo cáo điểm thi Excel')}
            className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Xuất báo cáo điểm</span>
          </button>
        </div>

        {/* 4 Overview Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Tổng lượt bài đã nộp</span>
            <div className="text-2xl font-extrabold text-on-surface">28,910</div>
            <span className="text-[10px] text-green-600 font-semibold">+1,240 tuần này</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Điểm trung bình</span>
            <div className="text-2xl font-extrabold text-primary">76.4%</div>
            <span className="text-[10px] text-outline">Trên thang điểm 100</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Tỷ lệ đạt chuẩn</span>
            <div className="text-2xl font-extrabold text-green-600">79.2%</div>
            <span className="text-[10px] text-outline">Đạt yêu cầu chứng chỉ</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Cần ôn tập bổ trợ</span>
            <div className="text-2xl font-extrabold text-amber-600">20.8%</div>
            <span className="text-[10px] text-outline">Dưới điểm chuẩn</span>
          </div>
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
              placeholder="Tìm theo tên học viên, tên bài kiểm tra..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright focus:border-primary outline-none text-xs text-on-surface"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface font-medium outline-none focus:border-primary"
          >
            <option value="">Tất cả kết quả</option>
            <option value="Passed">Đạt (Passed)</option>
            <option value="Failed">Chưa đạt (Failed)</option>
          </select>
        </div>

        {/* Results Table */}
        <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase">
                  <th className="py-3.5 px-6">Học viên</th>
                  <th className="py-3.5 px-4">Bài thi & Chuyên ngành</th>
                  <th className="py-3.5 px-4">Điểm số</th>
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {r.studentAvatar}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface m-0">{r.studentName}</p>
                          <span className="text-[10px] text-on-surface-variant">{r.studentEmail}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <p className="font-semibold text-on-surface m-0 line-clamp-1">{r.testTitle}</p>
                      <span className="text-[10px] text-outline">{r.domain}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-extrabold text-on-surface block text-sm">
                        {r.score}/{r.maxScore} ({r.percentage}%)
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-on-surface block font-medium">{r.submittedAt}</span>
                      <span className="text-[10px] text-outline">Làm trong {r.durationMinutes}p</span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          r.status === 'Passed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status === 'Passed' ? 'Đạt' : 'Cần ôn lại'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => alert(`Xem chi tiết bài làm của ${r.studentName}`)}
                        className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors"
                      >
                        Xem bài làm
                      </button>
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
