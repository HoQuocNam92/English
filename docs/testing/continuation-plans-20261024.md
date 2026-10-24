# Lộ trình tiếp nối sau Chuyên nghiệp

## Không đổi schema

Không thêm bảng, cột hoặc migration. Tái sử dụng `placement_assessments.result`
để lưu JSON có marker `kind: continuation-v1`, ảnh chụp lịch đã chọn, thời điểm
bắt đầu, ngữ cảnh ngành/cấp và ID các buổi người học tự xác nhận.

Các bản ghi này có `questions: []`, `submittedAt: null`, `expiresAt` tại thời điểm
tạo. Vì vậy truy vấn kết quả đầu vào đã nộp không lấy nhầm chúng. Endpoint nộp
placement từ chối riêng marker này, không thể dùng nó để tạo điểm hoặc nâng cấp.
Lựa chọn mới tạo bản ghi mới và giữ lịch cũ; tải lại trang tiếp tục lịch gần nhất
đúng ngữ cảnh của người học. Không dùng lịch sử người khác hoặc ID do client
cung cấp để xác định chủ thể truy cập.

## Gợi ý

- Ôn tập 14 ngày: bảy buổi xen kẽ; dùng từ đến hạn/từ còn yếu theo đúng ngành.
- Vận dụng 14 ngày: ưu tiên bài tài liệu/tình huống chưa học. Nếu đã học thì ghi
  rõ là ôn và vận dụng lại, không giả làm nội dung mới.
- Chứng chỉ: chỉ tạo khi có chủ đề liên quan ngành, kiến thức đã xuất bản và bài
  luyện tập phù hợp. Xếp đủ kiến thức trước luyện tập; không đề xuất bài thi nhiều
  chủ đề khi còn thiếu các điều kiện học. Thời lượng khởi đầu 7–28 ngày phụ thuộc
  lượng nội dung thực có, không cam kết bao phủ toàn bộ chương trình chứng chỉ.

Mỗi lựa chọn có mục tiêu, lý do, số buổi, ngày gợi ý, thời lượng và liên kết học.
Thiếu nội dung chứng chỉ sẽ hiện lý do thay vì tạo lịch rỗng.

Người học xác nhận chọn hoặc đổi lịch; không tự thay trình độ hay mục tiêu chứng
chỉ. Có nút mở buổi tiếp theo và xác nhận đã thực hiện. Các dấu hoàn thành buổi
là tự ghi nhận, không thay đổi điểm thi, độ thành thạo từ hay cấp học. Khi hoàn
thành lịch có thể bắt đầu chu kỳ mới; lịch trước không bị xóa.

## API

- `GET /progress/me/continuation`
- `POST /progress/me/continuation` với `{ "planId": "review" }`
- `POST /progress/me/continuation/complete-step` với `{ "recordId": "...", "stepId": "review-1" }`

Tất cả yêu cầu JWT học viên. Chỉ mở sau khi hoàn thành và đạt tổng kết Chuyên
nghiệp ở mọi ngành đã chọn. Ghi bằng transaction Serializable; tab cũ hoặc buổi
không thuộc lịch hiện tại bị từ chối. Ghi lại cùng buổi không nhân đôi tiến độ.

## Kiểm chứng

- Kiểm thử lựa chọn, lịch có nội dung thực, từ yếu đúng ngành, thiếu đề chứng chỉ,
  lưu và tải lại, đổi lịch, buổi không hợp lệ, quyền sở hữu và bắt đầu chu kỳ mới.
- Kiểm thử placement từ chối dùng JSON lịch tiếp nối làm phiên kiểm tra.
- TypeScript web/API/contracts và build production web/API.
- PostgreSQL QA trên VPS: hoàn thành Chuyên nghiệp bằng học viên giả trong QA,
  sinh lựa chọn từ dữ liệu thực, chọn/đọc lại/ghi buổi/đổi lịch, xác nhận kết quả
  đầu vào gần nhất, điểm thi và cấp học không đổi. Danh sách bảng trước/sau bằng
  nhau. Không thay dữ liệu tài khoản production.

Script QA: `apps/api/prisma/test-continuation-qa.cjs`.
