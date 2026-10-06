'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, FileQuestion, ArrowLeft } from 'lucide-react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';
import { LessonExperience } from '../../../../lessons/[id]/lesson-experiences';

export default function CertificateTopicStudy({ params }: { params: Promise<{ id: string; topicId: string }> }) {
  const { id, topicId } = use(params);
  const [topic, setTopic] = useState<any>(null);
  const [activeId, setActiveId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const saveLock = useRef(false);
  const startRequests = useRef(new Map<string, Promise<unknown>>());
  const load = useCallback(async () => {
    try {
      const data: any = await apiClient.get(`/certification-study/topics/${topicId}`);
      if (data.certificate.id !== id) throw new Error('Chủ đề không thuộc chứng chỉ này.');
      setTopic(data);
      setActiveId(previous => previous || data.lessons.find((lesson: any) => lesson.progress?.status !== 'completed')?.id || data.lessons[0]?.id || '');
    } catch (cause: any) { setError(cause?.message ?? 'Không thể tải bài học.'); }
    finally { setLoading(false); }
  }, [id, topicId]);
  useEffect(() => { void load(); }, [load]);

  const lesson = topic?.lessons.find((item: any) => item.id === activeId);
  const completed = topic?.lessons.filter((item: any) => item.progress?.status === 'completed').length ?? 0;
  const ready = topic?.lessons.length > 0 && completed === topic.lessons.length;
  const practiceExams = (topic?.exams ?? []).filter((exam: any) => exam._count.questions > 0);
  const primaryQuiz = practiceExams[0];
  const quizHref = primaryQuiz ? `/learn/quiz/${primaryQuiz.id}?certificateId=${id}&topicId=${topicId}` : '';
  useEffect(() => {
    if (!lesson || lesson.progress) return;
    let current = true;
    const started = apiClient.post('/progress/me', { resourceType: 'lesson', resourceId: lesson.id, status: 'in_progress', completionPercent: 0 });
    startRequests.current.set(lesson.id, started);
    started.then(progress => {
      if (current) setTopic((previous: any) => ({ ...previous, lessons: previous.lessons.map((item: any) => item.id === lesson.id && !item.progress ? { ...item, progress } : item) }));
    }).catch((cause: any) => { if (current) setError(cause?.message ?? 'Chưa ghi nhận được tiến độ.'); });
    return () => { current = false; };
  }, [lesson?.id]);

  const finish = async () => {
    if (!lesson || saveLock.current) return;
    saveLock.current = true; setSaving(true); setError('');
    try {
      await startRequests.current.get(lesson.id)?.catch(() => undefined);
      const progress = await apiClient.post('/progress/me', { resourceType: 'lesson', resourceId: lesson.id, status: 'completed', completionPercent: 100 });
      setTopic((previous: any) => ({ ...previous, lessons: previous.lessons.map((item: any) => item.id === lesson.id ? { ...item, progress } : item) }));
      const next = topic.lessons.find((item: any) => item.id !== lesson.id && item.progress?.status !== 'completed');
      if (next) { setActiveId(next.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    } catch (cause: any) { setError(cause?.message ?? 'Chưa lưu được tiến độ. Vui lòng thử lại.'); }
    finally { saveLock.current = false; setSaving(false); }
  };

  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;
  if (!topic) return <LearnerShell><div className="p-8 text-center"><p>{error}</p><Link href={`/learn/certifications/${id}`} className="text-primary">Về chứng chỉ</Link></div></LearnerShell>;
  return <LearnerShell><main className="w-full space-y-6 py-6 pb-16">
    <Link href={`/learn/certifications/${id}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary"><ArrowLeft size={16} />{topic.certificate.name}</Link>
    <header className="rounded-2xl border border-outline-variant bg-white p-6"><p className="text-xs font-bold uppercase text-primary">{topic.domain.name} · Chủ đề {topic.code}</p><h1 className="mt-2 text-2xl font-bold">{topic.name}</h1>{topic.description && <p className="mt-2 text-sm leading-6 text-on-surface-variant">{topic.description}</p>}<div className="mt-4 flex flex-wrap gap-4 text-sm"><span className="flex items-center gap-2"><BookOpen size={16} />{completed}/{topic.lessons.length} bài học hoàn thành</span></div></header>
    {ready && primaryQuiz && <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><div><h2 className="font-bold text-emerald-800">Đã hoàn thành kiến thức chủ đề</h2><p className="mt-1 text-sm text-emerald-700">Làm Quiz để kiểm tra những gì bạn vừa học.</p></div><Link href={quizHref} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white"><FileQuestion size={18} />Làm Quiz · {primaryQuiz._count.questions} câu</Link></section>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <div className="grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] [scrollbar-color:#c7c4d8_transparent]"><section className="rounded-2xl border border-outline-variant bg-white p-4"><h2 className="mb-3 font-bold">Bài học kiến thức</h2><div className="space-y-2">{topic.lessons.map((item: any, index: number) => <button key={item.id} disabled={saving} onClick={() => setActiveId(item.id)} className={`w-full rounded-xl p-3 text-left text-sm ${item.id === activeId ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50'}`}><span className="flex items-start gap-2">{item.progress?.status === 'completed' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" /> : <span className="font-bold">{index + 1}.</span>}<span>{item.title}<span className="mt-1 block text-xs text-slate-500">{item.estimatedMinutes} phút</span></span></span></button>)}</div></section>
      <section className="rounded-2xl border border-outline-variant bg-white p-4"><h2 className="flex items-center gap-2 font-bold"><FileQuestion size={17} />Luyện câu hỏi</h2><p className="mt-2 text-xs leading-5 text-slate-500">{ready ? 'Đã học xong kiến thức. Bắt đầu Quiz hoặc đọc lại phần cần củng cố.' : 'Hoàn thành bài học của chủ đề trước khi làm Quiz.'}</p><div className="mt-3 space-y-2">{practiceExams.map((exam: any) => ready ? <Link key={exam.id} href={`/learn/quiz/${exam.id}?certificateId=${id}&topicId=${topicId}`} className="block rounded-xl bg-primary p-3 text-center text-sm font-bold text-white">Làm Quiz · {exam.title} · {exam._count.questions} câu</Link> : <button key={exam.id} disabled className="w-full rounded-xl bg-slate-100 p-3 text-sm text-slate-500">Quiz · {exam._count.questions} câu</button>)}{!practiceExams.length && <p className="text-xs text-slate-500">Chưa có Quiz cho chủ đề.</p>}</div></section></aside>
      <div>{lesson ? <><LessonExperience lesson={lesson} /><div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-outline-variant bg-white p-5"><p className="text-sm text-slate-500">{lesson.progress?.status === 'completed' ? 'Bạn có thể đọc lại bài và luyện Quiz.' : 'Đọc kiến thức, ví dụ và phần giải thích trước khi hoàn thành.'}</p><div className="flex flex-wrap items-center gap-3">{ready && primaryQuiz && <Link href={quizHref} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white"><FileQuestion size={18} />Làm Quiz</Link>}<button onClick={() => void finish()} disabled={saving || lesson.progress?.status === 'completed'} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Đang lưu…' : lesson.progress?.status === 'completed' ? 'Đã hoàn thành bài học' : 'Hoàn thành bài học'}</button></div></div></> : <div className="rounded-2xl border border-dashed border-outline-variant bg-white p-8 text-center"><h2 className="font-bold">Chủ đề chưa có bài học kiến thức</h2><p className="mt-2 text-sm text-slate-500">Nội dung cần được quản trị viên biên soạn và xuất bản.</p></div>}</div>
    </div>
  </main></LearnerShell>;
}
