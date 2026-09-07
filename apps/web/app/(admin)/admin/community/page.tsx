'use client';
import * as React from 'react';
import { apiClient } from '@/shared/api/api-client';

function Spinner() {
  return <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
}

export default function AdminCommunityPage() {
  const [posts, setPosts] = React.useState<any[]>([]);
  const [trending, setTrending] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.allSettled([
      apiClient.get<any>('/discussion/posts?limit=20'),
      apiClient.get<any>('/discussion/trending'),
    ]).then(([pr, tr]) => {
      if (pr.status === 'fulfilled') setPosts(pr.value?.data ?? pr.value?.posts ?? []);
      if (tr.status === 'fulfilled') setTrending(tr.value?.data ?? tr.value ?? []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">Cộng đồng học tập</h1>
        <p className="text-sm text-on-surface-variant mt-1">Quản lý bài đăng, bình luận và hoạt động cộng đồng.</p>
      </div>

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
                <h3 className="font-semibold text-on-surface mb-1">{p.title}</h3>
                {p.content && <p className="text-sm text-on-surface-variant line-clamp-2">{p.content}</p>}
                <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                    {p.voteCount ?? p.upvotes ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">comment</span>
                    {p.commentCount ?? p.comments?.length ?? 0}
                  </span>
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
              <div key={t.id ?? i} className="flex items-center gap-3 py-3 border-b border-outline-variant last:border-0">
                <span className="text-lg font-bold text-primary w-6 text-center">{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{t.title ?? t.topic ?? t.name}</p>
                  <p className="text-xs text-on-surface-variant">{t.postCount ?? t.count ?? 0} bài đăng</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
