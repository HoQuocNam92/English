# Đối chiếu báo cáo lỗi giao diện ngày 10 tháng 10 năm 2026

Đã đối chiếu 16 mục trong báo cáo với mã nguồn hiện tại. Những trang đã được thay thế được kiểm tra theo luồng đang sử dụng; không khôi phục dữ liệu mẫu hoặc giao diện tĩnh cũ.

| Mã | Kết quả đối chiếu và xử lý |
| --- | --- |
| LAYOUT-01 | Dashboard hiện có 4 thẻ thống kê, lưới 1/2/4 cột; không còn trường hợp thẻ thứ 5 đứng riêng. Giữ bố cục hiện tại. |
| LAYOUT-02 | Sửa Catalog thành flex dọc toàn chiều cao, đưa liên kết hành động xuống đáy. Kiểm tra căn hàng ở chiều rộng 768px. |
| LAYOUT-03 | Chứng chỉ hiện lấy dữ liệu API và dùng cùng mẫu thẻ trắng, viền chuẩn. Không còn thẻ Google Cloud tô tím cố định. |
| LAYOUT-04 | Bảng bài học hiện có 8 cột; hàng tải và hàng rỗng đã dùng colSpan=8. Không còn skeleton 6 ô. |
| LAYOUT-05 | Luồng thi hiện tại ở /learn/quiz/[id] đã có state, chọn đáp án, chuyển câu và nộp bài. Tăng nút số câu lên ít nhất 44x44px, lưới tự điều chỉnh số cột, thêm nhãn và trạng thái truy cập. Đường dẫn scenario cũ chuyển đến danh sách case study, không ánh xạ ID cũ sang bài học không được xác minh. |
| LAYOUT-06 | Đổi cả 3 nhóm trường cấu hình đề thi thành 1 cột trên điện thoại, 2 cột từ breakpoint sm. |
| LAYOUT-07 | Onboarding hiện dùng lưới 1 cột trên điện thoại và mở rộng từ md. Không còn lưới 3 cột cố định gây tràn. |
| CSS-01 | Bỏ quy tắc border-color: transparent áp lên các container Admin. Giữ hiệu ứng bóng hiện có. |
| CRIT-01 | Thêm Hero hiển thị với lời giới thiệu và nút đăng ký/tìm hiểu. Các mảng nội dung giới thiệu và lộ trình hiện có đã chứa dữ liệu. Đồng bộ chuyển hướng trang chủ theo danh sách vai trò. |
| VISUAL-01 | Chuyển ảnh đăng ký vào luồng flex bên dưới văn bản. Kiểm tra khối ảnh nằm dưới tiêu đề ở 1366x768. |
| A11Y-01 | Trang reading-lab cũ không còn; không tìm thấy chữ text-secondary trên nền bg-ai-accent trong giao diện hiện tại. Thêm chuyển hướng reading-lab đến bài đọc kỹ thuật. |
| DATA-01 | Chi tiết học viên đã nhận ID và gọi /users/:id, /progress/learners/:id. Báo cáo gọi /reports/domain/:id. Thanh tiến độ học viên đã gán width từ dữ liệu. Không đổi sang dữ liệu mẫu. |
| NAV-01 | RouteGuard chọn trang chủ theo vai trò: admin/teacher vào Admin; learner về /learn. Thêm kiểm thử hồi quy và kiểm tra chuyển hướng trên trình duyệt. |
| NAV-02 | LearnerShell không còn liên kết community; Footer không còn liên kết admin-login; terms và privacy đã có trang thật. Bổ sung chuyển hướng tương thích /admin-login và /learn/dashboard. |
| BTN-01 | Forgot password đã dùng nền bg-primary và chỉ giảm độ đậm khi disabled. Các thao tác xóa ở roles, learning-content và lessons đã dùng ActionButton chung. Thêm variant danger tương thích với destructive hiện có. |
| TONE-01 | Đổi tiêu đề, tab và các nhãn chính trên trang vai trò sang thuật ngữ quản trị: vai trò người dùng, danh mục quyền hạn, chỉnh sửa/thêm quyền hạn. |

## Kiểm tra

- Kiểm tra TypeScript web: đạt.
- Kiểm thử hồi quy hiện có và trường hợp chuyển hướng theo vai trò: đạt.
- Bản dựng Next.js production: đạt, bao gồm các đường dẫn chuyển hướng bổ sung.
- Kiểm tra trình duyệt với dữ liệu API và phiên đăng nhập giả lập: không tràn ngang ở 375px cho landing, register, chính sách, Catalog, Quiz và form soạn đề; Catalog căn đáy ở 768px; ảnh đăng ký không chồng tiêu đề ở 1366x768.
- Chuyển hướng learner từ Admin về /learn, chọn câu hỏi, giữ đáp án khi chuyển câu và cảnh báo nộp bài còn thiếu câu: đạt với dữ liệu giả lập.
- Không thực hiện gửi bài thi, đăng ký tài khoản hoặc thay đổi dữ liệu trên backend thật. Ảnh bên ngoài bị chặn trong kiểm tra trình duyệt; chỉ xác minh kích thước và vị trí khối ảnh đăng ký.

## Rà soát mở rộng toàn dự án

- Quét 62 đường dẫn web ở 375px và 1366px (124 tổ hợp), 36 đường dẫn mobile qua bản web ở 360px và 768px (72 tổ hợp). Bao gồm trang công khai, quản trị, học viên và các mẫu bài học. Dùng phiên, danh tính và dữ liệu API giả lập; các API chưa có fixture được kiểm tra ở trạng thái rỗng/lỗi. Đây không phải xác nhận đầy đủ nghiệp vụ với tài khoản thật.
- Sửa tiêu đề dùng chung để xuống dòng trên màn hình nhỏ; chuẩn hóa nhãn tiếng Việt ở báo cáo, vai trò và tiến độ mobile; không hiển thị ngày hoạt động giả khi chưa có dữ liệu.
- Tăng độ tương phản chữ ở flashcard, lỗi biểu mẫu, thống kê, nút hành động quản trị, trạng thái tiến độ, nhãn bài học và yêu cầu mật khẩu. Giữ màu viền riêng với màu biểu tượng để các nút/radio dễ nhận biết.
- Sửa ô nhập mobile để co giãn trong hàng, giữ nút ẩn/hiện mật khẩu trong khung và bổ sung nhãn truy cập. Sơ đồ kiến trúc chuyển sang cột dọc dưới 480px.
- Quét lại 32 tổ hợp web tập trung vào các trang đã sửa: không ghi nhận lỗi JavaScript, tràn ngang hoặc cảnh báo tương phản chữ. Kiểm tra lại các màn hình mobile đã sửa: không ghi nhận lỗi JavaScript hay tràn ngang; cảnh báo đo màu emoji và biểu tượng được xem xét riêng, không coi màu chữ đơn sắc là màu emoji thực tế.

## Dựng và kiểm thử mở rộng

- Backend NestJS: build đạt; chạy khởi tạo dịch vụ và kết nối PostgreSQL đạt. Bộ kiểm thử hồi quy backend đã chạy thành công. Không thay đổi dữ liệu thật; Firebase chưa được cấu hình trong môi trường này.
- Frontend Next.js: kiểm tra TypeScript, kiểm thử hồi quy và production build đạt.
- Mobile: kiểm tra TypeScript và kiểm thử hồi quy đạt; xuất bundle Android, iOS, web đạt. Android assembleRelease đạt và được chạy lại sau chỉnh sửa cuối để cập nhật APK.
- APK Android tại `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` dùng cấu hình ký debug hiện có, phục vụ kiểm thử. Bundle iOS không phải IPA. Môi trường không có thiết bị Android/emulator đang kết nối hoặc công cụ ký/build iOS, nên chưa kiểm tra trên thiết bị native.
- Kiểm duyệt tự động đã từ chối tạo phiên JWT từ tài khoản trong cơ sở dữ liệu vì rủi ro truy cập tài khoản thật; toàn bộ kiểm tra giao diện có đăng nhập sau đó dùng dữ liệu và phiên giả lập.
