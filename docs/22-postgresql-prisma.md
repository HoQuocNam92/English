# 22 — PostgreSQL + Prisma

## 1. Vị trí

```text
apps/api/
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts
└─ src/
   ├─ shared/
   │  └─ infrastructure/
   │     └─ prisma/
   │        ├─ prisma.module.ts
   │        └─ prisma.service.ts
   └─ modules/
      └─ lessons/
         ├─ domain/
         ├─ application/
         ├─ infrastructure/
         │  ├─ persistence/
         │  │  └─ prisma/
         │  │     ├─ prisma-lesson.repository.ts
         │  │     └─ lesson-prisma.mapper.ts
         │  └─ ...
         └─ presentation/
```

## 2. Prisma config

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 3. Environment

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/techenglish?schema=public"
```

Không commit `.env`.

## 4. Repository pattern

Application:

```ts
export abstract class LessonRepository {
  abstract findById(id: string): Promise<Lesson | null>;
  abstract save(lesson: Lesson): Promise<void>;
}
```

Infrastructure:

```ts
@Injectable()
export class PrismaLessonRepository implements LessonRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Lesson | null> {
    const row = await this.prisma.lesson.findUnique({ where: { id } });
    return row ? LessonPrismaMapper.toDomain(row) : null;
  }

  async save(lesson: Lesson): Promise<void> {
    const data = LessonPrismaMapper.toPersistence(lesson);
    await this.prisma.lesson.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }
}
```

Use case không biết Prisma tồn tại.

## 5. Mapper

Không dùng trực tiếp Prisma-generated type làm Domain Entity.

```text
Prisma Model
   ↕
Persistence Mapper
   ↕
Domain Entity
```

## 6. Migration workflow

Development:

```bash
npx prisma format
npx prisma validate
npx prisma migrate dev --name <migration_name>
npx prisma generate
```

Production:

```bash
npx prisma migrate deploy
```

Không dùng `db push` thay migration trong production workflow.

## 7. Seed

Seed dùng cho dữ liệu nền:
- role;
- level;
- IT domain;
- certificate category;
- sample development data nếu cần.

Không seed password plain text.

## 8. PostgreSQL features

### UUID
Có thể map:

```prisma
id String @id @default(uuid()) @db.Uuid
```

### JSONB
Prisma `Json` với PostgreSQL được lưu dạng JSONB.

Dùng cho metadata linh hoạt, KHÔNG dùng thay toàn bộ relational schema.

### Index
Index phổ biến:
```prisma
@@index([domainId])
@@index([levelId])
@@index([createdAt])
```

Composite:
```prisma
@@index([domainId, levelId])
```

Unique:
```prisma
@@unique([userId, certificateGoalId])
```

### PostgreSQL-specific index
GIN, partial index, expression index có thể tạo bằng SQL migration:

```sql
CREATE INDEX ... USING GIN (...);
```

Giữ SQL migration trong migration folder và ghi chú lý do.

## 9. Transactions

Ví dụ logic submit exam:

```text
BEGIN
  create/finalize attempt
  save answers
  calculate/save score
  update progress
COMMIT
```

Prisma transaction nằm ở infrastructure.
Application use case không được phụ thuộc Prisma transaction API trực tiếp.

## 10. Query performance
- Không `include` toàn bộ relation nếu không cần.
- Dùng `select`.
- Pagination cho danh sách.
- Tránh N+1.
- Index các foreign key/query/filter quan trọng.
- Với report phức tạp, raw SQL có thể được dùng trong infrastructure nếu Prisma query không phù hợp.
- Raw SQL phải parameterized.

## 11. Soft delete
Không mặc định thêm soft delete cho mọi bảng.
Chỉ dùng `deletedAt` với entity thực sự cần audit/recovery.

## 12. Timestamps
Entity persistence thông thường:

```prisma
createdAt DateTime @default(now()) @db.Timestamptz(6)
updatedAt DateTime @updatedAt @db.Timestamptz(6)
```

Ưu tiên `TIMESTAMPTZ`.

## 13. Naming
Prisma model có thể dùng PascalCase.
DB table có thể map snake_case bằng `@@map`.
Field DB có thể dùng `@map`.

Ví dụ:

```prisma
model LearnerProfile {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @unique @map("user_id") @db.Uuid
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  @@map("learner_profiles")
}
```
