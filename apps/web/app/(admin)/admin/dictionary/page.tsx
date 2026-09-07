'use client';
import * as React from 'react';
import { apiClient, type VocabularyItem, type PaginatedResponse } from '@/shared/api/api-client';

function Spinner() {
  return <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
}

export default function AdminDictionaryPage() {
  const [words, setWords] = React.useState<VocabularyItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const limit = 20;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  React.useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    apiClient.get<PaginatedResponse<VocabularyItem>>(`/vocabulary?${params}`)
      .then(res => { setWords(res?.data ?? []); setTotal(res?.meta?.total ?? 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Từ điển thuật ngữ IT</h1>
          <p className="text-sm text-on-surface-variant mt-1">Quản lý kho từ vựng chuyên ngành IT.</p>
        </div>
        <button className="bg-primary text-on-primary font-semibold text-sm px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Thêm từ vựng
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex gap-4 items-center">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-surface rounded-lg border border-outline-variant focus:border-primary outline-none text-on-surface"
            placeholder="Tìm từ vựng..." type="text"
          />
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Từ vựng</th>
                <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Phân loại</th>
                <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Lĩnh vực</th>
                <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Cấp độ</th>
                <th className="p-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center"><Spinner /></td></tr>
              ) : words.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant">Chưa có từ vựng nào</td></tr>
              ) : words.map(w => (
                <tr key={w.id} className="hover:bg-surface-container-high transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-on-surface">{w.term}</p>
                    <p className="text-xs text-on-surface-variant italic">{w.pronunciationIpa ?? ''}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{w.definitionVi ?? w.definitionEn}</p>
                  </td>
                  <td className="p-4 text-sm text-on-surface-variant">{w.partOfSpeech ?? '—'}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-secondary-fixed text-on-secondary-fixed">{w.domain?.name ?? 'N/A'}</span>
                  </td>
                  <td className="p-4 text-sm text-on-surface-variant">{w.level?.name ?? 'N/A'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${w.status === 'published' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                      {w.status === 'published' ? 'Đã đăng' : 'Nháp'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-outline-variant flex justify-between items-center">
          <span className="text-sm text-on-surface-variant">Hiển thị {words.length} / {total} từ vựng</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border border-outline-variant rounded text-sm hover:bg-surface-container disabled:opacity-50">Trước</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border border-outline-variant rounded text-sm hover:bg-surface-container disabled:opacity-50">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
