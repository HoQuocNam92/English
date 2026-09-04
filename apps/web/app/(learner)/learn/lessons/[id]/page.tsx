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
        <h2 className="text-lg font-bold text-slate-900 mt-4">
          {content.text ?? content.heading ?? String(content)}
        </h2>
      );

    case 'rich_text':
      return (
        <div
          className="prose prose-sm max-w-none text-slate-700 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: content.html ?? `<p>${content.text ?? content.body ?? String(content)}</p>`,
          }}
        />
      );

    case 'code': {
      const lang = content.language ?? '';
      const code = content.code ?? content.text ?? String(content);
      return (
        <pre className="bg-slate-900 text-green-400 text-xs p-4 rounded-xl overflow-x-auto">
          <code>{code}</code>
          {lang && <span className="block text-right text-slate-500 text-[10px] mt-1">{lang}</span>}
        </pre>
      );
    }

    case 'image':
      return content.url ? (
        <figure className="my-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.url}
            alt={content.alt ?? ''}
            className="rounded-xl w-full max-h-72 object-cover border border-slate-200"
          />
          {content.caption && (
            <figcaption className="text-center text-xs text-slate-500 mt-1">{content.caption}</figcaption>
          )}
        </figure>
      ) : null;

    case 'callout':
      return (
        <div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 rounded-r-xl text-sm text-amber-900">
          {content.text ?? content.body ?? String(content)}
        </div>
      );

    case 'vocabulary_list': {
      const items: any[] = content.items ?? [];
      return items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.map((v: any, i: number) => (
            <div key={i} className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <span className="font-bold text-primary text-sm">{v.term}</span>
              {v.ipa && <span className="ml-1 text-xs text-slate-400">/{v.ipa}/</span>}
              <p className="text-xs text-slate-600 mt-0.5">{v.definition ?? v.definitionVi ?? ''}</p>
            </div>
          ))}
        </div>
      ) : null;
    }

    case 'audio':
      return content.url ? (
        <audio controls className="w-full mt-2">
          <source src={content.url} />
        </audio>
      ) : null;

    case 'video':
      return content.url ? (
        <video controls className="w-full rounded-xl mt-2 max-h-72">
          <source src={content.url} />
        </video>
      ) : null;

    default:
      // Fallback: if content is a plain string or has a text field
      if (typeof content === 'string') {
        return <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{content}</p>;
      }
      if (content.text) {
        return <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{content.text}</p>;
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
        <div className="text-center text-red-500 py-8">
          <p>{error || 'Không tìm thấy bài học.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm"
          >
            Thử lại
          </button>
        </div>
      </LearnerShell>
    );

  // Vocabulary: API trả về lesson.vocabularies = [{id, order, vocabulary: {term, definitionVi, definitionEn, pronunciationIpa}}]
  const vocabRelations: any[] = lesson.vocabularies ?? lesson.vocabulary ?? [];
  const terms = vocabRelations.map((rel: any) => rel.vocabulary ?? rel);

  // Sections sorted by order
  const sections: any[] = [...(lesson.sections ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const levelBadge = lesson.level?.name ?? lesson.level?.code ?? null;
  const domainBadge = lesson.domain?.name ?? lesson.domain?.code ?? null;
  const estimatedMin = lesson.estimatedMinutes;

  return (
    <LearnerShell>
      <div className="flex flex-col gap-6">
        {/* Breadcrumb & Top Bar */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Link href="/learn/lessons" className="hover:text-primary transition-colors">
              Lộ trình học
            </Link>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-primary font-semibold truncate max-w-xs">{lesson.title}</span>
          </nav>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={markComplete}
              disabled={marked}
              className={`px-4 py-2 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors ${
                marked
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{marked ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}</span>
            </button>
            <Link
              href={`/learn/flashcards/${lesson.id}`}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors border border-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]">style</span>
              <span>Học Flashcards</span>
            </Link>
            <Link
              href={`/learn/quiz/${lesson.id}`}
              className="px-4 py-2 bg-primary hover:bg-indigo-700 !text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] !text-white">quiz</span>
              <span className="!text-white">Làm Quiz</span>
            </Link>
          </div>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-2 text-[11px]">
          {domainBadge && (
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              {domainBadge}
            </span>
          )}
          {levelBadge && (
            <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
              {levelBadge}
            </span>
          )}
          {estimatedMin && (
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">schedule</span>
              {estimatedMin} phút
            </span>
          )}
        </div>

        {/* 2-Column Reader Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Theory Content (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4">
              <h1 className="text-xl lg:text-2xl font-extrabold text-on-surface tracking-tight">
                {lesson.title}
              </h1>
              {lesson.summary && (
                <p className="text-xs lg:text-sm text-on-surface-variant leading-relaxed p-3.5 bg-surface-bright rounded-xl border border-outline-variant/30">
                  {lesson.summary}
                </p>
              )}
              {lesson.description && lesson.description !== lesson.summary && (
                <p className="text-xs lg:text-sm text-on-surface-variant leading-relaxed">
                  {lesson.description}
                </p>
              )}

              {/* Formatted Reading Content */}
              {sections.length > 0 ? (
                <div className="pt-4 border-t border-outline-variant/30 space-y-4">
                  {sections.map((sec: any, idx: number) => (
                    <div key={sec.id ?? idx}>{renderSectionContent(sec)}</div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 pt-4 border-t border-outline-variant/30">
                  Bài học này chưa có nội dung.
                </p>
              )}
            </div>
          </div>

          {/* Right Vocabulary Glossary Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-2xs space-y-4 sticky top-24">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                <h3 className="text-sm font-bold text-on-surface">Thuật ngữ trong bài</h3>
                <span className="text-xs text-primary font-bold">{terms.length} từ vựng</span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {terms.length === 0 && (
                  <p className="text-xs text-slate-500">Chưa có từ vựng cho bài học này.</p>
                )}
                {terms.map((t: any, idx: number) => (
                  <div
                    key={t.id ?? idx}
                    className="p-3.5 rounded-xl bg-surface-bright border border-outline-variant/40 space-y-1.5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm font-bold text-primary">{t.term}</span>
                      {t.partOfSpeech && (
                        <span className="text-[10px] text-slate-500 italic shrink-0">{t.partOfSpeech}</span>
                      )}
                    </div>
                    {t.pronunciationIpa && (
                      <p className="text-[11px] text-slate-400">/{t.pronunciationIpa}/</p>
                    )}
                    <p className="text-xs font-semibold text-on-surface m-0">
                      {t.definitionVi ?? t.definitionEn ?? t.definition ?? ''}
                    </p>
                    {t.definitionEn && t.definitionVi && (
                      <p className="text-[11px] text-slate-500 italic">{t.definitionEn}</p>
                    )}
                  </div>
                ))}
              </div>

              {terms.length > 0 && (
                <Link
                  href={`/learn/flashcards/${lesson.id}`}
                  className="w-full py-2 text-center text-xs font-bold text-primary border border-primary/30 hover:bg-primary/5 rounded-xl block transition-colors"
                >
                  Luyện tất cả với Flashcard →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
