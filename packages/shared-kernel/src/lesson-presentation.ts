/** Clarify legacy lesson copy without changing the English study passages. */
export function lessonReadingText(title: string | undefined, text: string, sourceUrl?: string): string {
  if (/^Nguồn (tham khảo|khái niệm)/i.test(title ?? '')) {
    const links = [...new Set([...(text.match(/https?:\/\/[^\s<>]+/g) ?? []), ...(sourceUrl && /^https?:\/\//.test(sourceUrl) ? [sourceUrl] : [])])];
    if (links.length) return links.join('\n');
  }
  if (text === 'Separately phân biệt máy chủ ứng dụng và nơi lưu ảnh. Before making the final choice thể hiện việc kiểm tra yêu cầu trước quyết định. Only giới hạn quyền. But running resources still create charges phản bác việc không cam kết đồng nghĩa miễn phí.') {
    return '“Separately” nghĩa là “riêng biệt”, cho biết máy chủ ứng dụng và nơi lưu ảnh là hai thành phần khác nhau.\n\n“Before making the final choice” nghĩa là “trước khi đưa ra lựa chọn cuối cùng”. Cụm này nhấn mạnh việc kiểm tra yêu cầu trước khi quyết định.\n\n“Only” nghĩa là “chỉ”, dùng để giới hạn phạm vi quyền được cấp.\n\n“But running resources still create charges” nghĩa là “nhưng tài nguyên đang chạy vẫn phát sinh phí”. Không có cam kết sử dụng dài hạn không có nghĩa là dịch vụ miễn phí.';
  }
  return text;
}

const titles: Record<string, string> = {
  'Nguồn khái niệm và phạm vi bài học': 'Nguồn tham khảo',
  'Giải thích bằng chứng và từ nối': 'Cách hiểu thông tin và từ nối trong bài',
  'Câu mẫu báo cáo tình huống': 'Câu tình huống mẫu',
  'Từ nối và giới hạn diễn đạt': 'Cách dùng từ nối và diễn đạt chính xác',
};
export const lessonSectionTitle = (title?: string) => title ? titles[title] ?? title : title;
export const isLessonGuidance = (section: { title?: string; type?: string }) => section.type !== 'quiz' && /^(mục tiêu|hướng dẫn|bước tiếp theo|sau khi hoàn thành)/i.test(section.title?.trim() ?? '');
export const lessonStudyGuide = 'Đọc nội dung tiếng Anh, đối chiếu phần giải thích tiếng Việt và ghi lại từ hoặc ý chính cần ôn. Khi đã hiểu bài, chọn “Hoàn thành bài học” ở cuối trang.';
export const certificateProgressExplanation = 'Tiến độ = (số bài học đã hoàn thành + số bài kiểm tra đã nộp) ÷ (tổng số bài học + tổng số bài kiểm tra) × 100%, làm tròn đến số nguyên. Mỗi bài chỉ tính một lần. Nộp bài kiểm tra được tính vào tiến độ kể cả khi chưa đạt điểm yêu cầu; điểm và mức đạt được hiển thị riêng.';
