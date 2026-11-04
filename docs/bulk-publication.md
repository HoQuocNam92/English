# Chọn và chuyển trạng thái hàng loạt

Từ vựng, bài học (gồm các trang lọc loại nội dung), câu hỏi, bài kiểm tra và chứng chỉ dùng cùng thanh chọn:

1. Chọn các mục riêng hoặc chọn trang hiện tại.
2. Khi cả trang được chọn và còn kết quả ở trang khác, bấm **Chọn tất cả N mục phù hợp bộ lọc**.
3. Lựa chọn giữ nguyên khi chuyển trang/đổi số dòng mỗi trang. Đổi bộ lọc hoặc từ khóa tìm kiếm đã áp dụng sẽ bỏ chọn. Có nút **Bỏ chọn tất cả**.
4. Chỉ bật **Xuất bản** nếu có bản nháp trong lựa chọn; chỉ bật **Chuyển về bản nháp** nếu có mục đã xuất bản. Lựa chọn hỗn hợp được chuyển theo trạng thái nguồn tương ứng, không ghi lại các mục đã ở trạng thái đích. Cấp độ có hành vi tương tự với kích hoạt/ngừng hoạt động.
5. Xác nhận nêu số mục thực sự đủ điều kiện. Kết quả hiển thị số cập nhật, giữ nguyên và bỏ qua do dữ liệu đã đổi hoặc bị xóa. Không có trường hợp chọn rỗng tự chuyển thành cập nhật cả kho.

Chọn toàn bộ chụp danh sách ID rõ ràng từ các trang cùng bộ lọc; không gửi cờ cập nhật vô hạn. Tối đa 10.000 mục mỗi lần, vượt quá cần thu hẹp bộ lọc. Nếu lỗi tải, tổng thay đổi hoặc có ID trùng khi thu thập, lựa chọn hiện tại được giữ nguyên và không nhận danh sách một phần. Kết quả cũ bị hủy khi đổi bộ lọc, kể cả đổi đi rồi quay lại. Phân trang sắp xếp thêm ID để ổn định khi thời điểm tạo/cập nhật trùng nhau.

API kiểm tra ID UUID (gồm ID nhập v5), danh sách không rỗng/không trùng và trạng thái đích hợp lệ. SQL cập nhật kèm trạng thái nguồn, nên yêu cầu lặp hoặc hai yêu cầu đồng thời không xuất bản lại mục đã xuất bản và không đổi `publishedAt` của nó. Các mục lưu trữ không được tự phục hồi bằng thao tác xuất bản hàng loạt. Chứng chỉ/cấp độ cập nhật bằng một lệnh `updateMany`, thay cho nhiều yêu cầu từng dòng.

Các lựa chọn được chụp tại thời điểm thu thập, không bao gồm mục mới tạo sau đó. Chưa dùng transaction dài giữ cố định toàn bộ danh sách trong lúc duyệt trang; điều kiện trạng thái nguồn ở lệnh cập nhật bảo vệ các mục đã đổi trạng thái.
