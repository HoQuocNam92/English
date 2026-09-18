'use client';

import * as React from 'react';
import { Modal } from '@/shared/ui/Modal';
import { apiClient, ApiClientError } from '@/shared/api/api-client';
import {
  downloadQuestionExcelTemplate,
  parseQuestionsFromExcel,
  type ExcelParseResult,
  type ParsedQuestionRow,
} from '@/features/questions/question-excel';

export interface UploadedFileItem {
  id: string;
  file: File;
  status: 'parsing' | 'ready' | 'error';
  parseResult: ExcelParseResult | null;
  errorMessage?: string;
}

export interface UnifiedQuestionRow extends ParsedQuestionRow {
  rowKey: string;
  fileId: string;
  fileName: string;
  originalRowNumber: number;
}

interface ImportQuestionsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
  availableDomains: Array<{ id: string; code?: string; name?: string }>;
  availableLevels: Array<{ id: string; code?: string; name?: string }>;
}

export function ImportQuestionsModal({
  open,
  onClose,
  onSuccess,
  availableDomains,
  availableLevels,
}: ImportQuestionsModalProps) {
  const [files, setFiles] = React.useState<UploadedFileItem[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = React.useState<'all' | 'valid' | 'invalid'>('all');

  // Comprehensive Filter States
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterFileId, setFilterFileId] = React.useState('all');
  const [filterDomain, setFilterDomain] = React.useState('all');
  const [filterLevel, setFilterLevel] = React.useState('all');
  const [filterType, setFilterType] = React.useState('all');

  // Submitting States
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Reset state when modal opens or closes
  React.useEffect(() => {
    if (!open) {
      setFiles([]);
      setSelectedRowKeys(new Set());
      setActiveTab('all');
      setSearchQuery('');
      setFilterFileId('all');
      setFilterDomain('all');
      setFilterLevel('all');
      setFilterType('all');
      setSubmitError(null);
      setSubmitSuccess(null);
    }
  }, [open]);

  // Handle multi-file selection & asynchronous parsing
  const handleFilesSelect = async (selectedFiles: File[]) => {
    const excelFiles = selectedFiles.filter(
      (f) => f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
    );

    if (excelFiles.length === 0) {
      setSubmitError('Vui lòng chỉ chọn file định dạng Excel (.xlsx hoặc .xls)');
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(null);

    // Create new file items
    const newItems: UploadedFileItem[] = excelFiles.map((f) => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      file: f,
      status: 'parsing',
      parseResult: null,
    }));

    // Append to files list
    setFiles((prev) => [...prev, ...newItems]);

    // Parse each file concurrently
    await Promise.all(
      newItems.map(async (item) => {
        try {
          const result = await parseQuestionsFromExcel(
            item.file,
            availableDomains,
            availableLevels
          );

          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? { ...f, status: 'ready', parseResult: result }
                : f
            )
          );

          // Auto-select valid rows from this file
          const validKeys = result.rows
            .filter((r) => r.isValid)
            .map((r) => `${item.id}:${r.rowNumber}`);

          setSelectedRowKeys((prev) => {
            const next = new Set(prev);
            validKeys.forEach((k) => next.add(k));
            return next;
          });
        } catch (err: any) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? {
                    ...f,
                    status: 'error',
                    errorMessage:
                      err?.message ||
                      'Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng file.',
                  }
                : f
            )
          );
        }
      })
    );
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setSelectedRowKeys((prev) => {
      const next = new Set(prev);
      for (const key of next) {
        if (key.startsWith(`${fileId}:`)) {
          next.delete(key);
        }
      }
      return next;
    });
    if (filterFileId === fileId) {
      setFilterFileId('all');
    }
  };

  const handleClearAllFiles = () => {
    setFiles([]);
    setSelectedRowKeys(new Set());
    setFilterFileId('all');
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      void handleFilesSelect(droppedFiles);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Combine questions from all parsed files
  const allUnifiedRows: UnifiedQuestionRow[] = React.useMemo(() => {
    const combined: UnifiedQuestionRow[] = [];
    for (const item of files) {
      if (item.status === 'ready' && item.parseResult) {
        for (const row of item.parseResult.rows) {
          combined.push({
            ...row,
            rowKey: `${item.id}:${row.rowNumber}`,
            fileId: item.id,
            fileName: item.file.name,
            originalRowNumber: row.rowNumber,
          });
        }
      }
    }
    return combined;
  }, [files]);

  const totalRowsCount = allUnifiedRows.length;
  const totalValidCount = React.useMemo(
    () => allUnifiedRows.filter((r) => r.isValid).length,
    [allUnifiedRows]
  );
  const totalInvalidCount = totalRowsCount - totalValidCount;
  const isAnyParsing = files.some((f) => f.status === 'parsing');

  // Selected valid rows across all files
  const selectedValidRows = React.useMemo(() => {
    return allUnifiedRows.filter(
      (r) => r.isValid && selectedRowKeys.has(r.rowKey) && r.question
    );
  }, [allUnifiedRows, selectedRowKeys]);

  const selectedCount = selectedValidRows.length;

  // Multi-layer Filtering
  const displayedRows: UnifiedQuestionRow[] = React.useMemo(() => {
    let rows = allUnifiedRows;

    // 1. Tab filter
    if (activeTab === 'valid') {
      rows = rows.filter((r) => r.isValid);
    } else if (activeTab === 'invalid') {
      rows = rows.filter((r) => !r.isValid);
    }

    // 2. File source filter
    if (filterFileId !== 'all') {
      rows = rows.filter((r) => r.fileId === filterFileId);
    }

    // 3. Domain filter
    if (filterDomain !== 'all') {
      rows = rows.filter((r) => {
        const dCode = (r.question?.domainCode || r.raw.domain || '').toLowerCase();
        const dId = r.question?.domainId || '';
        return dCode === filterDomain.toLowerCase() || dId === filterDomain;
      });
    }

    // 4. Level filter
    if (filterLevel !== 'all') {
      rows = rows.filter((r) => {
        const lCode = (r.question?.levelCode || r.raw.level || '').toLowerCase();
        const lId = r.question?.levelId || '';
        return lCode === filterLevel.toLowerCase() || lId === filterLevel;
      });
    }

    // 5. Question type filter
    if (filterType !== 'all') {
      rows = rows.filter((r) => {
        const t = r.question?.type || r.raw.type || '';
        return t === filterType;
      });
    }

    // 6. Search keyword
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      rows = rows.filter((r) => {
        const prompt = (r.raw.prompt || r.question?.prompt || '').toLowerCase();
        const context = (r.raw.context || r.question?.context || '').toLowerCase();
        const explanation = (r.raw.explanation || r.question?.explanation || '').toLowerCase();
        const options =
          r.question?.options?.map((o) => o.text.toLowerCase()).join(' ') ||
          [r.raw.optA, r.raw.optB, r.raw.optC, r.raw.optD]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        const fileName = r.fileName.toLowerCase();

        return (
          prompt.includes(query) ||
          context.includes(query) ||
          explanation.includes(query) ||
          options.includes(query) ||
          fileName.includes(query)
        );
      });
    }

    return rows;
  }, [
    allUnifiedRows,
    activeTab,
    filterFileId,
    filterDomain,
    filterLevel,
    filterType,
    searchQuery,
  ]);

  const displayedValidRows = React.useMemo(
    () => displayedRows.filter((r) => r.isValid),
    [displayedRows]
  );

  const isAllDisplayedSelected =
    displayedValidRows.length > 0 &&
    displayedValidRows.every((r) => selectedRowKeys.has(r.rowKey));

  const isSomeDisplayedSelected =
    displayedValidRows.some((r) => selectedRowKeys.has(r.rowKey)) &&
    !isAllDisplayedSelected;

  const toggleAllDisplayed = () => {
    setSelectedRowKeys((prev) => {
      const next = new Set(prev);
      if (isAllDisplayedSelected) {
        displayedValidRows.forEach((r) => next.delete(r.rowKey));
      } else {
        displayedValidRows.forEach((r) => next.add(r.rowKey));
      }
      return next;
    });
  };

  const selectAllFilteredValid = () => {
    setSelectedRowKeys((prev) => {
      const next = new Set(prev);
      displayedValidRows.forEach((r) => next.add(r.rowKey));
      return next;
    });
  };

  const deselectAllFiltered = () => {
    setSelectedRowKeys((prev) => {
      const next = new Set(prev);
      displayedValidRows.forEach((r) => next.delete(r.rowKey));
      return next;
    });
  };

  const toggleRowKey = (rowKey: string) => {
    setSelectedRowKeys((prev) => {
      const next = new Set(prev);
      if (next.has(rowKey)) {
        next.delete(rowKey);
      } else {
        next.add(rowKey);
      }
      return next;
    });
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      filterFileId !== 'all' ||
      filterDomain !== 'all' ||
      filterLevel !== 'all' ||
      filterType !== 'all'
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterFileId('all');
    setFilterDomain('all');
    setFilterLevel('all');
    setFilterType('all');
  };

  const handleImport = async () => {
    if (selectedValidRows.length === 0) {
      setSubmitError('Vui lòng chọn ít nhất một câu hỏi hợp lệ để nhập.');
      return;
    }

    const questionsToImport = selectedValidRows.map((r) => {
      const q = r.question!;
      return {
        type: q.type,
        prompt: q.prompt,
        context: q.context || undefined,
        explanation: q.explanation || undefined,
        points: q.points ?? 1,
        domainId: q.domainId,
        domainCode: q.domainCode,
        domainName: q.domainName,
        levelId: q.levelId,
        levelCode: q.levelCode,
        levelName: q.levelName,
        status: q.status || 'published',
        options: q.options.map((opt) => ({
          key: opt.key,
          text: opt.text,
          isCorrect: opt.isCorrect,
          explanation: opt.explanation || undefined,
        })),
      };
    });

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await apiClient.post<{ count: number }>('/questions/bulk', {
        questions: questionsToImport,
      });

      const count = res?.count ?? questionsToImport.length;
      setSubmitSuccess(`Đã nhập thành công ${count} câu hỏi vào ngân hàng câu hỏi!`);

      setTimeout(() => {
        onSuccess(count);
        onClose();
      }, 1200);
    } catch (err: any) {
      setSubmitError(
        err instanceof ApiClientError
          ? err.message
          : err?.message || 'Đã xảy ra lỗi trong quá trình lưu dữ liệu.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? () => {} : onClose}
      maxWidth="max-w-6xl"
      widthStyle="min(74rem, calc(100vw - 32px))"
    >
      <div className="flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[24px]">upload_file</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">
                Nhập câu hỏi từ file Excel
              </h2>
              <p className="text-xs text-on-surface-variant">
                Thêm hàng loạt câu hỏi trắc nghiệm IT chuẩn hóa từ một hoặc nhiều file Excel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={downloadQuestionExcelTemplate}
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
              title="Tải mẫu Excel chuẩn có kèm dữ liệu mẫu"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Tải file mẫu Excel
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Upload Drop Area (when no files uploaded) */}
          {files.length === 0 && (
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/60 bg-surface-container-lowest p-8 transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".xlsx, .xls"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    void handleFilesSelect(Array.from(e.target.files));
                    e.target.value = '';
                  }
                }}
              />
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                <span className="material-symbols-outlined text-[32px]">table_view</span>
              </div>
              <p className="text-sm font-semibold text-on-surface text-center">
                Kéo thả các file Excel (.xlsx, .xls) vào đây, hoặc nhấn để chọn file
              </p>
              <p className="mt-1 text-xs text-on-surface-variant text-center">
                Hỗ trợ chọn nhiều file cùng lúc. Dung lượng tối đa 10MB/file.
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadQuestionExcelTemplate();
                }}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Chưa có mẫu? Nhấn vào đây để tải file mẫu chuẩn
              </button>
            </div>
          )}

          {/* Multi-File Management Card Grid */}
          {files.length > 0 && (
            <div className="space-y-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Danh sách file đã chọn ({files.length})
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    • Tổng {totalRowsCount} câu hỏi ({totalValidCount} hợp lệ)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Thêm file khác
                  </button>
                  {files.length > 1 && (
                    <button
                      type="button"
                      onClick={handleClearAllFiles}
                      disabled={submitting}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                      Xóa tất cả
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".xlsx, .xls"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        void handleFilesSelect(Array.from(e.target.files));
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              {/* Grid of File Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                {files.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-outline-variant/50 bg-white p-2.5 shadow-xs transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <span className="material-symbols-outlined text-[20px]">description</span>
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-xs font-semibold text-slate-800 truncate"
                          title={item.file.name}
                        >
                          {item.file.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                          <span>{(item.file.size / 1024).toFixed(1)} KB</span>
                          {item.status === 'parsing' && (
                            <span className="flex items-center gap-1 text-primary">
                              <span className="material-symbols-outlined animate-spin text-[12px]">
                                progress_activity
                              </span>
                              Đang đọc...
                            </span>
                          )}
                          {item.status === 'error' && (
                            <span
                              className="font-medium text-red-600 truncate max-w-[120px]"
                              title={item.errorMessage}
                            >
                              Lỗi đọc file
                            </span>
                          )}
                          {item.status === 'ready' && item.parseResult && (
                            <div className="flex items-center gap-1">
                              <span className="text-emerald-700 font-medium">
                                ✓ {item.parseResult.validCount}
                              </span>
                              {item.parseResult.invalidCount > 0 && (
                                <span className="text-red-600 font-medium">
                                  ⚠️ {item.parseResult.invalidCount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(item.id)}
                      disabled={submitting}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 transition-colors disabled:opacity-50"
                      title={`Gỡ file ${item.file.name}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parsing spinner indicator if any file is parsing */}
          {isAnyParsing && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-[20px] text-primary">
                progress_activity
              </span>
              Đang phân tích và kiểm tra tính hợp lệ của câu hỏi...
            </div>
          )}

          {/* Errors / Success Alerts */}
          {submitError && (
            <div className="flex items-start gap-2.5 rounded-xl bg-error-container p-3.5 text-sm text-on-error-container">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                error
              </span>
              <span className="flex-1">{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-300 p-3.5 text-sm text-emerald-800">
              <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0">
                check_circle
              </span>
              <span className="flex-1 font-medium">{submitSuccess}</span>
            </div>
          )}

          {/* Parse Result Summary, Filter Toolbar & Preview Table */}
          {allUnifiedRows.length > 0 && (
            <div className="space-y-3">
              {/* Filter Toolbar */}
              <div className="space-y-3 border-b border-outline-variant/30 pb-3">
                {/* Row 1: Status Tabs & Quick Selection */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('all')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        activeTab === 'all'
                          ? 'bg-primary text-white'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      Tất cả ({totalRowsCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('valid')}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        activeTab === 'valid'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      Hợp lệ ({totalValidCount})
                    </button>
                    {totalInvalidCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('invalid')}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          activeTab === 'invalid'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        Có lỗi ({totalInvalidCount})
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-on-surface-variant">
                      Đã chọn:{' '}
                      <strong className="text-primary font-bold">{selectedCount}</strong> /{' '}
                      {totalValidCount} câu hợp lệ
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={selectAllFilteredValid}
                        disabled={
                          displayedValidRows.length === 0 || isAllDisplayedSelected
                        }
                        className="rounded-lg border border-outline-variant px-2.5 py-1 text-xs font-medium text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Chọn tất cả các câu hợp lệ đang hiển thị"
                      >
                        Chọn tất cả
                      </button>
                      <button
                        type="button"
                        onClick={deselectAllFiltered}
                        disabled={
                          !displayedValidRows.some((r) => selectedRowKeys.has(r.rowKey))
                        }
                        className="rounded-lg border border-outline-variant px-2.5 py-1 text-xs font-medium text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Bỏ chọn các câu đang hiển thị"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 2: Detailed Filters */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* Keyword Search */}
                  <div className="relative min-w-[220px] flex-1">
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm nội dung câu hỏi, ngữ cảnh, đáp án, giải thích..."
                      className="w-full rounded-xl border border-slate-300 bg-white py-1.5 pl-8 pr-8 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        title="Xóa tìm kiếm"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                  </div>

                  {/* File Source Filter (when > 1 file) */}
                  {files.length > 1 && (
                    <select
                      value={filterFileId}
                      onChange={(e) => setFilterFileId(e.target.value)}
                      className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none max-w-[170px] truncate"
                      title="Lọc theo file nguồn"
                    >
                      <option value="all">Tất cả file ({files.length})</option>
                      {files.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.file.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Domain Filter */}
                  <select
                    value={filterDomain}
                    onChange={(e) => setFilterDomain(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none max-w-[150px] truncate"
                    title="Lọc theo lĩnh vực / chuyên ngành"
                  >
                    <option value="all">Tất cả lĩnh vực</option>
                    {availableDomains.map((d) => (
                      <option key={d.id} value={d.code || d.id}>
                        {d.name || d.code || d.id}
                      </option>
                    ))}
                  </select>

                  {/* Level Filter */}
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none max-w-[130px] truncate"
                    title="Lọc theo cấp độ"
                  >
                    <option value="all">Tất cả cấp độ</option>
                    {availableLevels.map((l) => (
                      <option key={l.id} value={l.code || l.id}>
                        {l.name || l.code || l.id}
                      </option>
                    ))}
                  </select>

                  {/* Question Type Filter */}
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none max-w-[135px]"
                    title="Lọc theo loại câu hỏi"
                  >
                    <option value="all">Tất cả loại câu</option>
                    <option value="single_choice">1 đáp án</option>
                    <option value="multiple_choice">Nhiều đáp án</option>
                  </select>

                  {/* Reset Filters Button */}
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                      title="Đặt lại toàn bộ bộ lọc"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        filter_alt_off
                      </span>
                      Đặt lại
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest">
                <div className="max-h-[360px] overflow-x-auto overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 border-b border-outline-variant/40 bg-surface-container-low text-on-surface-variant">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold w-10 text-center">
                          <input
                            type="checkbox"
                            ref={(el) => {
                              if (el) el.indeterminate = isSomeDisplayedSelected;
                            }}
                            checked={isAllDisplayedSelected}
                            disabled={displayedValidRows.length === 0}
                            onChange={toggleAllDisplayed}
                            className="h-4 w-4 rounded border-outline-variant text-primary accent-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                            title={
                              isAllDisplayedSelected
                                ? 'Bỏ chọn các câu hợp lệ đang hiển thị'
                                : 'Chọn tất cả các câu hợp lệ đang hiển thị'
                            }
                          />
                        </th>
                        {files.length > 1 && (
                          <th className="px-3 py-2.5 font-semibold w-28">File nguồn</th>
                        )}
                        <th className="px-3 py-2.5 font-semibold w-12 text-center">Dòng</th>
                        <th className="px-3 py-2.5 font-semibold w-24">Trạng thái</th>
                        <th className="px-3 py-2.5 font-semibold w-28">Loại</th>
                        <th className="px-3 py-2.5 font-semibold min-w-[240px]">
                          Nội dung câu hỏi
                        </th>
                        <th className="px-3 py-2.5 font-semibold w-36">
                          Lĩnh vực & Cấp độ
                        </th>
                        <th className="px-3 py-2.5 font-semibold min-w-[180px]">Đáp án</th>
                        <th className="px-3 py-2.5 font-semibold min-w-[160px]">
                          Ghi chú / Chi tiết
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {displayedRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={files.length > 1 ? 9 : 8}
                            className="py-10 text-center text-on-surface-variant"
                          >
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <span className="material-symbols-outlined text-[28px] text-slate-400">
                                search_off
                              </span>
                              <p className="text-xs font-medium text-slate-600">
                                Không tìm thấy câu hỏi nào phù hợp với bộ lọc
                              </p>
                              {hasActiveFilters && (
                                <button
                                  type="button"
                                  onClick={handleResetFilters}
                                  className="mt-1 text-xs font-semibold text-primary hover:underline"
                                >
                                  Xóa bộ lọc để xem tất cả
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        displayedRows.map((row) => {
                          const isRowValid = row.isValid;
                          const isSelected =
                            isRowValid && selectedRowKeys.has(row.rowKey);
                          const q = row.question;

                          return (
                            <tr
                              key={row.rowKey}
                              className={
                                !isRowValid
                                  ? 'bg-red-50/40 hover:bg-red-50/60'
                                  : isSelected
                                  ? 'bg-primary/5 hover:bg-primary/10'
                                  : 'opacity-60 hover:opacity-100 hover:bg-surface-container/30'
                              }
                            >
                              {/* Checkbox */}
                              <td className="px-3 py-2.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={!isRowValid}
                                  onChange={() => toggleRowKey(row.rowKey)}
                                  className="h-4 w-4 rounded border-outline-variant text-primary accent-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                                  title={
                                    !isRowValid
                                      ? 'Câu hỏi có lỗi, không thể nhập'
                                      : isSelected
                                      ? 'Bỏ chọn câu này'
                                      : 'Chọn câu này để nhập'
                                  }
                                />
                              </td>

                              {/* Source File Badge (if multi-file) */}
                              {files.length > 1 && (
                                <td className="px-3 py-2.5">
                                  <span
                                    className="inline-block max-w-[110px] truncate rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-700 border border-slate-200"
                                    title={row.fileName}
                                  >
                                    {row.fileName}
                                  </span>
                                </td>
                              )}

                              {/* Row number in source file */}
                              <td
                                onClick={() => isRowValid && toggleRowKey(row.rowKey)}
                                className={`px-3 py-2.5 font-mono text-center font-medium ${
                                  isRowValid
                                    ? 'cursor-pointer select-none text-on-surface'
                                    : 'text-on-surface-variant'
                                }`}
                                title={
                                  isRowValid
                                    ? 'Nhấn để chọn / bỏ chọn dòng này'
                                    : undefined
                                }
                              >
                                {row.originalRowNumber}
                              </td>

                              {/* Status */}
                              <td className="px-3 py-2.5">
                                {isRowValid ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                                    <span className="material-symbols-outlined text-[12px]">
                                      check
                                    </span>
                                    Hợp lệ
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-700">
                                    <span className="material-symbols-outlined text-[12px]">
                                      close
                                    </span>
                                    Lỗi
                                  </span>
                                )}
                              </td>

                              {/* Type */}
                              <td className="px-3 py-2.5">
                                {q ? (
                                  <span
                                    className={`rounded px-1.5 py-0.5 font-medium ${
                                      q.type === 'single_choice'
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'bg-purple-50 text-purple-700'
                                    }`}
                                  >
                                    {q.type === 'single_choice'
                                      ? '1 đáp án'
                                      : 'Nhiều đáp án'}
                                  </span>
                                ) : (
                                  <span className="text-on-surface-variant">
                                    {row.raw.type || '—'}
                                  </span>
                                )}
                              </td>

                              {/* Prompt */}
                              <td className="px-3 py-2.5">
                                <p className="font-medium text-on-surface line-clamp-2">
                                  {row.raw.prompt || '—'}
                                </p>
                                {row.raw.context && (
                                  <p className="mt-0.5 line-clamp-1 text-[11px] text-on-surface-variant italic">
                                    Ngữ cảnh: {row.raw.context}
                                  </p>
                                )}
                              </td>

                              {/* Domain & Level */}
                              <td className="px-3 py-2.5 space-y-1">
                                <div>
                                  <span className="inline-block rounded bg-secondary/10 px-1.5 py-0.5 text-[11px] font-medium text-secondary">
                                    {q?.domainCode || row.raw.domain || '—'}
                                  </span>
                                </div>
                                <div>
                                  <span className="inline-block rounded bg-tertiary/10 px-1.5 py-0.5 text-[11px] font-medium text-tertiary">
                                    {q?.levelCode || row.raw.level || '—'}
                                  </span>
                                </div>
                              </td>

                              {/* Options */}
                              <td className="px-3 py-2.5">
                                {q ? (
                                  <div className="space-y-0.5 text-[11px]">
                                    {q.options.map((opt) => (
                                      <div
                                        key={opt.key}
                                        className={
                                          opt.isCorrect
                                            ? 'font-semibold text-emerald-700'
                                            : 'text-on-surface-variant'
                                        }
                                      >
                                        <span className="font-mono font-bold">
                                          {opt.key}.
                                        </span>{' '}
                                        {opt.text}
                                        {opt.isCorrect && ' ✓'}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-on-surface-variant">
                                    <span>Đ/A: {row.raw.correct || '—'}</span>
                                  </div>
                                )}
                              </td>

                              {/* Error or Note */}
                              <td className="px-3 py-2.5">
                                {!isRowValid ? (
                                  <p className="font-medium text-red-600">
                                    {row.errorMessage}
                                  </p>
                                ) : (
                                  <p className="text-[11px] text-on-surface-variant line-clamp-2">
                                    {q?.explanation || 'Không có giải thích'}
                                  </p>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/40 bg-surface-container-low/40 px-6 py-4">
          <div className="text-xs text-on-surface-variant">
            {allUnifiedRows.length > 0 ? (
              <span>
                Sẵn sàng nhập{' '}
                <strong className="text-primary font-bold text-sm">
                  {selectedCount}
                </strong>{' '}
                /{' '}
                <strong className="text-on-surface">{totalValidCount}</strong> câu hỏi
                hợp lệ được chọn
                {totalInvalidCount > 0 && (
                  <span className="text-red-600 ml-1.5 font-medium">
                    ({totalInvalidCount} câu có lỗi bị bỏ qua)
                  </span>
                )}
              </span>
            ) : (
              <span>Vui lòng chọn hoặc kéo thả file Excel để xem trước câu hỏi</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => void handleImport()}
              disabled={submitting || allUnifiedRows.length === 0 || selectedCount === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                  Đang lưu câu hỏi...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    cloud_upload
                  </span>
                  Xác nhận nhập ({selectedCount} câu)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
