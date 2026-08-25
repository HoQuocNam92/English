# Create Database Feature — PostgreSQL + Prisma

Khi tạo hoặc sửa feature có database:

1. Đọc:
   - `CLAUDE.md`
   - `docs/17-clean-architecture.md`
   - `docs/22-postgresql-prisma.md`
   - `.claude/rules/database.md`
   - `.claude/rules/prisma.md`

2. Phân tích domain trước.

3. PLAN:
   - Prisma model cần thêm/sửa;
   - relation;
   - unique/index;
   - migration;
   - repository port;
   - Prisma implementation;
   - mapper;
   - transaction nếu có;
   - seed nếu có.

4. Chỉ sau đó code.

5. Verify:
```bash
npx prisma format
npx prisma validate
npx prisma generate
```

6. Chạy migration/test theo môi trường hiện tại.

7. Không đưa Prisma vào domain/application.
