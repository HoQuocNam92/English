'use client';

import { AppShell } from '@/shared/layout';
import Link from 'next/link';

export default function StudentProgressDashboardPage() {
  const domainProgress = [
    { name: 'Cloud Computing (AWS/GCP)', percent: 84, color: 'bg-primary' },
    { name: 'DevOps & CI/CD Pipelines', percent: 68, color: 'bg-secondary' },
    { name: 'Cybersecurity Terminology', percent: 52, color: 'bg-tertiary-container' },
    { name: 'REST APIs & Web Architecture', percent: 92, color: 'bg-ai-accent' },
    { name: 'Data Engineering & BigQuery', percent: 45, color: 'bg-primary-container' }
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Theo dõi tiến độ người học</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Phân tích chi tiết hiệu quả học tập, độ thành thạo thuật ngữ và lộ trình chứng chỉ.
            </p>
          </div>
          <Link
            href="/reports"
            className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-outline-variant/60"
          >
            <span className="material-symbols-outlined text-[18px]">insights</span>
            <span>Báo cáo tổng hợp</span>
          </Link>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-on-surface-variant">Tiến độ trung bình</span>
              <span className="material-symbols-outlined text-primary text-[22px]">trending_up</span>
            </div>
            <div className="text-2xl font-extrabold text-on-surface">72%</div>
            <div className="mt-3 w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '72%' }} />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-on-surface-variant">Bài học hoàn thành</span>
              <span className="material-symbols-outlined text-secondary text-[22px]">menu_book</span>
            </div>
            <div className="text-2xl font-extrabold text-on-surface">
              45 <span className="text-xs text-outline font-normal">/ 60 bài</span>
            </div>
            <div className="mt-3 w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: '75%' }} />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-on-surface-variant">Bài kiểm tra đã làm</span>
              <span className="material-symbols-outlined text-tertiary text-[22px]">quiz</span>
            </div>
            <div className="text-2xl font-extrabold text-on-surface">12 bài</div>
            <p className="text-[11px] text-green-600 font-semibold mt-2 m-0">+3 bài hoàn thành tuần này</p>
          </div>

          <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-on-surface-variant">Điểm trung bình</span>
              <span className="material-symbols-outlined text-amber-500 text-[22px]">star</span>
            </div>
            <div className="text-2xl font-extrabold text-on-surface">
              8.4 <span className="text-xs text-outline font-normal">/ 10</span>
            </div>
            <p className="text-[11px] text-green-600 font-semibold mt-2 m-0">Top 15% học viên xuất sắc</p>
          </div>
        </div>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Domain Breakdown (6 cols) */}
          <div className="lg:col-span-6 p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-on-surface">Tiến độ theo chuyên ngành IT</h3>
              <span className="text-xs text-outline">Độ hoàn thành</span>
            </div>
            <div className="space-y-4">
              {domainProgress.map((d) => (
                <div key={d.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-on-surface">{d.name}</span>
                    <span className="font-bold text-on-surface">{d.percent}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden">
                    <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certificate Pathway (6 cols) */}
          <div className="lg:col-span-6 p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-on-surface">Lộ trình chứng chỉ mục tiêu</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                AWS Cloud Practitioner
              </span>
            </div>

            <div className="p-4 rounded-lg bg-surface-container-low space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-on-surface">Tiến độ hoàn thành lộ trình: 80%</span>
                <span className="text-primary font-semibold">4/5 chặng</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '80%' }} />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3 p-2.5 rounded bg-surface-bright border border-outline-variant/30">
                <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
                <span className="flex-1 font-medium text-on-surface">Chặng 1: Cloud Concepts & Terminology</span>
                <span className="text-green-600 font-bold">100%</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded bg-surface-bright border border-outline-variant/30">
                <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
                <span className="flex-1 font-medium text-on-surface">Chặng 2: Security & IAM Policies</span>
                <span className="text-green-600 font-bold">100%</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded bg-surface-bright border border-outline-variant/30">
                <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
                <span className="flex-1 font-medium text-on-surface">Chặng 3: AWS Core Services (EC2, S3, RDS)</span>
                <span className="text-green-600 font-bold">100%</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded bg-surface-bright border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-[18px]">pending</span>
                <span className="flex-1 font-medium text-on-surface">Chặng 4: Billing & Support Plans</span>
                <span className="text-primary font-bold">60%</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded bg-surface-container-low text-outline">
                <span className="material-symbols-outlined text-[18px]">radio_button_unchecked</span>
                <span className="flex-1">Chặng 5: 3 Đề thi thử tổng hợp (Mock Exams)</span>
                <span>0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
