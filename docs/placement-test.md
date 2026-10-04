# Kiểm tra trình độ và lộ trình

Sau khi tạo tài khoản và chọn mục tiêu, lĩnh vực, chứng chỉ và thời lượng học, học viên có thể làm bài kiểm tra 15 câu hoặc tự chọn trình độ. Bộ câu hỏi là đánh giá định hướng đọc hiểu tiếng Anh CNTT, không phải chứng nhận CEFR hay đánh giá đầy đủ năng lực chuyên môn.

## Dữ liệu mẫu và quản trị

Chạy trong `apps/api`:

```sh
npm run db:seed:placement
```

Seed bổ sung 105 câu: 7 lĩnh vực (Cloud, Cybersecurity, Networking, Data Engineering, Data Science, Software Engineering, DevOps), mỗi lĩnh vực 15 câu trải trên beginner/intermediate/advanced. Mỗi câu có đoạn văn, 4 lựa chọn, đáp án và giải thích. Seed có thể chạy lại và không sửa dữ liệu cũ.

Quản trị tại `/admin/questions`: chọn bộ lọc **Kiểm tra trình độ**, sửa nội dung, lựa chọn, lĩnh vực, trình độ hoặc trạng thái. Câu kiểm tra cần tag `placement`, trạng thái published, 2 lựa chọn trở lên và đúng một đáp án đúng. Các loại single_choice và multiple_choice có một đáp án đúng được hỗ trợ. Không dùng câu chưa xuất bản hoặc danh mục ngừng hoạt động.

## API và lưu trữ

Các endpoint đều yêu cầu JWT:

- `GET /placement-test`: tạo phiên 2 giờ, chọn tối đa 15 câu cân bằng lĩnh vực và trình độ theo hồ sơ, cần tối thiểu 10 câu. Chỉ trả câu hỏi và lựa chọn, không lộ đáp án/giải thích.
- `POST /placement-test/submit`: nhận assessmentId và answers; yêu cầu tất cả câu của phiên, không trùng, đúng option thuộc câu. Chấm theo snapshot máy chủ, không nhận điểm từ client. Lưu câu trả lời, kết quả theo lĩnh vực, giải thích và kế hoạch; cập nhật trình độ hồ sơ trong cùng giao dịch. Nộp lại phiên đã chấm trả kết quả cũ.
- `GET /placement-test/result`: xem kết quả và lộ trình gần nhất của chính người đăng nhập.
- `POST /placement-test/plan`: tạo và lưu kế hoạch từ trình độ tự chọn và mục tiêu đã hoàn tất.

Điểm dưới 40% → beginner; 40–69% → intermediate; từ 70% → advanced. Điểm theo lĩnh vực được lưu cùng tổng điểm. Không dùng bài ngắn để kết luận mức professional.

Bảng `placement_assessments` tách dữ liệu theo learner_id; snapshot giữ nguyên bài thi nếu admin sửa câu hỏi sau khi tạo phiên. Không lấy các câu do client tự chọn để tính điểm.

Giao diện `/onboarding/placement-test` hiển thị kết quả, giải thích và kế hoạch. `/learn/plan` xem lại sau tải trang, có liên kết từ trang chủ.

## Kiểm tra

`npm run test:placement` kiểm tra cân bằng bộ đề, không lộ đáp án, sở hữu phiên, nộp thiếu/trùng/lựa chọn sai, điểm và cập nhật trình độ, nộp lại và hết hạn. Kiểm thử DB dùng hai tài khoản tạm trong giao dịch rollback; kiểm thử Brave bao gồm nộp bài, xem giải thích, xem lại kế hoạch và bố cục mobile.

## Kế hoạch cập nhật theo tiến độ

`GET /progress/me/agenda` trả việc hôm nay và mục tiêu dự kiến theo tháng/năm, tính ngày theo UTC+7. Trang `/learn/progress` ưu tiên bài đang học dở, chủ đề có Quiz gần nhất dưới 70%, từ đến lịch ôn, và Quiz cho chủ đề đã hoàn thành toàn bộ bài. Từ mới và bài học được giới hạn theo nội dung đã xuất bản. Mục tiêu Quiz theo nhịp mỗi tuần đã chọn; số lượt thực tế được đếm trong đúng tháng/năm. Thời lượng học là mục tiêu đã chọn, không giả lập thời gian đã học.

Kế hoạch này được APIVN/GPT-6-luna tối ưu từ các việc mà backend đã kiểm tra điều kiện; khi AI lỗi, trả về kế hoạch theo quy tắc và báo rõ nguồn. Nó tách khỏi bản lộ trình 4 tuần đã lưu sau kiểm tra. Hoàn thành bài, luyện Quiz, học từ hoặc kiểm tra lại phát sự kiện cập nhật; trang cũng tải lại khi quay về tab và mỗi phút. Sau ít nhất 3 điểm Quiz gần đây đều từ 80%, có thể gợi ý kiểm tra lại trình độ; không tự nâng level chỉ dựa trên số bài hay XP. Bài kiến thức được tính vào chuỗi học theo ngày Việt Nam.

`npm run test:agenda` kiểm tra điều kiện và việc thích ứng; kiểm thử DB dùng hai tài khoản tạm trong rollback, kiểm thử Brave kiểm tra ngày/tháng/năm, icon sáng, cập nhật sự kiện, và bố cục mobile.

## AI APIVN đã bật

Dùng `APIVN_API_KEY`, `APIVN_MODEL=gpt-6-luna` và `APIVN_BASE_URL=https://apivn.vn/v1` trong `apps/api/.env`. Không đưa key ra frontend. AI nhận điểm tổng hợp, phần cần củng cố, mục tiêu, thời lượng và tiến độ gắn với các nội dung có sẵn. Không gửi tên, email, mật khẩu hoặc userId trong nội dung phân tích.

AI hoạt động sau nộp bài kiểm tra, khi tạo/tối ưu lộ trình (`POST /placement-test/plan`), khi lấy kế hoạch ngày/tháng/năm và khi xếp hạng gợi ý trang chủ. Bản lộ trình 4 tuần được lưu vào DB. Nút **Tối ưu lộ trình bằng AI** tại `/learn/plan` cập nhật từ điểm kiểm tra và tiến độ mới, giữ kết quả kiểm tra cũ. Kế hoạch hôm nay cập nhật khi dữ liệu thay đổi.

Backend chấm điểm và kiểm tra điều kiện Quiz; AI không sửa level, điểm, trạng thái hoàn thành hay URL. Chỉ chấp nhận id nằm trong catalog/danh sách nhiệm vụ. Cache theo hash nội dung phân tích trong 30 phút và gộp lời gọi đồng thời; thay đổi dữ liệu làm đổi hash và có phân tích mới. Timeout 45 giây; khi lỗi hoặc đầu ra không hợp lệ, dùng quy tắc và hiển thị rõ, không giả nhãn AI. `npm run test:learning-ai` kiểm tra các điều kiện này.
