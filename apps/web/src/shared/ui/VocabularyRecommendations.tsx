'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/shared/api/api-client';
import { LevelBadge } from './LevelBadge';
import { AppIcon } from './AppIcon';

type Group = { domain: { code: string; name: string }; level: { code: string; name: string }; total: number; remaining: number; samples: { id: string; term: string }[] };
export function VocabularyRecommendations() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    apiClient.get<{ groups: Group[] }>('/vocab-study/recommendations')
      .then(result => { if (active) setGroups(result.groups); })
      .catch(() => { if (active) setError('Không thể tải đề xuất từ vựng.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return <section className="mt-7" aria-label="Từ vựng theo lộ trình">
    <h2 className="text-xl font-black text-on-surface">Từ vựng theo lộ trình của bạn</h2>
    <p className="mt-2 text-sm text-on-surface-variant">Chọn bộ từ đúng trình độ và lĩnh vực trong mục tiêu học tập. Phiên học mới chỉ lấy những từ bạn chưa học.</p>
    {loading ? <p role="status" className="mt-4 text-sm">Đang tải đề xuất...</p> : error ? <p role="alert" className="mt-4 text-sm text-rose-600">{error}</p> : groups.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{groups.map(group => <article key={group.domain.code} className="rounded-2xl border border-primary/20 bg-white p-5">
      <div className="flex items-center gap-2"><LevelBadge level={group.level} /><span className="text-xs text-on-surface-variant">{group.total} từ · {group.remaining} từ chưa học</span></div>
      <h3 className="mt-3 font-bold">{group.domain.name}</h3>
      <div className="mt-3 flex flex-wrap gap-2">{group.samples.map(word => <span key={word.id} className="rounded-lg bg-primary/5 px-2.5 py-1 text-sm text-primary">{word.term}</span>)}</div>
      {group.remaining > 0 ? <Link href={`/learn/flashcards/all/practice?domainCode=${encodeURIComponent(group.domain.code)}&levelCode=${encodeURIComponent(group.level.code)}`} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">Học từ vựng này<AppIcon className="text-[18px]">arrow_forward</AppIcon></Link> : <Link href="/learn/flashcards/review/practice" className="mt-4 inline-block text-sm font-bold text-primary">Đã học hết bộ từ · Ôn tập từ đến hạn</Link>}
    </article>)}</div> : <p className="mt-4 rounded-xl border border-outline-variant/50 bg-white p-4 text-sm text-on-surface-variant">Chưa có bộ từ phù hợp với lĩnh vực và trình độ đã chọn. <Link href="/learn/profile" className="font-semibold text-primary">Cập nhật lộ trình</Link></p>}
  </section>;
}
