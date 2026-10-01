export type ContentSection = { type: string; title: string; text: string };

export const CONTENT_TYPES: Record<string, {
  icon: string; iconClassName: string;
  label: string; item: string; description: string; intro: string; summaryLabel: string;
  conceptsLabel: string; sectionsLabel: string; sectionHint: string;
  sections: ContentSection[];
}> = {
  terminology: {
    icon: 'translate', iconClassName: 'from-teal-700 to-teal-800',
    label: 'Thuật ngữ CNTT', item: 'bộ thuật ngữ', description: 'Biên soạn thuật ngữ theo ngữ cảnh sử dụng trong công việc.',
    intro: 'Một thuật ngữ cần có định nghĩa, ngữ cảnh và ví dụ sử dụng; không chỉ là bản dịch.', summaryLabel: 'Mô tả bộ thuật ngữ', conceptsLabel: 'Các thuật ngữ trọng tâm',
    sectionsLabel: 'Định nghĩa và cách dùng', sectionHint: 'Viết định nghĩa bằng tiếng Anh, giải thích bằng tiếng Việt và ví dụ trong ngữ cảnh kỹ thuật.',
    sections: [{ type: 'rich_text', title: 'Định nghĩa và ngữ cảnh', text: '' }, { type: 'callout', title: 'Ví dụ sử dụng thực tế', text: '' }],
  },
  technical_reading: {
    icon: 'article', iconClassName: 'from-blue-700 to-blue-800',
    label: 'Đọc hiểu kỹ thuật', item: 'bài đọc kỹ thuật', description: 'Xây dựng bài đọc kèm câu hỏi hiểu và phân tích tài liệu.',
    intro: 'Người học cần đọc một tài liệu kỹ thuật và trả lời câu hỏi dựa trên thông tin trong tài liệu.', summaryLabel: 'Mục tiêu đọc hiểu', conceptsLabel: 'Từ khóa trong tài liệu',
    sectionsLabel: 'Tài liệu và câu hỏi đọc hiểu', sectionHint: 'Nhập tài liệu gốc, sau đó thêm câu hỏi yêu cầu người học suy luận hoặc tìm bằng chứng.',
    sections: [{ type: 'rich_text', title: 'Tài liệu kỹ thuật', text: '' }, { type: 'quiz', title: 'Câu hỏi đọc hiểu', text: '' }],
  },
  api_documentation: {
    icon: 'api', iconClassName: 'from-violet-700 to-violet-800',
    label: 'Tài liệu API', item: 'tài liệu API', description: 'Mô tả endpoint, request, response và cách xử lý lỗi.',
    intro: 'Cung cấp endpoint và hợp đồng dữ liệu để người học thực hành đọc, gọi và kiểm tra API.', summaryLabel: 'Mục đích API', conceptsLabel: 'Endpoint, phương thức và khái niệm',
    sectionsLabel: 'Đặc tả và ví dụ API', sectionHint: 'Ghi rõ method, path, tham số, mã trạng thái, xác thực và ví dụ request/response.',
    sections: [{ type: 'rich_text', title: 'Endpoint và tham số', text: '' }, { type: 'code', title: 'Request mẫu', text: '' }, { type: 'code', title: 'Response và lỗi mẫu', text: '' }],
  },
  system_design: {
    icon: 'account_tree', iconClassName: 'from-indigo-700 to-indigo-800',
    label: 'System Design', item: 'đề bài thiết kế hệ thống', description: 'Đặt yêu cầu hệ thống và hướng dẫn phân tích phương án thiết kế.',
    intro: 'Một đề bài thiết kế cần nêu ràng buộc, quy mô và các quyết định đánh đổi, không chỉ mô tả kiến trúc.', summaryLabel: 'Bối cảnh và mục tiêu hệ thống', conceptsLabel: 'Thành phần và tiêu chí thiết kế',
    sectionsLabel: 'Yêu cầu và phương án thiết kế', sectionHint: 'Nêu yêu cầu chức năng, phi chức năng, quy mô tải và lý do chọn kiến trúc.',
    sections: [{ type: 'rich_text', title: 'Yêu cầu và ràng buộc', text: '' }, { type: 'rich_text', title: 'Kiến trúc đề xuất và đánh đổi', text: '' }, { type: 'quiz', title: 'Câu hỏi phản biện thiết kế', text: '' }],
  },
  case_study: {
    icon: 'work', iconClassName: 'from-amber-700 to-amber-800',
    label: 'Tình huống thực tế', item: 'tình huống', description: 'Tạo bối cảnh, nhiệm vụ và tiêu chí đánh giá cách giải quyết.',
    intro: 'Đặt người học vào vai trò cụ thể, đưa dữ kiện và yêu cầu một quyết định có lập luận.', summaryLabel: 'Vấn đề cần giải quyết', conceptsLabel: 'Kỹ năng và khái niệm áp dụng',
    sectionsLabel: 'Bối cảnh và nhiệm vụ', sectionHint: 'Mô tả nhân vật, dữ kiện, ràng buộc, nhiệm vụ và tiêu chí đánh giá phương án.',
    sections: [{ type: 'rich_text', title: 'Bối cảnh và dữ kiện', text: '' }, { type: 'callout', title: 'Nhiệm vụ và tiêu chí đánh giá', text: '' }, { type: 'quiz', title: 'Phương án đề xuất', text: '' }],
  },
  certification_review: {
    icon: 'workspace_premium', iconClassName: 'from-purple-700 to-purple-800',
    label: 'Ôn tập chứng chỉ', item: 'chuyên đề ôn tập', description: 'Liên kết chứng chỉ, chủ đề thi và câu hỏi tự kiểm tra.',
    intro: 'Chuyên đề ôn tập phải gắn với ít nhất một chứng chỉ và kiểm tra đúng kiến thức theo mục tiêu đó.', summaryLabel: 'Mục tiêu ôn tập', conceptsLabel: 'Chủ đề thi trọng tâm',
    sectionsLabel: 'Kiến thức và câu hỏi ôn tập', sectionHint: 'Tóm tắt kiến thức cần nhớ, bẫy thường gặp và câu hỏi theo tình huống thi.',
    sections: [{ type: 'rich_text', title: 'Kiến thức trọng tâm', text: '' }, { type: 'callout', title: 'Lưu ý và bẫy thường gặp', text: '' }, { type: 'quiz', title: 'Câu hỏi tự kiểm tra', text: '' }],
  },
};
