'use client';

import * as React from 'react';
import Link from 'next/link';
import { AppShell } from '@/shared/layout';

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const domainId = unwrappedParams.id || 'cloud-computing';

  const reportData = {
    title: domainId === 'cybersecurity' ? 'Cybersecurity & InfoSec' : 'Cloud Computing (AWS & Azure)',
    totalStudents: '4,520 học viên',
    completionRate: '78.4%',
    avgScore: '84.5%',
    certCompleted: '1,840 chứng chỉ',
    topics: [
      { name: 'AWS IAM & Security Policies', mastery: 92, color: 'bg-primary' },
      { name: 'Amazon S3 & EBS Storage', mastery: 90, color: 'bg-green-600' },
      { name: 'EC2 Compute & Auto Scaling Groups', mastery: 85, color: 'bg-secondary' },
      { name: 'VPC & Hybrid Cloud Networking', mastery: 74, color: 'bg-amber-500' },
      { name: 'AWS Cost Explorer & Pricing Calculator', mastery: 68, color: 'bg-red-500' }
    ],
    topStudents: [
      { name: 'Nguyễn Văn An', email: 'an.nguyen@example.com', score: '98%', lessons: 45 },
      { name: 'Phạm Minh Đức', email: 'duc.pham@example.com', score: '95%', lessons: 42 },
      { name: 'Lê Hoàng Phúc', email: 'phuc.le@example.com', score: '92%', lessons: 40 }
    ]
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex justify-between items-center">
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Link href="/reports" className="hover:text-primary transition-colors">
              Báo cáo
            </Link>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-primary font-semibold">{reportData.title}</span>
          </nav>

          <button
            onClick={() => alert('Xuất báo cáo PDF')}
            className="px-3.5 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            <span>Xuất PDF</span>
          </button>
        </div>

        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">
            Báo cáo chi tiết: {reportData.title}
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Phân tích năng lực chuyên sâu, độ thông thạo thuật ngữ và điểm thi thử của học viên trong lĩnh vực.
          </p>
        </div>

        {/* 4 Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Học viên theo học</span>
            <div className="text-2xl font-extrabold text-on-surface">{reportData.totalStudents}</div>
            <span className="text-[10px] text-primary font-semibold">38% toàn hệ thống</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Tỷ lệ hoàn thành</span>
            <div className="text-2xl font-extrabold text-green-600">{reportData.completionRate}</div>
            <span className="text-[10px] text-outline">Bám sát lộ trình</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Điểm thi thử TB</span>
            <div className="text-2xl font-extrabold text-primary">{reportData.avgScore}</div>
            <span className="text-[10px] text-green-600 font-semibold">+3.5% so với tháng trước</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <span className="text-[11px] font-medium text-on-surface-variant block mb-1">Chứng chỉ đã đạt</span>
            <div className="text-2xl font-extrabold text-amber-600">{reportData.certCompleted}</div>
            <span className="text-[10px] text-outline">AWS SAA & CCP</span>
          </div>
        </div>

        {/* 2-Column Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Topic Mastery Breakdown (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-on-surface">Độ thành thạo theo từng chủ đề</h3>
            <div className="space-y-4">
              {reportData.topics.map((topic) => (
                <div key={topic.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-on-surface">{topic.name}</span>
                    <span className="font-bold text-on-surface">{topic.mastery}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                    <div className={`h-full rounded-full ${topic.color}`} style={{ width: `${topic.mastery}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Students (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-on-surface">Học viên tiêu biểu</h3>
            <div className="divide-y divide-outline-variant/20">
              {reportData.topStudents.map((st, i) => (
                <div key={st.email} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface m-0">{st.name}</p>
                      <span className="text-[10px] text-outline">{st.lessons} bài học</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-green-600 block">{st.score}</span>
                    <span className="text-[10px] text-outline">Điểm TB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
