# 12 — UI Implementation Workflow

## Khi code một screen
1. Xác định key trong `11-ui-screen-map.md`.
2. Mở `screen.png` để hiểu composition.
3. Đọc `code.html` để lấy exact hierarchy, spacing, token, copy, icon intent.
4. Không coi prototype HTML là production code; chuyển nó thành component architecture của repo.
5. Map static demo data → API/view model.
6. Tạo loading/error/empty states cùng design language.
7. Kiểm tra lại với screenshot.

## Component strategy
Ưu tiên component chung: AppShell/Sidebar, MobileHeader, BottomNav, PageHeader, StatCard, DataTable, FilterBar, SearchInput, Badge, ProgressBar, FormField, Modal/Sheet, EmptyState, Skeleton, Pagination, TestQuestion, AnswerOption, AIRecommendationCard.

## Không được làm
- Đổi indigo sang màu brand khác.
- Dùng gradient tùy ý.
- Dùng shadow lớn.
- Dùng emoji thay icon.
- Tự đổi layout table → card khi chưa có responsive reason.
- Copy số liệu demo Stitch làm dữ liệu production.
