# Chức năng giảng viên

- [x] Tiêu đề TechEnglish, dòng phụ Khu vực giảng viên.
- [x] Menu quản lý bài học có các mục con theo loại như admin.
- [x] Quyền tạo, sửa, xóa, xuất bản và đưa bài học về nháp.
- [x] Quản lý từ vựng, câu hỏi và bài kiểm tra qua các màn hình dùng chung.
- [x] Bổ sung quyền xóa bài kiểm tra còn thiếu.
- [x] Tạo, sửa, xóa nhóm và thêm, gỡ thành viên trong toàn bộ nhóm qua API hiện có.
- [x] Giảng viên xem toàn bộ nhóm, kết quả, tiến độ và chi tiết lượt thi trên hệ thống, không cần được gán nhóm.
- [x] Admin và giảng viên dùng chung phạm vi kết quả và tiến độ; học viên vẫn chỉ xem lượt thi của mình.
- [x] Kiểm thử quyền, phạm vi dữ liệu và typecheck web/API.
- [x] Áp dụng SQL bổ sung quyền vào database Docker local trong transaction; xác nhận danh sách quyền sau cập nhật.
- [x] Build, khởi động lại web/API local; kiểm tra HTTP 200 và truy vấn kết quả, tiến độ với phạm vi giảng viên trên database thật.
- [ ] Kiểm tra tương tác trình duyệt với phiên giảng viên đã xác thực MFA.

## Cập nhật quyền tài khoản hiện có

Migration `20261125100000_teacher_teaching_permissions` có trong cả lịch sử `apps/api/prisma/migrations` và `docker/prisma/migrations`. Quy trình Docker hiện tại chọn lịch sử phù hợp qua `docker/migrate.cjs`.

Với môi trường phát triển dùng lịch sử API, chạy từ thư mục gốc sau khi PostgreSQL sẵn sàng:

```powershell
pnpm --filter @techenglish/api db:migrate:deploy
```

Migration chỉ bổ sung permission và liên kết với role, không đổi mật khẩu hoặc tài khoản. Seed cũng đã đồng bộ cho database mới; không cần chạy lại toàn bộ seed để cập nhật tài khoản cũ.

Ngày 25/11/2026: đã áp dụng SQL vào database `techenglish-local-recovery-db-1` và cập nhật các file liên quan, build lại hai container web/API local. Đây là cập nhật container đang chạy; các lần tạo lại container cần dùng image được build từ mã nguồn mới. SQL đã áp dụng trực tiếp, chưa ghi migration vào lịch sử Prisma; chạy quy trình migration ở lần triển khai tiếp theo vẫn an toàn vì SQL có `ON CONFLICT DO NOTHING`.

Giảng viên có thể xem dữ liệu đã có mà không cần tạo nhóm hay thêm thành viên. Phân nhóm học viên hiển thị toàn bộ nhóm.

Kiểm thử tập trung từ `apps/api`:

```powershell
pnpm exec node --test -r ts-node/register src/application/learner-group/teacher-capabilities.spec.ts src/application/learner-group/learner-group.service.spec.ts src/application/taxonomy/level-filters.spec.ts src/application/question/bug-regressions.spec.ts
```
