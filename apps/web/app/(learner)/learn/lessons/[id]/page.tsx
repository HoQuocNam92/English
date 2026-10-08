'use client';
import { BackButton } from '@/shared/ui/BackButton';
import { AppIcon } from '@/shared/ui/AppIcon';

import { use, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { lessonTrackByType } from '@/shared/lib/lesson-tracks';
import { LessonExperience, type Lesson } from './lesson-experiences';

export default function LearnerLessonDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let current = true;
    Promise.all([apiClient.get<Lesson>(`/lessons/${id}`), apiClient.get<any>('/progress/me').catch(() => null)]).then(([item, progress]) => {
      if (!current) return;
      setLesson(item);
      const records = progress?.progress ?? progress?.history ?? [];
      setCompleted(Array.isArray(records) && records.some((record: any) => record.resourceType === 'lesson' && record.resourceId === id && (record.status === 'completed' || record.completionPercent >= 100)));
    }).catch(cause => { if (current) setError(cause?.message ?? 'Không thể tải bài học.'); }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [id]);

  const finish = async () => {
    setSaving(true); setError('');
    try { await apiClient.post('/progress/me', { resourceType: 'lesson', resourceId: id, status: 'completed', completionPercent: 100 }); setCompleted(true); }
    catch (cause: any) { setError(cause?.message ?? 'Không thể ghi nhận tiến độ.'); }
    finally { setSaving(false); }
  };

  if (loading) return <LearnerShell><div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div></LearnerShell>;
  if (!lesson) return <LearnerShell><div className="rounded-2xl bg-red-50 p-8 text-center text-red-700">{error || 'Không tìm thấy bài học.'}</div></LearnerShell>;

  const track = lessonTrackByType(lesson.type);
  const fallbackUrl = searchParams?.get('from') ?? (track ? `/learn/lessons?type=${track.type}` : lesson.type === 'certification_review' ? '/learn/certifications' : lesson.type === 'vocabulary' ? '/learn/flashcards' : '/learn/lessons');
  const backLabel = track?.label ?? 'học tập';

  return (
    <LearnerShell>
      <article className="w-full pb-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackButton fallbackHref={fallbackUrl}>Quay lại {backLabel}</BackButton>
          <button
            type="button"
            onClick={() => void finish()}
            disabled={completed || saving}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black text-white shadow-sm transition-all disabled:opacity-80 cursor-pointer ${
              completed ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary/90'
            }`}
          >
            <AppIcon className="text-[17px]">check_circle</AppIcon>
            {saving ? 'Đang lưu...' : completed ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
          </button>
        </div>
        {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <div data-learning-content className="mt-5"><LessonExperience lesson={lesson} /></div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-outline-variant/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${completed ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary'}`}>
              <AppIcon className="text-[22px]">{completed ? 'check_circle' : 'menu_book'}</AppIcon>
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">{completed ? 'Đã hoàn thành bài học' : 'Hoàn thành bài học'}</p>
              <p className="text-xs text-on-surface-variant">{completed ? 'Tiến độ học tập đã được lưu vào hệ thống.' : 'Xác nhận hoàn thành sau khi đã đọc và hiểu nội dung bài học.'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void finish()}
            disabled={completed || saving}
            className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-white shadow-sm transition-all disabled:opacity-80 cursor-pointer ${
              completed ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary/90'
            }`}
          >
            <AppIcon className="">check_circle</AppIcon>
            {saving ? 'Đang lưu...' : completed ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
          </button>
        </div>
      </article>
    </LearnerShell>
  );
}
