# BÁO CÁO AUDIT PROJECT TECHENGLISH

## 1. Phạm vi và nguồn kiểm chứng

Báo cáo này được lập bằng cách đối chiếu trực tiếp source code, Prisma schema, migration SQL, DDL tổng hợp và bản khóa luận mới nhất NHOM_NGHIENCUU_DT04 (4).docx. Không có file PostgreSQL backup hoặc dump trong project và cũng không có cấu hình kết nối database để kiểm tra trực tiếp trạng thái của một database đang chạy.

Thứ tự căn cứ được sử dụng khi mô tả hệ thống như sau:

1. apps/api/prisma/schema.prisma để xác định mô hình dữ liệu ứng dụng hiện hành
2. database_schema.sql để kiểm tra tên bảng, cột, kiểu dữ liệu và ràng buộc vật lý đã tổng hợp
3. apps/api/prisma/migrations để kiểm tra khả năng tái tạo database bằng migration
4. Backend controller và service để xác định nghiệp vụ đã có xử lý
5. Web và Mobile để xác định chức năng đã có giao diện và mức độ kết nối API
6. Bản khóa luận mới nhất để xác định nội dung và sơ đồ đang cần sửa

Các file database_schema_report.md và chapter3_verification_report.md chỉ được dùng làm đầu mối kiểm tra. Các con số trong hai file này không được dùng thay cho phép đếm độc lập.

## 2. Kiến trúc và công nghệ

| Thành phần | Kết quả audit | Căn cứ |
|---|---|---|
| Backend | NestJS 11.2.3 với TypeScript | apps/api/package.json |
| Web | Next.js 15.5.2, React 19.1.1 và TypeScript | apps/web/package.json |
| Mobile | Expo SDK 54, React Native 0.81.5, Expo Router 6 và TypeScript | apps/mobile/package.json |
| ORM | Prisma Client và Prisma CLI 5.22.0 | apps/api/package.json |
| Database | PostgreSQL | datasource trong schema.prisma |
| Kiến trúc định hướng | Monorepo và Clean Architecture | CLAUDE.md cùng docs/17-clean-architecture.md |
| Cache và khóa phân tán | Redis | docker-compose.yml và RedisCacheModule |
| Dịch vụ hỗ trợ | Cloudinary, SMTP, Google OAuth và SePay | dependency, infrastructure và controller |

README ghi Prisma 6 và PostgreSQL 16. package.json lại khai báo Prisma 5.22.0. PostgreSQL 16 là phiên bản mục tiêu trong README, còn DDL ghi tương thích PostgreSQL 14 trở lên. Vì không có database đang chạy hoặc backup để truy vấn, phiên bản máy chủ thực tế là CẦN XÁC NHẬN.

Project được tổ chức thành ba ứng dụng trong apps gồm api, web và mobile. Các package dùng chung nằm trong packages gồm contracts, design-tokens và shared-kernel.

## 3. Cấu trúc backend

Backend có các tầng thư mục application, infrastructure, presentation và modules. Tuy nhiên source hiện tại chưa có tầng domain và repository port đúng như tài liệu Clean Architecture mô tả. Các application service đang inject PrismaService và truy vấn Prisma trực tiếp. Một số controller của AI, cộng đồng, thông báo, kế hoạch, gamification và khuyến mãi cũng truy vấn Prisma trực tiếp.

Vì vậy có thể mô tả kiến trúc của project là kiến trúc phân lớp theo định hướng Clean Architecture, nhưng không nên khẳng định source hiện tại tuân thủ đầy đủ Clean Architecture.

### 3.1. Module NestJS đang được đăng ký

| Module | Controller hoặc service chính | Chức năng thực tế |
|---|---|---|
| AuthModule | AuthController, AuthService | Đăng ký, đăng nhập, refresh token, đăng xuất, đổi và đặt lại mật khẩu, đăng nhập Google trên mobile |
| UserModule | UsersController, UsersService | Xem, tạo, cập nhật, khóa và mở khóa tài khoản |
| RoleModule | RolesController, RolesService | Quản lý role, permission và gán role cho người dùng |
| LessonModule | LessonsController, LessonsService | Tra cứu, tạo, cập nhật, xuất bản, lưu trữ và xóa bài học |
| VocabularyModule | VocabularyController, VocabularyService | Tra cứu, tạo, cập nhật và xóa từ vựng |
| QuestionModule | QuestionsController, QuestionsService | Tra cứu, tạo, cập nhật và xóa câu hỏi cùng phương án |
| ExamModule | ExamsController, ExamsService | Quản lý đề, tạo lượt thi, nộp bài, chấm điểm và xem lịch sử |
| ProgressModule | ProgressController, ProgressService, LeaderboardController | Theo dõi tiến độ, đánh dấu hoàn thành bài, streak, EXP, badge và bảng xếp hạng |
| LearnerProfileModule | LearnerProfilesController, LearnerProfilesService | Hồ sơ học tập, onboarding, cấp độ, lĩnh vực, mục tiêu nghề nghiệp và chứng chỉ |
| TaxonomyModule | TaxonomyController, TaxonomyService | Danh mục, chứng chỉ, nhóm học viên, kết quả, tiến độ tổng quan và dashboard |
| RecommendationModule | RecommendationController, RecommendationService | Đọc danh sách recommendation đã lưu của Học viên |
| PaymentModule | PaymentController, VoucherController, FlashSaleController, PaymentService | Đơn thanh toán SePay, subscription, voucher và flash sale |
| UploadModule | UploadController, CloudinaryService | Tải avatar và ảnh bài học |
| EmailModule | EmailService | Gửi OTP đặt lại mật khẩu |
| RedisCacheModule | RedisLockService | Khóa chống tạo đơn hoặc xử lý webhook đồng thời |

NotificationController, PlannerController, MockInterviewController, WritingController và DiscussionController được đăng ký trực tiếp trong AppModule. Chúng chưa có module nghiệp vụ riêng.

## 4. Audit Prisma schema và DDL

### 4.1. Số liệu đã kiểm tra độc lập

| Chỉ tiêu | Số lượng | Ghi chú |
|---|---:|---|
| Bảng ứng dụng | 53 | Tương ứng 53 model Prisma và 53 CREATE TABLE trong DDL |
| Bảng nghiệp vụ và hỗ trợ | 50 | Bao gồm bảng cốt lõi, bảng liên kết và bảng hỗ trợ sản phẩm |
| Bảng kỹ thuật trong schema ứng dụng | 3 | refresh_tokens, password_reset_tokens, progress_summary_cache |
| Enum | 16 | Tương ứng 16 enum trong Prisma schema và DDL |
| Khóa chính | 53 | Mỗi bảng có một ràng buộc khóa chính |
| Khóa chính đơn | 42 | Gồm UUID và một số khóa tự nhiên |
| Khóa chính tổ hợp | 11 | Chủ yếu ở bảng liên kết |
| Khóa ngoại | 71 | Đếm từ các ràng buộc FOREIGN KEY trong DDL |
| Unique constraint hoặc unique index ngoài PK | 23 | Gồm unique đơn và unique tổ hợp |
| CHECK constraint | 0 | Không có CHECK trong DDL hiện hành |

Bảng _prisma_migrations không được khai báo trong schema.prisma và không xuất hiện trong database_schema.sql nên không được tính vào 53 bảng trên. Nếu database thực tế được quản lý bằng Prisma Migrate thì bảng kỹ thuật này thường được tạo trong database. Khi đó tổng số bảng vật lý có thể là 54. Vì không có backup hoặc kết nối database, sự tồn tại của _prisma_migrations trong môi trường đang chạy là CẦN XÁC NHẬN.

### 4.2. Danh sách 11 khóa chính tổ hợp

1. role_permissions với role_id và permission_id
2. user_roles với user_id và role_id
3. certificate_domains với certificate_id và domain_id
4. learner_profile_domains với profile_id và domain_id
5. learner_profile_career_goals với profile_id và career_goal_id
6. learner_group_members với group_id và learner_id
7. lesson_vocabularies với lesson_id và vocabulary_id
8. lesson_certificates với lesson_id và certificate_id
9. question_certificates với question_id và certificate_id
10. exam_questions với exam_id và question_id
11. attempt_answer_options với answer_id và option_id

### 4.3. Quan hệ một đối một hoặc một đối không đến một

Các quan hệ sau được bảo đảm bằng khóa ngoại kết hợp unique:

- users với user_details là 1 đến 0..1
- users với learner_profiles là 1 đến 0..1
- users với user_subscriptions là 1 đến 0..1
- users với user_streaks là 1 đến 0..1
- payment_orders với user_subscriptions là 1 đến 0..1

progress_summary_cache sử dụng learner_id làm khóa chính nhưng không có khóa ngoại đến users. Không được mô tả đây là quan hệ một đối một được database bảo đảm.

### 4.4. Quan hệ nhiều đối nhiều được triển khai bằng bảng nối

- User và Role qua user_roles
- Role và Permission qua role_permissions
- Certificate và Domain qua certificate_domains
- LearnerProfile và Domain qua learner_profile_domains
- LearnerProfile và CareerGoal qua learner_profile_career_goals
- LearnerGroup và User qua learner_group_members
- Lesson và Vocabulary qua lesson_vocabularies
- Lesson và Certificate qua lesson_certificates
- Question và Certificate qua question_certificates
- Exam và Question qua exam_questions
- AttemptAnswer và QuestionOption qua attempt_answer_options

LearnerProfile và Certificate cũng có quan hệ nhiều đối nhiều theo nghĩa nghiệp vụ qua learner_certificate_goals. Bảng này có khóa riêng và thuộc tính target_date nên được xem là một thực thể liên kết có ý nghĩa nghiệp vụ, không phải bảng nối thuần túy.

### 4.5. Enum hiện hành

| Enum | Giá trị |
|---|---|
| UserStatus | active, inactive, suspended |
| ContentStatus | draft, published, archived |
| LessonType | vocabulary, terminology, technical_reading, api_documentation, system_design, case_study |
| LessonSectionType | heading, rich_text, image, audio, video, code, vocabulary_list, callout, quiz |
| QuestionType | single_choice, multiple_choice, true_false, short_answer, scenario |
| AttemptStatus | in_progress, submitted, graded, expired |
| ProgressStatus | not_started, in_progress, completed |
| ProgressResourceType | lesson, domain, certificate |
| LearnerGroupStatus | active, completed, archived |
| RecommendationResourceType | lesson, practice, exam |
| RecommendationFeedbackAction | helpful, not_helpful, dismissed, opened |
| LevelCode | beginner, intermediate, advanced, professional |
| OrderStatus | pending, paid, failed, expired, cancelled |
| SubscriptionStatus | active, expired, cancelled |
| MockInterviewStatus | in_progress, completed, abandoned |
| NotificationType | system, lesson_complete, streak, flash_sale, achievement, reminder |

### 4.6. Sai lệch giữa schema và migration

schema.prisma hiện có 53 model. Hai migration được commit chỉ tạo được 37 bảng sau khi áp dụng tuần tự. Có 16 bảng trong schema và DDL chưa có migration tạo bảng tương ứng:

- password_reset_tokens
- payment_orders
- user_subscriptions
- plan_quotas
- vouchers
- flash_sales
- user_streaks
- user_badges
- mock_interviews
- mock_interview_turns
- writing_submissions
- discussion_posts
- discussion_comments
- discussion_votes
- notifications
- learning_plan_items

Hai enum MockInterviewStatus và NotificationType cùng các enum thanh toán mới cũng không được tái tạo đầy đủ từ migration hiện có. Vì vậy không được viết rằng thư mục migration hiện tại có thể dựng đầy đủ database 53 bảng. CẦN XÁC NHẬN database triển khai đã được tạo bằng db push, bằng DDL tổng hợp hay bằng các migration chưa được đưa vào repository.

Dòng chú thích Total: 37 tables ở đầu schema.prisma đã cũ và không còn đúng với chính nội dung file.

## 5. Phân nhóm 53 bảng hiện hành

| Nhóm dữ liệu | Số bảng | Danh sách bảng |
|---|---:|---|
| Tài khoản và phân quyền | 8 | users, user_details, roles, permissions, role_permissions, user_roles, refresh_tokens, password_reset_tokens |
| Danh mục nền tảng | 5 | domains, levels, career_goals, certificates, certificate_domains |
| Hồ sơ và nhóm Học viên | 6 | learner_profiles, learner_profile_domains, learner_profile_career_goals, learner_certificate_goals, learner_groups, learner_group_members |
| Bài học, từ vựng và nội dung chứng chỉ | 7 | vocabularies, vocabulary_examples, lessons, lesson_sections, lesson_vocabularies, lesson_certificates, certification_contents |
| Ngân hàng câu hỏi và khảo thí | 8 | questions, question_options, question_certificates, exams, exam_questions, exam_attempts, attempt_answers, attempt_answer_options |
| Tiến độ và recommendation | 4 | learning_progress, progress_summary_cache, recommendations, recommendation_feedbacks |
| Kế hoạch và gamification | 3 | learning_plan_items, user_streaks, user_badges |
| Luyện tập có nhãn AI | 3 | mock_interviews, mock_interview_turns, writing_submissions |
| Cộng đồng | 3 | discussion_posts, discussion_comments, discussion_votes |
| Thông báo | 1 | notifications |
| Gói dịch vụ và thanh toán | 5 | payment_orders, user_subscriptions, plan_quotas, vouchers, flash_sales |
| Tổng cộng | 53 | Mỗi bảng được tính đúng một lần |

## 6. Audit phạm vi nghiệp vụ

| Phân hệ | Chức năng thực tế | Bảng chính | Xử lý chính | Actor |
|---|---|---|---|---|
| Người dùng, xác thực và phân quyền | Đăng ký, đăng nhập, refresh, logout, đổi và đặt lại mật khẩu, quản lý tài khoản, role và permission | users, user_details, roles, permissions, user_roles, role_permissions, refresh_tokens, password_reset_tokens | AuthService, UsersService, RolesService | Học viên, Giảng viên, Quản trị viên |
| Hồ sơ Học viên | Onboarding, chọn cấp độ, lĩnh vực, mục tiêu nghề nghiệp và chứng chỉ | learner_profiles cùng ba bảng liên kết mục tiêu | LearnerProfilesService | Học viên, Quản trị viên |
| Danh mục | Đọc level, domain, certificate, tạo và sửa certificate | domains, levels, career_goals, certificates, certificate_domains | TaxonomyService | Học viên, Giảng viên, Quản trị viên |
| Nhóm Học viên | Danh sách và tạo nhóm theo Giảng viên, domain và certificate | learner_groups, learner_group_members | TaxonomyService | Giảng viên, Quản trị viên |
| Bài học | CRUD, publish, archive, tra cứu chi tiết theo section | lessons, lesson_sections, lesson_vocabularies, lesson_certificates | LessonsService | Học viên, Giảng viên, Quản trị viên |
| Từ vựng | CRUD, tìm kiếm và lọc theo domain, level, lesson | vocabularies, vocabulary_examples, lesson_vocabularies | VocabularyService | Học viên, Giảng viên, Quản trị viên |
| Nội dung chứng chỉ | Lưu cấu trúc nội dung theo certificate | certification_contents | Schema và seed có dữ liệu, chưa thấy controller CRUD chuyên biệt | Học viên, Giảng viên |
| Ngân hàng câu hỏi | CRUD câu hỏi và phương án | questions, question_options, question_certificates | QuestionsService | Giảng viên, Quản trị viên, Học viên đọc câu luyện tập |
| Đề thi và lượt làm bài | CRUD đề, bắt đầu lượt làm, chấm tự động từ snapshot, xem lịch sử | exams, exam_questions, exam_attempts, attempt_answers, attempt_answer_options | ExamsService | Học viên, Giảng viên, Quản trị viên |
| Tiến độ | Đọc, upsert tiến độ và đánh dấu bài học hoàn thành | learning_progress, progress_summary_cache | ProgressService | Học viên, Giảng viên |
| Recommendation | Chỉ đọc tối đa 10 gợi ý đã lưu theo độ ưu tiên | recommendations, recommendation_feedbacks | RecommendationService | Học viên |
| Kế hoạch học tập | Tạo, đọc, cập nhật và xóa mục kế hoạch | learning_plan_items | PlannerController | Học viên |
| Gamification | Streak, EXP, badge và bảng xếp hạng | user_streaks, user_badges | LeaderboardController | Học viên |
| Mock Interview | Tạo phiên, lưu lượt hỏi đáp, tính điểm theo độ dài câu trả lời và phản hồi mẫu | mock_interviews, mock_interview_turns | MockInterviewController | Học viên |
| Writing Practice | Trả danh sách prompt cố định, lưu bài và chấm theo heuristic ngẫu nhiên | writing_submissions | WritingController | Học viên |
| Cộng đồng | Danh sách bài viết, chi tiết, tạo bài, bình luận, vote và xóa bài của chính mình | discussion_posts, discussion_comments, discussion_votes | DiscussionController | Học viên |
| Thông báo | Đọc thông báo cá nhân và broadcast, đánh dấu đã đọc, Quản trị viên tạo và xóa | notifications | NotificationController | Học viên, Quản trị viên |
| Thanh toán | Tạo đơn SePay, kiểm tra trạng thái, xử lý webhook, gia hạn subscription | payment_orders, user_subscriptions, plan_quotas | PaymentService | Học viên |
| Khuyến mãi | Áp dụng voucher, quản lý voucher và flash sale | vouchers, flash_sales | VoucherController, FlashSaleController | Học viên, Quản trị viên |

## 7. Kiểm tra riêng về AI

### 7.1. Kết quả tồn tại

- AIConversation không tồn tại trong schema và source
- AIMessage không tồn tại trong schema và source
- AI Learning Error không tồn tại trong schema và source
- AI Saved Vocabulary không tồn tại trong schema và source
- Mock Interview còn tồn tại với hai bảng mock_interviews và mock_interview_turns
- Writing Practice còn tồn tại với bảng writing_submissions
- Recommendation thuộc module cá nhân hóa riêng
- Không có bảng writing_prompts. Prompt viết nằm trong hằng số của controller
- Không có lời gọi OpenAI, Gemini hoặc một nhà cung cấp mô hình AI trong controller Mock Interview và Writing Practice

### 7.2. Cách mô tả đúng

Ở trạng thái source hiện tại, Mock Interview và Writing Practice là chức năng luyện tập có giao diện và lưu dữ liệu, nhưng phản hồi được tạo bằng quy tắc heuristic và mẫu câu có sẵn. Không nên khẳng định hệ thống đã tích hợp mô hình AI sinh nội dung hoặc đánh giá ngôn ngữ thực sự.

Recommendation chỉ có endpoint đọc các bản ghi đã tồn tại. Chưa có service tạo recommendation từ hồ sơ, mục tiêu, tiến độ và kết quả. Vì vậy có thể mô tả cấu trúc dữ liệu phục vụ cá nhân hóa, nhưng phải ghi rõ cơ chế sinh gợi ý tự động là CẦN XÁC NHẬN.

## 8. Cộng đồng, thông báo và thanh toán

Community, Notification, Subscription, Payment, Voucher và Flash Sale đều có model, controller hoặc service cùng giao diện Web hoặc Mobile. Chúng nằm trong phạm vi sản phẩm hiện tại. Tuy nhiên đây là các chức năng hỗ trợ, không phải trọng tâm học tiếng Anh chuyên ngành CNTT. Trong khóa luận nên trình bày ngắn gọn ở nhóm dữ liệu hỗ trợ và chỉ mô tả chi tiết khi cần giải thích quan hệ hoặc ràng buộc thanh toán.

## 9. Sai lệch source cần phản ánh trong tài liệu

Các điểm sau không được tự sửa trong nhiệm vụ này, nhưng phải được ghi nhận:

- Lesson DTO dùng các giá trị reading, vocabulary, mixed và scenario, không khớp hoàn toàn với LessonType trong Prisma
- Question DTO dùng fill_blank và ordering nhưng Prisma dùng single_choice, short_answer và scenario
- ExamsService tạo đề chưa xử lý danh sách questions từ DTO để ghi exam_questions
- submitAttempt chấm trên questions_snapshot nhưng chưa tạo attempt_answers và attempt_answer_options
- RecommendationService chỉ đọc dữ liệu, chưa sinh recommendation và chưa ghi feedback
- Mock Interview và Writing Practice chưa gọi mô hình AI
- Một số Web và Mobile screen gọi endpoint hoặc tên trường không khớp controller, ví dụ payments thay cho payment, gamification thay cho leaderboard, PATCH auth/me, plannedAt so với date, userText so với content
- progress_summary_cache có learner_id là khóa chính nhưng không có khóa ngoại đến users
- learning_progress dùng resource_type và resource_id. DDL hiện chỉ có khóa ngoại learner_id và không có khóa ngoại vật lý từ resource_id đến ba bảng tài nguyên
- Application service phụ thuộc trực tiếp PrismaService, không đúng hoàn toàn với boundary Clean Architecture được mô tả trong tài liệu project

## 10. Kết luận audit

Nguồn dữ liệu hiện hành cần dùng cho Chương 3 là schema 53 model và DDL 53 bảng. Bản Word mới nhất vẫn dùng mô hình 75 bảng và nhiều bảng cũ không còn tồn tại. Mô hình phân tích hiện tại dùng tên bảng, cột kỹ thuật và hai lớp tiến độ không có trong schema nên cần làm lại. Việc thiếu migration cho 16 bảng là rủi ro kỹ thuật cần xác nhận trước khi khẳng định database triển khai có thể được tái tạo hoàn chỉnh.
