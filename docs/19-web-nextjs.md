# 19 — Next.js Web Guide

## Vai trò
Website dành cho admin/teacher.

## Rule
- Ưu tiên App Router nếu project hiện tại đang dùng App Router.
- `app/` là routing/composition.
- Feature logic nằm trong `src/features`.
- Không gọi database trực tiếp từ Next.js nếu backend NestJS là system API.
- Web gọi NestJS API qua infrastructure/client adapter.
- Auth/session handling phải tuân theo backend contract.

## Clean Architecture client-side
Domain:
- type/rule thuần cho view-independent logic.

Application:
- action/use-case phía client khi cần orchestration.

Infrastructure:
- API client implementation.
- browser storage adapter.

Presentation:
- page, component, form, hook.

## UI Stitch
Mỗi màn hình phải map tới `docs/11-ui-screen-map.md`.
Trước khi implement:
1. mở screenshot;
2. đọc HTML prototype;
3. xác định reusable components;
4. map data state;
5. implement responsive;
6. visual review.
