'use client';
import * as React from 'react';
import Link from 'next/link';
import { apiClient } from '@/shared/api/api-client';

function Spinner() {
  return <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
}

export default function AdminCommunityPage() {
  const [posts, setPosts] = React.useState<any[]>([]);
  const [trending, setTrending] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [workingId, setWorkingId] = React.useState('');
  const [error, setError] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    const [pr, tr] = await Promise.allSettled([
      apiClient.get<any>('/discussion/posts?limit=20'),
      apiClient.get<any>('/discussion/trending'),
    ]);
    if (pr.status === 'fulfilled') setPosts(pr.value?.data ?? pr.value?.posts ?? []);
    if (tr.status === 'fulfilled') setTrending(tr.value?.data ?? tr.value ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => { void load(); }, [load]);

  async function toggleLock(post: any) {
    const locking = !post.isLocked;
    const reason = locking ? window.prompt('Lý do khóa (không bắt buộc):', '') : '';
    if (locking && reason === null) return;
    setWorkingId(post.id); setError('');
    try { await apiClient.patch(`/discussion/admin/posts/${post.id}/lock`, { locked: locking, reason }); await load(); }
    catch (e: any) { setError(e.message || 'Không thể cập nhật bài viết'); }
    finally { setWorkingId(''); }
  }

  async function remove(post: any) {
    if (!window.confirm(`Xóa vĩnh viễn bài viết “${post.title}”? Bình luận và lượt thích cũng sẽ bị xóa.`)) return;
    setWorkingId(post.id); setError('');
    try { await apiClient.delete(`/discussion/admin/posts/${post.id}`); await load(); }
    catch (e: any) { setError(e.message || 'Không thể xóa bài viết'); }
    finally { setWorkingId(''); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Cộng đồng học tập</h1>
        <p className="text-sm text-on-surface-variant mt-1">Quản lý bài đăng, bình luận và hoạt động cộng đồng.</p>
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-on-surface">Bài đăng mới nhất</h2>
          {loading ? (
            <div className="p-8 text-center"><Spinner /></div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-xl">
              Chưa có bài đăng nào
            </div>
          ) : (
            posts.map((p: any) => (
              <div key={p.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed text-xs font-bold shrink-0">
                    {(p.author?.displayName ?? p.authorName ?? '?').slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-on-surface">{p.author?.displayName ?? p.authorName ?? 'Ẩn danh'}</span>
                  <span className="text-xs text-on-surface-variant ml-auto">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/admin/community/${p.id}`} className="mb-1 text-left font-semibold text-on-surface hover:text-primary hover:underline">{p.title}</Link>
                  {p.isLocked && <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Đã khóa</span>}
                </div>
                {p.content && <p className="text-sm text-on-surface-variant line-clamp-2">{p.content}</p>}
                {p.moderationReason && <p className="mt-2 text-xs text-amber-700">Lý do: {p.moderationReason}</p>}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-on-surface-variant">
                  <Link href={`/admin/community/${p.id}`} className="flex items-center gap-1 rounded-md px-1 hover:bg-surface-container hover:text-primary" title="Xem người đã thích">
                    <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                    {p._count?.votes ?? p.voteCount ?? p.upvotes ?? 0}
                  </Link>
                  <Link href={`/admin/community/${p.id}`} className="flex items-center gap-1 rounded-md px-1 hover:bg-surface-container hover:text-primary" title="Xem bình luận">
                    <span className="material-symbols-outlined text-[16px]">comment</span>
                    {p._count?.comments ?? p.commentCount ?? p.comments?.length ?? 0}
                  </Link>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">visibility</span>{p.viewCount ?? 0}</span>
                  <div className="ml-auto flex gap-2">
                    <button disabled={workingId === p.id} onClick={() => void toggleLock(p)} className="rounded-lg border border-outline-variant px-3 py-1.5 font-semibold text-on-surface hover:bg-surface-container disabled:opacity-50">
                      {p.isLocked ? 'Mở khóa' : 'Khóa'}
                    </button>
                    <button disabled={workingId === p.id} onClick={() => void remove(p)} className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Xóa</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          <h2 className="font-semibold text-on-surface mb-4">Chủ đề nổi bật</h2>
          {loading ? (
            <div className="p-4 text-center"><Spinner /></div>
          ) : trending.length === 0 ? (
            <div className="p-4 text-center text-on-surface-variant">Chưa có chủ đề</div>
          ) : (
            trending.map((t: any, i: number) => (
              <Link href={`/admin/community/${t.id}`} key={t.id ?? i} className="flex w-full items-center gap-3 border-b border-outline-variant py-3 text-left last:border-0 hover:bg-surface-container-low">
                <span className="text-lg font-bold text-primary w-6 text-center">{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{t.title ?? t.topic ?? t.name}</p>
                  <p className="text-xs text-on-surface-variant">{t._count?.comments ?? 0} bình luận · {t.viewCount ?? 0} lượt xem</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
