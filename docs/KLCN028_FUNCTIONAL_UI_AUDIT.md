# Biên bản rà soát chức năng và giao diện KLCN028

Nguồn đối chiếu: `docs/thesis/KLCN028_Huong ung dung_HuynhThiCamDung.docx`.

## 1. Phạm vi đã kiểm tra

- Website quản trị/giảng viên: dashboard, người dùng, phân quyền, nội dung học tập, bài học, cấp độ, chứng chỉ, ngân hàng câu hỏi, bài thi, hồ sơ học viên, kết quả, tiến độ, báo cáo và tìm kiếm.
- Website người học: trang chủ học tập, danh mục, chứng chỉ, flashcard, luyện tập, hồ sơ, tiến độ, onboarding và placement test.
- Ứng dụng mobile: đăng nhập/đăng ký/quên mật khẩu; onboarding mục tiêu, lĩnh vực, trình độ, chứng chỉ và kế hoạch; học tập, luyện tập, hồ sơ, tiến độ, bài học, quiz và kết quả.
- API và dữ liệu: tài khoản/phân quyền, hồ sơ học viên, taxonomy, bài học, từ vựng, câu hỏi, bài thi, tiến độ, nhóm học viên, gợi ý cá nhân hóa và thông báo.

## 2. Đối chiếu yêu cầu trong Word

| Nhóm yêu cầu | Kết quả rà soát | Vị trí chức năng |
|---|---|---|
| Đăng nhập, đăng xuất, đổi mật khẩu, phân quyền | Đã có | Web admin/learner, mobile, API auth/roles |
| Quản lý tài khoản học viên, giảng viên, admin | Đã có | `/admin/users`, `/admin/roles` |
| Hồ sơ, trình độ, lĩnh vực, mục tiêu nghề nghiệp/chứng chỉ | Đã có | `/admin/students`, `/learn/profile`, onboarding, mobile profile/onboarding |
| Từ vựng/thuật ngữ theo lĩnh vực, CRUD và tìm kiếm | Đã có | `/admin/learning-content`, flashcard/catalog |
| Bài đọc kỹ thuật, tài liệu API/system design, tình huống thực tế | Đã có mô hình và màn quản lý | `/admin/lessons`, catalog/lessons mobile |
| Bài học theo Beginner/Intermediate/Advanced/Professional | Đã có | `/admin/levels`, bộ lọc nội dung/bài học |
| Ôn tập theo chủ đề và chứng chỉ | Đã có | Chứng chỉ, bài học, quiz/bài thi |
| Ngân hàng câu hỏi theo loại/chủ đề/lĩnh vực/cấp độ/chứng chỉ | Đã có | `/admin/questions` và editor/import |
| Tạo bài thi theo chủ đề/chứng chỉ, trắc nghiệm/tình huống, chấm tự động | Đã có | `/admin/tests`, builder, quiz/result |
| Theo dõi tiến độ từng học viên và từng mục tiêu chứng chỉ | Đã có | `/admin/progress`, learner/mobile progress |
| Nhóm học viên theo mục tiêu nghề nghiệp | Đã có | `/admin/learner-groups` |
| Kết quả thi, thời gian làm/nộp, chủ đề, xuất Excel | Đã có | `/admin/test-results` |
| Thống kê lĩnh vực quan tâm, chứng chỉ, tiến độ, top hoàn thành, xuất Excel | Đã có | `/admin/reports` |
| Nhắc nhở người học/thông báo đẩy | Đã có mã chức năng | API notifications/reminders và cấu hình Firebase |
| Gợi ý lộ trình/nội dung cá nhân hóa bằng AI | Đã có | Recommendation service/provider và giao diện người học |

## 3. Các lỗi UI đã sửa trong đợt rà soát

- Sửa trang báo cáo bị tràn ngang ở desktop và màn hình hẹp.
- Sửa popup đổi mật khẩu bị cắt bởi phần đầu trang; bổ sung thao tác đổi mật khẩu cho admin/giảng viên.
- Chuẩn hóa nội dung popup xóa tài khoản người dùng.
- Sửa hiển thị lần đăng nhập cuối theo thứ tự ngày rồi giờ.
- In đậm từ khóa xuất hiện trong ví dụ từ vựng.
- Chuyển từ loại và lĩnh vực sang danh mục lựa chọn trong màn chỉnh sửa từ vựng.
- Sửa liên kết đăng nhập ở footer và liên kết flashcard không hợp lệ.
- Việt hóa nhãn còn sót và sửa nhãn xem kết quả học tập.
- Giữ nguyên font và ngôn ngữ thiết kế hiện có; không áp thay đổi CSS toàn cục gây lệch giao diện.

## 4. Xác minh kỹ thuật

- Web typecheck: đạt.
- Mobile typecheck: đạt.
- API build: đạt sau khi sinh lại Prisma Client.
- Web production build: đạt, sinh thành công 38 trang tĩnh cùng các trang động.
- Kiểm tra trực quan responsive: các trang admin, learner, auth và popup chính đã được duyệt ở desktop và màn hình hẹp.

## 5. Phần cần kiểm thử trên môi trường thật

- Việc gửi push notification cần Firebase hợp lệ và thiết bị thật để xác nhận nhận thông báo đầu cuối.
- Luồng mobile native nên được chạy acceptance test trên Android/iOS thật trước khi nghiệm thu chính thức.
- Nội dung học liệu/đề thi thực tế vẫn phụ thuộc dữ liệu do quản trị viên nhập; hệ thống đã có chức năng quản lý tương ứng.
