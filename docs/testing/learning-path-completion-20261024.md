# Kết thúc lộ trình và bước học tiếp theo

## Hành vi

- Sau khi đánh dấu một bài hoàn thành, hiện bài chưa học tiếp theo cùng ngành/cấp.
- Trang Lộ trình đọc tiến độ hiện tại của chuỗi `focused-20261024`, không dùng
  năm mục trong kế hoạch AI cũ làm điều kiện hoàn thành.
- Mỗi ngành có bốn bài cốt lõi. Học đủ bài mở gợi ý luyện tập tổng kết.
- Chỉ công nhận đạt khi lượt tổng kết gần nhất đã chấm, đạt điểm và được nộp
  sau thời điểm hoàn thành đủ chuỗi bài. Điểm cũ trước chuỗi không được dùng.
- Chưa đạt: gợi ý ôn bài và làm lại. Thiếu nội dung/đề: chưa mở chuyển cấp.
- Đạt ở mọi ngành đã chọn: hiện tổng kết cấp và lời mời chuyển cấp.
- Nút chuyển cấp yêu cầu xác nhận. Server kiểm tra lại điều kiện trong transaction
  Serializable, so sánh cấp hiện tại; giữ lịch sử và từ chối yêu cầu lặp từ tab cũ.
- Chuyên nghiệp là cấp cuối: tổng kết và gợi ý ôn flashcards, khám phá chứng chỉ,
  hoặc chọn thêm ngành. Không tạo cấp mới hoặc cấp chứng chỉ nghề nghiệp.
- Kết quả bài tổng kết không thuộc chứng chỉ cũng hiện bước học tiếp theo và
  đường trở lại Lộ trình, thay vì mặc định dẫn về danh sách chứng chỉ.

Áp dụng cho chuỗi tiếng Anh theo ngành với mục tiêu từ vựng/cả hai. Lộ trình mục
tiêu chỉ chứng chỉ giữ luồng chuyên biệt hiện có. Người học vẫn có chức năng tự
chọn trình độ trong hồ sơ; việc chuyển cấp qua nút hoàn thành dùng điều kiện trên.

## API

- `GET /progress/me/learning-path`: tiến độ, bài kế, bài tổng kết và cấp tiếp theo.
- `POST /progress/me/learning-path/advance`, body `{ "fromLevelCode": "intermediate" }`.

Các endpoint yêu cầu JWT và tài khoản học viên đang hoạt động. Không dùng ID học
viên do client cung cấp. Không sửa cấp chỉ vì đọc bài hoặc tải trang.

## Kiểm tra đã chạy

- TypeScript web và API: đạt.
- Build production Next.js: đạt, đã tạo đủ 57 trang; lần chạy trong sandbox
  gặp quyền ghi `.next`, chạy lại cùng lệnh với quyền phù hợp đã thành công.
- 29 kiểm thử learning path, progress và agenda: đạt.
- 3 kiểm thử dữ liệu đủ bốn cấp: đạt.
- 9 kiểm thử regression web: đạt.
- PostgreSQL QA thật trên VPS: tạo học viên giả riêng trong database QA, học đủ
  bốn bài, kiểm tra không thể chuyển trước tổng kết, tạo kết quả đạt, chuyển
  Trung cấp → Nâng cao, xác nhận bốn bản ghi tiến độ và lượt thi vẫn còn, từ chối
  yêu cầu chuyển lặp. Hai yêu cầu đồng thời chỉ cho một yêu cầu thành công.
  Không thay cấp hoặc tiến độ tài khoản production.

Bản sao QA được tạo từ backup tại VPS, không xuất dữ liệu tài khoản ra ngoài.
Script tích hợp: `apps/api/prisma/test-learning-path-qa.cjs`.
Kiểm thử mới được thêm vào CI qua `test:learning-path`.

Phần này thay thế giới hạn về thiếu bước kết thúc/gợi ý động của lần sửa dữ liệu
trước. AI vẫn chỉ là luồng dự phòng khi không dùng chuỗi cốt lõi.
