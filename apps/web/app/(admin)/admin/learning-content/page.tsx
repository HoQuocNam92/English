'use client';

import * as React from 'react';
import { PageHeader, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { VocabularyItem, PaginatedResponse } from '@/shared/api/api-client';

const STATUSES = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'draft', label: 'Bản nháp' },
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

export default function AdminLearningContentPage() {
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
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải kho từ vựng');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  React.useEffect(() => { void load(); }, [load]);

  return (
    <div>
      <PageHeader title="Kho nội dung từ vựng" description="Quản trị toàn bộ kho từ vựng và thuật ngữ chuyên ngành IT" />

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(sanitized) => {
            setPage(1);
            setSearch(sanitized);
          }}
          placeholder="Tìm kiếm từ vựng, thuật ngữ, định nghĩa tiếng Anh hoặc tiếng Việt..."
          maxLength={100}
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-sm text-on-surface focus:outline-none"
        >
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Summary */}
      {!loading && (
        <p className="mt-3 text-xs text-on-surface-variant">
          Tổng cộng {total} thuật ngữ IT {search && `— kết quả cho "${search}"`}
        </p>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Cards grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : items.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30">
            <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">translate</span>
            <p className="text-sm text-on-surface-variant">Không tìm thấy từ vựng nào</p>
          </div>
        ) : (
          items.map((v) => (
            <div key={v.id} className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 hover:shadow-sm transition-shadow flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-on-surface text-base">{v.term}</h3>
                    {v.pronunciationIpa && (
                      <p className="text-xs text-primary font-mono mt-0.5 font-medium">{v.pronunciationIpa}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {v.partOfSpeech && (
                      <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-semibold">
                        {PARTS_OF_SPEECH[v.partOfSpeech] ?? v.partOfSpeech}
                      </span>
                    )}
                    {v.status === 'published' ? (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Đã đăng</span>
                    ) : (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">Bản nháp</span>
                    )}
                  </div>
                </div>

                {/* Domain + Level */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  {v.domain && (
                    <span className="text-[11px] text-secondary bg-secondary/10 px-2 py-0.5 rounded-md font-medium">
                      {v.domain.name}
                    </span>
                  )}
                  {v.level && (
                    <span className="text-[11px] text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-md font-medium">
                      {v.level.name}
                    </span>
                  )}
                </div>

                {/* Definitions */}
                <div className="mt-3 space-y-1.5 text-xs">
                  <p className="text-on-surface leading-relaxed font-normal">{v.definitionEn}</p>
                  {v.definitionVi && (
                    <p className="text-on-surface-variant italic leading-relaxed">{v.definitionVi}</p>
                  )}
                </div>

                {/* Example */}
                {v.examples?.[0] && (
                  <div className="mt-3 border-t border-outline-variant/20 pt-2.5">
                    <p className="text-xs text-on-surface-variant line-clamp-2">
                      <span className="font-semibold text-on-surface">Ví dụ: </span>
                      {v.examples[0].sentenceEn}
                    </p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {v.tags?.length > 0 && (
                <div className="mt-3 pt-2 border-t border-outline-variant/20 flex flex-wrap gap-1">
                  {v.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
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
