from copy import deepcopy
from docx import Document
from docx.oxml.ns import qn

SRC = r"C:\Users\quocnam\Downloads\NHOM_NGHIENCUU_DT04 - 2.docx"
OUT = r"D:\workspaces\Projects\English\NHOM_NGHIENCUU_DT04 - Sua Chuong 2 va 3 giu nguyen format.docx"
d = Document(SRC)

def set_para(p, text):
    if p.runs:
        p.runs[0].text = text
        for r in p.runs[1:]: r.text = ''
    else:
        p.add_run(text)

def replace_start(start, text):
    for p in d.paragraphs:
        if p.text.strip().startswith(start):
            set_para(p, text)
            return
    raise ValueError(start)

replacements = {
'Hệ thống được triển khai trên hai nền tảng': 'Hệ thống được triển khai trên hai nền tảng. Học viên có thể sử dụng Website hoặc ứng dụng di động để học tập; Giảng viên và Quản trị viên chủ yếu sử dụng Website cho các chức năng quản lý. Các nền tảng dùng chung Backend API và cơ sở dữ liệu PostgreSQL để bảo đảm dữ liệu được đồng bộ.',
'Quản lý cấp độ học:': 'Quản lý cấp độ học: Hệ thống phân loại nội dung theo ba cấp độ Beginner, Intermediate và Advanced, giúp Học viên lựa chọn nội dung phù hợp với trình độ hiện tại.',
'Hỗ trợ cá nhân hóa quá trình học tập bằng trí tuệ nhân tạo:': 'Hỗ trợ cá nhân hóa quá trình học tập bằng trí tuệ nhân tạo: Hệ thống sử dụng hồ sơ, mục tiêu, tiến độ và kết quả học để đề xuất nội dung và tạo lộ trình phù hợp. AI Tutor sử dụng RAG trên học liệu đã duyệt, cung cấp trích dẫn nguồn, hỗ trợ sửa ngữ pháp, dịch, giải thích từ vựng, lưu từ và tạo quiz từ lỗi học tập.',
'Trong quá trình học, Học viên có thể sử dụng chức năng học tập cá nhân hóa bằng AI.': 'Trong quá trình học, Học viên có thể sử dụng AI Tutor để hỏi đáp tiếng Anh chuyên ngành CNTT dựa trên học liệu đã duyệt. Hệ thống truy xuất nội dung liên quan, tạo câu trả lời kèm trích dẫn nguồn, hỗ trợ sửa ngữ pháp, dịch, giải thích và lưu từ vựng. Học viên có thể đánh giá câu trả lời và tạo quiz từ lỗi được ghi nhận. Hệ thống không bao gồm luyện phỏng vấn AI, luyện viết AI, Smart Review, gamification hoặc phân tích thời gian học.',
'Hỗ trợ học tập bằng AI: Hoạt động': 'Hỗ trợ học tập bằng AI: Học viên sử dụng AI Tutor RAG để giải đáp thắc mắc, sửa ngữ pháp, dịch nội dung, giải thích từ vựng và nhận câu trả lời có trích dẫn học liệu. Hệ thống cho phép lưu từ vựng, đánh giá câu trả lời và tạo quiz từ lỗi học tập.',
'Dữ liệu tiến độ không chỉ phục vụ': 'Dữ liệu tiến độ phục vụ hiển thị mức hoàn thành và cá nhân hóa. learning_progress ghi nhận trạng thái tài nguyên; progress_summary_cache lưu số liệu tổng hợp; recommendations lưu gợi ý; learning_paths, learning_path_modules và learning_plan_items tổ chức lộ trình và kế hoạch học. Hệ thống không còn lưu phiên phân tích thời gian, streak hoặc huy hiệu.',
'Nhóm dữ liệu AI được tách': 'Nhóm dữ liệu AI được tách khỏi dữ liệu học tập truyền thống. Hội thoại và tin nhắn được lưu riêng; lỗi học tập và từ vựng đã lưu hỗ trợ cá nhân hóa; nguồn, đoạn nội dung, vector và trích dẫn tạo thành kho RAG; phản hồi và hạn mức hằng ngày hỗ trợ kiểm soát chất lượng và sử dụng.',
'Ngoài các nhóm dữ liệu trực tiếp': 'Ngoài dữ liệu học tập, hệ thống còn lưu cộng đồng, thông báo, Landing Page, gói PRO và thanh toán. Các bảng voucher, flash sale, plan quota, streak, huy hiệu và phiên phân tích thời gian không còn thuộc lược đồ hiện tại.',
'Tại thời điểm lập tài liệu, cơ sở dữ liệu': 'Tại thời điểm cập nhật tài liệu, cơ sở dữ liệu PostgreSQL của hệ thống gồm 57 bảng vật lý trong schema public. Các bảng được phân nhóm theo chức năng để bảo đảm sơ đồ dễ quan sát; bảng _prisma_migrations chỉ phục vụ quản lý lịch sử migration.',
'Cơ sở dữ liệu của hệ thống được tổ chức': 'Cơ sở dữ liệu được tổ chức trên PostgreSQL và quản lý bằng Prisma ORM. Website và ứng dụng di động dùng chung Backend API. Thiết kế đáp ứng quản lý nội dung, khảo thí, tiến độ, lộ trình, AI Tutor RAG, cộng đồng, thông báo, thanh toán và Landing Page.',
'Số lượng bảng ở mức thiết kế lớn hơn': 'Số lượng bảng ở mức thiết kế lớn hơn số lớp phân tích do chuẩn hóa quan hệ, lưu lịch sử và dữ liệu hỗ trợ. Lược đồ hiện tại có 57 bảng; không bao gồm Smart Review, learning_sessions, user_streaks, user_badges, Mock Interview, Writing Practice, voucher hoặc flash sale.',
'Chương 3 đã trình bày thiết kế cơ sở dữ liệu': 'Chương 3 đã trình bày thiết kế cơ sở dữ liệu theo trạng thái triển khai hiện tại với 57 bảng, được phân nhóm theo tài khoản, hồ sơ, nội dung, khảo thí, tiến độ, lộ trình, AI Tutor RAG, cộng đồng, thông báo, thanh toán và Landing Page.',
}
for s,t in replacements.items(): replace_start(s,t)

# Expand the existing requirement paragraph without creating a new layout block.
replace_start('Yêu cầu chức năng: Hệ thống cần', 'Yêu cầu chức năng: Hệ thống cung cấp quản lý tài khoản và RBAC, hồ sơ học tập, Placement Test, danh mục, bài học, từ vựng, Technical Reading Lab, flashcard, ngân hàng câu hỏi, đề thi, chấm điểm, tiến độ, gợi ý, lộ trình, kế hoạch học, AI Tutor RAG, cộng đồng, thông báo, gói PRO, Landing Page, banner và báo cáo quản trị.')

def cell_text(cell, text):
    p = cell.paragraphs[0]
    if p.runs:
        p.runs[0].text = str(text)
        for r in p.runs[1:]: r.text = ''
    else: p.add_run(str(text))
    for extra in cell.paragraphs[1:]:
        set_para(extra, '')

def reset_table(idx, rows):
    t = d.tables[idx]
    while len(t.rows) > 1:
        t._tbl.remove(t.rows[-1]._tr)
    for row in rows:
        cells = t.add_row().cells
        for i, value in enumerate(row): cell_text(cells[i], value)

reset_table(16, [
(1,'Tài khoản và phân quyền',8,'Tài khoản, hồ sơ hiển thị, vai trò, quyền và token'),
(2,'Danh mục và hồ sơ Học viên',10,'Lĩnh vực, cấp độ, nghề nghiệp, chứng chỉ và hồ sơ'),
(3,'Bài học và từ vựng',7,'Bài học, phần nội dung, từ vựng và chứng chỉ'),
(4,'Ngân hàng câu hỏi và khảo thí',8,'Câu hỏi, đề thi, lượt làm và đáp án'),
(5,'Tiến độ, gợi ý và lộ trình',6,'Tiến độ, gợi ý, lộ trình và kế hoạch'),
(6,'AI Tutor và RAG',10,'Hội thoại, tri thức, vector, trích dẫn và phản hồi'),
(7,'Cộng đồng và thông báo',4,'Bài viết, bình luận, bình chọn và thông báo'),
(8,'Thanh toán và Landing Page',3,'Đơn hàng, gói sử dụng và banner'),
(9,'Vận hành',1,'Lịch sử migration'),
])

reset_table(37, [
(1,'learning_progress','Tiến độ theo bài học, lĩnh vực hoặc chứng chỉ.','users'),
(2,'progress_summary_cache','Dữ liệu tổng hợp tiến độ.','Không có khóa ngoại vật lý'),
(3,'recommendations','Gợi ý học tập cá nhân hóa.','users'),
(4,'learning_paths','Lộ trình học cá nhân.','users'),
(5,'learning_path_modules','Các mô-đun trong lộ trình.','learning_paths'),
(6,'learning_plan_items','Kế hoạch học theo ngày.','users, lessons'),
])

reset_table(41, [
(1,'ai_conversations','Phiên hội thoại AI.','users'),
(2,'ai_messages','Tin nhắn người dùng và AI.','ai_conversations'),
(3,'ai_learning_errors','Lỗi học tập và nội dung sửa.','ai_conversations, ai_messages'),
(4,'ai_saved_vocabulary','Từ hoặc cụm từ lưu từ AI.','users'),
(5,'knowledge_sources','Nguồn học liệu được index.','Bài học và từ vựng'),
(6,'knowledge_chunks','Đoạn học liệu sau khi chia nhỏ.','knowledge_sources'),
(7,'knowledge_vectors','Embedding phục vụ truy xuất ngữ nghĩa.','knowledge_chunks'),
(8,'ai_message_citations','Trích dẫn của câu trả lời AI.','ai_messages, knowledge_chunks'),
(9,'ai_feedback','Đánh giá câu trả lời AI.','ai_messages, users'),
(10,'ai_usage_daily','Hạn mức và token AI theo ngày.','users'),
])

reset_table(45, [
(1,'discussion_posts','Bài viết cộng đồng.','users'),
(2,'discussion_comments','Bình luận.','discussion_posts, users'),
(3,'discussion_votes','Bình chọn.','discussion_posts, users'),
(4,'notifications','Thông báo cá nhân hoặc toàn hệ thống.','users'),
(5,'landing_banners','Nội dung và cấu hình banner.','Không có khóa ngoại'),
(6,'payment_orders','Đơn thanh toán gói PRO.','users'),
(7,'user_subscriptions','Gói và thời hạn sử dụng.','payment_orders, users'),
(8,'_prisma_migrations','Lịch sử migration.','Vận hành kỹ thuật'),
])

reset_table(46, [
('User và RBAC','users, user_details, roles, permissions, user_roles, role_permissions, refresh_tokens, password_reset_tokens','Tách xác thực, hồ sơ, vai trò, quyền và phiên.'),
('LearnerProfile','learner_profiles và các bảng liên kết domain, career goal, certificate goal','Chuẩn hóa các quan hệ nhiều - nhiều.'),
('Lesson và Vocabulary','lessons, lesson_sections, vocabularies, vocabulary_examples, lesson_vocabularies, lesson_certificates, certification_contents','Tách nội dung và các liên kết học tập.'),
('Exam','questions, question_options, question_certificates, exams, exam_questions, exam_attempts, attempt_answers, attempt_answer_options','Tách ngân hàng câu hỏi, cấu hình đề và kết quả.'),
('Tiến độ và lộ trình','learning_progress, progress_summary_cache, recommendations, learning_paths, learning_path_modules, learning_plan_items','Tổng quát hóa tiến độ và tổ chức lộ trình.'),
('AI Tutor RAG','ai_conversations, ai_messages, ai_learning_errors, ai_saved_vocabulary, knowledge_sources, knowledge_chunks, knowledge_vectors, ai_message_citations, ai_feedback, ai_usage_daily','Tách hội thoại, tri thức, truy xuất và phản hồi.'),
('Cộng đồng và thông báo','discussion_posts, discussion_comments, discussion_votes, notifications','Lưu tương tác cộng đồng và thông báo.'),
('Thanh toán và Landing Page','payment_orders, user_subscriptions, landing_banners','Lưu đơn hàng, gói sử dụng và nội dung giới thiệu.'),
])

# Repurpose the three existing detailed AI tables while preserving their table positions and styles.
replace_start('Bảng 3.28. Mô tả bảng mock_interviews', 'Bảng 3.28. Mô tả bảng knowledge_sources')
replace_start('Bảng 3.29. Mô tả bảng writing_submissions', 'Bảng 3.29. Mô tả bảng ai_feedback')
reset_table(43, [
('id','UUID','Định danh nguồn tri thức.','PRIMARY KEY'),('source_type','VARCHAR','Loại nguồn.','NOT NULL'),('source_id','UUID','Định danh nội dung nguồn.','NOT NULL'),('title','VARCHAR','Tên nguồn.','NOT NULL'),('content_hash','VARCHAR','Mã kiểm tra thay đổi.','NOT NULL'),('status','VARCHAR','Trạng thái index.','NOT NULL'),('indexed_at','TIMESTAMPTZ','Thời điểm index.','Cho phép NULL'),('created_at','TIMESTAMPTZ','Thời điểm tạo.','NOT NULL'),('updated_at','TIMESTAMPTZ','Thời điểm cập nhật.','NOT NULL')])
reset_table(44, [
('id','UUID','Định danh phản hồi.','PRIMARY KEY'),('message_id','UUID','Tin nhắn AI được đánh giá.','FOREIGN KEY, NOT NULL'),('user_id','UUID','Người đánh giá.','FOREIGN KEY, NOT NULL'),('helpful','BOOLEAN','Đánh giá hữu ích hoặc chưa đúng.','NOT NULL'),('reason','VARCHAR','Lý do đánh giá.','Cho phép NULL'),('created_at','TIMESTAMPTZ','Thời điểm tạo.','NOT NULL'),('updated_at','TIMESTAMPTZ','Thời điểm cập nhật.','NOT NULL')])

# Remove internal planning notes while keeping their paragraphs and spacing.
for prefix in ['Fix là nội dung khảo sát', 'Nội dung tuần tới:', 'Phân rã sơ đồ chức năng', 'Phân tích chức năng', 'Desgin giao diện']:
    for p in d.paragraphs:
        if p.text.strip().startswith(prefix): set_para(p, '')

d.save(OUT)
print(OUT)
