# Sửa lỗi giao diện và lịch sử làm bài

- Các nút Xem kết quả trên trang chủ, trang tiến độ và danh sách hoạt động dùng chung `AttemptResultLink`, cùng kích thước 144 × 44 px và kiểu viền. Điểm phần trăm nằm bên ngoài nút; hàng kết quả xuống dòng khi màn hình hẹp.
- Liên kết Hoạt động gần đây trên trang chủ mở `/learn/quiz/result/:attemptId`, không mở lại đề theo `examId`. Kiểm thử dùng hai lượt làm cùng một đề để xác nhận mỗi liên kết mở đúng kết quả.
- Nhãn Đã học và Xem lại bài dùng màu xanh lá trên cả web và mobile; bài mới giữ màu tím.
- Mô tả lộ trình AWS Cloud Practitioner được viết lại bằng ngôn ngữ trực tiếp. Seed mới dùng câu mới; migration chỉ thay đúng câu mẫu cũ, không ghi đè nội dung đã được quản trị viên chỉnh sửa. Thay đổi dữ liệu áp dụng cho cả web và mobile.

## Kiểm tra

- Web: TypeScript và 13 kiểm thử đạt.
- Mobile: TypeScript và 24 kiểm thử đạt.
- Build production Next.js đạt, tạo đủ 57 trang.
- Prisma validate đạt. Migration chỉ cập nhật mô tả, không đổi schema, điểm hoặc tiến độ người học.

Đã đối chiếu năm ảnh trong tài liệu lỗi. Chưa kiểm tra trên thiết bị mobile thật trong lần sửa này.
