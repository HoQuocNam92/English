# 08 — Project Structure

## Root structure

```text
English/
├─ .claude/
│  ├─ agents/
│  ├─ commands/
│  ├─ rules/
│  └─ settings.json
├─ docs/
├─ design-reference/
│  └─ stitch_techenglish_pro/
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

Không dùng folder bọc ngoài kiểu:
- `apps/` và `packages/`
- `apps/`

---

## `apps/api` — NestJS + PostgreSQL + Prisma + Clean Architecture

```text
apps/api/
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts
└─ src/
   ├─ modules/
   │  ├─ auth/
   │  │  ├─ domain/
   │  │  ├─ application/
   │  │  ├─ infrastructure/
   │  │  └─ presentation/
   │  ├─ users/
   │  ├─ learner-profiles/
   │  ├─ learning-content/
   │  ├─ lessons/
   │  ├─ questions/
   │  ├─ exams/
   │  ├─ progress/
   │  ├─ reports/
   │  └─ recommendations/
   ├─ shared/
   │  ├─ domain/
   │  ├─ application/
   │  ├─ infrastructure/
   │  └─ presentation/
   ├─ config/
   ├─ app.module.ts
   └─ main.ts
```

---

## `apps/web` — Next.js

```text
apps/web/
├─ app/
├─ src/
│  ├─ features/
│  ├─ shared/
│  └─ core/
└─ public/
```

Next.js chỉ gọi NestJS API, không truy cập PostgreSQL/Prisma trực tiếp.

---

## `apps/mobile` — React Native

```text
apps/mobile/
└─ src/
   ├─ features/
   ├─ navigation/
   ├─ shared/
   └─ core/
```

React Native chỉ gọi NestJS API.

---

## `packages`

### `packages/contracts`
Shared API contracts / pure TypeScript types phù hợp để chia sẻ.

### `packages/design-tokens`
Shared design tokens giữa Web và Mobile.

### `packages/shared-kernel`
Chỉ chứa pure TypeScript thực sự dùng chung và độc lập framework.

Không đưa:
- Prisma model;
- NestJS decorator;
- Next.js component;
- React Native component
vào shared-kernel.
