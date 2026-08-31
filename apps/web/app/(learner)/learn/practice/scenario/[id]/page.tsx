'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';

export default function LearnerScenarioSolverPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const questionId = unwrappedParams.id;
  
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function loadQuestion() {
      try {
        const res: any = await apiClient.get(`/questions/${questionId}`);
        setQuestion(res?.data || res);
      } catch (err) {
        setError('Failed to load scenario');
      } finally {
        setLoading(false);
      }
    }
    if (questionId) loadQuestion();
  }, [questionId]);

  if (loading) return <LearnerShell><div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div></LearnerShell>;
  if (error || !question) return <LearnerShell><div className="p-8 text-center text-red-500">{error || 'Not found'}</div></LearnerShell>;

  const options = question.options || [];
  // Assuming the API returns isCorrect for options when checked, or we just trust the client if it has it.
  const correctOption = options.find((o: any) => o.isCorrect)?.id;

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
            Tình huống thực tế
          </span>
        </div>

        {/* Problem Statement Card */}
        <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
          <h2 className="text-xl font-extrabold text-on-surface tracking-tight">Thử thách Tình huống</h2>

          {question.context && (
            <div className="p-4 rounded-xl bg-surface-bright border-l-4 border-primary border border-outline-variant/40 space-y-1">
              <span className="text-[11px] font-bold text-primary uppercase">Bối cảnh kỹ thuật (Case Context):</span>
              <p className="text-xs lg:text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{question.context}</p>
            </div>
          )}

          <h3 className="text-sm font-bold text-on-surface pt-2 whitespace-pre-wrap">{question.prompt}</h3>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {options.map((opt: any) => {
              const isSelected = selectedOpt === opt.id;
              const isCorrectOpt = opt.id === correctOption;

              return (
                <div
                  key={opt.id}
                  onClick={() => !checked && setSelectedOpt(opt.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                    checked && isCorrectOpt
                      ? 'bg-green-50/80 border-green-500 ring-1 ring-green-500/30'
                      : checked && isSelected && !isCorrectOpt
                      ? 'bg-red-50/80 border-red-500 ring-1 ring-red-500/30'
                      : isSelected
                      ? 'bg-primary/5 border-primary shadow-xs'
                      : 'bg-surface-bright border-outline-variant/50 hover:border-primary/40'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      checked && isCorrectOpt
                        ? 'bg-green-600 text-white'
                        : checked && isSelected && !isCorrectOpt
                        ? 'bg-red-600 text-white'
                        : isSelected
                        ? 'bg-primary text-white'
                        : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    {opt.key || opt.id.substring(0,2)}
                  </div>
                  <span className="text-xs font-semibold text-on-surface">{opt.text}</span>
                </div>
              );
            })}
          </div>

          {/* Explanation Card */}
          {checked && question.explanation && (
            <div className="p-5 rounded-xl bg-purple-50/80 border border-purple-200 text-xs space-y-2 mt-4">
              <div className="flex items-center gap-1.5 text-ai-accent font-bold">
                <span className="material-symbols-outlined text-[20px]">lightbulb</span>
                <span>Phân tích kiến trúc chuyên sâu:</span>
              </div>
              <p className="text-on-surface leading-relaxed whitespace-pre-wrap">{question.explanation}</p>
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
                <span>Hoàn thành & Quay lại</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
