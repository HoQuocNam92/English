'use client';

import { LearnerShell } from '@/shared/layout';

export default function LearnerPersonalProgressPage() {
  const domainSkills = [
    { name: 'Cloud Computing (AWS & Azure)', percent: 84, color: 'bg-primary' },
    { name: 'REST APIs & Web Architecture', percent: 92, color: 'bg-green-600' },
    { name: 'DevOps, CI/CD & Kubernetes', percent: 68, color: 'bg-indigo-600' },
    { name: 'Cybersecurity & InfoSec', percent: 52, color: 'bg-purple-600' },
    { name: 'Data Engineering & BigQuery', percent: 45, color: 'bg-amber-500' }
  ];

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Báo cáo Năng lực & Tiến độ Cá nhân</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Theo dõi sự tiến bộ, tỷ lệ ghi nhớ thuật ngữ và mức độ sẵn sàng thi chứng chỉ quốc tế.
          </p>
        </div>

        {/* Certificate Readiness Hero Card */}
        <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  CLF-C02
                </span>
                <span className="text-xs font-semibold text-primary">AWS Certified Cloud Practitioner</span>
              </div>
              <h3 className="text-xl font-extrabold text-on-surface">Độ sẵn sàng thi chứng chỉ: 80%</h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
              Đạt chuẩn tự tin thi thật
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: '80%' }} />
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            💡 Điểm trung bình qua 6 đề thi thử của bạn là <strong>82.4%</strong> (vượt xa chuẩn đỗ 70% của AWS).
            Bạn đã hoàn thành 4/5 chặng giáo trình trọng tâm.
          </p>
        </div>

        {/* 2-Column Skills & Pathways */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Domain Skills (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-on-surface">Độ thành thạo theo chuyên ngành</h3>
            <div className="space-y-4">
              {domainSkills.map((s) => (
                <div key={s.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-on-surface">{s.name}</span>
                    <span className="font-extrabold text-on-surface">{s.percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pathway Milestones (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-on-surface">Các chặng trong lộ trình</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-bright border border-outline-variant/30">
                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                <span className="flex-1 font-semibold text-on-surface">Chặng 1: Cloud Concepts & Global Infra</span>
                <span className="font-bold text-green-600">100%</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-bright border border-outline-variant/30">
                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                <span className="flex-1 font-semibold text-on-surface">Chặng 2: Security & IAM Permissions</span>
                <span className="font-bold text-green-600">100%</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-bright border border-outline-variant/30">
                <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                <span className="flex-1 font-semibold text-on-surface">Chặng 3: Compute, S3 & Networking</span>
                <span className="font-bold text-green-600">100%</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-bright border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-[20px]">pending</span>
                <span className="flex-1 font-semibold text-on-surface">Chặng 4: Billing & Support Plans</span>
                <span className="font-bold text-primary">60%</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low text-outline">
                <span className="material-symbols-outlined text-[20px]">radio_button_unchecked</span>
                <span className="flex-1">Chặng 5: 3 Đề thi tổng hợp cuối khóa</span>
                <span>0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
