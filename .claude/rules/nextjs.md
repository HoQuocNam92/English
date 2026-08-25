---
description: Next.js web rules
paths:
  - "apps/web/**"
---
# Next.js Rules

- Next.js là web presentation layer.
- Không truy cập DB trực tiếp thay NestJS API.
- `app/` chỉ route/layout/page composition.
- Feature logic ở `src/features`.
- API client ở infrastructure/shared api adapter.
- Server/Client Component chọn theo nhu cầu thật, không gắn `"use client"` toàn cây.
- Form có loading/error/empty/success state.
- Bám Stitch.
- Không tự redesign.
- Không duplicate component nếu shared UI đã có.
