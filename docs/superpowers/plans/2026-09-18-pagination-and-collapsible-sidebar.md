# Pagination & Collapsible Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai thanh phân trang hiển thị số trang (Pagination) chuẩn cho trang Quản trị Nội dung Học tập (`/admin/learning-content`) kèm Quick Jumper, và tính năng thu gọn Sidebar (Mini-sidebar dạng icon) cho Admin Workspace lưu trạng thái trong `localStorage`.

**Architecture:** 
1. Nâng cấp `@/shared/ui/Pagination.tsx` để hỗ trợ hiển thị dải số trang rõ ràng, ellipsis và tính năng `showQuickJumper` chuyển trang nhanh.
2. Tích hợp `<Pagination>` vào `apps/web/app/(admin)/admin/learning-content/page.tsx`.
3. Mở rộng `AppShell.tsx`, `Sidebar.tsx`, `Topbar.tsx` với state `isCollapsed` lưu `localStorage`, co giãn sidebar `272px` ↔ `76px` và đẩy main content tương ứng với CSS animation mượt mà.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Material Symbols / Lucide Icons.

## Global Constraints
- Clean Architecture, UI phải theo Stitch Design Reference.
- Không phá vỡ trải nghiệm Mobile Drawer (vẫn mở toàn phần trên màn hình nhỏ).
- Khởi tạo an toàn (SSR-safe / hydration-safe) khi đọc `localStorage`.

---

### Task 1: Nâng cấp Pagination Component và tích hợp vào trang Nội dung học tập

**Files:**
- Modify: `apps/web/src/shared/ui/Pagination.tsx`
- Modify: `apps/web/app/(admin)/admin/learning-content/page.tsx:690-715`

**Interfaces:**
- `PaginationProps`: Thêm prop tùy chọn `showQuickJumper?: boolean`
- Input: `page: number`, `limit: number`, `total: number`, `totalPages: number`, `onPageChange: (page: number) => void`

- [ ] **Step 1: Cập nhật `Pagination.tsx` để hỗ trợ hiển thị dải số trang đẹp mắt và Quick Jumper**
Bổ sung `showQuickJumper?: boolean`, ô nhập số trang nhanh với phím Enter, styling theo Stitch / Material You.

- [ ] **Step 2: Cập nhật `admin/learning-content/page.tsx`**
Import `Pagination` từ `@/shared/ui`, thay thế cụm nút đơn sơ hiện tại bằng `<Pagination page={page} limit={limit} total={total} totalPages={totalPages} onPageChange={setPage} showQuickJumper className="mt-6 rounded-2xl border border-outline-variant/40" />`.

- [ ] **Step 3: Xác minh bằng typecheck**
Chạy `pnpm --filter web typecheck` hoặc test thử trong trang.

---

### Task 2: Triển khai Collapsible Mini-sidebar trong Admin Layout

**Files:**
- Modify: `apps/web/src/shared/layout/AppShell.tsx`
- Modify: `apps/web/src/shared/layout/Sidebar.tsx`
- Modify: `apps/web/src/shared/layout/Topbar.tsx`

**Interfaces:**
- `SidebarProps`: Thêm prop `isCollapsed?: boolean`, `onToggleCollapse?: () => void`
- `TopbarProps`: Thêm prop `isSidebarCollapsed?: boolean`, `onToggleSidebar?: () => void`

- [ ] **Step 1: Quản lý state `isCollapsed` an toàn trong `AppShell.tsx`**
  - Quản lý state `isCollapsed` với mặc định `false`.
  - Đọc `localStorage.getItem('admin_sidebar_collapsed')` trong `useEffect` để tránh lỗi hydration mismatch.
  - Cập nhật class của main container:
    - Mở: `md:ml-[272px] md:w-[calc(100%-272px)]`
    - Thu: `md:ml-[76px] md:w-[calc(100%-76px)]`
    - Thêm `transition-all duration-300 ease-in-out`
  - Truyền `isCollapsed` và `toggleCollapse` vào `Sidebar` và `Topbar`.

- [ ] **Step 2: Nâng cấp `Sidebar.tsx` hỗ trợ giao diện thu gọn (Mini-sidebar)**
  - Chiều rộng: `isCollapsed ? 'w-[76px]' : 'w-[272px]'`, thêm `transition-all duration-300 ease-in-out`.
  - Header: Thêm nút icon button thu gọn/mở rộng (`menu_open` / `menu`). Khi thu gọn, ẩn text "TechEnglish Pro" và "Admin workspace", chỉ giữ icon.
  - NavItem: Khi `isCollapsed`, căn giữa icon (`justify-center px-2`), ẩn label chữ và badge text, thêm thuộc tính `title={item.label}` hiển thị tooltip khi hover.
  - NavGroup: Khi `isCollapsed`, ẩn text group name, thay bằng đường divider ngang `border-t border-outline-variant/30 my-2 mx-3`.
  - User profile dưới chân: Khi `isCollapsed`, chỉ hiển thị avatar tròn và nút đăng xuất nhỏ gọn.

- [ ] **Step 3: Cập nhật `Topbar.tsx` với nút toggle sidebar trên desktop**
  - Thêm icon button toggle sidebar ở đầu Topbar (desktop `hidden md:flex`) để người dùng có thể đóng/mở sidebar ngay từ thanh Topbar.

---

### Task 3: Kiểm thử, xác minh giao diện và chức năng

- [ ] **Step 1: Kiểm tra typecheck và lint**
Chạy `pnpm --filter web typecheck` để đảm bảo code sạch, không có lỗi TypeScript.

- [ ] **Step 2: Xác minh chức năng phân trang**
Kiểm tra dãy số trang, nút Trước/Sau, và ô nhập số trang nhanh.

- [ ] **Step 3: Xác minh chức năng thu gọn/mở rộng sidebar**
Kiểm tra hiệu ứng chuyển động, layout các trang admin khi thu gọn, tooltip khi hover icon, và việc lưu trạng thái vào `localStorage`.
