'use client';
import { IconText, AppIcon } from '@/shared/ui/AppIcon';

import { LevelBadge } from '@/shared/ui/LevelBadge';
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
  const [showAllDomains, setShowAllDomains] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, profileRes, progressRes, attemptsRes, recsRes, journeyRes, certificatesRes] = await Promise.allSettled([
          apiClient.get('/auth/me'),
          apiClient.get('/learner-profiles/me'),
          apiClient.get('/progress/me'),
          apiClient.get('/exams/attempts/my?limit=3'),
          apiClient.get('/recommendations/me'),
          apiClient.get('/learner-profiles/me/journey'),
          apiClient.get('/certificates'),
        ]);

        const get = (r: PromiseSettledResult<any>) =>
          r.status === 'fulfilled' ? r.value : null;

        const profileData = get(profileRes);
        const recsData = get(recsRes);
        const certificatesData = get(certificatesRes);

        setData({
          me: get(meRes),
          profile: profileData,
          progress: get(progressRes),
          certificates: Array.isArray(certificatesData?.data) ? certificatesData.data : [],
          attempts: (() => { const d = get(attemptsRes); return d?.data ?? d ?? []; })(),
          recommendations: Array.isArray(recsData?.recommendations) ? recsData.recommendations : [],
          journey: get(journeyRes),
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
  const certificates: any[] = data?.certificates ?? [];
  const attempts: any[] = data?.attempts ?? [];
  const recommendations: any[] = (data?.recommendations ?? []).filter((item: any) => item.type !== 'lesson');
  const journey = data?.journey;
  const journeyConfigured = journey?.configured === true;
  const smartPath = journey?.targets?.learningPathMode !== 'self';
  const certificateProgressById = new Map((progress?.certProgress || []).map((item: any) => [item.certificateId, item]));

  const level = profile?.level?.name ?? profile?.level ?? 'Chưa thiết lập';
  const domainNames: string[] = Array.from(new Set<string>((profile?.domains ?? []).map((item: any) => item.domain?.name).filter(Boolean)));
  if (!domainNames.length) {
    const fallbackDomain = profile?.domain?.name ?? profile?.itField;
    if (fallbackDomain) domainNames.push(fallbackDomain);
  }
  const cert = profile?.certGoals?.[0]?.certificate?.name ?? profile?.targetCertification?.name ?? profile?.targetCert ?? 'Chưa thiết lập';
  const examActivities = attempts.map((a: any) => {
    const title = a.exam?.title ?? a.examTitle ?? t.practice.exams;
    const scoreVal = a.score ?? a.correctCount;
    const scoreText = scoreVal !== undefined && scoreVal !== null ? `${scoreVal}/${a.totalQuestions ?? 100}` : '';
    const time = a.completedAt || a.submittedAt || a.startedAt;
    return {
      id: `exam-${a.id}`,
      text: 'Làm bài kiểm tra',
      bold: scoreText ? `${title} (${scoreText})` : title,
      timestamp: time ? new Date(time).getTime() : 0,
      when: formatRelativeDate(time),
      done: true,
      link: `/learn/quiz/${a.examId ?? ''}`,
    };
  });

  const recentActivities = examActivities
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 4);

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
            { icon: '🎓', label: t.home.level, value: level, bg: 'bg-gradient-to-br from-indigo-100 to-violet-200' },
            { icon: '💻', label: t.home.itField, value: domainNames.join(', ') || 'Chưa thiết lập', bg: 'bg-gradient-to-br from-sky-100 to-cyan-200' },
            { icon: '🏆', label: t.home.certGoal, value: cert, bg: 'bg-gradient-to-br from-amber-100 to-orange-200' },
          ].map((s) => (
            <div

              key={s.label}
              className="bg-surface-container border border-outline-variant rounded-lg p-4 flex items-center gap-4 hover:shadow-[0_1px_3px_rgba(15,23,24,0.06)] transition-shadow"
            >
              <div className={`w-12 h-12 shrink-0 rounded-full ${s.bg} flex items-center justify-center shadow-xs ring-1 ring-white/70`}>
                <span className="text-2xl leading-none" aria-hidden="true"><AppIcon>{s.icon}</AppIcon></span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-[0.05em]">{s.label}</p>
                {s.label === t.home.itField && domainNames.length > 0 ? (
                  <div className="mt-2">
                    <ul id="selected-it-domains" className="flex flex-wrap gap-1.5" aria-label="Lĩnh vực IT đã chọn">
                      {(showAllDomains ? domainNames : domainNames.slice(0, 1)).map((name) => (
                        <li key={name} title={name} className="max-w-full truncate rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary">{name}</li>
                      ))}
                    </ul>
                    {domainNames.length > 1 && (
                      <button type="button" aria-expanded={showAllDomains} aria-controls="selected-it-domains" onClick={() => setShowAllDomains((shown) => !shown)} className="mt-1.5 rounded px-1 py-1 text-xs font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary">
                        {showAllDomains ? 'Thu gọn' : `+${domainNames.length - 1} lĩnh vực`}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-[20px] font-semibold text-on-surface" style={{ lineHeight: '28px' }}>{s.label === t.home.level ? <LevelBadge level={level} className="text-sm" /> : s.value}</p>
                )}
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
                    {journeyConfigured ? t.home.todayGoal : 'Thiết lập hành trình'}
                  </span>
                  <h2 className="text-[24px] font-bold text-on-surface" style={{ lineHeight: '32px', letterSpacing: '-0.01em' }}>
                    {journeyConfigured ? 'Mục tiêu học tập hôm nay' : 'Bạn chưa thiết lập lộ trình học tập'}
                  </h2>
                </div>
                <span className="text-3xl" aria-hidden="true"><IconText>{journeyConfigured ? '🗓️' : '🚩'}</IconText></span>
              </div>
              <p className="text-[14px] text-on-surface-variant mb-4">
                {journeyConfigured
                  ? `Hôm nay: ${journey.targets.vocabularyPerDay} từ vựng, ${journey.targets.minutesPerDay} phút học. Mục tiêu bài thi: ${journey.targets.examsPerWeek}/tuần, ${journey.targets.examsPerMonth}/tháng và ${journey.targets.examsPerYear}/năm.`
                  : 'Hãy thiết lập trình độ, lĩnh vực CNTT và chứng chỉ mục tiêu trong hồ sơ để TechEnglish Pro cá nhân hoá nội dung học tập tối ưu cho bạn.'}
              </p>
            </div>

            {journeyConfigured ? <div className="z-10 mt-auto space-y-3">
              {[
                ['Từ vựng hôm nay', journey.progress.vocabularyToday, journey.targets.vocabularyPerDay, journey.progress.vocabularyPercent],
                ['Thời gian học hôm nay', journey.progress.studyMinutesToday, journey.targets.minutesPerDay, journey.progress.studyMinutesPercent],
                ['Bài thi tuần này', journey.progress.examsWeek, journey.targets.examsPerWeek, journey.progress.examWeekPercent],
              ].map(([label, value, target, percent]) => (
                <div key={String(label)}>
                  <div className="mb-1 flex justify-between text-xs font-semibold"><span>{label}: {value}/{target}</span><span className="text-primary">{percent}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-container-highest"><div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></div>
                </div>
              ))}
              {journey.targets.reminderEnabled && journey.targets.reminderTime && <p className="flex items-center gap-1.5 text-xs font-semibold text-violet-700"><span className="text-base" aria-hidden="true"><IconText>{"🔔"}</IconText></span>Nhắc học lúc {journey.targets.reminderTime} mỗi ngày</p>}
              <Link href="/learn/profile?tab=goals" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white">Điều chỉnh mục tiêu<span className="text-lg" aria-hidden="true"><IconText>{"⚙️"}</IconText></span></Link>
            </div> : <div className="z-10 mt-auto">
              <div className="flex items-center gap-3">
                <Link
                    href="/learn/profile?tab=goals"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90 transition-opacity"
                  >
                    <span>Thiết lập lộ trình học tập</span>
                    <span className="text-[16px]" aria-hidden="true"><IconText>{"⚙️"}</IconText></span>
                  </Link>
              </div>
            </div>}
          </div>

          {/* ─── Gợi ý học tập thích ứng (Adaptive Learning Recommendations) ─── */}
          {journeyConfigured && smartPath && <div className="hidden bg-surface-container border border-outline-variant rounded-xl p-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[22px]" aria-hidden="true"><IconText>{"✨"}</IconText></span>
                  <h3 className="text-[20px] font-bold text-on-surface" style={{ lineHeight: '28px' }}>
                    Gợi ý học tập dành cho bạn
                  </h3>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Xác định nội dung cần củng cố và sắp xếp theo mức độ ưu tiên dựa trên kết quả bài thi &amp; tiến độ học tập thực tế.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 border border-violet-200 w-fit">
                <span className="text-[15px]" aria-hidden="true"><IconText>{"🧠"}</IconText></span>
                Cá nhân hoá theo năng lực
              </span>
            </div>

            {recommendations.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recommendations.map((rec: any) => {
                  const isUrgent = rec.priority === 'urgent';
                  const isHigh = rec.priority === 'high';
                  const priorityLabel = isUrgent ? 'Cần củng cố gấp' : isHigh ? 'Luyện tập tăng cường' : 'Lộ trình đề xuất';
                  const priorityClass = isUrgent
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : isHigh
                      ? 'bg-violet-100 text-violet-800 border-violet-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  const priorityIcon = isUrgent ? '🚨' : isHigh ? '🧠' : '🎯';

                  const typeLabel = rec.type === 'lesson' ? 'Bài học' : rec.type === 'exam' ? 'Bài kiểm tra chứng chỉ' : rec.type === 'vocab' ? 'Từ vựng' : 'Tình huống';

                  return (
                    <div
                      key={rec.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isUrgent
                          ? 'border-rose-200 bg-rose-50/40 hover:bg-rose-50/70 hover:border-rose-300'
                          : isHigh
                            ? 'border-violet-200 bg-violet-50/30 hover:bg-violet-50/60 hover:border-violet-300'
                            : 'border-outline-variant bg-surface-container-low hover:bg-surface-container-high'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${priorityClass}`}>
                            <span className="text-[13px]" aria-hidden="true">{priorityIcon}</span>
                            {priorityLabel}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant/40">
                            {typeLabel}
                          </span>
                          {rec.domainName && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                              {rec.domainName}
                            </span>
                          )}
                          {rec.levelName && (
                            <LevelBadge level={rec.levelName} />
                          )}
                        </div>

                        <h4 className="font-bold text-[15px] text-on-surface mb-1">
                          {rec.title}
                        </h4>

                        <p className="text-xs text-on-surface-variant leading-relaxed mb-2">
                          {rec.reason}
                        </p>

                        {rec.progressPercent !== undefined && rec.progressPercent > 0 && (
                          <div className="flex items-center gap-3 mt-1 max-w-xs">
                            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                              <div className="bg-primary h-full rounded-full" style={{ width: `${rec.progressPercent}%` }} />
                            </div>
                            <span className="text-[11px] font-bold text-primary shrink-0">{rec.progressPercent}%</span>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center">
                        <Link
                          href={rec.actionUrl}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                            isUrgent
                              ? 'bg-rose-600 text-white hover:bg-rose-700'
                              : isHigh
                                ? 'bg-violet-600 text-white hover:bg-violet-700'
                                : 'bg-primary text-white hover:bg-primary/90'
                          }`}
                        >
                          <span>{rec.actionText}</span>
                          <span className="text-[16px]" aria-hidden="true"><IconText>{"🚀"}</IconText></span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low">
                <span className="mb-2 block text-3xl" aria-hidden="true"><IconText>{"💡"}</IconText></span>
                <p className="text-sm font-semibold text-on-surface">Đang cập nhật gợi ý học tập</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Hãy luyện từ vựng hoặc làm bài thi chứng chỉ để hệ thống phân tích và đề xuất nội dung cần củng cố cho bạn.
                </p>
              </div>
            )}
          </div>}

          {/* Lộ trình chứng chỉ — bài học chỉ xuất hiện sau khi chọn Topic trong chứng chỉ */}
          {journeyConfigured ? <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h3 className="text-[20px] font-semibold text-on-surface" style={{ lineHeight: '28px' }}>
                Lộ trình chứng chỉ
              </h3>
              {cert !== 'Chưa thiết lập' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 w-fit">
                  <span className="text-[15px]" aria-hidden="true"><IconText>{"🏆"}</IconText></span>
                  Mục tiêu: {cert}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certificates.length > 0 ? certificates.slice(0, 4).map((certificate: any) => {
                const certificateProgress = certificateProgressById.get(certificate.id) as any;
                const progressPercent = Math.round(certificateProgress?.completionPercent ?? certificateProgress?.avgScore ?? 0);
                const domainNames = (certificate.domains ?? []).map((item: any) => item.domain?.name).filter(Boolean).join(' · ');
                return (
                  <Link
                    key={certificate.id}
                    href={`/learn/certifications/${certificate.id}`}
                    className="bg-surface-container border border-outline-variant rounded-lg p-5 hover:shadow-[0_1px_3px_rgba(15,23,24,0.08)] hover:border-primary/40 transition-all content-card"
                  >
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-200 ring-1 ring-amber-200/70">
                        <span className="text-2xl" aria-hidden="true"><IconText>{"🏅"}</IconText></span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-primary">{certificate.code}</span>
                        <h4 className="line-clamp-2 text-[15px] font-bold text-on-surface">{certificate.name}</h4>
                        <p className="mt-0.5 text-[12px] text-on-surface-variant">{certificate.provider}</p>
                      </div>
                    </div>
                    <p className="mb-4 line-clamp-1 text-[12px] text-on-surface-variant">{domainNames || 'Chứng chỉ CNTT quốc tế'}</p>
                    <div className="mt-auto">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Mức độ sẵn sàng</span>
                        <span className="text-[12px] font-bold text-primary">{progressPercent}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-highest">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${progressPercent}%` }} />
                      </div>
                      <div className="content-card-footer content-card-actions text-[13px] font-bold text-primary">
                        Xem lộ trình <span className="text-[16px]" aria-hidden="true"><IconText>{"➡️"}</IconText></span>
                      </div>
                    </div>
                  </Link>
                );
              }) : <p className="col-span-2 rounded-lg border border-outline-variant bg-surface-container p-6 text-sm text-on-surface-variant">Chưa có chứng chỉ đang hoạt động.</p>}
            </div>
          </div> : <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-6 text-center">
            <span className="mb-2 block text-4xl" aria-hidden="true"><IconText>{"🏆"}</IconText></span>
            <h3 className="text-base font-bold text-on-surface">Chọn chứng chỉ mục tiêu</h3>
            <p className="mt-1 text-xs text-on-surface-variant"><IconText>{"Chọn chứng chỉ để học theo lộ trình Domain → Topic → Lesson và luyện đề."}</IconText></p>
            <Link href="/learn/certifications" className="mt-4 inline-flex items-center gap-1 rounded-lg border border-primary px-4 py-2 text-sm font-bold text-primary">Xem chứng chỉ<span className="text-base" aria-hidden="true"><IconText>{"➡️"}</IconText></span></Link>
          </div>}
        </section>

        <aside className="lg:col-span-4 flex flex-col gap-6">

          {/* Kết quả kiểm tra gần đây */}
          <div>
            <h3 className="text-[14px] font-semibold text-on-surface mb-2 flex items-center gap-1">
              <span className="text-[18px]" aria-hidden="true"><IconText>{"📋"}</IconText></span>
              Kết quả kiểm tra gần đây
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
                    <Link href={`/learn/quiz/${a.examId ?? ''}`} className="text-[12px] font-bold text-primary hover:underline">Xem kết quả</Link>
                  </div>
                </div>
              )) : <p className="rounded bg-surface-container p-3 text-xs text-on-surface-variant">Bạn chưa có kết quả bài kiểm tra.</p>}
            </div>
          </div>

          {/* Hoạt động gần đây */}
          <div>
            <h3 className="text-[14px] font-semibold text-on-surface mb-2 flex items-center gap-1">
              <span className="text-[18px]" aria-hidden="true"><IconText>{"🕘"}</IconText></span>
              Hoạt động gần đây
            </h3>
            <div className="bg-surface-container border border-outline-variant rounded-lg p-4">
              {recentActivities.length > 0 ? (
                <ul className="relative border-l border-outline-variant ml-2 pb-2 space-y-4">
                  {recentActivities.map((item) => (
                    <li key={item.id} className="relative pl-4">
                      <div className={`absolute w-2 h-2 rounded-full -left-[5px] top-1.5 ring-4 ring-surface-container ${item.done ? 'bg-primary' : 'bg-surface-container-high'}`} />
                      <Link href={item.link} className="group block">
                        <p className="text-[12px] text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                          {item.text} {item.bold && <strong>{item.bold}</strong>}
                        </p>
                        <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-[0.05em] mt-1">{item.when}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-[12px] text-on-surface-variant">Chưa có hoạt động học gần đây.</p>
                  <Link href="/learn/certifications" className="mt-2 inline-block text-[12px] font-bold text-primary hover:underline">
                    <IconText>{"\n                    Bắt đầu luyện thi chứng chỉ →\n                  "}</IconText></Link>
                </div>
              )}
            </div>
          </div>
        </aside>

      </div>
    </LearnerShell>
  );
}

function formatRelativeDate(dateStr?: string | null): string {
  if (!dateStr) return 'Gần đây';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Gần đây';
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}
