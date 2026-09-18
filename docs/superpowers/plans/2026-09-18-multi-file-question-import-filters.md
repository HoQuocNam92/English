# Multi-File Question Import & Filter Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow administrators to upload and manage multiple Excel files simultaneously in `ImportQuestionsModal.tsx`, with a rich multi-criteria filter system (Keyword Search, File Source, Domain, Level, Question Type) and smart bulk selection.

**Architecture:** Refactor `ImportQuestionsModal.tsx` to handle an array of uploaded files (`UploadedFileItem[]`) with asynchronous parallel parsing. Aggregate all rows with unique composite keys (`${fileId}:${rowNumber}`). Add a two-row toolbar containing status tabs, selection stats, search input, and categorical select filters.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, SheetJS (`xlsx`), Material Symbols Icons.

## Global Constraints
- Target file: `apps/web/app/(admin)/admin/questions/ImportQuestionsModal.tsx`
- Maintain existing API endpoint `POST /questions/bulk` and data model contracts in `question-excel.ts`.
- Multi-file inputs must accept `.xlsx` and `.xls` formats.
- Preserve backward-compatibility with single-file drag/drop workflows.

---

### Task 1: Multi-File State & Unified Data Model

**Files:**
- Modify: `apps/web/app/(admin)/admin/questions/ImportQuestionsModal.tsx`

**Interfaces:**
- Produces:
  - `interface UploadedFileItem`: `{ id: string; file: File; status: 'parsing' | 'ready' | 'error'; parseResult: ExcelParseResult | null; errorMessage?: string }`
  - `interface UnifiedQuestionRow extends ParsedQuestionRow`: `{ rowKey: string; fileId: string; fileName: string; originalRowNumber: number }`
  - `files: UploadedFileItem[]`
  - `selectedRowKeys: Set<string>`
  - `handleFilesSelect: (newFiles: File[]) => Promise<void>`
  - `handleRemoveFile: (fileId: string) => void`
  - `handleClearAllFiles: () => void`

- [ ] **Step 1: Declare interfaces and state variables in `ImportQuestionsModal.tsx`**
Replace single `file` state with `files: UploadedFileItem[]` and row selection with `selectedRowKeys: Set<string>`.
- [ ] **Step 2: Implement `handleFilesSelect`**
Add logic to append files to `files` state, parse each file concurrently using `parseQuestionsFromExcel`, update file statuses, and automatically select all newly parsed valid rows.
- [ ] **Step 3: Implement `handleRemoveFile` and `handleClearAllFiles`**
Remove targeted file from `files` and prune any row keys belonging to that file from `selectedRowKeys`.
- [ ] **Step 4: Compute `allUnifiedRows` and totals**
Aggregate all rows across ready files into `allUnifiedRows` with `${fileId}:${row.rowNumber}` keys.

---

### Task 2: Multi-Criteria Filter Toolbar & Selection Logic

**Files:**
- Modify: `apps/web/app/(admin)/admin/questions/ImportQuestionsModal.tsx`

**Interfaces:**
- Produces:
  - Filter state variables: `searchQuery`, `filterFileId`, `filterDomain`, `filterLevel`, `filterType`
  - `displayedRows: UnifiedQuestionRow[]`
  - `displayedValidRows: UnifiedQuestionRow[]`
  - `isAllDisplayedSelected: boolean`
  - `isSomeDisplayedSelected: boolean`
  - `toggleAllDisplayed: () => void`
  - `selectAllFiltered: () => void`
  - `deselectAllFiltered: () => void`
  - `handleResetFilters: () => void`

- [ ] **Step 1: Add filter state hooks**
Add states for `searchQuery`, `filterFileId`, `filterDomain`, `filterLevel`, and `filterType`.
- [ ] **Step 2: Construct multi-layer filtering pipeline**
Filter `allUnifiedRows` sequentially through `activeTab` (all/valid/invalid), `filterFileId`, `filterDomain`, `filterLevel`, `filterType`, and `searchQuery` (checking prompt, context, options text, and explanation).
- [ ] **Step 3: Implement smart select / deselect helpers**
Ensure "Chọn tất cả" and "Bỏ chọn tất cả" operate on the currently filtered valid rows.

---

### Task 3: UI Redesign - Multi-File Cards, Filter Controls & Table Columns

**Files:**
- Modify: `apps/web/app/(admin)/admin/questions/ImportQuestionsModal.tsx`

**Interfaces:**
- Produces:
  - Redesigned File Upload / Cards Section:
    - Empty state: Drag & drop zone with `<input multiple accept=".xlsx, .xls">`.
    - Active state: Grid of file cards with Excel icon, file name, size, valid/invalid badges, and individual delete button.
    - Actions bar: "+ Thêm file" and "Xóa tất cả".
  - Filter Toolbar:
    - Row 1: Status tabs pills, selection counters, and batch action buttons.
    - Row 2: Search input with clear icon + Dropdowns (File, Domain, Level, Type) + Reset filters button.
  - Table:
    - Added "File nguồn" column with file tag.
    - Checkbox header with indeterminate support.
    - Row checkbox with `selectedRowKeys.has(row.rowKey)`.

- [ ] **Step 1: Update Drag & Drop and File Card list**
Add `multiple` to file inputs. Render file cards grid with per-file status badges.
- [ ] **Step 2: Render Filter Toolbar**
Build clean, white-styled search input and `<select>` dropdowns for domain, level, type, and source file.
- [ ] **Step 3: Update Table structure**
Add "File nguồn" column and bind row selection handlers to composite `rowKey`.
- [ ] **Step 4: Update Footer & Submit Payload**
Map selected valid rows to the bulk import API payload `apiClient.post('/questions/bulk', { questions })`.

---

### Task 4: Verification & Validation

**Files:**
- Test: `apps/web/app/(admin)/admin/questions/ImportQuestionsModal.tsx`

- [ ] **Step 1: Type check verification**
Run `pnpm --filter web type-check` (or `npm run type-check`) to ensure zero TypeScript errors.
- [ ] **Step 2: Commit implementation changes**
Commit updated `ImportQuestionsModal.tsx` to git.
