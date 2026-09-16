# CHECKLIST CHỈNH SỬA KHÓA LUẬN

## A. Xác nhận nguồn dữ liệu

- [ ] Ghi nhận `apps/api/prisma/schema.prisma` và `database_schema.sql` là nguồn chuẩn cho Chương 3
- [ ] Không dùng các con số 37 bảng hoặc 75 bảng từ tài liệu cũ làm số liệu hiện tại
- [ ] Xác nhận với nhóm cách cơ sở dữ liệu triển khai được tạo từ Prisma Migrate, `prisma db push` hay file DDL
- [ ] Xác nhận cơ sở dữ liệu chạy thực tế có bảng `_prisma_migrations` hay không
- [ ] Nếu có backup PostgreSQL mới hơn, kiểm đếm lại trước khi nộp và cập nhật toàn bộ con số liên quan

## B. Sửa mục 2.3 của Chương 2

- [ ] Thay toàn bộ nội dung mục 2.3 bằng nội dung trong `03_chapter2_section_2_3_final.md`
- [ ] Thay Hình 33 cũ bằng sơ đồ lớp mức phân tích mới gồm 37 lớp
- [ ] Đổi 16 tên bảng cũ sang tên lớp nghiệp vụ dạng số ít PascalCase
- [ ] Xóa `learner_profile_career_goals` khỏi vai trò class và thay bằng association LearnerProfile với CareerGoal
- [ ] Xóa `lesson_vocabularies` khỏi vai trò class và thay bằng association Lesson với Vocabulary
- [ ] Xóa `lesson_progress` và `vocabulary_progress`
- [ ] Bổ sung `LearningProgress` làm lớp tiến độ chung
- [ ] Bổ sung Role và Permission
- [ ] Bổ sung LearnerGroup và LessonSection
- [ ] Bổ sung Recommendation và RecommendationFeedback
- [ ] Bổ sung LearningPlanItem, UserStreak và UserBadge
- [ ] Bổ sung MockInterview, MockInterviewTurn và WritingSubmission
- [ ] Bổ sung DiscussionPost, DiscussionComment, DiscussionVote và Notification
- [ ] Bổ sung PaymentOrder, UserSubscription, Voucher và FlashSale
- [ ] Giữ ExamQuestion vì lớp này có order và weight
- [ ] Xóa toàn bộ kiểu dữ liệu SQL, khóa ngoại và chỉ mục khỏi sơ đồ lớp phân tích
- [ ] Không thêm method vào class
- [ ] Sửa liên kết ExamAttempt từ LearnerProfile sang UserAccount
- [ ] Xóa question_snapshot khỏi AttemptAnswer
- [ ] Đặt questionsSnapshot và examSnapshot tại ExamAttempt
- [ ] Kiểm tra multiplicity theo bảng trong `02_analysis_model_revision.md`
- [ ] Bảo đảm `UserAccount → LearnerProfile` là 1 đến 0..1
- [ ] Bảo đảm các quan hệ Role, Permission, Domain, CareerGoal và Vocabulary nhiều đối nhiều được vẽ đúng
- [ ] Ghi giải thích vì sao 37 lớp phân tích nhỏ hơn 53 bảng thiết kế

## C. Sửa mô tả Use Case và chức năng

- [ ] Xóa Use Case hỏi đáp AI tự do nếu báo cáo đang mô tả như chức năng đã có
- [ ] Xóa mô tả AIConversation, AIMessage, AILearningError và AISavedVocabulary
- [ ] Mô tả Mock Interview là luyện phỏng vấn với câu hỏi và phản hồi theo cơ chế hiện tại
- [ ] Mô tả Writing là luyện viết và phản hồi tự động theo quy tắc hiện tại
- [ ] Không khẳng định source đang gọi mô hình ngôn ngữ hoặc nhà cung cấp AI
- [ ] Xếp Recommendation vào nhóm cá nhân hóa
- [ ] Ghi rõ RecommendationService hiện chỉ đọc đề xuất đã lưu
- [ ] Không khẳng định đã có luồng sinh recommendation hoặc ghi feedback hoàn chỉnh
- [ ] Giữ Community, Notification, Gamification và Payment như chức năng hỗ trợ
- [ ] Không để các chức năng hỗ trợ chiếm trọng tâm lớn hơn bài học, từ vựng, khảo thí và tiến độ
- [ ] Kiểm tra bảng truy vết Use Case trong `06_consistency_audit.md`

## D. Làm lại Chương 3

- [ ] Thay nội dung Chương 3 cũ bằng `04_chapter3_final.md`
- [ ] Sửa số lượng thành 53 bảng ứng dụng
- [ ] Ghi rõ 50 bảng nghiệp vụ hoặc hỗ trợ và 3 bảng kỹ thuật ứng dụng
- [ ] Sửa số enum thành 16
- [ ] Sửa số khóa chính thành 53
- [ ] Sửa số khóa ngoại thành 71
- [ ] Sửa số khóa chính ghép thành 11
- [ ] Sửa số ràng buộc hoặc chỉ mục duy nhất ngoài khóa chính thành 23
- [ ] Ghi rõ DDL hiện tại có 0 CHECK constraint
- [ ] Dùng Bảng 3.1 để phân nhóm đủ 53 bảng, không thiếu và không tính lặp
- [ ] Ghi `_prisma_migrations` là bảng kỹ thuật có thể tồn tại và CẦN XÁC NHẬN, không cộng vào 53
- [ ] Xóa mọi mô tả schema 75 bảng
- [ ] Xóa các bảng cũ không còn trong schema
- [ ] Xóa `writing_prompts` và `landing_banners`
- [ ] Không đưa `lesson_progress` hoặc `vocabulary_progress` vào thiết kế
- [ ] Dùng đúng 16 enum và giá trị enum từ schema hiện tại
- [ ] Không gọi validation ở DTO hoặc service là CHECK constraint
- [ ] Nêu rõ `learning_progress.resource_id` không có FK vật lý đến bảng tài nguyên
- [ ] Nêu rõ `recommendations.resource_id` không có FK vật lý đến bảng tài nguyên
- [ ] Nêu rõ `attempt_answers.question_id` không có FK vật lý đến questions
- [ ] Nêu rõ `progress_summary_cache.learner_id` không có FK đến users
- [ ] Không tự nối `payment_orders.voucher_id` đến vouchers
- [ ] Không tự nối các trường plan_id giữa những bảng thanh toán
- [ ] Thêm bảng ánh xạ 37 lớp phân tích sang 53 bảng thiết kế
- [ ] Giải thích bảng nối, bảng chi tiết, token, cache và quota làm tăng số bảng vật lý

## E. Thay hệ thống hình ERD

- [ ] Thay Hình 3.1 bằng sơ đồ tổng quan 11 nhóm dữ liệu
- [ ] Vẽ Hình 3.2 về tài khoản và phân quyền
- [ ] Vẽ Hình 3.3 về danh mục, hồ sơ và nhóm Học viên
- [ ] Vẽ Hình 3.4 về bài học, từ vựng và nội dung chứng chỉ
- [ ] Vẽ Hình 3.5 về câu hỏi và khảo thí
- [ ] Vẽ Hình 3.6 về tiến độ và đề xuất
- [ ] Vẽ Hình 3.7 về kế hoạch và khuyến khích học tập
- [ ] Vẽ Hình 3.8 về thực hành có nhãn AI
- [ ] Vẽ Hình 3.9 về cộng đồng và thông báo
- [ ] Vẽ Hình 3.10 về thanh toán và khuyến mãi
- [ ] Kiểm tra đúng danh sách bảng của từng hình theo `05_diagram_instructions.md`
- [ ] Chỉ vẽ FK thật sự có trong DDL
- [ ] Dùng users, domains, levels và certificates làm bảng neo lặp khi cần
- [ ] Kiểm tra chú thích rằng bảng lặp trên hình không bị tính lặp trong tổng số 53
- [ ] Kiểm tra chữ đọc được khi hình được chèn vào bản Word

## F. Trình bày khoảng cách giữa thiết kế và source

- [ ] Ghi rõ hai migration hiện có chỉ tạo lũy kế 37 bảng và 12 enum
- [ ] Liệt kê 16 bảng chưa có lệnh tạo trong chuỗi migration hiện tại
- [ ] Đánh dấu quy trình tái tạo database là CẦN XÁC NHẬN
- [ ] Ghi rõ ExamsService tạo đề chưa ghi danh sách vào exam_questions
- [ ] Ghi rõ luồng nộp bài chưa tạo attempt_answers và attempt_answer_options
- [ ] Không viết rằng các bảng câu trả lời đã được sử dụng đầy đủ nếu chưa sửa source
- [ ] Ghi nhận enum Lesson DTO không khớp lesson_type nếu phần API có mô tả
- [ ] Ghi nhận enum Question DTO không khớp question_type nếu phần API có mô tả
- [ ] Không khẳng định hệ thống tuân thủ Clean Architecture hoàn chỉnh
- [ ] Dùng cụm kiến trúc phân lớp định hướng Clean Architecture

## G. Kiểm tra hình thức trước khi gửi giảng viên

- [ ] Dùng nhất quán các thuật ngữ Use Case, Học viên, Giảng viên và Quản trị viên
- [ ] Giữ nguyên tên class, table và field tiếng Anh khi nói đến thành phần trong project
- [ ] Không dùng dấu chấm phẩy trong mục 2.3 và Chương 3
- [ ] Không dùng câu quảng cáo hoặc khẳng định vượt quá chức năng đã kiểm chứng
- [ ] Đánh số lại bảng và hình theo vị trí thực tế trong file Word
- [ ] Cập nhật mục lục, danh mục hình và danh mục bảng
- [ ] Kiểm tra mọi tham chiếu Hình 3.x sau khi thay hình
- [ ] Kiểm tra tổng từng nhóm trong Bảng 3.1 bằng 53
- [ ] Kiểm tra sơ đồ phân tích có đúng 37 lớp
- [ ] Đọc lại bảng lỗi trong `06_consistency_audit.md`
- [ ] Xuất PDF và kiểm tra hình không bị mờ, cắt hoặc tràn lề
- [ ] Nhờ một thành viên khác đối chiếu ngẫu nhiên ít nhất 10 bảng với schema trước khi nộp

## H. Các câu trả lời ngắn khi bảo vệ

- [ ] Chuẩn bị trả lời vì sao sơ đồ phân tích có 37 lớp nhưng cơ sở dữ liệu có 53 bảng
- [ ] Chuẩn bị nêu 11 bảng có khóa chính ghép
- [ ] Chuẩn bị giải thích tham chiếu đa hình của learning_progress
- [ ] Chuẩn bị giải thích ExamQuestion được giữ như association class vì có order và weight
- [ ] Chuẩn bị phân biệt ràng buộc vật lý với validation ở service
- [ ] Chuẩn bị giải thích vì sao không gọi Mock Interview và Writing là tích hợp AI hoàn chỉnh
- [ ] Chuẩn bị trình bày khoảng cách giữa schema 53 bảng và migration 37 bảng
