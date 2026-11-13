# Quản trị gốc

Vai trò hệ thống `SUPER_ADMIN` được gán cho tài khoản khởi tạo có email
`hoquocnam43@gmail.com`. Có thể cấu hình email khởi tạo bằng `INITIAL_ADMIN_EMAIL`
trong môi trường chạy seed/migrate. Việc cấp quyền dùng ID tài khoản đã được tìm
trong database, không tin email hoặc vai trò được gửi từ frontend.

Trên database đang sử dụng, tài khoản phải tồn tại và đang hoạt động. Script
`apps/api/prisma/seed-super-admin.cjs` không tạo tài khoản, không đổi mật khẩu,
không tự khôi phục tài khoản đã xóa hoặc bị khóa. Nếu database có người dùng mà
không tìm thấy email khởi tạo, migrate dừng thay vì cấp quyền cho người khác.
Database trống được cấp quyền sau khi seed tạo tài khoản khởi tạo.

`docker/migrate.cjs` chạy bước cấp quyền này trước khi khởi động bản API mới.
Lệnh có thể chạy lại an toàn và bảo đảm vai trò gốc không hết hạn.

Admin thường không thể cấp/gỡ `SUPER_ADMIN`, sửa hoặc tắt vai trò này, thay đổi
quyền của nó, sửa/khóa/xóa/khôi phục tài khoản đang giữ vai trò này, hoặc gỡ
bất kỳ vai trò nào của tài khoản đó. Định nghĩa quyền hệ thống chỉ được sửa/xóa
bởi Super Admin để tránh tác động gián tiếp qua các quyền dùng chung.

Super Admin phải xác thực MFA như admin. Tài khoản giữ thêm vai trò `admin`
để tương thích các chức năng quản trị hiện có. Không được gỡ vai trò nền tảng
`admin`, tự gỡ quyền, hoặc gỡ Super Admin hoạt động cuối cùng. Kiểm tra cấp/gỡ
quyền được thực hiện lại trong transaction Serializable từ dữ liệu hiện tại.

Sau khi được cấp quyền, đăng xuất rồi đăng nhập lại để giao diện nhận danh sách
vai trò mới. API đọc vai trò trực tiếp từ database ở mỗi request và vẫn chặn
admin thường dù frontend giữ token hoặc danh sách vai trò cũ.
