'use client';

import * as React from 'react';
import { PageHeader, SearchInput } from '@/shared/ui';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import type { LessonItem, PaginatedResponse } from '@/shared/api/api-client';

const LESSON_TYPES: Record<string, string> = {
  vocabulary: 'Từ vựng',
  terminology: 'Thuật ngữ',
  technical_reading: 'Đọc kỹ thuật',
  api_documentation: 'Tài liệu API',
  system_design: 'System Design',
  case_study: 'Case Study',
};

const STATUSES = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'draft', label: 'Bản nháp' },
  { value: 'archived', label: 'Đã lưu trữ' },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    published: { label: 'Đã xuất bản', cls: 'bg-green-100 text-green-700' },
    draft: { label: 'Bản nháp', cls: 'bg-amber-100 text-amber-700' },
    archived: { label: 'Đã lưu trữ', cls: 'bg-gray-100 text-gray-600' },
  };
  const s = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

export default function AdminLessonsPage() {
  const [lessons, setLessons] = React.useState<LessonItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');
  const [status, setStatus] = React.useState('');
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
      const res = await apiClient.get<PaginatedResponse<LessonItem>>(`/lessons?${params}`);
      setLessons(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Không thể tải bài học');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  React.useEffect(() => { void load(); }, [load]);

  return (
    <div>
      <PageHeader title="Quản lý bài học" description="Toàn bộ bài giảng và học liệu trên toàn hệ thống" />

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={(sanitized) => {
            setPage(1);
            setSearch(sanitized);
          }}
          placeholder="Tìm kiếm bài học theo tiêu đề, tóm tắt..."
          maxLength={100}
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-sm text-on-surface focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      {!loading && (
        <p className="mt-3 text-xs text-on-surface-variant">
          Tổng cộng {total} bài học {search && `— kết quả cho "${search}"`}
        </p>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="mt-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 text-xs text-on-surface-variant bg-surface-container/50">
                <th className="px-4 py-3 text-left font-medium">Tiêu đề bài giảng</th>
                <th className="px-4 py-3 text-left font-medium">Loại bài</th>
                <th className="px-4 py-3 text-left font-medium">Lĩnh vực</th>
                <th className="px-4 py-3 text-left font-medium">Cấp độ</th>
                <th className="px-4 py-3 text-left font-medium">Người tạo</th>
                <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-outline-variant/20 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : lessons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <span className="material-symbols-outlined text-[40px] text-outline mb-2 block">auto_stories</span>
                    <p className="text-on-surface-variant text-sm">Không tìm thấy bài học nào</p>
                  </td>
                </tr>
              ) : (
                lessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-on-surface line-clamp-1">{lesson.title}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {lesson.estimatedMinutes ? `${lesson.estimatedMinutes} phút` : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {LESSON_TYPES[lesson.type] ?? lesson.type}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{lesson.domain?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{lesson.level?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">
                      {lesson.createdBy?.userDetail?.displayName ?? 'Hệ thống'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={lesson.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-outline-variant/30 flex items-center justify-between">
            <p className="text-xs text-on-surface-variant">
              Trang {page}/{totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg text-xs border border-outline-variant disabled:opacity-40 hover:bg-surface-container transition-colors"
              >
                ← Trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg text-xs border border-outline-variant disabled:opacity-40 hover:bg-surface-container transition-colors"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
