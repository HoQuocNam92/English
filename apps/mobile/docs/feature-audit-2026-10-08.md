# Rà soát chức năng mobile — 08/10/2026

Đối chiếu màn hình học viên web, các route mobile, menu điều hướng và bảng 57 luồng học viên. Phạm vi APK học viên; các màn hình quản trị/giảng viên của web không thuộc bản mobile hiện tại.

## Đã bổ sung và sửa

- Thay tab chỉ hiện danh sách bài học bằng mục **Học tập**, có 16 lối vào chia theo học/luyện tập, chuyên đề, lộ trình/mục tiêu và tiến độ/lịch sử. Bài học vẫn mở ở `/lessons`.
- Thêm tìm chức năng, hỗ trợ tiếng Việt có dấu và không dấu.
- Đưa tổng quan từ vựng, khám phá từ, chứng chỉ, danh mục, năm chuyên đề CNTT, lộ trình, đánh giá đầu vào, mục tiêu/nhắc học và các màn hình lịch sử vào menu dễ tìm.
- Sửa chuyển đổi liên kết web: tổng quan flashcards mở dashboard; history không bị hiểu thành ID bài học; tab lịch sử hồ sơ mở đúng lịch sử; giữ query khi mở lộ trình, hồ sơ và trang chủ.
- Người chưa có lộ trình vẫn thấy hành động tạo lộ trình; hỗ trợ phản hồi không có kết quả (null hoặc 404). Lỗi tạo lộ trình hiện trong màn hình, không thay mất nút thử lại.
- Màn hình mở đầu dùng logo hiện tại, có nút đăng ký trực tiếp và đưa người có phiên đã lưu về trang chủ.
- Khôi phục phiên có xử lý lỗi bộ nhớ và dữ liệu người dùng không hợp lệ, tránh trạng thái tải vô hạn.
- Giữ nút Google trên đăng nhập/đăng ký và cơ chế tránh khởi tạo OAuth trình duyệt trên native.

## Kiểm chứng

- TypeScript: qua.
- 6 kiểm tra tự động: qua; gồm Google/native, điều hướng và bộ lọc, đích của toàn bộ menu, tạo lộ trình khi chưa có kết quả và thử lại sau lỗi, thời gian chờ API, mục tiêu học tập.
- Build Android release: thành công.
- Cài chính APK này lên Pixel 7 Pro giả lập, Android 14 x86_64.
- Mở menu Học tập: thấy các nhóm chức năng và thanh tab.
- Bấm Danh mục học tập: mở đúng màn hình.
- Tìm `lich su`: tìm thấy lịch sử từ vựng và lịch sử học/bài thi.
- Bấm Từ đã học: mở đúng màn hình cùng bộ lọc thời gian và độ khó.
- Tiến trình app vẫn chạy, không có crash trong các thao tác thử.

## Cấu hình build sau khi chuyển thư mục

- Dùng `nodeLinker: hoisted` để giữ đường dẫn thư viện native ngắn khi build Android trên Windows.
- Workspace gốc ghim React và React DOM 19.1.1 giống frontend để Next và frontend dùng cùng một bản React. Mobile vẫn dùng React 19.2.3 trong dependencies riêng, đúng phiên bản của Expo.
- Khi chuyển thư mục, cài lại thư viện bằng `pnpm install --frozen-lockfile`; không dùng lại các đường dẫn trong thư mục `node_modules` đã sao chép.
- Tạo Prisma client bằng `pnpm --filter @techenglish/api db:generate` trước khi build backend.
- Backend và frontend production build đã thành công; kiểm tra kiểu dữ liệu, test backend, web, mobile, lộ trình, chứng chỉ và shared-kernel đã qua.
- APK, log kiểm tra, cấu hình SDK cục bộ và khóa ký riêng không đưa vào Git.
- Docker dùng đúng pnpm 12.8.1 và đường dẫn CLI Next/Expo trong thư mục thư viện gốc. Frontend production khởi động thành công; `/login` và `/learn` trả HTTP 200, đường dẫn không tồn tại trả HTTP 404. Chưa kiểm chứng build image Docker vì Docker daemon trên máy hiện tại chưa sẵn sàng.

## Giới hạn kiểm thử sản xuất

Google Sign-In thật vẫn thiếu Google Web OAuth Client ID trong cấu hình hiện có; không thay bằng ID giả. Lần kiểm tra API trước nhận HTTP 530/1033. Chưa xác nhận đăng nhập thành công, dữ liệu cá nhân, tạo kế hoạch AI và các luồng thi/học trọn vẹn với dữ liệu máy chủ sản xuất. Các bài kiểm tra tạo lộ trình dùng phản hồi API mô phỏng, không phải kết quả sản xuất.

Mục tiêu của lần sửa này là khôi phục khả năng tìm và truy cập các chức năng học viên, đồng thời sửa các lỗi điều hướng và phiên; không khẳng định mọi luồng sản xuất đã kiểm thử hoàn toàn.
