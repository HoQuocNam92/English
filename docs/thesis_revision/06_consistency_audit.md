# KIỂM TRA TÍNH NHẤT QUÁN

## 1. Phạm vi đối chiếu

Kết quả được đối chiếu theo chuỗi `Use Case → mô hình dữ liệu mức phân tích → schema và DDL → controller và service`. Nguồn chuẩn là project hiện tại và `NHOM_NGHIENCUU_DT04 (4).docx` chỉ được dùng để xác định nội dung báo cáo đang cần sửa.

## 2. Truy vết Use Case đến lớp phân tích và source

| Use Case hoặc chức năng | Actor | Lớp phân tích liên quan | Căn cứ triển khai | Đánh giá |
|---|---|---|---|---|
| Đăng ký, đăng nhập, làm mới phiên, đăng xuất, đổi mật khẩu | Người dùng | UserAccount | AuthController, AuthService, users, refresh_tokens, password_reset_tokens | Có đủ dữ liệu và endpoint |
| Đăng nhập Google trên mobile | Người dùng | UserAccount | Endpoint Google mobile trong AuthController | Có trong source |
| Quản lý tài khoản và trạng thái | Quản trị viên | UserAccount | UsersController, UsersService, users, user_details | Có trong source |
| Quản lý vai trò và quyền | Quản trị viên | UserAccount, Role, Permission | Role module, guards, user_roles, role_permissions | Có trong source |
| Thiết lập hồ sơ học tập | Học viên | LearnerProfile, Domain, Level, CareerGoal, Certificate, LearnerCertificateGoal | LearnerProfile module, Taxonomy module, các bảng hồ sơ | Có trong source |
| Quản lý nhóm Học viên và xem kết quả | Giảng viên | LearnerGroup, UserAccount, Domain, Certificate, LearningProgress, ExamAttempt | Endpoint learners, groups, results, progress và dashboard trong TaxonomyController | Có trong source |
| Xem danh mục lĩnh vực, cấp độ, nghề nghiệp và chứng chỉ | Người dùng | Domain, Level, CareerGoal, Certificate | TaxonomyController, TaxonomyService | Có trong source |
| Quản lý bài học | Giảng viên hoặc người có quyền | Lesson, LessonSection, Vocabulary, Certificate | LessonsController, LessonsService và các bảng nội dung | Có CRUD, publish và archive |
| Học bài học | Học viên | Lesson, LessonSection, Vocabulary, LearningProgress | API bài học, ProgressController, learning_progress | Có dữ liệu hỗ trợ |
| Quản lý và tra cứu từ vựng | Người dùng có quyền, Học viên | Vocabulary, Domain, Level | VocabularyController, VocabularyService | Có CRUD, tìm kiếm và lọc |
| Quản lý ngân hàng câu hỏi | Giảng viên hoặc người có quyền | Question, QuestionOption, Certificate | QuestionsController, QuestionsService | Có CRUD |
| Cấu hình đề thi | Giảng viên hoặc người có quyền | Exam, ExamQuestion, Question | ExamsController, ExamsService, exams, exam_questions | Có CRUD nhưng luồng tạo chưa ghi danh sách câu hỏi |
| Bắt đầu và nộp bài thi | Học viên | Exam, ExamAttempt, AttemptAnswer, QuestionOption | ExamsService, exam_attempts và các bảng câu trả lời | Chấm trên snapshot, chưa lưu attempt_answers trong luồng hiện tại |
| Theo dõi tiến độ | Học viên, Giảng viên | LearningProgress | ProgressController, TaxonomyController, learning_progress | Có đọc, upsert và đánh dấu hoàn thành bài học |
| Xem đề xuất học tập | Học viên | Recommendation | RecommendationController, RecommendationService, recommendations | Chỉ đọc đề xuất đã lưu |
| Phản hồi đề xuất | Học viên | RecommendationFeedback | recommendation_feedbacks | Có bảng nhưng chưa thấy endpoint ghi trong module hiện tại |
| Quản lý kế hoạch học tập | Người dùng | LearningPlanItem, Lesson | PlannerController, PlannerService, learning_plan_items | Có CRUD |
| Xem chuỗi học, điểm kinh nghiệm và huy hiệu | Học viên | UserStreak, UserBadge | Leaderboard controller và service | Có trong source |
| Luyện phỏng vấn thử | Học viên | MockInterview, MockInterviewTurn | MockInterviewController và service | Có phiên và lượt hỏi đáp, chưa có lời gọi mô hình AI |
| Luyện viết | Học viên | WritingSubmission | WritingController và service | Có nộp bài và chấm theo quy tắc, chưa có lời gọi mô hình AI |
| Đăng bài, bình luận và bỏ phiếu | Người dùng | DiscussionPost, DiscussionComment, DiscussionVote | DiscussionController và service | Có trong source |
| Nhận và quản lý thông báo | Người dùng, Quản trị viên | Notification | NotificationController và service | Có thông báo cá nhân và phát rộng |
| Tạo đơn, nhận webhook và xem gói | Người dùng, hệ thống thanh toán | PaymentOrder, UserSubscription, Voucher, FlashSale | PaymentController, PaymentService, Redis lock, webhook SePay | Có trong source và schema |
| Tải ảnh đại diện và ảnh bài học | Người dùng có quyền | UserAccount, Lesson | UploadController, Cloudinary service | Có trong source, URL được lưu trên bảng liên quan |

Không có lớp nào trong danh sách 37 lớp hoàn toàn tách khỏi nghiệp vụ. `RecommendationFeedback` có dữ liệu thiết kế nhưng thiếu luồng ghi hoàn chỉnh trong controller hiện tại. `Voucher` và `FlashSale` là cấu hình hỗ trợ cho Use Case thanh toán. Các lớp cộng đồng, thông báo, gamification và thanh toán có căn cứ nhưng cần trình bày ngắn hơn nhóm học tập cốt lõi.

## 3. Kiểm tra riêng phạm vi AI

| Khái niệm hoặc chức năng | Schema hiện tại | Source hiện tại | Kết luận dùng trong báo cáo |
|---|---|---|---|
| AIConversation | Không có | Không có module tương ứng | Bắt buộc loại bỏ |
| AIMessage | Không có | Không có module tương ứng | Bắt buộc loại bỏ |
| AI Learning Error | Không có | Không có module tương ứng | Bắt buộc loại bỏ |
| AI Saved Vocabulary | Không có | Không có module tương ứng | Bắt buộc loại bỏ |
| Mock Interview | Có 2 bảng | Có controller và service, câu hỏi cố định và phản hồi theo quy tắc | Giữ như chức năng luyện tập, không khẳng định dùng mô hình AI |
| Writing | Có writing_submissions | Có controller và service, prompt trong bộ nhớ và điểm theo quy tắc | Giữ như chức năng luyện viết và phản hồi tự động |
| Recommendation | Có 2 bảng | Service chỉ đọc đề xuất đã lưu | Xếp vào cá nhân hóa, không khẳng định tự sinh bằng AI |

## 4. Các điểm không nhất quán cần xử lý

| Vị trí | Nội dung hiện tại | Vấn đề | Cách sửa | Mức độ |
|---|---|---|---|---|
| Chương 3, phần tổng quan | Cơ sở dữ liệu có 75 bảng và hơn 100 khóa ngoại | Không khớp schema và DDL hiện tại | Sửa thành 53 bảng ứng dụng, 71 khóa ngoại và dùng Bảng 3.1 mới | Bắt buộc sửa |
| Hình 3.1 cũ | Chia nhóm tổng cộng 75 bảng và cộng `_prisma_migrations` | Dùng thiết kế cũ, số lượng nhóm không còn đúng | Thay bằng sơ đồ tổng quan 11 nhóm, ghi chú `_prisma_migrations` CẦN XÁC NHẬN và không cộng vào 53 | Bắt buộc sửa |
| Các ERD cũ | Có vocabulary_sources, certification_objectives, objective_vocabularies, objective_questions và objective_labs | Các bảng không có trong schema hiện tại | Xóa và vẽ lại theo 9 ERD trong file hướng dẫn | Bắt buộc sửa |
| Các ERD cũ | Có hands_on_labs, learner_objective_mastery, user_monthly_goals và user_saved_vocabularies | Các bảng không tồn tại | Xóa khỏi Chương 3 | Bắt buộc sửa |
| Các ERD cũ | Có learning_paths, learning_path_modules, learning_sessions, career_skills và learner_career_skill_progress | Các bảng không tồn tại | Xóa, dùng learning_plan_items cho kế hoạch học hiện có | Bắt buộc sửa |
| Phần AI cũ | Có ai_conversations, ai_messages, ai_learning_errors và ai_saved_vocabulary | Không có schema hoặc module tương ứng | Xóa toàn bộ các bảng và mô tả liên quan | Bắt buộc sửa |
| Phần Writing cũ | Có writing_prompts | Schema chỉ có writing_submissions, prompt nằm trong source | Không mô tả writing_prompts là bảng | Bắt buộc sửa |
| Phần hỗ trợ cũ | Có landing_banners | Không có trong schema hiện tại | Xóa khỏi ERD và mô tả | Bắt buộc sửa |
| Hình 33, mục 2.3 | Dùng 20 tên bảng dạng snake_case và hiển thị cột vật lý | Đây là ERD thu nhỏ, không phải sơ đồ lớp mức phân tích | Thay bằng 37 class PascalCase và thuộc tính nghiệp vụ chính | Bắt buộc sửa |
| Hình 33, users | Chứa role, display_name, avatar và last_login trực tiếp | Role là quan hệ, còn dữ liệu cá nhân nằm ở user_details | Dùng UserAccount và nối Role, chỉ giữ thuộc tính nghiệp vụ chọn lọc | Bắt buộc sửa |
| Hình 33 | Có learner_profile_career_goals và lesson_vocabularies như class | Đây là bảng nối thuần túy | Thay bằng association nhiều đối nhiều | Bắt buộc sửa |
| Hình 33 | Có lesson_progress và vocabulary_progress | Hai bảng này không tồn tại | Thay bằng LearningProgress | Bắt buộc sửa |
| Hình 33, exam_attempts | Dùng learner_profile_id | Schema dùng learner_id tham chiếu users | Nối ExamAttempt với UserAccount | Bắt buộc sửa |
| Hình 33, attempt_answers | Có question_snapshot | Trường này nằm ở exam_attempts dưới tên questions_snapshot | Xóa khỏi AttemptAnswer và giữ snapshot ở ExamAttempt | Bắt buộc sửa |
| Use Case hỗ trợ AI | Mô tả hỏi đáp tự do, sửa lỗi, hội thoại và lưu từ vựng bằng AI | Không có module, bảng hoặc lời gọi nhà cung cấp AI tương ứng | Thay bằng Mock Interview và Writing theo cơ chế hiện có | Bắt buộc sửa |
| Phần Recommendation | Khẳng định hệ thống tự sinh gợi ý thông minh | Service hiện chỉ đọc tối đa 10 bản ghi đã lưu | Mô tả là đề xuất học tập đã lưu, đánh dấu cơ chế sinh là CẦN XÁC NHẬN | Bắt buộc sửa |
| Phần kiến trúc | Khẳng định tuân thủ Clean Architecture hoàn chỉnh | Application service nhập và gọi PrismaService trực tiếp, một số controller cũng truy vấn Prisma | Dùng cụm kiến trúc phân lớp định hướng Clean Architecture | Nên sửa |
| Migration | Mô tả migration có thể tạo toàn bộ schema | Hai migration chỉ tạo lũy kế 37 bảng và 12 enum | Nêu khoảng cách 16 bảng và đánh dấu quy trình tạo DB là CẦN XÁC NHẬN | Bắt buộc sửa |
| schema.prisma | Ghi chú đầu file nói tổng 37 bảng | Thực tế schema có 53 model | Không lấy ghi chú này làm số liệu báo cáo | Nên sửa báo cáo, không sửa source theo phạm vi yêu cầu |
| Lesson DTO và enum | DTO dùng reading, vocabulary, mixed, scenario | Không khớp lesson_type trong Prisma | Báo cáo dùng enum từ schema, không dùng danh sách DTO làm cấu trúc DB | Nên sửa phần mô tả API nếu có |
| Question DTO và enum | DTO dùng multiple_choice, true_false, fill_blank, ordering | Không khớp đầy đủ question_type trong Prisma | Báo cáo dùng enum schema và ghi nhận khoảng cách triển khai | Nên sửa phần mô tả API nếu có |
| Tạo đề thi | DTO có danh sách questions | Service chưa tạo exam_questions | Không khẳng định cấu hình câu hỏi đã được lưu đầy đủ từ luồng tạo đề | Bắt buộc sửa mô tả hiện trạng |
| Nộp bài thi | Báo cáo có thể mô tả lưu từng câu trả lời | Service chỉ cập nhật exam_attempts, chưa tạo attempt_answers và attempt_answer_options | Phân biệt thiết kế dữ liệu với phần đã triển khai | Bắt buộc sửa mô tả hiện trạng |
| LearningProgress | Vẽ resource_id nối trực tiếp đến nhiều bảng | DDL không có các FK vật lý này | Chỉ ghi đây là tham chiếu đa hình được ứng dụng kiểm soát | Bắt buộc sửa ERD |
| progress_summary_cache | Có thể được vẽ liên kết users | DDL không có FK learner_id đến users | Không vẽ FK và đánh dấu CẦN XÁC NHẬN | Bắt buộc sửa ERD |
| PaymentOrder | Có thể nối voucher_id đến vouchers hoặc plan_id đến bảng gói | DDL không khai báo các FK đó | Không tự tạo đường nối | Bắt buộc sửa ERD |
| Web và Mobile | Một số màn hình gọi `/payments/my-orders`, `/gamification/my-streak` hoặc PATCH `/auth/me` | Không khớp controller hiện tại | Không dùng các đường dẫn này làm căn cứ khẳng định chức năng đã chạy xuyên suốt | Nên sửa phần triển khai hoặc kiểm thử sau khóa luận |
| Planner và Writing trên client | Có payload `date`, `durationMinutes`, `promptId`, `content` | Backend dùng `plannedAt`, `durationMin`, `prompt`, `topic`, `userText` | Mô tả theo hợp đồng backend và ghi nhận cần đồng bộ client | Nên sửa phần kiểm thử |
| Công cụ vẽ ERD | Hướng dẫn dùng SSMS cho PostgreSQL | SSMS không phải công cụ gốc của PostgreSQL | Có thể dùng pgAdmin, DBeaver, DataGrip hoặc công cụ ERD hỗ trợ PostgreSQL | Nên sửa |

## 5. Kết luận kiểm tra chéo

Mô hình 37 lớp đã bao phủ các Use Case có căn cứ trong project. Thiết kế 53 bảng cung cấp dữ liệu cho các lớp đó và thêm các bảng nối, bảng chi tiết cùng cấu trúc kỹ thuật. Không có căn cứ để giữ các thực thể AI và lộ trình học từ schema cũ.

Ba khoảng cách quan trọng giữa schema và phần triển khai cần được trình bày trung thực là luồng tạo đề chưa ghi `exam_questions`, luồng nộp bài chưa ghi các bảng câu trả lời và module recommendation chưa có chức năng sinh hoặc ghi phản hồi. Ngoài ra, chuỗi migration hiện tại chưa đủ để tái tạo schema 53 bảng. Các điểm này không được che giấu bằng mô tả chức năng rộng hơn source.
