# 2.3. MÔ HÌNH DỮ LIỆU MỨC PHÂN TÍCH

Mô hình dữ liệu mức phân tích mô tả các khái niệm nghiệp vụ mà hệ thống cần quản lý và mối liên hệ giữa các khái niệm đó. Mô hình được xây dựng từ các Use Case, chức năng hiện có trong source code và schema cơ sở dữ liệu hiện tại. Ở mức này, mỗi lớp đại diện cho một đối tượng có ý nghĩa đối với người sử dụng hoặc quy trình nghiệp vụ. Các bảng nối thuần túy, bảng token, bảng cache và chi tiết triển khai vật lý không được đưa đầy đủ vào sơ đồ.

Sơ đồ lớp mức phân tích của hệ thống gồm 37 lớp. Số lớp này nhỏ hơn số bảng trong thiết kế cơ sở dữ liệu vì một lớp phân tích có thể được triển khai bằng nhiều bảng, trong khi quan hệ nhiều đối nhiều có thể được chuyển thành bảng trung gian. Việc tách riêng hai mức mô hình giúp sơ đồ phân tích tập trung vào nghiệp vụ và vẫn bảo đảm khả năng truy vết sang thiết kế ở Chương 3.

## 2.3.1. Các nhóm thực thể trong mô hình

### 2.3.1.1. Nhóm tài khoản, hồ sơ học tập và phân quyền

`UserAccount` đại diện cho tài khoản của Học viên, Giảng viên hoặc Quản trị viên. Lớp này lưu các thông tin nhận diện và trạng thái tài khoản cần thiết cho nghiệp vụ. Thông tin xác thực chi tiết như token làm mới và token đặt lại mật khẩu là dữ liệu kỹ thuật nên không được mô hình hóa thành lớp phân tích độc lập.

`LearnerProfile` biểu diễn hồ sơ học tập của Học viên, gồm cấp độ hiện tại, giới thiệu cá nhân, mục tiêu thời lượng học theo tuần và trạng thái hoàn tất quá trình thiết lập ban đầu. Một tài khoản có thể chưa có hồ sơ học tập hoặc có tối đa một hồ sơ học tập.

`Role` và `Permission` mô tả cơ chế phân quyền. Một tài khoản có thể được gán nhiều vai trò và một vai trò có thể được gán cho nhiều tài khoản. Tương tự, một vai trò có thể chứa nhiều quyền và một quyền có thể thuộc nhiều vai trò. Các lớp này là căn cứ để giới hạn thao tác quản trị, quản lý nội dung và sử dụng chức năng theo actor.

`LearnerGroup` biểu diễn nhóm Học viên do Giảng viên quản lý. Nhóm hỗ trợ việc tập hợp thành viên, theo dõi kết quả và tiến độ. Quan hệ thành viên được thể hiện giữa `LearnerGroup` và `UserAccount`, không tạo lớp riêng cho bảng nối ở mức phân tích.

### 2.3.1.2. Nhóm danh mục và mục tiêu học tập

`Domain` mô tả lĩnh vực chuyên môn CNTT như phát triển phần mềm, mạng máy tính hoặc dữ liệu. `Level` mô tả cấp độ của người học và nội dung. Hai lớp này được sử dụng để phân loại hồ sơ học tập, bài học, từ vựng, câu hỏi và đề thi.

`CareerGoal` biểu diễn mục tiêu nghề nghiệp mà Học viên lựa chọn. Một hồ sơ học tập có thể hướng đến nhiều mục tiêu nghề nghiệp và một mục tiêu có thể được nhiều Học viên lựa chọn. Hồ sơ học tập cũng có thể quan tâm đến nhiều lĩnh vực chuyên môn thông qua quan hệ với `Domain`.

`Certificate` đại diện cho chứng chỉ nghề nghiệp. `LearnerCertificateGoal` ghi nhận một chứng chỉ mà Học viên đặt làm mục tiêu và ngày dự kiến đạt được nếu có. Lớp mục tiêu chứng chỉ được giữ độc lập vì nó mang thông tin nghiệp vụ riêng, không chỉ thực hiện vai trò liên kết.

### 2.3.1.3. Nhóm nội dung học tập, từ vựng và chứng chỉ

`Lesson` là lớp trung tâm của nội dung học tập, biểu diễn một bài học tiếng Anh chuyên ngành theo lĩnh vực và cấp độ. Mỗi bài học gồm nhiều `LessonSection`. Các phần được sắp xếp theo thứ tự và có thể chứa văn bản, hình ảnh, âm thanh, video, mã nguồn, danh sách từ vựng hoặc nội dung luyện tập tùy loại đã được hệ thống quy định.

`Vocabulary` biểu diễn từ hoặc thuật ngữ chuyên ngành, gồm từ vựng, phiên âm, phát âm, từ loại, định nghĩa và nhãn phân loại. Mỗi từ vựng thuộc một lĩnh vực và một cấp độ. Một bài học có thể sử dụng nhiều từ vựng và một từ vựng có thể xuất hiện trong nhiều bài học. Tập ví dụ của từ vựng được xem là thành phần thuộc `Vocabulary` ở mức phân tích.

`CertificationContent` biểu diễn nội dung ôn tập theo một `Certificate`. Một chứng chỉ có thể có nhiều nội dung ôn tập. Bài học và câu hỏi cũng có thể liên kết với chứng chỉ để phục vụ việc học và luyện tập theo mục tiêu chứng chỉ.

### 2.3.1.4. Nhóm ngân hàng câu hỏi và khảo thí

`Question` biểu diễn một câu hỏi trong ngân hàng câu hỏi, gồm loại câu hỏi, nội dung, ngữ cảnh, giải thích, chủ đề và điểm. Một câu hỏi thuộc một lĩnh vực và một cấp độ. Với loại câu hỏi có lựa chọn, các phương án được mô tả bởi `QuestionOption`.

`Exam` biểu diễn cấu hình của đề thi hoặc bài kiểm tra, gồm thời lượng, điểm đạt, số lần làm tối đa, phạm vi chủ đề và khoảng thời gian cho phép. Một đề gồm nhiều câu hỏi và một câu hỏi có thể được dùng trong nhiều đề. `ExamQuestion` được sử dụng như lớp liên kết có ý nghĩa nghiệp vụ vì quan hệ này chứa thứ tự xuất hiện và trọng số của từng câu trong đề.

`ExamAttempt` ghi nhận một lượt làm đề của Học viên, gồm trạng thái, thời điểm bắt đầu, thời hạn, điểm số và kết quả đạt. `AttemptAnswer` ghi nhận câu trả lời và số điểm của từng câu trong lượt làm. Ảnh chụp nội dung đề tại thời điểm làm bài thuộc `ExamAttempt`, giúp kết quả không bị thay đổi khi cấu hình đề được cập nhật sau đó.

### 2.3.1.5. Nhóm tiến độ, cá nhân hóa, kế hoạch và khuyến khích học tập

`LearningProgress` mô tả tiến độ của Học viên đối với tài nguyên học tập. Hệ thống hiện dùng một cấu trúc tiến độ chung theo loại tài nguyên thay vì hai lớp riêng cho tiến độ bài học và tiến độ từ vựng. Lớp này lưu trạng thái, tỷ lệ hoàn thành, số bài đã hoàn thành, tổng số bài và điểm trung bình khi có dữ liệu.

`Recommendation` biểu diễn một đề xuất học tập đã được lưu cho Học viên. Đề xuất xác định loại tài nguyên, tài nguyên được đề xuất, lý do, độ ưu tiên và thời hạn. `RecommendationFeedback` ghi nhận phản hồi của Học viên như hữu ích, không hữu ích, bỏ qua hoặc đã mở. Source code hiện tại chỉ cung cấp chức năng đọc các đề xuất đã lưu. Vì vậy mô hình không khẳng định hệ thống đang tự động sinh đề xuất bằng AI.

`LearningPlanItem` biểu diễn một công việc trong kế hoạch học tập, có thời điểm dự kiến, thời lượng, ghi chú, trạng thái hoàn thành và bài học liên quan nếu có. `UserStreak` và `UserBadge` hỗ trợ khuyến khích học tập thông qua chuỗi ngày học, điểm kinh nghiệm, cấp độ và huy hiệu. Đây là chức năng hỗ trợ, không phải trọng tâm của nội dung học tiếng Anh chuyên ngành.

### 2.3.1.6. Nhóm thực hành có nhãn AI

`MockInterview` biểu diễn một phiên phỏng vấn thử theo chủ đề và độ khó. Phiên gồm nhiều `MockInterviewTurn`, mỗi lượt lưu câu hỏi, câu trả lời của người dùng, phản hồi và điểm nếu có. `WritingSubmission` biểu diễn một bài viết được nộp theo đề bài và chủ đề, kèm phản hồi cùng các điểm thành phần khi hệ thống đã chấm.

Hai chức năng trên được giao diện và module đặt trong phạm vi luyện tập có nhãn AI. Tuy nhiên, source code hiện tại sử dụng ngân hàng câu hỏi cố định, quy tắc đếm từ, công thức chấm điểm và dữ liệu phản hồi theo mẫu. Chưa phát hiện lời gọi đến mô hình ngôn ngữ hoặc nhà cung cấp AI. Vì vậy báo cáo chỉ mô tả đây là chức năng thực hành và phản hồi tự động ở phiên bản hiện tại. Các khái niệm `AIConversation`, `AIMessage`, `AILearningError` và `AISavedVocabulary` không có trong schema hiện tại nên không được đưa vào mô hình.

### 2.3.1.7. Nhóm cộng đồng và thông báo

`DiscussionPost`, `DiscussionComment` và `DiscussionVote` hỗ trợ trao đổi trong cộng đồng. Người dùng có thể tạo bài viết, bình luận, bỏ phiếu và xóa nội dung thuộc quyền sở hữu theo các endpoint hiện có. Bài viết có thể chứa nhiều bình luận và nhận nhiều lượt bỏ phiếu. Mỗi bình luận thuộc một bài viết và một người tạo.

`Notification` lưu thông báo cá nhân hoặc thông báo phát rộng. Thông báo có loại, tiêu đề, nội dung, dữ liệu bổ sung, trạng thái đã đọc và thời điểm tạo. Đây là phân hệ hỗ trợ hoạt động học tập và quản trị.

### 2.3.1.8. Nhóm gói dịch vụ và thanh toán

`PaymentOrder` ghi nhận đơn thanh toán và trạng thái xử lý. `UserSubscription` biểu diễn quyền sử dụng gói dịch vụ của người dùng trong một khoảng thời gian. Một đơn thanh toán thành công có thể tạo một đăng ký dịch vụ. `Voucher` và `FlashSale` biểu diễn các chính sách ưu đãi được kiểm tra trong quy trình tạo đơn.

Nhóm này phục vụ vận hành hệ thống và được trình bày ở mức vừa đủ. Nội dung trọng tâm của hệ thống vẫn là bài học, từ vựng, câu hỏi, đề thi và quá trình học của Học viên.

## 2.3.2. Các mối quan hệ và ràng buộc bội số

### 2.3.2.1. Quan hệ 1 - 1 và 1 - 0..1

Mỗi `UserAccount` có thể chưa có hoặc có tối đa một `LearnerProfile`. Quan hệ có bội số `UserAccount` là 1 và `LearnerProfile` là 0..1. Cách biểu diễn này phù hợp với trường hợp tài khoản Giảng viên hoặc Quản trị viên không cần hồ sơ học tập và trường hợp Học viên chưa hoàn tất thiết lập ban đầu.

Mỗi `UserAccount` có thể chưa có hoặc có tối đa một `UserSubscription`. Mỗi `UserSubscription` thuộc đúng một `UserAccount`. Một `PaymentOrder` có thể chưa tạo hoặc tạo tối đa một `UserSubscription`, trong khi mỗi đăng ký được tạo từ đúng một đơn thanh toán theo thiết kế hiện tại.

Mỗi `UserAccount` có thể chưa có hoặc có tối đa một `UserStreak`. Mỗi bản ghi chuỗi ngày học thuộc đúng một tài khoản.

### 2.3.2.2. Quan hệ 1 - N

Một `Domain` có thể phân loại nhiều `Lesson`, `Vocabulary`, `Question` và `Exam`. Mỗi đối tượng nói trên thuộc đúng một lĩnh vực. Một `Level` cũng có thể được dùng cho nhiều hồ sơ, bài học, từ vựng, câu hỏi và đề thi, trong khi mỗi đối tượng chỉ tham chiếu một cấp độ tại một thời điểm.

Một `Lesson` gồm nhiều `LessonSection`, còn mỗi phần thuộc đúng một bài học. Một `Question` có thể có nhiều `QuestionOption`, còn mỗi phương án thuộc đúng một câu hỏi. Một `Exam` có nhiều `ExamAttempt`, còn mỗi lượt làm thuộc đúng một đề. Một `ExamAttempt` có nhiều `AttemptAnswer`, còn mỗi câu trả lời thuộc đúng một lượt làm.

Một `UserAccount` có thể tạo nhiều bài học, đề thi, kế hoạch học tập, lượt làm đề, phiên phỏng vấn thử, bài viết luyện viết, bài đăng, bình luận, thông báo và đơn thanh toán tùy theo vai trò. Các quan hệ này phản ánh quyền sở hữu hoặc người thực hiện nghiệp vụ, không đồng nghĩa mọi actor đều được phép thực hiện mọi thao tác.

Một `Certificate` có thể có nhiều `CertificationContent` và nhiều `LearnerCertificateGoal`. Một `LearnerProfile` có thể có nhiều mục tiêu chứng chỉ, còn mỗi mục tiêu chứng chỉ gắn với đúng một hồ sơ và một chứng chỉ.

Một `Recommendation` có thể nhận nhiều `RecommendationFeedback`. Mỗi phản hồi thuộc một đề xuất và một Học viên. Một `MockInterview` gồm nhiều `MockInterviewTurn`. Một `DiscussionPost` có nhiều `DiscussionComment` và nhiều `DiscussionVote`.

### 2.3.2.3. Quan hệ N - N

Quan hệ giữa `UserAccount` và `Role` là nhiều đối nhiều. Quan hệ giữa `Role` và `Permission` cũng là nhiều đối nhiều. Ở mức thiết kế, hai quan hệ này được triển khai bằng các bảng nối tương ứng.

Một `LearnerProfile` có thể chọn nhiều `Domain` và nhiều `CareerGoal`. Mỗi lĩnh vực hoặc mục tiêu nghề nghiệp có thể được nhiều hồ sơ lựa chọn. Một `LearnerGroup` có thể có nhiều thành viên và một `UserAccount` có thể tham gia nhiều nhóm.

Một `Lesson` có thể chứa nhiều `Vocabulary` và một từ vựng có thể xuất hiện trong nhiều bài học. Một `Lesson` có thể phục vụ nhiều `Certificate` và một chứng chỉ có thể liên kết với nhiều bài học. Tương tự, `Question` và `Certificate` có quan hệ nhiều đối nhiều.

Quan hệ giữa `Exam` và `Question` là nhiều đối nhiều và được cụ thể hóa bởi `ExamQuestion`. Lớp liên kết này được thể hiện trên sơ đồ vì thứ tự và trọng số là dữ liệu có ý nghĩa đối với cấu trúc đề thi.

## 2.3.3. Ý nghĩa của mô hình dữ liệu mức phân tích

Mô hình dữ liệu mức phân tích tạo cầu nối giữa Use Case và thiết kế cơ sở dữ liệu. Các lớp mô tả đối tượng mà người dùng tương tác hoặc hệ thống cần quản lý, trong khi các association và bội số thể hiện quy tắc liên kết ở mức nghiệp vụ. Mô hình giúp kiểm tra rằng chức năng quản lý hồ sơ, học bài, học từ vựng, làm đề, theo dõi tiến độ, lập kế hoạch, luyện phỏng vấn, luyện viết, trao đổi cộng đồng và thanh toán đều có dữ liệu hỗ trợ.

Mô hình không thay thế ERD vật lý. Khi chuyển sang thiết kế cơ sở dữ liệu, một lớp có thể được tách thành nhiều bảng để chuẩn hóa dữ liệu, lưu chi tiết hoặc phục vụ vận hành. Các quan hệ nhiều đối nhiều được chuyển thành bảng nối. Một số cấu trúc kỹ thuật được bổ sung cho xác thực, cache và kiểm soát gói dịch vụ. Nguyên tắc này giải thích vì sao 37 lớp phân tích được chuyển đổi thành 53 bảng ứng dụng trong thiết kế hiện tại.
