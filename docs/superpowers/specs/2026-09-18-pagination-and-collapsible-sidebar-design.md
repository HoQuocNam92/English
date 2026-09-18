# Design Specification: Phân trang nội dung học tập & Mini-sidebar thu gọn cho Admin

**Ngày:** 18/09/2026  
**Chủ đề:** Cải thiện phân trang hiển thị số trang và tính năng thu gọn Sidebar (Mini-sidebar) trong Admin Workspace.  
**Trạng thái:** Chờ phê duyệt

---

## 1. Mục tiêu & Bối cảnh
1. **Phân trang trang Quản trị Nội dung Học tập (`/admin/learning-content`):**
   - Hiện tại, trang này đang dùng phân trang thủ công chỉ có text `Trang 1/213` cùng hai nút `← Trước` và `Sau →`. Người dùng không thấy được các số trang cụ thể và khó di chuyển giữa các trang xa.
   - Giải pháp: Tích hợp component `<Pagination>` chuẩn của hệ thống, hiển thị các nút số trang `[1] [2] [3] ... [213]`, nút Trước/Sau, cùng tính năng chuyển nhanh đến trang bất kỳ (Quick Jumper).

2. **Thu gọn Sidebar (Mini-sidebar dạng Icon):**
   - Hiện tại, Sidebar cố định ở bề rộng `272px` trên màn hình desktop, chiếm dụng diện tích làm giảm không gian hiển thị danh sách từ vựng/bảng dữ liệu.
   - Giải pháp: Cho phép người dùng thu gọn sidebar thành Mini-sidebar (`76px`) hiển thị icon căn giữa kèm tooltip khi hover, logo thu nhỏ, và lưu trạng thái vào `localStorage`.

---

## 2. Thiết kế chi tiết

### 2.1. Nâng cấp Phân trang (`Pagination`)
- **Vị trí áp dụng:** `apps/web/app/(admin)/admin/learning-content/page.tsx` và nâng cấp `@/shared/ui/Pagination.tsx`.
- **Tính năng của component `<Pagination>`:**
  - Hiển thị dải số trang thông minh với dấu `...` (Ellipsis):
    - Khi ở đầu: `1, 2, 3, ..., 213`
    - Khi ở giữa: `1, ..., 45, ..., 213`
    - Khi ở cuối: `1, ..., 211, 212, 213`
  - Thông tin số lượng: `Hiển thị X–Y trong tổng số Z từ vựng`.
  - Hai nút icon điều hướng: `ChevronLeft` (Trang trước), `ChevronRight` (Trang sau).
  - Tùy chọn **Quick Jumper**: Ô nhập số trang `Đến trang: [___]` (hỗ trợ bấm `Enter` để nhảy ngay tới trang hợp lệ từ `1` đến `totalPages`).
- **Giao diện:** Bo góc mềm mại `rounded-2xl`, viền nhạt `border-outline-variant/40`, nền trắng `bg-surface-container-lowest`, đồng bộ với Material You / Stitch Design System.

---

### 2.2. Mini-sidebar thu gọn (`Collapsible Sidebar`)
- **Vị trí áp dụng:**
  - `apps/web/src/shared/layout/AppShell.tsx`
  - `apps/web/src/shared/layout/Sidebar.tsx`
  - `apps/web/src/shared/layout/Topbar.tsx`
- **Quản lý trạng thái (`isCollapsed`):**
  - Quản lý state `isCollapsed` tại `AppShell` (truyền xuống `Sidebar` và `Topbar`).
  - Đọc/Ghi trạng thái vào `localStorage` (`techenglish_sidebar_collapsed`) để lưu giữ lựa chọn của người dùng khi tải lại trang.
  - SSR-safe để tránh giật giao diện hoặc cảnh báo hydration mismatch.
- **Hành vi khi Mở rộng (`isCollapsed = false`):**
  - Chiều rộng: `w-[272px]`.
  - Main container: `md:ml-[272px] md:w-[calc(100%-272px)]`.
  - Logo đầy đủ với text `TechEnglish Pro` và phụ đề `Admin workspace`.
  - Nút thu gọn nằm ở header sidebar (icon `left_panel_close` hoặc `menu_open`) với title "Thu gọn sidebar".
  - Tiêu đề từng nhóm danh mục: `TỔNG QUAN`, `QUẢN TRỊ HỆ THỐNG`, `NỘI DUNG`, `HỌC VIÊN`, `BÁO CÁO`.
  - Item menu: Hiển thị icon + tên menu + badge.
  - Footer sidebar: Avatar người dùng + Tên hiển thị + Vai trò + Nút Đăng xuất.
- **Hành vi khi Thu gọn (`isCollapsed = true`):**
  - Chiều rộng: `w-[76px]` với hiệu ứng mượt mà `transition-all duration-300 ease-in-out`.
  - Main container: `md:ml-[76px] md:w-[calc(100%-76px)]` đồng bộ animation.
  - Header: Logo thu nhỏ lại chỉ còn icon vuông gradient `school`. Nút mở rộng nằm gọn gàng (icon `menu` hoặc `right_panel_open` / `menu_open`).
  - Tiêu đề nhóm: Thu nhỏ thành một vạch ngang phân cách mảnh `border-t border-outline-variant/30` để phân tách trực quan.
  - Item menu:
    - Chỉ hiển thị icon ở chính giữa (`justify-center`).
    - Tooltip nổi khi rê chuột: Sử dụng thuộc tính `title={item.label}` hiển thị tên danh mục và badge khi hover.
  - Footer sidebar: Avatar căn giữa, nút logout gọn gàng.
- **Nút Toggle phụ trên Topbar:**
  - Trên Topbar cạnh ô tìm kiếm hoặc mép trái, đặt thêm 1 nút toggle icon để người dùng có thể đóng/mở sidebar linh hoạt.
- **Bảo toàn Mobile Drawer:**
  - Trên kích thước di động (`< md`), Sidebar vẫn hoạt động dưới dạng overlay drawer trượt toàn phần như cũ.

---

## 3. Kế hoạch kiểm thử & Xác minh
1. **Kiểm tra Phân trang:**
   - Kiểm tra click các số trang `1`, `2`, `3`, `213` xem dữ liệu trang có load chính xác không.
   - Kiểm tra nút Trước / Sau hoạt động và vô hiệu hóa đúng ở trang đầu / trang cuối.
   - Nhập số trang vào ô Quick Jumper (ví dụ: `50`), bấm `Enter` để kiểm tra có nhảy đến đúng trang 50 không.
2. **Kiểm tra Thu gọn Sidebar:**
   - Bấm nút thu gọn: Sidebar thu về `76px`, nội dung chính nở rộng ra, không bị tràn hay bể layout.
   - Kiểm tra các icon menu vẫn click chuyển trang bình thường, có tooltip hiển thị tên.
   - Bấm nút mở rộng: Sidebar bung về `272px` mượt mà.
   - F5 / Tải lại trang: Trạng thái thu gọn được ghi nhớ chính xác từ `localStorage`.
   - Kiểm tra giao diện trên mobile (resize màn hình nhỏ): Menu drawer vẫn hoạt động hoàn hảo.
3. **Kiểm tra Typecheck & Lint:**
   - Chạy `pnpm --filter web typecheck` hoặc `tsc --noEmit` để đảm bảo không có lỗi TypeScript.
