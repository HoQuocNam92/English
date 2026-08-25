'use client';

import * as React from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';

export default function LearnerLessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const lessonId = unwrappedParams.id || 'les-1';

  const lesson = {
    id: lessonId,
    title: 'AWS Identity and Access Management (IAM) Roles & Policies',
    domain: 'Cloud Computing',
    duration: 20,
    intro:
      'AWS Identity and Access Management (IAM) is a web service that helps you securely control access to AWS resources. You use IAM to control who is authenticated (signed in) and authorized (has permissions) to use resources.',
    content: `## 1. Core IAM Concepts
In enterprise cloud environments, access control is governed by four primary entities:

- **IAM User**: A person or application that interacts with AWS. Each user has permanent long-term credentials.
- **IAM Group**: A collection of IAM users. You can specify permissions for multiple users at once.
- **IAM Role**: An identity that you can assume to gain temporary access to permissions (Used by EC2, Lambda, or cross-account users).
- **IAM Policy**: A JSON document that formally defines permissions (Effect, Principal, Action, Resource, Condition).

## 2. Least Privilege Principle
The security best practice of **Least Privilege** dictates that users and services should only be granted the absolute minimum permissions required to perform their tasks.

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::company-logs/*"
    }
  ]
}
\`\`\``,
    terms: [
      {
        term: 'IAM Role',
        phonetic: '/aɪ.eɪ.em roʊl/',
        defVi: 'Vai trò cấp quyền tạm thời cho dịch vụ hoặc người dùng',
        defEn: 'An IAM identity that you can create in your account that has specific permissions with temporary security credentials.'
      },
      {
        term: 'Least Privilege',
        phonetic: '/liːst ˈprɪv.əl.ɪdʒ/',
        defVi: 'Nguyên tắc đặc quyền tối thiểu',
        defEn: 'The security practice of giving a user or system only the access privileges that are essential to perform its intended function.'
      },
      {
        term: 'Idempotency',
        phonetic: '/ˌaɪ.dəmˈpoʊ.tən.si/',
        defVi: 'Tính lũy thừa / Tính bất biến qua nhiều lần thực thi',
        defEn: 'An operation can be applied multiple times without changing the result beyond the initial application.'
      }
    ]
  };

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6">
        {/* Breadcrumb & Top Bar */}
        <div className="flex justify-between items-center">
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Link href="/learn/lessons" className="hover:text-primary transition-colors">
              Lộ trình học
            </Link>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-primary font-semibold">{lesson.title}</span>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={`/learn/flashcards/${lesson.id}`}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors border border-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]">style</span>
              <span>Học 15 Flashcards</span>
            </Link>
            <Link
              href={`/learn/quiz/${lesson.id}`}
              className="px-4 py-2 bg-primary hover:bg-indigo-700 !text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="!text-white">Làm bài Quiz</span>
              <span className="material-symbols-outlined text-[18px] !text-white">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* 2-Column Reader Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Theory Content (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                  {lesson.domain}
                </span>
                <span className="text-xs text-outline">⏱ {lesson.duration} phút học</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-extrabold text-on-surface tracking-tight">
                {lesson.title}
              </h1>
              <p className="text-xs lg:text-sm text-on-surface-variant leading-relaxed p-3.5 bg-surface-bright rounded-xl border border-outline-variant/30">
                {lesson.intro}
              </p>

              {/* Formatted Reading Content */}
              <div className="pt-4 border-t border-outline-variant/30 text-xs lg:text-sm text-on-surface leading-relaxed space-y-4 font-sans">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-on-surface">1. Core IAM Concepts</h3>
                  <p className="text-on-surface-variant">
                    In enterprise cloud environments, access control is governed by four primary entities:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-on-surface-variant">
                    <li>
                      <strong className="text-on-surface">IAM User:</strong> A person or application that interacts with AWS. Each user has permanent long-term credentials.
                    </li>
                    <li>
                      <strong className="text-on-surface">IAM Group:</strong> A collection of IAM users. You can specify permissions for multiple users at once.
                    </li>
                    <li>
                      <strong className="text-on-surface">IAM Role:</strong> An identity that you can assume to gain temporary access to permissions (Used by EC2, Lambda, or cross-account users).
                    </li>
                    <li>
                      <strong className="text-on-surface">IAM Policy:</strong> A JSON document that formally defines permissions (Effect, Principal, Action, Resource, Condition).
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-on-surface">2. Least Privilege Principle</h3>
                  <p className="text-on-surface-variant">
                    The security best practice of <strong>Least Privilege</strong> dictates that users and services should only be granted the absolute minimum permissions required to perform their tasks.
                  </p>

                  <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                    <pre>{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::company-logs/*"
    }
  ]
}`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Vocabulary Glossary Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4 sticky top-24">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                <h3 className="text-sm font-bold text-on-surface">Thuật ngữ trong bài</h3>
                <span className="text-xs text-primary font-bold">{lesson.terms.length} từ vựng</span>
              </div>

              <div className="space-y-3">
                {lesson.terms.map((t) => (
                  <div
                    key={t.term}
                    className="p-3.5 rounded-xl bg-surface-bright border border-outline-variant/40 space-y-1.5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-primary">{t.term}</span>
                      <span className="text-[10px] font-mono text-outline">{t.phonetic}</span>
                    </div>
                    <p className="text-xs font-semibold text-on-surface m-0">{t.defVi}</p>
                    <p className="text-[11px] text-on-surface-variant leading-tight m-0">{t.defEn}</p>
                  </div>
                ))}
              </div>

              <Link
                href={`/learn/flashcards/${lesson.id}`}
                className="w-full py-2.5 bg-primary hover:bg-indigo-700 !text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px] !text-white">style</span>
                <span className="!text-white">Luyện thẻ Flashcards SRS</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
