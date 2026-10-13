# Sửa lỗi theo Bug.docx ngày 13 tháng 10 năm 2026

Tài liệu được dùng làm mô tả lỗi và ảnh tham chiếu. Không chỉnh sửa tài liệu gốc.

## Thay đổi

- Form tạo/sửa bài thi dùng chung chuyên ngành, cấp độ với bộ chọn câu hỏi. Xóa lọc chỉ xóa tìm kiếm, kỹ năng và tab Đã chọn.
- Lọc câu hỏi ưu tiên ID, không so khớp tên chuyên ngành. Mã chỉ dùng dự phòng khi dữ liệu không có ID.
- Đổi cấu hình sẽ bỏ chọn câu hỏi không phù hợp và thông báo số câu bị bỏ. Bài cũ có câu hỏi không phù hợp hiện cảnh báo và nút bỏ các câu đó.
- Mở bài thi để sửa dùng questionId thay vì ID của bản ghi liên kết examQuestion.
- API kiểm tra câu hỏi tồn tại, thuộc đúng chuyên ngành/cấp độ khi tạo hoặc cập nhật bài thi. Khi cập nhật, kiểm tra trong transaction trước khi thay thế liên kết; thay cấu hình mà không gửi lại câu hỏi cũng được kiểm tra.
- Tổng quan, Phân quyền, Cấp độ, Lịch sử bài thi và Báo cáo dùng chung SummaryStat: nhãn phía trên, icon trung tính, số lớn và đơn vị trên cùng hàng. Bổ sung font-size bị thiếu cho text-headline-h2.
- Tổng số ở Phân quyền được ghi rõ là lượt gán vai trò vì một người có thể có nhiều vai trò.
- Khung tìm kiếm Phân quyền, Cấp độ, Từ vựng, Bài học, Lịch sử bài thi và Bài kiểm tra dùng chung FilterPanel.
- Bộ lọc bài kiểm tra có hàng tìm kiếm riêng, bên dưới là lưới bộ lọc đủ rộng; nút Xóa lọc không kéo giãn.

## Xác minh

- Typecheck web và API thành công; production build web thành công sau thay đổi cuối cùng.
- Bộ test hồi quy web thành công, gồm phân biệt chuyên ngành tương tự và cấp độ khác nhau.
- Bộ test hồi quy API thành công, gồm test mới về tạo/sửa bài thi, câu hỏi thiếu hoặc sai chuyên ngành/cấp độ, thay cấu hình với câu hỏi hiện có và chặn trước khi ghi dữ liệu. Test mới được thêm vào test:bug-regressions để CI chạy.
- Trình duyệt trên production build cục bộ dùng dữ liệu API giả lập: xác minh lọc đúng chuyên ngành, đồng bộ cấp độ từ bộ chọn sang form, bỏ chọn câu không phù hợp, giữ cấp độ khi Xóa lọc và nạp đúng câu hỏi đã chọn khi sửa bài thi.
- Kiểm tra Phân quyền, Cấp độ, Lịch sử bài thi, Bài kiểm tra, Bài học, Từ vựng và Báo cáo ở chiều rộng 1440 và 390 px: độ rộng nội dung và tràn ngang sau khi hiệu ứng chuyển bố cục kết thúc. Đã xem ảnh giao diện các trang liên quan.

Kiểm tra trình duyệt dùng dữ liệu giả lập; không ghi dữ liệu thật và chưa triển khai lên máy chủ.


## Tiếp tục theo Bug (1).docx

- Bỏ icon trong tiêu đề form cấp độ để thống nhất với form từ vựng và chứng chỉ.
- Form cấp độ và chứng chỉ hiển thị lỗi tiếng Việt dưới từng trường như form từ vựng; không dùng popup validation của trình duyệt. Viền lỗi giữ màu đỏ khi focus. Kiểm tra số nguyên và giới hạn tối thiểu ở trường số.
- API tiến độ trả `completedLessons`, `startedLessons`, `studiedWords`. Tỷ lệ chỉ tính trên bài đã bắt đầu, không trộn tiến độ chuyên ngành/chứng chỉ. Giao diện ghi rõ mẫu số, số từ đã học và ý nghĩa của tỷ lệ. Từ mới chỉ được tính khi đã có đánh giá và thời điểm học, không tính bản ghi chưa học.
- Tiến độ bài ôn theo chứng chỉ lấy từ bài đã xuất bản, liên kết trực tiếp hoặc qua chủ đề. Không có bài hoặc chưa học trả 0%; số bài hoàn thành không đồng nghĩa với đạt chứng chỉ. Khi API lỗi, hồ sơ báo lỗi thay vì dựng số liệu 0.
- Danh sách và cả hai màn chi tiết lượt thi dùng chung định dạng thời gian. API giữ phần giây lẻ, giao diện lấy giây đã trôi qua, không làm tròn lên; thiếu thời điểm hiển thị Chưa ghi nhận. Các lượt thi 30 phút cố định trong ảnh phù hợp với seed.ts, nơi dữ liệu mẫu đặt startedAt trước submittedAt đúng 30 phút. Không sửa dữ liệu cũ để đoán thời gian thực tế.
- Bổ sung Python 3, thư viện và dữ liệu eSpeak NG trong image API, kèm bước tạo WAV khi build để chặn image thiếu bộ phát âm.
- Danh sách từ, luyện flashcard và popup dịch dùng chung bộ phát âm; hỗ trợ tệp audio có sẵn và API tạo WAV. Dừng phát khi đổi thẻ/đóng popup, bỏ phản hồi cũ, xử lý lỗi phát và chặn âm thanh; không hiện chi tiết cài đặt máy chủ cho học viên.

### Xác minh đợt tiếp tục

- Typecheck web/API, production build web/API và Prisma validate thành công.
- Bộ test web và bộ test API hiện có cùng hồi quy về phạm vi câu hỏi, tiến độ, phân biệt chứng chỉ, lỗi truy cập dữ liệu, thời gian thiếu và phần giây lẻ.
- Tạo WAV thật bằng bộ phát âm cục bộ; trình duyệt phát WAV này qua API giả lập và ghi nhận kết thúc phát.
- Kiểm tra ba form cấp độ/chứng chỉ/từ vựng ở 1440 và 390 px: lỗi dưới trường, viền đỏ khi focus, không gửi ghi dữ liệu khi form thiếu, không tràn ngang. Kiểm tra hồ sơ với 1 bài hoàn thành, 3 từ đã học và chứng chỉ 0/4 bài; đã xem ảnh giao diện.
- Chưa build image Docker mới hoặc triển khai lên máy chủ. Kiểm tra trình duyệt dùng dữ liệu giả, không ghi dữ liệu thật; chưa xác minh âm thanh trên thiết bị của người dùng.
