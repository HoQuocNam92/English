# 21 — Monorepo Boundaries

## Root
Source code nằm trực tiếp ở:
- `apps/`
- `packages/`

Không có `apps/` và `packages/`.
Không có root `src/` bọc `apps/`.

## apps/api
NestJS backend sở hữu:
- business rules phía server;
- use cases;
- authorization;
- persistence;
- grading;
- progress;
- reports;
- AI recommendation orchestration.

Prisma + PostgreSQL chỉ nằm phía backend infrastructure.

## apps/web
Next.js sở hữu:
- admin/teacher UI;
- web form/view state;
- API integration.

Không được:
- query PostgreSQL trực tiếp;
- import Prisma;
- đặt server business rules quan trọng ở web.

## apps/mobile
React Native sở hữu:
- learner UI;
- navigation;
- device/local storage integration;
- API integration.

Không được:
- import Prisma;
- truy cập PostgreSQL;
- tự xử lý scoring/progress authoritative ở client.

## packages/contracts
Có thể chứa:
- API request/response contract;
- pure TypeScript types;
- enum ổn định.

## packages/design-tokens
Có thể chứa:
- colors;
- spacing;
- radius;
- typography tokens.

## packages/shared-kernel
Chỉ pure TS, framework-independent.
