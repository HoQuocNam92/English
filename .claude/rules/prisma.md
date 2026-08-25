---
description: Prisma ORM rules
paths:
  - "apps/api/prisma/**"
  - "apps/api/src/**/infrastructure/**"
---
# Prisma Rules

1. Prisma is an infrastructure detail.
2. Run `prisma format` and `prisma validate` after schema changes.
3. Every schema change requiring DB mutation gets a migration.
4. Prefer explicit `select` over huge `include`.
5. Avoid N+1.
6. Use repository mapper.
7. Do not expose generated Prisma types as domain/public API types.
8. Use transaction for atomic multi-write flows.
9. PostgreSQL-specific SQL is allowed in migration when justified.
10. Never interpolate unsafe values into raw SQL.
