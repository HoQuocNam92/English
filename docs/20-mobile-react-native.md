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

## Clean flow
```text
Screen
→ presentation hook/view-model
→ application use case/action
→ repository/API port
→ infrastructure API adapter
→ NestJS API
```

## UI reference
Các mobile screen trong Stitch là source of truth.
HTML prototype dùng để hiểu visual/layout; khi chuyển sang React Native phải dùng RN primitives/component phù hợp, không giả webview.

## Offline/local storage
Chỉ thêm khi requirement hoặc codebase đã có quyết định. Không tự ý tạo offline-first architecture.
