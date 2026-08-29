'use client';

import * as React from 'react';
import { PageHeader } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { QuestionItem, PaginatedResponse } from '@/shared/api/api-client';

const QUESTION_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  single_choice: { label: 'Chọn một', icon: 'radio_button_checked', color: 'text-blue-600' },
  multiple_choice: { label: 'Chọn nhiều', icon: 'check_box', color: 'text-purple-600' },
  true_false: { label: 'Đúng/Sai', icon: 'toggle_on', color: 'text-green-600' },
  short_answer: { label: 'Trả lời ngắn', icon: 'edit', color: 'text-orange-600' },
  scenario: { label: 'Tình huống', icon: 'psychology', color: 'text-red-600' },
};

const STATUSES = [
  { value: '', label: 'Tất cả' },
  { value: 'published', label: 'Đã đăng' },
  { value: 'draft', label: 'Nháp' },
];

function SkeletonRow() {
  return (
    <div className="p-4 border-b border-outline-variant/20 space-y-2 animate-pulse">
      <div className="h-4 w-3/4 rounded bg-outline-variant/20" />
      <div className="h-3 w-1/2 rounded bg-outline-variant/20" />
    </div>
  );
}

export default function TeacherQuestionsPage() {
  const [items, setItems] = React.useState<QuestionItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const limit = 10;

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
      const res = await apiClient.get<PaginatedResponse<QuestionItem>>(`/questions?${params}`);
      setItems(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải câu hỏi');
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
      <PageHeader title="Ngân hàng câu hỏi" description="Câu hỏi của bạn và câu hỏi công khai" />

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm câu hỏi..."
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

      {!loading && (
        <p className="mt-3 text-xs text-on-surface-variant">{total} câu hỏi</p>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm">{error}</div>
      )}

      {/* Question list */}
      <div className="mt-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">quiz</span>
            <p className="text-sm text-on-surface-variant">Không tìm thấy câu hỏi</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/20">
            {items.map((q, idx) => {
              const qType = QUESTION_TYPES[q.type] ?? { label: q.type, icon: 'help', color: 'text-gray-500' };
              const isExpanded = expanded === q.id;
              return (
                <div key={q.id}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : q.id)}
                    className="w-full text-left px-5 py-4 hover:bg-surface-container/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Number */}
                      <span className="text-xs font-mono text-on-surface-variant mt-0.5 w-6 shrink-0">
                        {(page - 1) * limit + idx + 1}.
                      </span>
                      {/* Icon + type */}
                      <span className={`material-symbols-outlined text-[18px] mt-0.5 ${qType.color} shrink-0`}>
                        {qType.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-surface line-clamp-2">{q.prompt}</p>
                        <div className="mt-1.5 flex flex-wrap gap-2 items-center">
                          <span className="text-xs text-on-surface-variant">{qType.label}</span>
                          {q.domain && (
                            <span className="text-xs text-on-surface-variant">· {q.domain.name}</span>
                          )}
                          {q.level && (
                            <span className="text-xs text-on-surface-variant">· {q.level.name}</span>
                          )}
                          <span className="text-xs text-on-surface-variant">· {q.points} điểm</span>
                          {q.status === 'published' ? (
                            <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Đã đăng</span>
                          ) : (
                            <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Nháp</span>
                          )}
                        </div>
                      </div>
                      <span className={`material-symbols-outlined text-[18px] text-on-surface-variant transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-14 pb-5 space-y-4">
                      {/* Context */}
                      {q.context && (
                        <div className="bg-surface-container rounded-xl p-3">
                          <p className="text-xs font-medium text-on-surface-variant mb-1">Ngữ cảnh:</p>
                          <p className="text-sm text-on-surface">{q.context}</p>
                        </div>
                      )}

                      {/* Options */}
                      {q.options && q.options.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-on-surface-variant">Các lựa chọn:</p>
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
                                opt.isCorrect
                                  ? 'bg-green-50 border border-green-200'
                                  : 'bg-surface-container border border-outline-variant/20'
                              }`}
                            >
                              <span className={`font-bold w-5 shrink-0 ${opt.isCorrect ? 'text-green-600' : 'text-on-surface-variant'}`}>
                                {opt.key}.
                              </span>
                              <div className="flex-1">
                                <p className={opt.isCorrect ? 'text-green-800 font-medium' : 'text-on-surface'}>
                                  {opt.text}
                                  {opt.isCorrect && <span className="ml-2 text-green-600">✓</span>}
                                </p>
                                {opt.explanation && (
                                  <p className="text-xs text-on-surface-variant mt-1 italic">{opt.explanation}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                          <p className="text-xs font-medium text-blue-600 mb-1">Giải thích:</p>
                          <p className="text-sm text-blue-800">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
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
