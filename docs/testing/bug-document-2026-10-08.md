# Kiểm tra các lỗi trong “BUG nè bạn.docx”

Nguồn: 18 ảnh và ghi chú trong tài liệu người dùng. Người dùng xác nhận bỏ khối định nghĩa lặp trong bài Thuật ngữ. Tài liệu chỉ được dùng làm danh sách lỗi; không sửa tài liệu gốc.

| Ảnh | Sửa đổi |
| --- | --- |
| 1, 3 | Popup dịch chỉ hoạt động trong nội dung học, bỏ qua tiếng Việt và đoạn rời như `c; n`. Không hiển thị thông tin cấu hình APIVN cho học viên. Dùng nghĩa từ điển đã xuất bản khi AI lỗi. |
| 2 | Thêm hover/focus cho nút tối ưu lộ trình bằng AI. |
| 4 | Web và mobile bỏ đoạn Nội dung lặp định nghĩa đã hiển thị trong các thẻ thuật ngữ. Giữ ghi chú ngữ cảnh riêng. |
| 5 | Giữ hover của nút đánh dấu hoàn thành; bổ sung hover/focus cho các nút hoàn thành và Quiz trên trang Topic. |
| 6 | Danh mục bài học tối đa 4 cột trên màn hình lớn, tránh 7 thẻ quá hẹp. |
| 7 | Thông báo lưu mục tiêu nêu rõ mục tiêu, trình độ và giờ nhắc học đã được lưu. |
| 8 | Agenda trả về tên và link của từng bài hoàn thành; web/mobile cho phép mở lại mọi bài. Link Topic chứa `lessonId` để mở đúng bài. |
| 9 | Badge trạng thái không xuống dòng; bảng người dùng có chiều rộng tối thiểu và dành thêm chỗ cho trạng thái. |
| 10 | Form cấp độ có lựa chọn rõ ràng Đang hoạt động / Ngừng hoạt động. |
| 11 | Link đề thi chính thức có hover/focus. |
| 12 | Ngữ cảnh câu hỏi dùng font văn bản thường, giữ xuống dòng. |
| 13 | Placeholder ngắn “Nội dung hoặc ngữ cảnh”; API tìm cả prompt và context. |
| 14 | Bộ lọc câu hỏi gửi ID của đề được chọn; không gửi bộ lọc trống. Không bỏ xác thực ID. |
| 15, 17 | GET loại bỏ giá trị query rỗng/trắng, tránh `certificateId=` ở bộ lọc Tất cả. |
| 16 | Thời gian tính từ thời điểm bắt đầu/nộp; thiếu thời điểm trả về null và hiển thị Chưa ghi nhận, không giả thành 0m 0s. Lượt thực sự rất ngắn hiển thị Dưới 1 giây. |
| 18 | Menu từng biểu đồ xuất Excel đúng tập dữ liệu và kỳ đang hiển thị; vô hiệu hóa khi chưa tải hoặc bộ lọc chưa áp dụng. |

Nút Quay lại ở form tạo/sửa và các trang chi tiết được đổi sang lịch sử trình duyệt, có trang dự phòng khi mở trực tiếp.

## Xác minh

- API: build, bộ test hiện có, `test:agenda`, `test:certification`, `test:bug-regressions`.
- Web: typecheck, test hồi quy query/selection/duration và production build.
- Mobile: typecheck, test hồi quy navigation và Expo export Android/iOS/web (bundle JavaScript/Hermes, không phải APK/IPA).
- Trình duyệt trên production build với API giả lập cục bộ: chọn AWS SAA03 gửi đúng UUID; mở ngữ cảnh câu hỏi; mở menu xuất biểu đồ; bài Thuật ngữ không còn khối lặp nhưng vẫn có Usage note; nút Quay lại trở về trang trước.
- Không dùng dữ liệu thật để thử sửa/xóa nội dung. APIVN thật và việc tải tệp Excel qua trình duyệt tích hợp chưa được xác minh; thao tác chờ download của công cụ hết thời gian.

Các test hồi quy được đưa vào CI để kiểm tra các trường hợp trên sau mỗi lần thay đổi.
