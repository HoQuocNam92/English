/** Display stored lesson content without rewriting its text or titles. */
export function lessonReadingText(_title: string | undefined, text: string, _sourceUrl?: string): string { return text; }
export const lessonSectionTitle = (title?: string) => title;
export const isLessonGuidance = (section: { title?: string; type?: string }) => section.type !== 'quiz' && /^(mục tiêu|hướng dẫn|bước tiếp theo|sau khi hoàn thành)/i.test(section.title?.trim() ?? '');
export const lessonStudyGuide = 'Đọc nội dung tiếng Anh, đối chiếu phần giải thích tiếng Việt và ghi lại từ hoặc ý chính cần ôn. Khi đã hiểu bài, chọn “Hoàn thành bài học” ở cuối trang.';
export const certificateProgressExplanation = 'Tiến độ = (số bài học đã hoàn thành + số bài kiểm tra đã nộp) ÷ (tổng số bài học + tổng số bài kiểm tra) × 100%, làm tròn đến số nguyên. Mỗi bài chỉ tính một lần. Nộp bài kiểm tra được tính vào tiến độ kể cả khi chưa đạt điểm yêu cầu; điểm và mức đạt được hiển thị riêng.';
