'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/shared/layout';

export default function TestBuilderPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('AWS Solutions Architect (SAA-C03) - Comprehensive Assessment');
  const [domain, setDomain] = useState('Cloud Computing');
  const [certGoal, setCertGoal] = useState('AWS Certified Solutions Architect Associate');
  const [duration, setDuration] = useState(65);
  const [passingScore, setPassingScore] = useState(72);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [showExplanation, setShowExplanation] = useState(true);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      alert('Đã xuất bản đề thi thành công!');
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link
              href="/tests"
              className="p-2 rounded-lg border border-outline-variant text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-on-surface tracking-tight">Tạo đề thi mới (Test Builder)</h2>
              <p className="text-xs text-on-surface-variant">Thiết lập cấu trúc và câu hỏi kiểm tra đánh giá</p>
            </div>
          </div>
        </div>

        {/* Steps Progress */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 1 ? 'bg-primary !text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                1
              </span>
              <span className={`text-xs font-bold ${currentStep >= 1 ? 'text-slate-900' : 'text-slate-500'}`}>
                Thiết lập cơ bản
              </span>
            </div>
            <div className="flex-1 h-0.5 mx-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 2 ? 'bg-primary !text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                2
              </span>
              <span className={`text-xs font-bold ${currentStep >= 2 ? 'text-slate-900' : 'text-slate-500'}`}>
                Chọn câu hỏi
              </span>
            </div>
            <div className="flex-1 h-0.5 mx-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 3 ? 'bg-primary !text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                3
              </span>
              <span className={`text-xs font-bold ${currentStep >= 3 ? 'text-slate-900' : 'text-slate-500'}`}>
                Xuất bản
              </span>
            </div>
          </div>
        </div>

        {/* Step 1 Form */}
        {currentStep === 1 ? (
          <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-5">
            <h3 className="text-sm font-bold text-on-surface">Bước 1: Cấu hình chung</h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">Tên bài kiểm tra / Đề thi</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface font-medium outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">Lĩnh vực (Domain)</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary"
                >
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Software Engineering">Software Engineering</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">Chứng chỉ mục tiêu</label>
                <select
                  value={certGoal}
                  onChange={(e) => setCertGoal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary"
                >
                  <option value="AWS Certified Solutions Architect Associate">AWS Solutions Architect SAA</option>
                  <option value="AWS Certified Cloud Practitioner">AWS Cloud Practitioner</option>
                  <option value="CompTIA Security+">CompTIA Security+</option>
                  <option value="Google Professional Data Engineer">Google Data Engineer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">Thời gian làm bài (Phút)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface">Điểm đạt chuẩn (%)</label>
                <input
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-outline-variant/30 space-y-3">
              <label className="text-xs font-bold text-on-surface block">Cài đặt nâng cao</label>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="accent-primary"
                  />
                  <span>Xáo trộn thứ tự câu hỏi khi học viên làm bài</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => setShuffleOptions(e.target.checked)}
                    className="accent-primary"
                  />
                  <span>Xáo trộn thứ tự các đáp án A/B/C/D</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showExplanation}
                    onChange={(e) => setShowExplanation(e.target.checked)}
                    className="accent-primary"
                  />
                  <span>Hiển thị lời giải thích chi tiết sau khi học viên nộp bài</span>
                </label>
              </div>
            </div>
          </div>
        ) : currentStep === 2 ? (
          <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-on-surface">Bước 2: Chọn câu hỏi từ Ngân hàng câu hỏi</h3>
            <p className="text-xs text-on-surface-variant">Đã chọn <strong>15/65</strong> câu hỏi cho bộ đề này.</p>
            <div className="p-4 rounded-lg bg-surface-container-low text-xs text-on-surface space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-surface-container-lowest border border-outline-variant/30">
                <span>[Q-AWS-0102] Which AWS service is primarily used for object storage?</span>
                <span className="text-green-600 font-bold">Đã thêm</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-container-lowest border border-outline-variant/30">
                <span>[Q-AWS-0205] Describe IAM policy evaluation logic when an explicit deny exists.</span>
                <span className="text-green-600 font-bold">Đã thêm</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4 text-center">
            <span className="material-symbols-outlined text-5xl text-green-600">task_alt</span>
            <h3 className="text-lg font-bold text-on-surface">Sẵn sàng xuất bản đề thi!</h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              Đề thi <strong>{title}</strong> đã được cấu hình với {duration} phút làm bài, điểm đỗ {passingScore}%.
            </p>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex justify-between items-center">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container"
            >
              Quay lại
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-primary hover:bg-indigo-700 !text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span className="!text-white">{currentStep === 3 ? 'Hoàn tất & Xuất bản' : 'Tiếp tục'}</span>
            <span className="material-symbols-outlined text-[16px] !text-white">arrow_forward</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
