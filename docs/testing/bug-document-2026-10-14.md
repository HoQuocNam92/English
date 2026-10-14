# Kiểm tra các lỗi mobile ngày 14 tháng 10 năm 2026

- [x] Nút Trước đó/Tiếp tục có chiều rộng bằng nhau, khoảng đệm ngang và biểu tượng điều hướng; câu cuối hiển thị Hoàn thành.
- [x] Số từ đã biết lấy tổng từ lịch sử đã lưu của tài khoản trên toàn bộ thời gian; mở lịch sử với bộ lọc Đã biết, kể cả khi xem lại flashcard. Lỗi tải không hiển thị số 0 giả.
- [x] Lý do chặn bài thi hiển thị riêng: chờ bổ sung bài học, cần học trước, chưa đến giờ, đã đóng, chưa có câu hỏi hoặc hết lượt. Admin có hướng dẫn xuất bản/gắn bài học và chọn bài kiểm tra độc lập.
- [x] Hai trang Cá nhân/Chỉnh sửa hồ sơ dùng chung ProfileAvatar: ảnh 96 × 96, nút bút tròn 36 × 36, biểu tượng 18, viền trắng và bóng đổ giống nhau. Toàn bộ ảnh là vùng chạm 96 × 96.
- [x] Bộ placement bổ sung 60 câu cho bốn nhóm AWS CLF-C02; tổng 165 câu, mỗi chuyên ngành/nhóm có 15 câu. Seed và hai lịch sử migration đều nạp dữ liệu còn thiếu, không ghi đè câu đã biên tập.

Kiểm tra tự động: bộ kiểm thử mobile, nghiệp vụ lượt thi và placement; kiểm tra kiểu dữ liệu mobile/web/API; xác thực Prisma; chạy migration lặp lại trên PostgreSQL tạm để kiểm tra số câu, đáp án, phân bố và giữ chỉnh sửa cũ.

Cần kiểm tra giao diện trên thiết bị sau khi cập nhật bản mobile: hai nút điều hướng trên màn hình hẹp, nút bút, bộ đếm khi tải lại/xem flashcard, trạng thái bài thi và làm bài placement với riêng nhóm AWS Billing.

## Xác nhận build trước khi push

- [x] Backend: build production NestJS thành công.
- [x] Frontend: build production Next.js thành công, tạo đủ 57 trang tĩnh.
- [x] Mobile: kiểm tra kiểu dữ liệu và 9 kiểm thử thành công.
- [x] Android: Expo export thành công; Gradle assembleRelease thành công cho bốn kiến trúc mặc định, tạo APK release.
- [x] Web: 8 kiểm thử thành công.
- [x] Backend: 17 bộ kiểm thử xác thực, người dùng, từ vựng, tiến độ, thông báo, AI, chứng chỉ, đề thi và placement thành công.

APK là đầu ra local, không đưa vào Git. Build Android thành công chưa xác nhận hiển thị trên thiết bị thật; chưa chạy build native iOS trên môi trường Linux này.
