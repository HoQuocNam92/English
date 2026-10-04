'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';
import { LessonExperience, type Lesson } from '../../../../../(learner)/learn/lessons/[id]/lesson-experiences';

export default function AdminLessonPreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  useEffect(() => {
    let current = true;
    apiClient.get<Lesson>(`/lessons/${id}`).then(data => { if (current) setLesson(data); }).catch((cause: any) => { if (current) setError(cause?.message ?? 'Không thể xem trước bài học.'); }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [id]);
  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-6"><div className="flex flex-wrap items-center justify-between gap-3"><Link href="/admin/lessons?type=certification_review" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft size={16} />Quản lý bài học</Link><Link href={`/admin/lessons/editor?id=${id}`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"><Pencil size={15} />Chỉnh sửa bài học</Link></div><p className="rounded-xl bg-primary/5 p-4 text-sm text-primary">Xem trước nội dung người học. Bạn có thể bôi đen từ/cụm từ để kiểm tra dịch nghĩa.</p>{loading ? <LoadingSpinner /> : error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p> : lesson && <LessonExperience lesson={lesson} />}</main>;
}
