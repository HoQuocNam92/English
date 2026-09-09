'use client';

import * as React from 'react';
import Link from 'next/link';
import { apiClient } from '@/shared/api/api-client';

export default function AdminCommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [detail, setDetail] = React.useState<any>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    apiClient.get(`/discussion/posts/${id}`).then(setDetail).catch((cause: any) => setError(cause.message || 'Không thể tải bài viết'));
  }, [id]);

  if (error) return <div className="rounded-xl bg-error-container p-4 text-on-error-container">{error}</div>;
  if (!detail) return <div className="flex min-h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return <div className="mx-auto w-full max-w-[1400px] space-y-6">
    <Link href="/admin/community" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><span className="material-symbols-outlined text-[18px]">arrow_back</span>Quay lại cộng đồng</Link>
    <article className="rounded-2xl border border-outline-variant bg-white p-6 md:p-8"><p className="text-sm text-on-surface-variant">Đăng bởi {detail.user?.userDetail?.displayName || detail.user?.email || 'Ẩn danh'} · {new Date(detail.createdAt).toLocaleString('vi-VN')}</p><h1 className="mt-2 text-3xl font-bold">{detail.title}</h1><div className="mt-6 whitespace-pre-wrap text-base leading-7">{detail.content}</div></article>
    <div className="grid gap-6 lg:grid-cols-3"><section className="rounded-2xl border border-outline-variant bg-white p-6 lg:col-span-2"><h2 className="text-xl font-bold">Bình luận ({detail.comments?.length || 0})</h2><div className="mt-4 space-y-3">{detail.comments?.length ? detail.comments.map((comment: any) => <article key={comment.id} className="rounded-xl bg-surface-container-low p-4"><p className="text-sm font-bold">{comment.user?.userDetail?.displayName || comment.user?.email || 'Ẩn danh'}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{comment.content}</p><p className="mt-2 text-xs text-on-surface-variant">{new Date(comment.createdAt).toLocaleString('vi-VN')}</p></article>) : <p className="text-sm text-on-surface-variant">Chưa có bình luận.</p>}</div></section><aside className="rounded-2xl border border-outline-variant bg-white p-6"><h2 className="text-xl font-bold">Lượt thích ({detail.votes?.length || 0})</h2><div className="mt-4 space-y-2">{detail.votes?.map((vote: any) => <div key={vote.id} className="rounded-xl bg-surface-container-low p-3 text-sm font-semibold">{vote.user?.userDetail?.displayName || vote.user?.email || 'Thành viên'}</div>)}</div></aside></div>
  </div>;
}
