# 20 — React Native Mobile Guide

## Vai trò
Ứng dụng dành cho người học.

## Rule
- Navigation chỉ điều hướng, không chứa business logic.
- Screen không gọi raw HTTP rải rác.
- API access qua infrastructure adapter/client.
- Token/session qua storage abstraction.
- Reusable UI nằm ở `shared/ui`.
- Feature-specific UI nằm trong feature.

## Tổ chức mã nguồn
Không áp dụng phân tầng Clean Architecture cho mobile.
- `app/`: màn hình và điều hướng Expo Router.
- `src/features/`: component riêng cho tính năng đang có.
- `src/shared/api/`: gọi backend.
- `src/shared/storage/`: lưu token và dữ liệu local.
- `src/shared/ui/`: component dùng chung.
Chỉ tạo thư mục khi có mã nguồn thực tế, không thêm `.gitkeep` cho tính năng dự kiến.

Luồng: màn hình/component → API client dùng chung → NestJS API.

## UI reference
Các mobile screen trong Stitch là source of truth.
HTML prototype dùng để hiểu visual/layout; khi chuyển sang React Native phải dùng RN primitives/component phù hợp, không giả webview.

## Offline/local storage
Chỉ thêm khi requirement hoặc codebase đã có quyết định. Không tự ý tạo offline-first architecture.
