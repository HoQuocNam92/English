# Design Document: Multi-File Selection & Filter Controls for Excel Question Import

**Date:** 2026-09-18  
**Status:** Approved  
**Target File:** `apps/web/app/(admin)/admin/questions/ImportQuestionsModal.tsx`  
**Related Files:** `apps/web/src/features/questions/question-excel.ts`

---

## 1. Problem Statement & Motivation
In the admin question management page (`/admin/questions`), the Excel import modal (`ImportQuestionsModal.tsx`) currently only allows choosing or dragging a single Excel file. If administrators have questions split across multiple files (e.g., questions by different domains or different test batches), they have to repeat the import process one file at a time.
Furthermore, the preview table only has 3 tabs (`Tất cả`, `Hợp lệ`, `Có lỗi`) without any ability to search keywords, filter by file source, domain, level, or question type. As imports grow to hundreds of questions across multiple files, reviewing and curating questions before import becomes difficult without filtering controls.

---

## 2. Design Goals
1. **Multi-File Selection & Dynamic Management**:
   - Allow selecting or dragging multiple `.xlsx`/`.xls` files at once (`<input type="file" multiple>`).
   - Allow incrementally adding more files (`+ Thêm file`) without clearing previously uploaded files.
   - Present a compact file card grid displaying each file's name, size, valid/invalid counts, and a delete button to remove individual files.
   - Provide a "Xóa tất cả" (Remove all files) action when multiple files are loaded.
2. **Unified Data Aggregation**:
   - Merge questions from all files into a single responsive preview list.
   - Maintain a unique row key (`${fileId}:${originalRowNumber}`) so selection state is preserved correctly even when files are added or removed.
   - Add a source file badge to each question row.
3. **Comprehensive Filter Toolbar**:
   - **Status Tabs**: "Tất cả (N)", "Hợp lệ (N)", "Có lỗi (N)".
   - **Search Bar**: Case-insensitive text search matching question prompt, context, options, and explanations with a quick clear icon.
   - **File Source Filter**: Dropdown to filter questions by specific file (or "Tất cả các file"). Only rendered/enabled when > 1 file is uploaded.
   - **Domain (Lĩnh vực) Filter**: Dropdown populated from `availableDomains` + "Tất cả lĩnh vực".
   - **Level (Cấp độ) Filter**: Dropdown populated from `availableLevels` + "Tất cả cấp độ".
   - **Type (Loại câu) Filter**: Dropdown with "Tất cả loại câu", "1 đáp án (single_choice)", and "Nhiều đáp án (multiple_choice)".
   - **Reset Filters Button**: Quickly clear search query and active dropdowns back to default.
4. **Smart Bulk Selection**:
   - "Chọn tất cả" and header checkbox: Select all currently filtered & valid questions.
   - "Bỏ chọn tất cả": Deselect all currently filtered & valid questions.
   - Counter clearly reflects selected valid questions vs total valid questions across all files.
5. **Bulk Import Payload**:
   - Only import valid questions that are currently checked.
   - Send all checked questions in a single API call to `POST /questions/bulk`.

---

## 3. Data Architecture & State Management

### 3.1 Uploaded File Model
```ts
interface UploadedFileItem {
  id: string; // Unique file ID (e.g. `f_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`)
  file: File;
  status: 'parsing' | 'ready' | 'error';
  parseResult: ExcelParseResult | null;
  errorMessage?: string;
}
```

### 3.2 Combined Row Model
```ts
interface UnifiedQuestionRow extends ParsedQuestionRow {
  rowKey: string;          // `${fileId}:${row.rowNumber}`
  fileId: string;
  fileName: string;
  originalRowNumber: number;
}
```

### 3.3 State Variables
- `files: UploadedFileItem[]`
- `selectedRowKeys: Set<string>`
- Filter States:
  - `activeTab: 'all' | 'valid' | 'invalid'`
  - `searchQuery: string`
  - `filterFileId: string` ('all' | specific `fileId`)
  - `filterDomain: string` ('all' | domain code/id)
  - `filterLevel: string` ('all' | level code/id)
  - `filterType: string` ('all' | 'single_choice' | 'multiple_choice')
- Submitting States:
  - `submitting: boolean`
  - `submitError: string | null`
  - `submitSuccess: string | null`

---

## 4. Component Layout & UI Specifications

### 4.1 Header
- Title: "Nhập câu hỏi từ file Excel" + description.
- Actions: "Tải file mẫu Excel" button + Close button (disabled during submit).

### 4.2 File Management Section
- **Empty State (0 files)**:
  - Large dashed dropzone supporting multiple file drop and click to pick.
  - File input has `multiple accept=".xlsx, .xls"`.
- **Active State (>= 1 files)**:
  - Header bar for files: "Danh sách file đã chọn ({files.length} file - {totalQuestions} câu hỏi)" + "+ Thêm file" button + "Xóa tất cả" button.
  - Responsive Grid of Cards (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5`):
    - File icon (Excel green description icon).
    - File name (truncated) and size in KB.
    - Status badges: `✓ X hợp lệ` (emerald), `⚠️ Y lỗi` (rose/red) if errors exist, or spinning loader if parsing.
    - Remove button (trash icon) to remove specific file.

### 4.3 Filter Toolbar
- **Row 1: Tabs & Selection Actions**:
  - Left: Tab pills `Tất cả (${totalRows})`, `Hợp lệ (${validCount})`, `Có lỗi (${invalidCount})`.
  - Right: "Đã chọn: **X** / Y câu hợp lệ", "Chọn tất cả", "Bỏ chọn tất cả".
- **Row 2: Detailed Filters (`flex flex-wrap items-center gap-2.5 pt-2`)**:
  - Search input: Magnifying glass, placeholder "Tìm nội dung, đáp án, giải thích...", clear button `x`.
  - File select (if `files.length > 1`): `<select>` listing all files with valid counts.
  - Domain select: `<select>` populated from `availableDomains`.
  - Level select: `<select>` populated from `availableLevels`.
  - Type select: `<select>` (Tất cả / 1 đáp án / Nhiều đáp án).
  - Reset filters button: Shows when search or dropdown filters are active.

### 4.4 Questions Table
- Columns:
  1. Checkbox (with indeterminate state for partial selection of filtered valid rows).
  2. File nguồn (File badge with tooltip of full file name).
  3. Dòng (Original row number in Excel).
  4. Trạng thái (Hợp lệ / Lỗi badge).
  5. Loại (1 đáp án / Nhiều đáp án).
  6. Nội dung câu hỏi (prompt & context).
  7. Lĩnh vực & Cấp độ.
  8. Đáp án (Options with checkmarks).
  9. Ghi chú / Chi tiết (Error message if invalid, explanation if valid).

### 4.5 Footer
- Summary text: "Sẵn sàng nhập **X** / Y câu hỏi hợp lệ được chọn ({Z} câu có lỗi bị bỏ qua)".
- Action buttons: "Hủy" + "Xác nhận nhập (X câu)".

---

## 5. Verification Plan
1. **Automated Verification**:
   - Run type-check: `pnpm --filter web type-check` (or `npm run type-check`).
   - Run linter/build if applicable.
2. **Manual Test Cases**:
   - Test single file upload & removal.
   - Test multi-file drag and drop (2+ files).
   - Test incremental file addition ("+ Thêm file").
   - Test deleting one file from a multi-file set and verifying table rows & selection state sync.
   - Test search filtering by keyword.
   - Test filtering by Domain, Level, Type, and File.
   - Test "Chọn tất cả" and "Bỏ chọn tất cả" respecting active filters.
   - Test successful bulk import submission.
