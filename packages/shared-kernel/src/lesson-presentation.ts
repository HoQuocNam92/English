/** Display stored lesson content without rewriting its text or titles. */
export function lessonReadingText(_title: string | undefined, text: string, _sourceUrl?: string): string { return text; }
export const lessonSectionTitle = (title?: string) => title;

/** Use the actual source identity instead of giving every link the same caption. */
export function lessonSourceLabel(href: string): string {
  try {
    const url = new URL(href);
    const host = url.hostname.replace(/^www\./, '');
    const slug = url.pathname.split('/').filter(Boolean).pop();
    const page = slug ? decodeURIComponent(slug).replace(/\.(html?|md)$/i, '').replace(/[-_]+/g, ' ') : '';
    return page && page.length <= 70 ? `${host} · ${page}` : host;
  } catch { return 'Nguồn tham khảo'; }
}

export function lessonSourceParts(text: string): { text: string; href?: string }[] {
  const parts: { text: string; href?: string }[] = [];
  const seen = new Set<string>();
  for (const value of text.split(/(https?:\/\/[^\s<>]+)/g)) {
    if (!/^https?:\/\//.test(value)) { if (value) parts.push({ text: value }); continue; }
    const href = value.replace(/[.,;]+$/, '');
    const previous = parts[parts.length - 1];
    // Collapse repeated entries in a source list, preserving links cited in prose.
    if (seen.has(href) && previous && !previous.href && /^[\s|·,;]*$/.test(previous.text)) { parts.pop(); continue; }
    seen.add(href);
    parts.push({ href, text: lessonSourceLabel(href) + value.slice(href.length) });
  }
  return parts;
}
export const isLessonGuidance = (section: { title?: string; type?: string }) => section.type !== 'quiz' && /^(mục tiêu|hướng dẫn|bước tiếp theo|sau khi hoàn thành)/i.test(section.title?.trim() ?? '');
export const lessonStudyGuide = 'Đọc nội dung tiếng Anh, đối chiếu phần giải thích tiếng Việt và ghi lại từ hoặc ý chính cần ôn. Khi đã hiểu bài, chọn “Hoàn thành bài học” ở cuối trang.';
export const certificateProgressExplanation = 'Tiến độ = (số bài học đã hoàn thành + số bài kiểm tra đã nộp) ÷ (tổng số bài học + tổng số bài kiểm tra) × 100%, làm tròn đến số nguyên. Mỗi bài chỉ tính một lần. Nộp bài kiểm tra được tính vào tiến độ kể cả khi chưa đạt điểm yêu cầu; điểm và mức đạt được hiển thị riêng.';
