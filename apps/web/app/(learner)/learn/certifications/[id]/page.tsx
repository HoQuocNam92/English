'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Check, ChevronDown, ChevronRight, Clock3, FileQuestion, Flag, Play, Trophy } from 'lucide-react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';

type Tab = 'learn' | 'exams';

export default function CertificationDetailPage() {
  const params = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('learn');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [certificate, setCertificate] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [certificateResult, progressResult] = await Promise.all([
          apiClient.get(`/certificates/${params.id}`),
          apiClient.get('/progress/me'),
        ]);
        const cert = (certificateResult as any)?.data ?? certificateResult;
        setCertificate(cert);
        setProgress(progressResult);
        setExpanded([]);
      } catch (cause: any) {
        setError(cause?.message || 'Không thể tải dữ liệu chứng chỉ');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) void load();
  }, [params.id]);

  const domains = useMemo(() => (certificate?.domains ?? []).map((item: any, index: number) => {
    const domain = item.domain;
    const topics = (item.certificationTopics ?? []).map((topic: any) => ({ ...topic }));
    const totalQuestions = topics.reduce((sum: number, t: any) => sum + Number(t._count?.questions ?? 0), 0);
    return { id: domain.id, number: index + 1, name: domain.name, weightPercent: item.weightPercent, topics, totalQuestions };
  }), [certificate]);

  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;
  if (error || !certificate) return <LearnerShell><div className="p-8 text-center text-error">{error || 'Không tìm thấy chứng chỉ'}</div></LearnerShell>;

  const certProgress = (progress?.certProgress ?? []).find((item: any) => item.certificateId === certificate.id);
  const completionPercent = Math.round(certProgress?.completionPercent ?? 0);
  const completedCount = certProgress?.completedLessons ?? 0;
  const totalCount = certProgress?.totalLessons ?? 0;
  const attempts = (progress?.recentAttempts ?? []).filter((item: any) => certificate.exams?.some((exam: any) => exam.id === item.examId));
  const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
    { id: 'learn', label: 'Học', icon: BookOpen },
    { id: 'exams', label: 'Thi thử', icon: FileQuestion },
  ];

  return <LearnerShell><main className="min-h-screen bg-background pb-16">
    <section className="border-b border-outline-variant bg-surface-container-lowest"><div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/learn/certifications" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary"><ArrowLeft size={17} /> Tất cả chứng chỉ</Link>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary text-sm font-black text-white shadow-sm">{certificate.provider?.slice(0, 3).toUpperCase() || 'CERT'}</div>
        <div><div className="mb-2 flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold ${completionPercent > 0 ? 'bg-primary-light text-primary' : 'bg-surface-container text-on-surface-variant'}`}>{completionPercent > 0 ? 'ĐANG ÔN LUYỆN' : 'CHƯA BẮT ĐẦU'}</span><span className="text-sm font-semibold text-on-surface-variant">{certificate.code}</span></div><h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">{certificate.name}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">{certificate.description}</p></div>
      </div><div className="w-full rounded-xl border border-outline-variant bg-surface-container-low p-4 lg:w-72"><div className="mb-2 flex items-end justify-between"><span className="text-sm font-semibold">Tiến độ tổng thể</span><span className="text-2xl font-bold text-primary">{completionPercent}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-surface-container-highest"><div className="h-full rounded-full bg-primary" style={{ width: `${completionPercent}%` }} /></div><p className="mt-2 text-xs text-on-surface-variant">{completedCount}/{totalCount} nội dung đã hoàn thành</p></div></div>
    </div></section>
    <div className="sticky top-0 z-10 border-b border-outline-variant bg-surface-container-lowest/95 backdrop-blur"><nav className="mx-auto flex max-w-6xl gap-1 px-4 sm:px-6 lg:px-8">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActiveTab(id)} className={`relative flex min-h-14 flex-1 items-center justify-center gap-2 px-4 text-sm font-bold sm:flex-none sm:min-w-40 ${activeTab === id ? 'text-primary' : 'text-on-surface-variant'}`}><Icon size={18} />{label}{activeTab === id && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />}</button>)}</nav></div>
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {activeTab === 'learn' && <LearnTab domains={domains} exams={certificate.exams ?? []} progress={progress} expanded={expanded} setExpanded={setExpanded} certProgress={certProgress} completedCount={completedCount} attempts={attempts} />}
      {activeTab === 'exams' && <ExamsTab exams={certificate.exams ?? []} attempts={attempts} />}
    </div>
  </main></LearnerShell>;
}

function LearnTab({ domains, exams, progress, expanded, setExpanded, certProgress, completedCount, attempts }: any) {
  return <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
    <section>
      <p className="text-sm font-bold uppercase tracking-wider text-primary">Lộ trình học tập</p>
      <h2 className="mt-1 text-2xl font-bold">Nội dung theo chứng chỉ</h2>
      <p className="mt-2 text-sm text-on-surface-variant">Mỗi Topic có nút làm Quiz riêng.</p>
      <div className="mt-5 space-y-4">
        {domains.map((domain: any) => {
          const isOpen = expanded.includes(domain.id);
          return <article key={domain.id} className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <button onClick={() => setExpanded((current: string[]) => current.includes(domain.id) ? current.filter((id) => id !== domain.id) : [...current, domain.id])} className="flex w-full items-center gap-4 p-5 text-left hover:bg-surface-container-low">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-light text-sm font-bold text-primary">{domain.number}</div>
              <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h3 className="font-bold">Domain {domain.number} — {domain.name}</h3><span className="text-sm font-bold text-primary">{domain.totalQuestions} câu hỏi</span></div><span className="mt-2 block text-xs text-on-surface-variant">{domain.weightPercent}% bài thi</span></div>
              {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {isOpen && <div className="border-t border-outline-variant px-5 py-2">{domain.topics.length ? domain.topics.map((topic: any) => {
              const practiceExam = exams.find((exam: any) => exam.kind === 'practice' && (exam.topics ?? []).includes(topic.code));
              return <div key={topic.id} className="flex flex-col gap-3 border-b border-outline-variant/60 py-4 last:border-0 sm:flex-row sm:items-center">
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-outline-variant`}><span className="h-2 w-2 rounded-full bg-current" /></span>
                <div className="min-w-0 flex-1"><strong className="block text-sm">{topic.name}</strong><span className="mt-1 block text-xs text-on-surface-variant">Từ vựng · {topic._count?.questions ?? 0} câu Quiz</span></div>
                <div className="flex shrink-0 gap-2">
                  {practiceExam ? <Link href={`/learn/quiz/${practiceExam.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white"><Play size={15} />Làm Quiz</Link> : <span className="rounded-lg bg-surface-container px-3 py-2 text-xs text-on-surface-variant">Chưa có Quiz</span>}
                </div>
              </div>;
            }) : <p className="py-5 text-sm text-on-surface-variant">Domain này chưa được cấu hình nội dung.</p>}</div>}
          </article>;
        })}
        {!domains.length && <p className="rounded-xl border border-dashed p-6 text-sm text-on-surface-variant">Chứng chỉ chưa được cấu hình Domain.</p>}
      </div>
    </section>
    <aside className="space-y-4"><div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5"><h3 className="font-bold">Kết quả thực tế</h3><div className="mt-4 grid grid-cols-3 gap-2 text-center">{[[String(completedCount ?? 0), 'Hoàn thành'], [String(attempts?.length ?? 0), 'Lượt thi'], [certProgress?.avgScore == null ? '—' : `${certProgress.avgScore}%`, 'Điểm TB']].map(([value, label]) => <div key={label} className="rounded-lg bg-surface-container-low p-3"><strong className="block text-lg text-primary">{value}</strong><span className="text-xs text-on-surface-variant">{label}</span></div>)}</div></div></aside>
  </div>;
}



function ExamsTab({ exams, attempts }: any) {
  const mockExams = exams.filter((exam: any) => exam.kind === 'mock_exam');
  return <section><p className="text-sm font-bold uppercase tracking-wider text-primary">Thi thử</p><h2 className="mt-1 text-2xl font-bold">Mô phỏng kỳ thi</h2><p className="mt-2 text-sm text-on-surface-variant">Không gợi ý, không dịch và không hiển thị từ vựng khi thi.</p><div className="mt-6 space-y-4">{mockExams.length ? mockExams.map((exam: any) => { const attempt = attempts.find((item: any) => item.examId === exam.id); return <article key={exam.id} className="flex flex-col gap-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 sm:flex-row sm:items-center"><div className={`grid h-14 w-14 place-items-center rounded-xl ${attempt ? 'bg-primary text-white' : 'bg-surface-container-low text-primary'}`}>{attempt ? <Trophy size={25} /> : <FileQuestion size={25} />}</div><div className="flex-1"><h3 className="text-lg font-bold">{exam.title}</h3><div className="mt-2 flex flex-wrap gap-4 text-sm text-on-surface-variant"><span className="flex items-center gap-1"><FileQuestion size={15} />{exam._count?.questions ?? 0} câu</span><span className="flex items-center gap-1"><Clock3 size={15} />{exam.durationMinutes} phút</span><span className="flex items-center gap-1"><Flag size={15} />Đạt {exam.passingScorePercent}%</span></div></div>{attempt ? <Link href={`/learn/quiz/result/${attempt.id}`} className="rounded-lg border border-primary px-4 py-2.5 text-sm font-bold text-primary">Xem kết quả {Math.round(attempt.scorePercent ?? 0)}%</Link> : <Link href={`/learn/quiz/${exam.id}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white"><Play size={16} /> Bắt đầu</Link>}</article>; }) : <p className="rounded-xl border border-dashed p-6 text-sm text-on-surface-variant">Chưa có đề thi thử.</p>}</div></section>;
}
