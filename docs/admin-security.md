# Bảo vệ khu vực quản trị

Admin và giảng viên phải xác thực bằng ứng dụng TOTP trước khi dùng API quản trị. Đăng nhập mật khẩu hoặc Google chỉ tạo phiên chưa qua MFA. Giao diện yêu cầu thiết lập ở lần đầu, rồi nhập mã xác thực ở mỗi phiên đăng nhập mới. Một lần xác thực có hiệu lực tối đa 8 giờ; làm mới access token không kéo dài khoảng này. Phiên cũ trước bản nâng cấp cần đăng nhập lại.

## Thiết lập và khôi phục

1. Trong Google Authenticator hoặc Microsoft Authenticator, thêm tài khoản bằng khóa thiết lập và chọn mã dựa trên thời gian. Có thể mở liên kết ứng dụng khi dùng cùng thiết bị.
2. Nhập mã 6 số để xác nhận thiết lập. Khóa chờ xác nhận hết hạn sau 10 phút.
3. Lưu 10 mã khôi phục ở nơi riêng tư. Mỗi mã dùng một lần; máy chủ chỉ lưu mã băm và không cung cấp chức năng xem lại mã gốc.
4. Khi mất điện thoại, đăng nhập bằng mật khẩu/Google, chọn **Dùng mã khôi phục để thay ứng dụng xác thực đã mất**, rồi nhập một mã khôi phục chưa dùng. Thiết lập ứng dụng mới trước khi vào quản trị. Chỉ cần một mã, kể cả mã cuối cùng. Thao tác này hủy bộ mã cũ và quyền MFA của mọi thiết bị. Nếu vẫn còn ứng dụng, có thể đổi chủ động tại **Bảo mật MFA** bằng một mã mới.

Mã TOTP đã dùng không được sử dụng lại. Sau 5 lần nhập sai, tài khoản tạm dừng xác thực MFA trong 5 phút; yêu cầu lấy khóa thiết lập không xóa giới hạn này. Đồng hồ điện thoại và máy chủ cần đồng bộ.

Khóa TOTP được mã hóa AES-256-GCM. `MFA_ENCRYPTION_KEY` là biến môi trường chỉ ở máy chủ; nếu bỏ trống, ứng dụng dùng HKDF tạo khóa riêng từ `JWT_SECRET`. Phải giữ ổn định nguồn khóa đã chọn và sao lưu an toàn cùng dữ liệu. Không đặt khóa này vào biến `NEXT_PUBLIC_*`. Không xoay nguồn khóa sau khi có người thiết lập mà chưa chuẩn bị quy trình di chuyển khóa. Nếu mất cả ứng dụng và mọi mã dự phòng, cần người vận hành xác minh danh tính và phục hồi MFA; không có API công khai bỏ qua MFA.

## Nhật ký thao tác

Admin xem **Quản trị hệ thống → Nhật ký thao tác** (`/admin/audit-logs`). Có tìm kiếm theo email/đường dẫn, lọc kết quả và phân trang. Ghi nhận thay đổi dữ liệu của người dùng đã xác thực, các sự kiện đăng nhập/đăng ký/MFA/đăng xuất và việc xem nhật ký. Bản ghi gồm thời điểm, danh tính đã xác thực, phương thức/đường dẫn, UUID đối tượng, trạng thái mới khi đổi trạng thái, kết quả HTTP và IP kết nối trực tiếp. Email đăng nhập chưa xác thực không được dùng làm danh tính tác giả.

Không ghi nội dung yêu cầu/phản hồi, mật khẩu, token, khóa TOTP hay mã khôi phục. IP là địa chỉ kết nối tới API, có thể là reverse proxy; ứng dụng không tin `X-Forwarded-For` do khách tự gửi. API không có thao tác sửa/xóa nhật ký. Đây là lịch sử từ khi triển khai, không tái dựng các thao tác trước đó; không ghi mọi lượt đọc nội dung học tập.

Bản nâng cấp nghiệp vụ ghi thành công trong transaction; thất bại trước handler được ghi riêng và báo lỗi vận hành nếu mất kết nối. Có trigger append-only, cảnh báo, permission audit:read và công cụ archive theo chính sách. Xem báo cáo [nâng cấp audit](business-audit-upgrade.md) để biết giới hạn, lưu giữ, deploy và rollback.

## Phân quyền và triển khai

Giao diện ẩn nút tự gỡ vai trò/tự khóa/tự xóa. API tiếp tục từ chối các thao tác đó, cấm tự giới hạn thời hạn vai trò, cấm thay thế ngầm vai trò admin và bảo vệ admin hoạt động cuối cùng. Admin hoặc nhân sự có permission audit:read được đọc audit logs; quyền quản lý nội dung không tự cho phép đọc audit.

Migration `20261104090000_admin_security` có trong cả lịch sử Prisma cũ và lịch sử Docker cho cài đặt mới. Chạy luồng `node docker/migrate.cjs` như triển khai hiện tại, trước khi khởi động API mới. Kiểm thử PostgreSQL: đặt `ADMIN_SECURITY_QA=1` và `DATABASE_URL` trỏ tới database QA riêng, chạy `node --test -r ts-node/register src/application/auth/admin-security.integration.spec.ts` từ `apps/api`. Kiểm thử tạo và dọn dữ liệu của chính nó; không dùng database production để QA.

TOTP tuân theo [RFC 6238](https://www.rfc-editor.org/rfc/rfc6238): SHA-1, chu kỳ 30 giây, 6 chữ số, dung sai một chu kỳ hai phía. Bộ kiểm thử kiểm tra các vector SHA-1 của RFC và việc chống dùng lại mã.
