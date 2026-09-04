'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { PromotionsBanner } from '@/features/promotions/PromotionsBanner';
import { useI18n } from '@/shared/i18n';

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
          apiClient.get('/recommendations/my'),
          apiClient.get('/exams/attempts/my?limit=3'),
        ]);

        const get = (r: PromiseSettledResult<any>) =>
          r.status === 'fulfilled' ? r.value : null;

        const [meRes, profileRes, progressRes, lessonsRes, recsRes, attemptsRes] = results;

        const lessonsData = get(lessonsRes);
        setData({
          me: get(meRes),
          profile: get(profileRes),
          progress: get(progressRes),
          lessons: lessonsData?.data ?? lessonsData ?? [],
          recommendations: (() => { const d = get(recsRes); return d?.data ?? d ?? []; })(),
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

  if (loading) {
    return (
      <LearnerShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </LearnerShell>
    );
  }

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
  const recommendations: any[] = data?.recommendations ?? [];
  const attempts: any[] = data?.attempts ?? [];

  const level = profile?.level?.name ?? profile?.level ?? 'Intermediate';
  const domain = profile?.domain?.name ?? profile?.itField ?? 'Cloud Computing';
  const cert = profile?.targetCertification?.name ?? profile?.targetCert ?? 'AWS';
  const overallProgress = progress?.summary?.overallCompletionPercent ?? progress?.overallPercent ?? 68;

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
            { icon: 'school', label: t.home.level, value: level, bg: 'bg-primary-light', text: 'text-primary' },
            { icon: 'cloud', label: t.home.itField, value: domain, bg: 'bg-secondary-fixed', text: 'text-secondary' },
            { icon: 'workspace_premium', label: t.home.certGoal, value: cert, bg: 'bg-tertiary-fixed', text: 'text-tertiary' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-surface-white border border-border-subtle rounded-lg p-4 flex items-center gap-4 hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow"
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

        {/* ⚡ Promos & Flash Sale Section */}
        <PromotionsBanner />
      </section>

      {/* ─── Main Grid: 8-col content + 4-col sidebar ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left: 8-col ─────────────────────────────────────────── */}
        <section className="lg:col-span-8 flex flex-col gap-6">

          {/* Current Goal Card */}
          <div className="bg-surface-white border border-border-subtle rounded-xl p-6 flex flex-col justify-between hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow relative overflow-hidden">
            {/* Decorative blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light rounded-bl-full opacity-50 -z-0 pointer-events-none" />

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
              <p className="text-[14px] text-on-surface-variant mb-8 max-w-md">
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
                const lessonProgress = lesson.progress ?? Math.floor(Math.random() * 100);
                const domain = lesson.domain?.name ?? lesson.domain?.code ?? 'IT';
                return (
                  <Link
                    key={lesson.id}
                    href={`/learn/lessons/${lesson.id}`}
                    className="bg-surface-white border border-border-subtle rounded-lg overflow-hidden hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow flex flex-col"
                  >
                    {/* Thumbnail */}
                    <div className="w-full h-32 bg-surface-container-low border-b border-border-subtle relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-light to-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary opacity-30" style={{ fontSize: '64px' }}>auto_stories</span>
                      </div>
                      <span className="absolute top-2 left-2 bg-surface-white/90 backdrop-blur text-primary text-[12px] font-bold px-2 py-1 rounded border border-border-subtle">
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
                      <button className="w-full text-center py-1.5 border border-border-subtle text-on-surface text-[14px] font-semibold rounded hover:bg-surface-container-low transition-colors">
                        {t.common.continue}
                      </button>
                    </div>
                  </Link>
                );
              }) : (
                // Placeholder cards khi chưa có lessons
                [
                  { title: 'VPC Basics & Subnets', desc: 'Understanding virtual private clouds and network segmentation.', domain: 'Networking', progress: 45 },
                  { title: 'S3 Bucket Policies', desc: 'Managing access controls and permissions for object storage.', domain: 'Storage', progress: 80 },
                ].map((p) => (
                  <Link
                    key={p.title}
                    href="/learn/lessons"
                    className="bg-surface-white border border-border-subtle rounded-lg overflow-hidden hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow flex flex-col"
                  >
                    <div className="w-full h-32 bg-surface-container-low border-b border-border-subtle relative flex items-center justify-center">
                      <span className="absolute top-2 left-2 bg-surface-white/90 backdrop-blur text-primary text-[12px] font-bold px-2 py-1 rounded border border-border-subtle">{p.domain}</span>
                      <span className="material-symbols-outlined text-primary opacity-20" style={{ fontSize: '64px' }}>auto_stories</span>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h4 className="text-[14px] font-semibold text-on-surface mb-1">{p.title}</h4>
                      <p className="text-[12px] text-on-surface-variant mb-4 flex-grow">{p.desc}</p>
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[12px] font-bold text-on-surface-variant">{t.nav.progress}</span>
                          <span className="text-[12px] font-bold text-primary">{p.progress}%</span>
                        </div>
                        <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${p.progress}%` }} />
                        </div>
                      </div>
                      <button className="w-full text-center py-1.5 border border-border-subtle text-on-surface text-[14px] font-semibold rounded hover:bg-surface-container-low transition-colors">
                        {t.common.continue}
                      </button>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ── Right Sidebar: 4-col ─────────────────────────────────── */}
        <aside className="lg:col-span-4 flex flex-col gap-6">

          {/* AI Recommendation Widget */}
          <div className="rounded-xl p-4 relative overflow-hidden group border" style={{ backgroundColor: '#F5F3FF', borderColor: '#7C3AED' }}>
            <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity" style={{ color: '#7C3AED' }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <h3 className="text-[14px] font-semibold flex items-center gap-2 mb-2" style={{ color: '#5B21B6' }}>
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              {t.aiRecommendations.forYou}
            </h3>
            <p className="text-[12px] text-on-surface-variant mb-4">
              {t.aiRecommendations.basedOnProgress}:
            </p>
            {recommendations.length > 0 ? recommendations.slice(0, 2).map((rec: any) => (
              <div key={rec.id ?? rec.lessonId} className="bg-surface-white rounded p-2 flex items-center justify-between mb-2 border" style={{ borderColor: '#E9D5FF' }}>
                <div>
                  <h4 className="text-[14px] font-semibold text-on-surface">{rec.lesson?.title ?? rec.title ?? t.aiRecommendations.recommended}</h4>
                  <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-[0.05em]">{t.practice.difficulty}: {rec.difficulty ?? t.practice.beginner}</p>
                </div>
                <Link href={`/learn/lessons/${rec.lesson?.id ?? rec.lessonId ?? ''}`}>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-colors" style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}>
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  </button>
                </Link>
              </div>
            )) : (
              <div className="bg-surface-white rounded p-2 flex items-center justify-between border" style={{ borderColor: '#E9D5FF' }}>
                <div>
                  <h4 className="text-[14px] font-semibold text-on-surface">Networking Fundamentals</h4>
                  <p className="text-[12px] font-bold text-on-surface-variant">{t.practice.difficulty}: {t.practice.beginner}</p>
                </div>
                <Link href="/learn/lessons">
                  <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EDE9FE', color: '#7C3AED' }}>
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  </button>
                </Link>
              </div>
            )}
          </div>

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
                  className="bg-surface-white border border-border-subtle rounded-lg p-2 flex items-center justify-between hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow"
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
              )) : (
                [
                  { title: 'EC2 & Compute Mock', when: 'Hôm qua', score: '85/100' },
                  { title: 'Security Vocab Quiz', when: '3 ngày trước', score: '92/100' },
                ].map((a) => (
                  <div key={a.title} className="bg-surface-white border border-border-subtle rounded-lg p-2 flex items-center justify-between hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow">
                    <div>
                      <h4 className="text-[14px] font-semibold text-on-surface">{a.title}</h4>
                      <p className="text-[12px] font-bold text-on-surface-variant">{a.when}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[14px] font-semibold text-primary">{a.score}</span>
                      <a href="#" className="text-[12px] font-bold text-primary hover:underline">{t.mockInterview.result}</a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Hoạt động gần đây */}
          <div>
            <h3 className="text-[14px] font-semibold text-on-surface mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">history</span>
              {t.analytics.recentActivity}
            </h3>
            <div className="bg-surface-white border border-border-subtle rounded-lg p-4">
              <ul className="relative border-l border-border-subtle ml-2 pb-2 space-y-4">
                {[
                  { text: t.lessons.lessonComplete, bold: 'IAM Policies', when: '2 giờ trước', done: true },
                  { text: 'Mở khoá huy hiệu', bold: 'Cloud Novice', when: 'Hôm qua', done: false },
                  { text: 'Đăng nhập từ thiết bị mới', bold: '', when: '4 ngày trước', done: false },
                ].map((item, i) => (
                  <li key={i} className="relative pl-4">
                    <div className={`absolute w-2 h-2 rounded-full -left-[5px] top-1.5 ring-4 ring-surface-white ${item.done ? 'bg-primary' : 'bg-surface-container-high'}`} />
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

