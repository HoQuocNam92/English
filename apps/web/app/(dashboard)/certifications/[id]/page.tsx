'use client';

import * as React from 'react';
import Link from 'next/link';
import { AppShell } from '@/shared/layout';

export default function CertificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);

  const certData = {
    id: unwrappedParams.id || 'aws-ccp',
    name: 'AWS Certified Cloud Practitioner',
    code: 'CLF-C02',
    provider: 'Amazon Web Services',
    level: 'Foundational',
    domain: 'Cloud Computing',
    passingScore: '700 / 1000',
    durationMinutes: 90,
    totalQuestions: 65,
    domainsBreakdown: [
      { id: 'd1', name: 'Domain 1: Cloud Concepts', weight: '24%', lessons: 6, questions: 110 },
      { id: 'd2', name: 'Domain 2: Security and Compliance', weight: '30%', lessons: 8, questions: 140 },
      { id: 'd3', name: 'Domain 3: Cloud Technology and Services', weight: '34%', lessons: 10, questions: 160 },
      { id: 'd4', name: 'Domain 4: Billing, Pricing, and Support', weight: '12%', lessons: 4, questions: 65 }
    ],
    mockExams: [
      { id: 'm1', title: 'CLF-C02 Full Practice Exam #1', questionsCount: 65, passRate: '82%', attempts: 1240 },
      { id: 'm2', title: 'CLF-C02 Full Practice Exam #2', questionsCount: 65, passRate: '76%', attempts: 980 },
      { id: 'm3', title: 'Security & Shared Responsibility Focus Quiz', questionsCount: 25, passRate: '68%', attempts: 1450 }
    ]
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex justify-between items-center">
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Link href="/certifications" className="hover:text-primary transition-colors">
              Quản lý chứng chỉ
            </Link>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-primary font-semibold">{certData.name}</span>
          </nav>

          <Link
            href="/certifications"
            className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Danh sách</span>
          </Link>
        </div>

        {/* Hero Card */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {certData.code}
                </span>
                <span className="text-xs font-semibold text-primary">{certData.provider}</span>
                <span className="text-xs text-outline">· Level: {certData.level}</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface">{certData.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/tests/builder"
                className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Tạo đề thi mới</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-outline-variant/30 text-xs">
            <div>
              <span className="text-outline block">Thời gian thi:</span>
              <span className="font-bold text-on-surface">{certData.durationMinutes} phút</span>
            </div>
            <div>
              <span className="text-outline block">Số câu hỏi/đề:</span>
              <span className="font-bold text-on-surface">{certData.totalQuestions} câu</span>
            </div>
            <div>
              <span className="text-outline block">Điểm đạt chuẩn:</span>
              <span className="font-bold text-on-surface">{certData.passingScore}</span>
            </div>
            <div>
              <span className="text-outline block">Chuyên ngành:</span>
              <span className="font-bold text-primary">{certData.domain}</span>
            </div>
          </div>
        </div>

        {/* Domains Breakdown */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-on-surface">Cấu trúc các Domain trong đề thi</h3>
          <div className="space-y-3">
            {certData.domainsBreakdown.map((domain) => (
              <div
                key={domain.id}
                className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface">{domain.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-primary/10 text-primary">
                      Trọng số: {domain.weight}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    {domain.lessons} bài học lý thuyết & thuật ngữ · {domain.questions} câu hỏi luyện tập
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/questions"
                    className="px-3 py-1.5 rounded bg-surface-container-lowest border border-outline-variant/60 text-xs font-semibold hover:bg-surface-container text-on-surface transition-colors"
                  >
                    Xem câu hỏi
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock Exams List */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-on-surface">Danh sách đề thi mô phỏng (Mock Exams)</h3>
            <span className="text-xs text-outline">{certData.mockExams.length} đề thi sẵn sàng</span>
          </div>

          <div className="divide-y divide-outline-variant/20">
            {certData.mockExams.map((exam) => (
              <div key={exam.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">quiz</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">{exam.title}</h4>
                    <p className="text-[11px] text-on-surface-variant">
                      {exam.questionsCount} câu hỏi · {exam.attempts.toLocaleString()} lượt làm bài · Tỷ lệ đạt:{' '}
                      <strong className="text-green-600">{exam.passRate}</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/tests"
                    className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
                  >
                    Quản lý đề
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
