'use client';
import { AppIcon } from '@/shared/ui/AppIcon';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { lessonTrackByType } from '@/shared/lib/lesson-tracks';
import { LessonExperience, type Lesson } from './lesson-experiences';

export default function LearnerLessonDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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
  const backUrl = track ? `/learn/lessons?type=${track.type}` : lesson.type === 'certification_review' ? '/learn/certifications' : lesson.type === 'vocabulary' ? '/learn/flashcards' : '/learn/lessons';
  return <LearnerShell><article className="mx-auto max-w-6xl pb-16"><Link href={backUrl} className="inline-flex items-center gap-1 text-sm font-bold text-primary"><AppIcon className=" text-[18px]">arrow_back</AppIcon>Quay lại {track?.label ?? 'học tập'}</Link>
    {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
    <div className="mt-5"><LessonExperience lesson={lesson} /></div>
    <div className="sticky bottom-4 mt-7 flex justify-end"><button onClick={() => void finish()} disabled={completed || saving} className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-white shadow-lg disabled:opacity-80 ${completed ? 'bg-emerald-600' : 'bg-primary'}`}><AppIcon className="">check_circle</AppIcon>{saving ? 'Đang lưu...' : completed ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}</button></div>
  </article></LearnerShell>;
}
