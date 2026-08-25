# Prisma Infrastructure

Đặt ở đây:
- `prisma.module.ts`
- `prisma.service.ts`

Rule:
- PrismaService chỉ được dùng ở infrastructure/composition.
- Không inject PrismaService vào domain/application use case.
