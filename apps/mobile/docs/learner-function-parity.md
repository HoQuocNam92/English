# Đối chiếu chức năng học viên web và mobile

Phạm vi: học viên; không gồm admin/giảng viên. Đếm **57 luồng sử dụng** trong 7 nhóm. Một luồng có thể gồm nhiều trường hoặc nút; không đếm lại route chuyển hướng, màn hình trùng hoặc cùng chức năng xuất hiện ở nhiều nơi. Đây là quy ước kiểm kê để so sánh, không phải số lượng endpoint.

| Nhóm | Số luồng |
|---|---:|
| Tài khoản | 7 |
| Mục tiêu và lộ trình | 8 |
| Bài học | 10 |
| Từ vựng | 16 |
| Luyện thi chứng chỉ | 8 |
| Hồ sơ và tiến độ | 6 |
| Thông tin | 2 |
| **Tổng** | **57** |

## Bảng đối chiếu

“Có” nghĩa là đã có đường thao tác và gọi API trong mã mobile; không đồng nghĩa đã kiểm thử trên thiết bị thật hoặc với mọi dữ liệu sản xuất.

| ID | Chức năng | Web | Mobile | Triển khai |
|---|---|---|---|---|
| L01 | Đăng ký tài khoản | `/login, /register, /forgot-password, /reset-password` | `(auth)` | Có |
| L02 | Đăng nhập email và mật khẩu | `/login, /register, /forgot-password, /reset-password` | `(auth)` | Có |
| L03 | Đăng nhập Google | `/login, /register, /forgot-password, /reset-password` | `(auth)` | Có |
| L04 | Gửi liên kết quên mật khẩu | `/login, /register, /forgot-password, /reset-password` | Đã bỏ theo yêu cầu | Không triển khai trên mobile |
| L05 | Đặt lại mật khẩu bằng liên kết/token | `/login, /register, /forgot-password, /reset-password` | Đã bỏ theo yêu cầu | Không triển khai trên mobile |
| L06 | Khôi phục phiên đăng nhập | `/login, /register, /forgot-password, /reset-password` | `(auth)` | Có |
| L07 | Đăng xuất | `/login, /register, /forgot-password, /reset-password` | `(auth)` | Có |
| L08 | Chọn mục tiêu học tập | `/onboarding, /onboarding/placement-test, /learn, /learn/plan` | `(onboarding), placement-test, (tabs)/home, learning-plan` | Có |
| L09 | Chọn lĩnh vực và trình độ | `/onboarding, /onboarding/placement-test, /learn, /learn/plan` | `(onboarding), placement-test, (tabs)/home, learning-plan` | Có |
| L10 | Chọn chứng chỉ và nghề nghiệp mục tiêu | `/onboarding, /onboarding/placement-test, /learn, /learn/plan` | `(onboarding), placement-test, (tabs)/home, learning-plan` | Có |
| L11 | Thiết lập chỉ tiêu học ngày/tuần và giờ nhắc | `/onboarding, /onboarding/placement-test, /learn, /learn/plan` | `(onboarding), placement-test, (tabs)/home, learning-plan` | Có |
| L12 | Đánh giá trình độ đầu vào và xem lời giải | `/onboarding, /onboarding/placement-test, /learn, /learn/plan` | `(onboarding), placement-test, (tabs)/home, learning-plan` | Có |
| L13 | Xem lộ trình và kế hoạch bốn tuần đã lưu | `/onboarding, /onboarding/placement-test, /learn, /learn/plan` | `(onboarding), placement-test, (tabs)/home, learning-plan` | Có |
| L14 | Tối ưu lộ trình bằng AI | `/onboarding, /onboarding/placement-test, /learn, /learn/plan` | `(onboarding), placement-test, (tabs)/home, learning-plan` | Có |
| L15 | Lịch học hôm nay/tháng/năm và mở nhiệm vụ | `/onboarding, /onboarding/placement-test, /learn, /learn/plan` | `(onboarding), placement-test, (tabs)/home, learning-plan` | Có |
| L16 | Danh mục chuyên đề và tìm kiếm | `/learn/catalog, /learn/lessons, /learn/lessons/[id]` | `catalog, lessons/index, lessons/[id]` | Có |
| L17 | Tìm bài học; lọc lộ trình/lĩnh vực/chứng chỉ/từ vựng; xóa bộ lọc | `/learn/catalog, /learn/lessons, /learn/lessons/[id]` | `catalog, lessons/index, lessons/[id]` | Có |
| L18 | Học thuật ngữ chuyên ngành | `/learn/catalog, /learn/lessons, /learn/lessons/[id]` | `catalog, lessons/index, lessons/[id]` | Có |
| L19 | Học đọc hiểu kỹ thuật | `/learn/catalog, /learn/lessons, /learn/lessons/[id]` | `catalog, lessons/index, lessons/[id]` | Có |
| L20 | Học tài liệu API | `/learn/catalog, /learn/lessons, /learn/lessons/[id]` | `catalog, lessons/index, lessons/[id]` | Có |
| L21 | Học thiết kế hệ thống | `/learn/catalog, /learn/lessons, /learn/lessons/[id]` | `catalog, lessons/index, lessons/[id]` | Có |
| L22 | Học case study | `/learn/catalog, /learn/lessons, /learn/lessons/[id]` | `catalog, lessons/index, lessons/[id]` | Có |
| L23 | Đánh dấu bài học hoàn thành | `/learn/catalog, /learn/lessons, /learn/lessons/[id]` | `catalog, lessons/index, lessons/[id]` | Có |
| L24 | Tự trả lời rồi đối chiếu gợi ý trong bài | `/learn/catalog, /learn/lessons, /learn/lessons/[id]` | `catalog, lessons/index, lessons/[id]` | Có |
| L25 | Dịch văn bản theo ngữ cảnh và phát âm | `/learn/catalog, /learn/lessons, /learn/lessons/[id]` | `catalog, lessons/index, lessons/[id]` | Có |
| L26 | Thống kê đã học/đã nhớ/đến hạn và lịch hoạt động | `/learn/flashcards, /learn/flashcards/explore, /learn/flashcards/[id]/practice, /learn/flashcards/[id]/quiz` | `flashcards/dashboard, explore, words, index, history` | Có |
| L27 | Khám phá nhóm từ: tìm kiếm, lĩnh vực, trình độ, xóa bộ lọc | `/learn/flashcards, /learn/flashcards/explore, /learn/flashcards/[id]/practice, /learn/flashcards/[id]/quiz` | `flashcards/dashboard, explore, words, index, history` | Có |
| L28 | Xem danh sách từ, tìm kiếm và phân trang | `/learn/flashcards, /learn/flashcards/explore, /learn/flashcards/[id]/practice, /learn/flashcards/[id]/quiz` | `flashcards/dashboard, explore, words, index, history` | Có |
| L29 | Lật flashcard xem nghĩa Anh/Việt và IPA | `/learn/flashcards, /learn/flashcards/explore, /learn/flashcards/[id]/practice, /learn/flashcards/[id]/quiz` | `flashcards/dashboard, explore, words, index, history` | Có |
| L30 | Phát âm từ vựng | `/learn/flashcards, /learn/flashcards/explore, /learn/flashcards/[id]/practice, /learn/flashcards/[id]/quiz` | `flashcards/dashboard, explore, words, index, history` | Có |
| L31 | Xem ví dụ và tô đậm từ đang học | `/learn/flashcards, /learn/flashcards/explore, /learn/flashcards/[id]/practice, /learn/flashcards/[id]/quiz` | `flashcards/dashboard, explore, words, index, history` | Có |
| L32 | Chỉ học từ mới và giới hạn từ theo bài/chủ đề | `/learn/flashcards, /learn/flashcards/explore, /learn/flashcards/[id]/practice, /learn/flashcards/[id]/quiz` | `flashcards/dashboard, explore, words, index, history` | Có |
| L33 | Đánh giá dễ/trung bình/khó/đã biết và chuyển thẻ | `/learn/flashcards, /learn/flashcards/explore, /learn/flashcards/[id]/practice, /learn/flashcards/[id]/quiz` | `flashcards/dashboard, explore, words, index, history` | Có |
| L34 | Ôn các từ đến hạn | `/learn/flashcards, /learn/flashcards/explore, /learn/flashcards/[id]/practice, /learn/flashcards/[id]/quiz` | `flashcards/dashboard, explore, words, index, history` | Có |
| L35 | Bật/tắt phát âm tự động | `/learn/flashcards, /learn/flashcards/explore, /learn/flashcards/[id]/practice, /learn/flashcards/[id]/quiz` | `flashcards/dashboard, explore, words, index, history` | Có |
| L36 | Xem các từ đánh dấu đã biết trong phiên | `/learn/flashcards, /learn/flashcards/explore, /learn/flashcards/[id]/practice, /learn/flashcards/[id]/quiz` | `flashcards/dashboard, explore, words, index, history` | Có |
| L37 | Kiểm tra sau khi học: sai lặp lại, đúng loại khỏi hàng đợi | `/learn/flashcards, /learn/flashcards/explore, /learn/flashcards/[id]/practice, /learn/flashcards/[id]/quiz` | `flashcards/dashboard, explore, words, index, history` | Có |
| L38 | Giải thích đáp án và điều hướng trước/tiếp tục | `/learn/flashcards, /learn/flashcards/explore, /learn/flashcards/[id]/practice, /learn/flashcards/[id]/quiz` | `flashcards/dashboard, explore, words, index, history` | Có |
| L39 | Lịch sử từ đã học: thời gian, độ khó, số dòng và phân trang | `/learn/flashcards, /learn/flashcards/explore, /learn/flashcards/[id]/practice, /learn/flashcards/[id]/quiz` | `flashcards/dashboard, explore, words, index, history` | Có |
| L40 | Chủ động kiểm tra lại những từ đã học | `/learn/flashcards, /learn/flashcards/explore, /learn/flashcards/[id]/practice, /learn/flashcards/[id]/quiz` | `flashcards/dashboard, explore, words, index, history` | Có |
| L41 | Tổng kết phiên và tiếp tục học | `/learn/flashcards, /learn/flashcards/explore, /learn/flashcards/[id]/practice, /learn/flashcards/[id]/quiz` | `flashcards/dashboard, explore, words, index, history` | Có |
| L42 | Tìm chứng chỉ và lọc theo tiến độ | `/learn/certifications, /learn/certifications/[id], /learn/certifications/[id]/topics/[topicId], /learn/quiz/[id], /learn/quiz/result/[id]` | `certifications/index, [id], topics/[id], quiz/[id], test-result/[id]` | Có |
| L43 | Xem lộ trình/domain/topic và tiến độ chứng chỉ | `/learn/certifications, /learn/certifications/[id], /learn/certifications/[id]/topics/[topicId], /learn/quiz/[id], /learn/quiz/result/[id]` | `certifications/index, [id], topics/[id], quiz/[id], test-result/[id]` | Có |
| L44 | Học bài kiến thức của topic | `/learn/certifications, /learn/certifications/[id], /learn/certifications/[id]/topics/[topicId], /learn/quiz/[id], /learn/quiz/result/[id]` | `certifications/index, [id], topics/[id], quiz/[id], test-result/[id]` | Có |
| L45 | Mở quiz khi hoàn thành bài kiến thức; không mở đề rỗng | `/learn/certifications, /learn/certifications/[id], /learn/certifications/[id]/topics/[topicId], /learn/quiz/[id], /learn/quiz/result/[id]` | `certifications/index, [id], topics/[id], quiz/[id], test-result/[id]` | Có |
| L46 | Trả lời chọn một/chọn nhiều/đúng-sai/trả lời ngắn và xem ngữ cảnh | `/learn/certifications, /learn/certifications/[id], /learn/certifications/[id]/topics/[topicId], /learn/quiz/[id], /learn/quiz/result/[id]` | `certifications/index, [id], topics/[id], quiz/[id], test-result/[id]` | Có |
| L47 | Chọn nhanh câu hỏi, trước/sau và giữ đáp án | `/learn/certifications, /learn/certifications/[id], /learn/certifications/[id]/topics/[topicId], /learn/quiz/[id], /learn/quiz/result/[id]` | `certifications/index, [id], topics/[id], quiz/[id], test-result/[id]` | Có |
| L48 | Đếm thời gian, khôi phục lượt thi và nộp bài | `/learn/certifications, /learn/certifications/[id], /learn/certifications/[id]/topics/[topicId], /learn/quiz/[id], /learn/quiz/result/[id]` | `certifications/index, [id], topics/[id], quiz/[id], test-result/[id]` | Có |
| L49 | Xem điểm/đạt/không đạt/lời giải; quay về chứng chỉ/topic | `/learn/certifications, /learn/certifications/[id], /learn/certifications/[id]/topics/[topicId], /learn/quiz/[id], /learn/quiz/result/[id]` | `certifications/index, [id], topics/[id], quiz/[id], test-result/[id]` | Có |
| L50 | Xem và chỉnh sửa thông tin cá nhân | `/learn/profile, /learn/progress` | `(tabs)/profile, (tabs)/progress, profile/edit, history, change-password` | Có |
| L51 | Cập nhật mục tiêu học tập | `/learn/profile, /learn/progress` | `(tabs)/profile, (tabs)/progress, profile/edit, history, change-password` | Có |
| L52 | Đổi mật khẩu khi đã đăng nhập | `/learn/profile, /learn/progress` | `(tabs)/profile, (tabs)/progress, profile/edit, history, change-password` | Có |
| L53 | Xem tiến độ và các mốc học tập | `/learn/profile, /learn/progress` | `(tabs)/profile, (tabs)/progress, profile/edit, history, change-password` | Có |
| L54 | Lịch sử bài học và kết quả bài thi | `/learn/profile, /learn/progress` | `(tabs)/profile, (tabs)/progress, profile/edit, history, change-password` | Có |
| L55 | Quyền thông báo và nhắc học theo giờ | `/learn/profile, /learn/progress` | `(tabs)/profile, (tabs)/progress, profile/edit, history, change-password` | Có |
| L56 | Đọc chính sách bảo mật | `/privacy, /terms` | `privacy, terms` | Có |
| L57 | Đọc điều khoản sử dụng | `/privacy, /terms` | `privacy, terms` | Có |

## Giới hạn kiểm chứng

- Google OAuth, thiết bị phát âm, long-press và quyền thông báo cần kiểm thử Android/iOS thật. Kiểm tra Expo web không xác nhận hoạt động của hệ điều hành native.
- Mobile đã bỏ luồng quên/đặt lại mật khẩu bằng liên kết email. Chính sách và điều khoản được mở từ Hồ sơ; màn hình chào chỉ còn đăng nhập và đăng ký.
- Các route từ vựng cũ của web đã chuyển sang `/session` với `sourceLessonId`, `reviewOnly` và `onlyNew`. Dừng phiên trở về danh sách; trạng thái SRS đã lưu qua `/rate` được giữ lại. Không gọi các endpoint đã bị xóa.
- Nội dung chính sách và logic lọc bài học dùng cùng nguồn trong `packages/shared-kernel/src`; style dùng design tokens và các control chung. Responsive giữ đủ thao tác nhưng bố cục thích ứng với màn hình, không áp vị trí trái/phải của desktop lên điện thoại.

## Kiểm tra đợt triển khai

- TypeScript web và mobile: đạt.
- Expo export Android và web: đạt.
- Kiểm tra trình duyệt Expo web ở 360/390/768px với API fixture: quiz lặp câu sai, lịch sử đáp án, khóa/mở quiz chứng chỉ, đặt lại mật khẩu, lọc bài học có phân trang, liên kết lịch sử, tối ưu AI, tab theo route, danh sách từ và giải thích quiz: đạt.
- Kiểm tra tràn ngang 13 màn hình ở ba kích thước: đạt.
- Chưa kiểm thử native Android/iOS thật; các giới hạn ở trên vẫn áp dụng.
