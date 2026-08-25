'use client';

import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';

export default function LearnerQuizResultPage() {
  const result = {
    testTitle: 'AWS Certified Cloud Practitioner (CLF-C02) Mock Exam #1',
    score: 88,
    correctCount: 58,
    totalCount: 65,
    durationMinutes: 58,
    isPassed: true,
    domains: [
      { name: 'Domain 1: Cloud Concepts', score: 95, color: 'bg-primary' },
      { name: 'Domain 2: Security & Compliance (IAM)', score: 88, color: 'bg-indigo-600' },
      { name: 'Domain 3: Technology & Core Services', score: 82, color: 'bg-green-600' },
      { name: 'Domain 4: Billing, Pricing & Support', score: 75, color: 'bg-amber-500' }
    ],
    reviewedQuestions: [
      {
        id: 'q1',
        prompt: 'Which AWS service provides virtually unlimited object storage accessible natively through standard HTTPS REST APIs?',
        yourAnswer: 'Amazon S3',
        correctAnswer: 'Amazon S3',
        isCorrect: true,
        explanation: 'Amazon S3 (Simple Storage Service) provides object storage with 99.999999999% durability and HTTPS endpoint access.'
      },
      {
        id: 'q2',
        prompt: 'Under the AWS Shared Responsibility Model, which security task is the sole responsibility of the customer?',
        yourAnswer: 'Patching the physical host hypervisor',
        correctAnswer: 'Configuring IAM user permissions and Multi-Factor Authentication (MFA)',
        isCorrect: false,
        explanation: 'AWS manages security OF the cloud (physical infrastructure & virtualization), while the customer manages security IN the cloud (IAM users, encryption, guest OS patches).'
      }
    ]
  };

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
        {/* Top Score Banner */}
        <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-green-50 border border-green-200 text-green-700 flex flex-col items-center justify-center shrink-0">
              <span className="text-3xl font-black">{result.score}%</span>
              <span className="text-[10px] font-extrabold uppercase">ĐẠT CHUẨN</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-green-100 text-green-800">
                  🎉 Passed
                </span>
                <span className="text-xs text-outline">Điểm chuẩn đỗ: 70%</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface">{result.testTitle}</h2>
              <p className="text-xs text-on-surface-variant">
                Làm trong <strong>{result.durationMinutes} phút</strong> · Đúng <strong>{result.correctCount}/{result.totalCount} câu</strong> (Độ chuẩn xác 89.2%)
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/learn/practice"
              className="px-5 py-2.5 bg-primary hover:bg-indigo-700 !text-white font-bold text-xs rounded-xl transition-colors shadow-2xs text-center"
            >
              <span className="!text-white">Làm đề thi khác</span>
            </Link>
          </div>
        </div>

        {/* Domain Mastery Breakdown */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-on-surface">Kết quả phân bổ theo từng Domain</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.domains.map((d) => (
              <div key={d.name} className="p-4 rounded-xl bg-surface-bright border border-outline-variant/30 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-on-surface">{d.name}</span>
                  <span className="font-extrabold text-green-600">{d.score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-on-surface">Xem lại đáp án chi tiết</h3>
          <div className="space-y-4">
            {result.reviewedQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-5 rounded-xl bg-surface-bright border border-outline-variant/40 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      q.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {q.isCorrect ? 'check' : 'close'}
                    </span>
                    {q.isCorrect ? 'Chính xác' : 'Chưa đúng'}
                  </span>
                  <span className="text-xs text-outline font-semibold">Câu #{idx + 1}</span>
                </div>

                <h4 className="text-xs lg:text-sm font-bold text-on-surface leading-relaxed">{q.prompt}</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-3 rounded-lg bg-surface-container-low">
                  <div>
                    <span className="text-outline block text-[11px]">Bạn đã chọn:</span>
                    <span className={`font-bold ${q.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {q.yourAnswer}
                    </span>
                  </div>
                  <div>
                    <span className="text-outline block text-[11px]">Đáp án đúng:</span>
                    <span className="font-bold text-green-700">{q.correctAnswer}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-purple-50/80 border border-purple-200 text-xs space-y-1">
                  <span className="font-bold text-ai-accent">💡 Giải thích kiến thức:</span>
                  <p className="text-on-surface leading-relaxed m-0">{q.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
