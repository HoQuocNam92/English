# Design Document: Test Builder UI Enhancement

**Date:** 2026-09-18  
**Status:** Approved  
**Target File:** `apps/web/app/(admin)/admin/tests/builder/page.tsx`

---

## 1. Problem Statement & Motivation
In the test creation / editing interface (`/admin/tests/builder`), the form inputs, selects, and textareas currently use `bg-surface-container-low` (`#f2f4f6`), causing them to look washed out, greyish, and blending into the page background.
Additionally, in the "Chọn câu hỏi" (Question selection) section, administrators only had a single keyword search input without ability to filter questions by Domain (Lĩnh vực), Level (Cấp độ), or selection status (Selected vs All), making it tedious to construct tests from a large pool of questions.

---

## 2. Design Goals
1. **Prominent & Crisp Input Styling**:
   - Give all interactive form fields (inputs, selects, textareas, search bars) a pure white background (`bg-white`), clean borders (`border-slate-300`), sharp typography (`text-slate-900 font-medium`), and noticeable focus rings (`focus:ring-4 focus:ring-primary/10`).
   - Group the two main columns ("Thông tin bài thi" and "Chọn câu hỏi") into clean, elevated white cards (`bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 lg:p-7`) to create clear spatial separation from the page canvas.
2. **Comprehensive Question Filtering & Selection Tools**:
   - Keyword search with quick clear button.
   - Filter dropdown by Domain (Lĩnh vực).
   - Filter dropdown by Level (Cấp độ).
   - Filter tabs: "Tất cả" (All) and "Đã chọn" (Selected only).
   - Batch selection actions: "Chọn tất cả" (Select all currently filtered) and "Bỏ chọn tất cả" (Deselect).
   - Selected state visual cue: highlighted background (`bg-primary/5`) and accent left border (`border-l-4 border-l-primary`).

---

## 3. Detailed Component Architecture & Layout

### 3.1 Left Column: "Thông tin bài thi" (Exam Information Card)
- **Container**:
  `div.bg-white.rounded-2xl.border.border-slate-200/80.shadow-sm.p-6.lg:p-7.space-y-5`
- **Header**:
  - Title: "Thông tin bài thi" with icon `description` and subtle border divider.
- **Fields**:
  - **Tiêu đề \***: `input[type=text]` with `bg-white border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:ring-4 focus:ring-primary/10`.
  - **Mô tả**: `textarea` with `bg-white border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 resize-none`.
  - **Lĩnh vực \* & Cấp độ \***: Grid 2 columns, each with standard styled `<select>` with `bg-white border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900`.
  - **Chứng chỉ liên quan**: Styled `<select>` with `bg-white border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900`.
  - **Thời gian (phút) \* & Điểm đạt (%) \***: Grid 2 columns, number inputs with white background and validation borders.
  - **Số lần thi tối đa & Topics**: Grid 2 columns, number & text inputs with white background.
- **Error states**: Field errors rendered via `FieldError` component in `text-error`.

---

### 3.2 Right Column: "Chọn câu hỏi" (Question Picker Card)
- **Container**:
  `div.bg-white.rounded-2xl.border.border-slate-200/80.shadow-sm.p-6.lg:p-7.flex.flex-col.space-y-4`
- **Header**:
  - Title: "Chọn câu hỏi" with icon `quiz`.
  - Badge counter: Pill badge showing `Đã chọn: X câu` (`bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-xs`).
- **Filter Controls**:
  - **Search Bar**:
    - Input text with magnifying glass icon `search` at left.
    - If search text is present, show clear button `close` at right.
  - **Category Selectors**:
    - Domain filter: `<select>` populated from `domains` list + "Tất cả lĩnh vực" option.
    - Level filter: `<select>` populated from `levels` list + "Tất cả cấp độ" option.
  - **View Mode & Batch Actions**:
    - View tabs:
      - "Tất cả ({count})" button
      - "Đã chọn ({selectedCount})" button
    - Batch buttons:
      - "Chọn tất cả" (adds all questions currently passing the filters into `selectedQuestionIds`)
      - "Bỏ chọn" (unchecks questions currently passing the filters from `selectedQuestionIds`)
- **Question Scroll Area**:
  - Container: `h-[440px] overflow-y-auto rounded-xl border border-slate-200 bg-white divide-y divide-slate-100`.
  - Item:
    - Checkbox with `accent-primary`.
    - Prompt text: `text-sm font-medium text-slate-900 line-clamp-2`.
    - Meta badges: Domain tag, Level tag, Points badge.
    - Selected state: `bg-primary/5 border-l-4 border-l-primary`.
    - Hover state: `hover:bg-slate-50`.
  - Empty State:
    - Illustrated empty message with icon `search_off` and "Không tìm thấy câu hỏi phù hợp".
    - "Đặt lại bộ lọc" button to clear search and dropdown filters.

---

### 3.3 Bottom Action Buttons
- "Tạo bài thi" / "Lưu thay đổi": `bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm`.
- "Hủy": `bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold px-6 py-2.5 rounded-xl`.

---

## 4. State & Filtering Logic
- State variables added to `TestBuilderPage`:
  - `qFilterDomain`: string (domain id or empty string for all)
  - `qFilterLevel`: string (level id or empty string for all)
  - `qOnlySelected`: boolean (toggle to only show selected questions)
- Filtering pipeline:
  ```ts
  const filteredQuestions = availableQuestions.filter(q => {
    if (qOnlySelected && !selectedQuestionIds.includes(q.id)) return false;
    if (qFilterDomain && q.domain?.name !== domains.find(d => d.id === qFilterDomain)?.name && (q as any).domainId !== qFilterDomain) return false;
    if (qFilterLevel && q.level?.name !== levels.find(l => l.id === qFilterLevel)?.name && (q as any).levelId !== qFilterLevel) return false;
    if (qSearch.trim() && !q.prompt.toLowerCase().includes(qSearch.trim().toLowerCase())) return false;
    return true;
  });
  ```
- Batch selection handlers:
  - `handleSelectAllFiltered`: unions current `selectedQuestionIds` with IDs of all `filteredQuestions`.
  - `handleDeselectFiltered`: removes IDs of `filteredQuestions` from `selectedQuestionIds`.
  - `handleResetFilters`: resets `qSearch = ''`, `qFilterDomain = ''`, `qFilterLevel = ''`, `qOnlySelected = false`.

---

## 5. Verification Plan
- Verify compilation without any TypeScript or build errors (`npm run build` or `npx next build`).
- Verify visually that:
  1. All inputs, textareas, selects are crisp white with slate-300 borders and dark text.
  2. Question filtering works smoothly across Domain, Level, and keyword search.
  3. "Đã chọn" tab and batch actions select/deselect questions accurately.
  4. Form submission and validation still function seamlessly.
