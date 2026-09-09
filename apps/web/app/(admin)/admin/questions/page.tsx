'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader, Pagination, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { ExamItem, QuestionItem, PaginatedResponse } from '@/shared/api/api-client';

const QUESTION_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  single_choice: { label: 'Chọn một đáp án', icon: 'radio_button_checked', color: 'text-blue-600' },
  multiple_choice: { label: 'Chọn nhiều đáp án', icon: 'check_box', color: 'text-purple-600' },
  true_false: { label: 'Đúng / Sai', icon: 'toggle_on', color: 'text-green-600' },
  short_answer: { label: 'Trả lời ngắn', icon: 'edit', color: 'text-orange-600' },
  scenario: { label: 'Tình huống kỹ thuật', icon: 'psychology', color: 'text-red-600' },
};

const STATUSES = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'draft', label: 'Bản nháp' },
];

type FilterOption = { id: string; code?: string; name?: string; title?: string };

function SkeletonRow() {
  return (
    <div className="p-4 border-b border-outline-variant/20 space-y-2 animate-pulse">
      <div className="h-4 w-3/4 rounded bg-outline-variant/20" />
      <div className="h-3 w-1/2 rounded bg-outline-variant/20" />
    </div>
  );
}

export default function AdminQuestionsPage() {
  const [items, setItems] = React.useState<QuestionItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [type, setType] = React.useState('');
  const [domainCode, setDomainCode] = React.useState('');
  const [examId, setExamId] = React.useState('');
  const [domains, setDomains] = React.useState<FilterOption[]>([]);
  const [exams, setExams] = React.useState<FilterOption[]>([]);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
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
        ...(type && { type }),
        ...(domainCode && { domainCode }),
        ...(examId && { examId }),
      });
      const res = await apiClient.get<PaginatedResponse<QuestionItem>>(`/questions?${params}`);
      setItems(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải ngân hàng câu hỏi');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, type, domainCode, examId]);

  React.useEffect(() => { void load(); }, [load]);

  React.useEffect(() => {
    void Promise.all([
      apiClient.get<{ data: FilterOption[] } | FilterOption[]>('/domains'),
      apiClient.get<PaginatedResponse<ExamItem>>('/exams?page=1&limit=100'),
    ]).then(([domainResult, examResult]) => {
      setDomains(Array.isArray(domainResult) ? domainResult : domainResult.data);
      setExams(examResult.data);
    }).catch(() => undefined);
  }, []);

  const handleDelete = async (question: QuestionItem) => {
    if (!window.confirm(`Xóa câu hỏi “${question.prompt.slice(0, 80)}${question.prompt.length > 80 ? '…' : ''}”? Câu hỏi cũng sẽ được gỡ khỏi các bộ đề liên quan.`)) return;
    setDeletingId(question.id);
    setError(null);
    try {
      await apiClient.delete(`/questions/${question.id}`);
      if (items.length === 1 && page > 1) setPage((current) => current - 1);
      else await load();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể xóa câu hỏi');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Ngân hàng câu hỏi" description="Quản lý toàn bộ câu hỏi luyện tập và thi trắc nghiệm IT" />
        <Link href="/admin/questions/editor" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold !text-white shadow-sm"><span className="material-symbols-outlined text-[19px]">add</span>Thêm câu hỏi</Link>
      </div>

      {/* Filters */}
      <div className="mt-5 rounded-2xl bg-surface-container-lowest p-4 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-on-surface-variant">
          <span className="font-semibold text-on-surface">Chú giải loại câu hỏi:</span>
          {Object.entries(QUESTION_TYPES).map(([key, item]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span className={`material-symbols-outlined text-[17px] ${item.color}`}>{item.icon}</span>
              {item.label}
            </span>
          ))}
        </div>
        <div className="grid gap-3 xl:grid-cols-[minmax(280px,1fr)_190px_190px_240px_180px]">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(sanitized) => {
            setPage(1);
            setSearch(sanitized);
          }}
          placeholder="Tìm kiếm câu hỏi theo nội dung, từ khóa, tình huống..."
          maxLength={100}
        />
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="rounded-xl bg-surface-container-lowest px-3 py-2 text-sm text-on-surface shadow-[inset_0_0_0_1px_rgba(99,102,241,0.16)] focus:outline-none"
          aria-label="Lọc theo loại câu hỏi"
        >
          <option value="">Tất cả loại câu hỏi</option>
          {Object.entries(QUESTION_TYPES).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
        </select>
        <select
          value={domainCode}
          onChange={(e) => { setDomainCode(e.target.value); setPage(1); }}
          className="rounded-xl bg-surface-container-lowest px-3 py-2 text-sm text-on-surface shadow-[inset_0_0_0_1px_rgba(99,102,241,0.16)] focus:outline-none"
          aria-label="Lọc theo chuyên ngành"
        >
          <option value="">Tất cả chuyên ngành</option>
          {domains.map((domain) => <option key={domain.id} value={domain.code}>{domain.name}</option>)}
        </select>
        <select
          value={examId}
          onChange={(e) => { setExamId(e.target.value); setPage(1); }}
          className="rounded-xl bg-surface-container-lowest px-3 py-2 text-sm text-on-surface shadow-[inset_0_0_0_1px_rgba(99,102,241,0.16)] focus:outline-none"
          aria-label="Lọc theo bộ đề"
        >
          <option value="">Tất cả bộ đề</option>
          {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.title}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl bg-surface-container-lowest px-3 py-2 text-sm text-on-surface shadow-[inset_0_0_0_1px_rgba(99,102,241,0.16)] focus:outline-none"
        >
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        </div>
      </div>

      {!loading && (
        <p className="mt-3 text-xs text-on-surface-variant">
          Tổng cộng {total} câu hỏi trong ngân hàng {search && `— kết quả cho "${search}"`}
        </p>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Question list */}
      <div className="mt-4 rounded-2xl bg-surface-container-lowest overflow-hidden shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">quiz</span>
            <p className="text-sm text-on-surface-variant">Không tìm thấy câu hỏi nào</p>
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
                      <span className="text-xs font-mono text-on-surface-variant mt-0.5 w-7 shrink-0 font-semibold">
                        {(page - 1) * limit + idx + 1}.
                      </span>
                      <span className={`material-symbols-outlined text-[18px] mt-0.5 ${qType.color} shrink-0`}>
                        {qType.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-surface line-clamp-2">{q.prompt}</p>
                        <div className="mt-1.5 flex flex-wrap gap-2 items-center">
                          <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                            {qType.label}
                          </span>
                          {q.domain && (
                            <span className="text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded font-medium">
                              {q.domain.name}
                            </span>
                          )}
                          {q.level && (
                            <span className="text-xs text-tertiary bg-tertiary/10 px-2 py-0.5 rounded font-medium">
                              {q.level.name}
                            </span>
                          )}
                          {(q.examQuestions?.length ?? 0) > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                              <span className="material-symbols-outlined text-[14px]">assignment</span>
                              {q.examQuestions!.length} bộ đề
                            </span>
                          ) : (
                            <span className="text-xs text-on-surface-variant">Chưa xếp bộ đề</span>
                          )}
                          <span className="text-xs text-on-surface-variant">· {q.points} điểm</span>
                          {q.status === 'published' ? (
                            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Đã đăng</span>
                          ) : (
                            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">Bản nháp</span>
                          )}
                        </div>
                      </div>
                      <span className={`material-symbols-outlined text-[20px] text-on-surface-variant transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-14 pb-5 space-y-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/questions/editor?id=${q.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"><span className="material-symbols-outlined text-[16px]">edit</span>Sửa câu hỏi</Link>
                        <button type="button" disabled={deletingId === q.id} onClick={() => void handleDelete(q)} className="inline-flex items-center gap-1.5 rounded-lg bg-error-container px-3 py-2 text-xs font-semibold text-error disabled:opacity-50"><span className="material-symbols-outlined text-[16px]">delete</span>{deletingId === q.id ? 'Đang xóa...' : 'Xóa câu hỏi'}</button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl bg-primary/5 p-3.5">
                          <p className="mb-2 text-xs font-semibold text-on-surface-variant">Thuộc bộ đề</p>
                          <div className="flex flex-wrap gap-2">
                            {q.examQuestions?.length ? q.examQuestions.map(({ exam, order }) => (
                              <span key={exam.id} className="rounded-full bg-surface-container-lowest px-2.5 py-1 text-xs font-medium text-primary">
                                {exam.title} · câu {order}
                              </span>
                            )) : <span className="text-sm text-on-surface-variant">Chưa được đưa vào bộ đề nào</span>}
                          </div>
                        </div>
                        <div className="rounded-xl bg-secondary/5 p-3.5">
                          <p className="mb-2 text-xs font-semibold text-on-surface-variant">Chứng chỉ liên quan</p>
                          <div className="flex flex-wrap gap-2">
                            {q.certificates?.length ? q.certificates.map(({ certificate }) => (
                              <span key={certificate.id} className="rounded-full bg-surface-container-lowest px-2.5 py-1 text-xs font-medium text-secondary">
                                {certificate.name}
                              </span>
                            )) : <span className="text-sm text-on-surface-variant">Chưa gắn chứng chỉ</span>}
                          </div>
                        </div>
                      </div>
                      {q.context && (
                        <div className="bg-surface-container rounded-xl p-3.5 border border-outline-variant/20">
                          <p className="text-xs font-semibold text-on-surface-variant mb-1">Ngữ cảnh bài tập:</p>
                          <p className="text-sm text-on-surface font-mono whitespace-pre-wrap">{q.context}</p>
                        </div>
                      )}

                      {q.options && q.options.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-on-surface-variant">Lựa chọn & Đáp án:</p>
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className={`flex items-start gap-2.5 p-3 rounded-xl text-sm ${
                                opt.isCorrect
                                  ? 'bg-emerald-50 border border-emerald-300'
                                  : 'bg-surface-container border border-outline-variant/20'
                              }`}
                            >
                              <span className={`font-bold w-5 shrink-0 ${opt.isCorrect ? 'text-emerald-700' : 'text-on-surface-variant'}`}>
                                {opt.key}.
                              </span>
                              <div className="flex-1">
                                <p className={opt.isCorrect ? 'text-emerald-900 font-semibold' : 'text-on-surface'}>
                                  {opt.text}
                                  {opt.isCorrect && <span className="ml-2 text-emerald-700 font-bold">✓ (Đáp án đúng)</span>}
                                </p>
                                {opt.explanation && (
                                  <p className="text-xs text-on-surface-variant mt-1 italic">{opt.explanation}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {q.explanation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                          <p className="text-xs font-semibold text-blue-700 mb-1">Giải thích chi tiết:</p>
                          <p className="text-sm text-blue-950 leading-relaxed">{q.explanation}</p>
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
        <Pagination className="mt-4 rounded-2xl" page={page} limit={limit} total={total} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
