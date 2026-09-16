# RÀ SOÁT VÀ THIẾT KẾ LẠI MÔ HÌNH DỮ LIỆU MỨC PHÂN TÍCH

## 1. Kết luận về sơ đồ hiện tại

Sơ đồ lớp mức phân tích tại Hình 33 cần được làm lại. Sơ đồ đang dùng 20 khung mang tên bảng ở dạng snake_case, hiển thị gần như toàn bộ cột vật lý và chứa lesson_progress cùng vocabulary_progress không tồn tại trong schema hiện tại. Cách thể hiện này gần với ERD vật lý hơn là sơ đồ lớp mức phân tích.

Toàn bộ 20 lớp đang có đều cần thao tác sửa:

- 16 lớp giữ lại về mặt khái niệm nhưng đổi sang tên lớp nghiệp vụ dạng số ít và giảm thuộc tính
- 2 lớp liên kết thuần túy được bỏ khỏi sơ đồ và thay bằng association trực tiếp
- 2 lớp tiến độ cũ được gộp và thay bằng một lớp LearningProgress
- Bổ sung 20 lớp có căn cứ từ Use Case, source và schema nhưng chưa có trên sơ đồ

Kết quả cuối cùng gồm 37 lớp phân tích. Con số này nhỏ hơn 53 bảng thiết kế vì các bảng token, cache, bảng nối thuần túy và một số bảng triển khai chi tiết không cần trở thành lớp phân tích độc lập.

## 2. Phân loại lớp cũ

### 2.1. Giữ khái niệm và đổi tên

| Tên hiện tại | Tên lớp đề nghị | Điều chỉnh chính |
|---|---|---|
| users | UserAccount | Không giữ password_hash và các cột kỹ thuật trên sơ đồ phân tích. Role được thể hiện bằng association |
| learner_profiles | LearnerProfile | Chỉ giữ thuộc tính hồ sơ học tập chính |
| learner_certificate_goals | LearnerCertificateGoal | Giữ vì có targetDate và ý nghĩa nghiệp vụ riêng |
| levels | Level | Dùng tên số ít |
| domains | Domain | Dùng tên số ít |
| career_goals | CareerGoal | Dùng tên số ít |
| certificates | Certificate | Dùng tên số ít |
| certification_contents | CertificationContent | Dùng tên số ít |
| lessons | Lesson | Bỏ các cột FK khỏi danh sách thuộc tính |
| vocabularies | Vocabulary | Bỏ các cột FK khỏi danh sách thuộc tính |
| questions | Question | Bỏ các cột FK khỏi danh sách thuộc tính |
| question_options | QuestionOption | Dùng tên số ít |
| exams | Exam | Bỏ các cột FK khỏi danh sách thuộc tính |
| exam_questions | ExamQuestion | Giữ dưới dạng association class vì có order và weight |
| exam_attempts | ExamAttempt | Sửa learner_profile_id thành liên kết với UserAccount theo schema |
| attempt_answers | AttemptAnswer | Bỏ question_snapshot vì cột này không tồn tại trong schema hiện tại |

### 2.2. Loại bỏ khỏi vai trò lớp độc lập

| Lớp hiện tại | Cách thay thế |
|---|---|
| learner_profile_career_goals | Vẽ association nhiều đối nhiều giữa LearnerProfile và CareerGoal |
| lesson_vocabularies | Vẽ association nhiều đối nhiều giữa Lesson và Vocabulary |

### 2.3. Gộp hoặc thay thế

| Lớp hiện tại | Lớp thay thế | Lý do |
|---|---|---|
| lesson_progress | LearningProgress | Schema dùng một cấu trúc tiến độ chung theo resourceType |
| vocabulary_progress | LearningProgress | Không có bảng vocabulary_progress trong schema |

### 2.4. Lớp cần bổ sung

Role, Permission, LearnerGroup, LessonSection, Recommendation, RecommendationFeedback, LearningPlanItem, UserStreak, UserBadge, MockInterview, MockInterviewTurn, WritingSubmission, DiscussionPost, DiscussionComment, DiscussionVote, Notification, PaymentOrder, UserSubscription, Voucher và FlashSale.

## 3. Danh sách 37 lớp phân tích cuối cùng

| STT | Lớp phân tích | Nhóm nghiệp vụ | Ý nghĩa | Căn cứ từ project |
|---:|---|---|---|---|
| 1 | UserAccount | Tài khoản | Tài khoản của Học viên, Giảng viên hoặc Quản trị viên | users, user_details, AuthService, UsersService |
| 2 | Role | Phân quyền | Vai trò được gán cho người dùng | roles, user_roles, RolesService |
| 3 | Permission | Phân quyền | Quyền thao tác theo resource và action | permissions, role_permissions, PermissionsGuard |
| 4 | LearnerProfile | Hồ sơ học tập | Trình độ và thiết lập học tập của Học viên | learner_profiles, LearnerProfilesService |
| 5 | Domain | Danh mục | Lĩnh vực CNTT dùng để phân loại nội dung và mục tiêu | domains, TaxonomyService |
| 6 | Level | Danh mục | Cấp độ học tập | levels, LevelCode |
| 7 | CareerGoal | Danh mục | Mục tiêu nghề nghiệp của Học viên | career_goals |
| 8 | Certificate | Chứng chỉ | Chứng chỉ nghề nghiệp và nhà cung cấp | certificates |
| 9 | LearnerCertificateGoal | Hồ sơ học tập | Mục tiêu chứng chỉ và ngày dự kiến | learner_certificate_goals |
| 10 | LearnerGroup | Quản lý Học viên | Nhóm Học viên do Giảng viên phụ trách | learner_groups, learner_group_members, TaxonomyService |
| 11 | Lesson | Nội dung học | Bài học tiếng Anh chuyên ngành | lessons, LessonsService |
| 12 | LessonSection | Nội dung học | Khối nội dung có thứ tự trong bài học | lesson_sections |
| 13 | Vocabulary | Từ vựng | Từ hoặc thuật ngữ chuyên ngành | vocabularies, VocabularyService |
| 14 | CertificationContent | Chứng chỉ | Nội dung ôn tập theo chứng chỉ | certification_contents |
| 15 | Question | Ngân hàng câu hỏi | Câu hỏi luyện tập hoặc khảo thí | questions, QuestionsService |
| 16 | QuestionOption | Ngân hàng câu hỏi | Phương án lựa chọn của câu hỏi | question_options |
| 17 | Exam | Khảo thí | Cấu hình đề thi hoặc bài kiểm tra | exams, ExamsService |
| 18 | ExamQuestion | Khảo thí | Câu hỏi trong đề cùng thứ tự và trọng số | exam_questions |
| 19 | ExamAttempt | Khảo thí | Một lượt làm đề của Học viên | exam_attempts |
| 20 | AttemptAnswer | Khảo thí | Câu trả lời và điểm theo câu trong một lượt làm | attempt_answers |
| 21 | LearningProgress | Tiến độ | Tiến độ theo lesson, domain hoặc certificate | learning_progress, ProgressService |
| 22 | Recommendation | Cá nhân hóa | Gợi ý tài nguyên học tập đã lưu | recommendations, RecommendationService |
| 23 | RecommendationFeedback | Cá nhân hóa | Phản hồi của Học viên đối với gợi ý | recommendation_feedbacks |
| 24 | LearningPlanItem | Kế hoạch | Một công việc học được lên lịch | learning_plan_items, PlannerController |
| 25 | UserStreak | Gamification | Chuỗi ngày học và điểm kinh nghiệm | user_streaks, LeaderboardController |
| 26 | UserBadge | Gamification | Huy hiệu đạt được | user_badges |
| 27 | MockInterview | Luyện tập có nhãn AI | Phiên luyện phỏng vấn kỹ thuật | mock_interviews, MockInterviewController |
| 28 | MockInterviewTurn | Luyện tập có nhãn AI | Một lượt hỏi, trả lời và phản hồi trong phiên | mock_interview_turns |
| 29 | WritingSubmission | Luyện tập có nhãn AI | Bài viết và kết quả đánh giá được lưu | writing_submissions, WritingController |
| 30 | DiscussionPost | Cộng đồng | Bài thảo luận của người dùng | discussion_posts, DiscussionController |
| 31 | DiscussionComment | Cộng đồng | Bình luận dưới bài thảo luận | discussion_comments |
| 32 | DiscussionVote | Cộng đồng | Lượt đánh giá bài thảo luận | discussion_votes |
| 33 | Notification | Thông báo | Thông báo cá nhân hoặc broadcast | notifications, NotificationController |
| 34 | PaymentOrder | Thanh toán | Đơn mua gói PRO | payment_orders, PaymentService |
| 35 | UserSubscription | Thanh toán | Trạng thái gói đang sử dụng | user_subscriptions |
| 36 | Voucher | Khuyến mãi | Mã giảm giá và điều kiện sử dụng | vouchers, VoucherController |
| 37 | FlashSale | Khuyến mãi | Chương trình giảm giá theo thời gian | flash_sales, FlashSaleController |

## 4. Thuộc tính nghiệp vụ chính

Không thêm method vào sơ đồ. Không đưa toàn bộ cột vật lý, khóa ngoại, createdAt và updatedAt vào mọi lớp nếu chúng không giúp giải thích nghiệp vụ.

### UserAccount

- userId
- email
- displayName
- status

### Role

- code
- name
- description
- isActive

### Permission

- code
- name
- resource
- action

### LearnerProfile

- profileId
- bio
- weeklyStudyTargetMinutes
- onboardingCompleted

### Domain

- code
- name
- description
- isActive

### Level

- code
- name
- order
- description
- isActive

### CareerGoal

- code
- name
- description
- isActive

### Certificate

- code
- name
- provider
- description
- examUrl
- isActive

### LearnerCertificateGoal

- targetDate
- createdAt

### LearnerGroup

- groupId
- name
- description
- status
- startsAt
- endsAt

### Lesson

- lessonId
- title
- slug
- summary
- type
- estimatedMinutes
- isProOnly
- status
- publishedAt

### LessonSection

- sectionId
- type
- order
- title
- content

### Vocabulary

- vocabularyId
- term
- pronunciationIpa
- audioUrl
- partOfSpeech
- definitionEn
- definitionVi
- tags
- status

### CertificationContent

- contentId
- title
- body
- topic
- order
- status

### Question

- questionId
- type
- prompt
- context
- codeSnippet
- explanation
- topics
- acceptedAnswers
- points
- status

### QuestionOption

- optionId
- key
- text
- isCorrect
- explanation
- order

### Exam

- examId
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

### ExamQuestion

- order
- weight

### ExamAttempt

- attemptId
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
- gradedAt

### AttemptAnswer

- answerId
- questionId
- textAnswer
- isCorrect
- earnedPoints
- maxPoints

### LearningProgress

- progressId
- resourceType
- resourceId
- status
- completionPercent
- completedLessonCount
- totalLessonCount
- averageScorePercent
- startedAt
- completedAt

### Recommendation

- recommendationId
- resourceType
- resourceId
- title
- reason
- priority
- basedOn
- generatedAt
- expiresAt

### RecommendationFeedback

- feedbackId
- action
- comment
- createdAt

### LearningPlanItem

- itemId
- title
- note
- plannedAt
- durationMin
- isCompleted

### UserStreak

- currentStreak
- maxStreak
- lastStudyDate
- totalExpPoints
- weeklyPoints
- monthlyPoints

### UserBadge

- badgeCode
- badgeName
- description
- iconUrl
- unlockedAt

### MockInterview

- interviewId
- topic
- difficulty
- status
- score
- feedback
- completedAt

### MockInterviewTurn

- turnId
- turnIndex
- question
- userAnswer
- aiFeedback
- score

### WritingSubmission

- submissionId
- prompt
- topic
- userText
- aiFeedback
- grammarScore
- clarityScore
- vocabScore
- overallScore

### DiscussionPost

- postId
- title
- content
- tags
- isPinned
- viewCount

### DiscussionComment

- commentId
- content
- createdAt

### DiscussionVote

- voteId
- value

### Notification

- notificationId
- type
- title
- message
- isRead
- actionUrl

### PaymentOrder

- orderId
- planId
- amount
- originalAmount
- discountAmount
- voucherCode
- status
- paidAt
- expiresAt

### UserSubscription

- subscriptionId
- planId
- status
- startedAt
- expiresAt

### Voucher

- voucherId
- code
- name
- discountType
- discountValue
- minOrderAmount
- maxDiscountAmount
- usageLimit
- usedCount
- startDate
- endDate
- isActive

### FlashSale

- flashSaleId
- title
- description
- planId
- discountPercent
- startTime
- endTime
- isActive

## 5. Quan hệ và bội số

Trong bảng dưới đây, bội số A là số đối tượng A gắn với một đối tượng B. Bội số B là số đối tượng B gắn với một đối tượng A.

| Lớp A | Quan hệ | Lớp B | Bội số A | Bội số B | Ý nghĩa nghiệp vụ | Căn cứ |
|---|---|---|---|---|---|---|
| UserAccount | Association | Role | 0..* | 0..* | Một người dùng có thể có nhiều vai trò | user_roles |
| Role | Association | Permission | 0..* | 0..* | Một vai trò có nhiều quyền và một quyền có thể thuộc nhiều vai trò | role_permissions |
| UserAccount | Association | LearnerProfile | 1 | 0..1 | Chỉ tài khoản Học viên cần hồ sơ học tập | learner_profiles.user_id unique |
| LearnerProfile | Association | Level | 0..* | 1 | Mỗi hồ sơ có đúng một cấp độ | learner_profiles.level_id |
| LearnerProfile | Association | Domain | 0..* | 0..* | Học viên chọn nhiều lĩnh vực quan tâm | learner_profile_domains |
| LearnerProfile | Association | CareerGoal | 0..* | 0..* | Học viên chọn nhiều mục tiêu nghề nghiệp | learner_profile_career_goals |
| LearnerProfile | Composition | LearnerCertificateGoal | 1 | 0..* | Mục tiêu chứng chỉ phụ thuộc hồ sơ | learner_certificate_goals |
| LearnerCertificateGoal | Association | Certificate | 0..* | 1 | Mỗi mục tiêu hướng đến một chứng chỉ | certificate_id |
| Certificate | Association | Domain | 0..* | 0..* | Một chứng chỉ có thể liên quan nhiều lĩnh vực | certificate_domains |
| UserAccount | Association | LearnerGroup | 0..* | 1 | Mỗi nhóm có một Giảng viên phụ trách | learner_groups.teacher_id |
| LearnerGroup | Association | Domain | 0..* | 1 | Mỗi nhóm gắn với một lĩnh vực | learner_groups.domain_id |
| LearnerGroup | Association | Certificate | 0..* | 1 | Mỗi nhóm gắn với một chứng chỉ | learner_groups.certificate_id |
| LearnerGroup | Association | UserAccount | 0..* | 0..* | Nhóm có nhiều Học viên và Học viên có thể tham gia nhiều nhóm | learner_group_members |
| Lesson | Association | Domain | 0..* | 1 | Bài học thuộc một lĩnh vực | lessons.domain_id |
| Lesson | Association | Level | 0..* | 1 | Bài học thuộc một cấp độ | lessons.level_id |
| UserAccount | Association | Lesson | 1 | 0..* | Giảng viên hoặc Quản trị viên tạo bài học | lessons.created_by_id |
| Lesson | Composition | LessonSection | 1 | 0..* | Section không tồn tại độc lập với bài học | lesson_sections.lesson_id |
| Lesson | Association | Vocabulary | 0..* | 0..* | Từ vựng có thể xuất hiện trong nhiều bài học | lesson_vocabularies |
| Lesson | Association | Certificate | 0..* | 0..* | Bài học có thể phục vụ nhiều chứng chỉ | lesson_certificates |
| Vocabulary | Association | Domain | 0..* | 1 | Từ vựng thuộc một lĩnh vực | vocabularies.domain_id |
| Vocabulary | Association | Level | 0..* | 1 | Từ vựng thuộc một cấp độ | vocabularies.level_id |
| Certificate | Composition | CertificationContent | 1 | 0..* | Nội dung ôn tập thuộc một chứng chỉ | certification_contents.certificate_id |
| Question | Association | Domain | 0..* | 1 | Câu hỏi thuộc một lĩnh vực | questions.domain_id |
| Question | Association | Level | 0..* | 1 | Câu hỏi thuộc một cấp độ | questions.level_id |
| Question | Composition | QuestionOption | 1 | 0..* | Phương án thuộc một câu hỏi | question_options.question_id |
| Question | Association | Certificate | 0..* | 0..* | Câu hỏi có thể phục vụ nhiều chứng chỉ | question_certificates |
| Exam | Association | Domain | 0..* | 1 | Đề thi thuộc một lĩnh vực | exams.domain_id |
| Exam | Association | Level | 0..* | 1 | Đề thi thuộc một cấp độ | exams.level_id |
| Exam | Association | Certificate | 0..* | 0..1 | Đề có thể không gắn chứng chỉ | exams.certificate_id nullable |
| UserAccount | Association | Exam | 1 | 0..* | Giảng viên hoặc Quản trị viên tạo đề | exams.created_by_id |
| Exam | Association class | Question | 0..* | 0..* | ExamQuestion giữ order và weight | exam_questions |
| Exam | Association | ExamAttempt | 1 | 0..* | Một đề phát sinh nhiều lượt làm | exam_attempts.exam_id |
| UserAccount | Association | ExamAttempt | 1 | 0..* | Một Học viên có nhiều lượt làm | exam_attempts.learner_id |
| ExamAttempt | Composition | AttemptAnswer | 1 | 0..* | Câu trả lời phụ thuộc lượt làm | attempt_answers.attempt_id |
| AttemptAnswer | Association | QuestionOption | 0..* | 0..* | Câu trả lời nhiều lựa chọn có thể chọn nhiều option | attempt_answer_options |
| UserAccount | Association | LearningProgress | 1 | 0..* | Học viên có nhiều bản ghi tiến độ | learning_progress.learner_id |
| LearningProgress | Logical association | Lesson, Domain hoặc Certificate | 0..* | 1 | Mỗi tiến độ hướng đến đúng một loại tài nguyên theo resourceType | resource_type và resource_id, không có FK vật lý đến cả ba bảng |
| UserAccount | Association | Recommendation | 1 | 0..* | Học viên nhận các gợi ý đã lưu | recommendations.learner_id |
| Recommendation | Composition | RecommendationFeedback | 1 | 0..* | Phản hồi thuộc một recommendation | recommendation_feedbacks.recommendation_id |
| UserAccount | Association | RecommendationFeedback | 1 | 0..* | Học viên tạo phản hồi | recommendation_feedbacks.learner_id |
| UserAccount | Association | LearningPlanItem | 1 | 0..* | Người dùng có nhiều mục kế hoạch | learning_plan_items.user_id |
| Lesson | Association | LearningPlanItem | 0..1 | 0..* | Một mục kế hoạch có thể tham chiếu bài học | lesson_id nullable |
| UserAccount | Association | UserStreak | 1 | 0..1 | Mỗi người dùng có tối đa một bản ghi streak | user_streaks.user_id unique |
| UserAccount | Association | UserBadge | 1 | 0..* | Người dùng có nhiều huy hiệu | user_badges.user_id |
| UserAccount | Association | MockInterview | 1 | 0..* | Học viên có nhiều phiên phỏng vấn | mock_interviews.user_id |
| MockInterview | Composition | MockInterviewTurn | 1 | 0..* | Lượt hỏi đáp thuộc phiên phỏng vấn | mock_interview_turns.interview_id |
| UserAccount | Association | WritingSubmission | 1 | 0..* | Học viên có nhiều bài viết | writing_submissions.user_id |
| UserAccount | Association | DiscussionPost | 1 | 0..* | Người dùng tạo bài thảo luận | discussion_posts.user_id |
| DiscussionPost | Composition | DiscussionComment | 1 | 0..* | Bình luận thuộc bài viết | discussion_comments.post_id |
| UserAccount | Association | DiscussionComment | 1 | 0..* | Người dùng tạo bình luận | discussion_comments.user_id |
| DiscussionPost | Composition | DiscussionVote | 1 | 0..* | Vote thuộc bài viết | discussion_votes.post_id |
| UserAccount | Association | DiscussionVote | 1 | 0..* | Người dùng vote nhiều bài, tối đa một vote trên mỗi bài | unique post_id và user_id |
| UserAccount | Association | Notification | 0..1 | 0..* | Thông báo có thể dành cho một người hoặc là broadcast | notifications.user_id nullable |
| UserAccount | Association | PaymentOrder | 1 | 0..* | Người dùng có nhiều đơn thanh toán | payment_orders.user_id |
| Voucher | Association | PaymentOrder | 0..1 | 0..* | Đơn có thể áp dụng một voucher | payment_orders.voucher_id nullable |
| UserAccount | Association | UserSubscription | 1 | 0..1 | Người dùng có tối đa một subscription | user_subscriptions.user_id unique |
| PaymentOrder | Association | UserSubscription | 1 | 0..1 | Một subscription tham chiếu một đơn thanh toán | user_subscriptions.order_id unique |

FlashSale không có khóa ngoại đến bảng plan vì planId là chuỗi và không có lớp Plan trong schema. Không nối FlashSale với một lớp Plan tự tạo. Có thể đặt FlashSale gần PaymentOrder và UserSubscription để thể hiện cùng nhóm nghiệp vụ, nhưng không vẽ association vật lý không tồn tại.

AttemptAnswer có questionId nhưng schema không khai báo khóa ngoại đến questions. Nếu cần thể hiện liên kết nghiệp vụ với Question, dùng đường association nét đứt và ghi chú logical reference, không dùng ký hiệu khóa ngoại.

## 6. Hướng dẫn bố trí Rational Rose

Chia sơ đồ thành các package hoặc vùng:

- Góc trên trái đặt UserAccount, Role và Permission
- Bên trái đặt LearnerProfile, Level, Domain, CareerGoal, Certificate, LearnerCertificateGoal và LearnerGroup
- Ở giữa đặt Lesson, LessonSection, Vocabulary và CertificationContent
- Bên phải đặt Question, QuestionOption, Exam, ExamQuestion, ExamAttempt và AttemptAnswer
- Phía dưới giữa đặt LearningProgress, Recommendation, RecommendationFeedback, LearningPlanItem, UserStreak và UserBadge
- Một vùng riêng phía dưới đặt MockInterview, MockInterviewTurn và WritingSubmission
- Một vùng hỗ trợ đặt DiscussionPost, DiscussionComment, DiscussionVote và Notification
- Một vùng hỗ trợ cuối cùng đặt PaymentOrder, UserSubscription, Voucher và FlashSale

Dùng Association cho quan hệ thông thường. Dùng Composition từ Lesson đến LessonSection, từ ExamAttempt đến AttemptAnswer, từ MockInterview đến MockInterviewTurn và từ DiscussionPost đến DiscussionComment hoặc DiscussionVote vì đối tượng con bị xóa theo đối tượng cha trong database. Dùng Association Class cho ExamQuestion. Không dùng Aggregation nếu không giải thích được vòng đời khác với Association.

## 7. Vì sao số lớp ít hơn số bảng

Mô hình phân tích mô tả khái niệm mà tác nhân nhận biết trong nghiệp vụ. Thiết kế database còn cần các cấu trúc phục vụ xác thực, chuẩn hóa, quan hệ nhiều đối nhiều, cache và vận hành. Vì vậy:

- UserAccount đại diện cho dữ liệu nghiệp vụ được tách thành users và user_details
- Quan hệ UserAccount với Role thay cho việc vẽ user_roles như một lớp
- Quan hệ Role với Permission thay cho role_permissions
- Quan hệ Lesson với Vocabulary thay cho lesson_vocabularies
- Quan hệ Lesson với Certificate thay cho lesson_certificates
- Quan hệ Question với Certificate thay cho question_certificates
- VocabularyExample có thể được biểu diễn như tập ví dụ của Vocabulary ở mức phân tích
- RefreshToken và PasswordResetToken là cấu trúc kỹ thuật của xác thực
- ProgressSummaryCache là bảng tối ưu truy vấn
- PlanQuota là cấu trúc vận hành kiểm soát số slot

Do đó 37 lớp phân tích ánh xạ hợp lý sang 53 bảng thiết kế mà không biến sơ đồ phân tích thành bản sao ERD.
