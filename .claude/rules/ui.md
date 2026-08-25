---
description: UI implementation phải bám sát Stitch reference
paths:
  - "apps/web/**"
  - "apps/mobile/**"
  - "src/**"
---
# UI Rules — Stitch is Source of Truth
1. Luôn xác định screen tương ứng trong `docs/11-ui-screen-map.md`.
2. Đọc `design-reference/stitch_techenglish_pro/techenglish_pro/DESIGN.md`.
3. Mở `code.html` và `screen.png` của screen trước khi code.
4. Chuyển prototype thành component framework; không paste nguyên trang HTML nếu repo dùng React/Vue/React Native.
5. Giữ:
   - Inter typography;
   - Technology Indigo primary;
   - violet riêng cho AI recommendation;
   - off-white background + white cards;
   - low-contrast borders;
   - soft-modern radius;
   - khoảng cách theo grid 4px.
6. Không tự thay Material Symbols/Lucide bằng emoji.
7. Desktop sidebar, table, filters, cards và mobile bottom navigation phải bám composition gốc.
8. Responsive: desktop/tablet/mobile theo design system; không dùng `md:hidden` một cách máy móc nếu implementation cần chạy đa breakpoint.
9. Tách component dùng lại: Button, Input, Select, Badge, Card, Table, EmptyState, Skeleton, Pagination, Modal/Sheet, ProgressBar.
10. UI data phải lấy từ API/state thật; không hard-code các con số demo từ Stitch.
