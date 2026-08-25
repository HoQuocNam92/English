# START HERE — TechEnglish Pro / KLCN028

## Stack cố định
- Backend API: NestJS + TypeScript
- Web Admin/Teacher: Next.js + TypeScript
- Mobile Learner: React Native + TypeScript
- Architecture: Clean Architecture
- Database: PostgreSQL
- ORM: Prisma
- UI source of truth: `design-reference/stitch_techenglish_pro/`

## Cấu trúc root chuẩn

```text
English/
├─ .claude/
├─ docs/
├─ design-reference/
├─ apps/
│  ├─ api/
│  ├─ web/
│  └─ mobile/
├─ packages/
│  ├─ contracts/
│  ├─ design-tokens/
│  └─ shared-kernel/
├─ CLAUDE.md
├─ KIT_INDEX.md
└─ README_START_HERE.md
```

Không còn `apps/` và `packages/`.
Không bọc toàn bộ source trong một `src/` ở root.

## Ý nghĩa
- `apps/api` = NestJS backend
- `apps/web` = Next.js web
- `apps/mobile` = React Native mobile
- `packages` = shared package
- `docs` = yêu cầu + kiến trúc + technical docs
- `.claude` = rules / commands / agents
- `design-reference` = UI Stitch

## Prompt khởi động
Đọc `CLAUDE.md`, `docs/16-tech-stack.md`, `docs/17-clean-architecture.md`,
`docs/22-postgresql-prisma.md`, sau đó kiểm tra toàn bộ repository.

Không code ngay.

Hãy:
1. Xác nhận source nằm trực tiếp ở `apps/` và `packages/`.
2. Map code hiện tại sang Clean Architecture.
3. Kiểm tra PostgreSQL + Prisma.
4. Kiểm tra UI mapping với Stitch.
5. Đề xuất roadmap implementation.
6. Chờ tôi xác nhận.
