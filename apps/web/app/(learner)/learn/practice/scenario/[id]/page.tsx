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

  useEffect(() => {
    async function loadQuestion() {
      try {
        // Mock fallback if API fails
        const res: any = await apiClient.get(`/questions/${questionId}`).catch(() => ({
          data: {
            id: questionId,
            prompt: 'What is the most likely initial step to diagnose the root cause of this connection failure?',
            context: 'A critical e-commerce web application hosted on an Apache web server suddenly experiences a high volume of \'504 Gateway Timeout\' errors reported by users attempting to complete the checkout process. The monitoring dashboard indicates a significant spike in database query latency, while web server CPU utilization remains steady at around 45%. The network interface shows no dropped packets, but the application logs reveal repeated connection pool exhaustion warnings when communicating with the backend PostgreSQL database cluster.',
            options: [
              { id: '1', text: 'Restart the Apache web server to clear any hung processes and free up immediate resources.' },
              { id: '2', text: 'Investigate the PostgreSQL database for long-running queries or locking issues that are tying up connections.', isCorrect: true },
              { id: '3', text: 'Increase the available bandwidth on the network interface to handle the sudden surge in user traffic.' },
              { id: '4', text: 'Upgrade the web server hardware to add more CPU cores, as the current utilization is too high.' }
            ]
          }
        }));
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
  if (error || !question) return <LearnerShell><div className="p-8 text-center text-error">{error || 'Not found'}</div></LearnerShell>;

  const options = question.options || [];

  return (
    <LearnerShell>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-[1280px] mx-auto pb-12">
        
        {/* Left Column: Scenario & Question */}
        <div className="md:col-span-8 flex flex-col gap-6">
          
          {/* Progress Bar */}
          <div className="bg-surface-white border border-border-subtle rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[14px] font-semibold text-on-surface">Bài tập: Network Troubleshooting</span>
              <span className="text-[12px] text-on-surface-variant">Câu 3 / 10</span>
            </div>
            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-[30%]"></div>
            </div>
          </div>

          {/* Scenario Card */}
          <div className="bg-surface-white border border-border-subtle rounded-lg p-6 hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">description</span>
              <h2 className="text-[20px] font-semibold text-on-surface">Tình huống (Scenario)</h2>
            </div>
            <div className="bg-surface-container-low border border-border-subtle rounded p-4">
              <p className="text-[14px] text-on-surface leading-relaxed whitespace-pre-line">
                {question.context}
              </p>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-surface-white border border-border-subtle rounded-lg p-6 shadow-sm">
            <h3 className="text-[20px] font-semibold text-on-surface mb-4">Câu hỏi</h3>
            <p className="text-[14px] font-semibold text-on-background mb-6 whitespace-pre-wrap">
              {question.prompt}
            </p>

            {/* Options */}
            <div className="flex flex-col gap-2">
              {options.map((opt: any) => {
                const isSelected = selectedOpt === opt.id;
                return (
                  <label 
                    key={opt.id} 
                    className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-2 border-primary bg-primary-light' 
                        : 'border border-border-subtle hover:border-primary hover:bg-primary-light'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="answer"
                      checked={isSelected}
                      onChange={() => setSelectedOpt(opt.id)}
                      className="mt-1 text-primary focus:ring-primary border-outline-variant" 
                    />
                    <span className="text-[14px] text-on-surface">{opt.text}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-4">
            <button className="px-6 py-2 border border-border-subtle rounded-lg text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">
              Quay lại
            </button>
            <button className="px-6 py-2 bg-primary text-white rounded-lg text-[14px] font-semibold hover:bg-primary-fixed-dim transition-colors shadow-sm">
              Tiếp theo
            </button>
          </div>
        </div>

        {/* Right Column: Navigation Grid */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-white border border-border-subtle rounded-lg p-4 sticky top-24">
            <h4 className="text-[14px] font-semibold text-on-surface mb-2 border-b border-border-subtle pb-1">
              Danh sách câu hỏi
            </h4>
            <div className="grid grid-cols-5 gap-1 mt-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isActive = num === 3;
                const isAnswered = num < 3;
                return (
                  <button 
                    key={num}
                    className={`w-10 h-10 rounded text-[14px] font-semibold flex items-center justify-center transition-colors ${
                      isActive 
                        ? 'border-2 border-primary bg-primary-light text-primary' 
                        : isAnswered
                        ? 'border border-border-subtle bg-surface-container-low text-on-surface hover:bg-surface-container'
                        : 'border border-border-subtle bg-surface-white text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 border-t border-border-subtle pt-4">
              <button className="w-full py-2 bg-surface-container text-on-surface text-[14px] font-semibold rounded hover:bg-surface-container-high transition-colors">
                Nộp bài
              </button>
            </div>
          </div>

          {/* Vocabulary Hint */}
          <div className="bg-ai-accent border border-secondary-fixed-dim rounded-lg p-4">
            <div className="flex items-center gap-1 mb-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">lightbulb</span>
              <span className="text-[14px] font-semibold text-on-surface">Từ vựng quan trọng</span>
            </div>
            <ul className="text-[12px] text-on-surface-variant space-y-1">
              <li><strong className="text-on-surface">connection pool exhaustion:</strong> cạn kiệt nhóm kết nối (không còn kết nối trống để xử lý yêu cầu mới).</li>
              <li><strong className="text-on-surface">query latency:</strong> độ trễ truy vấn (thời gian cơ sở dữ liệu xử lý lệnh).</li>
            </ul>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
