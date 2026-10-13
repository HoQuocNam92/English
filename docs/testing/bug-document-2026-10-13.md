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
