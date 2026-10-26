'use client';
import { certificateProgressExplanation } from '../../../../../../../packages/shared-kernel/src/lesson-presentation';
import { PaginatedList } from '@/shared/ui/PaginatedList';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Award, BookOpen, Check, ChevronDown, ChevronRight, Clock3, FileQuestion, Layers3, Play, Trophy } from 'lucide-react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';

type Tab = 'learn' | 'exams';

export default function CertificationDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const selectedExamId = searchParams.get('examId') ?? '';
  const [activeTab, setActiveTab] = useState<Tab>('learn');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [certificate, setCertificate] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [examStates, setExamStates] = useState<Record<string, any>>({});
  const [studyProgress, setStudyProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('tab') === 'exams' || selectedExamId) setActiveTab('exams');
  }, [searchParams, selectedExamId]);

  useEffect(() => {
    async function load() {
      try {
        const [certificateResult, progressResult, studyResult] = await Promise.all([
          apiClient.get(`/certificates/${params.id}`),
          apiClient.get('/progress/me'),
          apiClient.get(`/certification-study/certificates/${params.id}/progress`),
        ]);
        const cert = (certificateResult as any)?.data ?? certificateResult;
        const states = await Promise.all((cert?.exams ?? []).filter((exam: any) => exam.status === 'published').map(async (exam: any) => [exam.id, await apiClient.get(`/exams/${exam.id}/eligibility`)]));
        setExamStates(Object.fromEntries(states));
        setError('');
        setCertificate(cert);
        setProgress(progressResult);
        setStudyProgress(studyResult);

      } catch (cause: any) {
        setError(cause?.message || 'Không thể tải dữ liệu chứng chỉ');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) void load();
    const refresh = () => { if (params.id) void load(); };
    window.addEventListener('focus', refresh);
    const timer = window.setInterval(refresh, 60000);
    return () => { window.removeEventListener('focus', refresh); window.clearInterval(timer); };
  }, [params.id]);

  useEffect(() => {
    if (!loading && activeTab === 'exams' && selectedExamId) {
      document.getElementById(`exam-${selectedExamId}`)?.scrollIntoView({ block: 'start' });
    }
  }, [loading, activeTab, selectedExamId]);

  const domains = useMemo(() => (certificate?.domains ?? []).map((item: any, index: number) => {
    const domain = item.domain;
    const topics = (item.certificationTopics ?? []).map((topic: any) => ({ ...topic }));
    const totalQuestions = topics.reduce((sum: number, t: any) => sum + Number(t._count?.questions ?? 0), 0);
    return { id: domain.id, number: index + 1, name: domain.name, weightPercent: item.weightPercent, topics, totalQuestions };
  }), [certificate]);

  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;
  if (error || !certificate) return <LearnerShell><div className="p-8 text-center text-error">{error || 'Không tìm thấy chứng chỉ'}</div></LearnerShell>;

  const certProgress = (progress?.certProgress ?? []).find((item: any) => item.certificateId === certificate.id);
  const topicProgress = studyProgress?.topics ?? [];
  const completedCount = certProgress?.completedLessons ?? 0;
  const totalCount = certProgress?.totalLessons ?? new Set(topicProgress.flatMap((topic: any) => (topic.lessons ?? []).map((lesson: any) => lesson.id))).size;
  const totalExams = certProgress?.totalExams ?? (certificate.exams ?? []).filter((exam: any) => exam.status === 'published' && exam._count?.questions > 0).length;
  const completionPercent = Math.round(certProgress?.completionPercent ?? 0);
  const hasStarted = Boolean(certProgress?.hasStarted || completionPercent > 0);
  const nextTopic = domains.flatMap((domain: any) => domain.topics).find((topic: any) => {
    const study = topicProgress.find((item: any) => item.topicId === topic.id);
    return study?.total > 0 && study.completed < study.total;
  }) ?? domains.flatMap((domain: any) => domain.topics).find((topic: any) => topicProgress.some((item: any) => item.topicId === topic.id && item.total > 0));
  const publishedExams = (certificate.exams ?? []).filter((exam: any) => exam.status === 'published');
  const completedLessonIds = new Set((progress?.progress ?? []).filter((item: any) => item.resourceType === 'lesson' && (item.status === 'completed' || item.completionPercent >= 100)).map((item: any) => item.resourceId));
  const tabs: { id: Tab; label: string; icon: typeof BookOpen; count: number }[] = [
    { id: 'learn', label: 'Lộ trình học', icon: BookOpen, count: totalCount },
    { id: 'exams', label: 'Bài kiểm tra', icon: FileQuestion, count: totalExams },
  ];

  return <LearnerShell><div className="space-y-7 pb-12">
    <Link href="/learn/certifications" className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-primary"><ArrowLeft size={16} /> Tất cả chứng chỉ</Link>

    <section aria-label="Tổng quan chứng chỉ" className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 lg:p-7">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-bold tracking-wide text-primary">{certificate.code}</span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><span className={`h-1.5 w-1.5 rounded-full ${hasStarted ? 'bg-emerald-500' : 'bg-slate-400'}`} />{hasStarted ? 'Đang ôn luyện' : 'Chưa bắt đầu'}</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-violet-100 text-primary"><Award size={29} strokeWidth={1.7} /></div>
            <div className="min-w-0"><h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">{certificate.name}</h1>{certificate.provider && <p className="mt-2 text-sm text-slate-500">{certificate.provider}</p>}</div>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">{certificate.description || 'Ôn kiến thức, luyện câu hỏi và theo dõi quá trình học của bạn trong cùng một lộ trình.'}</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Layers3 size={15} />{domains.length} chuyên ngành</span>
            <span className="inline-flex items-center gap-1.5"><BookOpen size={15} />{totalCount} bài học</span>
            <span className="inline-flex items-center gap-1.5"><FileQuestion size={15} />{totalExams} bài kiểm tra</span>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {nextTopic ? <Link href={`/learn/certifications/${certificate.id}/topics/${nextTopic.id}`} className="ui-button ui-button-primary"><Play size={16} />{hasStarted ? 'Tiếp tục học' : 'Bắt đầu học'}</Link> : publishedExams.length > 0 ? <button type="button" onClick={() => setActiveTab('exams')} className="ui-button ui-button-primary"><Play size={16} />Làm bài kiểm tra</button> : <span className="text-sm text-slate-500">Nội dung đang được cập nhật.</span>}
            {nextTopic && publishedExams.length > 0 && <button type="button" onClick={() => setActiveTab('exams')} className="inline-flex items-center gap-1.5 px-2 text-sm font-semibold text-slate-600 hover:text-primary">Xem bài kiểm tra<ArrowUpRight size={16} /></button>}
          </div>
        </div>

        <div className="self-start rounded-2xl border border-violet-100 bg-violet-50/60 p-5">
          <div className="flex items-center justify-between gap-4"><span className="text-sm font-semibold text-slate-700">Tiến độ của bạn</span><span className="text-3xl font-bold tracking-tight text-primary">{completionPercent}<span className="ml-0.5 text-lg">%</span></span></div>

          <div className="mt-4 space-y-2.5 text-sm">
            <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-slate-500"><BookOpen size={16} />Bài học</span><span className="font-semibold text-slate-800">{completedCount}<span className="font-normal text-slate-400"> / {totalCount}</span></span></div>
            <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-slate-500"><FileQuestion size={16} />Bài kiểm tra</span><span className="font-semibold text-slate-800">{certProgress?.completedExams ?? 0}<span className="font-normal text-slate-400"> / {totalExams}</span></span></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-violet-100 pt-3"><div><p className="text-lg font-bold text-slate-800">{certProgress?.examAttempts ?? 0}</p><p className="mt-1 text-xs text-slate-500">Lượt thi hoàn thành</p></div><div><p className="text-lg font-bold text-slate-800">{certProgress?.avgScore == null ? '—' : `${certProgress.avgScore}%`}</p><p className="mt-1 text-xs text-slate-500">Điểm trung bình</p></div></div>
          <details className="mt-4 text-xs text-slate-500"><summary className="w-fit cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-primary">Cách tính tiến độ</summary><p className="mt-2 leading-5">{certificateProgressExplanation}</p></details>
        </div>
      </div>
    </section>

    <div className="border-b border-slate-200"><div role="tablist" aria-label="Nội dung chứng chỉ" className="flex gap-6">{tabs.map(({ id, label, icon: Icon, count }) => <button key={id} type="button" role="tab" id={`certificate-tab-${id}`} aria-selected={activeTab === id} aria-controls={`certificate-panel-${id}`} onClick={() => setActiveTab(id)} className={`relative flex items-center gap-2 rounded-none! border-b-2 px-1 py-4 text-sm font-semibold transition-colors ${activeTab === id ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}><Icon size={18} />{label}<span className={`rounded-md px-1.5 py-0.5 text-xs ${activeTab === id ? 'bg-violet-100 text-primary' : 'bg-slate-100 text-slate-500'}`}>{count}</span></button>)}</div></div>
    <div role="tabpanel" id={`certificate-panel-${activeTab}`} aria-labelledby={`certificate-tab-${activeTab}`}>
      {activeTab === 'learn' ? <LearnTab topicProgress={topicProgress} certificateId={certificate.id} domains={domains} expanded={expanded} setExpanded={setExpanded} onExams={() => setActiveTab('exams')} hasExams={publishedExams.length > 0} /> : <ExamsTab completedLessonIds={completedLessonIds} exams={certificate.exams ?? []} examStates={examStates} selectedExamId={selectedExamId} onLearn={() => setActiveTab('learn')} />}
    </div>
  </div></LearnerShell>;
}

function LearnTab({ topicProgress, certificateId, domains, expanded, setExpanded, onExams, hasExams }: any) {
  return <section className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-bold tracking-tight text-slate-900">Lộ trình học</h2><p className="mt-1.5 text-sm leading-6 text-slate-500">Chọn chuyên ngành và học lần lượt theo từng chủ đề.</p></div><span className="text-xs font-medium text-slate-400">{domains.length} chuyên ngành</span></div>
    <div className="space-y-4">
      {domains.map((domain: any) => {
        const isOpen = expanded.includes(domain.id);
        const lessonCount = new Set(domain.topics.flatMap((topic: any) => (topicProgress.find((item: any) => item.topicId === topic.id)?.lessons ?? []).map((lesson: any) => lesson.id))).size;
        return <article key={domain.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <button type="button" aria-expanded={isOpen || !domain.topics.length} aria-controls={`domain-content-${domain.id}`} onClick={() => domain.topics.length > 0 && setExpanded((current: string[]) => current.includes(domain.id) ? current.filter((id) => id !== domain.id) : [...current, domain.id])} className="flex w-full items-center gap-4 rounded-none! p-5 text-left transition-colors hover:bg-slate-50 sm:p-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-sm font-bold text-primary">{String(domain.number).padStart(2, '0')}</span>
            <span className="min-w-0 flex-1"><span className="block text-base font-semibold text-slate-900">{domain.name}</span><span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500"><span>{domain.topics.length} chủ đề</span><span>{lessonCount} bài học</span>{Number(domain.weightPercent) > 0 && <span>Tỷ trọng bài thi: {domain.weightPercent}%</span>}</span></span>
            {domain.topics.length > 0 && <ChevronDown size={19} className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
          </button>
          {(isOpen || !domain.topics.length) && <div id={`domain-content-${domain.id}`} className="border-t border-slate-100 px-5 sm:px-6">{domain.topics.length ? domain.topics.map((topic: any, index: number) => {
            const study = topicProgress.find((item: any) => item.topicId === topic.id);
            const complete = study?.total > 0 && study.completed === study.total;
            return <div key={topic.id} className="flex flex-col gap-3 border-b border-slate-100 py-4 last:border-0 sm:flex-row sm:items-center sm:gap-4">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${complete ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{complete ? <Check size={16} /> : String(index + 1).padStart(2, '0')}</span>
              <div className="min-w-0 flex-1"><h3 className="text-sm font-semibold text-slate-800">{topic.name}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{study?.total > 0 ? `${study.completed ?? 0}/${study.total} bài học hoàn thành` : 'Bài học đang được cập nhật'}{study?.started && !complete ? ' · Đang học' : complete ? ' · Đã hoàn thành' : ''}</p></div>
              <Link href={`/learn/certifications/${certificateId}/topics/${topic.id}`} className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-primary transition-colors hover:border-violet-200 hover:bg-violet-50 sm:self-auto">{complete ? 'Ôn lại' : study?.started ? 'Học tiếp' : 'Xem chủ đề'}<ChevronRight size={15} /></Link>
            </div>;
          }) : <div className="flex flex-col items-start gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm leading-6 text-slate-500">Chưa có chủ đề học trong chuyên ngành này.{hasExams ? ' Bạn có thể luyện tập với các bài kiểm tra đã có.' : ' Nội dung sẽ được bổ sung sau.'}</p>{hasExams && <button type="button" onClick={onExams} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">Xem bài kiểm tra<ChevronRight size={15} /></button>}</div>}</div>}
        </article>;
      })}
      {!domains.length && <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center"><Layers3 className="mx-auto text-slate-300" size={28} /><p className="mt-3 text-sm text-slate-500">Chuyên ngành đang được cập nhật.</p>{hasExams && <button type="button" onClick={onExams} className="mt-3 text-sm font-semibold text-primary">Xem bài kiểm tra hiện có</button>}</div>}
    </div>
  </section>;
}

function ExamsTab({ exams, examStates, selectedExamId, completedLessonIds }: any) {
  const publishedExams = exams.filter((exam: any) => exam.status === 'published').sort((a: any, b: any) =>
    Number(b.id === selectedExamId) - Number(a.id === selectedExamId) ||
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const kindLabels: Record<string, string> = { practice: 'Luyện tập chủ đề', domain_test: 'Kiểm tra chuyên ngành', mock_exam: 'Thi thử chứng chỉ', scenario_assessment: 'Tình huống thực tế' };
  return <section>
    <h2 className="text-xl font-bold tracking-tight text-slate-900">Luyện tập và kiểm tra</h2>
    <p className="mt-1.5 text-sm leading-6 text-slate-500">Luyện tập sau khi học kiến thức, hoặc làm bài kiểm tra chuyên ngành và thi thử độc lập.</p>
    <PaginatedList enabled={publishedExams.length > 0} className="mt-5 grid gap-4 lg:grid-cols-2">
      {publishedExams.length ? publishedExams.map((exam: any) => {
        const state = examStates[exam.id];
        const attempt = state?.latestAttempt;
        const requiredLessonId = state?.requiredLessonIds?.find((lessonId: string) => !completedLessonIds.has(lessonId));
        return <article key={exam.id} id={`exam-${exam.id}`} className={`flex min-w-0 scroll-mt-24 flex-col rounded-2xl border bg-white p-5 sm:p-6 ${exam.id === selectedExamId ? 'border-primary ring-2 ring-primary/15' : attempt ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200'}`}>
          {exam.id === selectedExamId && <p className="mb-3 text-xs font-bold text-primary">Bài kiểm tra bạn vừa chọn</p>}
          <div className="flex items-start gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${attempt ? 'bg-emerald-50 text-emerald-600' : 'bg-violet-50 text-primary'}`}>{attempt ? <Check size={21} /> : <FileQuestion size={21} />}</span><div className="min-w-0"><p className="text-xs font-medium text-slate-500">{kindLabels[exam.kind] || 'Bài kiểm tra'}</p><h3 className="mt-1 text-base font-semibold leading-6 text-slate-900">{exam.title}</h3></div></div>
          {attempt && <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-800"><Check size={16} />Đã làm bài</p>}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500"><span className="flex items-center gap-1.5"><FileQuestion size={14} />{exam._count?.questions ?? 0} câu hỏi</span><span className="flex items-center gap-1.5"><Clock3 size={14} />{exam.durationMinutes} phút</span><span>Đạt từ {exam.passingScorePercent}%</span></div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs"><span className="text-slate-500">Đã làm {state?.usedAttempts ?? 0}/{state?.maxAttempts ?? exam.maxAttempts} lượt</span>{attempt && <span className="rounded-lg bg-violet-50 px-2 py-1 font-semibold text-primary">Kết quả gần nhất: {Math.round(attempt.scorePercent ?? 0)}%</span>}</div>
          {state?.reason && <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-500">{state.reason}</p>}
          <div className="mt-auto pt-5"><div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {state?.canStart ? <Link href={`/learn/quiz/${exam.id}?certificateId=${encodeURIComponent(exam.certificateId)}`} className="ui-button ui-button-primary text-sm"><Play size={15} />{state.activeAttemptId ? 'Tiếp tục' : state.usedAttempts ? 'Làm lại' : 'Bắt đầu'}</Link> : <button type="button" disabled className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-medium text-slate-400">{state?.unavailableLabel || (state?.remainingAttempts === 0 ? 'Hết lượt' : 'Chưa thể làm bài')}</button>}
            {!state?.canStart && requiredLessonId && <Link href={`/learn/lessons/${encodeURIComponent(requiredLessonId)}?from=${encodeURIComponent(`/learn/certifications/${exam.certificateId}?tab=exams&examId=${exam.id}`)}`} className="ui-button ui-button-outline"><BookOpen size={16} />Học bài bắt buộc</Link>}
            {attempt && <Link href={`/learn/quiz/result/${attempt.id}`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Xem kết quả<ArrowUpRight size={14} /></Link>}
          </div></div>
        </article>;
      }) : <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center"><FileQuestion className="mx-auto text-slate-300" size={28} /><p className="mt-3 text-sm text-slate-500">Chưa có bài kiểm tra được xuất bản cho chứng chỉ này.</p></div>}
    </PaginatedList>
  </section>;
}
