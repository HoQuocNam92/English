'use client';
import * as React from 'react';
import { apiClient } from '@/shared/api/api-client';

function Spinner() {
  return <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
}

export default function AdminReadingLabPage() {
  const [articles, setArticles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const totalPages = Math.max(1, Math.ceil(total / 20));

  React.useEffect(() => {
    setLoading(true);
    apiClient.get<any>(`/reading-lab/articles?page=${page}&limit=20`)
      .then(res => {
        setArticles(res?.data ?? res ?? []);
        setTotal(res?.meta?.total ?? (Array.isArray(res) ? res.length : 0));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Phòng đọc IT</h1>
          <p className="text-sm text-on-surface-variant mt-1">Quản lý bài đọc kỹ thuật tiếng Anh chuyên ngành.</p>
        </div>
        <button className="bg-primary text-on-primary font-semibold text-sm px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm bài đọc
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center"><Spinner /></div>
      ) : articles.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-outline block mb-3">article</span>
          <p className="text-on-surface-variant">Chưa có bài đọc nào</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {articles.map((a: any) => (
              <div key={a.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 hover:shadow-sm transition-all flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-secondary-fixed text-on-secondary-fixed font-bold">
                    {a.category ?? a.level?.name ?? 'IT'}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {a.readingTime ?? a.estimatedMinutes ?? '—'} phút đọc
                  </span>
                </div>
                <h3 className="font-semibold text-on-surface text-sm line-clamp-2">{a.title}</h3>
                {a.summary && <p className="text-xs text-on-surface-variant line-clamp-2">{a.summary}</p>}
                <div className="flex justify-between items-center mt-auto pt-2 border-t border-outline-variant">
                  <span className="text-xs text-on-surface-variant">
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString('vi-VN') : ''}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${a.status === 'published' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                    {a.status === 'published' ? 'Đã đăng' : 'Nháp'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-on-surface-variant">Tổng {total} bài đọc</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border border-outline-variant rounded text-sm hover:bg-surface-container disabled:opacity-50">Trước</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border border-outline-variant rounded text-sm hover:bg-surface-container disabled:opacity-50">Sau</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
