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
  const [file, setFile] = React.useState<File | null>(null);
  const [parsing, setParsing] = React.useState(false);
  const [parseResult, setParseResult] = React.useState<ExcelParseResult | null>(null);
  const [activeTab, setActiveTab] = React.useState<'all' | 'valid' | 'invalid'>('all');
  const [onlyValid, setOnlyValid] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Reset state when modal opens or closes
  React.useEffect(() => {
    if (!open) {
      setFile(null);
      setParsing(false);
      setParseResult(null);
      setActiveTab('all');
      setOnlyValid(true);
      setSubmitError(null);
      setSubmitSuccess(null);
    }
  }, [open]);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setParsing(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const result = await parseQuestionsFromExcel(
        selectedFile,
        availableDomains,
        availableLevels
      );
      setParseResult(result);
      if (result.invalidCount > 0 && result.validCount === 0) {
        setActiveTab('invalid');
      } else {
        setActiveTab('all');
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng file.');
      setParseResult(null);
    } finally {
      setParsing(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.name.endsWith('.xlsx') ||
        droppedFile.name.endsWith('.xls')
      ) {
        void handleFileSelect(droppedFile);
      } else {
        setSubmitError('Vui lòng chỉ chọn file định dạng Excel (.xlsx hoặc .xls)');
      }
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleImport = async () => {
    if (!parseResult) return;

    const questionsToImport = parseResult.rows
      .filter((r) => r.isValid && r.question)
      .map((r) => r.question!);

    if (questionsToImport.length === 0) {
      setSubmitError('Không có câu hỏi hợp lệ nào để nhập.');
      return;
    }

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

  // Filter rows for display
  const displayedRows: ParsedQuestionRow[] = React.useMemo(() => {
    if (!parseResult) return [];
    if (activeTab === 'valid') return parseResult.rows.filter((r) => r.isValid);
    if (activeTab === 'invalid') return parseResult.rows.filter((r) => !r.isValid);
    return parseResult.rows;
  }, [parseResult, activeTab]);

  return (
    <Modal
      open={open}
      onClose={submitting ? () => {} : onClose}
      maxWidth="max-w-5xl"
      widthStyle="min(68rem, calc(100vw - 32px))"
    >
      <div className="flex flex-col max-h-[90vh]">
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
                Thêm hàng loạt câu hỏi trắc nghiệm IT chuẩn hóa vào hệ thống
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
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Upload Area */}
          {!file && (
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/60 bg-surface-container-lowest p-8 transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    void handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                <span className="material-symbols-outlined text-[32px]">table_view</span>
              </div>
              <p className="text-sm font-semibold text-on-surface">
                Kéo thả file Excel (.xlsx) vào đây, hoặc nhấn để chọn file
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Dung lượng tối đa 10MB. File cần tuân thủ theo cấu trúc file mẫu.
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

          {/* Selected File & Status */}
          {file && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-low p-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-[26px] text-emerald-600 shrink-0">
                  description
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting}
                  className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-surface-container disabled:opacity-50"
                >
                  Chọn file khác
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setParseResult(null);
                    setSubmitError(null);
                  }}
                  disabled={submitting}
                  className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-error disabled:opacity-50"
                  title="Gỡ file"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      void handleFileSelect(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Parsing Spinner */}
          {parsing && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-on-surface-variant">
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

          {/* Parse Result Summary & Preview Table */}
          {parseResult && !parsing && (
            <div className="space-y-4">
              {/* Stats Counters & Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/30 pb-3">
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
                    Tất cả ({parseResult.totalRows})
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
                    Hợp lệ ({parseResult.validCount})
                  </button>
                  {parseResult.invalidCount > 0 && (
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
                      Có lỗi ({parseResult.invalidCount})
                    </button>
                  )}
                </div>

                {parseResult.invalidCount > 0 && (
                  <label className="flex items-center gap-2 text-xs font-medium text-on-surface cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={onlyValid}
                      onChange={(e) => setOnlyValid(e.target.checked)}
                      className="accent-primary rounded"
                    />
                    Bỏ qua các câu có lỗi (chỉ nhập {parseResult.validCount} câu hợp lệ)
                  </label>
                )}
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest">
                <div className="max-h-[340px] overflow-x-auto overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 z-10 border-b border-outline-variant/40 bg-surface-container-low text-on-surface-variant">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold w-12 text-center">Dòng</th>
                        <th className="px-3 py-2.5 font-semibold w-24">Trạng thái</th>
                        <th className="px-3 py-2.5 font-semibold w-28">Loại</th>
                        <th className="px-3 py-2.5 font-semibold min-w-[240px]">Nội dung câu hỏi</th>
                        <th className="px-3 py-2.5 font-semibold w-36">Lĩnh vực & Cấp độ</th>
                        <th className="px-3 py-2.5 font-semibold min-w-[180px]">Đáp án</th>
                        <th className="px-3 py-2.5 font-semibold min-w-[160px]">Ghi chú / Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {displayedRows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                            Không có dòng nào trong bộ lọc này
                          </td>
                        </tr>
                      ) : (
                        displayedRows.map((row) => {
                          const isRowValid = row.isValid;
                          const q = row.question;

                          return (
                            <tr
                              key={row.rowNumber}
                              className={isRowValid ? 'hover:bg-surface-container/30' : 'bg-red-50/40 hover:bg-red-50/60'}
                            >
                              {/* Row number */}
                              <td className="px-3 py-2.5 font-mono text-center text-on-surface-variant font-medium">
                                {row.rowNumber}
                              </td>

                              {/* Status */}
                              <td className="px-3 py-2.5">
                                {isRowValid ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                                    <span className="material-symbols-outlined text-[12px]">check</span>
                                    Hợp lệ
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-700">
                                    <span className="material-symbols-outlined text-[12px]">close</span>
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
                                    {q.type === 'single_choice' ? '1 đáp án' : 'Nhiều đáp án'}
                                  </span>
                                ) : (
                                  <span className="text-on-surface-variant">{row.raw.type || '—'}</span>
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
                                        <span className="font-mono font-bold">{opt.key}.</span> {opt.text}
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
            {parseResult ? (
              <span>
                Sẵn sàng nhập{' '}
                <strong className="text-on-surface">
                  {onlyValid ? parseResult.validCount : parseResult.totalRows}
                </strong>{' '}
                câu hỏi hợp lệ
              </span>
            ) : (
              <span>Vui lòng chọn file Excel để xem trước câu hỏi</span>
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
              disabled={
                submitting ||
                !parseResult ||
                parseResult.validCount === 0 ||
                (parseResult.invalidCount > 0 && !onlyValid)
              }
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
                  Xác nhận nhập (
                  {parseResult ? (onlyValid ? parseResult.validCount : parseResult.totalRows) : 0}{' '}
                  câu)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
