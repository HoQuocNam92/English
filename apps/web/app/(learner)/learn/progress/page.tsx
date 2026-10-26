'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';
import { learningReport, type LearningReportPayload, type CourseReportPayload } from '../../../../../../packages/shared-kernel/src/learning-report';

export default function LearnerProgressPage() {
  const [data, setData] = useState<LearningReportPayload | null>(null);
  const [course, setCourse] = useState<CourseReportPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [courseError, setCourseError] = useState('');
  const current = useRef(true); const fetching = useRef(false);
  const load = useCallback(async () => {
    if (fetching.current) return;
    fetching.current = true; setRefreshing(true);
    const [progress, path] = await Promise.allSettled([
      apiClient.get<LearningReportPayload>('/progress/me'),
      apiClient.get<CourseReportPayload>('/progress/me/learning-path'),
    ]);
    if (current.current) {
      if (progress.status === 'fulfilled') { setData(progress.value); setError(''); }
      else setError(progress.reason?.message || 'Không thể tải tiến độ học tập.');
      if (path.status === 'fulfilled') { setCourse(path.value); setCourseError(''); }
      else { setCourse(null); setCourseError('Không thể tải kết quả của cấp hiện tại.'); }
      setLoading(false); setRefreshing(false);
    }
    fetching.current = false;
  }, []);
  useEffect(() => {
    current.current = true; void load();
    const refresh = () => { if (!document.hidden) void load(); };
    const events = ['focus', 'pageshow', 'techenglish:learning-updated', 'techenglish:learning-path-changed'];
    events.forEach(event => window.addEventListener(event, refresh));
    document.addEventListener('visibilitychange', refresh);
    const timer = window.setInterval(refresh, 60000);
    return () => { current.current = false; events.forEach(event => window.removeEventListener(event, refresh)); document.removeEventListener('visibilitychange', refresh); window.clearInterval(timer); };
  }, [load]);
  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;
  const report = data ? learningReport(data, course) : null;
  return <LearnerShell><main className="w-full space-y-6 pb-8">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Tiến độ học tập</h1><p className="mt-2 text-sm text-on-surface-variant">Tổng hợp bài đã học, từ vựng và kết quả kiểm tra của bạn.</p></div><div className="flex flex-wrap gap-3"><Link href="/learn/plan" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">Đến lộ trình →</Link><button disabled={refreshing} onClick={() => void load()} aria-label="Làm mới tiến độ" className="min-h-11 rounded-xl border border-outline-variant bg-white px-3 text-primary disabled:opacity-50"><RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} /></button></div></header>
    {!!error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}<button onClick={() => void load()} className="ml-3 underline">Thử lại</button></p>}
    {!!courseError && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{courseError}</p>}
    {report && <>
      <section aria-label="Kết quả học tập tích lũy" className="grid gap-3 sm:grid-cols-3">{[{ label: 'Bài đã hoàn thành', value: report.completedLessons }, { label: 'Bài đang học', value: report.inProgressLessons }, { label: 'Từ đã học', value: report.studiedWords }].map(metric => <div key={metric.label} className="rounded-2xl border border-outline-variant bg-white p-5"><p className="text-sm text-on-surface-variant">{metric.label}</p><p className="mt-2 text-3xl font-bold tabular-nums text-primary">{metric.value.toLocaleString('vi-VN')}</p><p className="mt-2 text-xs text-on-surface-variant">Tích lũy qua các cấp đã học</p></div>)}</section>
      {!!report.domains.length && <section className="rounded-2xl border border-outline-variant bg-white p-4 sm:p-6"><h2 className="text-xl font-bold">Kết quả cấp {report.levelName}</h2><p className="mt-2 text-sm text-on-surface-variant">Tỷ lệ bài đã học và kết quả tổng kết được ghi nhận riêng.</p><div className="mt-5 grid gap-4 lg:grid-cols-2">{report.domains.map(domain => <article key={domain.id} className="rounded-xl border border-outline-variant p-4"><h3 className="font-bold">{domain.name}</h3><div className="mt-3 flex justify-between gap-3 text-sm"><span>{domain.completedLessons}/{domain.totalLessons} bài đã học</span><span className="font-semibold text-primary">{domain.percent}%</span></div><div role="progressbar" aria-label={`Bài đã học: ${domain.name}`} aria-valuenow={domain.percent} aria-valuemin={0} aria-valuemax={100} className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary" style={{ width: `${domain.percent}%` }} /></div><p className={`mt-4 text-sm font-semibold ${domain.state === 'complete' ? 'text-emerald-700' : 'text-on-surface-variant'}`}>{domain.resultLabel}</p>{domain.assessment && <p className="mt-2 text-sm">Điểm tổng kết: <strong>{domain.assessment.scorePercent == null ? 'Chưa có' : `${Math.round(domain.assessment.scorePercent)}%`}</strong> · Mức đạt {domain.assessment.passingScorePercent}%</p>}</article>)}</div></section>}
      {!!report.certificates.length && <section className="rounded-2xl border border-outline-variant bg-white p-4 sm:p-6"><h2 className="text-xl font-bold">Tiến độ chứng chỉ</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{report.certificates.map(cert => <article key={cert.certificateId} className="rounded-xl border border-outline-variant p-4"><h3 className="font-bold">{cert.certificateName}</h3><p className="mt-2 text-sm">{cert.completedLessons}/{cert.totalLessons} bài đã học · {cert.examAttempts} lượt thi đã hoàn thành</p><p className="mt-2 text-sm">Điểm trung bình: {cert.avgScore == null ? 'Chưa có' : `${cert.avgScore}%`}</p></article>)}</div></section>}
      <section className="rounded-2xl border border-outline-variant bg-white p-4 sm:p-6"><h2 className="text-xl font-bold">Bài học gần đây</h2>{report.activities.length ? <div className="mt-3 divide-y divide-outline-variant">{report.activities.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div className="min-w-0"><p className="break-words text-sm font-semibold">{item.title ?? 'Bài học'}</p><p className="mt-1 text-xs text-on-surface-variant">{item.completedAt || item.updatedAt ? new Date(item.completedAt ?? item.updatedAt!).toLocaleDateString('vi-VN') : 'Chưa có ngày ghi nhận'}</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${item.status === 'completed' || item.completionPercent >= 100 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>{item.status === 'completed' || item.completionPercent >= 100 ? 'Đã hoàn thành' : 'Đang học'}</span></div>)}</div> : <p className="mt-4 text-sm text-on-surface-variant">Bạn chưa có hoạt động học bài được ghi nhận.</p>}</section>
      {!!report.recentAttempts.length && <section className="rounded-2xl border border-outline-variant bg-white p-4 sm:p-6"><h2 className="text-xl font-bold">Bài luyện chứng chỉ gần đây</h2><div className="mt-3 divide-y divide-outline-variant">{report.recentAttempts.map(attempt => <div key={attempt.id} className="flex items-center justify-between gap-4 py-4"><div><p className="text-sm font-semibold">{attempt.exam?.title ?? 'Bài kiểm tra'}</p><p className="mt-1 text-xs text-on-surface-variant">{attempt.passed ? 'Đã đạt' : 'Chưa đạt'}</p></div><span className="font-bold text-primary">{attempt.scorePercent == null ? '—' : `${Math.round(attempt.scorePercent)}%`}</span></div>)}</div></section>}
    </>}
  </main></LearnerShell>;
}
