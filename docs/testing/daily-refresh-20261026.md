# Daily Refresh và các lỗi giao diện học viên

## Hành vi

- Sau khi đạt tổng kết của mọi ngành ở cấp Chuyên nghiệp, web và mobile mở Daily Refresh mặc định nếu chưa chọn kế hoạch tiếp nối. Kế hoạch vận dụng và chứng chỉ vẫn có thể chọn riêng.
- Daily Refresh dùng ngày Việt Nam, đổi vòng ôn lúc 00:00. Hiển thị ngày hiện tại, tiến độ trong ngày và thông báo hoàn thành; không cho khởi động lại để xóa tiến độ hôm nay.
- Luân phiên tối đa ba ngành và ba bài đã học, chỉ dùng nội dung đã xuất bản. Phiên từ vựng chỉ lấy từ đã học đến hạn trong ngành, ưu tiên từ khó và thường trả lời sai; không tự bắt đầu học từ mới.
- Chưa có từ đến hạn thì phiên ôn thông báo trống; người học có thể xem lại bài cũ. Không tạo từ hoặc bài học giả.
- Mỗi vòng được giữ nguyên sau khi ghi nhận. Khi ghi nhận vòng của ngày mới, lưu vòng cũ và các bước đã hoàn thành vào lịch sử. Các bản ghi kế hoạch cũ và kết quả khóa học không bị xóa. Tab cũ gửi mã bước hôm qua bị từ chối.
- Việc xác nhận buổi ôn là người học tự ghi nhận, không thay thế điểm tổng kết. Giữ kiểm tra đủ bài và đạt tổng kết trước khi chuyển cấp; yêu cầu người học xác nhận chuyển cấp.
- Mở bài ghi nhận đang học; mở lại bài đã hoàn thành không hạ tiến độ, kể cả khi mở từ tab khác. Danh sách bài có nhãn đã học và hành động xem lại.
- Bỏ màn hình trung gian của từ vựng từng bài. Quay lại sau phiên ôn đưa về bài nguồn hoặc trang từ vựng, không quay lại màn hình tự bắt đầu phiên mới.
- Làm rõ tổng số bài trên số ngành đã chọn; bỏ nhãn mục tiêu và nhãn nội dung xuất bản dư thừa; thêm đơn vị bài cho mục tiêu thi.
- Danh sách chứng chỉ có thanh phần trăm, trạng thái chưa học/đã bắt đầu và màu nút khác nhau.
- Bài học gần đây dùng tên bài từ API và mở lại được; lượt thi mở được kết quả. Nút xem kết quả trên trang chủ có khung rõ ràng.
- Web hỗ trợ phải/lên để đến câu tiếp theo, trái/xuống để về câu trước. Không chiếm phím khi đang nhập văn bản. Phiên từ vựng chỉ cho tiến sau khi trả lời và giữ câu trả lời khi quay lại.

## Dữ liệu và API

Giữ các endpoint `/progress/me/continuation` và `/complete-step`. Thêm `refreshDate` tùy chọn vào hợp đồng kế hoạch. Tái sử dụng bản ghi `continuation-v1` và transaction hiện có, không cần migration. Lịch sử vòng ôn nằm trong `result.history`; không đưa bản ghi này vào kết quả kiểm tra đầu vào.

## Kiểm tra

- TypeScript API, web, mobile đạt.
- Kiểm thử lộ trình và Daily Refresh, gồm mốc 00:00 Việt Nam, ngày mới, giữ lịch sử, tab cũ, quyền học viên và chọn lại cùng ngày đạt.
- Kiểm thử mở bài không làm mất trạng thái hoàn thành và ưu tiên từ yếu đúng ngành đạt.
- Bộ kiểm thử API, web, mobile và shared kernel đạt.
- Prisma validate đạt; build production Next.js đạt 57 trang.
- Expo export Android với Hermes đạt, tạo bundle từ 1714 module.

Chưa kiểm tra thao tác trên thiết bị Android/iOS thật hoặc tài khoản production trong lần sửa này.
