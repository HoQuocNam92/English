# Đồng bộ mobile với bản web ngày 25 tháng 10 năm 2026

Mobile sử dụng cùng API và các quy tắc hiển thị của các màn hình học viên vừa được sửa trên web.

## API

Địa chỉ mặc định và địa chỉ của cả ba profile EAS là `https://api.techenglish.click/api/v1`. `.env.local` trên máy làm việc đã bỏ địa chỉ LAN cũ. Compose và tệp cấu hình mẫu cũng dùng server này; `MOBILE_LAN_HOST` chỉ phục vụ kết nối tới Metro.

Đã kiểm tra HTTPS tới endpoint chứng chỉ: server trả HTTP 401 khi chưa gửi thông tin xác thực. Kiểm tra này xác nhận kết nối, không xác nhận đăng nhập hay nội dung tài khoản.

## Các phần đã đồng bộ

| Phần | Mobile |
| --- | --- |
| Nội dung bài học | Nhãn tiếng Việt, hướng dẫn tại một vị trí, nguồn tham khảo mở được, cùng cách diễn giải và tên mục với web qua `lesson-presentation.ts`. |
| Chứng chỉ | Tìm cả tên chứng chỉ và tên bài kiểm tra; mở đúng bài tìm thấy; bỏ thanh tiến độ của thẻ chứng chỉ. |
| Lộ trình chứng chỉ | Giữ số bài đã học, số bài kiểm tra đã nộp, điểm trung bình và phần giải thích công thức dùng chung với web. |
| Bài luyện tập | Có trạng thái đã làm, kết quả gần nhất, giới hạn lượt làm và điều kiện bắt đầu do server trả về. |
| Bài học bắt buộc | Mở bài chưa hoàn thành đầu tiên; sau khi học có đường quay lại đúng bài kiểm tra. |
| Chủ đề | Ghi nhận bắt đầu học; chờ yêu cầu bắt đầu hoàn tất trước khi ghi hoàn thành; tải lại điều kiện làm bài sau khi hoàn thành và khi quay lại màn hình. |
| Mục tiêu | Hiển thị chứng chỉ đã chọn trước; mở rộng để đổi; giữ tên chứng chỉ đầy đủ. |
| Tiến độ | Chỉ liệt kê chứng chỉ đã bắt đầu học; trạng thái bài hoàn thành có nhãn xanh; tự làm mới khi ứng dụng hoạt động lại. |
| Kết quả | Dùng thang phần trăm như web; giữ chứng chỉ và chủ đề khi quay về từ kết quả. |
| Nhắc học | Nút Học ngay vẫn mở lộ trình khi ghi nhận đã đọc thất bại; nhấn thông báo hệ điều hành xử lý cả khi app đã mở và khi khởi động lại; chờ đăng nhập và điều hướng sẵn sàng. |
| Nút thao tác | Dùng chung kích thước, nhãn, vị trí icon và tên trợ năng; nhãn dài xuống dòng trong nút. |

## Kiểm chứng

- TypeScript cho mobile, web và shared kernel.
- Bộ kiểm tra hành vi mobile gồm cả tình huống mở bài từ tìm kiếm, học bài bắt buộc, mở khóa bài luyện tập và nhấn thông báo.
- Các bộ kiểm tra web và shared kernel.
- Xuất bundle Expo cho Android, iOS và React Native Web.
- Kiểm tra giao diện qua bản xuất React Native Web bằng dữ liệu mô phỏng. Cách này kiểm tra mã mobile và bố cục, không thay thế kiểm tra trên điện thoại thật.

Bundle xuất không phải APK hay IPA. Ứng dụng đã cài cần được build và cài lại để nhận thay đổi mã nguồn và địa chỉ API; bản development dùng Metro cần tải lại bundle.


## Hoàn thiện ngày 26 tháng 10

- Hồ sơ giữ thứ tự mục tiêu, trình độ, chuyên ngành, chứng chỉ và kế hoạch học như web. Các trường chỉ tiêu học hiển thị đủ chiều rộng trên màn hình hẹp.
- Sau khi hoàn thành kiến thức, phần luyện tập hướng dẫn bắt đầu làm bài thay vì tiếp tục yêu cầu học lại.
- Kết quả hiển thị điểm và ngưỡng đạt theo cùng thang phần trăm, bao gồm ngưỡng 70%. Khi mở kết quả không có tham số chứng chỉ, mobile lấy chứng chỉ từ dữ liệu lượt làm bài để quay về đúng nơi.
- Đã kiểm tra lưu chứng chỉ và ba chỉ tiêu học qua API bằng dữ liệu mô phỏng; kiểm tra giao diện ở cả 360 px và 390 px.
- Tổng cộng 47 kiểm tra mobile, web và shared kernel đều đạt; bundle Android và iOS xuất thành công với API server.
- Thông báo nhắc học cũ trỏ về trang chủ được chuyển sang lộ trình học; các đường dẫn trang chủ thông thường giữ nguyên hành vi.
- Nút bị khóa dùng chữ tối trên nền nhạt để đọc rõ trạng thái chưa đủ điều kiện.

## APK cài thử ngày 26 tháng 10

Đã build thành công APK Android `arm64-v8a` tại
`artifacts/mobile-parity/TechEnglish-mobile-2026-10-26-arm64.apk`.
Đã kiểm tra tính toàn vẹn ZIP, chữ ký APK v2 và bundle bên trong: dùng API server,
không chứa địa chỉ LAN cũ. Gói ứng dụng là `com.techenglish.pro`.

APK dùng debug keystore hiện có, dành cho cài thử. Kiểm tra giao diện mới nhất
ở cả 360 px và 390 px dùng dữ liệu mô phỏng; chưa kiểm tra trên điện thoại thật.

## Đối chiếu chức năng người học và bổ sung ngày 26 tháng 10

Các nhóm chức năng dưới đây có màn hình và luồng xử lý tương ứng trong mã mobile.
Màn hình native dùng bố cục phù hợp điện thoại và cùng API nghiệp vụ với web.

| Nhóm trên web | Luồng mobile |
| --- | --- |
| Đăng nhập, đăng ký | Đăng nhập email và Google; khôi phục phiên, làm mới token, đăng xuất. |
| Thiết lập người học | Mục tiêu, trình độ, chuyên ngành, chứng chỉ, nghề nghiệp, chỉ tiêu và giờ nhắc học. |
| Kiểm tra trình độ | Làm bài, xem kết quả và tạo kế hoạch theo mục tiêu. |
| Trang chủ | Mục tiêu đã chọn, gợi ý nội dung, việc học theo ngày/tuần/tháng/năm. |
| Lộ trình học | Bài học theo thứ tự, điều kiện mở nội dung, xác nhận chuyển cấp và kế hoạch tiếp nối. |
| Danh mục và bài học | Tìm, lọc loại bài; đọc hiểu, tình huống, thiết kế hệ thống và kiến thức chứng chỉ; nguồn tham khảo và ghi nhận hoàn thành. |
| Chứng chỉ | Tìm cả chứng chỉ và bài kiểm tra; chuyên ngành, tỷ trọng, chủ đề, tiến độ và bài chưa học tiếp theo. |
| Luyện tập chứng chỉ | Điều kiện học trước, lượt làm, làm lại, kết quả và quay về đúng chủ đề/chứng chỉ. |
| Làm bài kiểm tra | Bắt đầu hoặc tiếp tục lượt làm, thời gian, trả lời, nộp bài và xem kết quả. |
| Flashcard | Học từ mới, ôn đến hạn, phát âm, lật thẻ, đánh giá độ khó, từ đã biết và bài kiểm tra từ đã học. |
| Đề xuất từ vựng | Dùng `/vocab-study/recommendations`; giữ chuyên ngành và trình độ khi bắt đầu, chuyển sang ôn đến hạn nếu đã học hết. |
| Bộ từ đang học | Hiển thị số từ và số cần ôn; mở chi tiết hoặc ôn đúng `sourceLessonId`. |
| Chi tiết bộ từ | Thống kê đã nhớ/cần ôn/chưa học, tìm kiếm, số dòng/trang, trạng thái từ, ví dụ, phát âm, xem lại thẻ và kiểm tra đúng bộ. |
| Hoạt động ôn tập | 7 ngày gần nhất, tháng này, năm nay và khoảng ngày tùy chọn; tối đa 366 ngày, không chọn tương lai; dùng chung cách tính ngày Việt Nam với web. |
| Lịch sử từ vựng | Lọc thời gian, độ khó, phân trang và mở lại flashcard đã học. |
| Tiến độ | Tổng tích lũy, kết quả cấp hiện tại, chứng chỉ đã bắt đầu, bài gần đây và kết quả luyện tập; làm mới khi quay lại app. |
| Hồ sơ | Thông tin cá nhân, ảnh đại diện, mục tiêu, chỉ tiêu học, nhắc học, đổi mật khẩu và lịch sử bài học. |
| Thông báo | Chuông có số chưa đọc, lịch sử theo tài khoản, đọc từng mục/đọc tất cả, giữ tối đa 100 mục trên thiết bị, mở đúng nội dung khi nhấn. |
| Đường dẫn cũ | Trang chủ, phòng đọc và thực hành tình huống được chuyển tới màn hình native tương ứng. |

Lịch sử thông báo ghi nhận cả nhắc học từ server, thông báo nhận lúc đang mở app và
thông báo được nhấn khi khởi động lại. Dữ liệu lưu riêng theo tài khoản bằng
AsyncStorage; thông báo đến lúc đang tải lịch sử hoặc đọc tất cả không bị mất.
Hai mặt flashcard ẩn/hiện theo đúng trạng thái lật, gồm cả phần trợ năng.

Kiểm tra tự động: 53 bài kiểm tra đạt; TypeScript mobile, web và shared kernel đạt;
bundle Android/iOS xuất thành công. Kiểm tra giao diện bằng API mô phỏng bao gồm
lưu/đọc thông báo, đổi tài khoản, khoảng ngày hợp lệ/không hợp lệ, lỗi tải và thử lại,
đề xuất theo chuyên ngành/trình độ, ôn theo bộ từ, thống kê bộ từ và lật flashcard.
Đăng nhập Google, nhận push thực tế và các thao tác trên điện thoại thật vẫn cần
được xác minh bằng tài khoản và thiết bị thật.
