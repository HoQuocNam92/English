'use client';

import * as React from 'react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';

// ─── Section Renderer ──────────────────────────────────────────────────────────
function renderSectionContent(sec: any) {
  const content = sec.content ?? {};
  const type: string = sec.type ?? '';

  switch (type) {
    case 'heading':
      return (
        <h2 className="text-[24px] font-bold text-on-surface mt-[2.5rem] mb-[1rem]" style={{ lineHeight: '1.4' }}>
          {content.text ?? content.heading ?? String(content)}
        </h2>
      );

    case 'rich_text':
      return (
        <div
          className="prose max-w-none text-on-surface"
          dangerouslySetInnerHTML={{
            __html: content.html ?? `<p class="font-body-md text-[17px] leading-[1.7] max-w-[65ch] text-on-surface mb-[1.5rem]">${content.text ?? content.body ?? String(content)}</p>`,
          }}
        />
      );

    case 'code': {
      const lang = content.language ?? '';
      const code = content.code ?? content.text ?? String(content);
      return (
        <pre className="bg-slate-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto mb-4">
          <code>{code}</code>
          {lang && <span className="block text-right text-slate-500 text-[10px] mt-1">{lang}</span>}
        </pre>
      );
    }

    case 'image':
      return content.url ? (
        <div className="my-6 rounded-xl overflow-hidden border border-outline-variant bg-surface-container-lowest p-4 flex flex-col items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.url}
            alt={content.alt ?? ''}
            className="max-w-full h-auto object-contain max-h-64"
          />
          {content.caption && (
            <span className="font-body-sm text-[12px] text-on-surface-variant mt-2 text-center">{content.caption}</span>
          )}
        </div>
      ) : null;

    case 'callout':
      return (
        <div className="bg-primary/10 border-l-4 border-primary px-4 py-3 rounded-r-xl text-[14px] text-on-surface mb-4">
          {content.text ?? content.body ?? String(content)}
        </div>
      );

    case 'vocabulary_list': {
      const items: any[] = content.items ?? [];
      return items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {items.map((v: any, i: number) => (
            <div key={i} className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <span className="font-bold text-primary text-[14px]">{v.term}</span>
              {v.ipa && <span className="ml-1 text-[12px] text-outline">/{v.ipa}/</span>}
              <p className="text-[12px] text-on-surface-variant mt-0.5">{v.definition ?? v.definitionVi ?? ''}</p>
            </div>
          ))}
        </div>
      ) : null;
    }

    case 'audio':
      return content.url ? (
        <audio controls className="w-full mt-2 mb-4">
          <source src={content.url} />
        </audio>
      ) : null;

    case 'video':
      return content.url ? (
        <video controls className="w-full rounded-xl mt-2 mb-4 max-h-72">
          <source src={content.url} />
        </video>
      ) : null;

    default:
      if (typeof content === 'string') {
        return <p className="font-body-md text-[17px] leading-[1.7] max-w-[65ch] text-on-surface mb-[1.5rem] whitespace-pre-wrap">{content}</p>;
      }
      if (content.text) {
        return <p className="font-body-md text-[17px] leading-[1.7] max-w-[65ch] text-on-surface mb-[1.5rem] whitespace-pre-wrap">{content.text}</p>;
      }
      return null;
  }
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function LearnerLessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const lessonId = unwrappedParams.id;

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marked, setMarked] = useState(false);

  useEffect(() => {
    async function fetchLesson() {
      try {
        const res = await apiClient.get(`/lessons/${lessonId}`);
        setLesson(res);
      } catch {
        setError('Không thể tải bài học. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }
    if (lessonId) fetchLesson();
  }, [lessonId]);

  const markComplete = async () => {
    try {
      await apiClient.post(`/progress/mark-lesson/${lessonId}`, {});
      setMarked(true);
    } catch {
      alert('Không thể đánh dấu hoàn thành.');
    }
  };

  if (loading)
    return (
      <LearnerShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </LearnerShell>
    );

  if (error || !lesson)
    return (
      <LearnerShell>
        <div className="text-center text-error py-8">
          <p>{error || 'Không tìm thấy bài học.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-[14px]"
          >
            Thử lại
          </button>
        </div>
      </LearnerShell>
    );

  const sections: any[] = [...(lesson.sections ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const levelBadge = lesson.level?.name ?? lesson.level?.code ?? 'Intermediate';
  const domainBadge = lesson.domain?.name ?? lesson.domain?.code ?? 'Software Engineering';
  const progressVal = 35; // Example progress

  return (
    <LearnerShell>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Column (Main Content - approx 75%) */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
          
          {/* Header Section */}
          <div className="flex flex-col gap-4">
            {/* Breadcrumbs */}
            <div className="flex items-center text-[12px] text-on-surface-variant gap-1">
              <Link href="/learn/lessons" className="hover:text-primary transition-colors">Khóa học</Link>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <Link href="/learn/lessons" className="hover:text-primary transition-colors">{domainBadge}</Link>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-on-surface font-semibold">{lesson.title}</span>
            </div>
            
            {/* Title & Meta */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-primary/10 text-primary font-bold text-[12px] uppercase tracking-[0.05em] px-2 py-1 rounded">{domainBadge}</span>
                <span className="bg-surface-container text-on-surface-variant font-bold text-[12px] uppercase tracking-[0.05em] px-2 py-1 rounded">{levelBadge}</span>
              </div>
              <h1 className="text-[30px] font-bold text-on-surface mt-2" style={{ lineHeight: '38px', letterSpacing: '-0.02em' }}>{lesson.title}</h1>
              <p className="text-[14px] text-on-surface-variant mt-2 max-w-[600px]">
                {lesson.summary || lesson.description || 'Learn the fundamental concepts and the technical vocabulary used in modern web development.'}
              </p>
            </div>
            
            {/* Progress Bar (Hero) */}
            <div className="w-full mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[12px] text-on-surface-variant">Tiến độ bài học</span>
                <span className="font-semibold text-[14px] text-primary">{progressVal}%</span>
              </div>
              <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${progressVal}%` }}></div>
              </div>
            </div>
          </div>

          {/* Learning Canvas (Ambient Card) */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 md:p-8 mt-4 hover:shadow-[0_4px_12px_rgba(15,23,24,0.08)] transition-all">
            <div className="learning-content">
              {sections.length > 0 ? (
                sections.map((sec: any, idx: number) => (
                  <div key={sec.id ?? idx}>{renderSectionContent(sec)}</div>
                ))
              ) : (
                <>
                  <h2 className="text-[24px] font-bold text-on-surface mt-[2.5rem] mb-[1rem]" style={{ lineHeight: '1.4' }}>What is an API?</h2>
                  <p className="font-body-md text-[17px] leading-[1.7] max-w-[65ch] text-on-surface mb-[1.5rem]">
                    In software development, an <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono text-[0.9em] font-semibold">API</span> (Application Programming Interface) is a set of protocols and tools that allows different software applications to communicate with each other. It acts as an intermediary, processing data requests and returning responses.
                  </p>
                  <p className="font-body-md text-[17px] leading-[1.7] max-w-[65ch] text-on-surface mb-[1.5rem]">
                    Imagine a restaurant menu: you (the client) look at the menu, place an order with the waiter (the API), and the kitchen (the server) prepares the food. You don't need to know how the kitchen cooks the food; you only need to know how to place the order and what to expect in return.
                  </p>
                  <h2 className="text-[24px] font-bold text-on-surface mt-[2.5rem] mb-[1rem]" style={{ lineHeight: '1.4' }}>The Fundamentals of REST</h2>
                  <p className="font-body-md text-[17px] leading-[1.7] max-w-[65ch] text-on-surface mb-[1.5rem]">
                    A <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono text-[0.9em] font-semibold">REST API</span> (Representational State Transfer) is a specific architectural style for building web services. It uses standard HTTP methods to perform operations on resources. These resources are identified by specific URLs, often referred to as an <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono text-[0.9em] font-semibold">Endpoint</span>.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Bottom Navigation (Lesson context) */}
          <div className="flex justify-between items-center mt-8 border-t border-outline-variant pt-6">
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-low transition-colors font-semibold text-[14px] group">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">arrow_back</span>
              <div>
                <div className="text-[12px] text-on-surface-variant text-left">Bài trước</div>
                <div>HTTP Basics</div>
              </div>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-[14px] group">
              <div className="text-right">
                <div className="text-[12px] text-white/80">Tiếp theo</div>
                <div>JSON Data Structures</div>
              </div>
              <span className="material-symbols-outlined text-white">arrow_forward</span>
            </button>
          </div>

        </div>

        {/* Right Column (Sticky Sidebar - approx 25%) */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-24 flex flex-col gap-4">
            
            {/* Action Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-4 shadow-sm">
              <button 
                onClick={markComplete}
                disabled={marked}
                className="w-full flex justify-center items-center gap-2 bg-primary text-white py-3 px-4 rounded-lg font-semibold text-[14px] hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: marked ? "'FILL' 1" : "'FILL' 0" }}>check_circle</span>
                {marked ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
              </button>
              <button className="w-full flex justify-center items-center gap-2 border border-outline-variant text-on-surface py-3 px-4 rounded-lg font-semibold text-[14px] hover:bg-surface-container-low transition-all">
                <span className="material-symbols-outlined">bookmark_add</span>
                Lưu từ vựng
              </button>
            </div>
            
            {/* Lesson Index / Sections */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low">
                <h3 className="font-semibold text-[14px] text-on-surface">Nội dung bài học</h3>
              </div>
              <div className="flex flex-col">
                <a className="flex items-start gap-2 p-4 hover:bg-surface-container-low transition-colors border-l-2 border-transparent" href="#">
                  <span className="material-symbols-outlined text-green-600 text-[20px] mt-[2px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <div>
                    <div className="text-[12px] text-on-surface-variant">Phần 1</div>
                    <div className="font-semibold text-[14px] text-on-surface">What is an API?</div>
                  </div>
                </a>
                <a className="flex items-start gap-2 p-4 bg-primary/10 border-l-2 border-primary transition-colors" href="#">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-[2px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                  <div>
                    <div className="text-[12px] text-primary">Phần 2</div>
                    <div className="font-semibold text-[14px] text-primary">The Fundamentals of REST</div>
                  </div>
                </a>
                <a className="flex items-start gap-2 p-4 hover:bg-surface-container-low transition-colors border-l-2 border-transparent opacity-70" href="#">
                  <span className="material-symbols-outlined text-outline text-[20px] mt-[2px]">lock</span>
                  <div>
                    <div className="text-[12px] text-on-surface-variant">Phần 3</div>
                    <div className="font-semibold text-[14px] text-on-surface">Endpoints & Methods</div>
                  </div>
                </a>
                <a className="flex items-start gap-2 p-4 hover:bg-surface-container-low transition-colors border-l-2 border-transparent opacity-70" href="#">
                  <span className="material-symbols-outlined text-outline text-[20px] mt-[2px]">lock</span>
                  <div>
                    <div className="text-[12px] text-on-surface-variant">Phần 4</div>
                    <div className="font-semibold text-[14px] text-on-surface">Quiz: API Vocabulary</div>
                  </div>
                </a>
              </div>
            </div>

            {/* AI Context Widget */}
            <div className="border border-secondary bg-secondary/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-secondary">psychology</span>
                <span className="font-bold text-[12px] uppercase tracking-[0.05em] text-secondary">AI ASSISTANT</span>
              </div>
              <p className="text-[12px] text-on-surface-variant">
                Bạn đang gặp khó khăn với thuật ngữ <span className="font-mono text-primary">Endpoint</span>? 
              </p>
              <button className="mt-2 text-secondary font-semibold text-[14px] hover:underline">Xem giải thích đơn giản hơn</button>
            </div>

          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
