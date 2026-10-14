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

## Sửa tiến độ chứng chỉ sau khi làm bài kiểm tra

- [x] API tính tiến độ tổng thể từ bài học kiến thức và bài kiểm tra đã xuất bản có câu hỏi; mỗi bài hoàn thành được tính một lần.
- [x] Tổng hợp cả chứng chỉ học ngoài mục tiêu; không giới hạn số lượt bởi 10 kết quả gần nhất. Lượt đang làm/hết hạn không tính hoàn thành.
- [x] Làm lại một đề tăng số lượt nhưng không cộng trùng tiến độ; chỉ lấy lượt có điểm khi tính điểm trung bình.
- [x] Web/mobile dùng cùng phần trăm từ API, hiển thị riêng bài học, bài kiểm tra và lượt thi. Nhãn Đang ôn luyện vẫn đúng khi đã bắt đầu nhưng phần trăm còn 0.
- [x] Danh sách chứng chỉ mobile cập nhật khi quay lại.
- [x] 13 kiểm thử tiến độ backend, 8 kiểm thử web và 9 kiểm thử mobile thành công; build BE/FE và typecheck mobile thành công.

Đã xác nhận truy vấn chỉ đọc trên database local với học viên có lượt thi: tiến độ tổng thể trả về khác 0. Không sửa kết quả thi hoặc tiến độ cũ trong database; API tính lại từ dữ liệu đã lưu.

## Thiết kế lại chi tiết chứng chỉ trên web

- [x] Khối đầu trang đặt thông tin và tiến độ trên cùng hàng, căn đầu thay vì căn đáy; bỏ khoảng trống lệch và cột thống kê trùng lặp.
- [x] Tiêu đề, nhà cung cấp, số chuyên ngành/bài học/bài kiểm tra và hành động chính được phân cấp rõ. Chứng chỉ chưa có bài học dẫn tới bài kiểm tra hiện có.
- [x] Thẻ tiến độ gom số bài hoàn thành, lượt thi và điểm trung bình; cách tính được thu gọn vào mục có thể mở.
- [x] Tab có số lượng nội dung, thẻ chuyên ngành có số chủ đề/bài học và ghi rõ tỷ trọng bài thi; trạng thái chưa có nội dung có hướng dẫn phù hợp.
- [x] Bài kiểm tra hiển thị thành các thẻ hai cột trên desktop, một cột trên màn hình nhỏ; giữ đường dẫn làm bài, xem kết quả và học trước.
- [x] Kiểm tra bằng trình duyệt với English A2 chưa có chủ đề và AWS CLF-C02 có nhiều chủ đề: chuyển tab, mở chuyên ngành và đường dẫn bài học đúng. Màn hình 390px không tràn ngang.
