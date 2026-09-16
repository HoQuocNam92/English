# Báo cáo Phân tích Cấu trúc Cơ sở Dữ liệu Thực tế — TechEnglish Pro

> **Dự án:** TechEnglish Pro (Hệ thống học tiếng Anh chuyên ngành CNTT & Luyện thi chứng chỉ quốc tế)  
> **Hệ quản trị CSDL:** PostgreSQL 14+ (tương thích PostgreSQL 13+)  
> **ORM & Migration Tool:** Prisma ORM  
> **Ngày phân tích:** 07/09/2026  
> **File DDL SQL xuất ra:** [`database_schema.sql`](file:///c:/Users/nguye/OneDrive/Desktop/Project/English/database_schema.sql)  

---

## 1. Tổng quan số lượng bảng và Enum

- **Tổng số lượng bảng thực tế đang được sử dụng:** **53 bảng**
- **Tổng số lượng Enum (PostgreSQL Custom Types):** **16 enums**
- **Tổng số lượng Khóa chính (Primary Keys):** **53 khóa chính** (bao gồm 44 khóa đơn UUID/VARCHAR và 9 khóa phức hợp composite PK)
- **Tổng số lượng Khóa ngoại (Foreign Keys):** **71 ràng buộc FK**
- **Phân nhóm chức năng:** Hệ thống cơ sở dữ liệu được thiết kế hoàn chỉnh theo Clean Architecture, chia thành 11 phân hệ rõ rệt:
  1. **Xác thực & Phân quyền Enterprise RBAC:** 8 bảng
  2. **Dữ liệu danh mục & Lộ trình (Taxonomy & Master Data):** 5 bảng
  3. **Hồ sơ học viên & Nhóm học (Learner Profile & Cohort Groups):** 6 bảng
  4. **Từ vựng & Bài học chuyên ngành (Vocabulary & Lessons):** 7 bảng
  5. **Ngân hàng câu hỏi, Đề thi & Lượt làm bài (Exams & Attempts):** 8 bảng
  6. **Tiến độ học tập & Gợi ý AI (Progress & Recommendations):** 4 bảng
  7. **Thanh toán, Gói PRO & Khuyến mãi (Payment & Subscriptions):** 5 bảng
  8. **Gamification & Bảng xếp hạng (Streaks & Badges):** 2 bảng
  9. **Tính năng AI tương tác (AI Mock Interview & Writing Practice):** 3 bảng
  10. **Cộng đồng thảo luận (Community Forum):** 3 bảng
  11. **Thông báo & Lập kế hoạch học tập (Notifications & Study Planner):** 2 bảng

---

## 2. Danh sách 53 Bảng và Khóa Chính (Primary Keys)

| STT | Tên bảng (Table Name) | Tên Model Prisma | Khóa chính (Primary Key) | Kiểu PK | Mục đích lưu trữ thực tế |
|:---:|:---|:---|:---|:---:|:---|
| 1 | `users` | User | `id` | UUID | Tài khoản xác thực (email, password hash, status). |
| 2 | `user_details` | UserDetail | `id` | UUID | Hồ sơ người dùng chi tiết (họ tên, avatar, ngày sinh, bio, locale). |
| 3 | `roles` | Role | `id` | UUID | Danh mục vai trò trong hệ thống (admin, teacher, learner, v.v.). |
| 4 | `permissions` | Permission | `id` | UUID | Danh mục quyền chi tiết theo định dạng `resource:action`. |
| 5 | `role_permissions` | RolePermission | (`role_id`, `permission_id`) | Composite | Bảng nối phân quyền N:N giữa Role và Permission. |
| 6 | `user_roles` | UserRole | (`user_id`, `role_id`) | Composite | Bảng nối gán quyền N:N giữa User và Role (hỗ trợ đa vai trò). |
| 7 | `refresh_tokens` | RefreshToken | `id` | UUID | Quản lý phiên đăng nhập JWT refresh token. |
| 8 | `password_reset_tokens` | PasswordResetToken | `id` | UUID | Quản lý mã OTP và token khôi phục mật khẩu. |
| 9 | `domains` | Domain | `id` | UUID | Danh mục lĩnh vực CNTT (Cloud, DevOps, Security, Data, v.v.). |
| 10 | `levels` | Level | `id` | UUID | Cấp độ năng lực kỹ thuật (beginner, intermediate, advanced, professional). |
| 11 | `career_goals` | CareerGoal | `id` | UUID | Mục tiêu nghề nghiệp (Backend Engineer, DevOps Engineer, v.v.). |
| 12 | `certificates` | Certificate | `id` | UUID | Chứng chỉ CNTT quốc tế (AWS-SAA, CKA, CompTIA Security+, v.v.). |
| 13 | `certificate_domains` | CertificateDomain | (`certificate_id`, `domain_id`) | Composite | Bảng nối N:N giữa Chứng chỉ và Lĩnh vực liên quan. |
| 14 | `learner_profiles` | LearnerProfile | `id` | UUID | Hồ sơ học tập riêng biệt (trình độ, thời gian mục tiêu tuần). |
| 15 | `learner_profile_domains` | LearnerProfileDomain | (`profile_id`, `domain_id`) | Composite | Bảng nối N:N giữa Hồ sơ học viên và Lĩnh vực quan tâm. |
| 16 | `learner_profile_career_goals` | LearnerProfileCareerGoal | (`profile_id`, `career_goal_id`) | Composite | Bảng nối N:N giữa Hồ sơ học viên và Mục tiêu nghề nghiệp. |
| 17 | `learner_certificate_goals` | LearnerCertificateGoal | `id` | UUID | Mục tiêu chứng chỉ mà học viên đang hướng tới & ngày dự kiến thi. |
| 18 | `learner_groups` | LearnerGroup | `id` | UUID | Nhóm/Lớp học viên do giảng viên quản lý. |
| 19 | `learner_group_members` | LearnerGroupMember | (`group_id`, `learner_id`) | Composite | Bảng nối thành viên tham gia lớp học. |
| 20 | `vocabularies` | Vocabulary | `id` | UUID | Từ vựng và thuật ngữ kỹ thuật CNTT (IPA, âm thanh, định nghĩa song ngữ). |
| 21 | `vocabulary_examples` | VocabularyExample | `id` | UUID | Các câu ví dụ ngữ cảnh kỹ thuật thực tế cho từ vựng. |
| 22 | `lessons` | Lesson | `id` | UUID | Bài học kỹ thuật (title, slug, loại bài học, thời lượng, trạng thái PRO). |
| 23 | `lesson_sections` | LessonSection | `id` | UUID | Các khối nội dung của bài học (rich_text, code, image, video, quiz) dạng JSONB. |
| 24 | `lesson_vocabularies` | LessonVocabulary | (`lesson_id`, `vocabulary_id`) | Composite | Bảng nối N:N giữa Bài học và Từ vựng xuất hiện trong bài. |
| 25 | `lesson_certificates` | LessonCertificate | (`lesson_id`, `certificate_id`) | Composite | Bảng nối N:N giữa Bài học và Chứng chỉ ôn luyện. |
| 26 | `certification_contents` | CertificationContent | `id` | UUID | Tài liệu học tập chuyên biệt theo từng bài thi chứng chỉ. |
| 27 | `questions` | Question | `id` | UUID | Ngân hàng câu hỏi trắc nghiệm & tình huống kỹ thuật. |
| 28 | `question_options` | QuestionOption | `id` | UUID | Các lựa chọn trả lời (A, B, C, D) cho từng câu hỏi. |
| 29 | `question_certificates` | QuestionCertificate | (`question_id`, `certificate_id`) | Composite | Bảng nối N:N giữa Câu hỏi và Chứng chỉ mục tiêu. |
| 30 | `exams` | Exam | `id` | UUID | Đề thi / bài kiểm tra đánh giá (thời gian, điểm đỗ, shuffle, trạng thái PRO). |
| 31 | `exam_questions` | ExamQuestion | (`exam_id`, `question_id`) | Composite | Bảng nối N:N giữa Đề thi và Câu hỏi (thứ tự & trọng số điểm). |
| 32 | `exam_attempts` | ExamAttempt | `id` | UUID | Lượt làm bài của học viên (kèm snapshot toàn bộ đề thi & điểm số). |
| 33 | `attempt_answers` | AttemptAnswer | `id` | UUID | Chi tiết câu trả lời của học viên trong một lượt thi. |
| 34 | `attempt_answer_options` | AttemptAnswerOption | (`answer_id`, `option_id`) | Composite | Bảng nối các option được học viên chọn trong câu trả lời. |
| 35 | `learning_progress` | LearningProgress | `id` | UUID | Tiến độ học tập chi tiết theo từng bài học, lĩnh vực hoặc chứng chỉ. |
| 36 | `progress_summary_cache` | ProgressSummaryCache | `learner_id` | UUID | Bảng cache tổng hợp tiến độ cá nhân (streak, bài hoàn thành, điểm TB). |
| 37 | `recommendations` | Recommendation | `id` | UUID | Gợi ý học tập cá nhân hóa sinh ra từ AI Engine. |
| 38 | `recommendation_feedbacks` | RecommendationFeedback | `id` | UUID | Phản hồi của học viên về độ hữu ích của gợi ý AI. |
| 39 | `payment_orders` | PaymentOrder | `id` | UUID | Đơn đặt hàng thanh toán gói PRO qua cổng SePay. |
| 40 | `user_subscriptions` | UserSubscription | `id` | UUID | Gói thuê bao PRO đang có hiệu lực của người dùng (1:1). |
| 41 | `plan_quotas` | PlanQuota | `plan_id` | VARCHAR(50) | Hạn ngạch số lượng slot bán cho từng gói PRO (early-bird). |
| 42 | `vouchers` | Voucher | `id` | UUID | Mã giảm giá / khuyến mãi (percentage hoặc fixed amount). |
| 43 | `flash_sales` | FlashSale | `id` | UUID | Chiến dịch Flash Sale giảm giá theo khung thời gian. |
| 44 | `user_streaks` | UserStreak | `id` | UUID | Chuỗi ngày học liên tục (Daily Streak) và điểm kinh nghiệm (EXP). |
| 45 | `user_badges` | UserBadge | `id` | UUID | Huy hiệu thành tích mở khóa khi đạt các cột mốc học tập. |
| 46 | `mock_interviews` | MockInterview | `id` | UUID | Phiên phỏng vấn kỹ thuật bằng tiếng Anh với AI (Mock Interview). |
| 47 | `mock_interview_turns` | MockInterviewTurn | `id` | UUID | Từng lượt hỏi - đáp - phản hồi AI trong buổi phỏng vấn. |
| 48 | `writing_submissions` | WritingSubmission | `id` | UUID | Bài thực hành viết tiếng Anh kỹ thuật và kết quả chấm điểm AI. |
| 49 | `discussion_posts` | DiscussionPost | `id` | UUID | Bài viết chia sẻ trên diễn đàn cộng đồng người học. |
| 50 | `discussion_comments` | DiscussionComment | `id` | UUID | Bình luận trao đổi dưới bài viết cộng đồng. |
| 51 | `discussion_votes` | DiscussionVote | `id` | UUID | Đánh giá Upvote/Downvote bài viết diễn đàn. |
| 52 | `notifications` | Notification | `id` | UUID | Thông báo hệ thống, nhắc học, ưu đãi gửi đến người dùng. |
| 53 | `learning_plan_items` | LearningPlanItem | `id` | UUID | Lịch trình và kế hoạch học tập cá nhân (Study Planner/Calendar). |

---

## 3. Danh sách Đầy đủ 71 Khóa Ngoại (Foreign Keys)

Hệ thống có tổng cộng **71 ràng buộc khóa ngoại** được thiết lập chặt chẽ để đảm bảo toàn vẹn tham chiếu dữ liệu:

### 3.1 Phân hệ Xác thực & Phân quyền (8 FK)
1. `user_details.user_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
2. `role_permissions.role_id` ➔ `roles.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
3. `role_permissions.permission_id` ➔ `permissions.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
4. `user_roles.user_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
5. `user_roles.role_id` ➔ `roles.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
6. `user_roles.granted_by_id` ➔ `users.id` (`ON DELETE SET NULL ON UPDATE CASCADE`)
7. `refresh_tokens.user_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)

### 3.2 Phân hệ Danh mục & Lộ trình (2 FK)
8. `certificate_domains.certificate_id` ➔ `certificates.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
9. `certificate_domains.domain_id` ➔ `domains.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)

### 3.3 Phân hệ Hồ sơ học viên & Nhóm lớp (12 FK)
10. `learner_profiles.user_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
11. `learner_profiles.level_id` ➔ `levels.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)
12. `learner_profile_domains.profile_id` ➔ `learner_profiles.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
13. `learner_profile_domains.domain_id` ➔ `domains.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
14. `learner_profile_career_goals.profile_id` ➔ `learner_profiles.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
15. `learner_profile_career_goals.career_goal_id` ➔ `career_goals.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
16. `learner_certificate_goals.profile_id` ➔ `learner_profiles.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
17. `learner_certificate_goals.certificate_id` ➔ `certificates.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
18. `learner_groups.teacher_id` ➔ `users.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)
19. `learner_groups.domain_id` ➔ `domains.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)
20. `learner_groups.certificate_id` ➔ `certificates.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)
21. `learner_group_members.group_id` ➔ `learner_groups.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
22. `learner_group_members.learner_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)

### 3.4 Phân hệ Từ vựng & Bài học (11 FK)
23. `vocabularies.domain_id` ➔ `domains.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)
24. `vocabularies.level_id` ➔ `levels.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)
25. `vocabulary_examples.vocabulary_id` ➔ `vocabularies.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
26. `lessons.domain_id` ➔ `domains.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)
27. `lessons.level_id` ➔ `levels.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)
28. `lessons.created_by_id` ➔ `users.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)
29. `lesson_sections.lesson_id` ➔ `lessons.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
30. `lesson_vocabularies.lesson_id` ➔ `lessons.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
31. `lesson_vocabularies.vocabulary_id` ➔ `vocabularies.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
32. `lesson_certificates.lesson_id` ➔ `lessons.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
33. `lesson_certificates.certificate_id` ➔ `certificates.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
34. `certification_contents.certificate_id` ➔ `certificates.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)

### 3.5 Phân hệ Ngân hàng câu hỏi, Bài thi & Lượt làm bài (15 FK)
35. `questions.domain_id` ➔ `domains.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)
36. `questions.level_id` ➔ `levels.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)
37. `question_options.question_id` ➔ `questions.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
38. `question_certificates.question_id` ➔ `questions.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
39. `question_certificates.certificate_id` ➔ `certificates.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
40. `exams.domain_id` ➔ `domains.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)
41. `exams.level_id` ➔ `levels.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)
42. `exams.certificate_id` ➔ `certificates.id` (`ON DELETE SET NULL ON UPDATE CASCADE`)
43. `exams.created_by_id` ➔ `users.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)
44. `exam_questions.exam_id` ➔ `exams.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
45. `exam_questions.question_id` ➔ `questions.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)
46. `exam_attempts.exam_id` ➔ `exams.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)
47. `exam_attempts.learner_id` ➔ `users.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)
48. `attempt_answers.attempt_id` ➔ `exam_attempts.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
49. `attempt_answer_options.answer_id` ➔ `attempt_answers.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
50. `attempt_answer_options.option_id` ➔ `question_options.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)

### 3.6 Phân hệ Tiến độ & Gợi ý AI (4 FK)
51. `learning_progress.learner_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
52. `recommendations.learner_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
53. `recommendation_feedbacks.recommendation_id` ➔ `recommendations.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
54. `recommendation_feedbacks.learner_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)

### 3.7 Phân hệ Thanh toán & Khuyến mãi (4 FK)
55. `payment_orders.user_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
56. `payment_orders.voucher_id` ➔ `vouchers.id` (`ON DELETE SET NULL ON UPDATE CASCADE`)
57. `user_subscriptions.user_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
58. `user_subscriptions.order_id` ➔ `payment_orders.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`)

### 3.8 Phân hệ Gamification (2 FK)
59. `user_streaks.user_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
60. `user_badges.user_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)

### 3.9 Phân hệ AI Tính năng Tương tác (4 FK)
61. `mock_interviews.user_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
62. `mock_interview_turns.interview_id` ➔ `mock_interviews.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
63. `writing_submissions.user_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)

### 3.10 Phân hệ Diễn đàn Cộng đồng (5 FK)
64. `discussion_posts.user_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
65. `discussion_comments.post_id` ➔ `discussion_posts.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
66. `discussion_comments.user_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
67. `discussion_votes.post_id` ➔ `discussion_posts.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
68. `discussion_votes.user_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)

### 3.11 Phân hệ Thông báo & Lập kế hoạch (3 FK)
69. `notifications.user_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
70. `learning_plan_items.user_id` ➔ `users.id` (`ON DELETE CASCADE ON UPDATE CASCADE`)
71. `learning_plan_items.lesson_id` ➔ `lessons.id` (`ON DELETE SET NULL ON UPDATE CASCADE`)

---

## 4. Các Quan Hệ Chính Giữa Các Bảng (Key Relationships)

### 4.1 Quan hệ 1 : 1 (One-to-One)
- `users` ↔ `user_details`: Mỗi tài khoản xác thực có đúng một bản ghi thông tin cá nhân mở rộng (`user_id` là UNIQUE).
- `users` ↔ `learner_profiles`: Mỗi tài khoản người học có đúng một hồ sơ học tập (`user_id` là UNIQUE).
- `users` ↔ `user_subscriptions`: Mỗi người dùng chỉ có tối đa một gói PRO đang hoạt động (`user_id` là UNIQUE).
- `users` ↔ `user_streaks`: Mỗi người dùng gắn liền với một bản ghi Daily Streak & EXP (`user_id` là UNIQUE).
- `payment_orders` ↔ `user_subscriptions`: Mỗi lượt đăng ký PRO gắn chặt với đúng một đơn thanh toán thành công (`order_id` là UNIQUE).
- `progress_summary_cache`: Dùng trực tiếp `learner_id` làm khóa chính, tương ứng 1:1 với `users`.

### 4.2 Quan hệ 1 : N (One-to-Many)
- `users` ➔ `refresh_tokens`, `payment_orders`, `exam_attempts`, `user_badges`, `mock_interviews`, `writing_submissions`, `discussion_posts`, `notifications`, `learning_plan_items`.
- `lessons` ➔ `lesson_sections`: Một bài học gồm nhiều khối nội dung có thứ tự `order`.
- `vocabularies` ➔ `vocabulary_examples`: Một từ vựng có nhiều câu ví dụ kỹ thuật.
- `questions` ➔ `question_options`: Một câu hỏi trắc nghiệm có danh sách các lựa chọn.
- `mock_interviews` ➔ `mock_interview_turns`: Một buổi phỏng vấn gồm nhiều lượt đối thoại liên tiếp.
- `discussion_posts` ➔ `discussion_comments` & `discussion_votes`: Một bài đăng có nhiều bình luận và lượt vote.
- `recommendations` ➔ `recommendation_feedbacks`: Gợi ý AI nhận phản hồi từ người học.

### 4.3 Quan hệ N : N (Many-to-Many qua Bảng trung gian)
- **Role & Permission:** Qua bảng `role_permissions(role_id, permission_id)`.
- **User & Role:** Qua bảng `user_roles(user_id, role_id)` (hỗ trợ phân nhiều role cho 1 user và lưu người cấp quyền `granted_by_id`).
- **Certificate & Domain:** Qua bảng `certificate_domains(certificate_id, domain_id)`.
- **LearnerProfile & Domain / CareerGoal:** Qua `learner_profile_domains` và `learner_profile_career_goals`.
- **Lesson & Vocabulary:** Qua `lesson_vocabularies(lesson_id, vocabulary_id)`.
- **Lesson & Certificate:** Qua `lesson_certificates(lesson_id, certificate_id)`.
- **Exam & Question:** Qua `exam_questions(exam_id, question_id)` kèm trọng số điểm `weight` và thứ tự `order`.
- **Question & Certificate:** Qua `question_certificates(question_id, certificate_id)`.
- **LearnerGroup & Learner:** Qua `learner_group_members(group_id, learner_id)`.
- **AttemptAnswer & Option:** Qua `attempt_answer_options(answer_id, option_id)` (hỗ trợ câu hỏi multiple choice chọn nhiều đáp án).

---

## 5. Những Điểm Chưa Khớp hoặc Đáng Chú Ý trong Schema (Discrepancies & Architectural Insights)

Trong quá trình phân tích chéo giữa thư mục Migration (`prisma/migrations`), file cấu hình schema (`schema.prisma`), file seed mẫu (`seed.ts`), và mã nguồn NestJS Controllers/Services, phát hiện các điểm kỹ thuật quan trọng sau:

### 5.1 Sự lệch pha giữa Migration Files và Schema thực tế (37 bảng vs 53 bảng)
- **Thực trạng trong git/migrations:**
  - `20260827115400_init_full_schema`: Chứa DDL khởi tạo 32 bảng ban đầu.
  - `20260827150358_rbac_user_detail_split`: Tách `users` thành `users` + `user_details` và bổ sung 4 bảng RBAC (`roles`, `permissions`, `role_permissions`, `user_roles`). Tổng cộng là 37 bảng.
  - Sau mốc migration trên, trong quá trình phát triển các feature mới (SePay Payment, Gamification EXP/Streak, AI Mock Interview, AI Writing Practice, Community Forum, Study Planner, Voucher, Flash Sale), đội ngũ phát triển đã thêm 16 bảng vào `schema.prisma` và sử dụng lệnh `prisma db push` (có sẵn trong `package.json`) thay vì tạo file migration mới.
- **Kết luận:** Database thực tế của project có **53 bảng** chứ không dừng lại ở 37 bảng của 2 file migration cũ. File [`database_schema.sql`](file:///c:/Users/nguye/OneDrive/Desktop/Project/English/database_schema.sql) đã tổng hợp toàn bộ 53 bảng để dựng lại đúng 100% ứng dụng đang chạy.

### 5.2 Cột `is_pro_only` trong `lessons` và `exams`
- Trong file migration ban đầu, bảng `lessons` và `exams` không có cột `is_pro_only`.
- Khi tính năng gói cước PRO và phân quyền nội dung trả phí được triển khai, 2 cột này đã được bổ sung vào `schema.prisma` (`is_pro_only BOOLEAN NOT NULL DEFAULT false`) và được gọi trực tiếp trong các controller/service (`lesson.controller.ts`, `exam.controller.ts`, seed Pro plans). File SQL tổng hợp đã đưa 2 cột này vào bảng gốc.

### 5.3 Bãi bỏ Enum `user_role` để chuyển sang Enterprise Dynamic RBAC
- Migration 1 từng tạo `CREATE TYPE "user_role" AS ENUM ('admin', 'teacher', 'learner')` và cột `role` trong bảng `users`.
- Migration 2 đã thực hiện:
  ```sql
  ALTER TABLE "users" DROP COLUMN "role";
  DROP TYPE "user_role";
  ```
  Và chuyển sang mô hình Enterprise RBAC: 1 người dùng có thể có nhiều vai trò trong bảng `user_roles`, mỗi vai trò trong bảng `roles` sở hữu các quyền granular trong `permissions` (ví dụ `lessons:create`, `exams:grade`). Schema DDL tổng hợp đã loại bỏ hoàn toàn enum `user_role` để tránh xung đột.

### 5.4 Vấn đề Ràng buộc Khóa ngoại Đa hình (Polymorphic FK) tại `learning_progress`
- Trong migration 1 (`init_full_schema`), lập trình viên ban đầu đã tạo 3 khóa ngoại đồng thời trên cùng một cột `resource_id`:
  ```sql
  ALTER TABLE "learning_progress" ADD CONSTRAINT "fk_progress_lesson" FOREIGN KEY ("resource_id") REFERENCES "lessons"("id");
  ALTER TABLE "learning_progress" ADD CONSTRAINT "fk_progress_domain" FOREIGN KEY ("resource_id") REFERENCES "domains"("id");
  ALTER TABLE "learning_progress" ADD CONSTRAINT "fk_progress_certificate" FOREIGN KEY ("resource_id") REFERENCES "certificates"("id");
  ```
- **Hệ quả kỹ thuật trong PostgreSQL:** Nếu cả 3 ràng buộc này cùng tồn tại trên một cột `resource_id`, bất kỳ thao tác `INSERT` nào vào `learning_progress` cũng sẽ thất bại (trừ phi một bản ghi ngẫu nhiên có cùng UUID tồn tại ở cả 3 bảng `lessons`, `domains`, và `certificates`).
- **Cách xử lý trong `schema.prisma` và file DDL chuẩn:** Trong `schema.prisma`, tác giả đã ghi chú:  
  `/// resourceId points to a lesson, domain, or certificate depending on resourceType (no FK enforced for non-lesson types)`  
  và chỉ giữ lại quan hệ logic ở tầng ứng dụng (Application Level Polymorphism). Trong file `database_schema.sql`, chỉ giữ khóa ngoại `learner_id ➔ users.id` và `resource_id` được quản lý theo kiểu đa hình chuẩn dựa vào cột `resource_type`, đảm bảo cơ sở dữ liệu hoạt động trơn tru không bị lỗi vi phạm ràng buộc chéo.

### 5.5 Tận dụng Tính năng Cao cấp của PostgreSQL
- **JSONB Snapshots:** Bảng `exam_attempts` lưu trữ `questions_snapshot` và `exam_snapshot` dưới dạng JSONB. Điều này giúp bảo toàn nguyên trạng câu hỏi và đáp án tại thời điểm thí sinh thi, dù giảng viên sau đó có chỉnh sửa câu hỏi trong ngân hàng đề. Tương tự, `lesson_sections.content` dùng JSONB để lưu linh hoạt các block nội dung phong phú (Rich Text, Code block, Media URL).
- **Timezone Awareness:** Toàn bộ cột thời gian đều sử dụng `TIMESTAMPTZ(6)` để xử lý đồng bộ múi giờ quốc tế và giờ Việt Nam (`Asia/Ho_Chi_Minh`).
- **PostgreSQL Arrays:** Bảng `questions.topics`, `questions.accepted_answers`, `vocabularies.tags`, `discussion_posts.tags` sử dụng mảng nguyên bản `TEXT[] DEFAULT ARRAY[]::TEXT[]` giúp tối ưu hiệu năng tìm kiếm và tiết kiệm bảng phụ không cần thiết.

---

## 6. Hướng dẫn Dựng lại Cơ sở Dữ liệu từ File SQL

Để khởi tạo lại toàn bộ cơ sở dữ liệu từ đầu bằng file [`database_schema.sql`](file:///c:/Users/nguye/OneDrive/Desktop/Project/English/database_schema.sql):

```bash
# 1. Tạo database mới trên PostgreSQL
createdb -U postgres -h localhost techenglish

# 2. Thực thi file DDL schema hoàn chỉnh
psql -U postgres -h localhost -d techenglish -f database_schema.sql

# 3. (Tùy chọn) Chạy seed dữ liệu hệ thống (roles, levels, domains, certificates, permissions)
pnpm --filter @techenglish/api run db:seed
```
Sau khi thực thi, cơ sở dữ liệu sẽ sẵn sàng 100% phục vụ cả Backend NestJS API, Web Next.js và Mobile React Native.
