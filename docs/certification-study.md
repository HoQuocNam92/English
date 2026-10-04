# Học và luyện thi chứng chỉ

Trang chứng chỉ dùng bài học kiến thức theo Domain/Topic, không dùng tiến độ học từ vựng để tính hoàn thành. Học viên đọc bài, đánh dấu hoàn thành rồi làm Quiz của chủ đề. Kết quả Quiz có đường quay về ôn kiến thức. Thi thử tổng hợp vẫn ở tab Thi thử.

## Quản trị

- `/admin/certifications`: mở chứng chỉ, thêm Domain/Topic, chọn **Soạn bài học**, **Gắn bài học** hoặc **Gắn câu hỏi** ở từng chủ đề.
- Nút **Xem trước bài** ở chủ đề mở bản xem trước trong admin, dùng cùng giao diện nội dung người học và không ghi tiến độ.
- `/admin/lessons?type=certification_review`: tìm, sửa, xuất bản, lưu trữ và xóa bài học. Bài đã xuất bản cần lưu trữ trước khi xóa.
- Trình soạn bài học có trường chứng chỉ và chủ đề. Bài học của chứng chỉ khác hoặc nội dung từ vựng không thể gắn làm bài học kiến thức của chủ đề.
- `/admin/questions` và `/admin/tests`: quản lý câu hỏi, giải thích đáp án và các đề luyện/thi thử hiện có.

Chỉ bài `certification_review` đã xuất bản được hiển thị ở luồng học. Tiến độ dùng `learning_progress` với `resource_type=lesson` và user đang đăng nhập. Bảng `certification_topic_lessons` liên kết bài học với chủ đề. Quiz practice của chủ đề yêu cầu hoàn thành các bài học đã xuất bản; thi thử không có điều kiện này.

## Dịch khi bôi đen

Hộp dịch được gắn ở root layout của web, hoạt động trên trang học, Quiz, trang công khai và admin. Chọn từ/cụm từ tiếng Anh để hiện nghĩa, Escape hoặc nút đóng để tắt. Nội dung đang nhập trong ô biểu mẫu không kích hoạt dịch.

Backend ưu tiên nghĩa chính xác trong từ điển nội bộ, sau đó gọi APIVN nếu đã có key. Chỉ đoạn được chọn được gửi đến APIVN, không gửi toàn trang hoặc dữ liệu tài khoản. API key chỉ dùng ở backend. Có cache, gộp các request đang chạy cùng nội dung, timeout và giới hạn yêu cầu theo IP.

Điền vào `apps/api/.env`, sau đó khởi động lại API:

```dotenv
APIVN_API_KEY=<điền key thật tại đây>
APIVN_MODEL=gpt-6-luna
APIVN_BASE_URL=https://apivn.vn/v1
```

Nếu chưa điền key, các từ trong từ điển vẫn dịch được; đoạn chưa có nghĩa sẽ báo dịch tự động chưa khả dụng. Cấu hình gọi model được kiểm thử bằng provider giả lập; cần key thật để kiểm tra kết nối APIVN thực tế. Tham khảo [API APIVN](https://apivn.tech/docs).

## Dữ liệu mẫu và kiểm tra

Migration: `20261004100000_certification_topic_lessons`.

Chạy trong `apps/api`:

```sh
pnpm db:migrate:deploy
pnpm db:seed:certification-lessons
pnpm test:certification
```

Seed thêm 19 bài kiến thức và 19 Quiz tình huống cho AWS-CLF-C02 hiện có. Chạy lại không tạo trùng và không ghi đè bài học đã được admin chỉnh sửa. Không xóa dữ liệu, lượt thi hay tiến độ hiện có. Dữ liệu nguồn nằm ở `prisma/data/certification-knowledge-lessons.json`; các bài có liên kết tới [phạm vi kiến thức CLF-C02 của AWS](https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html).

Đã kiểm tra TypeScript web/API; kiểm thử từ điển, cấu hình APIVN giả lập, phân quyền nội dung theo chủ đề và cách ly tiến độ; kiểm thử database với các tài khoản tạm trong transaction rollback; kiểm thử trình duyệt với API tiến độ giả lập cho luồng học, mở Quiz, dịch bôi đen, tiến độ khi điều hướng, admin soạn bài và màn hình di động.

### Phát âm trong hộp dịch

Nút Nghe gọi `POST /translation/pronunciation` và phát WAV tiếng Anh, không phụ thuộc giọng đọc cài trong trình duyệt. API cần Python 3 và thư viện hệ thống eSpeak NG (`libespeak-ng1` trên Debian/Ubuntu); máy phát triển hiện có sẵn. Giọng đọc tổng hợp cơ bản. Giới hạn đầu vào 500 byte, chạy tối đa 10 giây, cache 30 đoạn, dùng chung giới hạn gọi với dịch.
