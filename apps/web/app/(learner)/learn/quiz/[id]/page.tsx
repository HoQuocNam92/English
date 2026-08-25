'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LearnerShell } from '@/shared/layout';

const quizQuestions = [
  {
    id: 'q1',
    prompt: 'Which AWS service provides virtually unlimited object storage accessible natively through standard HTTPS REST APIs?',
    options: [
      { id: 'A', text: 'Amazon EBS (Elastic Block Store)' },
      { id: 'B', text: 'Amazon S3 (Simple Storage Service)' },
      { id: 'C', text: 'Amazon EFS (Elastic File System)' },
      { id: 'D', text: 'Amazon Storage Gateway' }
    ]
  },
  {
    id: 'q2',
    prompt: 'Under the AWS Shared Responsibility Model, which of the following security tasks is the customer responsible for?',
    options: [
      { id: 'A', text: 'Patching the host physical hypervisor' },
      { id: 'B', text: 'Disposing of decommissioned storage disks' },
      { id: 'C', text: 'Configuring IAM user permissions and Multi-Factor Authentication (MFA)' },
      { id: 'D', text: 'Maintaining physical security of AWS data centers' }
    ]
  },
  {
    id: 'q3',
    prompt: 'Which architectural principle is defined by the ability of a cloud system to remain operational despite individual component failures?',
    options: [
      { id: 'A', text: 'Fault Tolerance' },
      { id: 'B', text: 'Scalability' },
      { id: 'C', text: 'Agility' },
      { id: 'D', text: 'Elasticity' }
    ]
  }
];

export default function LearnerQuizTakingPage() {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const q = quizQuestions[currentIdx];
  const total = quizQuestions.length;
  const selectedOpt = answers[q.id];

  const handleSelect = (optId: string) => {
    setAnswers({ ...answers, [q.id]: optId });
  };

  const handleSubmit = () => {
    router.push('/learn/quiz/result/res-1');
  };

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
        {/* Exam Header Bar */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs flex flex-wrap justify-between items-center gap-4 sticky top-20 z-20">
          <div>
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">
              AWS Certified Cloud Practitioner Mock #1
            </span>
            <h2 className="text-base font-bold text-on-surface">Đề thi mô phỏng chuẩn hóa</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
              <span className="material-symbols-outlined text-[20px] text-primary">timer</span>
              <span className="font-mono text-sm font-extrabold text-primary">58:45</span>
            </div>

            <button
              onClick={handleSubmit}
              className="px-5 py-2 bg-primary hover:bg-indigo-700 !text-white font-bold text-xs rounded-xl transition-all shadow-sm"
            >
              Nộp bài thi
            </button>
          </div>
        </div>

        {/* 2-Column Question & Palette Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-outline-variant/30">
                <span className="text-xs font-bold text-primary">Câu hỏi #{currentIdx + 1} / {total}</span>
                <span className="text-xs text-outline font-semibold">1 điểm</span>
              </div>

              <h3 className="text-base lg:text-lg font-bold text-on-surface leading-relaxed">
                {q.prompt}
              </h3>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {q.options.map((opt) => {
                  const isSelected = selectedOpt === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                        isSelected
                          ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20'
                          : 'bg-surface-bright border-outline-variant/50 hover:border-primary/40'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-primary text-white' : 'bg-surface-container text-on-surface'
                        }`}
                      >
                        {opt.id}
                      </div>
                      <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Nav Buttons */}
              <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(currentIdx - 1)}
                  className="px-4 py-2 border border-outline-variant rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Câu trước</span>
                </button>

                {currentIdx < total - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(currentIdx + 1)}
                    className="px-5 py-2 bg-primary hover:bg-indigo-700 !text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <span className="!text-white">Câu tiếp theo</span>
                    <span className="material-symbols-outlined text-[16px] !text-white">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 !text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm"
                  >
                    <span className="!text-white">Hoàn thành & Nộp bài</span>
                    <span className="material-symbols-outlined text-[16px] !text-white">check</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Question Palette (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-on-surface">Danh sách câu hỏi</h3>
              <div className="grid grid-cols-5 gap-2">
                {quizQuestions.map((item, idx) => {
                  const isAnswered = !!answers[item.id];
                  const isCurrent = idx === currentIdx;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-9 rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? 'ring-2 ring-primary bg-primary text-white'
                          : isAnswered
                          ? 'bg-green-100 text-green-900 border border-green-300'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-outline-variant/30 space-y-2 text-[11px] text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-green-200 border border-green-400" />
                  <span>Đã trả lời ({Object.keys(answers).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-surface-container" />
                  <span>Chưa trả lời ({total - Object.keys(answers).length})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
