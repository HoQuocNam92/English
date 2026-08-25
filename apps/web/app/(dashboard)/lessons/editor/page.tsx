'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/shared/layout';

interface TermEntry {
  id: string;
  term: string;
  definition: string;
  example: string;
}

export default function LessonEditorPage() {
  const [title, setTitle] = useState('Understanding REST APIs & HTTP Methods');
  const [domain, setDomain] = useState('Software Engineering');
  const [level, setLevel] = useState('Intermediate');
  const [duration, setDuration] = useState(25);
  const [intro, setIntro] = useState(
    'In this lesson, you will learn the core concepts of REST (Representational State Transfer) APIs. We will cover the standard HTTP methods, status codes, and how data is formatted in JSON.'
  );

  const [terms, setTerms] = useState<TermEntry[]>([
    {
      id: '1',
      term: 'Endpoint',
      definition: 'A specific URL where an API can be accessed by a client application.',
      example: 'GET https://api.example.com/v1/users is a common REST endpoint.'
    },
    {
      id: '2',
      term: 'Payload',
      definition: 'The actual body of data transmitted in an HTTP request or response.',
      example: 'The POST request contains a JSON payload with the user details.'
    },
    {
      id: '3',
      term: 'Idempotent',
      definition: 'An HTTP method is idempotent if the intended effect on the server of making a single request is the same as making multiple identical requests.',
      example: 'GET, PUT, and DELETE methods are designed to be idempotent.'
    }
  ]);

  const [detailedContent, setDetailedContent] = useState(
    `## 1. HTTP Methods in RESTful Architecture

When designing REST APIs, HTTP verbs define the action being performed:
- **GET**: Retrieve a resource.
- **POST**: Create a new resource.
- **PUT**: Replace a resource or create if not exists.
- **PATCH**: Partially update an existing resource.
- **DELETE**: Remove a resource.`
  );

  const handleAddTerm = () => {
    setTerms([
      ...terms,
      {
        id: Date.now().toString(),
        term: '',
        definition: '',
        example: ''
      }
    ]);
  };

  const handleRemoveTerm = (id: string) => {
    setTerms(terms.filter((t) => t.id !== id));
  };

  const handleUpdateTerm = (id: string, field: keyof TermEntry, value: string) => {
    setTerms(terms.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  const handleSave = () => {
    alert('Đã lưu bài học thành công!');
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
        {/* Top Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link
              href="/lessons"
              className="p-2 rounded-lg border border-outline-variant text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-on-surface tracking-tight">Soạn thảo bài học</h2>
              <p className="text-xs text-on-surface-variant">Biên soạn nội dung lý thuyết và bộ thuật ngữ IT</p>
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
              <span className="material-symbols-outlined text-[18px] !text-white">publish</span>
              <span className="!text-white">Xuất bản</span>
            </button>
          </div>
        </div>

        {/* Basic Info Card */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-on-surface">Thông tin cơ bản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-on-surface">Tiêu đề bài học</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface font-medium outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">Lĩnh vực chuyên ngành (IT Domain)</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="DevOps">DevOps</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Data Engineering">Data Engineering</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface">Cấp độ (Level)</label>
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
          </div>
        </div>

        {/* Introduction Card */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-on-surface">Giới thiệu bài học (Introduction)</h3>
          <textarea
            rows={3}
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            className="w-full p-3 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs text-on-surface outline-none focus:border-primary resize-y"
          />
        </div>

        {/* Technical Terms Builder */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Bảng thuật ngữ kỹ thuật (Technical Vocabulary)</h3>
              <p className="text-xs text-on-surface-variant">Người học sẽ được ôn luyện và làm quiz dựa trên danh sách này</p>
            </div>
            <button
              onClick={handleAddTerm}
              className="px-3 py-1.5 rounded-lg border border-primary text-primary text-xs font-semibold hover:bg-primary-fixed/30 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Thêm từ</span>
            </button>
          </div>

          <div className="space-y-3">
            {terms.map((term, index) => (
              <div
                key={term.id}
                className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/40 space-y-3 relative group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-primary">Thuật ngữ #{index + 1}</span>
                  <button
                    onClick={() => handleRemoveTerm(term.id)}
                    className="text-outline hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-on-surface block mb-1">Thuật ngữ (Term)</label>
                    <input
                      type="text"
                      value={term.term}
                      onChange={(e) => handleUpdateTerm(term.id, 'term', e.target.value)}
                      placeholder="VD: Idempotent"
                      className="w-full px-3 py-1.5 rounded border border-outline-variant/60 bg-surface-container-lowest text-xs font-semibold text-on-surface outline-none focus:border-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-semibold text-on-surface block mb-1">Định nghĩa tiếng Anh (Definition)</label>
                    <input
                      type="text"
                      value={term.definition}
                      onChange={(e) => handleUpdateTerm(term.id, 'definition', e.target.value)}
                      placeholder="Giải thích nghĩa kỹ thuật..."
                      className="w-full px-3 py-1.5 rounded border border-outline-variant/60 bg-surface-container-lowest text-xs text-on-surface outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-on-surface block mb-1">Ví dụ ngữ cảnh (Context Example)</label>
                  <input
                    type="text"
                    value={term.example}
                    onChange={(e) => handleUpdateTerm(term.id, 'example', e.target.value)}
                    placeholder="Câu ví dụ trong ngữ cảnh lập trình / system design..."
                    className="w-full px-3 py-1.5 rounded border border-outline-variant/60 bg-surface-container-lowest text-xs text-on-surface outline-none focus:border-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Explanation / Markdown */}
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-on-surface">Nội dung chi tiết (Markdown)</h3>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-container text-on-surface-variant">
                Supports Markdown & Code
              </span>
            </div>
          </div>
          <textarea
            rows={8}
            value={detailedContent}
            onChange={(e) => setDetailedContent(e.target.value)}
            className="w-full p-4 rounded-lg border border-outline-variant/60 bg-surface-bright text-xs font-mono text-on-surface outline-none focus:border-primary resize-y"
          />
        </div>
      </div>
    </AppShell>
  );
}
