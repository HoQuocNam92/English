# Bộ test case toàn hệ thống TechEnglish

Ngày lập: 2026-09-30. Tổng: **177 test case thiết kế** trong 17 nhóm. Tất cả **Chưa chạy**. Đây là bộ kiểm thử thủ công/API và đặc tả cho tự động hóa, không phải bộ test executable hay bằng chứng hệ thống đã đạt chất lượng.

Mỗi case có nhiều bộ dữ liệu hoặc nền tảng phải chạy thành các lượt riêng. Chỉ Pass khi mọi lượt bắt buộc đều Pass. Expected mô tả điều kiện nghiệm thu; code đang có lỗi không được dùng để đổi expected cho dễ Pass. Các chính sách chưa xác định phải ghi Blocked/Gap và chốt trước khi kết luận.

## Quy ước và môi trường

- P0: chặn phát hành khi lỗi đăng nhập, phân quyền, ghi dữ liệu hoặc chấm điểm. P1: chức năng/biên/UI/khả năng phục hồi cần hoàn tất trước nghiệm thu.
- API: dùng base URL thực tế từ cấu hình, kể cả prefix toàn cục; đường dẫn trong inventory là controller-relative. Không dùng tài khoản hoặc dữ liệu production.
- ADMIN: quyền quản trị cần thiết; TEACHER: quyền lấy từ role thực tế; L1/L2: hai learner khác nhau; LNEW: learner chưa onboarding. Role QA tạo riêng để kiểm từng quyền, không mặc định mọi teacher có cùng quyền.
- D1/D2: hai domain; C1/C2: hai certificate; T1: topic của C1; V1: từ vựng; E1: exam published thuộc C1; Q1: câu hỏi. Dùng UUID thật từ fixture sau khi tạo, không dùng chuỗi ký hiệu làm ID API.
- Chuẩn bị content published/draft/archived, danh sách ít nhất 35 dòng để phân trang; 4 câu bằng điểm với đáp án biết trước; đề hai câu trọng số 1 và 3; đề giới hạn một lượt; dữ liệu sát ranh giới ngày/tuần.
- OAuth, email, lưu ảnh, AI và push cần cấu hình sandbox hoặc mock kiểm soát được. Push native cần thiết bị/build hỗ trợ; không đánh Fail chức năng push chỉ vì Expo Go không hỗ trợ.
- Reset fixture trước mỗi case ghi dữ liệu; case race dùng learner/exam riêng. Chỉ dọn dữ liệu mang prefix QA sau khi đã lưu bằng chứng. Test migration/restore chỉ dùng DB riêng.
- Ghi commit, thời điểm, OS/browser/device, timezone, API URL không chứa secret và fixture ID cho mỗi đợt chạy. Timestamp server và timezone nghiệp vụ phải được thống nhất.

## Ma trận phạm vi

| Nhóm | Số case | Nguồn đối chiếu chính |
|---|---:|---|
| AUTH — Đăng nhập và phiên | 16 | `apps/api/src/presentation/auth.controller.ts` |
| RBAC — Vai trò và phân quyền | 10 | `apps/api/src/presentation/role.controller.ts` |
| USER — Người dùng và nhóm học viên | 10 | `apps/api/src/presentation/user.controller.ts; apps/api/src/presentation/learner-group.controller.ts` |
| PROFILE — Onboarding và hồ sơ học tập | 15 | `apps/api/src/presentation/learner-profile.controller.ts; apps/mobile/app/profile/edit.tsx` |
| PLACE — Kiểm tra trình độ | 6 | `apps/api/src/presentation/placement-test.controller.ts` |
| TAX — Danh mục và chứng chỉ | 9 | `apps/api/src/presentation/taxonomy.controller.ts` |
| LESSON — Quản lý và học bài | 10 | `apps/api/src/presentation/lesson.controller.ts; apps/mobile/src/features/lessons/LessonExperience.tsx` |
| VOC — Từ vựng và ôn tập | 12 | `apps/api/src/presentation/vocabulary.controller.ts; apps/api/src/presentation/vocab-study.controller.ts` |
| QUESTION — Ngân hàng và import câu hỏi | 11 | `apps/api/src/presentation/question.controller.ts; apps/web/src/features/questions/question-excel.ts` |
| EXAM — Soạn đề và làm bài | 20 | `apps/api/src/presentation/exam.controller.ts; apps/api/src/application/exam/exam.service.ts` |
| PROGRESS — Tiến độ, dashboard và gợi ý | 12 | `apps/api/src/presentation/progress.controller.ts; apps/api/src/presentation/recommendation.controller.ts` |
| REPORT — Quản trị kết quả và báo cáo | 8 | `apps/api/src/presentation/taxonomy.controller.ts; apps/web/app/(admin)/admin/reports/page.tsx` |
| NOTIFY — Nhắc học và thông báo | 7 | `apps/api/src/presentation/notification.controller.ts; apps/mobile/src/shared/notifications/learning-reminders.ts` |
| UI — Giao diện và đồng bộ nền tảng | 10 | `apps/web/app; apps/mobile/app` |
| SEC — Bảo mật và tính toàn vẹn | 8 | `apps/api/src/infrastructure/auth; apps/api/src/presentation` |
| OPS — Vận hành và phi chức năng | 8 | `docs/06-nonfunctional.md; package.json; apps/api/package.json` |
| E2E — Luồng xuyên suốt toàn hệ thống | 5 | `apps/api/src/presentation; apps/web/app; apps/mobile/app` |

Phạm vi gồm các chức năng đang có mã nguồn. Thanh toán, subscription, voucher, leaderboard và mock interview không được tính là chức năng hiện hành chỉ vì còn tài liệu/verification package cũ. Không tuyên bố 100% code coverage từ số test case. Inventory API và route đi kèm giúp rà khoảng trống khi hệ thống thay đổi.

## Test case chi tiết

### AUTH — Đăng nhập và phiên

#### AUTH-001 · P0 · Đăng ký hợp lệ

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** Email qa+unique@example.test chưa tồn tại; mật khẩu Abcd@1234
- **Thực hiện:** Mở đăng ký; nhập Nguyễn An và thông tin hợp lệ; gửi; đăng nhập
- **Mong đợi:** Tạo đúng một tài khoản learner; đăng nhập được; không trả password hash.
- **Trạng thái:** Chưa chạy.

#### AUTH-002 · P1 · Email trùng

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** Một tài khoản đã dùng email QA
- **Thực hiện:** Đăng ký lại cùng email; lặp với khác hoa thường
- **Mong đợi:** Không tạo tài khoản trùng; phản hồi lỗi rõ; tài khoản cũ không thay đổi.
- **Trạng thái:** Chưa chạy.

#### AUTH-003 · P1 · Biên mật khẩu đăng ký

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** Chuỗi có đủ hoa/thường/số/ký tự đặc biệt
- **Thực hiện:** Gửi lần lượt độ dài 7,8,72,73; tiếp tục với thiếu từng nhóm ký tự
- **Mong đợi:** 8 và 72 hợp lệ; 7 và 73 bị từ chối; thiếu nhóm ký tự bị từ chối ở server.
- **Trạng thái:** Chưa chạy.

#### AUTH-004 · P1 · Biên tên và email

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** Dữ liệu đăng ký mới
- **Thực hiện:** Gửi tên dài 1,2,100,101; email sai dạng; tên chỉ dấu cách
- **Mong đợi:** Tên 2–100 hợp lệ khi có nội dung; dữ liệu còn lại bị từ chối; không ghi bản ghi rác.
- **Trạng thái:** Chưa chạy.

#### AUTH-005 · P0 · Đăng nhập theo vai trò

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** ADMIN, TEACHER, L1 hoạt động
- **Thực hiện:** Đăng nhập từng tài khoản trên giao diện được hỗ trợ; mở trang đích
- **Mong đợi:** Phiên thuộc đúng người dùng; điều hướng theo quyền; mobile không mở chức năng quản trị trái phép.
- **Trạng thái:** Chưa chạy.

#### AUTH-006 · P0 · Sai thông tin đăng nhập

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** L1 hoạt động
- **Thực hiện:** Nhập sai mật khẩu; thử email không tồn tại
- **Mong đợi:** Không cấp token; lỗi không chứa dữ liệu tài khoản hoặc stack trace.
- **Trạng thái:** Chưa chạy.

#### AUTH-007 · P0 · Tài khoản bị khóa/xóa

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** L1 có phiên; ADMIN có quyền quản lý
- **Thực hiện:** Suspend L1 rồi gọi API với token cũ; lặp với soft-delete
- **Mong đợi:** Không tiếp tục truy cập dữ liệu bảo vệ; UI kết thúc phiên hoặc báo khóa phù hợp.
- **Trạng thái:** Chưa chạy.

#### AUTH-008 · P0 · Refresh phiên

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** L1 đăng nhập; access token hết hạn
- **Thực hiện:** Gọi một API cần xác thực
- **Mong đợi:** Refresh thành công khi refresh token hợp lệ; gửi lại request đúng một lần; không vòng lặp.
- **Trạng thái:** Chưa chạy.

#### AUTH-009 · P0 · Refresh đồng thời

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** Access token hết hạn; dashboard có nhiều request
- **Thực hiện:** Mở dashboard; ghi network khi các request cùng trả 401
- **Mong đợi:** Các request phục hồi nhất quán; không đăng xuất nhầm do refresh cạnh tranh; không lặp vô hạn.
- **Trạng thái:** Chưa chạy.

#### AUTH-010 · P0 · Refresh token sai/hết hạn

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** Token giả và token hết hạn
- **Thực hiện:** Gọi refresh; mở lại màn bảo vệ
- **Mong đợi:** Từ chối; xóa trạng thái phiên không hợp lệ; không giữ dữ liệu người cũ.
- **Trạng thái:** Chưa chạy.

#### AUTH-011 · P0 · Đăng xuất

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** L1 có phiên
- **Thực hiện:** Đăng xuất; gọi lại API và refresh bằng phiên cũ; nhấn Back
- **Mong đợi:** Refresh cũ không tạo phiên mới; màn bảo vệ yêu cầu đăng nhập; không hiển thị cache nhạy cảm.
- **Trạng thái:** Chưa chạy.

#### AUTH-012 · P1 · Quên mật khẩu

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** Hộp thư test; email L1
- **Thực hiện:** Yêu cầu OTP; lấy OTP từ hộp thư test; đặt mật khẩu mới; đăng nhập
- **Mong đợi:** Email đến đúng tài khoản; mật khẩu mới dùng được; mật khẩu cũ thất bại.
- **Trạng thái:** Chưa chạy.

#### AUTH-013 · P0 · OTP sai/hết hạn/dùng lại

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** OTP hợp lệ đã phát cho L1
- **Thực hiện:** Thử OTP sai; OTP quá hạn; dùng OTP của L1 cho L2; dùng lại OTP đã thành công
- **Mong đợi:** Mỗi trường hợp bị từ chối; không đổi mật khẩu tài khoản khác.
- **Trạng thái:** Chưa chạy.

#### AUTH-014 · P0 · Đổi mật khẩu

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** L1 đăng nhập
- **Thực hiện:** Nhập mật khẩu hiện tại sai; sau đó đúng và mật khẩu mới hợp lệ; thử đăng nhập lại
- **Mong đợi:** Sai không thay đổi dữ liệu; đúng cập nhật; cả /auth/change-password và /users/me/change-password áp dụng cùng chính sách.
- **Trạng thái:** Chưa chạy.

#### AUTH-015 · P1 · Google web/mobile

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** OAuth test được cấu hình
- **Thực hiện:** Đăng nhập Google; hủy consent; gửi ID token giả/sai audience vào mobile API
- **Mong đợi:** Token hợp lệ vào đúng tài khoản; hủy không tạo phiên; token giả/sai audience bị từ chối.
- **Trạng thái:** Chưa chạy.

#### AUTH-016 · P1 · Lỗi mạng khi đăng nhập

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** API test có thể ngắt kết nối
- **Thực hiện:** Gửi đăng nhập khi offline; bật mạng; thử lại
- **Mong đợi:** Thông báo hữu ích; nút thoát loading; không nhân đôi phiên/tài khoản.
- **Trạng thái:** Chưa chạy.

### RBAC — Vai trò và phân quyền

#### RBAC-001 · P0 · Chưa xác thực

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** Không có Authorization
- **Thực hiện:** Gọi lần lượt các route có JwtAuthGuard trong inventory
- **Mong đợi:** 401; không trả dữ liệu bảo vệ hoặc thực hiện ghi.
- **Trạng thái:** Chưa chạy.

#### RBAC-002 · P0 · Learner gọi API quản trị

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** L1 không có quyền quản trị
- **Thực hiện:** Gọi trực tiếp create/update/delete users, roles, lessons, questions, exams và báo cáo
- **Mong đợi:** 403 ở các thao tác thiếu quyền; DB không thay đổi; ẩn menu không phải cơ chế bảo vệ duy nhất.
- **Trạng thái:** Chưa chạy.

#### RBAC-003 · P0 · Kiểm quyền từng thao tác

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** Role test chỉ có lessons:create
- **Thực hiện:** Gọi tạo bài; sửa bài; xóa bài
- **Mong đợi:** Chỉ tạo thành công; sửa/xóa bị từ chối nếu không có quyền tương ứng.
- **Trạng thái:** Chưa chạy.

#### RBAC-004 · P1 · CRUD role tùy chỉnh

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** ADMIN; role tên QA chưa tồn tại
- **Thực hiện:** Tạo role; sửa tên; mở chi tiết và danh sách users; xóa role không sử dụng
- **Mong đợi:** Danh sách và chi tiết đồng bộ; không tạo bản ghi trùng.
- **Trạng thái:** Chưa chạy.

#### RBAC-005 · P0 · Gán và thu hồi quyền

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** Role QA; user QA có phiên
- **Thực hiện:** Gán quyền; đăng nhập lại; thử thao tác; thu hồi quyền; thử token cũ và mới
- **Mong đợi:** Quyền hiệu lực đúng chính sách; quyền đã thu hồi không tiếp tục cho phép thao tác ngoài chính sách phiên.
- **Trạng thái:** Chưa chạy.

#### RBAC-006 · P0 · Gán và thu hồi role

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** ADMIN; L1
- **Thực hiện:** Gán role QA; kiểm quyền; thu hồi; kiểm lại
- **Mong đợi:** Chỉ thay đổi quyền của L1; không tạo liên kết role trùng.
- **Trạng thái:** Chưa chạy.

#### RBAC-007 · P0 · Tự nâng quyền

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** L1
- **Thực hiện:** Gửi roleIds/permissions/isAdmin khi đăng ký và PATCH users/me
- **Mong đợi:** Không tự nâng quyền; server loại bỏ hoặc từ chối trường không được phép.
- **Trạng thái:** Chưa chạy.

#### RBAC-008 · P1 · Quyền không tồn tại

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** ADMIN
- **Thực hiện:** Gán UUID quyền không tồn tại; gán trùng; thay toàn bộ tập quyền
- **Mong đợi:** Không tạo liên kết mồ côi; không trùng; tập quyền sau thay thế đúng dữ liệu gửi.
- **Trạng thái:** Chưa chạy.

#### RBAC-009 · P0 · Role hệ thống đang dùng

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** ADMIN; role hệ thống có users
- **Thực hiện:** Thử sửa/xóa quyền hoặc role được bảo vệ
- **Mong đợi:** Không phá vỡ ràng buộc bảo vệ; nếu thao tác được phép phải không làm mất khả năng quản trị ngoài chủ đích.
- **Trạng thái:** Chưa chạy.

#### RBAC-010 · P1 · CRUD permission

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** ADMIN có roles:create/update/delete
- **Thực hiện:** Tạo permission QA; sửa; gán; thu hồi; xóa
- **Mong đợi:** Mã quyền duy nhất; liên kết và danh sách cập nhật; dữ liệu tham chiếu được xử lý rõ.
- **Trạng thái:** Chưa chạy.

### USER — Người dùng và nhóm học viên

#### USER-001 · P1 · Tạo và sửa người dùng

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** ADMIN; email QA mới
- **Thực hiện:** Tạo learner; sửa tên và thông tin; mở lại chi tiết
- **Mong đợi:** Dữ liệu đúng; mật khẩu không xuất hiện trong response/list.
- **Trạng thái:** Chưa chạy.

#### USER-002 · P1 · Tìm kiếm và phân trang

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** 35 người dùng QA gồm tên tiếng Việt
- **Thực hiện:** Tìm tên/email; lọc role/trạng thái; chuyển trang và đổi bộ lọc
- **Mong đợi:** Kết quả đúng điều kiện; tổng và số trang nhất quán; không lặp hoặc bỏ sót bản ghi.
- **Trạng thái:** Chưa chạy.

#### USER-003 · P0 · Suspend và activate

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** ADMIN; L1
- **Thực hiện:** Khóa L1; thử login; kích hoạt lại; login
- **Mong đợi:** Khóa ngăn truy cập; kích hoạt phục hồi đúng tài khoản và lịch sử.
- **Trạng thái:** Chưa chạy.

#### USER-004 · P0 · Soft-delete người dùng

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** L1 có bài thi và tiến độ
- **Thực hiện:** ADMIN xóa L1; đọc danh sách và báo cáo; thử login
- **Mong đợi:** Không login được; không xuất hiện như user hoạt động; lịch sử không gây lỗi FK hoặc mất dữ liệu người khác.
- **Trạng thái:** Chưa chạy.

#### USER-005 · P1 · Tạo email trùng

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** ADMIN; email L1 tồn tại
- **Thực hiện:** Tạo người dùng trùng; sửa L2 sang email L1
- **Mong đợi:** Từ chối; không ghi đè hoặc hợp nhất hai tài khoản.
- **Trạng thái:** Chưa chạy.

#### USER-006 · P1 · Tạo và sửa nhóm

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** Quyền users:update; nhóm QA mới
- **Thực hiện:** Tạo nhóm; sửa thông tin; refresh danh sách
- **Mong đợi:** Thông tin và số lượng thành viên nhất quán.
- **Trạng thái:** Chưa chạy.

#### USER-007 · P1 · Thêm/xóa thành viên

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** Nhóm QA; L1 và L2
- **Thực hiện:** Thêm L1 hai lần; thêm L2; xóa L1
- **Mong đợi:** Không trùng thành viên; chỉ L2 còn trong nhóm; số lượng đúng.
- **Trạng thái:** Chưa chạy.

#### USER-008 · P1 · Thành viên không hợp lệ

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** Nhóm QA
- **Thực hiện:** Thêm UUID không tồn tại hoặc tài khoản không phải learner
- **Mong đợi:** Báo lỗi có kiểm soát; không tạo thành viên mồ côi.
- **Trạng thái:** Chưa chạy.

#### USER-009 · P1 · Xóa nhóm

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** Nhóm QA có thành viên
- **Thực hiện:** Xóa nhóm; kiểm users và học tập L1
- **Mong đợi:** Nhóm biến mất; không xóa tài khoản hoặc tiến độ của thành viên.
- **Trạng thái:** Chưa chạy.

#### USER-010 · P0 · Quyền quản lý nhóm

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** Role chỉ users:read; role có users:update
- **Thực hiện:** Cùng gọi list và các thao tác ghi nhóm
- **Mong đợi:** users:read đọc được nhưng không ghi; users:update ghi theo guard; kiểm độc lập với users:manage.
- **Trạng thái:** Chưa chạy.

### PROFILE — Onboarding và hồ sơ học tập

#### PROFILE-001 · P0 · Onboarding người mới

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** LNEW chưa cấu hình
- **Thực hiện:** Login; chọn trình độ, lĩnh vực, mục tiêu, kế hoạch; hoàn tất
- **Mong đợi:** Lưu profile và onboardingCompleted; lần đăng nhập sau vào ứng dụng đúng luồng.
- **Trạng thái:** Chưa chạy.

#### PROFILE-002 · P1 · Quay lại onboarding

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** LNEW đang điền
- **Thực hiện:** Chọn dữ liệu; Back/Next; đóng và mở lại app
- **Mong đợi:** Không lưu nhầm hoàn tất khi chưa gửi; dữ liệu không bị gán mục tiêu tùy ý.
- **Trạng thái:** Chưa chạy.

#### PROFILE-003 · P0 · Mục tiêu từ vựng

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1; domain D1
- **Thực hiện:** Chọn vocabulary, D1 và level; lưu; đọc GET me và journey
- **Mong đợi:** learningGoal=vocabulary; domain D1 còn; mục tiêu và journey phản ánh lựa chọn.
- **Trạng thái:** Chưa chạy.

#### PROFILE-004 · P0 · Mục tiêu chứng chỉ

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1; C1 và D1
- **Thực hiện:** Chọn certification, C1, D1; lưu mobile; mở web
- **Mong đợi:** learningGoal=certification; giữ lĩnh vực; chứng chỉ đúng; không xóa domain ngoài ý muốn.
- **Trạng thái:** Chưa chạy.

#### PROFILE-005 · P0 · Mục tiêu kết hợp

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1
- **Thực hiện:** Chọn both, C1, D1; lưu web; sửa tên trên mobile; mở lại web
- **Mong đợi:** both, certificate và domains được bảo toàn sau chỉnh sửa.
- **Trạng thái:** Chưa chạy.

#### PROFILE-006 · P1 · Thiếu trường mục tiêu

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1
- **Thực hiện:** Lưu thiếu trình độ/lĩnh vực/chứng chỉ cần thiết; gọi API trực tiếp cùng payload
- **Mong đợi:** Lỗi rõ cho dữ liệu bắt buộc; không báo hoàn tất hoặc ghi mục tiêu không hợp lệ.
- **Trạng thái:** Chưa chạy.

#### PROFILE-007 · P1 · Mã tham chiếu sai

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1
- **Thực hiện:** Gửi level/domain/certificate/career code không tồn tại
- **Mong đợi:** Từ chối có kiểm soát; không liên kết sai hoặc lưu một phần quan hệ.
- **Trạng thái:** Chưa chạy.

#### PROFILE-008 · P1 · Biên kế hoạch

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1
- **Thực hiện:** Thử từ/ngày 0,1,200,201; quiz/tuần 0,1,50,51; phút/ngày 4,5,1440,1441
- **Mong đợi:** Chấp nhận biên 1–200,1–50,5–1440 tương ứng; ngoài khoảng bị từ chối ở server.
- **Trạng thái:** Chưa chạy.

#### PROFILE-009 · P1 · Giờ nhắc không hợp lệ

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1
- **Thực hiện:** Gửi 00:00,23:59,24:00,12:60 và chuỗi rỗng khi tắt nhắc
- **Mong đợi:** Giờ hợp lệ lưu đúng; giờ sai không tạo lịch; tắt nhắc không bị tự bật lại.
- **Trạng thái:** Chưa chạy.

#### PROFILE-010 · P1 · Cập nhật thông tin cá nhân

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1
- **Thực hiện:** Đổi tên tiếng Việt, bio và điện thoại; tải lại web/mobile
- **Mong đợi:** Dữ liệu đồng nhất; tên 2–100, bio tối đa 500; điện thoại đúng quy tắc DTO.
- **Trạng thái:** Chưa chạy.

#### PROFILE-011 · P1 · Xóa số điện thoại

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 có số đã lưu
- **Thực hiện:** Xóa nội dung số điện thoại; lưu; đọc users/me
- **Mong đợi:** Giá trị được xóa/null; không giữ số cũ hoặc báo lỗi cho chuỗi trống.
- **Trạng thái:** Chưa chạy.

#### PROFILE-012 · P0 · Sửa hồ sơ người khác

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 và L2
- **Thực hiện:** L1 PUT learner-profiles/L2/goals; gọi admin route cùng payload bằng ADMIN đủ quyền
- **Mong đợi:** L1 bị cấm; ADMIN đủ quyền sửa đúng L2; L1 không bị thay đổi.
- **Trạng thái:** Chưa chạy.

#### PROFILE-013 · P1 · Lưu lỗi giữa hai API

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1; giả lập API goals lỗi nhưng users/me thành công
- **Thực hiện:** Sửa tên và mục tiêu; lưu; tải lại
- **Mong đợi:** Không báo toàn bộ thành công; thông báo lỗi và trạng thái thực tế rõ; retry không làm mất dữ liệu đã lưu.
- **Trạng thái:** Chưa chạy.

#### PROFILE-014 · P1 · Upload ảnh hợp lệ

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1; ảnh JPEG/PNG/WebP/GIF dưới 5 MiB
- **Thực hiện:** Upload multipart và base64; lưu URL; mở lại web/mobile
- **Mong đợi:** Avatar hiển thị đúng; response URL/publicId hợp lệ; không đổi avatar tài khoản khác.
- **Trạng thái:** Chưa chạy.

#### PROFILE-015 · P1 · Upload ảnh lỗi

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1; ảnh >5 MiB, file văn bản và base64 hỏng
- **Thực hiện:** Upload từng file; thử không có file; giả lập storage lỗi
- **Mong đợi:** Từ chối hoặc báo lỗi có kiểm soát; avatar cũ không bị mất; không loading vô hạn.
- **Trạng thái:** Chưa chạy.

### PLACE — Kiểm tra trình độ

#### PLACE-001 · P0 · Làm bài xếp trình độ

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** 20 câu published có topic placement; LNEW
- **Thực hiện:** Mở bài; chọn đáp án; nộp; mở profile
- **Mong đợi:** Trả correct/total/percent/level; cập nhật đúng level của người làm.
- **Trạng thái:** Chưa chạy.

#### PLACE-002 · P0 · Không lộ đáp án

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Có câu placement
- **Thực hiện:** GET placement-test và xem network trước khi nộp
- **Mong đợi:** Không có isCorrect hoặc lời giải cho phép biết trước đáp án.
- **Trạng thái:** Chưa chạy.

#### PLACE-003 · P1 · Ngưỡng xếp loại

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Fixture 20 câu đáp án biết trước
- **Thực hiện:** Nộp các bộ đạt 35%,40%,65%,70%
- **Mong đợi:** Lần lượt beginner,intermediate,intermediate,advanced theo ngưỡng hiện tại.
- **Trạng thái:** Chưa chạy.

#### PLACE-004 · P1 · Payload sai

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1
- **Thực hiện:** Nộp answers rỗng; câu không phải placement; câu draft; option không thuộc câu; ID câu trùng
- **Mong đợi:** Không tính điểm tăng do câu trùng; câu không hợp lệ bị từ chối; option sai không được tính đúng.
- **Trạng thái:** Chưa chạy.

#### PLACE-005 · P1 · Không có câu hỏi

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Không có placement published
- **Thực hiện:** Mở màn kiểm tra
- **Mong đợi:** Empty state rõ; không chia cho 0; không tự gán level hoặc cho nộp bài rỗng.
- **Trạng thái:** Chưa chạy.

#### PLACE-006 · P1 · Nộp thiếu câu để tăng điểm

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Bộ 20 câu; L1
- **Thực hiện:** Chỉ gửi 1 câu đúng qua API
- **Mong đợi:** Ghi nhận rủi ro nếu hệ thống cho đạt advanced từ mẫu quá nhỏ; cần chốt quy tắc tối thiểu trước nghiệm thu, không đánh dấu Pass theo hiện trạng.
- **Trạng thái:** Chưa chạy.

### TAX — Danh mục và chứng chỉ

#### TAX-001 · P1 · CRUD cấp độ

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** ADMIN có certificates:manage
- **Thực hiện:** Tạo level QA; sửa; lọc; xóa level chưa dùng
- **Mong đợi:** Thứ tự/tên/mã đúng; không trùng code.
- **Trạng thái:** Chưa chạy.

#### TAX-002 · P1 · Xóa cấp độ đang dùng

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Level gắn L1 và lesson
- **Thực hiện:** Xóa level
- **Mong đợi:** Chặn hoặc xử lý theo ràng buộc; không làm mồ côi profile/content; UI nêu lý do.
- **Trạng thái:** Chưa chạy.

#### TAX-003 · P1 · Mục tiêu nghề nghiệp

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** ADMIN có users:update
- **Thực hiện:** Tạo career goal; sửa; chọn vào L1
- **Mong đợi:** Thông tin hiển thị đúng ở quản trị và hồ sơ; liên kết không trùng.
- **Trạng thái:** Chưa chạy.

#### TAX-004 · P0 · CRUD chứng chỉ

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** ADMIN có certificates:manage
- **Thực hiện:** Tạo CQA; sửa provider/code/name/trạng thái; mở learner; xóa CQA chưa sử dụng
- **Mong đợi:** Dữ liệu đúng; chỉ nội dung được phép công bố xuất hiện với learner.
- **Trạng thái:** Chưa chạy.

#### TAX-005 · P1 · Domain và topic chứng chỉ

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** C1
- **Thực hiện:** Tạo domain; tạo topic thuộc domain; mở lộ trình C1
- **Mong đợi:** Đúng phân cấp và thứ tự; không lẫn domain/topic C2.
- **Trạng thái:** Chưa chạy.

#### TAX-006 · P0 · Liên kết nội dung

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** C1,T1 và lesson/vocabulary/exam fixtures
- **Thực hiện:** Sửa content-links cấp certificate và topic; tải lại learner
- **Mong đợi:** Lesson/từ vựng/quiz liên kết đúng; không mất liên kết khác ngoài payload chủ đích.
- **Trạng thái:** Chưa chạy.

#### TAX-007 · P1 · Liên kết không hợp lệ

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** C1,T1
- **Thực hiện:** Gửi ID nội dung không tồn tại hoặc topic từ C2
- **Mong đợi:** Từ chối liên kết sai; không ghi nửa chừng hoặc tạo bản ghi mồ côi.
- **Trạng thái:** Chưa chạy.

#### TAX-008 · P1 · Chi tiết chứng chỉ rỗng

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** CEMPTY không có topic
- **Thực hiện:** Mở list và detail CEMPTY
- **Mong đợi:** Empty state và điều hướng quay lại hoạt động; không crash.
- **Trạng thái:** Chưa chạy.

#### TAX-009 · P1 · Xóa chứng chỉ đã sử dụng

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** C1 có attempt và mục tiêu L1
- **Thực hiện:** ADMIN xóa C1; kiểm lịch sử và profile
- **Mong đợi:** Không mất lịch sử sai chủ đích; ràng buộc được báo rõ; không còn liên kết hỏng.
- **Trạng thái:** Chưa chạy.

### LESSON — Quản lý và học bài

#### LESSON-001 · P0 · Tạo bài theo loại

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** ADMIN đủ quyền; D1 và level
- **Thực hiện:** Tạo lần lượt terminology,technical_reading,api_documentation,system_design,case_study,certification_review
- **Mong đợi:** Lưu đúng type; mở ở vị trí phù hợp; certification_review nằm trong lộ trình chứng chỉ nếu không ở catalog chung.
- **Trạng thái:** Chưa chạy.

#### LESSON-002 · P1 · Sửa nội dung và thứ tự section

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Lesson QA nhiều section
- **Thực hiện:** Đổi title/summary; thêm, sắp xếp, xóa section; tải lại
- **Mong đợi:** Thứ tự và nội dung giữ đúng; không mất section còn lại.
- **Trạng thái:** Chưa chạy.

#### LESSON-003 · P1 · Biên thời lượng và dữ liệu

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** ADMIN
- **Thực hiện:** Gửi estimatedMinutes 0,1,480,481; thiếu title; type sai; domain sai
- **Mong đợi:** 1–480 hợp lệ; dữ liệu sai bị từ chối ở API.
- **Trạng thái:** Chưa chạy.

#### LESSON-004 · P0 · Publish/draft/archive

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Lesson QA
- **Thực hiện:** Chuyển trạng thái; mở list và URL detail trực tiếp bằng learner
- **Mong đợi:** Learner chỉ đọc nội dung được phép; draft/archive không bị lộ qua deep link.
- **Trạng thái:** Chưa chạy.

#### LESSON-005 · P1 · Tìm và lọc catalog

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Nhiều lesson thuộc 5 track,D1,D2
- **Thực hiện:** Chọn từng track; tìm từ khóa tiếng Việt trong title/summary/concepts; xóa bộ lọc
- **Mong đợi:** Kết quả và số lượng khớp; không lẫn track; empty state đúng.
- **Trạng thái:** Chưa chạy.

#### LESSON-006 · P1 · Card chuyên đề web/mobile

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Các track có số bài khác nhau
- **Thực hiện:** Mở tất cả bài học; chạm từng card
- **Mong đợi:** Label, số bài và nội dung tương ứng; card mở đúng track trên cả hai nền tảng.
- **Trạng thái:** Chưa chạy.

#### LESSON-007 · P0 · Trải nghiệm từng loại bài

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Một bài published cho mỗi loại
- **Thực hiện:** Mở; đọc nội dung; làm hoạt động; chuyển section; hoàn tất
- **Mong đợi:** Nội dung/hoạt động tương ứng loại; không hiển thị placeholder hoặc công cụ không hoạt động.
- **Trạng thái:** Chưa chạy.

#### LESSON-008 · P1 · Tài liệu kỹ thuật dài

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Lesson có code, bảng, URL dài và ảnh
- **Thực hiện:** Mở trên màn 360px và desktop; cuộn, chọn đoạn code
- **Mong đợi:** Nội dung không mất; bảng/code cuộn phù hợp; nút chính không ra ngoài màn hình.
- **Trạng thái:** Chưa chạy.

#### LESSON-009 · P0 · Ghi tiến độ bài học

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 chưa học lesson QA
- **Thực hiện:** Học/hoàn tất; rời màn; mở lại; mở progress trên nền tảng kia
- **Mong đợi:** Tiến độ đúng learner và lesson; không mất khi chuyển nền tảng; không cộng lặp.
- **Trạng thái:** Chưa chạy.

#### LESSON-010 · P1 · Xóa bài đang tham chiếu

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Lesson có progress và topic link
- **Thực hiện:** ADMIN xóa; learner mở URL cũ
- **Mong đợi:** Không crash; thông báo không tồn tại hoặc ràng buộc rõ; không hỏng dữ liệu liên quan.
- **Trạng thái:** Chưa chạy.

### VOC — Từ vựng và ôn tập

#### VOC-001 · P1 · CRUD từ vựng

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** ADMIN có vocabulary:manage
- **Thực hiện:** Tạo từ với nghĩa, phát âm, ví dụ, domain,level; sửa; xóa fixture chưa dùng
- **Mong đợi:** Dữ liệu lưu đủ; list/detail phản ánh thay đổi.
- **Trạng thái:** Chưa chạy.

#### VOC-002 · P1 · Đổi trạng thái hàng loạt

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** V1,V2 draft; V3 published
- **Thực hiện:** Chọn V1,V2; bulk published; kiểm V3; gửi status sai
- **Mong đợi:** Chỉ ID chọn thay đổi; status sai bị từ chối.
- **Trạng thái:** Chưa chạy.

#### VOC-003 · P0 · Học từ theo bộ lọc

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1; từ published D1 và D2
- **Thực hiện:** Mở session D1/level; lật thẻ; chuyển từ; nghe phát âm
- **Mong đợi:** Đúng bộ từ; front/back đúng; không crash nếu âm thanh không khả dụng.
- **Trạng thái:** Chưa chạy.

#### VOC-004 · P0 · Đánh giá SRS

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 có 4 từ chưa học
- **Thực hiện:** Rate lần lượt easy,medium,hard,mastered; đọc history và review-session
- **Mong đợi:** lastRating và lịch ôn cập nhật theo thuật toán; không lẫn rating hoặc learner.
- **Trạng thái:** Chưa chạy.

#### VOC-005 · P1 · Rate sai dữ liệu

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1
- **Thực hiện:** Gửi rating lạ; vocabularyId không tồn tại; payload thiếu trường
- **Mong đợi:** Lỗi 4xx có kiểm soát; không ghi tiến độ rác hoặc trả 500 do dữ liệu đầu vào.
- **Trạng thái:** Chưa chạy.

#### VOC-006 · P0 · Quiz từ vựng

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 có từ đã học
- **Thực hiện:** POST quiz với vocabIds; trả lời đúng/sai; xem summary
- **Mong đợi:** Câu hỏi thuộc bộ từ; kết quả và SRS cập nhật đúng; không sinh đáp án trùng gây mơ hồ.
- **Trạng thái:** Chưa chạy.

#### VOC-007 · P1 · Bộ quiz rỗng/ít từ

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Bộ 0,1,2 từ
- **Thực hiện:** Tạo quiz và mở giao diện
- **Mong đợi:** Empty state hoặc bài hợp lệ; không vòng lặp tạo distractor; không chia cho 0.
- **Trạng thái:** Chưa chạy.

#### VOC-008 · P0 · Tiếp tục phiên học

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 đang học dở
- **Thực hiện:** Rời màn; gọi session với continue=true; mở trên nền tảng khác
- **Mong đợi:** Nội dung tiếp tục phù hợp dữ liệu đã ghi; không tự đánh dấu các từ chưa học.
- **Trạng thái:** Chưa chạy.

#### VOC-009 · P1 · Ôn từ đến hạn

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Có từ quá hạn,hôm nay,tương lai
- **Thực hiện:** GET review-session
- **Mong đợi:** Bộ ôn phù hợp thời điểm; không bỏ từ quá hạn hoặc trộn người học khác.
- **Trạng thái:** Chưa chạy.

#### VOC-010 · P1 · Lịch sử theo thời gian/rating

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Fixture các ngày/tháng/năm và nhiều rating
- **Thực hiện:** Lọc history từng period và rating
- **Mong đợi:** Kết quả, số lượng và empty state đúng; dữ liệu ranh giới ngày được đối chiếu theo múi giờ đã chốt.
- **Trạng thái:** Chưa chạy.

#### VOC-011 · P0 · Tách dữ liệu người học

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 học V1; L2 chưa học
- **Thực hiện:** Mở dashboard/history/summary bằng L2
- **Mong đợi:** Không thấy tiến độ cá nhân L1; nội dung từ dùng chung vẫn truy cập đúng.
- **Trạng thái:** Chưa chạy.

#### VOC-012 · P1 · Nội dung bị gỡ giữa phiên

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 đang học V1; ADMIN archive V1
- **Thực hiện:** Tiếp tục/rate/refresh
- **Mong đợi:** Lỗi hoặc xử lý nhất quán; không crash; không tạo progress trỏ tới dữ liệu mất.
- **Trạng thái:** Chưa chạy.

### QUESTION — Ngân hàng và import câu hỏi

#### QUESTION-001 · P0 · Tạo các loại câu hỏi

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** ADMIN có questions:manage
- **Thực hiện:** Tạo single_choice,multiple_choice,true_false,short_answer,scenario với dữ liệu phù hợp
- **Mong đợi:** Lưu đúng loại, đáp án, lời giải và điểm; preview không mất nội dung.
- **Trạng thái:** Chưa chạy.

#### QUESTION-002 · P1 · Phân loại kỹ năng

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** Có câu vocabulary,reading,technical_understanding,scenario_based
- **Thực hiện:** Tạo/lọc theo skill,domain,level,topic,certificate
- **Mong đợi:** Bộ lọc và dữ liệu sau reload khớp lựa chọn.
- **Trạng thái:** Chưa chạy.

#### QUESTION-003 · P0 · Validate đáp án

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** ADMIN
- **Thực hiện:** Tạo câu không có đáp án đúng; option trùng key; single choice nhiều đáp án đúng
- **Mong đợi:** Từ chối cấu hình mâu thuẫn; không tạo câu không thể chấm đúng.
- **Trạng thái:** Chưa chạy.

#### QUESTION-004 · P1 · Biên difficulty/điểm

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** ADMIN
- **Thực hiện:** Gửi difficulty 0,1,100,101; điểm liên kết đề 0,0.01,100,101
- **Mong đợi:** Chấp nhận đúng khoảng DTO; dữ liệu ngoài khoảng bị từ chối.
- **Trạng thái:** Chưa chạy.

#### QUESTION-005 · P1 · Sửa/xóa câu đã dùng

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** Q1 có attempt đã nộp
- **Thực hiện:** Sửa đáp án Q1 rồi mở kết quả cũ; thử xóa Q1
- **Mong đợi:** Kết quả lịch sử giữ snapshot; thao tác tham chiếu không gây lỗi dữ liệu.
- **Trạng thái:** Chưa chạy.

#### QUESTION-006 · P0 · Import Excel mẫu

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** Tải template; điền 3 câu hợp lệ
- **Thực hiện:** Upload; xem preview; xác nhận import; lọc câu vừa nhập
- **Mong đợi:** Tạo đúng 3 câu; skill/type/options/đáp án đúng giữ nguyên.
- **Trạng thái:** Chưa chạy.

#### QUESTION-007 · P1 · Import sai cột/kiểu

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** Excel thiếu cột, sai enum, option rỗng
- **Thực hiện:** Upload từng file; xem báo lỗi
- **Mong đợi:** Chỉ rõ file/sheet/dòng/trường lỗi khi có thể; không âm thầm nhập dữ liệu sai.
- **Trạng thái:** Chưa chạy.

#### QUESTION-008 · P1 · Import nhiều file có lỗi

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** File A hợp lệ; B có dòng sai
- **Thực hiện:** Chọn cả hai; sửa hoặc loại dòng lỗi; xác nhận
- **Mong đợi:** Số thành công/thất bại khớp; người dùng biết phần được nhập; không bỏ mất file A.
- **Trạng thái:** Chưa chạy.

#### QUESTION-009 · P1 · Import file rỗng/hỏng/sai loại

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** XLSX rỗng, file hỏng, TXT đổi đuôi
- **Thực hiện:** Upload mỗi file
- **Mong đợi:** Báo lỗi có kiểm soát; preview cũ không được gửi nhầm.
- **Trạng thái:** Chưa chạy.

#### QUESTION-010 · P0 · Import nhấn nhiều lần

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** File hợp lệ; mạng chậm
- **Thực hiện:** Bấm xác nhận liên tiếp hoặc retry sau timeout
- **Mong đợi:** UI ngăn gửi lặp; kiểm số bản ghi; nếu API không có idempotency thì ghi rõ nguy cơ duplicate.
- **Trạng thái:** Chưa chạy.

#### QUESTION-011 · P1 · Phân trang và tìm câu

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** 35 câu với prompt tiếng Việt
- **Thực hiện:** Tìm/lọc rồi chuyển trang; đổi bộ lọc ở trang cuối
- **Mong đợi:** Page reset hoặc được hiệu chỉnh; tổng chính xác; không báo rỗng giả.
- **Trạng thái:** Chưa chạy.

### EXAM — Soạn đề và làm bài

#### EXAM-001 · P0 · Tạo đề theo loại

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** ADMIN có exams:create; C1 và câu hợp lệ
- **Thực hiện:** Tạo practice,domain_test,mock_exam,scenario_assessment; thêm câu; publish
- **Mong đợi:** Đề gắn C1; thứ tự/điểm câu đúng; learner mở từ lộ trình tương ứng.
- **Trạng thái:** Chưa chạy.

#### EXAM-002 · P0 · Không tạo đề độc lập

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** ADMIN
- **Thực hiện:** Tạo đề thiếu certificateId
- **Mong đợi:** Bị từ chối; không xuất hiện đề độc lập ngoài mô hình chứng chỉ hiện tại.
- **Trạng thái:** Chưa chạy.

#### EXAM-003 · P1 · Câu trùng và lịch sai

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** ADMIN
- **Thực hiện:** Gắn cùng questionId hai lần; đặt đóng trước mở
- **Mong đợi:** Từ chối; không lưu đề mâu thuẫn.
- **Trạng thái:** Chưa chạy.

#### EXAM-004 · P1 · Biên cấu hình đề

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** ADMIN
- **Thực hiện:** durationMinutes 0,1,300,301; passingScorePercent 0,1,100,101; maxAttempts 0,1
- **Mong đợi:** Chấp nhận đúng khoảng; API chặn giá trị sai.
- **Trạng thái:** Chưa chạy.

#### EXAM-005 · P0 · Bắt đầu đề

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1; E1 published đang mở
- **Thực hiện:** Mở E1; bắt đầu; xem request/response
- **Mong đợi:** Tạo attempt của L1; thời gian và bộ câu đúng; không lộ đáp án đúng trước nộp.
- **Trạng thái:** Chưa chạy.

#### EXAM-006 · P0 · Đề chưa mở/đã đóng/draft

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Eearly,Elate,Edraft
- **Thực hiện:** L1 gọi start trực tiếp từng đề
- **Mong đợi:** Bị từ chối dù biết ID; không tạo attempt trái điều kiện.
- **Trạng thái:** Chưa chạy.

#### EXAM-007 · P0 · Start đồng thời

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1; E1 chưa có active attempt
- **Thực hiện:** Gửi hai POST start đồng thời từ web/mobile
- **Mong đợi:** Chỉ một active attempt cho cặp learner/exam; trả cùng phiên hoặc lỗi có kiểm soát.
- **Trạng thái:** Chưa chạy.

#### EXAM-008 · P0 · Giới hạn lượt làm

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** E1 maxAttempts=1; L1 đã có lượt kết thúc
- **Thực hiện:** Gọi start lần nữa; thử hai request đồng thời sát giới hạn
- **Mong đợi:** Không vượt số lượt cho phép; không tạo thêm lượt do race condition.
- **Trạng thái:** Chưa chạy.

#### EXAM-009 · P0 · Nộp và chấm điểm

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** E1 gồm 4 câu bằng điểm; biết đáp án
- **Thực hiện:** Trả lời đúng 3/4; nộp; xem result
- **Mong đợi:** Điểm 75%; correct=3,total=4; pass theo ngưỡng snapshot; giải thích khớp từng câu.
- **Trạng thái:** Chưa chạy.

#### EXAM-010 · P0 · Điểm có trọng số

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** E1 có câu trọng số 1 và 3
- **Thực hiện:** Chỉ trả lời đúng câu trọng số 3
- **Mong đợi:** Điểm phần trăm 75 theo tổng trọng số; không dùng tỷ lệ số câu thay cho điểm.
- **Trạng thái:** Chưa chạy.

#### EXAM-011 · P0 · Multiple choice chính xác

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Câu đúng A,C
- **Thực hiện:** Nộp A,C; lặp fixture mới với A và A,C,D
- **Mong đợi:** Chỉ tập đáp án đúng đầy đủ được tính theo quy tắc chấm; thiếu/thừa không được tính như đáp án hoàn toàn đúng.
- **Trạng thái:** Chưa chạy.

#### EXAM-012 · P1 · Câu bỏ trống/short answer/scenario

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** E1 có các loại này
- **Thực hiện:** Bỏ trống một câu; nhập câu trả lời mẫu và sai vào loại tự luận/tình huống
- **Mong đợi:** Không crash; chấm đúng quy tắc triển khai; nếu chưa có rubric phải ghi Blocked, không suy diễn hỗ trợ AI chấm.
- **Trạng thái:** Chưa chạy.

#### EXAM-013 · P0 · Nộp payload giả

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Attempt L1
- **Thực hiện:** Gửi câu ngoài snapshot, trùng questionId, option của câu khác và trường score giả
- **Mong đợi:** Câu/option sai bị từ chối; server tự tính điểm; không tin score do client gửi.
- **Trạng thái:** Chưa chạy.

#### EXAM-014 · P0 · Nộp đồng thời/lặp

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Attempt đang làm
- **Thực hiện:** Gửi hai submit đồng thời; retry submit sau thành công
- **Mong đợi:** Chỉ chấm/ghi tiến độ một lần; request sau lỗi có kiểm soát; điểm không cộng đôi.
- **Trạng thái:** Chưa chạy.

#### EXAM-015 · P0 · Người khác nộp/xem bài

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Attempt thuộc L1; token L2
- **Thực hiện:** L2 submit và GET attempt bằng ID L1
- **Mong đợi:** 403/404; không lộ snapshot, điểm hoặc sửa bài L1.
- **Trạng thái:** Chưa chạy.

#### EXAM-016 · P0 · Hết giờ và sửa đồng hồ máy

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Đề thời lượng 1 phút
- **Thực hiện:** Đợi hết giờ; chỉnh đồng hồ client; thử nộp trễ trực tiếp API
- **Mong đợi:** Thời hạn do server quyết định; không kéo dài bằng đồng hồ client; chính sách xử lý bài quá hạn phải được chốt và kiểm, không chỉ kiểm countdown UI.
- **Trạng thái:** Chưa chạy.

#### EXAM-017 · P0 · Snapshot đề

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 đã start E1
- **Thực hiện:** ADMIN sửa câu/đáp án/điểm đạt; L1 nộp
- **Mong đợi:** Bài đang làm được chấm theo snapshot ban đầu; kết quả cũ không thay đổi.
- **Trạng thái:** Chưa chạy.

#### EXAM-018 · P1 · Resume sau reload/background

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Attempt chưa hết giờ
- **Thực hiện:** Reload web; background/kill mobile rồi mở lại E1
- **Mong đợi:** Không tạo lượt trùng; thời gian còn lại đúng server; hành vi lưu câu chưa nộp đúng cam kết UI.
- **Trạng thái:** Chưa chạy.

#### EXAM-019 · P1 · Mạng mất khi submit

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Attempt hợp lệ
- **Thực hiện:** Gửi rồi ngắt mạng; nối lại; kiểm trạng thái trước retry
- **Mong đợi:** Không tạo kết quả trùng; cho xem kết quả nếu server đã nhận; không mất khả năng phục hồi.
- **Trạng thái:** Chưa chạy.

#### EXAM-020 · P1 · Xem lại kết quả

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 đã nộp; nhiều câu hơn một trang
- **Thực hiện:** Mở result; phân trang; xem đáp án/lời giải/domain/topic
- **Mong đợi:** Dữ liệu khớp snapshot; trang đúng; nút quay lại tới màn phù hợp.
- **Trạng thái:** Chưa chạy.

### PROGRESS — Tiến độ, dashboard và gợi ý

#### PROGRESS-001 · P0 · Dashboard người mới

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** LNEW không có progress
- **Thực hiện:** Mở home/progress
- **Mong đợi:** Hiển thị 0 hoặc chưa thiết lập; không gán chứng chỉ đầu danh sách làm mục tiêu; không NaN/Infinity.
- **Trạng thái:** Chưa chạy.

#### PROGRESS-002 · P0 · Đồng bộ tiến độ

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 học lesson và nộp exam trên mobile
- **Thực hiện:** Mở web progress/home; so GET progress/me
- **Mong đợi:** Cùng dữ liệu sau refresh; completion và averageScore không bị đánh đồng.
- **Trạng thái:** Chưa chạy.

#### PROGRESS-003 · P0 · Ghi tiến độ sai

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1
- **Thực hiện:** POST progress/me với resourceId sai,resourceType lạ,completion -1/101
- **Mong đợi:** Từ chối; không lưu tiến độ mồ côi hoặc phần trăm ngoài 0–100.
- **Trạng thái:** Chưa chạy.

#### PROGRESS-004 · P0 · Không giả danh learner

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1,L2
- **Thực hiện:** L1 POST progress kèm learnerId=L2
- **Mong đợi:** Chỉ dùng danh tính token hoặc từ chối; tiến độ L2 không đổi.
- **Trạng thái:** Chưa chạy.

#### PROGRESS-005 · P1 · Hoàn thành và ghi lặp

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 hoàn tất lesson
- **Thực hiện:** POST cùng trạng thái nhiều lần; tải tổng tiến độ
- **Mong đợi:** Không nhân đôi số hoàn thành; resource khác không đổi.
- **Trạng thái:** Chưa chạy.

#### PROGRESS-006 · P1 · Mục tiêu ngày/tuần

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Fixture có hoạt động hôm nay và tuần trước
- **Thực hiện:** Mở journey/home
- **Mong đợi:** Từ vựng, phút học, bài thi tuần đúng kỳ; thanh không vượt 100% dù vượt chỉ tiêu.
- **Trạng thái:** Chưa chạy.

#### PROGRESS-007 · P1 · Ranh giới ngày/tuần

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Clock test và múi giờ đã thống nhất
- **Thực hiện:** Tạo hoạt động sát 00:00 và đầu tuần; đổi thời gian test qua mốc
- **Mong đợi:** Hoạt động thuộc đúng kỳ; số cũ không mang sang sai; ghi rõ múi giờ trong bằng chứng.
- **Trạng thái:** Chưa chạy.

#### PROGRESS-008 · P1 · Kết quả gần đây

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 có graded,submitted,in_progress
- **Thực hiện:** Mở home và activities; bấm kết quả
- **Mong đợi:** Danh sách đúng trạng thái được hỗ trợ; route dùng attemptId; chưa chấm không hiển thị 0% giả.
- **Trạng thái:** Chưa chạy.

#### PROGRESS-009 · P1 · Gợi ý cá nhân hóa

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 mục tiêu C1,yếu topic T1; L2 mục tiêu khác
- **Thực hiện:** GET recommendations và mở UI từng learner
- **Mong đợi:** Gợi ý liên quan profile/goals/performance; không rò thông tin L1 sang L2.
- **Trạng thái:** Chưa chạy.

#### PROGRESS-010 · P1 · AI không khả dụng

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Mock provider timeout/trả JSON sai; không dùng khóa thật
- **Thực hiện:** Gọi recommendations
- **Mong đợi:** Fallback hoặc lỗi có kiểm soát; dashboard vẫn dùng được; không hiển thị raw prompt/secret.
- **Trạng thái:** Chưa chạy.

#### PROGRESS-011 · P1 · Gợi ý self/smart

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 lần lượt có learningPathMode self,smart
- **Thực hiện:** Mở home hai nền tảng
- **Mong đợi:** Trạng thái hiển thị phù hợp mode; URL gợi ý giữ bộ lọc và mở route có thật.
- **Trạng thái:** Chưa chạy.

#### PROGRESS-012 · P0 · Quyền đọc progress người khác

- **Nền tảng:** API; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1; staff có/không reports:read
- **Thực hiện:** GET progress/learners/L2 bằng mỗi token
- **Mong đợi:** L1 và staff thiếu quyền bị chặn; người đủ quyền xem đúng L2.
- **Trạng thái:** Chưa chạy.

### REPORT — Quản trị kết quả và báo cáo

#### REPORT-001 · P0 · Số liệu dashboard

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** Dataset QA biết số users/attempt/progress
- **Thực hiện:** Mở analytics/dashboard và UI quản trị; đối chiếu truy vấn DB chỉ đọc
- **Mong đợi:** Số liệu cùng định nghĩa, cùng kỳ; không cộng bản ghi soft-delete sai quy tắc.
- **Trạng thái:** Chưa chạy.

#### REPORT-002 · P1 · Danh sách học viên

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** L1,L2 khác domain/career/certificate
- **Thực hiện:** Mở students; tìm/lọc; mở chi tiết
- **Mong đợi:** Kết quả đúng người và mục tiêu; pagination đúng tổng.
- **Trạng thái:** Chưa chạy.

#### REPORT-003 · P0 · Kết quả bài thi quản trị

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** ADMIN/staff có exams:grade
- **Thực hiện:** Mở test-results; lọc; mở attempt cụ thể
- **Mong đợi:** Điểm, trạng thái, learner và snapshot khớp kết quả learner.
- **Trạng thái:** Chưa chạy.

#### REPORT-004 · P1 · Báo cáo theo lĩnh vực

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** D1 có learners; D2 rỗng
- **Thực hiện:** Mở reports/domain/D1 và D2
- **Mong đợi:** D1 tính đúng từ fixture; D2 hiển thị 0/empty, không lỗi chia 0.
- **Trạng thái:** Chưa chạy.

#### REPORT-005 · P1 · Tổng quan tiến độ

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** Learners ở nhiều mức hoàn thành
- **Thực hiện:** Mở progress-overview; đối chiếu dữ liệu từng learner
- **Mong đợi:** Completion, điểm trung bình, tổng learner đúng định nghĩa; không trộn score và completion.
- **Trạng thái:** Chưa chạy.

#### REPORT-006 · P1 · Xuất Excel

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** Báo cáo có tiếng Việt và bộ lọc đang chọn
- **Thực hiện:** Xuất file; mở bằng Excel; so bảng UI
- **Mong đợi:** File đọc được; cột, Unicode, số và dữ liệu phù hợp phạm vi xuất được mô tả trên UI.
- **Trạng thái:** Chưa chạy.

#### REPORT-007 · P0 · Quyền báo cáo

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** Role thiếu reports:read/exams:grade
- **Thực hiện:** Mở URL trực tiếp và gọi API từng loại
- **Mong đợi:** Thiếu quyền tương ứng bị chặn; không tải dữ liệu rồi chỉ ẩn UI.
- **Trạng thái:** Chưa chạy.

#### REPORT-008 · P1 · Báo cáo rỗng/lỗi API

- **Nền tảng:** API; Web admin
- **Điều kiện/dữ liệu:** Dataset rỗng; giả lập 500
- **Thực hiện:** Mở báo cáo; retry
- **Mong đợi:** Empty/error rõ; không hiển thị số mẫu như dữ liệu thật; không cho xuất file sai im lặng.
- **Trạng thái:** Chưa chạy.

### NOTIFY — Nhắc học và thông báo

#### NOTIFY-001 · P1 · Bật nhắc học

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** L1; thiết bị thật bản build có notifications
- **Thực hiện:** Bật nhắc với giờ sắp tới; cấp quyền; đợi tới giờ
- **Mong đợi:** Lưu giờ/enabled; thông báo đến đúng người và lịch; chạm mở đúng màn.
- **Trạng thái:** Chưa chạy.

#### NOTIFY-002 · P0 · Tắt nhắc học

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** L1 đã lên lịch
- **Thực hiện:** Tắt trên mobile; lưu; mở web; đợi tới giờ cũ
- **Mong đợi:** enabled=false đồng bộ; lịch local cũ bị hủy; sửa hồ sơ không tự bật lại.
- **Trạng thái:** Chưa chạy.

#### NOTIFY-003 · P1 · Đổi giờ nhắc

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** Có lịch cũ
- **Thực hiện:** Đổi giờ hai lần; liệt kê lịch trên thiết bị
- **Mong đợi:** Chỉ lịch cuối còn hiệu lực; không tạo nhiều thông báo cùng ngày.
- **Trạng thái:** Chưa chạy.

#### NOTIFY-004 · P1 · Từ chối quyền/Expo Go

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** Thiết bị không cấp permission hoặc Expo Go
- **Thực hiện:** Bật nhắc; lưu hồ sơ
- **Mong đợi:** Không crash; không tuyên bố đã nhận push khi nền tảng không hỗ trợ; hồ sơ vẫn lưu được.
- **Trạng thái:** Chưa chạy.

#### NOTIFY-005 · P0 · Token subscription hợp lệ và trùng

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** L1; token test
- **Thực hiện:** POST cùng token hai lần; DELETE; gọi DELETE lần nữa
- **Mong đợi:** Không nhân đôi subscription; unsubscribe đúng token; thao tác lặp không lỗi 500.
- **Trạng thái:** Chưa chạy.

#### NOTIFY-006 · P1 · Token/platform sai

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** L1
- **Thực hiện:** Gửi token rỗng hoặc >4096 ký tự; platform desktop
- **Mong đợi:** API từ chối; không ghi subscription sai.
- **Trạng thái:** Chưa chạy.

#### NOTIFY-007 · P0 · Đổi tài khoản trên cùng thiết bị

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** L1 đăng ký token; logout; L2 login
- **Thực hiện:** Đăng ký token cho L2; phát thông báo test cho L1/L2
- **Mong đợi:** Không gửi thông tin cá nhân L1 cho L2; quyền sở hữu token và lịch được xử lý đúng.
- **Trạng thái:** Chưa chạy.

### UI — Giao diện và đồng bộ nền tảng

#### UI-001 · P0 · Điều hướng chính

- **Nền tảng:** Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 có dữ liệu
- **Thực hiện:** Đi Home→Bài học→Chứng chỉ→Tiến độ→Cá nhân; Back; mở deep link
- **Mong đợi:** Mọi màn đúng nội dung; tab chọn đúng; không route trắng hoặc vòng lặp redirect.
- **Trạng thái:** Chưa chạy.

#### UI-002 · P1 · Menu dư và chức năng bị thiếu

- **Nền tảng:** Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Web learner làm chuẩn chức năng
- **Thực hiện:** So từng màn tương ứng mobile; kiểm tab và menu Cá nhân
- **Mong đợi:** Bài học/Chứng chỉ không lặp không cần thiết trong Cá nhân; chức năng học chính vẫn tiếp cận được.
- **Trạng thái:** Chưa chạy.

#### UI-003 · P1 · Safe area và màn nhỏ

- **Nền tảng:** Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Android có navigation bar; iPhone có notch
- **Thực hiện:** Mở màn chính/form/quiz; bật keyboard; xoay màn nếu hỗ trợ
- **Mong đợi:** Không che header/nút lưu; nội dung cuộn được; không tràn ngang ngoài vùng code/bảng.
- **Trạng thái:** Chưa chạy.

#### UI-004 · P1 · Chữ dài và cỡ chữ lớn

- **Nền tảng:** Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Tên 100 ký tự; title dài; font hệ thống 150–200%
- **Thực hiện:** Mở home,profile,list,quiz
- **Mong đợi:** Nội dung đọc được; không chồng chữ hoặc che nút; truncation có thể mở xem đầy đủ.
- **Trạng thái:** Chưa chạy.

#### UI-005 · P1 · Trạng thái tải/rỗng/lỗi

- **Nền tảng:** Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Mock slow,empty,500 cho từng màn chính
- **Thực hiện:** Mở màn; retry; đổi tab trong lúc tải
- **Mong đợi:** Không loading vô hạn; không render dữ liệu cũ của người khác; retry hoạt động.
- **Trạng thái:** Chưa chạy.

#### UI-006 · P1 · Keyboard và accessibility web

- **Nền tảng:** Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Chỉ bàn phím; screen reader
- **Thực hiện:** Tab qua login,form,bộ lọc,dialog,quiz; Enter/Escape
- **Mong đợi:** Có label/focus rõ; thứ tự hợp lý; dialog không làm mất focus; thông báo lỗi được nhận biết.
- **Trạng thái:** Chưa chạy.

#### UI-007 · P1 · Accessibility mobile

- **Nền tảng:** Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** TalkBack/VoiceOver
- **Thực hiện:** Đọc tab,icon button,flashcard,radio đáp án,nút submit
- **Mong đợi:** Control có tên và trạng thái; thao tác thực hiện được không chỉ dựa vào màu.
- **Trạng thái:** Chưa chạy.

#### UI-008 · P0 · API URL trên thiết bị

- **Nền tảng:** Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Điện thoại cùng LAN; API test chạy
- **Thực hiện:** Mở app dùng EXPO_PUBLIC_API_URL; login và tải lesson
- **Mong đợi:** Thiết bị truy cập được host API; không dùng localhost điện thoại nhầm server; lỗi mạng nêu rõ.
- **Trạng thái:** Chưa chạy.

#### UI-009 · P1 · Metro không quét bản dependency cũ

- **Nền tảng:** Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** Có node_modules_old và .pnpm-store
- **Thực hiện:** Chạy pnpm --filter mobile dev; xem log
- **Mong đợi:** Metro loại thư mục cũ/cache; dependency node_modules/.pnpm vẫn resolve; ghi Blocked nếu giới hạn watcher hệ điều hành chưa đủ.
- **Trạng thái:** Chưa chạy.

#### UI-010 · P1 · Cache khi chuyển tài khoản

- **Nền tảng:** Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 có progress; L2 chưa học
- **Thực hiện:** Logout L1; login L2; quay lại từng tab
- **Mong đợi:** Không lóe dữ liệu L1; mỗi request lấy đúng session L2.
- **Trạng thái:** Chưa chạy.

### SEC — Bảo mật và tính toàn vẹn

#### SEC-001 · P0 · IDOR toàn bộ dữ liệu cá nhân

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** L1,L2; IDs của L2
- **Thực hiện:** Thay ID trong profile,attempt,progress,subscription và route cá nhân liên quan
- **Mong đợi:** Không đọc/ghi tài nguyên L2 khi thiếu quyền; 403/404 và không thay đổi DB.
- **Trạng thái:** Chưa chạy.

#### SEC-002 · P0 · JWT giả mạo

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** Token hết hạn, sửa payload/signature,sai định dạng
- **Thực hiện:** Gọi mọi nhóm API bảo vệ bằng từng token
- **Mong đợi:** Không truy cập được; không lỗi 500; server không tin role từ payload chưa xác minh.
- **Trạng thái:** Chưa chạy.

#### SEC-003 · P0 · Lộ dữ liệu nhạy cảm

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** ADMIN và L1; có lỗi test
- **Thực hiện:** Kiểm response auth/users/reports,console,server log và bundle client
- **Mong đợi:** Không chứa password/hash,refresh token ngoài kênh dự kiến,SMTP/DB/AI secrets hoặc dữ liệu learner không được phép.
- **Trạng thái:** Chưa chạy.

#### SEC-004 · P0 · XSS nội dung học

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** Fixture title/bio/lesson có script và HTML event handler
- **Thực hiện:** Lưu qua API test; mở admin/web learner/mobile renderer
- **Mong đợi:** Không thực thi script không tin cậy; nội dung hiển thị an toàn; không đánh cắp phiên.
- **Trạng thái:** Chưa chạy.

#### SEC-005 · P1 · Injection và input lớn

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** Search và ID chứa ký tự đặc biệt; JSON sai
- **Thực hiện:** Gửi chuỗi SQL-like vô hại,UUID sai,limit âm/khổng lồ,JSON hỏng
- **Mong đợi:** Không thực thi dữ liệu như truy vấn; lỗi 4xx có kiểm soát; không trả toàn bộ DB hoặc stack.
- **Trạng thái:** Chưa chạy.

#### SEC-006 · P0 · Endpoint public lộ draft/đáp án

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** Có content draft và exam chưa làm
- **Thực hiện:** GET list/detail lesson,vocabulary,question,exam bằng guest và L1
- **Mong đợi:** Chỉ trả dữ liệu được phép; không lộ isCorrect/answer trước thời điểm được phép.
- **Trạng thái:** Chưa chạy.

#### SEC-007 · P1 · Upload giả MIME

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** File văn bản khai image/png
- **Thực hiện:** Upload qua multipart và base64 vào môi trường test
- **Mong đợi:** Không phục vụ nội dung thực thi như tài sản tin cậy; báo lỗi đọc ảnh hoặc xử lý an toàn.
- **Trạng thái:** Chưa chạy.

#### SEC-008 · P1 · Chống dò mật khẩu/OTP

- **Nền tảng:** API; Web; Android; iOS
- **Điều kiện/dữ liệu:** Môi trường riêng; giới hạn request đã phê duyệt
- **Thực hiện:** Gửi chuỗi yêu cầu login/reset sai trong mức tải test
- **Mong đợi:** Ghi nhận cơ chế hạn chế; nếu chưa có thì đánh dấu Gap cần quyết định, không giả định có rate limiting.
- **Trạng thái:** Chưa chạy.

### OPS — Vận hành và phi chức năng

#### OPS-001 · P0 · Build và typecheck

- **Nền tảng:** API; Web; Android; iOS; Database
- **Điều kiện/dữ liệu:** Checkout và dependencies đúng lockfile; env test
- **Thực hiện:** Chạy typecheck packages/mobile/web và build API theo scripts hiện có
- **Mong đợi:** Lệnh exit 0; không coi typecheck là bằng chứng E2E.
- **Trạng thái:** Chưa chạy.

#### OPS-002 · P0 · Migration trên DB sạch

- **Nền tảng:** API; Web; Android; iOS; Database
- **Điều kiện/dữ liệu:** Database test dùng riêng; có backup nếu cần
- **Thực hiện:** Apply migrations vào DB trống; seed test; chạy smoke
- **Mong đợi:** Schema tạo thành công; seed nhất quán; login/học/nộp bài hoạt động.
- **Trạng thái:** Chưa chạy.

#### OPS-003 · P0 · Migration nâng cấp

- **Nền tảng:** API; Web; Android; iOS; Database
- **Điều kiện/dữ liệu:** Bản sao DB test phiên bản trước có dữ liệu
- **Thực hiện:** Backup; apply migration; kiểm số lượng và khóa ngoại
- **Mong đợi:** Không mất dữ liệu ngoài thay đổi được mô tả; schema mới tương thích API.
- **Trạng thái:** Chưa chạy.

#### OPS-004 · P1 · Hiệu năng danh sách

- **Nền tảng:** API; Web; Android; iOS; Database
- **Điều kiện/dữ liệu:** 10000 bản ghi test; tải 20 user đồng thời; môi trường ghi rõ
- **Thực hiện:** Đo list lesson/users/questions trang đầu/cuối và bộ lọc trong 10 phút
- **Mong đợi:** Báo p50/p95/error rate; mục tiêu đề xuất p95<2s và lỗi<1%, chỉ kết luận SLA khi được chốt.
- **Trạng thái:** Chưa chạy.

#### OPS-005 · P1 · Hiệu năng dashboard/report

- **Nền tảng:** API; Web; Android; iOS; Database
- **Điều kiện/dữ liệu:** Dataset test lớn; query logging đã ẩn thông tin nhạy cảm
- **Thực hiện:** Đo thời gian và số query khi tăng learner 100→1000
- **Mong đợi:** Không phát sinh N+1 tăng tuyến tính không cần thiết; lưu số đo; ngân sách query cần chốt trước nghiệm thu.
- **Trạng thái:** Chưa chạy.

#### OPS-006 · P1 · API/DB gián đoạn

- **Nền tảng:** API; Web; Android; iOS; Database
- **Điều kiện/dữ liệu:** Môi trường test có quyền restart dịch vụ
- **Thực hiện:** Ngắt DB ngắn; gọi API; khôi phục; retry
- **Mong đợi:** Không lỗi treo vô hạn; phản hồi không lộ connection string; thao tác phục hồi không ghi trùng.
- **Trạng thái:** Chưa chạy.

#### OPS-007 · P0 · Restore dữ liệu

- **Nền tảng:** API; Web; Android; iOS; Database
- **Điều kiện/dữ liệu:** Backup QA chứa L1/attempt/progress; DB đích riêng
- **Thực hiện:** Restore; login và xem kết quả; đối chiếu record counts
- **Mong đợi:** Dữ liệu và quan hệ phục hồi đúng; ghi RPO/RTO đo được, không tự đặt đạt SLA.
- **Trạng thái:** Chưa chạy.

#### OPS-008 · P1 · Tương thích trình duyệt/thiết bị

- **Nền tảng:** API; Web; Android; iOS; Database
- **Điều kiện/dữ liệu:** Chrome,Firefox,Safari; Android/iOS được hỗ trợ
- **Thực hiện:** Chạy smoke trên từng cấu hình; ghi phiên bản và kích thước màn
- **Mong đợi:** Không lỗi chặn luồng chính; vấn đề đặc thù được ghi riêng từng nền tảng.
- **Trạng thái:** Chưa chạy.

### E2E — Luồng xuyên suốt toàn hệ thống

#### E2E-001 · P0 · Quản trị xuất bản đến học viên hoàn tất

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** ADMIN; LNEW; fixture QA riêng
- **Thực hiện:** ADMIN tạo lesson,question,exam thuộc C1 và liên kết T1; publish; LNEW đăng ký/onboarding; học lesson trên mobile; làm exam trên web; ADMIN xem report
- **Mong đợi:** Nội dung mới xuất hiện đúng người học; điểm và progress nhất quán; báo cáo phản ánh đúng hoạt động; không cần sửa DB thủ công để hoàn thành luồng.
- **Trạng thái:** Chưa chạy.

#### E2E-002 · P0 · Web-mobile cùng một hành trình

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 mới chọn both,C1,D1
- **Thực hiện:** Web lưu mục tiêu và tắt nhắc; mobile sửa tên; học từ; web tiếp tục lesson; mobile nộp exam; web xem kết quả
- **Mong đợi:** Không mất mục tiêu/lĩnh vực hoặc bật nhắc trở lại; lịch sử từ,lesson,attempt và kết quả đúng một tài khoản.
- **Trạng thái:** Chưa chạy.

#### E2E-003 · P0 · Thu hồi quyền trong lúc thao tác

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** TEACHER đang mở editor; ADMIN quản lý role
- **Thực hiện:** ADMIN thu quyền sửa nội dung; TEACHER gửi form cũ; login lại và thử URL trực tiếp
- **Mong đợi:** Server từ chối theo chính sách phiên/quyền; nội dung không bị ghi trái phép; UI phản ánh quyền mới.
- **Trạng thái:** Chưa chạy.

#### E2E-004 · P0 · Nội dung thay đổi trong lúc làm bài

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 bắt đầu exam C1; ADMIN mở builder
- **Thực hiện:** ADMIN sửa đề; L1 mất mạng rồi kết nối lại và nộp; xem learner result và admin result
- **Mong đợi:** Cả hai kết quả cùng snapshot; chỉ một lần chấm; không dùng đáp án mới để chấm lượt cũ.
- **Trạng thái:** Chưa chạy.

#### E2E-005 · P0 · Khóa người dùng khi đang học

- **Nền tảng:** API; Web admin; Web learner; Android; iOS
- **Điều kiện/dữ liệu:** L1 có phiên web/mobile và attempt; ADMIN
- **Thực hiện:** ADMIN suspend L1; trên hai client thử lưu profile,start,submit; ADMIN activate; L1 login lại
- **Mong đợi:** Các request sau khóa bị chặn; dữ liệu trước khóa không hỏng; sau kích hoạt luồng phục hồi rõ, không tự tạo attempt/điểm trùng.
- **Trạng thái:** Chưa chạy.

## Thực thi và tiêu chí kết thúc

1. Chuẩn bị fixture và xác nhận môi trường; chạy các kiểm tra build/typecheck/test hiện có theo package.json.
2. Chạy smoke: AUTH-001, AUTH-005, RBAC-002, PROFILE-001, PROFILE-005, LESSON-009, VOC-003, EXAM-005, EXAM-009, EXAM-015, PROGRESS-002, NOTIFY-002, UI-001.
3. Chạy toàn bộ P0; sau đó P1 và các biến thể nền tảng/dữ liệu. Lặp test bảo mật cho mọi route tương ứng trong inventory, không chỉ một ví dụ.
4. Lưu từng lần chạy trong execution-results.csv; đính request/response đã che token, screenshot/video, DB query chỉ đọc hoặc log phù hợp.
5. Khi có lỗi: tạo bug, ghi actual khác expected, gắn evidence; sau sửa chạy lại case lỗi và regression liên quan.
6. Nghiệm thu khi mọi P0 qua, không còn lỗi nghiêm trọng mở, các P1/Blocked có quyết định rõ ràng; SLA hiệu năng và chính sách chưa chốt không tự coi là Pass.

## Khoảng trống/rủi ro phải kiểm tra trực tiếp

- Placement hiện tính trên số câu được gửi, có nguy cơ đạt level cao bằng một câu; PLACE-006 phải chốt yêu cầu số câu tối thiểu.
- Phải kiểm tra server xử lý expiresAt của exam, không suy ra từ countdown phía UI.
- Một số body controller dùng kiểu inline/any: cần chạy payload sai cho vocab-study, learner-groups, placement và content-links.
- Quyền nhóm dùng users:update trong khi quản lý users dùng users:manage; không gộp hai quyền trong test.
- Hiện có unit test ở API và shared-kernel; bộ tài liệu này không bổ sung hoặc giả định đã có automation E2E toàn hệ thống.
- Mobile/web không cần bố cục pixel giống nhau; cần tương đương chức năng, dữ liệu, trạng thái và điều hướng.
