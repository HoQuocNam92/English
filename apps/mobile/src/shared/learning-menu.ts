export const learningMenu = [
  { title: 'Học và luyện tập', items: [
    { label: 'Bài học', detail: 'Tìm bài, lọc lĩnh vực và học theo lộ trình.', icon: 'menu-book', href: '/lessons' },
    { label: 'Từ vựng', detail: 'Từ mới, ôn tập đến hạn và thống kê đã học.', icon: 'style', href: '/flashcards/dashboard' },
    { label: 'Khám phá từ vựng', detail: 'Tìm nhóm từ theo lĩnh vực và trình độ.', icon: 'search', href: '/flashcards/explore' },
    { label: 'Luyện thi chứng chỉ', detail: 'Học kiến thức và làm bài kiểm tra theo chủ đề.', icon: 'workspace-premium', href: '/certifications' },
  ] },
  { title: 'Chuyên đề tiếng Anh CNTT', items: [
    { label: 'Danh mục học tập', detail: 'Xem toàn bộ chuyên đề và nội dung học.', icon: 'apps', href: '/catalog' },
    { label: 'Thuật ngữ chuyên ngành', detail: 'Hiểu và dùng thuật ngữ trong công việc.', icon: 'translate', href: '/lessons?type=terminology' },
    { label: 'Đọc hiểu kỹ thuật', detail: 'Đọc tài liệu và kiểm tra hiểu nội dung.', icon: 'article', href: '/lessons?type=technical_reading' },
    { label: 'Tài liệu API', detail: 'Luyện đọc yêu cầu, phản hồi và mã lỗi.', icon: 'code', href: '/lessons?type=api_documentation' },
    { label: 'Thiết kế hệ thống', detail: 'Đọc và giải thích kiến trúc bằng tiếng Anh.', icon: 'account-tree', href: '/lessons?type=system_design' },
    { label: 'Tình huống thực tế', detail: 'Áp dụng tiếng Anh vào bài toán công việc.', icon: 'work', href: '/lessons?type=case_study' },
  ] },
  { title: 'Lộ trình và mục tiêu', items: [
    { label: 'Lộ trình học của tôi', detail: 'Xem kế hoạch đã lưu hoặc tạo lộ trình mới.', icon: 'route', href: '/learning-plan' },
    { label: 'Kiểm tra trình độ', detail: 'Đánh giá đầu vào và nhận kế hoạch phù hợp.', icon: 'quiz', href: '/placement-test' },
    { label: 'Mục tiêu và nhắc học', detail: 'Chọn lĩnh vực, chứng chỉ và chỉ tiêu mỗi ngày.', icon: 'schedule', href: '/profile/edit' },
  ] },
  { title: 'Tiến độ và lịch sử', items: [
    { label: 'Tiến độ học tập', detail: 'Theo dõi kết quả, thành tích và các lần thi.', icon: 'trending-up', href: '/(tabs)/progress' },
    { label: 'Từ đã học', detail: 'Xem lịch sử ôn tập và kiểm tra lại từ vựng.', icon: 'history', href: '/flashcards/history' },
    { label: 'Lịch sử bài học và bài thi', detail: 'Xem lại các bài đã học và kết quả kiểm tra.', icon: 'fact-check', href: '/profile/history' },
  ] },
] as const;
