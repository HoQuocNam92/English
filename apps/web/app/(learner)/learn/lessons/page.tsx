'use client';

import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';

const modules = [
  {
    id: 'mod-1',
    title: 'Module 1: Cloud Concepts & Global Infrastructure',
    description: 'Nền tảng kiến trúc điện toán đám mây, Regions, Availability Zones và Shared Responsibility Model.',
    progress: 100,
    lessons: [
      { id: 'les-1', title: 'Introduction to Cloud Computing & AWS Infrastructure', duration: 15, terms: 12, status: 'completed' },
      { id: 'les-2', title: 'AWS Well-Architected Framework: 6 Pillars', duration: 20, terms: 16, status: 'completed' },
      { id: 'les-3', title: 'High Availability, Fault Tolerance & Disaster Recovery', duration: 18, terms: 14, status: 'completed' }
    ]
  },
  {
    id: 'mod-2',
    title: 'Module 2: AWS Security, Identity & Access Management (IAM)',
    description: 'Bảo mật đám mây, IAM Users/Roles/Policies, Multi-Factor Authentication và Encryption.',
    progress: 66,
    lessons: [
      { id: 'les-4', title: 'IAM Roles, Users and Group Permission Boundaries', duration: 25, terms: 18, status: 'completed' },
      { id: 'les-5', title: 'JSON Policy Structure: Effect, Principal, Action, Resource', duration: 30, terms: 22, status: 'in_progress' },
      { id: 'les-6', title: 'AWS Key Management Service (KMS) & Secret Rotation', duration: 20, terms: 12, status: 'not_started' }
    ]
  },
  {
    id: 'mod-3',
    title: 'Module 3: Core Compute, Storage & Networking Services',
    description: 'Các dịch vụ tính toán (EC2, Lambda), lưu trữ (S3, EBS, EFS) và mạng (VPC, Subnets, Route 53).',
    progress: 0,
    lessons: [
      { id: 'les-7', title: 'Amazon S3 Storage Classes, Lifecycle Rules & Versioning', duration: 25, terms: 20, status: 'not_started' },
      { id: 'les-8', title: 'Amazon EC2 Instance Types, Pricing & Auto Scaling', duration: 30, terms: 24, status: 'not_started' },
      { id: 'les-9', title: 'Virtual Private Cloud (VPC), Subnets, NAT Gateways & Security Groups', duration: 35, terms: 26, status: 'not_started' }
    ]
  }
];

export default function LearnerLessonsPage() {
  return (
    <LearnerShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Lộ trình học tập cá nhân hóa</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Chuyên ngành: <strong>Cloud Computing</strong> · Mục tiêu: <strong>AWS Cloud Practitioner (CLF-C02)</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/50 shadow-2xs">
            <span className="text-xs text-on-surface-variant font-medium">Tiến độ chung:</span>
            <span className="text-sm font-extrabold text-primary">68% Hoàn thành</span>
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-6">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-outline-variant/30">
                <div>
                  <h3 className="text-base font-bold text-on-surface">{mod.title}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">{mod.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-on-surface">{mod.progress}%</span>
                  <div className="w-24 h-2 rounded-full bg-surface-container overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${mod.progress}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mod.lessons.map((les) => (
                  <div
                    key={les.id}
                    className="p-4 rounded-xl bg-surface-bright border border-outline-variant/40 hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            les.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : les.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {les.status === 'completed'
                            ? 'Đã hoàn thành'
                            : les.status === 'in_progress'
                            ? 'Đang học'
                            : 'Chưa học'}
                        </span>
                        <span className="text-[11px] text-outline">⏱ {les.duration}p</span>
                      </div>

                      <h4 className="text-xs font-bold text-on-surface line-clamp-2 mb-2">{les.title}</h4>
                      <p className="text-[11px] text-on-surface-variant m-0 mb-4">📖 {les.terms} thuật ngữ tiếng Anh</p>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-outline-variant/30">
                      <Link
                        href={`/learn/lessons/${les.id}`}
                        className="py-1 text-center rounded border border-outline-variant/60 hover:bg-surface-container text-[11px] font-semibold text-on-surface transition-colors"
                        title="Đọc lý thuyết"
                      >
                        Lý thuyết
                      </Link>
                      <Link
                        href={`/learn/flashcards/${les.id}`}
                        className="py-1 text-center rounded bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold transition-colors"
                        title="Học từ vựng Flashcard"
                      >
                        Từ vựng
                      </Link>
                      <Link
                        href={`/learn/quiz/${les.id}`}
                        className="py-1 text-center rounded bg-primary hover:bg-indigo-700 !text-white text-[11px] font-bold transition-colors"
                        title="Làm bài trắc nghiệm"
                      >
                        Quiz
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </LearnerShell>
  );
}
