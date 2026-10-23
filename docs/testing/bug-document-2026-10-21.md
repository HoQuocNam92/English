# Khắc phục các lỗi phát hiện khi kiểm tra chương 5

Ngày xác nhận: 21/10/2026. Các thay đổi đang ở working tree, chưa commit.

## Kết quả trước và sau sửa

- Trước sửa: 141 kiểm thử tự động thành công; kiểm tra API với PostgreSQL QA thật có 145/155 đạt, 10 không đạt, tương ứng chín vấn đề.
- Sau sửa: 130 kiểm thử backend và 29 kiểm thử web/mobile/shared-kernel thành công, tổng 159/159. Đã thêm 18 kiểm thử hồi quy cho đợt sửa.
- Chạy lại cùng bộ 155 kiểm tra API với tiêu chí giữ nguyên: 155/155 đạt.
- Chạy thêm 22 kiểm tra API cho các đường đọc khác, quyền staff và bảo toàn hồ sơ: 22/22 đạt.
- Typecheck API, web, mobile, contracts, design-tokens, shared-kernel đều thành công. Build API thành công. Build web và Android export trước đợt sửa cũng đã thành công; đợt sửa chỉ thay mã API và kiểm thử API.

## Các lỗi đã sửa và kiểm tra lại

| Mã | Trước sửa | Sau sửa |
|---|---|---|
| QA-01 | Email khác hoa thường tạo tài khoản mới | Chuẩn hóa email và tra không phân biệt hoa thường trong xác thực và tạo người dùng; đăng ký trùng trả 409 |
| QA-02 | Domain không tồn tại được nhận và có thể làm mất lựa chọn cũ | Kiểm tra các mã domain, certificate, career goal, level trước ghi; cập nhật hồ sơ và liên kết trong transaction; dữ liệu sai trả 400 và giữ dữ liệu cũ |
| QA-03 | Guest/learner đọc được bài nháp | Catalog chỉ trả published cho người không có quyền; API đọc public dùng optional JWT để xác định staff; nháp trả 404, staff vẫn xem được |
| QA-04 | Single choice không có đáp án đúng vẫn được lưu | Kiểm tra số phương án, đáp án đúng, key trùng, cấu hình true/false; áp dụng cả tạo, sửa và import |
| QA-05 | Learner thấy đáp án trước nộp từ chi tiết đề | Dùng bộ lọc chung loại grading hints ở chi tiết đề, ngân hàng câu hỏi, chi tiết và lịch sử lượt đang làm; staff và kết quả đã chấm giữ dữ liệu được phép |
| QA-06 | Server chấm lượt quá hạn | Kiểm expiresAt trước chấm và trong điều kiện ghi của transaction; nộp quá hạn trả 400 |
| QA-07 | Báo cáo trả passwordHash lồng trong learner | Chọn rõ trường được trả về của learner trong báo cáo/lượt thi; không lấy passwordHash; tác giả bài học cũng chỉ trả trường cần thiết |
| QA-08 | Certificate thiếu description gây 500 | Thêm DTO tạo/sửa chứng chỉ tương thích metadata null từ frontend; payload thiếu trường bắt buộc trả 400 |
| QA-09 | UUID sai ở chi tiết đề gây 500 | Validate UUID ở đường đọc cho viewer trước truy vấn; trả 400 |

## Thực thi lại

```powershell
pnpm --filter @techenglish/api test
pnpm --filter @techenglish/api test:certification
pnpm --filter @techenglish/api test:placement
pnpm --filter @techenglish/api test:agenda
pnpm --filter @techenglish/api test:learning-ai
pnpm --filter @techenglish/api test:bug-regressions
pnpm --filter web test
pnpm --filter mobile test
pnpm --filter @techenglish/shared-kernel test
```

Trong đợt này đã chạy trực tiếp toàn bộ 18 tệp `.spec.ts` bằng Node test runner để bao gồm mọi kiểm thử backend tìm thấy, cùng các tệp kiểm thử web, mobile và shared-kernel.

## Bằng chứng và phạm vi

Hồ sơ nằm trong `artifacts/chapter5`: `api-qa-before-fix.json`, `api-qa-results.json`, `additional-fix-paths.json`, `api-tests-after-fix.log`, `client-shared-tests-after-fix.log`, `typecheck-*-after-fix.log`, `build-api-after-fix.log`. File Word chương 5 đã cập nhật lịch sử lỗi, biện pháp và kết quả kiểm tra lại.

Môi trường QA dùng database riêng ở cổng 15433, API riêng ở 18080 và web ở 13000. Không áp dụng migration mới, không hợp nhất tài khoản cũ và không sửa dữ liệu ứng dụng hiện hữu. Việc khôi phục liên kết workspace trong node_modules là sửa môi trường Windows, không phải thay đổi dependency.

Số kiểm tra HTTP không tương đương số ca chức năng: 155 kiểm tra ban đầu liên quan 86 mã trong bộ 177 ca thiết kế. Chưa xác nhận mọi biến thể trên thiết bị Android/iOS native, các dịch vụ SMTP/OAuth/AI/push thật, kiểm thử tải hoặc phục hồi backup.
