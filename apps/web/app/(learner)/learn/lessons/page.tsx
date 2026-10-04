'use client';
import { AppIcon } from '@/shared/ui/AppIcon';

import { Dropdown } from '@/shared/ui/Dropdown';
import { filterLessons, type CatalogLesson, type LessonProfile } from '@/shared/lib/lesson-catalog';
import { LevelBadge } from '@/shared/ui/LevelBadge';
import { VocabularyRecommendations } from '@/shared/ui/VocabularyRecommendations';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LearnerShell } from '@/shared/layout';
import { apiClient } from '@/shared/api/api-client';
import { lessonTracks, lessonTrackByType } from '@/shared/lib/lesson-tracks';
import { LearningActivities } from './learning-activities';

type Lesson = CatalogLesson;

const accentClasses: Record<string, { icon: string; badge: string; border: string; nav: string }> = {
  teal: { icon: 'bg-primary/10 text-primary', badge: 'bg-primary/10 text-primary', border: 'border-t-primary', nav: 'border-primary/30 bg-primary/5 text-on-surface' },
  blue: { icon: 'bg-primary/10 text-primary', badge: 'bg-primary/10 text-primary', border: 'border-t-primary', nav: 'border-primary/30 bg-primary/5 text-on-surface' },
  violet: { icon: 'bg-primary/10 text-primary', badge: 'bg-primary/10 text-primary', border: 'border-t-primary', nav: 'border-primary/30 bg-primary/5 text-on-surface' },
  indigo: { icon: 'bg-primary/10 text-primary', badge: 'bg-primary/10 text-primary', border: 'border-t-primary', nav: 'border-primary/30 bg-primary/5 text-on-surface' },
  amber: { icon: 'bg-primary/10 text-primary', badge: 'bg-primary/10 text-primary', border: 'border-t-primary', nav: 'border-primary/30 bg-primary/5 text-on-surface' },
};

function LessonCatalog() {
  const params = useSearchParams();
  const activeTrack = lessonTrackByType(params.get('type') ?? '');
  const type = activeTrack?.type ?? '';
  const [query, setQuery] = useState('');
  const [domainCode, setDomainCode] = useState('');
  const [certificateId, setCertificateId] = useState('');
  const [vocabulary, setVocabulary] = useState('all');
  const [scope, setScope] = useState('path');
  const [profile, setProfile] = useState<LessonProfile | null>(null);
  const [items, setItems] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let current = true;
    setLoading(true); setError('');
    const load = async () => {
      try {
        const [learnerProfile, results] = await Promise.all([
          apiClient.get<LessonProfile>('/learner-profiles/me'),
          Promise.all((type ? [type] : lessonTracks.map(track => track.type)).map(async lessonType => {
            const collected: Lesson[] = [];
            let page = 1;
            let totalPages = 1;
            do {
              const search = new URLSearchParams({ limit: '100', page: String(page), status: 'published', type: lessonType });
              const result = await apiClient.get<{ data: Lesson[]; meta?: { totalPages: number } }>(`/lessons?${search}`);
              collected.push(...(result?.data ?? []));
              totalPages = result?.meta?.totalPages ?? 1;
              page += 1;
            } while (page <= totalPages);
            return collected;
          })),
        ]);
        if (current) { setItems(results.flat()); setProfile(learnerProfile); }
      } catch (cause: any) {
        if (current) setError(cause?.message ?? 'Không thể tải bài học.');
      } finally { if (current) setLoading(false); }
    };
    void load();
    return () => { current = false; };
  }, [type, reload]);

  const domains = Array.from(new Map(items.filter(item => item.domain).map(item => [item.domain!.code, item.domain!])).values());
  const certificates = Array.from(new Map(items.flatMap(item => item.certificates ?? []).map(link => [link.certificate.id, link.certificate])).values());
  const vocabularyOptions = Array.from(new Map(items.flatMap(item => item.vocabularies ?? []).map(link => [link.vocabulary.id, link.vocabulary])).values());
  const hasPath = Boolean(profile?.domains?.length || profile?.certGoals?.length);
  const visible = useMemo(() => filterLessons(items, profile, { query, domainCode, certificateId, vocabulary, scope }), [items, profile, query, domainCode, certificateId, vocabulary, scope]);

  return <LearnerShell><div className="pb-12">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-widest text-primary">Không gian học tập</p><h1 className="mt-2 text-3xl font-black text-on-surface">Bài học chuyên ngành</h1><p className="mt-2 text-sm text-on-surface-variant">Học tiếng Anh qua thuật ngữ, tài liệu và tình huống thực tế trong IT.</p></div>
      <label className="learner-header-search flex h-11 min-w-0 items-center gap-2 rounded-xl border border-outline-variant bg-white px-3 lg:w-72"><AppIcon className=" text-[20px] text-on-surface-variant">search</AppIcon><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm bài học, lĩnh vực, chứng chỉ, từ vựng..." aria-label="Tìm bài học chuyên ngành" className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm outline-none" /></label>
    </header>


    <nav className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7" aria-label="Không gian học tập">
      <Link href="/learn/lessons" aria-current={!type ? 'page' : undefined} className={`group rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${!type ? 'border-primary bg-primary !text-white' : 'border-outline-variant/60 bg-white text-on-surface'}`}><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${!type ? 'bg-white/15' : 'bg-slate-100'}`}><AppIcon className=" text-[20px]">explore</AppIcon></span><p className="mt-4 text-[10px] font-black uppercase tracking-widest opacity-65">Khám phá</p><strong className="mt-1 block text-sm">Tất cả chuyên đề</strong></Link>
      {lessonTracks.map(track => { const accent = accentClasses[track.accent]; const active = type === track.type; return <Link key={track.type} href={`/learn/lessons?type=${track.type}`} aria-current={active ? 'page' : undefined} className={`group relative overflow-hidden rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${active ? 'border-primary bg-primary !text-white' : 'border-outline-variant/60 bg-white text-on-surface'}`}><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? 'bg-white/15 !text-white' : accent.icon}`}><AppIcon className=" text-[20px]">{track.icon}</AppIcon></span><p className="mt-4 text-[10px] font-black uppercase tracking-widest opacity-60">{track.eyebrow}</p><strong className="mt-1 block text-sm leading-5">{track.label}</strong>{active && <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-current" />}</Link>; })}
      <Link href="/learn/flashcards" className="group rounded-2xl border border-outline-variant/60 bg-white p-4 text-on-surface transition hover:-translate-y-0.5 hover:shadow-sm">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><AppIcon className="text-[20px]">sort_by_alpha</AppIcon></span>
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest opacity-60">Ôn tập từ vựng CNTT</p>
        <strong className="mt-1 block text-sm leading-5">Luyện từ vựng</strong>
      </Link>
    </nav>

    <div className="mt-6 grid gap-3 rounded-2xl border border-outline-variant/50 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
      <Dropdown aria-label="Phạm vi bài học" value={scope} onChange={event => setScope(event.target.value)}><option value="path">Theo lộ trình của tôi</option><option value="all">Tất cả bài học</option></Dropdown>
      <Dropdown aria-label="Lọc lĩnh vực" value={domainCode} onChange={event => setDomainCode(event.target.value)}><option value="">Tất cả lĩnh vực</option>{domains.map(domain => <option key={domain.code} value={domain.code}>{domain.name}</option>)}</Dropdown>
      <Dropdown aria-label="Lọc chứng chỉ" value={certificateId} onChange={event => setCertificateId(event.target.value)}><option value="">Tất cả chứng chỉ</option>{certificates.map(certificate => <option key={certificate.id} value={certificate.id}>{certificate.name}</option>)}</Dropdown>
      <Dropdown aria-label="Lọc từ vựng" value={vocabulary} onChange={event => setVocabulary(event.target.value)}><option value="all">Tất cả nội dung từ vựng</option><option value="with">Có từ vựng liên kết</option><option value="without">Chưa có từ vựng liên kết</option>{vocabularyOptions.map(word => <option key={word.id} value={word.id}>{word.term}</option>)}</Dropdown>
      <button type="button" className="text-left text-sm font-semibold text-primary" onClick={() => { setQuery(''); setDomainCode(''); setCertificateId(''); setVocabulary('all'); }}>Xóa bộ lọc</button>
    </div>
    {!loading && scope === 'path' && <p className="mt-3 text-sm text-on-surface-variant">{hasPath ? 'Đề xuất theo lĩnh vực, chứng chỉ mục tiêu và trình độ trong hồ sơ của bạn.' : 'Bạn chưa chọn lộ trình. Cập nhật mục tiêu trong hồ sơ hoặc chọn Tất cả bài học để khám phá.'} <Link href="/learn/profile" className="font-semibold text-primary">Cập nhật lộ trình</Link></p>}

    {!type && <VocabularyRecommendations />}

    <section className="mt-9"><div className="flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs font-black uppercase tracking-widest text-primary">{activeTrack?.eyebrow ?? 'Nội dung đã xuất bản'}</p><h2 className="mt-1 text-xl font-black text-on-surface">{scope === 'path' ? 'Bài học theo lộ trình của bạn' : activeTrack ? `Bài học ${activeTrack.label}` : 'Tất cả bài học chuyên ngành'}</h2></div>{!loading && !error && <span className="text-sm text-on-surface-variant">{visible.length} bài phù hợp</span>}</div>
      {activeTrack && <p className="mt-3 rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-on-surface-variant"><strong className="text-on-surface">Cách học:</strong> {activeTrack.focus}</p>}
      {error && <div role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => setReload(value => value + 1)} className="mt-3 rounded-lg border border-red-300 px-4 py-2 font-semibold">Thử lại</button></div>}
      {loading ? <div role="status" aria-label="Đang tải bài học" className="mt-5 grid gap-4 md:grid-cols-2">{[0, 1, 2, 3].map(index => <div key={index} className="animate-pulse rounded-2xl border border-outline-variant/50 bg-white p-5"><div className="h-5 w-24 rounded bg-slate-100" /><div className="mt-4 h-6 w-3/4 rounded bg-slate-100" /><div className="mt-3 h-4 rounded bg-slate-100" /><div className="mt-2 h-4 w-2/3 rounded bg-slate-100" /></div>)}</div> : error ? null : visible.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{visible.map(item => { const track = lessonTrackByType(item.type); const accent = accentClasses[track?.accent ?? 'indigo']; return <article key={item.id} className="content-card rounded-2xl border border-outline-variant/50 bg-white p-5 shadow-xs"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${accent.badge}`}>{track?.label ?? 'Bài học'}</span><span className="text-xs text-on-surface-variant">{item.estimatedMinutes} phút</span><LevelBadge level={item.level} /></div><h3 className="mt-4 text-lg font-black text-on-surface">{item.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-on-surface-variant">{item.summary}</p>{item.keyConcepts?.length ? <div className="mt-4 flex flex-wrap gap-1.5">{item.keyConcepts.slice(0, 3).map(concept => <span key={concept} className="rounded-md bg-surface-container-low px-2 py-1 text-xs text-on-surface-variant">{concept}</span>)}</div> : null}<div className="content-card-footer flex items-center justify-between gap-3 border-t border-outline-variant/40 pt-4"><span className="text-xs font-semibold text-on-surface-variant">{item.domain?.name ?? 'Chuyên ngành CNTT'}</span><Link href={`/learn/lessons/${item.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-primary">{track?.action ?? 'Vào học'}<AppIcon className=" text-[18px]">arrow_forward</AppIcon></Link></div></article>; })}</div> : <div className="mt-5 rounded-2xl border border-dashed border-outline-variant bg-white px-5 py-14 text-center"><AppIcon className=" text-4xl text-outline">menu_book</AppIcon><p className="mt-3 font-bold">Chưa có bài học phù hợp</p><p className="mt-1 text-sm text-on-surface-variant">Hãy chọn chuyên đề khác hoặc đổi từ khóa.</p></div>}
    </section>
    {!type && scope === 'all' && <LearningActivities />}
  </div></LearnerShell>;
}

export default function LessonsPage() { return <Suspense><LessonCatalog /></Suspense>; }
