'use client';
import { AppIcon } from '@/shared/ui/AppIcon';
import { ActionButton, ActionGroup } from '@/shared/ui/ActionButton';

import { LevelBadge } from '@/shared/ui/LevelBadge';
import { Dropdown } from '@/shared/ui/Dropdown';
import * as React from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { BulkSelectionBar, confirmDialog, PageHeader, SearchInput, Pagination } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { ExamItem, PaginatedResponse } from '@/shared/api/api-client';

const EXAM_KINDS: Record<string, string> = { practice: 'Luyện tập chủ đề', domain_test: 'Kiểm tra lĩnh vực', mock_exam: 'Thi thử chứng chỉ', scenario_assessment: 'Tình huống thực tế' };

const STATUSES = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'draft', label: 'Bản nháp' },
];

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 space-y-3 animate-pulse">
      <div className="h-5 w-3/4 rounded bg-outline-variant/20" />
      <div className="h-3 w-1/2 rounded bg-outline-variant/20" />
      <div className="h-4 w-full rounded bg-outline-variant/20" />
    </div>
  );
}

export default function AdminTestsPage() {
  const [items, setItems] = React.useState<ExamItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [limit, setLimit] = React.useState(30);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  const [filters, setFilters] = React.useState({ domainCode: '', levelCode: '', certificateId: '', kind: '' });
  const [options, setOptions] = React.useState<{ domains: any[]; levels: any[]; certificates: any[] }>({ domains: [], levels: [], certificates: [] });
  React.useEffect(() => { Promise.all([apiClient.get<any>('/domains'), apiClient.get<any>('/levels'), apiClient.get<any>('/certificates')]).then(([d,l,c]) => setOptions({ domains: d.data ?? d, levels: l.data ?? l, certificates: c.data ?? c })).catch(() => setError('Không thể tải bộ lọc. Vui lòng tải lại trang.')); }, []);
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
        ...filters,
      });
      const res = await apiClient.get<PaginatedResponse<ExamItem>>(`/exams?${params}`);
      setItems(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải danh sách bài kiểm tra chứng chỉ');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, filters]);

  React.useEffect(() => { void load(); }, [load]);
  React.useEffect(() => { setSelectedIds(new Set()); }, [page, limit, search, status, filters]);

  const bulkUpdateStatus = async (targetStatus: 'draft' | 'published', scope: 'selected' | 'filtered') => {
    if (scope === 'selected' && selectedIds.size === 0) return;
    const count = scope === 'selected' ? selectedIds.size : total;
    const action = targetStatus === 'published' ? 'xuất bản' : 'chuyển về bản nháp';
    const affected = scope === 'selected' ? `${count} bài thi đã chọn` : `${count} kết quả đang lọc`;
    if (!(await confirmDialog(`Bạn có chắc muốn ${action} ${affected}?`, { title: 'Xác nhận cập nhật hàng loạt', confirmLabel: action, tone: targetStatus === 'published' ? 'primary' : 'warning' }))) return;
    setBulkBusy(true); setError(null); setSuccessMessage('');
    try {
      const currentStatus = status || undefined;
      const filtersForUpdate = { ...filters, search: search || undefined, currentStatus };
      const result = await apiClient.patch<{ updatedCount: number }>('/exams/bulk-status', scope === 'selected'
        ? { ids: [...selectedIds], status: targetStatus }
        : { ...filtersForUpdate, status: targetStatus, confirmAll: !Object.values(filtersForUpdate).some(Boolean) });
      setSelectedIds(new Set());
      setSuccessMessage(`Đã ${action} ${result.updatedCount} bài thi.`);
      await load();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể cập nhật hàng loạt bài thi');
    } finally { setBulkBusy(false); }
  };

  const removeExam = async (exam: ExamItem) => {
    if (!(await confirmDialog(`Xóa bài thi “${exam.title}”? Hành động này không thể hoàn tác.`, { title: 'Xóa bài thi?', confirmLabel: 'Xóa bài thi', tone: 'danger' }))) return;
    try { await apiClient.delete(`/exams/${exam.id}`); await load(); }
    catch (e) { setError(e instanceof ApiClientError ? e.message : 'Không thể xóa bài thi'); }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Bài kiểm tra chứng chỉ" description="Luyện tập chủ đề, kiểm tra lĩnh vực và thi thử theo chứng chỉ" />
        <Link href="/admin/tests/builder" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold !text-white shadow-sm"><AppIcon className=" text-[19px]">add</AppIcon>Tạo bài kiểm tra</Link>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col items-start gap-4 lg:flex-row rounded-2xl border border-outline-variant/50 bg-white p-4">
        <div className="grid w-full min-w-0 gap-1 lg:min-w-[320px] lg:flex-1">
          <span className="text-xs font-semibold">Tìm kiếm</span>
        <SearchInput
          className="sm:!w-full"
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(sanitized) => {
            setPage(1);
            setSearch(sanitized);
          }}
          placeholder="Tìm kiếm theo tiêu đề bài kiểm tra..."
          maxLength={100}
        />
        </div>
        <div className="grid w-full min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3 lg:ml-auto lg:w-auto lg:flex-1 lg:max-w-3xl">
        <label className="grid gap-1 text-xs font-semibold">Trạng thái
        <Dropdown
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-11 w-full rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:outline-none"
        >
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Dropdown>
        </label>
        {([['domainCode', 'Lĩnh vực', options.domains], ['levelCode', 'Trình độ', options.levels], ['certificateId', 'Chứng chỉ', options.certificates]] as const).map(([key,label,list]) => <label key={key} className="grid min-w-0 flex-1 basis-48 gap-1 text-xs font-semibold">{label}<Dropdown aria-label={label} value={filters[key]} onChange={e => { setFilters(f => ({ ...f, [key]: e.target.value })); setPage(1); }} className="h-11 min-w-0 rounded-xl border border-outline-variant px-3 text-sm"><option value="">Tất cả</option>{list.map(x => <option key={x.id} value={key === 'certificateId' ? x.id : x.code}>{x.name}</option>)}</Dropdown></label>)}
        <label className="grid gap-1 text-xs font-semibold">Loại bài kiểm tra<Dropdown aria-label="Loại bài kiểm tra" value={filters.kind} onChange={e => { setFilters(f => ({ ...f, kind: e.target.value })); setPage(1); }} className="h-11 rounded-xl border border-outline-variant px-3 text-sm"><option value="">Tất cả</option>{Object.entries(EXAM_KINDS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}</Dropdown></label>
        <button onClick={() => { setFilters({ domainCode: '', levelCode: '', certificateId: '', kind: '' }); setStatus(''); setSearch(''); setSearchInput(''); setPage(1); }} className="ui-button ui-button-outline h-11 self-start sm:mt-5 rounded-xl border border-outline-variant px-4 text-sm">Xóa bộ lọc</button>
        </div>
      </div>

      {!loading && (
        <p className="mt-3 text-xs text-on-surface-variant">
          Tổng cộng {total} đề thi {search && `— kết quả cho "${search}"`}
        </p>
      )}

      {successMessage && <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{successMessage}</div>}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <AppIcon className=" text-[18px]">error</AppIcon>
          <span>{error}</span>
        </div>
      )}

      {/* Cards */}
      <BulkSelectionBar pageCount={items.length} selectedCount={selectedIds.size} allPageSelected={items.length > 0 && items.every((item) => selectedIds.has(item.id))} onSelectPage={(selected) => setSelectedIds((current) => { const next = new Set(current); items.forEach((item) => selected ? next.add(item.id) : next.delete(item.id)); return next; })}>
        {selectedIds.size > 0 && <><button disabled={bulkBusy} onClick={() => void bulkUpdateStatus('published', 'selected')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Xuất bản đã chọn</button><button disabled={bulkBusy} onClick={() => void bulkUpdateStatus('draft', 'selected')} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Chuyển về bản nháp đã chọn</button></>}
        <button disabled={bulkBusy || total === 0} onClick={() => void bulkUpdateStatus('published', 'filtered')} className="rounded-lg border border-emerald-600 px-3 py-2 text-xs font-bold text-emerald-700 disabled:opacity-50">Xuất bản tất cả kết quả lọc</button>
        <button disabled={bulkBusy || total === 0} onClick={() => void bulkUpdateStatus('draft', 'filtered')} className="rounded-lg border border-amber-500 px-3 py-2 text-xs font-bold text-amber-700 disabled:opacity-50">Chuyển tất cả kết quả lọc về bản nháp</button>
      </BulkSelectionBar>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : items.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30">
            <AppIcon className=" text-[48px] text-outline mb-3 block">quiz</AppIcon>
            <p className="text-sm text-on-surface-variant">Không tìm thấy bài thi nào</p>
          </div>
        ) : (
          items.map((exam) => (
            <div key={exam.id} className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-[0_8px_28px_rgba(15,23,42,0.035)] hover:shadow-md transition-shadow content-card">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <input type="checkbox" aria-label={`Chọn ${exam.title}`} checked={selectedIds.has(exam.id)} onChange={() => setSelectedIds((current) => { const next = new Set(current); if (next.has(exam.id)) next.delete(exam.id); else next.add(exam.id); return next; })} className="mt-1 h-4 w-4 shrink-0 accent-primary" />
                  <h3 className="font-bold text-on-surface text-base line-clamp-2 flex-1">{exam.title}</h3>
                  <StatusBadge status={exam.status} />
                </div>
                <span className="mb-3 inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">{EXAM_KINDS[exam.kind] ?? exam.kind}</span>

                {exam.description && (
                  <p className="text-xs text-on-surface-variant line-clamp-2 mb-3 leading-relaxed">{exam.description}</p>
                )}

                {/* Meta */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-surface-container rounded-xl p-2.5">
                    <p className="text-on-surface-variant mb-0.5 text-[11px]">Thời gian làm bài</p>
                    <p className="font-bold text-on-surface">{exam.durationMinutes} phút</p>
                  </div>
                  <div className="bg-surface-container rounded-xl p-2.5">
                    <p className="text-on-surface-variant mb-0.5 text-[11px]">Điểm đạt (Pass)</p>
                    <p className="font-bold text-emerald-700">{exam.passingScorePercent}%</p>
                  </div>
                  {exam.domain && (
                    <div className="bg-surface-container rounded-xl p-2.5">
                      <p className="text-on-surface-variant mb-0.5 text-[11px]">Lĩnh vực</p>
                      <p className="font-semibold text-on-surface truncate">{exam.domain.name}</p>
                    </div>
                  )}
                  {exam.level && (
                    <div className="bg-surface-container rounded-xl p-2.5">
                      <p className="text-on-surface-variant mb-0.5 text-[11px]">Cấp độ</p>
                      <LevelBadge level={exam.level} />
                    </div>
                  )}
                </div>

                {/* Topics */}
                {exam.topics?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {exam.topics.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                        #{t}
                      </span>
                    ))}
                    {exam.topics.length > 3 && (
                      <span className="text-[10px] text-on-surface-variant font-medium">+{exam.topics.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Creator */}
              <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
                <span>Tạo bởi: <strong className="text-on-surface">{exam.createdBy?.userDetail?.displayName ?? 'Admin'}</strong></span>
                <span>{new Date(exam.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <ActionGroup className="content-card-footer">
                <ActionButton action="edit" href={`/admin/tests/builder?id=${exam.id}`} />
                <ActionButton action="delete" onClick={() => void removeExam(exam)} />
              </ActionGroup>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <Pagination
          className="mt-6 rounded-2xl border border-outline-variant/40 shadow-xs"
          page={page}
          limit={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={setPage}
          onLimitChange={(value) => { setLimit(value); setPage(1); }}
          showQuickJumper
        />
      )}
    </div>
  );
}
