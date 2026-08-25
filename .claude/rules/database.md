---
description: PostgreSQL + Prisma persistence rules
paths:
  - "apps/api/**"
---
# Database Rules — PostgreSQL + Prisma

## Fixed stack
- Database: PostgreSQL
- ORM: Prisma

## Boundaries
- Prisma chỉ ở Infrastructure.
- Domain không import `@prisma/client`.
- Application không import `@prisma/client`.
- Controller không inject `PrismaService`.
- Next.js không connect PostgreSQL.
- React Native không connect PostgreSQL.

## Schema
Canonical Prisma schema:
`apps/api/prisma/schema.prisma`

## Repository
Use case phụ thuộc repository port.
Concrete repository dùng Prisma.

## Mapper
Prisma model ↔ Domain Entity qua mapper.
Không trả raw Prisma object qua API.

## Migrations
- Development: `prisma migrate dev`
- Production: `prisma migrate deploy`
- Không dùng `db push` thay production migration.
- Không sửa migration đã chạy production; tạo migration mới.

## PostgreSQL
- `TIMESTAMPTZ` cho timestamp quan trọng.
- UUID map với `@db.Uuid` khi dùng UUID.
- `Json` chỉ cho dữ liệu linh hoạt.
- Index theo query thực tế.
- GIN/partial/expression index có thể viết raw SQL migration.

## Transactions
Nghiệp vụ nhiều write/atomic phải transaction.
Không expose Prisma `$transaction` vào application layer.

## Security
- Không log DATABASE_URL.
- Không commit `.env`.
- Raw SQL phải parameterized.
