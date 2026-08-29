'use client';

import * as React from 'react';
import { PageHeader } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { VocabularyItem, PaginatedResponse } from '@/shared/api/api-client';

const STATUSES = [
  { value: '', label: 'Tất cả' },
  { value: 'published', label: 'Đã đăng' },
  { value: 'draft', label: 'Nháp' },
];

const PARTS_OF_SPEECH: Record<string, string> = {
  noun: 'Danh từ',
  verb: 'Động từ',
  adjective: 'Tính từ',
  adverb: 'Trạng từ',
  phrase: 'Cụm từ',
  abbreviation: 'Viết tắt',
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 space-y-3 animate-pulse">
      <div className="h-5 w-2/3 rounded bg-outline-variant/20" />
      <div className="h-3 w-1/4 rounded bg-outline-variant/20" />
      <div className="h-4 w-full rounded bg-outline-variant/20" />
      <div className="h-4 w-4/5 rounded bg-outline-variant/20" />
    </div>
  );
}

export default function TeacherVocabularyPage() {
  const [items, setItems] = React.useState<VocabularyItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const limit = 12;

  const totalPages = Math.ceil(total / limit);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(status && { status }),
      });
      const res = await apiClient.get<PaginatedResponse<VocabularyItem>>(`/vocabulary?${params}`);
      setItems(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải từ vựng');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  React.useEffect(() => { void load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div>
      <PageHeader title="Nội dung từ vựng" description="Quản lý từ vựng IT" />

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo từ hoặc định nghĩa..."
            className="flex-1 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Tìm
          </button>
        </form>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface focus:outline-none"
        >
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Summary */}
      {!loading && (
        <p className="mt-3 text-xs text-on-surface-variant">
          {total} từ vựng{search && ` — kết quả cho "${search}"`}
        </p>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm">{error}</div>
      )}

      {/* Cards grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : items.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">translate</span>
            <p className="text-sm text-on-surface-variant">Không tìm thấy từ vựng</p>
          </div>
        ) : (
          items.map((v) => (
            <div key={v.id} className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 hover:shadow-sm transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-on-surface text-base">{v.term}</h3>
                  {v.pronunciationIpa && (
                    <p className="text-xs text-on-surface-variant font-mono mt-0.5">{v.pronunciationIpa}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {v.partOfSpeech && (
                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {PARTS_OF_SPEECH[v.partOfSpeech] ?? v.partOfSpeech}
                    </span>
                  )}
                  {v.status === 'published' ? (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Đã đăng</span>
                  ) : (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Nháp</span>
                  )}
                </div>
              </div>

              {/* Domain + Level */}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {v.domain && (
                  <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                    {v.domain.name}
                  </span>
                )}
                {v.level && (
                  <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                    {v.level.name}
                  </span>
                )}
              </div>

              {/* Definitions */}
              <div className="mt-3 space-y-1.5">
                <p className="text-sm text-on-surface leading-relaxed">{v.definitionEn}</p>
                {v.definitionVi && (
                  <p className="text-xs text-on-surface-variant italic">{v.definitionVi}</p>
                )}
              </div>

              {/* Example */}
              {v.examples?.[0] && (
                <div className="mt-3 border-t border-outline-variant/20 pt-3">
                  <p className="text-xs text-on-surface-variant line-clamp-2">
                    <span className="font-medium">Ví dụ: </span>
                    {v.examples[0].sentenceEn}
                  </p>
                </div>
              )}

              {/* Tags */}
              {v.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {v.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="text-xs text-on-surface-variant bg-outline-variant/10 px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-on-surface-variant">Trang {page}/{totalPages}</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-xl text-sm border border-outline-variant disabled:opacity-40 hover:bg-surface-container transition-colors"
            >
              ← Trước
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-xl text-sm border border-outline-variant disabled:opacity-40 hover:bg-surface-container transition-colors"
            >
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
