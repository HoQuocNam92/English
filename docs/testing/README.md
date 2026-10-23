# Kiểm thử toàn hệ thống

## Kết quả đã thực thi

- [Đợt sửa lỗi ngày 21/10/2026](bug-document-2026-10-21.md).
- [Đợt Docker và sửa lỗi ngày 23/10/2026](bug-document-2026-10-23.md): kết quả trước/sau sửa, quy tắc Gmail, import câu hỏi, onboarding và phần chưa xác nhận.

Ngày 23/10: toàn bộ API spec đạt 160/160, web/mobile/shared đạt 29/29; 304/304 kiểm tra HTTP/workflow và 8/8 kiểm tra Gmail đạt. Các kiểm tra sửa dữ liệu chạy trên database QA riêng. Kết quả API không thay thế kiểm thử giao diện hoặc thiết bị thật.

## Bộ thiết kế kiểm thử ban đầu

- [Bộ 177 test case](SYSTEM_TEST_CASES.md): điều kiện, bước chạy và kết quả mong đợi.
- [CSV test case](system-test-cases.csv): UTF-8 BOM, mở bằng Excel; dấu phân cách comma.
- [Mẫu kết quả thực thi](execution-results.csv): một dòng cho mỗi case × nền tảng × biến thể dữ liệu; không ghi đè lịch sử các lần chạy.
- [Inventory API và màn hình](SYSTEM_INVENTORY.md): danh sách route từ mã nguồn tại thời điểm lập.

Trạng thái hợp lệ: Chưa chạy, Pass, Fail, Blocked, N/A. N/A phải có lý do phạm vi; Blocked phải có nguyên nhân và người xử lý. Các file này là thiết kế kiểm thử, chưa chứng minh ca nào đã chạy thành công.
