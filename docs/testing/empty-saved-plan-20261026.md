# Phản hồi lộ trình chưa được tạo

## Nguyên nhân

`PlacementService.latest` trả `null` khi học viên chưa có kết quả kiểm tra hoặc kế hoạch đã lưu. NestJS mặc định chuyển giá trị trả về này thành HTTP 200 không có body. Client gọi `Response.json()` và phát sinh `Unexpected end of JSON input`.

## Sửa đổi

- Controller dùng JSON response rõ ràng, trả body `null` cho trường hợp chưa có lộ trình. Không đổi dữ liệu hoặc hợp đồng của kết quả đã lưu.
- Web và mobile chấp nhận body rỗng cũ chỉ cho GET `/placement-test/result`. Response rỗng hoặc JSON lỗi ở endpoint khác vẫn báo lỗi dữ liệu, không giả thành trạng thái chưa có dữ liệu.
- Trang web tách trường hợp chưa tạo kế hoạch khỏi tải dữ liệu thất bại; lỗi có nút thử lại. Chưa có kế hoạch thì nút ghi Tạo lộ trình theo mục tiêu. Sau khi tạo, hiển thị ngay kết quả POST mà không phụ thuộc lần GET thứ hai.
- Giữ nguyên lộ trình cốt lõi và điều kiện chuyển cấp; không tạo lộ trình hoặc đổi cấp khi chỉ mở trang.

## Kiểm tra

- Kiểm thử HTTP NestJS thực với dịch vụ giả, gồm JSON null và kết quả đã lưu: đạt.
- Kiểm thử API client web và mobile với phản hồi rỗng cũ, JSON null, JSON bị lỗi và HTTP 204: đạt.
- Kiểm thử giao diện tạo kế hoạch lần đầu và phân biệt lỗi mạng với chưa có kế hoạch: đạt.
- Tổng bộ web 18, mobile 26 và placement 9 kiểm thử: đạt.
- TypeScript API, web và mobile đạt; build API và web đạt.

Không cần migration hoặc chỉnh dữ liệu học viên.
