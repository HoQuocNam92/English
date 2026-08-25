'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/shared/layout';

export default function QuestionEditorPage() {
  const [prompt, setPrompt] = useState(
    'A company needs to store unstructured log files that must be accessible with low latency over standard HTTPS APIs. The storage solution should provide virtually unlimited scalability. Which AWS storage service is best suited for this requirement?'
  );
  const [type, setType] = useState('Multiple Choice');
  const [domain, setDomain] = useState('Cloud Computing');
  const [level, setLevel] = useState('Beginner');
  const [certGoal, setCertGoal] = useState('AWS Certified Cloud Practitioner');

  const [options, setOptions] = useState([
    { id: 'A', text: 'Amazon EBS (Elastic Block Store)', isCorrect: false },
    { id: 'B', text: 'Amazon S3 (Simple Storage Service)', isCorrect: true },
    { id: 'C', text: 'Amazon EFS (Elastic File System)', isCorrect: false },
    { id: 'D', text: 'Amazon Instance Store', isCorrect: false }
  ]);

  const [explanation, setExplanation] = useState(
    'Amazon S3 is an object storage service offering industry-leading scalability, data availability, security, and performance. S3 is accessed natively via REST/HTTPS API endpoints. Amazon EBS and Instance Store provide block-level storage for EC2 instances, while EFS provides managed NFS file storage.'
  );

  const handleSelectCorrect = (id: string) => {
    setOptions(options.map((opt) => ({ ...opt, isCorrect: opt.id === id })));
  };

  const handleOptionChange = (id: string, text: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, text } : opt)));
  };

  const handleSave = () => {
    alert('Đã lưu câu hỏi vào Ngân hàng câu hỏi thành công!');
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link
              href="/questions"
              className="p-2 rounded-lg border border-outline-variant text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-on-surface tracking-tight">Biên soạn câu hỏi (Question Editor)</h2>
              <p className="text-xs text-on-surface-variant">Tạo câu hỏi trắc nghiệm kèm giải thích đáp án chi tiết</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
            >
              Lưu bản nháp
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary hover:bg-indigo-700 !text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px] !text-white">check</span>
              <span className="!text-white">Lưu câu hỏi</span>
            </button>
          </div>
        </div>

        {/* 2-Column Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question Form (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Question Prompt */}
            <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-3">
              <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                <span>Nội dung câu hỏi (Question Prompt)</span>
                <span className="text-[11px] font-normal text-outline">Tiếng Anh chuyên ngành</span>
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-3 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary resize-y"
              />
            </div>

            {/* Answer Options */}
            <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
              <div>
                <h3 className="text-xs font-bold text-on-surface">Các phương án trả lời (Options)</h3>
                <p className="text-[11px] text-on-surface-variant">Chọn nút tròn tương ứng với đáp án đúng (Correct Answer)</p>
              </div>

              <div className="space-y-3">
                {options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`p-3 rounded-lg border transition-all flex items-center gap-3 ${
                      opt.isCorrect
                        ? 'bg-green-50/70 border-green-300 ring-1 ring-green-400/40'
                        : 'bg-surface-container-low border-outline-variant/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="correct-option"
                      checked={opt.isCorrect}
                      onChange={() => handleSelectCorrect(opt.id)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer accent-green-600"
                    />
                    <span className="w-6 text-xs font-bold text-on-surface">{opt.id}.</span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                      className="flex-1 bg-transparent border-none text-xs font-medium text-on-surface outline-none"
                    />
                    {opt.isCorrect ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-200 text-green-900">
                        Đáp án đúng
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-3">
              <label className="text-xs font-bold text-on-surface">
                Giải thích đáp án & Kiến thức liên quan (Answer Explanation)
              </label>
              <textarea
                rows={4}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full p-3 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary resize-y"
              />
            </div>
          </div>

          {/* Right Metadata Sidebar (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold text-on-surface">Phân loại & Tagging</h3>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-on-surface">Dạng câu hỏi (Type)</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary"
                >
                  <option value="Multiple Choice">Multiple Choice</option>
                  <option value="Scenario">Scenario-based</option>
                  <option value="Reading Comprehension">Reading Comprehension</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-on-surface">Lĩnh vực (Domain)</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary"
                >
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Data Engineering">Data Engineering</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-on-surface">Cấp độ (Level)</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-on-surface">Mục tiêu chứng chỉ (Target Certificate)</label>
                <select
                  value={certGoal}
                  onChange={(e) => setCertGoal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary"
                >
                  <option value="AWS Certified Cloud Practitioner">AWS Certified Cloud Practitioner</option>
                  <option value="AWS Certified Solutions Architect Associate">AWS Solutions Architect SAA</option>
                  <option value="CompTIA Security+">CompTIA Security+</option>
                  <option value="Google Professional Data Engineer">Google Data Engineer</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
