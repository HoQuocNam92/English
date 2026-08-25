'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';

export default function LearnerScenarioSolverPage() {
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const scenario = {
    title: 'Disaster Recovery & Multi-Region Database Replication',
    domain: 'Cloud Architecture & Resilience',
    description:
      'A global financial platform requires a high-throughput database that supports multi-region active-active writes with sub-10 millisecond latency. The infrastructure team specifies that they do not want to manage underlying virtual machines, cluster patching, or manual replication lag.',
    question: 'Which AWS database service and feature combination fulfills all functional and operational requirements?',
    options: [
      { id: 'A', text: 'Amazon RDS for PostgreSQL with Multi-AZ deployment and Read Replicas' },
      { id: 'B', text: 'Amazon DynamoDB with Global Tables enabled across desired AWS Regions' },
      { id: 'C', text: 'Amazon Aurora Serverless v1 with cross-region snapshots' },
      { id: 'D', text: 'Self-managed MongoDB replica set deployed on Amazon EC2 instances' }
    ],
    correctOption: 'B',
    explanation:
      'Amazon DynamoDB Global Tables is a fully managed, multi-region, active-active database solution that automatically replicates data across your choice of AWS regions without requiring custom replication infrastructure or server management.'
  };

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
        {/* Breadcrumb */}
        <div className="flex justify-between items-center">
          <Link
            href="/learn/practice"
            className="flex items-center gap-1 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Trở về trung tâm luyện tập</span>
          </Link>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-ai-accent/10 text-ai-accent">
            Tình huống thực tế #1
          </span>
        </div>

        {/* Problem Statement Card */}
        <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
              {scenario.domain}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-on-surface tracking-tight">{scenario.title}</h2>

          <div className="p-4 rounded-xl bg-surface-bright border-l-4 border-primary border border-outline-variant/40 space-y-1">
            <span className="text-[11px] font-bold text-primary uppercase">Bối cảnh kỹ thuật (Case Context):</span>
            <p className="text-xs lg:text-sm text-on-surface leading-relaxed">{scenario.description}</p>
          </div>

          <h3 className="text-sm font-bold text-on-surface pt-2">{scenario.question}</h3>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {scenario.options.map((opt) => {
              const isSelected = selectedOpt === opt.id;
              const isCorrect = opt.id === scenario.correctOption;

              return (
                <div
                  key={opt.id}
                  onClick={() => !checked && setSelectedOpt(opt.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                    checked && isCorrect
                      ? 'bg-green-50/80 border-green-500 ring-1 ring-green-500/30'
                      : checked && isSelected && !isCorrect
                      ? 'bg-red-50/80 border-red-500 ring-1 ring-red-500/30'
                      : isSelected
                      ? 'bg-primary/5 border-primary shadow-xs'
                      : 'bg-surface-bright border-outline-variant/50 hover:border-primary/40'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      checked && isCorrect
                        ? 'bg-green-600 text-white'
                        : checked && isSelected && !isCorrect
                        ? 'bg-red-600 text-white'
                        : isSelected
                        ? 'bg-primary text-white'
                        : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    {opt.id}
                  </div>
                  <span className="text-xs font-semibold text-on-surface">{opt.text}</span>
                </div>
              );
            })}
          </div>

          {/* Explanation Card */}
          {checked && (
            <div className="p-5 rounded-xl bg-purple-50/80 border border-purple-200 text-xs space-y-2 mt-4">
              <div className="flex items-center gap-1.5 text-ai-accent font-bold">
                <span className="material-symbols-outlined text-[20px]">lightbulb</span>
                <span>Phân tích kiến trúc chuyên sâu:</span>
              </div>
              <p className="text-on-surface leading-relaxed">{scenario.explanation}</p>
            </div>
          )}

          {/* Action */}
          <div className="pt-4 flex justify-end">
            {!checked ? (
              <button
                disabled={!selectedOpt}
                onClick={() => setChecked(true)}
                className="px-6 py-2.5 bg-primary hover:bg-primary-container disabled:opacity-50 text-on-primary font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                Kiểm tra đáp án
              </button>
            ) : (
              <Link
                href="/learn/practice"
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Hoàn thành & Sang tình huống tiếp</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
