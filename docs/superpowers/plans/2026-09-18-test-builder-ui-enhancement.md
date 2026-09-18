# Test Builder UI Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the Test Builder page (`/admin/tests/builder`) with pure white, elevated form inputs and cards, along with a comprehensive question filtering and batch selection system.

**Architecture:** Refactor `apps/web/app/(admin)/admin/tests/builder/page.tsx` by wrapping the form into two distinct white elevated cards. Upgrade all input, textarea, and select controls to pure white backgrounds with clear borders. Implement multi-dimensional question filtering (Domain, Level, Search keyword, Selection status toggle) with batch selection helpers.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Material Symbols Icons.

## Global Constraints
- Target file: `apps/web/app/(admin)/admin/tests/builder/page.tsx`
- Maintain existing API payloads and validation rules in `validate()` and `handleSubmit()`.
- Use Tailwind CSS classes matching project design tokens (`bg-white`, `border-slate-300`, `text-slate-900`, `bg-primary`, `accent-primary`).
- Preserve all existing form functionality (edit mode with `examId`, creating new exams, certificates dropdown, validation errors).

---

### Task 1: Filter & Selection State Logic

**Files:**
- Modify: `apps/web/app/(admin)/admin/tests/builder/page.tsx:35-45`
- Modify: `apps/web/app/(admin)/admin/tests/builder/page.tsx:135-145`

**Interfaces:**
- Consumes: `availableQuestions: QuestionItem[]`, `selectedQuestionIds: string[]`, `domains: SelectOption[]`, `levels: SelectOption[]`.
- Produces:
  - `qFilterDomain: string`
  - `qFilterLevel: string`
  - `qOnlySelected: boolean`
  - `filteredQuestions: QuestionItem[]`
  - `handleSelectAllFiltered: () => void`
  - `handleDeselectFiltered: () => void`
  - `handleResetFilters: () => void`

- [x] **Step 1: Add filter state variables**
In `apps/web/app/(admin)/admin/tests/builder/page.tsx`, add:
```tsx
const [qFilterDomain, setQFilterDomain] = React.useState('');
const [qFilterLevel, setQFilterLevel] = React.useState('');
const [qOnlySelected, setQOnlySelected] = React.useState(false);
```

- [x] **Step 2: Update `filteredQuestions` pipeline and add batch action handlers**
Replace the single `filteredQuestions` filter with:
```tsx
const filteredQuestions = React.useMemo(() => {
  return availableQuestions.filter(q => {
    if (qOnlySelected && !selectedQuestionIds.includes(q.id)) return false;
    if (qFilterDomain) {
      const matchDomain = (q.domain?.code === qFilterDomain || (q as any).domainId === qFilterDomain || (domains.find(d => d.id === qFilterDomain)?.name === q.domain?.name));
      if (!matchDomain) return false;
    }
    if (qFilterLevel) {
      const matchLevel = (q.level?.code === qFilterLevel || (q as any).levelId === qFilterLevel || (levels.find(l => l.id === qFilterLevel)?.name === q.level?.name));
      if (!matchLevel) return false;
    }
    if (qSearch.trim() && !q.prompt.toLowerCase().includes(qSearch.trim().toLowerCase())) {
      return false;
    }
    return true;
  });
}, [availableQuestions, selectedQuestionIds, qOnlySelected, qFilterDomain, qFilterLevel, qSearch, domains, levels]);

const handleSelectAllFiltered = () => {
  const newIds = filteredQuestions.map(q => q.id);
  setSelectedQuestionIds(prev => Array.from(new Set([...prev, ...newIds])));
};

const handleDeselectFiltered = () => {
  const filteredIdSet = new Set(filteredQuestions.map(q => q.id));
  setSelectedQuestionIds(prev => prev.filter(id => !filteredIdSet.has(id)));
};

const handleResetFilters = () => {
  setQSearch('');
  setQFilterDomain('');
  setQFilterLevel('');
  setQOnlySelected(false);
};
```

- [x] **Step 3: Test compilation**
Run: `npm run build` or `npx tsc --noEmit` inside `apps/web`.
Expected: PASS with no type errors.

---

### Task 2: Left Column "Thông tin bài thi" UI Enhancement

**Files:**
- Modify: `apps/web/app/(admin)/admin/tests/builder/page.tsx:168-283`

**Interfaces:**
- Consumes: Form state (`title`, `description`, `domainId`, `levelId`, `certificateId`, `durationMinutes`, `passingScorePercent`, `maxAttempts`, `topics`), `errors`, `domains`, `levels`, `certificates`.
- Produces: Polished white elevated Card with pure white inputs and clear visual hierarchy.

- [x] **Step 1: Wrap left column in Card and update input field styling**
Wrap the left section in:
`<div className="rounded-2xl border border-slate-200/80 bg-white p-6 lg:p-7 shadow-sm space-y-5">`
Add header with icon:
```tsx
<div className="flex items-center gap-2 pb-3 border-b border-slate-100">
  <span className="material-symbols-outlined text-primary text-[22px]">description</span>
  <h3 className="text-base font-bold text-slate-900">Thông tin bài thi</h3>
</div>
```
Update all inputs, select dropdowns, and textarea to use:
- Background: `bg-white`
- Border: `border border-slate-300`
- Text: `text-sm text-slate-900 font-medium placeholder:text-slate-400`
- Focus: `focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all`
- Box shadow: `shadow-2xs`

- [x] **Step 2: Test rendering**
Check that left form fields all display with white backgrounds, sharp borders, and dark text.

---

### Task 3: Right Column "Chọn câu hỏi" Card & Filter System

**Files:**
- Modify: `apps/web/app/(admin)/admin/tests/builder/page.tsx:285-333`

**Interfaces:**
- Consumes: `qSearch`, `qFilterDomain`, `qFilterLevel`, `qOnlySelected`, `filteredQuestions`, `selectedQuestionIds`, `domains`, `levels`, `toggleQuestion`, `handleSelectAllFiltered`, `handleDeselectFiltered`, `handleResetFilters`.
- Produces: Polished right card with search bar, Domain/Level filters, view tabs, batch actions, modern question list with selected highlights, and empty state.

- [x] **Step 1: Wrap right column in Card and build header with counter**
```tsx
<div className="rounded-2xl border border-slate-200/80 bg-white p-6 lg:p-7 shadow-sm flex flex-col space-y-4">
  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-primary text-[22px]">quiz</span>
      <h3 className="text-base font-bold text-slate-900">Chọn câu hỏi</h3>
    </div>
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
      Đã chọn: {selectedQuestionIds.length}
    </span>
  </div>
  ...
</div>
```

- [x] **Step 2: Add keyword search input with clear button**
Add search bar with icon `search` and conditional `close` button to reset `qSearch`.

- [x] **Step 3: Add Domain and Level dropdown filters**
Add 2-column grid for Domain and Level select inputs with `bg-white border-slate-300`.

- [x] **Step 4: Add View Mode Tabs ("Tất cả" vs "Đã chọn") and Batch Action buttons**
Render toggle buttons for All vs Selected, and "Chọn tất cả" / "Bỏ chọn" buttons.

- [x] **Step 5: Upgrade question list and items styling**
Update scrollable question list with:
- `h-[440px] overflow-y-auto rounded-xl border border-slate-200 bg-white divide-y divide-slate-100`
- Selected question row styling: `bg-primary/5 border-l-4 border-l-primary`
- Unselected question row: `hover:bg-slate-50 border-l-4 border-l-transparent`
- Chips for domain, level, points.
- Empty state with reset button when `filteredQuestions.length === 0`.

- [x] **Step 6: Update bottom action buttons**
Ensure submit and cancel buttons have crisp elevation and styling.

---

### Task 4: Verification & Build Validation

**Files:**
- Test: Full build check on `apps/web`

- [x] **Step 1: Run TypeScript / build verification**
Run: `npm run build` or `npx next build` in `apps/web`
Expected: Build passes with 0 errors.

- [x] **Step 2: Commit changes**
Commit changes with message:
`feat: enhance test builder UI with white inputs and question filters`
