# HƯỚNG DẪN SỬA SƠ ĐỒ PHÂN TÍCH VÀ VẼ ERD

## 1. Nguyên tắc chung

Sơ đồ lớp mức phân tích và ERD phải được vẽ thành hai loại hình riêng.

- Sơ đồ lớp mức phân tích dùng tên lớp số ít theo PascalCase và chỉ giữ thuộc tính có ý nghĩa nghiệp vụ
- Không đưa khóa ngoại, kiểu dữ liệu PostgreSQL, chỉ mục, token, cache hoặc bảng nối thuần túy vào sơ đồ phân tích
- Không tạo method cho các lớp phân tích
- ERD dùng đúng tên bảng, tên cột, khóa chính và khóa ngoại từ `database_schema.sql`
- Không tự nối quan hệ chỉ vì hai bảng có tên trường giống nhau
- Mỗi sơ đồ cần có tiêu đề, chú thích PK, FK và giải thích ký hiệu bội số

## 2. Vẽ lại Analysis Class Diagram bằng Rational Rose

### 2.1. Danh sách class và thuộc tính chính

Khi tạo class, chỉ mở ngăn Attributes. Để trống ngăn Operations.

#### Nhóm tài khoản và hồ sơ

**UserAccount**

- email
- status
- displayName
- avatarUrl
- locale

**Role**

- code
- name
- description
- isActive

**Permission**

- code
- name
- resource
- action

**LearnerProfile**

- bio
- weeklyStudyTargetMinutes
- onboardingCompleted

**LearnerGroup**

- name
- description
- status
- startDate
- endDate

#### Nhóm danh mục và mục tiêu

**Domain**

- code
- name
- description
- isActive

**Level**

- code
- name
- order
- isActive

**CareerGoal**

- code
- name
- description
- isActive

**Certificate**

- code
- name
- provider
- description

**LearnerCertificateGoal**

- targetDate
- createdAt

#### Nhóm nội dung học

**Lesson**

- title
- slug
- summary
- type
- estimatedMinutes
- status
- isProOnly
- publishedAt

**LessonSection**

- type
- order
- title
- content

**Vocabulary**

- term
- pronunciationIpa
- audioUrl
- partOfSpeech
- definitionEn
- definitionVi
- tags
- status

**CertificationContent**

- title
- body
- topic
- order
- status

#### Nhóm câu hỏi và khảo thí

**Question**

- type
- prompt
- context
- codeSnippet
- explanation
- topics
- acceptedAnswers
- points
- status

**QuestionOption**

- key
- text
- isCorrect
- explanation
- order

**Exam**

- title
- description
- topics
- durationMinutes
- passingScorePercent
- maxAttempts
- shuffleQuestions
- isProOnly
- availableFrom
- availableUntil
- status

**ExamQuestion**

- order
- weight

**ExamAttempt**

- status
- questionsSnapshot
- examSnapshot
- score
- maxScore
- scorePercent
- passed
- startedAt
- expiresAt
- submittedAt

**AttemptAnswer**

- textAnswer
- isCorrect
- earnedPoints
- maxPoints

#### Nhóm tiến độ và cá nhân hóa

**LearningProgress**

- resourceType
- resourceId
- status
- completionPercent
- completedLessonCount
- totalLessonCount
- averageScorePercent
- startedAt
- completedAt

**Recommendation**

- resourceType
- resourceId
- title
- reason
- priority
- basedOn
- generatedAt
- expiresAt

**RecommendationFeedback**

- action
- comment
- createdAt

**LearningPlanItem**

- title
- note
- plannedAt
- durationMin
- isCompleted

**UserStreak**

- currentStreak
- longestStreak
- totalExpPoints
- weeklyPoints
- level

**UserBadge**

- badgeCode
- badgeName
- description
- earnedAt

#### Nhóm thực hành có nhãn AI

**MockInterview**

- topic
- difficulty
- status
- score
- feedback
- createdAt
- completedAt

**MockInterviewTurn**

- turnIndex
- question
- userAnswer
- aiFeedback
- score

**WritingSubmission**

- prompt
- topic
- userText
- aiFeedback
- grammarScore
- clarityScore
- vocabScore
- overallScore

#### Nhóm cộng đồng và thông báo

**DiscussionPost**

- title
- content
- createdAt
- updatedAt

**DiscussionComment**

- content
- createdAt

**DiscussionVote**

- value
- createdAt

**Notification**

- type
- title
- message
- data
- isRead
- createdAt

#### Nhóm thanh toán

**PaymentOrder**

- planId
- amount
- originalAmount
- discountAmount
- voucherCode
- status
- paidAt
- expiresAt

**UserSubscription**

- planId
- status
- startedAt
- expiresAt

**Voucher**

- code
- name
- discountType
- discountValue
- minOrderAmount
- maxDiscountAmount
- usageLimit
- startDate
- endDate
- isActive

**FlashSale**

- title
- description
- planId
- discountPercent
- startTime
- endTime
- isActive

### 2.2. Association và multiplicity

Trong Rational Rose, dùng Association cho quan hệ thông thường. Dùng Aggregation hoặc Composition chỉ khi nhóm muốn nhấn mạnh vòng đời phụ thuộc. Có thể dùng Composition từ `Lesson` đến `LessonSection`, từ `Question` đến `QuestionOption`, từ `MockInterview` đến `MockInterviewTurn` và từ `ExamAttempt` đến `AttemptAnswer`.

| Class A | Class B | Multiplicity tại A | Multiplicity tại B | Cách vẽ và ý nghĩa |
|---|---|---|---|---|
| UserAccount | LearnerProfile | 1 | 0..1 | Một tài khoản có thể có một hồ sơ học tập |
| UserAccount | Role | 0..* | 0..* | Gán vai trò cho tài khoản |
| Role | Permission | 0..* | 0..* | Gán quyền cho vai trò |
| UserAccount | LearnerGroup | 1 | 0..* | Vai trò teacher quản lý nhiều nhóm |
| UserAccount | LearnerGroup | 0..* | 0..* | Vai trò learner tham gia nhiều nhóm, ghi tên association là membership |
| LearnerProfile | Level | 0..* | 1 | Mỗi hồ sơ có một cấp độ |
| LearnerProfile | Domain | 0..* | 0..* | Học viên chọn nhiều lĩnh vực |
| LearnerProfile | CareerGoal | 0..* | 0..* | Học viên chọn nhiều mục tiêu nghề nghiệp |
| LearnerProfile | LearnerCertificateGoal | 1 | 0..* | Hồ sơ có nhiều mục tiêu chứng chỉ |
| Certificate | LearnerCertificateGoal | 1 | 0..* | Một chứng chỉ được nhiều hồ sơ đặt làm mục tiêu |
| Certificate | Domain | 0..* | 0..* | Chứng chỉ liên quan nhiều lĩnh vực |
| Domain | Lesson | 1 | 0..* | Lĩnh vực phân loại bài học |
| Level | Lesson | 1 | 0..* | Cấp độ phân loại bài học |
| UserAccount | Lesson | 1 | 0..* | Người có quyền nội dung tạo bài học |
| Lesson | LessonSection | 1 | 1..* | Bài học gồm các khối nội dung |
| Domain | Vocabulary | 1 | 0..* | Lĩnh vực phân loại từ vựng |
| Level | Vocabulary | 1 | 0..* | Cấp độ phân loại từ vựng |
| Lesson | Vocabulary | 0..* | 0..* | Bài học sử dụng nhiều từ vựng |
| Lesson | Certificate | 0..* | 0..* | Bài học hỗ trợ nhiều chứng chỉ |
| Certificate | CertificationContent | 1 | 0..* | Chứng chỉ có nhiều nội dung ôn tập |
| Domain | Question | 1 | 0..* | Lĩnh vực phân loại câu hỏi |
| Level | Question | 1 | 0..* | Cấp độ phân loại câu hỏi |
| Question | QuestionOption | 1 | 0..* | Câu hỏi có các phương án khi phù hợp |
| Question | Certificate | 0..* | 0..* | Câu hỏi phục vụ nhiều chứng chỉ |
| Domain | Exam | 1 | 0..* | Lĩnh vực phân loại đề |
| Level | Exam | 1 | 0..* | Cấp độ phân loại đề |
| Certificate | Exam | 0..1 | 0..* | Một đề có thể gắn với một chứng chỉ |
| UserAccount | Exam | 1 | 0..* | Người có quyền nội dung tạo đề |
| Exam | ExamQuestion | 1 | 1..* | Thành phần câu hỏi có thứ tự và trọng số |
| Question | ExamQuestion | 1 | 0..* | Một câu hỏi có thể được dùng trong nhiều đề |
| Exam | ExamAttempt | 1 | 0..* | Một đề có nhiều lượt làm |
| UserAccount | ExamAttempt | 1 | 0..* | Học viên thực hiện nhiều lượt làm |
| ExamAttempt | AttemptAnswer | 1 | 0..* | Lượt làm có các câu trả lời |
| UserAccount | LearningProgress | 1 | 0..* | Học viên có nhiều bản ghi tiến độ |
| UserAccount | Recommendation | 1 | 0..* | Học viên nhận các đề xuất đã lưu |
| Recommendation | RecommendationFeedback | 1 | 0..* | Đề xuất có thể nhận nhiều phản hồi |
| UserAccount | RecommendationFeedback | 1 | 0..* | Học viên tạo phản hồi |
| UserAccount | LearningPlanItem | 1 | 0..* | Người dùng có nhiều mục kế hoạch |
| Lesson | LearningPlanItem | 0..1 | 0..* | Mục kế hoạch có thể liên kết một bài học |
| UserAccount | UserStreak | 1 | 0..1 | Một người dùng có tối đa một bản ghi chuỗi học |
| UserAccount | UserBadge | 1 | 0..* | Một người dùng có nhiều huy hiệu |
| UserAccount | MockInterview | 1 | 0..* | Người dùng có nhiều phiên phỏng vấn thử |
| MockInterview | MockInterviewTurn | 1 | 1..* | Phiên phỏng vấn gồm nhiều lượt |
| UserAccount | WritingSubmission | 1 | 0..* | Người dùng nộp nhiều bài viết |
| UserAccount | DiscussionPost | 1 | 0..* | Người dùng tạo bài viết |
| DiscussionPost | DiscussionComment | 1 | 0..* | Bài viết có nhiều bình luận |
| UserAccount | DiscussionComment | 1 | 0..* | Người dùng tạo nhiều bình luận |
| DiscussionPost | DiscussionVote | 1 | 0..* | Bài viết nhận nhiều lượt bỏ phiếu |
| UserAccount | DiscussionVote | 1 | 0..* | Người dùng bỏ phiếu cho nhiều bài viết |
| UserAccount | Notification | 0..1 | 0..* | Thông báo có thể có người nhận cụ thể hoặc dùng cho phát rộng |
| UserAccount | PaymentOrder | 1 | 0..* | Người dùng có nhiều đơn thanh toán |
| UserAccount | UserSubscription | 1 | 0..1 | Người dùng có tối đa một đăng ký |
| PaymentOrder | UserSubscription | 1 | 0..1 | Một đơn có thể tạo một đăng ký |

Không nối `LearningProgress.resourceId` hoặc `Recommendation.resourceId` trực tiếp đến nhiều lớp bằng FK trên ERD. Ở sơ đồ phân tích có thể dùng dependency nét đứt ghi chú “tham chiếu tài nguyên theo resourceType” nếu cần diễn đạt khái niệm. Trên ERD chỉ hiển thị các FK vật lý có thật.

### 2.3. Bố cục đề xuất cho sơ đồ lớp

- Đặt `UserAccount` và `LearnerProfile` ở vùng trung tâm bên trái
- Đặt `Domain`, `Level`, `CareerGoal` và `Certificate` phía trên làm nhóm danh mục
- Đặt `Lesson`, `LessonSection`, `Vocabulary` và `CertificationContent` ở trung tâm
- Đặt `Question`, `QuestionOption`, `Exam`, `ExamQuestion`, `ExamAttempt` và `AttemptAnswer` ở bên phải
- Đặt `LearningProgress`, `Recommendation`, `LearningPlanItem`, `UserStreak` và `UserBadge` ở dưới nhóm học tập
- Đặt nhóm phỏng vấn và viết ở dưới bên phải
- Đặt cộng đồng, thông báo và thanh toán ở rìa dưới vì đây là chức năng hỗ trợ
- Nếu sơ đồ khổ A4 không đọc được, dùng khổ A3 ngang hoặc chia thành một sơ đồ tổng quan và các sơ đồ con nhưng vẫn giữ một danh mục 37 lớp thống nhất

## 3. Danh sách ERD cần vẽ cho Chương 3

Chương 3 cần 10 hình gồm 1 sơ đồ tổng quan nhóm dữ liệu và 9 ERD chi tiết.

### Hình 3.1. Sơ đồ tổng quan các nhóm dữ liệu

- Vẽ 11 khối đúng theo Bảng 3.1 của Chương 3
- Đặt Nội dung học và Câu hỏi khảo thí ở trung tâm
- Đặt Tài khoản ở bên trái và nối đến Hồ sơ, Nội dung, Khảo thí, Cộng đồng, Thông báo và Thanh toán
- Đặt Tiến độ và đề xuất phía dưới Nội dung học và Khảo thí
- Chỉ thể hiện luồng phụ thuộc giữa nhóm, không liệt kê cột

### Hình 3.2. ERD tài khoản và phân quyền

- Bảng cần thêm: users, user_details, roles, permissions, user_roles, role_permissions, refresh_tokens, password_reset_tokens
- Bảng trung tâm: users
- Bố trí: users ở giữa, user_details và refresh_tokens bên trái, user_roles cùng roles bên phải, role_permissions cùng permissions ngoài cùng bên phải
- Quan hệ cần thể hiện: user_details → users, refresh_tokens → users, user_roles → users, user_roles → roles, user_roles.granted_by_id → users, role_permissions → roles, role_permissions → permissions
- `password_reset_tokens` không có FK vật lý nên đặt riêng và không nối theo email

### Hình 3.3. ERD danh mục, hồ sơ và nhóm Học viên

- Bảng cần thêm: users, domains, levels, career_goals, certificates, certificate_domains, learner_profiles, learner_profile_domains, learner_profile_career_goals, learner_certificate_goals, learner_groups, learner_group_members
- Bảng trung tâm: learner_profiles
- Bố trí: users và learner_profiles ở giữa, bốn bảng danh mục phía trên, các bảng nối ở giữa hai đầu liên quan, learner_groups cùng learner_group_members phía dưới
- Quan hệ cần thể hiện: toàn bộ FK của các bảng nối, learner_profiles → users và levels, learner_certificate_goals → learner_profiles và certificates, learner_groups → users, domains và certificates, learner_group_members → learner_groups và users
- `users`, `domains`, `levels` và `certificates` là các bảng lặp để cung cấp ngữ cảnh

### Hình 3.4. ERD bài học, từ vựng và nội dung chứng chỉ

- Bảng cần thêm: users, domains, levels, certificates, lessons, lesson_sections, vocabularies, vocabulary_examples, lesson_vocabularies, lesson_certificates, certification_contents
- Bảng trung tâm: lessons
- Bố trí: lessons ở giữa, lesson_sections phía dưới, vocabularies và vocabulary_examples bên trái, certificates và certification_contents bên phải, các bảng nối nằm giữa hai bảng đầu mối
- Quan hệ cần thể hiện: lessons → domains, levels và users, lesson_sections → lessons, vocabularies → domains và levels, vocabulary_examples → vocabularies, lesson_vocabularies → lessons và vocabularies, lesson_certificates → lessons và certificates, certification_contents → certificates

### Hình 3.5. ERD câu hỏi và khảo thí

- Bảng cần thêm: users, domains, levels, certificates, questions, question_options, question_certificates, exams, exam_questions, exam_attempts, attempt_answers, attempt_answer_options
- Bảng trung tâm: exams
- Bố trí: questions và question_options bên trái, exams ở giữa, exam_attempts cùng các bảng câu trả lời bên phải, bảng nối đặt giữa các đầu mối
- Quan hệ cần thể hiện: questions → domains và levels, question_options → questions, question_certificates → questions và certificates, exams → domains, levels, certificates và users, exam_questions → exams và questions, exam_attempts → exams và users, attempt_answers → exam_attempts, attempt_answer_options → attempt_answers và question_options
- Không nối `attempt_answers.question_id` với `questions` vì DDL không có FK này

### Hình 3.6. ERD tiến độ và đề xuất

- Bảng cần thêm: users, learning_progress, progress_summary_cache, recommendations, recommendation_feedbacks
- Bảng trung tâm: users
- Bố trí: learning_progress và progress_summary_cache bên trái, recommendations và recommendation_feedbacks bên phải
- Quan hệ cần thể hiện: learning_progress → users, recommendations → users, recommendation_feedbacks → recommendations và users
- Không nối `progress_summary_cache.learner_id` với users
- Không nối `resource_id` của learning_progress hoặc recommendations với bảng tài nguyên

### Hình 3.7. ERD kế hoạch và khuyến khích học tập

- Bảng cần thêm: users, lessons, learning_plan_items, user_streaks, user_badges
- Bảng trung tâm: users
- Bố trí: learning_plan_items và lessons bên trái, user_streaks cùng user_badges bên phải
- Quan hệ cần thể hiện: learning_plan_items → users và lessons, user_streaks → users, user_badges → users

### Hình 3.8. ERD thực hành có nhãn AI

- Bảng cần thêm: users, mock_interviews, mock_interview_turns, writing_submissions
- Bảng trung tâm: users
- Bố trí: chuỗi users → mock_interviews → mock_interview_turns ở hàng trên, writing_submissions phía dưới users
- Quan hệ cần thể hiện: mock_interviews → users, mock_interview_turns → mock_interviews, writing_submissions → users
- Không thêm AIConversation, AIMessage, AILearningError hoặc AISavedVocabulary

### Hình 3.9. ERD cộng đồng và thông báo

- Bảng cần thêm: users, discussion_posts, discussion_comments, discussion_votes, notifications
- Bảng trung tâm: discussion_posts
- Bố trí: users bên trái, discussion_posts ở giữa, comments và votes bên phải, notifications phía dưới users
- Quan hệ cần thể hiện: discussion_posts → users, discussion_comments → discussion_posts và users, discussion_votes → discussion_posts và users, notifications → users
- Thể hiện `notifications.user_id` là FK cho phép NULL

### Hình 3.10. ERD thanh toán và khuyến mãi

- Bảng cần thêm: users, payment_orders, user_subscriptions, plan_quotas, vouchers, flash_sales
- Bảng trung tâm: payment_orders
- Bố trí: users bên trái, payment_orders ở giữa, user_subscriptions bên phải, ba bảng cấu hình ưu đãi và hạn mức ở phía dưới
- Quan hệ cần thể hiện: payment_orders → users, user_subscriptions → users và payment_orders
- Không nối `payment_orders.voucher_id` với vouchers vì DDL không khai báo FK
- Không nối các trường `plan_id` giữa payment_orders, user_subscriptions, plan_quotas và flash_sales vì chúng không có FK vật lý

## 4. Kiểm tra trước khi xuất hình

- Mọi tên bảng trên ERD phải ở dạng snake_case đúng schema
- Mọi tên class trên sơ đồ phân tích phải ở dạng số ít PascalCase
- Không để `lesson_progress` hoặc `vocabulary_progress` trên bất kỳ sơ đồ nào
- Không để các bảng cũ như `ai_conversations`, `learning_paths` hoặc `hands_on_labs`
- Kiểm tra đầu nối bắt buộc và tùy chọn theo nullable của FK
- Kiểm tra đủ 11 khóa chính ghép
- Không gắn nhãn CHECK cho validation ở service hoặc DTO
- Chữ phải đọc được khi chèn vào báo cáo
- Ghi nguồn hình là nhóm tác giả xây dựng từ schema hiện tại
