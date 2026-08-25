# CLAUDE.md — TechEnglish Pro / KLCN028

## 1. Stack cố định
Dự án sử dụng:
- Backend API: **NestJS + TypeScript**
- Web Admin/Teacher: **Next.js + TypeScript**
- Mobile Learner: **React Native + TypeScript**
- Architecture: **Clean Architecture**
- Database: **PostgreSQL**
- ORM: **Prisma**
- UI source of truth: `design-reference/stitch_techenglish_pro/`

Không tự đổi framework, database hoặc ORM.

## 2. Source of truth
Ưu tiên theo thứ tự:
1. `docs/` — requirement nghiệp vụ
2. `docs/17-clean-architecture.md`
3. `docs/22-postgresql-prisma.md`
4. `.claude/rules/`
5. Stitch UI trong `design-reference/`
6. Code hiện tại

## 3. Clean Architecture
Dependency đi vào trong:

`Presentation → Application → Domain`

Infrastructure đứng ngoài và implement các port/interface.

### Domain
- Pure TypeScript.
- Không import NestJS.
- Không import Prisma.
- Không import PostgreSQL driver.
- Không biết HTTP/UI/database.

### Application
- Use case.
- Repository port/interface.
- Application DTO.
- Không import `@prisma/client`.
- Không query database trực tiếp.

### Infrastructure
- Prisma Client.
- PostgreSQL persistence.
- Repository implementation.
- Mapper persistence ↔ domain.
- Transaction implementation.
- External providers.

### Presentation
- NestJS controller/guard/filter/interceptor.
- Next.js page/component.
- React Native screen/component.

## 4. PostgreSQL + Prisma rule
Prisma CHỈ được dùng trong backend infrastructure.

Được:
`apps/api/src/modules/*/infrastructure/persistence/prisma/`

Không được:
- import Prisma trong domain;
- import Prisma trong application use case;
- trả Prisma model trực tiếp từ controller;
- dùng Prisma trực tiếp trong Next.js;
- dùng Prisma trong React Native.

Luồng đúng:

```text
Controller
  ↓
Use Case
  ↓
Repository Port
  ↓
Prisma Repository
  ↓
Prisma Client
  ↓
PostgreSQL
```

## 5. Database
Schema Prisma:
`apps/api/prisma/schema.prisma`

Migration:
`apps/api/prisma/migrations/`

Seed:
`apps/api/prisma/seed.ts`

Database URL:
`DATABASE_URL=postgresql://...`

Không hard-code credential.

## 6. ID
Mặc định dùng UUID cho entity chính nếu schema hiện tại chưa có quyết định khác.

Ví dụ Prisma:
```prisma
id String @id @default(uuid()) @db.Uuid
```

Nếu có lý do hiệu năng/compatibility để dùng BigInt hoặc UUIDv7, phải nêu trong PLAN trước khi đổi.

## 7. JSONB
Chỉ dùng `Json` / PostgreSQL JSONB cho dữ liệu thực sự linh hoạt.
Không nhét toàn bộ relational model vào JSONB để né thiết kế bảng.

## 8. Index
Khi tạo query/filter/search thường xuyên phải đánh giá index.
Prisma schema có thể dùng:
```prisma
@@index([field])
@@unique([fieldA, fieldB])
```

Các index PostgreSQL đặc biệt như GIN/partial/expression có thể cần raw SQL migration.
Không ép mọi index vào Prisma schema nếu PostgreSQL hỗ trợ tốt hơn bằng migration SQL.

## 9. Transaction
Các nghiệp vụ nhiều write cần tính atomic phải dùng transaction ở infrastructure.

Đặc biệt:
- submit exam;
- save answers;
- calculate/finalize attempt;
- update progress.

Có thể dùng Prisma interactive transaction trong repository/unit-of-work implementation.

## 10. UI
UI phải bám Stitch.
Không redesign.

## 11. Workflow
DISCOVER → PLAN → IMPLEMENT → VERIFY → REPORT

PLAN phải nói rõ:
- module/layer;
- entity/use case;
- Prisma model;
- migration;
- repository port;
- Prisma repository implementation;
- API;
- UI screen;
- test.

## 12. Definition of Done
- Clean Architecture đúng boundary.
- Prisma chỉ ở infrastructure.
- Migration hợp lệ.
- Seed nếu cần.
- API validation/authorization.
- UI đủ loading/error/empty.
- Unit/integration test.
- `prisma validate`.
- typecheck/lint/test.
- update checklist.
