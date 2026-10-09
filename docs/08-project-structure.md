# 08 — Cấu trúc dự án

```text
English/
├─ apps/
│  ├─ api/          # NestJS, Clean Architecture
│  ├─ web/          # Next.js
│  └─ mobile/       # Expo / React Native
├─ packages/        # contracts, design-tokens, shared-kernel
├─ docs/            # Tài liệu; hồ sơ luận văn trong thesis/
├─ docker/          # Hỗ trợ triển khai
├─ scripts/         # Tiện ích; script chuyển đổi cũ trong legacy/
├─ README.md
├─ package.json
├─ pnpm-lock.yaml
└─ pnpm-workspace.yaml
```

## Backend
`apps/api/src/` phân tầng `application/`, `infrastructure/`, `presentation/` cùng `modules/`.
Domain được tách khi có nghiệp vụ thực tế. Prisma schema, migration và seed nằm trong `apps/api/prisma/`.

## Web và mobile
Tổ chức theo màn hình, tính năng và thành phần dùng chung, không bắt buộc phân tầng Clean Architecture.
Web/mobile gọi API backend, không truy cập Prisma/PostgreSQL trực tiếp.

Mobile dùng `app/` cho màn hình/điều hướng Expo Router, `src/features/` cho
component tính năng và `src/shared/` cho API, storage, UI cùng tiện ích chung.
Chỉ giữ thư mục có mã nguồn thực tế.

## File local và tài liệu
- `docs/thesis/`: tài liệu gốc, SQL đối chiếu và gói kiểm chứng Chương 3.
- `scripts/legacy/`: script chuyển đổi giao diện cũ, không thuộc luồng chạy ứng dụng.

Các file cấu hình Docker, TypeScript và pnpm ở gốc phục vụ build/chạy dự án.
