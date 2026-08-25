'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/shared/layout';

export default function ReportsDashboardPage() {
  const [timeRange, setTimeRange] = useState('Tháng này');
  const [selectedDomain, setSelectedDomain] = useState('Tất cả lĩnh vực');

  const domainReports = [
    {
      id: 'cloud-computing',
      title: 'Cloud Computing (AWS & Azure)',
      students: 4520,
      share: '38%',
      avgScore: 84.5,
      passRate: '82.0%',
      icon: 'cloud',
      tone: 'text-primary'
    },
    {
      id: 'cybersecurity',
      title: 'Cybersecurity & Information Security',
      students: 3100,
      share: '26%',
      avgScore: 72.8,
      passRate: '71.5%',
      icon: 'security',
      tone: 'text-red-600'
    },
    {
      id: 'devops',
      title: 'DevOps, CI/CD & Kubernetes',
      students: 2150,
      share: '18%',
      avgScore: 88.0,
      passRate: '86.4%',
      icon: 'all_inclusive',
      tone: 'text-indigo-600'
    },
    {
      id: 'data-engineering',
      title: 'Data Engineering & Analytics',
      students: 1430,
      share: '12%',
      avgScore: 79.2,
      passRate: '76.0%',
      icon: 'database',
      tone: 'text-purple-600'
    },
    {
      id: 'software-engineering',
      title: 'Software Architecture & APIs',
      students: 720,
      share: '6%',
      avgScore: 81.0,
      passRate: '80.2%',
      icon: 'code',
      tone: 'text-cyan-600'
    }
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Báo cáo & Thống kê Quản trị</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Phân tích hiệu suất học tập, mức độ quan tâm chuyên ngành và tỷ lệ đỗ chứng chỉ toàn hệ thống.
            </p>
          </div>

          <div className="flex items-center gap-2 p-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-on-surface outline-none cursor-pointer py-1 px-2"
            >
              <option>Tháng này</option>
              <option>Tháng trước</option>
              <option>Năm nay</option>
            </select>
            <div className="w-px h-4 bg-outline-variant/40" />
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-transparent text-xs font-semibold text-on-surface outline-none cursor-pointer py-1 px-2"
            >
              <option>Tất cả lĩnh vực</option>
              <option>Cloud Computing</option>
              <option>Cybersecurity</option>
              <option>DevOps</option>
              <option>Data Engineering</option>
            </select>
          </div>
        </div>

        {/* 4 Overview Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Tổng người học tích cực</span>
            <div className="text-2xl font-extrabold text-on-surface">12,485</div>
            <span className="text-[10px] text-green-600 font-semibold">+8.2% tăng trưởng</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Điểm TB toàn hệ thống</span>
            <div className="text-2xl font-extrabold text-primary">76.4%</div>
            <span className="text-[10px] text-green-600 font-semibold">+2.1 pts so với quý trước</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Đạt chứng chỉ mô phỏng</span>
            <div className="text-2xl font-extrabold text-green-600">3,420</div>
            <span className="text-[10px] text-outline">Học viên sẵn sàng thi thật</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Tổng giờ học tích lũy</span>
            <div className="text-2xl font-extrabold text-amber-600">42,850h</div>
            <span className="text-[10px] text-outline">Trên 432 bài học</span>
          </div>
        </div>

        {/* Domain Analytics Cards */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Phân tích người học theo chuyên ngành IT</h3>
              <p className="text-xs text-on-surface-variant">Thống kê số lượng, tỷ lệ quan tâm và hiệu quả bài thi</p>
            </div>
          </div>

          <div className="divide-y divide-outline-variant/20">
            {domainReports.map((d) => (
              <div
                key={d.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                    <span className={`material-symbols-outlined text-[22px] ${d.tone}`}>{d.icon}</span>
                  </div>
                  <div>
                    <Link
                      href={`/reports/${d.id}`}
                      className="font-bold text-on-surface hover:text-primary transition-colors text-sm block"
                    >
                      {d.title}
                    </Link>
                    <p className="text-xs text-on-surface-variant m-0">
                      {d.students.toLocaleString()} học viên (Chiếm {d.share} toàn hệ thống)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div>
                    <span className="text-outline block text-[11px]">Điểm trung bình</span>
                    <span className="font-extrabold text-on-surface">{d.avgScore}%</span>
                  </div>
                  <div>
                    <span className="text-outline block text-[11px]">Tỷ lệ đỗ thi thử</span>
                    <span className="font-extrabold text-green-600">{d.passRate}</span>
                  </div>
                  <Link
                    href={`/reports/${d.id}`}
                    className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    <span>Chi tiết</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
