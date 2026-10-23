# Kết quả kiểm thử Docker ngày 23/10/2026

Đã chạy image `techenglish-api:local` và `techenglish-web:local` có sẵn. Dịch vụ chính dùng `compose.postgres.yml`. Các ca thay đổi dữ liệu chạy trên stack `techenglish-chapter5-qa`, PostgreSQL riêng cổng 15433, API riêng cổng 18080. Không seed hay sửa database chính. Phiên bản image được lưu trong `artifacts/chapter5/docker-image-evidence-20261023.txt`.

## Lỗi import câu hỏi với chuyên ngành không tồn tại

- Mức độ: P1, làm sai phân loại dữ liệu nhập.
- Endpoint: `POST /api/v1/questions/bulk`, tài khoản quản trị QA.
- Chuẩn bị: câu hỏi một đáp án, nội dung và phương án hợp lệ, cấp độ `beginner`.
- Gửi `domainCode: "DOMAIN_NOT_FOUND_QA"` thay cho mã chuyên ngành tồn tại.
- Mong đợi: từ chối dữ liệu không hợp lệ, không lưu câu hỏi sang chuyên ngành khác.
- Thực tế: HTTP 201; câu hỏi được lưu với chuyên ngành `CLOUD`.
- Xác minh: đọc lại câu hỏi qua Prisma trên database QA sau request.
- Nguyên nhân thấy trong mã nguồn: `domainMap.get(dKey) || defaultDomainId` trong `QuestionService.bulkCreate` dùng chuyên ngành mặc định cho cả mã đã nhập nhưng không tồn tại.
- Trạng thái: đã sửa và kiểm tra lại Đạt. Mã chuyên ngành/cấp độ không tồn tại bị từ chối HTTP 400; lô có dòng sai không được ghi một phần. Bỏ trống phân loại vẫn dùng mặc định theo hợp đồng cũ.

## Bằng chứng

- `artifacts/chapter5/docker-qa-20261023.json`: 155/155 kiểm tra đạt.
- `artifacts/chapter5/docker-extended-20261023.json`: 94/94 kiểm tra đạt.
- `artifacts/chapter5/docker-workflows-20261023.json`: 15/15 workflow đạt.
- `artifacts/chapter5/docker-boundaries-20261023.json`: 9 đạt, 1 không đạt.
- `artifacts/chapter5/docker-remaining-api-20261023.json`: 29 đạt, 1 không đạt.
- Tổng các kiểm tra HTTP/workflow ghi nhận: 304; 302 đạt, 2 không đạt. Đây không phải số ca nghiệm thu hoàn tất.
- `docker-all-specs-cleanenv-20261023.log`: 134/134 test spec đạt.
- `docker-client-tests-20261023.log`: 29/29 test web/mobile/shared đạt. Không phải kiểm thử native.
- SMTP giả lập chạy trong container QA, nhận email reset, liên kết được xác thực và đổi mật khẩu/đăng nhập lại thành công. Không xác nhận email tới nhà cung cấp bên ngoài.
- `pg_dump`/`pg_restore` sang database QA thứ hai hoàn tất; số users/questions/exam_attempts cùng 31/164/22. Chưa kiểm toàn bộ dữ liệu, RPO/RTO hoặc smoke luồng trên DB khôi phục.

Các lượt chạy đầu có lỗi fixture/test harness đã được sửa để khớp schema và hợp đồng API; không được tính là lỗi sản phẩm hay cộng vào tổng kết cuối. Test spec đầu tiên bị biến scheduler runtime ảnh hưởng đến test giả lập; lượt cuối chạy với biến này được xóa trong tiến trình test và đạt 134/134.

## Lỗi hoàn tất onboarding khi thiếu mục tiêu

- Mức độ: P1, chấp nhận trạng thái hồ sơ không đầy đủ.
- Endpoint: `POST /api/v1/learner-profiles/me/complete-onboarding`.
- Chuẩn bị: tài khoản học viên QA vừa đăng ký, chưa thiết lập hồ sơ.
- Gửi body `{}` với token của học viên này.
- Mong đợi: báo thiếu dữ liệu thiết lập mục tiêu, không đánh dấu onboarding hoàn tất.
- Thực tế: HTTP 200; `onboardingCompleted=true`, `learningGoal=null`, `domains=[]`, `certGoals=[]`.
- Đã tái hiện trên nhiều tài khoản QA mới ở các lượt chạy riêng.
- Trạng thái: đã sửa và kiểm tra lại Đạt. Mục tiêu bắt buộc; vocabulary/both cần chuyên ngành, certification/both cần chứng chỉ. Cập nhật sở thích không được tự hoàn tất onboarding; hồ sơ đã hoàn tất không được bỏ lựa chọn bắt buộc. Mobile gửi learningGoal tương ứng.

## Phần chưa xác nhận

Android/iOS native, đổi mạng/chạy nền thực tế, push trên thiết bị, đăng nhập Google OAuth thực tế, dịch AI ngoài, trình đọc màn hình, luồng nhập file Excel bằng giao diện, migration nâng cấp từ bản DB cũ và tải/hiệu năng theo SLA. Xem từng hàng trong mục 5.2 để biết phần đã chạy và còn thiếu.

## Kiểm tra sau sửa

- Image cố định: `techenglish-api:chapter5-fix-20261023`, đã chạy tại QA và API chính.
- Năm tệp `docker-*-after-fix-20261023.json`: 304/304 kiểm tra HTTP/workflow đạt. Bằng chứng trước sửa được giữ nguyên.
- `docker-fixes-verification-20261023.json`: 20/20 kiểm tra tích hợp hồi quy đạt, kiểm tra cả trạng thái DB không bị thay đổi khi từ chối.
- `docker-fixes-all-specs-20261023.log`: 152/152 spec đạt, gồm 18 test mới.
- `docker-fixes-client-tests-20261023.log`: 29/29 web/mobile/shared đạt.
- API build và mobile typecheck thành công; chưa xác nhận bản native.
- Word: 128 Đạt, 86 Chưa hoàn tất, 44 Chưa chạy, 1 Bị chặn; tất cả vẫn ở từng hàng mục 5.2.

## Quy tắc Gmail và trình bày kết quả thực tế

Đăng ký tài khoản mới chỉ chấp nhận đúng tên miền gmail.com; chuẩn hóa chữ hoa và khoảng trắng ngoài. Web và mobile kiểm tra tại biểu mẫu, máy chủ kiểm tra DTO và service; đăng ký mới qua Google cũng không bỏ qua quy tắc. Đăng nhập tài khoản quản trị hoặc tài khoản có sẵn vẫn được giữ nguyên.

- 160/160 spec API và 29/29 test client đạt.
- 304/304 kiểm tra HTTP/workflow chạy lại với địa chỉ Gmail thử nghiệm đạt.
- docker-gmail-validation-20261023.json: 8/8 kiểm tra đạt; email ngoài Gmail, tên miền phụ và đuôi giả đều bị từ chối, không tạo bản ghi.
- Giao diện web xác nhận thông báo khi rời ô email với Yahoo và các đuôi Gmail giả; Gmail hợp lệ xóa thông báo.
- API và web Docker chính đã sử dụng image gmail-20261023, healthy.
- Cột kết quả thực tế của Word đã thay mô tả mã HTTP bằng kết quả cụ thể, không suy diễn hiển thị giao diện từ kiểm tra máy chủ. 262 hàng được kiểm tra khớp theo tên kịch bản: 131 Đạt, 86 Chưa hoàn tất, 44 Chưa chạy, 1 Bị chặn.
