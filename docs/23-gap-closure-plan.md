# Kế hoạch hoàn thiện các yêu cầu còn thiếu KLCN028

## Mục tiêu

Hoàn thiện các khoảng trống đã phát hiện khi đối chiếu đề cương KLCN028 với sản phẩm hiện tại, đồng thời bảo toàn các chức năng và thay đổi đang có trong workspace.

## Phạm vi triển khai

### Giai đoạn 1 Hồ sơ học viên trên mobile

- Module và layer: Mobile presentation, Learner Profile API hiện có.
- Use case: xem và cập nhật trình độ, lĩnh vực CNTT, mục tiêu nghề nghiệp và chứng chỉ.
- Prisma model: dùng lại `LearnerProfile`, `LearnerProfileDomain`, `LearnerProfileCareerGoal`, `LearnerCertificateGoal`.
- Migration: không cần.
- API: dùng `GET /learner-profiles/me`, `PUT /learner-profiles/me` và các API taxonomy.
- UI: sửa `profile/edit.tsx`, thay dropdown giả bằng lựa chọn hoạt động, đủ loading/error và lưu dữ liệu thật.
- Test: typecheck mobile và kiểm tra contract endpoint.

### Giai đoạn 2 Xóa mềm tài khoản

- Module và layer: Users API, Prisma schema, Web Admin.
- Use case: admin xóa mềm và khôi phục tài khoản; tài khoản đã xóa không thể đăng nhập.
- Prisma model: thêm `deletedAt` cho `User`, giữ nguyên dữ liệu liên quan để phục hồi và kiểm toán.
- Migration: thêm cột `deleted_at` và index.
- API: `DELETE /users/:id`, không cho tự xóa tài khoản đang đăng nhập.
- UI: thêm hành động xóa có hộp thoại xác nhận trên trang quản lý người dùng.
- Test: kiểm tra lọc danh sách, đăng nhập bị chặn và API xóa mềm.

### Giai đoạn 3 Phân nhóm học viên theo mục tiêu nghề nghiệp

- Module và layer: Learner Groups API, Prisma schema, Web Admin/Teacher.
- Entity: `LearnerGroup`, `LearnerGroupMember`.
- Use case: tạo/sửa/xóa nhóm, tìm học viên theo lĩnh vực hoặc mục tiêu nghề nghiệp, thêm và gỡ thành viên.
- Migration: tạo hai bảng, khóa ngoại, unique và index phục vụ lọc.
- API: CRUD nhóm và quản lý thành viên với quyền phù hợp.
- UI: màn hình danh sách/chi tiết nhóm và liên kết trong menu giảng viên.
- Test: unique membership, quyền truy cập và CRUD cơ bản.

### Giai đoạn 4 Cá nhân hóa bằng AI

- Module và layer: provider AI ở infrastructure, port ở application, recommendation use case.
- Use case: AI xếp hạng và diễn giải tối đa năm gợi ý dựa trên hồ sơ, tiến độ, điểm thi và từ vựng yếu.
- Prisma model: không bắt buộc thêm bảng trong đợt này.
- Migration: không cần.
- Tích hợp: OpenAI Responses API với Structured Outputs; khóa và model lấy từ biến môi trường.
- An toàn vận hành: không gửi email hoặc dữ liệu định danh; timeout ngắn; validate kết quả; tự động quay về engine theo luật khi thiếu khóa hoặc API lỗi.
- API: giữ contract `GET /recommendations/me` để không phá UI.
- Test: provider mock, fallback và validation output.

### Giai đoạn 5 Kiểm thử và minh chứng nghiệm thu

- Bổ sung unit test cho user soft delete, learner group và AI fallback.
- Chạy Prisma validate/generate, API build, web/mobile typecheck.
- Cập nhật checklist đối chiếu yêu cầu và ghi rõ phần nào cần môi trường database để chạy E2E.

## Thứ tự thực hiện

1. Hoàn thiện hồ sơ mobile và lỗi endpoint.
2. Thêm xóa mềm tài khoản.
3. Thêm phân nhóm học viên.
4. Tích hợp AI có fallback.
5. Kiểm thử, build và cập nhật báo cáo.

## Tiêu chí hoàn thành

- Không còn dropdown giả hoặc endpoint sai trong hồ sơ mobile.
- Admin có thể xóa mềm tài khoản và tài khoản đó không thể đăng nhập.
- Admin/giảng viên có thể quản lý nhóm học viên theo mục tiêu.
- Recommendation dùng AI thật khi được cấu hình và vẫn hoạt động ổn định khi chưa có khóa.
- Prisma validate, API build, web typecheck và mobile typecheck đều thành công.
- Các thay đổi đang có của người dùng không bị ghi đè.

## Trạng thái thực hiện ngày 23 tháng 9 năm 2026

- Hoàn thành hồ sơ mobile: sửa endpoint, tải taxonomy và cập nhật thật level, domain, career goal, certificate.
- Hoàn thành xóa mềm tài khoản: schema, migration, API, thu hồi refresh token và thao tác trên web.
- Hoàn thành nền tảng nhóm học viên: schema, migration, CRUD API, API thành viên và màn hình danh sách/tạo/xóa nhóm.
- Hoàn thành AI personalization có fallback: OpenAI Responses API, structured output, timeout và không gửi thông tin định danh.
- Bổ sung hai unit test cho xóa mềm và AI fallback.
- Đã đạt: Prisma validate, Prisma generate, API build, web typecheck, mobile typecheck và 2/2 unit test.
- Đã sao lưu database local và áp dụng thành công hai migration bổ sung; lịch sử migration hiện đồng bộ.
- Màn hình nhóm đã hỗ trợ tạo/xóa nhóm, xem danh sách thành viên, thêm học viên và gỡ học viên.
