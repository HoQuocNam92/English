# Kiểm thử toàn hệ thống

- [Bộ 177 test case](SYSTEM_TEST_CASES.md): điều kiện, bước chạy và kết quả mong đợi.
- [CSV test case](system-test-cases.csv): UTF-8 BOM, mở bằng Excel; dấu phân cách comma.
- [Mẫu kết quả thực thi](execution-results.csv): một dòng cho mỗi case × nền tảng × biến thể dữ liệu; không ghi đè lịch sử các lần chạy.
- [Inventory API và màn hình](SYSTEM_INVENTORY.md): danh sách route từ mã nguồn tại thời điểm lập.

Trạng thái hợp lệ: Chưa chạy, Pass, Fail, Blocked, N/A. N/A phải có lý do phạm vi; Blocked phải có nguyên nhân và người xử lý. Các file này là thiết kế kiểm thử, chưa chứng minh ca nào đã chạy thành công.
