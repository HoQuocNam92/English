'use client';
import { showToast } from '@/shared/ui/AppFeedback';
import { AppIcon, IconText } from '@/shared/ui/AppIcon';
import { ActionButton, ActionGroup } from '@/shared/ui/ActionButton';

import { LevelBadge } from '@/shared/ui/LevelBadge';
import { Dropdown } from '@/shared/ui/Dropdown';
import * as React from 'react';
import Link from 'next/link';
import { BulkSelectionBar, confirmDialog, PageHeader, Pagination, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { ExamItem, QuestionItem, PaginatedResponse } from '@/shared/api/api-client';
import { downloadQuestionExcelTemplate } from '@/features/questions/question-excel';
import { ImportQuestionsModal } from './ImportQuestionsModal';

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
const SKILLS: Record<string, string> = { vocabulary: 'Vocabulary', reading: 'Reading', technical_understanding: 'Technical Understanding', scenario_based: 'Scenario-based' };

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
  const [limit, setLimit] = React.useState(30);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [type, setType] = React.useState('');
  const [topic, setTopic] = React.useState('');
  const [skill, setSkill] = React.useState('');
  const [domainCode, setDomainCode] = React.useState('');
  const [examId, setExamId] = React.useState('');
  const [domains, setDomains] = React.useState<FilterOption[]>([]);
  const [levels, setLevels] = React.useState<FilterOption[]>([]);
  const [exams, setExams] = React.useState<FilterOption[]>([]);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = React.useState(false);
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
        ...(skill && { skill }),
        ...(topic && { topic }),
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
  }, [page, limit, search, status, type, skill, domainCode, examId, topic]);

  React.useEffect(() => { void load(); }, [load]);
  React.useEffect(() => { setSelectedIds(new Set()); }, [page, limit, search, status, type, topic, skill, domainCode, examId]);

  React.useEffect(() => {
    void Promise.all([
      apiClient.get<{ data: FilterOption[] } | FilterOption[]>('/domains'),
      apiClient.get<{ data: FilterOption[] } | FilterOption[]>('/levels'),
      apiClient.get<PaginatedResponse<ExamItem>>('/exams?page=1&limit=100'),
    ]).then(([domainResult, levelResult, examResult]) => {
      setDomains(Array.isArray(domainResult) ? domainResult : domainResult.data);
      setLevels(Array.isArray(levelResult) ? levelResult : levelResult.data);
      setExams(examResult.data);
    }).catch(() => undefined);
  }, []);

  const bulkUpdateStatus = async (targetStatus: 'draft' | 'published', scope: 'selected' | 'filtered') => {
    if (scope === 'selected' && selectedIds.size === 0) return;
    const count = scope === 'selected' ? selectedIds.size : total;
    const action = targetStatus === 'published' ? 'xuất bản' : 'chuyển về bản nháp';
    const affected = scope === 'selected' ? `${count} câu hỏi đã chọn` : `${count} kết quả đang lọc`;
    if (!(await confirmDialog(`Bạn có chắc muốn ${action} ${affected}?`, { title: 'Xác nhận cập nhật hàng loạt', confirmLabel: action, tone: targetStatus === 'published' ? 'primary' : 'warning' }))) return;
    setBulkBusy(true);
    setError(null);
    try {
      const filters = { search: search || undefined, currentStatus: status || undefined, type: type || undefined, skill: skill || undefined, topic: topic || undefined, domainCode: domainCode || undefined, examId: examId || undefined };
      const result = await apiClient.patch<{ updatedCount: number }>('/questions/bulk-status', scope === 'selected'
        ? { ids: [...selectedIds], status: targetStatus }
        : { ...filters, status: targetStatus, confirmAll: !Object.values(filters).some(Boolean) });
      setSelectedIds(new Set());
      setSuccessMessage(`Đã ${action} ${result.updatedCount} câu hỏi.`);
      await load();
    } catch (cause) { setError(cause instanceof ApiClientError ? cause.message : 'Không thể cập nhật trạng thái câu hỏi'); }
    finally { setBulkBusy(false); }
  };

  const handleDelete = async (question: QuestionItem) => {
    if (!(await confirmDialog(`Xóa câu hỏi “${question.prompt.slice(0, 80)}${question.prompt.length > 80 ? '…' : ''}”? Câu hỏi cũng sẽ được gỡ khỏi các bộ đề liên quan.`, { title: 'Xóa câu hỏi?', confirmLabel: 'Xóa câu hỏi', tone: 'danger' }))) return;
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="Ngân hàng câu hỏi" description="Quản lý toàn bộ câu hỏi luyện tập và thi trắc nghiệm IT" />
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={downloadQuestionExcelTemplate}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-sm font-semibold text-on-surface shadow-sm transition-colors hover:bg-surface-container"
            title="Tải file mẫu Excel chuẩn để soạn câu hỏi"
          >
            <AppIcon className=" text-[19px] text-emerald-600">file_download</AppIcon>
            Tải file mẫu
          </button>
          <button
            type="button"
            onClick={() => {
              setSuccessMessage(null);
              setImportModalOpen(true);
            }}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3.5 py-2.5 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-primary/15"
          >
            <AppIcon className=" text-[19px]">upload_file</AppIcon>
            Nhập từ Excel
          </button>
          <Link
            href="/admin/questions/editor"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold !text-white shadow-sm"
          >
            <AppIcon className=" text-[19px]">add</AppIcon>
            Thêm câu hỏi
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 rounded-2xl bg-surface-container-lowest p-4 shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-on-surface-variant">
          <span className="font-semibold text-on-surface">Chú giải loại câu hỏi:</span>
          {Object.entries(QUESTION_TYPES).map(([key, item]) => (
            <span key={key} className="flex items-center gap-1.5">
              <AppIcon className={` text-[17px] ${item.color}`}>{item.icon}</AppIcon>
              {item.label}
            </span>
          ))}
        </div>
        <div className="grid min-w-0 gap-3">
        <SearchInput
          className="sm:!w-full"
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(sanitized) => {
            setPage(1);
            setSearch(sanitized);
          }}
          placeholder="Nội dung hoặc ngữ cảnh"
          maxLength={100}
        />
        <div className="grid w-full min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Dropdown
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="min-w-0 w-full rounded-xl bg-surface-container-lowest px-3 py-2 text-sm text-on-surface shadow-[inset_0_0_0_1px_rgba(99,102,241,0.16)] focus:outline-none"
          aria-label="Lọc theo loại câu hỏi"
        >
          <option value="">Tất cả loại câu hỏi</option>
          {Object.entries(QUESTION_TYPES).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
        </Dropdown>
        <Dropdown value={topic} onChange={(e) => { setTopic(e.target.value); setPage(1); }} aria-label="Lọc câu kiểm tra trình độ" className="min-w-0 w-full rounded-xl bg-surface-container-lowest px-3 py-2 text-sm text-on-surface shadow-[inset_0_0_0_1px_rgba(99,102,241,0.16)]"><option value="">Tất cả mục đích</option><option value="placement">Kiểm tra trình độ</option></Dropdown>
        <Dropdown value={skill} onChange={(e) => { setSkill(e.target.value); setPage(1); }} className="min-w-0 w-full rounded-xl bg-surface-container-lowest px-3 py-2 text-sm text-on-surface shadow-[inset_0_0_0_1px_rgba(99,102,241,0.16)] focus:outline-none" aria-label="Lọc theo kỹ năng">
          <option value="">Tất cả kỹ năng</option>{Object.entries(SKILLS).map(([value,label]) => <option key={value} value={value}>{label}</option>)}
        </Dropdown>
        <Dropdown
          value={domainCode}
          onChange={(e) => { setDomainCode(e.target.value); setPage(1); }}
          className="min-w-0 w-full rounded-xl bg-surface-container-lowest px-3 py-2 text-sm text-on-surface shadow-[inset_0_0_0_1px_rgba(99,102,241,0.16)] focus:outline-none"
          aria-label="Lọc theo chuyên ngành"
        >
          <option value="">Tất cả chuyên ngành</option>
          {domains.map((domain) => <option key={domain.id} value={domain.code}>{domain.name}</option>)}
        </Dropdown>
        <Dropdown
          value={examId}
          onChange={(e) => { setExamId(e.target.value); setPage(1); }}
          className="min-w-0 w-full rounded-xl bg-surface-container-lowest px-3 py-2 text-sm text-on-surface shadow-[inset_0_0_0_1px_rgba(99,102,241,0.16)] focus:outline-none"
          aria-label="Lọc theo bộ đề"
        >
          <option value="">Tất cả bộ đề</option>
          {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.title}</option>)}
        </Dropdown>
        <Dropdown
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="min-w-0 w-full rounded-xl bg-surface-container-lowest px-3 py-2 text-sm text-on-surface shadow-[inset_0_0_0_1px_rgba(99,102,241,0.16)] focus:outline-none"
        >
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Dropdown>
        </div>
        </div>
      </div>

      {!loading && (
        <p className="mt-3 text-xs text-on-surface-variant">
          Tổng cộng {total} câu hỏi trong ngân hàng {search && `— kết quả cho "${search}"`}
        </p>
      )}

      {successMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AppIcon className=" text-[18px] text-emerald-600">check_circle</AppIcon>
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <AppIcon className=" text-[18px]">close</AppIcon>
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <AppIcon className=" text-[18px]">error</AppIcon>
          <span>{error}</span>
        </div>
      )}

      {/* Question list */}
      <BulkSelectionBar pageCount={items.length} selectedCount={selectedIds.size} allPageSelected={items.length > 0 && items.every((item) => selectedIds.has(item.id))} onSelectPage={(selected) => setSelectedIds((current) => { const next = new Set(current); items.forEach((item) => selected ? next.add(item.id) : next.delete(item.id)); return next; })}>
        {selectedIds.size > 0 && <><button disabled={bulkBusy} onClick={() => void bulkUpdateStatus('published', 'selected')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Xuất bản đã chọn</button><button disabled={bulkBusy} onClick={() => void bulkUpdateStatus('draft', 'selected')} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Chuyển về bản nháp đã chọn</button></>}
        <button disabled={bulkBusy || total === 0} onClick={() => void bulkUpdateStatus('published', 'filtered')} className="rounded-lg border border-emerald-600 px-3 py-2 text-xs font-bold text-emerald-700 disabled:opacity-50">Xuất bản tất cả kết quả lọc</button>
        <button disabled={bulkBusy || total === 0} onClick={() => void bulkUpdateStatus('draft', 'filtered')} className="rounded-lg border border-amber-500 px-3 py-2 text-xs font-bold text-amber-700 disabled:opacity-50">Chuyển tất cả kết quả lọc về bản nháp</button>
      </BulkSelectionBar>
      <div className="mt-4 rounded-2xl bg-surface-container-lowest overflow-hidden shadow-[0_8px_28px_rgba(15,23,42,0.05)]">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <AppIcon className=" text-[48px] text-outline mb-3 block">quiz</AppIcon>
            <p className="text-sm text-on-surface-variant">Không tìm thấy câu hỏi nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="admin-list-table min-w-[1040px]"><thead><tr><th className="w-12">Chọn</th><th>Câu hỏi</th><th>Loại / kỹ năng</th><th>Lĩnh vực</th><th>Trình độ</th><th>Bộ đề</th><th>Trạng thái</th><th className="text-right">Thao tác</th></tr></thead><tbody>
            {items.map((q, idx) => {
              const qType = QUESTION_TYPES[q.type] ?? { label: q.type, icon: 'help', color: 'text-gray-500' };
              const isExpanded = expanded === q.id;
              return <React.Fragment key={q.id}>
                <tr>
                  <td><input type="checkbox" aria-label={`Chọn câu hỏi ${q.prompt}`} checked={selectedIds.has(q.id)} onChange={() => setSelectedIds((current) => { const next = new Set(current); if (next.has(q.id)) next.delete(q.id); else next.add(q.id); return next; })} className="h-4 w-4 accent-primary" /></td>
                  <td className="max-w-[360px]"><button type="button" aria-expanded={isExpanded} onClick={() => setExpanded(isExpanded ? null : q.id)} className="text-left text-sm font-semibold text-on-surface hover:text-primary"><span className="mr-2 text-xs text-on-surface-variant">{(page - 1) * limit + idx + 1}.</span>{q.prompt}</button></td>
                  <td><p>{qType.label}</p><p className="mt-1 text-xs text-on-surface-variant">{SKILLS[q.skill] ?? q.skill}</p></td>
                  <td>{q.domain?.name ?? '—'}</td><td><LevelBadge level={q.level} /></td>
                  <td>{q.examQuestions?.length ?? 0}</td>
                  <td><span className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${q.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{q.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}</span></td>
                  <td><ActionGroup><ActionButton action="view" onClick={() => setExpanded(isExpanded ? null : q.id)} /><ActionButton action="edit" href={`/admin/questions/editor?id=${q.id}`} /><ActionButton action="delete" loading={deletingId === q.id} onClick={() => void handleDelete(q)} /></ActionGroup></td>
                </tr>
                  {/* Expanded content */}
                  {isExpanded && (
                    <tr><td colSpan={8}><div className="space-y-4 p-4">
                      <ActionGroup>
                        <ActionButton action="edit" href={`/admin/questions/editor?id=${q.id}`} />
                        <ActionButton action="delete" type="button" disabled={deletingId === q.id} onClick={() => void handleDelete(q)} loading={deletingId === q.id} />
                      </ActionGroup>
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
                          <p className="mb-2 text-xs font-semibold text-on-surface-variant">Topic chứng chỉ</p>
                          <div className="flex flex-wrap gap-2">
                            {q.certificationTopics?.length ? q.certificationTopics.map(({ topic }: any) => (
                              <span key={topic.id} className="rounded-full bg-surface-container-lowest px-2.5 py-1 text-xs font-medium text-secondary">
                                {topic.certificateDomain?.certificate?.name} · {topic.name}
                              </span>
                            )) : <span className="text-sm text-on-surface-variant">Chưa gắn Topic</span>}
                          </div>
                        </div>
                      </div>
                      {q.context && (
                        <div className="bg-surface-container rounded-xl p-3.5 border border-outline-variant/20">
                          <p className="text-xs font-semibold text-on-surface-variant mb-1">Ngữ cảnh bài tập:</p>
                          <p className="text-sm leading-6 text-on-surface whitespace-pre-wrap">{q.context}</p>
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
                                  {opt.isCorrect && <span className="ml-2 text-emerald-700 font-bold"><IconText>{"✓ (Đáp án đúng)"}</IconText></span>}
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
                    </div></td></tr>
                  )}
                </React.Fragment>;
            })}
          </tbody></table></div>
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <Pagination className="mt-4 rounded-2xl" page={page} limit={limit} total={total} totalPages={totalPages} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} showQuickJumper />
      )}

      {/* Import Questions Modal */}
      <ImportQuestionsModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={(count) => {
          showToast(`Đã nhập thành công ${count} câu hỏi vào ngân hàng câu hỏi!`, 'success');
          void load();
        }}
        availableDomains={domains}
        availableLevels={levels}
      />
    </div>
  );
}
