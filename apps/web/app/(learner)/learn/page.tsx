'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { useI18n } from '@/shared/i18n';
import { LoadingSpinner } from '@/shared/ui';

export default function LearnerHomePage() {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const results = await Promise.allSettled([
          apiClient.get('/auth/me'),
          apiClient.get('/learner-profiles/me'),
          apiClient.get('/progress/me'),
          apiClient.get('/lessons?limit=4&status=published'),
          apiClient.get('/exams/attempts/my?limit=3'),
        ]);

        const get = (r: PromiseSettledResult<any>) =>
          r.status === 'fulfilled' ? r.value : null;

        const [meRes, profileRes, progressRes, lessonsRes, attemptsRes] = results;

        const lessonsData = get(lessonsRes);
        setData({
          me: get(meRes),
          profile: get(profileRes),
          progress: get(progressRes),
          lessons: lessonsData?.data ?? lessonsData ?? [],
          attempts: (() => { const d = get(attemptsRes); return d?.data ?? d ?? []; })(),
        });
      } catch (err: any) {
        setError(err?.message ?? 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LearnerShell><LoadingSpinner /></LearnerShell>;

  if (error) {
    return (
      <LearnerShell>
        <div className="text-center text-error py-8">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-[14px] font-semibold"
          >
            {t.common.retry}
          </button>
        </div>
      </LearnerShell>
    );
  }

  const displayName = data?.me?.displayName ?? data?.me?.user?.displayName ?? 'bạn';
  const profile = data?.profile;
  const progress = data?.progress;
  const lessons: any[] = data?.lessons ?? [];
  const attempts: any[] = data?.attempts ?? [];
  const lessonProgressById = new Map((progress?.progress || []).filter((item: any) => item.resourceType === 'lesson').map((item: any) => [item.resourceId, item]));

  const level = profile?.level?.name ?? profile?.level ?? 'Chưa thiết lập';
  const domain = profile?.domains?.[0]?.domain?.name ?? profile?.domain?.name ?? profile?.itField ?? 'Chưa thiết lập';
  const cert = profile?.certGoals?.[0]?.certificate?.name ?? profile?.targetCertification?.name ?? profile?.targetCert ?? 'Chưa thiết lập';
  const overallProgress = progress?.summary?.overallCompletionPercent ?? progress?.overallPercent ?? 0;

  return (
    <LearnerShell>
      {/* ─── Hero Section ───────────────────────────────────────── */}
      <section className="mb-6">
        <h1 className="text-[30px] font-bold text-on-surface mb-2" style={{ lineHeight: '38px', letterSpacing: '-0.02em' }}>
          {t.home.greeting.replace('bạn', '')} {displayName}, {t.home.greetingQuestion.charAt(0).toLowerCase() + t.home.greetingQuestion.slice(1)}
        </h1>
        <p className="text-[14px] text-on-surface-variant mb-6">
          {t.home.subtitle}
        </p>

        {/* Stat Cards — 3 col */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: 'school', label: t.home.level, value: level, bg: 'bg-primary-container/20', text: 'text-primary' },
            { icon: 'cloud', label: t.home.itField, value: domain, bg: 'bg-secondary-container/20', text: 'text-secondary' },
            { icon: 'workspace_premium', label: t.home.certGoal, value: cert, bg: 'bg-tertiary-container/20', text: 'text-tertiary' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-surface-container border border-outline-variant rounded-lg p-4 flex items-center gap-4 hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow"
            >
              <div className={`w-12 h-12 rounded-full ${s.bg} ${s.text} flex items-center justify-center`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
              <div>
                <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-[0.05em]">{s.label}</p>
                <p className="text-[20px] font-semibold text-on-surface" style={{ lineHeight: '28px' }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>


      </section>

      {/* ─── Main Grid: 8-col content + 4-col sidebar ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left: 8-col ─────────────────────────────────────────── */}
        <section className="lg:col-span-8 flex flex-col gap-6">

          {/* Current Goal Card */}
          <div className="bg-surface-container border border-outline-variant rounded-xl p-6 flex flex-col justify-between hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow relative overflow-hidden">
            {/* Decorative blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full opacity-50 -z-0 pointer-events-none" />

            <div className="z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block px-2 py-1 bg-surface-container-low text-on-surface-variant text-[12px] font-bold rounded mb-2 border border-border-subtle uppercase tracking-[0.05em]">
                    {t.home.todayGoal}
                  </span>
                  <h2 className="text-[24px] font-bold text-on-surface" style={{ lineHeight: '32px', letterSpacing: '-0.01em' }}>
                    {cert} Cloud Practitioner
                  </h2>
                </div>
                <span className="material-symbols-outlined text-primary text-3xl">cloud_done</span>
              </div>
              <p >
                Hoàn thành lộ trình này để nắm vững các thuật ngữ cốt lõi và khái niệm cơ bản về {cert} bằng tiếng Anh chuyên ngành.
              </p>
            </div>

            <div className="z-10 mt-auto">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[14px] font-semibold text-on-surface">{t.nav.progress}</span>
                <span className="text-[14px] font-semibold text-primary">{overallProgress}%</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full mb-4 overflow-hidden">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${overallProgress}%` }} />
              </div>
              <Link
                href="/learn/lessons"
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg text-[14px] font-semibold hover:opacity-90 active:opacity-80 transition-opacity"
              >
                <span className="text-white">{t.home.continueLearn}</span>
                <span className="material-symbols-outlined text-[18px] text-white">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Tiếp tục học — Lesson Grid */}
          <div>
            <h3 className="text-[20px] font-semibold text-on-surface mb-4" style={{ lineHeight: '28px' }}>
              {t.home.continueLearn}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lessons.length > 0 ? lessons.slice(0, 4).map((lesson: any) => {
                const lessonProgress = Math.round((lessonProgressById.get(lesson.id) as any)?.completionPercent ?? 0);
                const domain = lesson.domain?.name ?? lesson.domain?.code ?? 'IT';
                return (
                  <Link
                    key={lesson.id}
                    href={`/learn/lessons/${lesson.id}`}
                    className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow flex flex-col"
                  >
                    {/* Thumbnail */}
                    <div className="w-full h-32 bg-surface-container-low border-b border-outline-variant relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary opacity-30" style={{ fontSize: '64px' }}>auto_stories</span>
                      </div>
                      <span className="absolute top-2 left-2 bg-surface-container/90 backdrop-blur text-primary text-[12px] font-bold px-2 py-1 rounded border border-outline-variant">
                        {domain}
                      </span>
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <h4 className="text-[14px] font-semibold text-on-surface mb-1 truncate">{lesson.title}</h4>
                      <p className="text-[12px] text-on-surface-variant mb-4 flex-grow line-clamp-2">
                        {lesson.summary ?? lesson.description ?? ''}
                      </p>
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[12px] font-bold text-on-surface-variant uppercase tracking-[0.05em]">{t.nav.progress}</span>
                          <span className="text-[12px] font-bold text-primary">{lessonProgress}%</span>
                        </div>
                        <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${lessonProgress}%` }} />
                        </div>
                      </div>
                      <button className="w-full text-center py-1.5 border border-outline-variant text-on-surface text-[14px] font-semibold rounded hover:bg-surface-container-low transition-colors">
                        {t.common.continue}
                      </button>
                    </div>
                  </Link>
                );
              }) : <p className="col-span-2 rounded-lg border border-outline-variant bg-surface-container p-6 text-sm text-on-surface-variant">Chưa có bài học đã xuất bản.</p>}

            </div>
          </div>
        </section>

        {/* ── Right Sidebar: 4-col ─────────────────────────────────── */}
        <aside className="lg:col-span-4 flex flex-col gap-6">

          {/* Kết quả kiểm tra gần đây */}
          <div>
            <h3 className="text-[14px] font-semibold text-on-surface mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">assignment_turned_in</span>
              {t.practice.exams}
            </h3>
            <div className="flex flex-col gap-2">
              {attempts.length > 0 ? attempts.slice(0, 3).map((a: any) => (
                <div
                  key={a.id}
                  className="bg-surface-container border border-outline-variant rounded-lg p-2 flex items-center justify-between hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow"
                >
                  <div>
                    <h4 className="text-[14px] font-semibold text-on-surface">{a.exam?.title ?? a.examTitle ?? t.practice.exams}</h4>
                    <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-[0.05em]">
                      {a.completedAt ? new Date(a.completedAt).toLocaleDateString('vi-VN') : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[14px] font-semibold text-primary">{a.score ?? a.correctCount}/{a.totalQuestions ?? 100}</span>
                    <Link href={`/learn/quiz/${a.examId ?? ''}`} className="text-[12px] font-bold text-primary hover:underline">{t.mockInterview.result}</Link>
                  </div>
                </div>
              )) : <p className="rounded bg-surface-container p-3 text-xs text-on-surface-variant">Bạn chưa có kết quả bài kiểm tra.</p>}
            </div>
          </div>

          {/* Hoạt động gần đây */}
          <div>
            <h3 className="text-[14px] font-semibold text-on-surface mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">history</span>
              {t.analytics.recentActivity}
            </h3>
            <div className="bg-surface-container border border-outline-variant rounded-lg p-4">
              <ul className="relative border-l border-outline-variant ml-2 pb-2 space-y-4">
                {[
                  { text: t.lessons.lessonComplete, bold: 'IAM Policies', when: '2 giờ trước', done: true },
                  { text: 'Mở khoá huy hiệu', bold: 'Cloud Novice', when: 'Hôm qua', done: false },
                  { text: 'Đăng nhập từ thiết bị mới', bold: '', when: '4 ngày trước', done: false },
                ].map((item, i) => (
                  <li key={i} className="relative pl-4">
                    <div className={`absolute w-2 h-2 rounded-full -left-[5px] top-1.5 ring-4 ring-surface-container ${item.done ? 'bg-primary' : 'bg-surface-container-high'}`} />
                    <p className="text-[12px] text-on-surface">
                      {item.text} {item.bold && <strong>{item.bold}</strong>}
                    </p>
                    <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-[0.05em] mt-1">{item.when}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

      </div>
    </LearnerShell>
  );
}

