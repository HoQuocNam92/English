'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, ChevronDown, ChevronUp, ClipboardList, Eye, Play, RotateCcw, Route, Settings2 } from 'lucide-react';
import { goalProgress } from '../../../../../packages/shared-kernel/src/goal-progress.cjs';
import { selectedCertificates } from '../../../../../packages/shared-kernel/src/selected-certificates';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { LoadingSpinner } from '@/shared/ui';
import { LevelBadge } from '@/shared/ui/LevelBadge';

const card = 'rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 sm:p-6';
const outline = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-outline-variant px-3 py-2 text-xs font-semibold transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary';
const primary = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:opacity-90';
const studyHref = '/learn/flashcards/all/practice';
const reviewHref = '/learn/flashcards/review/practice';

type HomeData = {
  profile: any;
  journey: any;
  attempts: any[];
  reviewWords: any[];
  reviewUnavailable: boolean;
  certificates: any[];
};

export default function LearnerHomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [showAllDomains, setShowAllDomains] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadData() {
      const results = await Promise.allSettled([
        apiClient.get<any>('/learner-profiles/me'),
        apiClient.get<any>('/learner-profiles/me/journey'),
        apiClient.get<any>('/exams/attempts/my?limit=2'),
        apiClient.get<any>('/vocab-study/session?reviewOnly=true&onlyNew=false'),
        apiClient.get<any>('/certificates'),
      ]);
      if (!active) return;
      const get = (index: number) => {
        const result = results[index];
        return result.status === 'fulfilled' ? result.value : null;
      };
      const attempts = get(2);
      setData({
        profile: get(0), journey: get(1),
        attempts: Array.isArray(attempts?.data) ? attempts.data : Array.isArray(attempts) ? attempts : [],
        reviewWords: Array.isArray(get(3)?.words) ? get(3).words : [],
        reviewUnavailable: results[3].status === 'rejected',
        certificates: Array.isArray(get(4)?.data) ? get(4).data : [],
      });
    }
    loadData();
    return () => { active = false; };
  }, []);

  if (!data) return <LearnerShell><LoadingSpinner /></LearnerShell>;

  const { profile, journey, attempts, reviewWords } = data;
  const configured = journey?.configured === true;
  const targets = journey?.targets;
  const progress = journey?.progress;
  const certificates = selectedCertificates(data.certificates, profile?.certGoals);
  const level = profile?.level?.name ?? profile?.level ?? 'Chưa thiết lập';
  const domainNames: string[] = Array.from(new Set<string>((profile?.domains ?? []).map((item: any) => item.domain?.name).filter(Boolean)));
  if (!domainNames.length && (profile?.domain?.name || profile?.itField)) domainNames.push(profile?.domain?.name || profile?.itField);
  const cert = profile?.certGoals?.[0]?.certificate?.name ?? profile?.targetCertification?.name ?? profile?.targetCert;
  const wordsLeft = Math.max(0, (targets?.vocabularyPerDay ?? 0) - (progress?.vocabularyToday ?? 0));
  const minutesLeft = Math.max(0, (targets?.minutesPerDay ?? 0) - (progress?.studyMinutesToday ?? 0));
  const examsLeft = Math.max(0, (targets?.examsPerWeek ?? 0) - (progress?.examsWeek ?? 0));
  const goalComplete = configured && wordsLeft === 0 && minutesLeft === 0;
  const heroTitle = !configured ? 'Bắt đầu hành trình học tiếng Anh CNTT'
    : goalComplete ? 'Bạn đã đạt mục tiêu học tập hôm nay!'
    : wordsLeft > 0 && minutesLeft > 0 ? `Còn ${wordsLeft} từ và ${minutesLeft} phút nữa là đạt mục tiêu hôm nay`
    : wordsLeft > 0 ? `Còn ${wordsLeft} từ nữa là đạt mục tiêu hôm nay`
    : `Còn ${minutesLeft} phút nữa là đạt mục tiêu hôm nay`;
  const metrics = configured ? [
    { label: 'Từ vựng', value: progress?.vocabularyToday ?? 0, target: targets.vocabularyPerDay, unit: 'từ', percent: progress?.vocabularyPercent, detail: wordsLeft ? `Học ${wordsLeft} từ nữa` : 'Đã đạt mục tiêu', href: studyHref },
    { label: 'Thời gian học', value: progress?.studyMinutesToday ?? 0, target: targets.minutesPerDay, unit: 'phút', percent: progress?.studyMinutesPercent, detail: minutesLeft ? `Còn ${minutesLeft} phút` : 'Đã đạt mục tiêu', href: undefined },
    { label: 'Bài thi tuần này', value: progress?.examsWeek ?? 0, target: targets.examsPerWeek, unit: 'bài', percent: progress?.examWeekPercent, detail: examsLeft ? `Làm ${examsLeft} bài nữa` : 'Đã đạt mục tiêu', href: '/learn/certifications' },
  ] : [];

  return <LearnerShell>
    <h1 className="sr-only">Tổng quan học tập</h1>
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)] lg:gap-6">
      <div className="min-w-0 space-y-5">
        <section aria-labelledby="continue-heading" className="rounded-2xl bg-primary p-6 text-white sm:p-7">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/80">Tiếp tục học</p>
          <h2 id="continue-heading" className="max-w-xl text-xl font-bold leading-snug sm:text-2xl">{heroTitle}</h2>
          <p className="mt-2 text-xs leading-5 text-white/85">{attempts[0] ? `Gần nhất: ${attempts[0].exam?.title ?? attempts[0].examTitle ?? 'Bài kiểm tra'}` : 'Mỗi ngày một chút, tiến gần hơn đến mục tiêu của bạn.'}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={!configured ? '/learn/profile?tab=goals' : goalComplete ? '/learn/flashcards' : studyHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary hover:bg-white/90">{!configured ? <Settings2 size={15} aria-hidden="true" /> : goalComplete ? <BookOpen size={15} aria-hidden="true" /> : <Play size={15} fill="currentColor" aria-hidden="true" />}{!configured ? 'Thiết lập mục tiêu' : goalComplete ? 'Khám phá từ vựng' : 'Học tiếp'}</Link>
            {configured && wordsLeft > 0 && <Link href={studyHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold hover:bg-white/10"><BookOpen size={15} aria-hidden="true" />Học {wordsLeft} từ còn lại</Link>}
          </div>
        </section>

        <section aria-labelledby="goals-heading" className={card}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div><h2 id="goals-heading" className="text-lg font-bold">Mục tiêu hôm nay</h2><p className="mt-1 text-xs text-on-surface-variant">{configured ? `Mục tiêu bài thi: ${targets.examsPerWeek} bài mỗi tuần` : 'Thiết lập mục tiêu phù hợp với lịch học của bạn.'}</p></div>
            <Link href="/learn/profile?tab=goals" className={`${outline} shrink-0`}><Settings2 size={14} aria-hidden="true" />{configured ? 'Điều chỉnh' : 'Thiết lập'}</Link>
          </div>
          {configured ? <>
            <div className="grid gap-3 sm:grid-cols-2">
              {metrics.map((metric, index) => {
                const goal = goalProgress(metric.value, metric.target, metric.unit);
                const percent = goal.percent;
                return <div key={metric.label} className={`rounded-xl border border-outline-variant/50 bg-background p-4 ${index === 2 ? 'sm:col-span-2' : ''}`}>
                  <h3 className="text-xs text-on-surface-variant">{metric.label}</h3>
                  <p aria-label={goal.description} className="mb-3 mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-1"><strong className="text-[30px] font-bold leading-none tabular-nums text-primary">{goal.value}</strong><span className="text-xs font-normal tabular-nums text-on-surface-variant">/ {goal.target || '—'} {metric.unit}</span></p>
                  <div role="progressbar" aria-label={metric.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-1.5 overflow-hidden rounded-full bg-surface-container-highest"><div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]"><span className="font-semibold text-primary">{percent}%</span>{metric.href ? <Link href={metric.href} className="inline-flex items-center gap-1 font-medium text-primary hover:underline">{goal.remaining > 0 ? metric.detail : goal.status}<ArrowRight size={12} aria-hidden="true" /></Link> : <span className="text-on-surface-variant">{goal.status}</span>}</div>
                </div>;
              })}
            </div>
            <p className="mt-4 text-xs leading-5 text-on-surface-variant">Mục tiêu dài hạn ({targets.examsPerMonth} bài/tháng, {targets.examsPerYear} bài/năm) xem tại <Link href="/learn/progress" className="font-semibold text-primary hover:underline">Tiến độ</Link>.</p>
            {targets.reminderEnabled && targets.reminderTime && <p className="mt-2 text-xs text-primary">Nhắc học lúc {targets.reminderTime} mỗi ngày</p>}
          </> : <Link href="/learn/profile?tab=goals" className={primary}><Settings2 size={14} aria-hidden="true" />Thiết lập lộ trình học tập</Link>}
        </section>

        <section aria-labelledby="review-heading" className={card}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 id="review-heading" className="text-lg font-bold">Từ cần ôn hôm nay</h2>{reviewWords.length > 0 && <Link href={reviewHref} className={`${outline} border-primary text-primary`}><RotateCcw size={14} aria-hidden="true" />Ôn tập ngay</Link>}</div>
          {reviewWords.length > 0 ? <div className="grid gap-3 sm:grid-cols-2">{reviewWords.slice(0, 4).map(word => <Link key={word.id} href={reviewHref} className="rounded-xl border border-outline-variant/60 p-4 transition-colors hover:border-primary hover:bg-primary/5"><h3 className="text-sm font-bold">{word.term}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-on-surface-variant">{word.definitionVi || word.definitionEn}</p></Link>)}</div>
            : <div className="rounded-xl border border-dashed border-outline-variant p-5 text-sm leading-6 text-on-surface-variant">{data.reviewUnavailable ? 'Chưa tải được danh sách từ cần ôn. Bạn có thể mở phần ôn tập để thử lại.' : 'Hôm nay chưa có từ đến hạn ôn. Tiếp tục học từ mới để duy trì tiến độ nhé.'}<Link href={data.reviewUnavailable ? reviewHref : '/learn/flashcards'} className="mt-2 inline-flex items-center gap-2 font-semibold text-primary hover:underline">{data.reviewUnavailable ? <RotateCcw size={14} aria-hidden="true" /> : <BookOpen size={14} aria-hidden="true" />}{data.reviewUnavailable ? 'Mở ôn tập' : 'Khám phá từ vựng'}</Link></div>}
        </section>

        {certificates.length > 0 && <section aria-labelledby="certificates-heading" className={card}><h2 id="certificates-heading" className="mb-4 text-lg font-bold">Lộ trình chứng chỉ</h2><div className="grid gap-3 sm:grid-cols-2">{certificates.map((certificate: any) => <Link key={certificate.id} href={`/learn/certifications/${certificate.id}`} className="rounded-xl border border-outline-variant/60 p-4 hover:border-primary"><p className="text-xs font-semibold text-primary">{certificate.code}</p><h3 className="mt-1 text-sm font-bold">{certificate.name}</h3><p className="mt-3 inline-flex items-center gap-1 text-xs text-primary"><Route size={14} aria-hidden="true" />Xem lộ trình</p></Link>)}</div></section>}
      </div>

      <aside className="min-w-0 space-y-5">
        <section aria-labelledby="profile-heading" className={card}>
          <h2 id="profile-heading" className="border-b border-outline-variant/60 pb-3 text-sm font-bold">Hồ sơ học tập</h2>
          <dl className="space-y-5 py-4 text-xs">
            <div><div className="flex items-center justify-between gap-3"><dt className="text-on-surface-variant">Trình độ</dt><dd><LevelBadge level={level} /></dd></div><p className="mt-2 text-[11px] text-on-surface-variant">Học theo trình độ hiện tại của bạn</p></div>
            <div className="flex items-start justify-between gap-3"><dt className="shrink-0 pt-1 text-on-surface-variant">Chuyên ngành IT</dt><dd className="min-w-0 text-right"><ul id="selected-it-domains" className="flex flex-wrap justify-end gap-1.5">{(showAllDomains ? domainNames : domainNames.slice(0, 1)).map(name => <li key={name} className="max-w-full break-words rounded-full bg-primary/10 px-2 py-1 font-medium text-primary">{name}</li>)}</ul>{!domainNames.length && 'Chưa thiết lập'}{domainNames.length > 1 && <button type="button" aria-expanded={showAllDomains} aria-controls="selected-it-domains" onClick={() => setShowAllDomains(shown => !shown)} className="mt-1 inline-flex items-center gap-1 py-1 font-semibold text-primary hover:underline">{showAllDomains ? <ChevronUp size={12} aria-hidden="true" /> : <ChevronDown size={12} aria-hidden="true" />}{showAllDomains ? 'Thu gọn' : `+${domainNames.length - 1} chuyên ngành`}</button>}</dd></div>
            <div className="flex items-start justify-between gap-3"><dt className="shrink-0 text-on-surface-variant">Mục tiêu chứng chỉ</dt><dd className="text-right font-semibold">{cert || 'Chưa thiết lập'}</dd></div>
          </dl>
          <Link href="/learn/profile?tab=goals" className={`${outline} w-full border-primary text-primary`}><Settings2 size={14} aria-hidden="true" />{cert ? 'Cập nhật hồ sơ' : 'Thiết lập ngay'}</Link>
        </section>

        <section aria-labelledby="results-heading" className={card}>
          <div className="mb-4 flex items-center justify-between gap-2"><h2 id="results-heading" className="text-sm font-bold">Kết quả kiểm tra gần đây</h2><Link href="/learn/progress" className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline">Tất cả<ArrowRight size={12} aria-hidden="true" /></Link></div>
          <div className="space-y-3">{attempts.length ? attempts.slice(0, 2).map(a => {
            const examId = a.exam?.id ?? a.examId;
            const score = a.score ?? a.correctCount;
            const total = a.totalQuestions ?? 100;
            const percent = Number(score) / Math.max(1, Number(total)) * 100;
            return <article key={a.id} className="rounded-xl border border-outline-variant/60 p-3">
              <div className="flex items-start justify-between gap-2"><h3 className="min-w-0 text-xs font-semibold leading-5">{a.exam?.title ?? a.examTitle ?? 'Bài kiểm tra'}</h3><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${score == null ? 'bg-surface-container text-on-surface-variant' : percent >= 70 ? 'bg-emerald-100 text-emerald-800' : percent >= 25 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-700'}`}>{score == null ? 'Chưa chấm' : `${score}/${total}`}</span></div>
              <p className="mb-3 mt-1 text-[11px] text-on-surface-variant">{formatRelativeDate(a.completedAt || a.submittedAt || a.startedAt)}</p>
              <div className="grid grid-cols-2 gap-2"><Link href={`/learn/quiz/result/${a.id}`} className={`${outline} px-2`}><Eye size={14} aria-hidden="true" />Xem kết quả</Link>{examId && <Link href={`/learn/quiz/${examId}`} className={primary}><RotateCcw size={14} aria-hidden="true" />Làm lại</Link>}</div>
            </article>;
          }) : <p className="text-sm leading-6 text-on-surface-variant">Bạn chưa có kết quả kiểm tra. <Link href="/learn/certifications" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"><ClipboardList size={14} aria-hidden="true" />Khám phá bài thi</Link></p>}</div>
        </section>
      </aside>
    </div>
  </LearnerShell>;
}

function formatRelativeDate(dateStr?: string | null): string {
  if (!dateStr) return 'Gần đây';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Gần đây';
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}
