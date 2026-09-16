# CHƯƠNG 3. THIẾT KẾ HỆ THỐNG

## 3.1. GIỚI THIỆU

Chương này trình bày thiết kế cơ sở dữ liệu của hệ thống học tiếng Anh chuyên ngành Công nghệ thông tin. Nội dung được xây dựng từ `apps/api/prisma/schema.prisma` và đối chiếu với `database_schema.sql`, các migration cùng source code backend hiện tại. Thiết kế sử dụng PostgreSQL và được ánh xạ trong ứng dụng thông qua Prisma ORM.

Cơ sở dữ liệu được tổ chức theo các nhóm chức năng nhằm tách biệt dữ liệu tài khoản, nội dung học, khảo thí, tiến độ và các chức năng hỗ trợ. Do số lượng bảng tương đối lớn, chương sử dụng một sơ đồ tổng quan nhóm dữ liệu và các ERD chi tiết. Cách trình bày này giúp giữ khả năng đọc mà không làm mất các quan hệ vật lý cần thiết.

## 3.2. THIẾT KẾ CƠ SỞ DỮ LIỆU

### 3.2.1. Mô tả tổng quan cơ sở dữ liệu

Schema hiện tại khai báo 53 model tương ứng 53 bảng ứng dụng. Trong đó có 50 bảng nghiệp vụ hoặc hỗ trợ và 3 bảng kỹ thuật ứng dụng là `refresh_tokens`, `password_reset_tokens` và `progress_summary_cache`. Schema còn có 16 kiểu enum, 53 khóa chính, 71 khóa ngoại, 11 khóa chính ghép, 23 ràng buộc hoặc chỉ mục duy nhất ngoài khóa chính và không có `CHECK constraint`.

Bảng `_prisma_migrations` không xuất hiện trong Prisma schema và file DDL hiện tại nên không được cộng vào 53 bảng. Nếu cơ sở dữ liệu đang chạy được tạo bằng Prisma Migrate thì bảng kỹ thuật này có thể tồn tại ở môi trường triển khai. Nội dung đó được đánh dấu **CẦN XÁC NHẬN** vì project không có file backup hoặc kết nối cơ sở dữ liệu đang chạy để kiểm tra trực tiếp.

#### Bảng 3.1. Phân nhóm toàn bộ bảng

| Nhóm dữ liệu | Số bảng | Danh sách bảng |
|---|---:|---|
| Tài khoản và phân quyền | 8 | users, user_details, roles, permissions, role_permissions, user_roles, refresh_tokens, password_reset_tokens |
| Danh mục nền tảng | 5 | domains, levels, career_goals, certificates, certificate_domains |
| Hồ sơ và nhóm Học viên | 6 | learner_profiles, learner_profile_domains, learner_profile_career_goals, learner_certificate_goals, learner_groups, learner_group_members |
| Bài học, từ vựng và nội dung chứng chỉ | 7 | vocabularies, vocabulary_examples, lessons, lesson_sections, lesson_vocabularies, lesson_certificates, certification_contents |
| Câu hỏi và khảo thí | 8 | questions, question_options, question_certificates, exams, exam_questions, exam_attempts, attempt_answers, attempt_answer_options |
| Tiến độ và đề xuất | 4 | learning_progress, progress_summary_cache, recommendations, recommendation_feedbacks |
| Kế hoạch và khuyến khích học tập | 3 | learning_plan_items, user_streaks, user_badges |
| Thực hành có nhãn AI | 3 | mock_interviews, mock_interview_turns, writing_submissions |
| Cộng đồng | 3 | discussion_posts, discussion_comments, discussion_votes |
| Thông báo | 1 | notifications |
| Thanh toán và gói dịch vụ | 5 | payment_orders, user_subscriptions, plan_quotas, vouchers, flash_sales |
| **Tổng cộng** | **53** | Mỗi bảng được tính đúng một lần |

Ba bảng kỹ thuật ứng dụng vẫn được đặt trong nhóm gần nhất với mục đích sử dụng để tổng số bảng không bị tính lặp. `refresh_tokens` và `password_reset_tokens` thuộc nhóm tài khoản. `progress_summary_cache` thuộc nhóm tiến độ.

Hình 3.1 nên trình bày 11 nhóm dữ liệu và luồng liên kết chính giữa các nhóm. Chín ERD chi tiết được trình bày từ Hình 3.2 đến Hình 3.10. Một số bảng như `users`, `domains`, `levels` và `certificates` có thể được lặp lại trên nhiều hình làm điểm neo ngữ cảnh. Việc lặp trên hình không làm thay đổi cách kiểm đếm bảng tại Bảng 3.1.

### 3.2.2. Thiết kế dữ liệu theo nhóm chức năng

#### 3.2.2.1. Tài khoản và phân quyền

Nhóm này lưu tài khoản, thông tin cá nhân, vai trò, quyền và dữ liệu kỹ thuật của quá trình xác thực. `users` là bảng trung tâm. Thông tin cá nhân được tách sang `user_details` theo quan hệ một với không hoặc một. Quan hệ nhiều đối nhiều giữa người dùng và vai trò được triển khai bằng `user_roles`. Quan hệ nhiều đối nhiều giữa vai trò và quyền được triển khai bằng `role_permissions`.

##### Bảng 3.2. Cấu trúc bảng users

| Thuộc tính | Kiểu dữ liệu | Mô tả | Ràng buộc chính |
|---|---|---|---|
| id | UUID | Mã tài khoản | PK, NOT NULL |
| email | VARCHAR(254) | Email đăng nhập | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | Mật khẩu đã băm | NOT NULL |
| status | user_status | Trạng thái tài khoản | NOT NULL, mặc định active |
| created_at | TIMESTAMPTZ(6) | Thời điểm tạo | NOT NULL, mặc định CURRENT_TIMESTAMP |
| updated_at | TIMESTAMPTZ(6) | Thời điểm cập nhật | NOT NULL |

##### Bảng 3.3. Cấu trúc bảng user_details

| Thuộc tính | Kiểu dữ liệu | Mô tả | Ràng buộc chính |
|---|---|---|---|
| id | UUID | Mã thông tin cá nhân | PK, NOT NULL |
| user_id | UUID | Tài khoản sở hữu | FK đến users.id, NOT NULL, UNIQUE |
| display_name | VARCHAR(150) | Tên hiển thị | NOT NULL |
| avatar_url | VARCHAR(2048) | Địa chỉ ảnh đại diện | Cho phép NULL |
| phone_number | VARCHAR(20) | Số điện thoại | Cho phép NULL |
| date_of_birth | DATE | Ngày sinh | Cho phép NULL |
| gender | VARCHAR(20) | Giới tính | Cho phép NULL |
| bio | VARCHAR(500) | Giới thiệu | Cho phép NULL |
| timezone | VARCHAR(50) | Múi giờ | Cho phép NULL, mặc định Asia/Ho_Chi_Minh |
| locale | VARCHAR(10) | Ngôn ngữ hiển thị | Cho phép NULL, mặc định vi |
| last_login_at | TIMESTAMPTZ(6) | Lần đăng nhập gần nhất | Cho phép NULL |
| created_at | TIMESTAMPTZ(6) | Thời điểm tạo | NOT NULL, mặc định CURRENT_TIMESTAMP |
| updated_at | TIMESTAMPTZ(6) | Thời điểm cập nhật | NOT NULL |

`roles` và `permissions` dùng trường `code` duy nhất để nhận diện. `user_roles` có khóa chính ghép `(user_id, role_id)` và thêm các trường `assigned_at`, `assigned_by_id` để ghi nhận việc gán vai trò. `role_permissions` có khóa chính ghép `(role_id, permission_id)`. `refresh_tokens` và `password_reset_tokens` phục vụ xác thực, không phải dữ liệu nghiệp vụ mà người dùng thao tác trực tiếp.

#### 3.2.2.2. Danh mục, hồ sơ và nhóm Học viên

`domains`, `levels`, `career_goals` và `certificates` cung cấp danh mục dùng chung. `certificate_domains` triển khai quan hệ nhiều đối nhiều giữa chứng chỉ và lĩnh vực. `learner_profiles` liên kết duy nhất với `users` và bắt buộc tham chiếu một cấp độ. Lĩnh vực quan tâm và mục tiêu nghề nghiệp được lưu qua hai bảng nối. Mục tiêu chứng chỉ được lưu bằng bảng riêng do có thêm `target_date`. `learner_groups` liên kết với Giảng viên, lĩnh vực và chứng chỉ tùy chọn. Thành viên nhóm được quản lý qua `learner_group_members`.

##### Bảng 3.4. Cấu trúc bảng learner_profiles

| Thuộc tính | Kiểu dữ liệu | Mô tả | Ràng buộc chính |
|---|---|---|---|
| id | UUID | Mã hồ sơ học tập | PK, NOT NULL |
| user_id | UUID | Tài khoản Học viên | FK đến users.id, NOT NULL, UNIQUE |
| level_id | UUID | Cấp độ hiện tại | FK đến levels.id, NOT NULL |
| bio | VARCHAR(500) | Giới thiệu học tập | Cho phép NULL |
| weekly_study_target_minutes | INTEGER | Mục tiêu số phút học mỗi tuần | NOT NULL, mặc định 180 |
| onboarding_completed | BOOLEAN | Trạng thái hoàn tất thiết lập | NOT NULL, mặc định false |
| created_at | TIMESTAMPTZ(6) | Thời điểm tạo | NOT NULL, mặc định CURRENT_TIMESTAMP |
| updated_at | TIMESTAMPTZ(6) | Thời điểm cập nhật | NOT NULL |

`learner_certificate_goals` có khóa chính `id`, hai khóa ngoại `profile_id` và `certificate_id`, cùng ràng buộc duy nhất trên cặp hai trường này. `target_date` cho phép NULL. Nhờ đó một Học viên không thể tạo trùng cùng một mục tiêu chứng chỉ nhưng có thể chưa xác định ngày dự kiến.

#### 3.2.2.3. Bài học, từ vựng và nội dung chứng chỉ

`lessons` là bảng trung tâm của nội dung học tập. Mỗi bài học thuộc một lĩnh vực, một cấp độ và có một người tạo. Nội dung được chia thành các khối có thứ tự trong `lesson_sections`. Từ vựng được lưu trong `vocabularies`, còn câu ví dụ nằm trong `vocabulary_examples`. `lesson_vocabularies` và `lesson_certificates` triển khai các quan hệ nhiều đối nhiều. `certification_contents` lưu nội dung ôn tập theo chứng chỉ.

##### Bảng 3.5. Cấu trúc bảng lessons

| Thuộc tính | Kiểu dữ liệu | Mô tả | Ràng buộc chính |
|---|---|---|---|
| id | UUID | Mã bài học | PK, NOT NULL |
| title | VARCHAR(200) | Tiêu đề bài học | NOT NULL |
| slug | VARCHAR(220) | Đường dẫn định danh | NOT NULL, UNIQUE |
| summary | VARCHAR(1000) | Tóm tắt | NOT NULL |
| type | lesson_type | Loại bài học | NOT NULL |
| domain_id | UUID | Lĩnh vực | FK đến domains.id, NOT NULL |
| level_id | UUID | Cấp độ | FK đến levels.id, NOT NULL |
| estimated_minutes | INTEGER | Thời lượng dự kiến | NOT NULL |
| thumbnail_url | VARCHAR(2048) | Ảnh đại diện | Cho phép NULL |
| is_pro_only | BOOLEAN | Yêu cầu gói Pro | NOT NULL, mặc định false |
| status | content_status | Trạng thái nội dung | NOT NULL, mặc định draft |
| published_at | TIMESTAMPTZ(6) | Thời điểm xuất bản | Cho phép NULL |
| created_by_id | UUID | Người tạo | FK đến users.id, NOT NULL |
| created_at | TIMESTAMPTZ(6) | Thời điểm tạo | NOT NULL, mặc định CURRENT_TIMESTAMP |
| updated_at | TIMESTAMPTZ(6) | Thời điểm cập nhật | NOT NULL |

##### Bảng 3.6. Cấu trúc bảng vocabularies

| Thuộc tính | Kiểu dữ liệu | Mô tả | Ràng buộc chính |
|---|---|---|---|
| id | UUID | Mã từ vựng | PK, NOT NULL |
| term | VARCHAR(150) | Từ hoặc thuật ngữ | NOT NULL, UNIQUE cùng domain_id |
| pronunciation_ipa | VARCHAR(100) | Phiên âm IPA | Cho phép NULL |
| audio_url | VARCHAR(2048) | Địa chỉ âm thanh | Cho phép NULL |
| part_of_speech | VARCHAR(50) | Từ loại | Cho phép NULL |
| definition_en | VARCHAR(1000) | Định nghĩa tiếng Anh | NOT NULL |
| definition_vi | VARCHAR(1000) | Định nghĩa tiếng Việt | NOT NULL |
| tags | TEXT[] | Nhãn phân loại | Mặc định mảng rỗng |
| domain_id | UUID | Lĩnh vực | FK đến domains.id, NOT NULL |
| level_id | UUID | Cấp độ | FK đến levels.id, NOT NULL |
| status | content_status | Trạng thái nội dung | NOT NULL, mặc định draft |
| created_at | TIMESTAMPTZ(6) | Thời điểm tạo | NOT NULL, mặc định CURRENT_TIMESTAMP |
| updated_at | TIMESTAMPTZ(6) | Thời điểm cập nhật | NOT NULL |

`lesson_sections` chứa `content` kiểu JSONB và loại khối bằng enum `lesson_section_type`. Bảng này cho phép một bài học gồm nhiều dạng nội dung mà không phải tạo một bảng riêng cho từng dạng. `vocabulary_examples` là bảng phụ thuộc của `vocabularies`, trong đó `sentence_en` bắt buộc và `translation_vi` có thể để trống.

#### 3.2.2.4. Câu hỏi và khảo thí

`questions` lưu ngân hàng câu hỏi. Phương án của câu hỏi lựa chọn được tách sang `question_options`. Quan hệ với chứng chỉ được triển khai bằng `question_certificates`. `exams` lưu cấu hình đề và `exam_questions` xác định câu hỏi, thứ tự cùng trọng số trong từng đề. Quá trình làm bài được lưu trong `exam_attempts`, `attempt_answers` và `attempt_answer_options`.

##### Bảng 3.7. Cấu trúc bảng questions

| Thuộc tính | Kiểu dữ liệu | Mô tả | Ràng buộc chính |
|---|---|---|---|
| id | UUID | Mã câu hỏi | PK, NOT NULL |
| type | question_type | Loại câu hỏi | NOT NULL |
| prompt | TEXT | Nội dung câu hỏi | NOT NULL |
| context | TEXT | Ngữ cảnh | Cho phép NULL |
| code_snippet | TEXT | Đoạn mã minh họa | Cho phép NULL |
| explanation | TEXT | Giải thích đáp án | NOT NULL |
| domain_id | UUID | Lĩnh vực | FK đến domains.id, NOT NULL |
| level_id | UUID | Cấp độ | FK đến levels.id, NOT NULL |
| topics | TEXT[] | Các chủ đề | Mặc định mảng rỗng |
| accepted_answers | TEXT[] | Đáp án được chấp nhận | Mặc định mảng rỗng |
| points | DOUBLE PRECISION | Điểm mặc định | NOT NULL, mặc định 1.0 |
| status | content_status | Trạng thái nội dung | NOT NULL, mặc định draft |
| created_at | TIMESTAMPTZ(6) | Thời điểm tạo | NOT NULL, mặc định CURRENT_TIMESTAMP |
| updated_at | TIMESTAMPTZ(6) | Thời điểm cập nhật | NOT NULL |

##### Bảng 3.8. Cấu trúc bảng exams

| Thuộc tính | Kiểu dữ liệu | Mô tả | Ràng buộc chính |
|---|---|---|---|
| id | UUID | Mã đề thi | PK, NOT NULL |
| title | VARCHAR(200) | Tên đề | NOT NULL |
| description | VARCHAR(2000) | Mô tả | NOT NULL |
| domain_id | UUID | Lĩnh vực | FK đến domains.id, NOT NULL |
| level_id | UUID | Cấp độ | FK đến levels.id, NOT NULL |
| certificate_id | UUID | Chứng chỉ liên quan | FK đến certificates.id, cho phép NULL |
| topics | TEXT[] | Phạm vi chủ đề | Mặc định mảng rỗng |
| duration_minutes | INTEGER | Thời lượng làm bài | NOT NULL |
| passing_score_percent | DOUBLE PRECISION | Tỷ lệ điểm đạt | NOT NULL, mặc định 70.0 |
| max_attempts | INTEGER | Số lần làm tối đa | NOT NULL, mặc định 1 |
| shuffle_questions | BOOLEAN | Trộn câu hỏi | NOT NULL, mặc định false |
| is_pro_only | BOOLEAN | Yêu cầu gói Pro | NOT NULL, mặc định false |
| available_from | TIMESTAMPTZ(6) | Thời điểm bắt đầu mở | Cho phép NULL |
| available_until | TIMESTAMPTZ(6) | Thời điểm kết thúc | Cho phép NULL |
| status | content_status | Trạng thái đề | NOT NULL, mặc định draft |
| published_at | TIMESTAMPTZ(6) | Thời điểm xuất bản | Cho phép NULL |
| created_by_id | UUID | Người tạo | FK đến users.id, NOT NULL |
| created_at | TIMESTAMPTZ(6) | Thời điểm tạo | NOT NULL, mặc định CURRENT_TIMESTAMP |
| updated_at | TIMESTAMPTZ(6) | Thời điểm cập nhật | NOT NULL |

##### Bảng 3.9. Cấu trúc bảng exam_attempts

| Thuộc tính | Kiểu dữ liệu | Mô tả | Ràng buộc chính |
|---|---|---|---|
| id | UUID | Mã lượt làm | PK, NOT NULL |
| exam_id | UUID | Đề được thực hiện | FK đến exams.id, NOT NULL |
| learner_id | UUID | Tài khoản Học viên | FK đến users.id, NOT NULL |
| status | attempt_status | Trạng thái lượt làm | NOT NULL, mặc định in_progress |
| questions_snapshot | JSONB | Ảnh chụp câu hỏi tại thời điểm bắt đầu | NOT NULL |
| exam_snapshot | JSONB | Ảnh chụp cấu hình đề | NOT NULL |
| score | DOUBLE PRECISION | Điểm đạt được | Cho phép NULL |
| max_score | DOUBLE PRECISION | Điểm tối đa | Cho phép NULL |
| score_percent | DOUBLE PRECISION | Tỷ lệ điểm | Cho phép NULL |
| passed | BOOLEAN | Kết quả đạt | Cho phép NULL |
| started_at | TIMESTAMPTZ(6) | Thời điểm bắt đầu | NOT NULL, mặc định CURRENT_TIMESTAMP |
| expires_at | TIMESTAMPTZ(6) | Thời điểm hết hạn | Cho phép NULL |
| submitted_at | TIMESTAMPTZ(6) | Thời điểm nộp | Cho phép NULL |
| graded_at | TIMESTAMPTZ(6) | Thời điểm chấm | Cho phép NULL |
| created_at | TIMESTAMPTZ(6) | Thời điểm tạo | NOT NULL, mặc định CURRENT_TIMESTAMP |
| updated_at | TIMESTAMPTZ(6) | Thời điểm cập nhật | NOT NULL |

##### Bảng 3.10. Cấu trúc bảng attempt_answers

| Thuộc tính | Kiểu dữ liệu | Mô tả | Ràng buộc chính |
|---|---|---|---|
| id | UUID | Mã câu trả lời | PK, NOT NULL |
| attempt_id | UUID | Lượt làm bài | FK đến exam_attempts.id, NOT NULL |
| question_id | UUID | Mã câu hỏi tại lượt làm | NOT NULL, không có FK vật lý đến questions |
| text_answer | VARCHAR(2000) | Câu trả lời dạng văn bản | Cho phép NULL |
| is_correct | BOOLEAN | Kết quả đúng sai | Cho phép NULL |
| earned_points | DOUBLE PRECISION | Điểm đạt được | Cho phép NULL |
| max_points | DOUBLE PRECISION | Điểm tối đa của câu | NOT NULL |
| created_at | TIMESTAMPTZ(6) | Thời điểm tạo | NOT NULL, mặc định CURRENT_TIMESTAMP |

`exam_questions` có khóa chính ghép `(exam_id, question_id)`. `attempt_answers` có ràng buộc duy nhất trên `(attempt_id, question_id)`. Các phương án được chọn được lưu qua `attempt_answer_options` với khóa chính ghép `(answer_id, option_id)`.

Source hiện tại có hai khoảng cách so với thiết kế cần được ghi nhận. Hàm tạo đề chưa ghi danh sách câu hỏi từ DTO vào `exam_questions`. Hàm nộp bài chấm trên `questions_snapshot` và cập nhật `exam_attempts` nhưng chưa tạo dữ liệu trong `attempt_answers` và `attempt_answer_options`. Đây là trạng thái triển khai hiện tại, không làm thay đổi cấu trúc bảng đã thiết kế.

#### 3.2.2.5. Tiến độ và đề xuất học tập

`learning_progress` dùng cặp `resource_type` và `resource_id` để lưu tiến độ cho bài học, lĩnh vực hoặc chứng chỉ. Thiết kế này tránh tạo ba bảng tiến độ có cấu trúc giống nhau. `progress_summary_cache` lưu số liệu tổng hợp để phục vụ truy vấn nhanh. `recommendations` lưu các đề xuất đã có và `recommendation_feedbacks` lưu phản hồi của Học viên.

##### Bảng 3.11. Cấu trúc bảng learning_progress

| Thuộc tính | Kiểu dữ liệu | Mô tả | Ràng buộc chính |
|---|---|---|---|
| id | UUID | Mã tiến độ | PK, NOT NULL |
| learner_id | UUID | Tài khoản Học viên | FK đến users.id, NOT NULL |
| resource_type | progress_resource_type | Loại tài nguyên | NOT NULL |
| resource_id | UUID | Mã tài nguyên | NOT NULL, không có FK vật lý đến bảng tài nguyên |
| status | progress_status | Trạng thái tiến độ | NOT NULL, mặc định not_started |
| completion_percent | DOUBLE PRECISION | Tỷ lệ hoàn thành | NOT NULL, mặc định 0.0 |
| completed_lesson_count | INTEGER | Số bài đã hoàn thành | NOT NULL, mặc định 0 |
| total_lesson_count | INTEGER | Tổng số bài | NOT NULL, mặc định 0 |
| average_score_percent | DOUBLE PRECISION | Điểm trung bình | Cho phép NULL |
| started_at | TIMESTAMPTZ(6) | Thời điểm bắt đầu | Cho phép NULL |
| completed_at | TIMESTAMPTZ(6) | Thời điểm hoàn thành | Cho phép NULL |
| updated_at | TIMESTAMPTZ(6) | Thời điểm cập nhật | NOT NULL |

Ràng buộc duy nhất `(learner_id, resource_type, resource_id)` ngăn trùng tiến độ cho cùng một tài nguyên. `resource_id` là tham chiếu đa hình và file DDL không khai báo khóa ngoại đến `lessons`, `domains` hoặc `certificates`. Tính tồn tại của tài nguyên vì vậy phải được kiểm tra ở tầng ứng dụng.

`recommendations` tham chiếu `users` qua `learner_id`, lưu loại tài nguyên bằng `recommendation_resource_type` và không có khóa ngoại vật lý từ `resource_id` đến bảng đích. `RecommendationService` hiện chỉ đọc tối đa mười đề xuất đã lưu. Chưa có endpoint sinh đề xuất hoặc ghi phản hồi, do đó không mô tả đây là cơ chế AI đang hoạt động.

#### 3.2.2.6. Kế hoạch và khuyến khích học tập

`learning_plan_items` lưu công việc học theo thời điểm dự kiến, thời lượng, ghi chú và trạng thái hoàn thành. `lesson_id` là khóa ngoại cho phép NULL vì một công việc có thể không gắn với bài học cụ thể. `user_streaks` lưu chuỗi ngày học, điểm kinh nghiệm và cấp độ. `user_badges` lưu các huy hiệu mà người dùng đã đạt, với ràng buộc duy nhất trên `(user_id, badge_code)`.

#### 3.2.2.7. Thực hành có nhãn AI

`mock_interviews` lưu phiên phỏng vấn thử. `mock_interview_turns` lưu các lượt hỏi đáp trong phiên. `writing_submissions` lưu đề bài, chủ đề, nội dung người dùng, phản hồi và các điểm thành phần.

##### Bảng 3.12. Cấu trúc các bảng thực hành chính

| Bảng | Thuộc tính chính | Quan hệ và ràng buộc |
|---|---|---|
| mock_interviews | id, user_id, topic, difficulty, status, score, feedback, created_at, completed_at | id là PK, user_id là FK đến users.id, status mặc định in_progress |
| mock_interview_turns | id, interview_id, turn_index, question, user_answer, ai_feedback, score, created_at | id là PK, interview_id là FK đến mock_interviews.id |
| writing_submissions | id, user_id, prompt, topic, user_text, ai_feedback, grammar_score, clarity_score, vocab_score, overall_score, created_at | id là PK, user_id là FK đến users.id |

Tên trường `ai_feedback` phản ánh định hướng của dữ liệu nhưng không đủ để chứng minh việc gọi mô hình AI. Source hiện tại dùng câu hỏi cố định và quy tắc chấm đơn giản. Vì vậy nội dung báo cáo chỉ khẳng định khả năng lưu phiên luyện tập và phản hồi tự động ở phiên bản đang kiểm tra.

#### 3.2.2.8. Cộng đồng và thông báo

`discussion_posts` là bảng trung tâm của cộng đồng. `discussion_comments` liên kết bài viết với người bình luận. `discussion_votes` liên kết bài viết với người bỏ phiếu và có ràng buộc duy nhất trên `(post_id, user_id)`. `notifications` lưu thông báo theo người nhận. `user_id` của thông báo cho phép NULL để hỗ trợ dữ liệu phát rộng theo cách triển khai hiện tại.

#### 3.2.2.9. Thanh toán và gói dịch vụ

`payment_orders` lưu đơn thanh toán, giá gốc, giảm giá, số tiền cuối cùng, trạng thái, mã tham chiếu và dữ liệu đối soát SePay. `user_subscriptions` liên kết duy nhất với người dùng và đơn thanh toán. `plan_quotas` lưu hạn mức theo gói. `vouchers` và `flash_sales` lưu cấu hình ưu đãi.

Các ràng buộc duy nhất đáng chú ý gồm `payment_orders.idempotency_key`, `payment_orders.sepay_transaction_id`, `user_subscriptions.user_id`, `user_subscriptions.order_id` và `vouchers.code`. Nhóm này hỗ trợ vận hành gói dịch vụ và không thay đổi trọng tâm học tập của hệ thống.

### 3.2.3. Ràng buộc toàn vẹn

#### 3.2.3.1. Khóa chính

Mỗi bảng có một khóa chính, tạo thành 53 khóa chính. Có 42 bảng dùng khóa chính một cột và 11 bảng dùng khóa chính ghép. Các bảng có khóa chính ghép gồm `role_permissions`, `user_roles`, `certificate_domains`, `learner_profile_domains`, `learner_profile_career_goals`, `learner_group_members`, `lesson_vocabularies`, `lesson_certificates`, `question_certificates`, `exam_questions` và `attempt_answer_options`.

#### 3.2.3.2. Khóa ngoại và quan hệ

File DDL khai báo 71 khóa ngoại. Quan hệ một với không hoặc một được tạo bởi khóa ngoại duy nhất tại `user_details.user_id`, `learner_profiles.user_id`, `user_subscriptions.user_id`, `user_streaks.user_id` và `user_subscriptions.order_id`. Các quan hệ một nhiều được thể hiện qua khóa ngoại thông thường, chẳng hạn `lesson_sections.lesson_id`, `question_options.question_id`, `exam_attempts.exam_id` và `mock_interview_turns.interview_id`. Quan hệ nhiều đối nhiều được triển khai bằng bảng nối có hai khóa ngoại.

Hai trường hợp cần mô tả đúng giới hạn vật lý là `learning_progress.resource_id` và `recommendations.resource_id`. Đây là mã tài nguyên đa hình và không có khóa ngoại đến bảng tài nguyên đích trong DDL. `attempt_answers.question_id` cũng không có khóa ngoại vật lý đến `questions`. Không được tự vẽ thêm các khóa ngoại này trong ERD.

`progress_summary_cache.learner_id` là khóa chính nhưng không có khóa ngoại đến `users`. Đây là điểm **CẦN XÁC NHẬN** nếu nhóm muốn bảo đảm tính toàn vẹn tham chiếu ở cấp cơ sở dữ liệu.

#### 3.2.3.3. Ràng buộc duy nhất

Ngoài khóa chính, schema có 23 ràng buộc hoặc chỉ mục duy nhất. Các ví dụ quan trọng gồm `users.email`, `lessons.slug`, cặp `(vocabularies.term, vocabularies.domain_id)`, cặp `(attempt_answers.attempt_id, attempt_answers.question_id)`, bộ ba `(learning_progress.learner_id, learning_progress.resource_type, learning_progress.resource_id)` và cặp `(discussion_votes.post_id, discussion_votes.user_id)`.

#### 3.2.3.4. Kiểu enum

Thiết kế sử dụng 16 enum để giới hạn trạng thái và loại dữ liệu.

| Enum | Giá trị |
|---|---|
| user_status | active, inactive, suspended |
| content_status | draft, published, archived |
| lesson_type | vocabulary, terminology, technical_reading, api_documentation, system_design, case_study |
| lesson_section_type | heading, rich_text, image, audio, video, code, vocabulary_list, callout, quiz |
| question_type | single_choice, multiple_choice, true_false, short_answer, scenario |
| attempt_status | in_progress, submitted, graded, expired |
| progress_status | not_started, in_progress, completed |
| progress_resource_type | lesson, domain, certificate |
| learner_group_status | active, completed, archived |
| recommendation_resource_type | lesson, practice, exam |
| recommendation_feedback_action | helpful, not_helpful, dismissed, opened |
| level_code | beginner, intermediate, advanced, professional |
| order_status | pending, paid, failed, expired, cancelled |
| subscription_status | active, expired, cancelled |
| MockInterviewStatus | in_progress, completed, abandoned |
| NotificationType | system, lesson_complete, streak, flash_sale, achievement, reminder |

#### 3.2.3.5. CHECK constraint và quy tắc nghiệp vụ

DDL hiện tại không khai báo `CHECK constraint`. Các giới hạn như tỷ lệ phần trăm, thời lượng dương, thời điểm kết thúc sau thời điểm bắt đầu hoặc số lần làm bài hợp lệ không được xem là `CHECK constraint` nếu chỉ xuất hiện trong DTO hoặc service.

Một số quy tắc được xử lý ở tầng ứng dụng, gồm kiểm tra trạng thái nội dung trước khi công bố, giới hạn số lần làm bài, kiểm tra thời hạn đề, xác thực voucher, khóa xử lý thanh toán bằng Redis và kiểm tra quyền qua guard. Các quy tắc này có ý nghĩa nghiệp vụ nhưng không thay thế ràng buộc vật lý trong cơ sở dữ liệu.

### 3.2.4. Chuyển đổi từ mô hình phân tích sang thiết kế cơ sở dữ liệu

Mô hình phân tích ở Chương 2 có 37 lớp, trong khi thiết kế có 53 bảng ứng dụng. Sự chênh lệch là kết quả của chuẩn hóa dữ liệu, tách dữ liệu chi tiết, tạo bảng nối và bổ sung cấu trúc kỹ thuật.

#### Bảng 3.13. Ánh xạ từ lớp phân tích sang bảng thiết kế

| Khái niệm hoặc lớp ở mức phân tích | Bảng ở mức thiết kế | Giải thích chuyển đổi |
|---|---|---|
| UserAccount | users, user_details | Tách thông tin xác thực và thông tin cá nhân |
| Role, Permission | roles, permissions, user_roles, role_permissions | Hai quan hệ nhiều đối nhiều trở thành hai bảng nối |
| LearnerProfile | learner_profiles, learner_profile_domains, learner_profile_career_goals | Hồ sơ chính và hai quan hệ lựa chọn nhiều đối nhiều |
| Domain, Level, CareerGoal | domains, levels, career_goals | Mỗi khái niệm ánh xạ một bảng danh mục |
| Certificate | certificates, certificate_domains | Chứng chỉ và quan hệ nhiều đối nhiều với lĩnh vực |
| LearnerCertificateGoal | learner_certificate_goals | Bảng độc lập vì có target_date |
| LearnerGroup | learner_groups, learner_group_members | Nhóm và quan hệ thành viên nhiều đối nhiều |
| Lesson, LessonSection | lessons, lesson_sections | Bài học tách thành thông tin chung và các khối nội dung |
| Vocabulary | vocabularies, vocabulary_examples | Ví dụ là dữ liệu phụ thuộc của từ vựng |
| Lesson liên kết Vocabulary và Certificate | lesson_vocabularies, lesson_certificates | Hai association nhiều đối nhiều trở thành bảng nối |
| CertificationContent | certification_contents | Ánh xạ một lớp sang một bảng |
| Question, QuestionOption | questions, question_options | Phương án được tách để hỗ trợ số lượng thay đổi |
| Question liên kết Certificate | question_certificates | Association nhiều đối nhiều trở thành bảng nối |
| Exam, ExamQuestion | exams, exam_questions | ExamQuestion lưu thứ tự và trọng số của câu trong đề |
| ExamAttempt, AttemptAnswer | exam_attempts, attempt_answers, attempt_answer_options | Lượt làm, câu trả lời và phương án được chọn được tách riêng |
| LearningProgress | learning_progress, progress_summary_cache | Tiến độ chi tiết và bản tổng hợp phục vụ truy vấn |
| Recommendation, RecommendationFeedback | recommendations, recommendation_feedbacks | Đề xuất và phản hồi có vòng đời riêng |
| LearningPlanItem | learning_plan_items | Ánh xạ một lớp sang một bảng |
| UserStreak, UserBadge | user_streaks, user_badges | Ánh xạ hai lớp sang hai bảng |
| MockInterview, MockInterviewTurn | mock_interviews, mock_interview_turns | Phiên và các lượt hỏi đáp được tách theo quan hệ một nhiều |
| WritingSubmission | writing_submissions | Ánh xạ một lớp sang một bảng |
| DiscussionPost, DiscussionComment, DiscussionVote | discussion_posts, discussion_comments, discussion_votes | Ba đối tượng cộng đồng có vòng đời riêng |
| Notification | notifications | Ánh xạ một lớp sang một bảng |
| PaymentOrder, UserSubscription | payment_orders, user_subscriptions | Đơn thanh toán và quyền gói được quản lý riêng |
| Voucher, FlashSale | vouchers, flash_sales | Hai loại ưu đãi có cấu trúc và phạm vi áp dụng khác nhau |
| Không có lớp phân tích độc lập | refresh_tokens, password_reset_tokens, plan_quotas | Cấu trúc kỹ thuật hoặc vận hành không cần xuất hiện thành lớp nghiệp vụ |

`ExamQuestion` là ngoại lệ trong nhóm bảng liên kết. Lớp này được giữ ở mức phân tích vì `order` và `weight` mang ý nghĩa đối với cấu trúc đề thi. Ngược lại, các bảng nối chỉ chứa khóa như `lesson_vocabularies` được biểu diễn bằng association trên sơ đồ lớp.

### 3.2.5. Khả năng tái tạo schema từ migration

Project hiện có hai migration. Migration `20260827115400_init_full_schema` tạo 32 bảng và 13 enum. Migration RBAC tiếp theo tạo thêm 5 bảng và loại bỏ enum vai trò cũ. Tổng cộng hai migration chỉ tái tạo 37 bảng và 12 enum, trong khi schema hiện tại có 53 bảng và 16 enum.

Mười sáu bảng chưa có lệnh tạo tương ứng trong chuỗi migration hiện tại gồm `password_reset_tokens`, `payment_orders`, `user_subscriptions`, `plan_quotas`, `vouchers`, `flash_sales`, `user_streaks`, `user_badges`, `mock_interviews`, `mock_interview_turns`, `writing_submissions`, `discussion_posts`, `discussion_comments`, `discussion_votes`, `notifications` và `learning_plan_items`.

**CẦN XÁC NHẬN** cơ sở dữ liệu triển khai được tạo bằng Prisma Migrate, `prisma db push`, file DDL đầy đủ hay một quy trình khác. Nội dung chương này lấy schema hiện tại và DDL 53 bảng làm chuẩn mô tả, không khẳng định hai migration hiện có đủ để tái tạo toàn bộ cơ sở dữ liệu.

## 3.3. KẾT CHƯƠNG

Chương 3 đã trình bày thiết kế cơ sở dữ liệu PostgreSQL gồm 53 bảng ứng dụng, 16 enum, 53 khóa chính và 71 khóa ngoại. Các bảng được chia thành 11 nhóm dữ liệu, trong đó nội dung học, từ vựng, câu hỏi, khảo thí và tiến độ là phần cốt lõi. Cộng đồng, thông báo, khuyến khích học tập và thanh toán là các chức năng hỗ trợ.

Thiết kế vật lý được truy vết từ 37 lớp của mô hình dữ liệu mức phân tích. Các bảng bổ sung phát sinh do chuẩn hóa, quan hệ nhiều đối nhiều, dữ liệu chi tiết và nhu cầu kỹ thuật. Việc phân biệt hai mức mô hình giúp Chương 2 và Chương 3 thống nhất mà không biến sơ đồ lớp mức phân tích thành bản sao của cơ sở dữ liệu.
