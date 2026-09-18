# Thiết kế: Bộ lọc bài thi & Cảnh báo ôn tập trước khi thi (Exam Filters & Pre-exam Readiness Warning)

**Ngày lập**: 18/09/2026  
**Dự án**: TechEnglish Pro (KLCN028)  
**Tài liệu tham chiếu**: `docs/01-functional-requirements.md`, `docs/05-complex-flows.md`, `CLAUDE.md`

---

## 1. Bối cảnh & Mục tiêu

Người học tiếng Anh CNTT khi vào mục làm bài kiểm tra / thi thử (`/learn/quiz/tech`) gặp các vấn đề sau:
1. **Thiếu bộ lọc**: Trang danh sách bài thi hiện tại hiển thị toàn bộ bài thi mà không có thanh công cụ tìm kiếm hoặc lọc theo Chuyên ngành/Lĩnh vực (Domain) hay Trình độ (Level), gây khó khăn cho việc định vị bài kiểm tra mong muốn.
2. **Lỗi đếm số câu hỏi**: Do API backend chưa trả về quan hệ đếm câu hỏi `_count.questions`, các thẻ bài thi đang hiển thị `0 CÂU`.
3. **Thiếu định hướng lộ trình & cảnh báo tiến độ**: Khi người học bấm vào làm một bài thi mô phỏng chuyên ngành (ví dụ: AWS Solutions Architect, DevOps...), nếu họ chưa hoàn thành đủ các bài học liên quan (tiến độ < 70%), việc làm bài ngay sẽ gặp khó khăn và dễ gây nản lòng. Người học cần được **cảnh báo nhắc nhở ôn tập trước**, nhưng **tuyệt đối không chặn** họ vào thi nếu họ vẫn muốn thử sức.

---

## 2. Kiến trúc & Thiết kế chi tiết

Tuân thủ nghiêm ngặt **Clean Architecture**:
- **Presentation**: 
  - `apps/web/app/(learner)/learn/quiz/tech/page.tsx`: Giao diện danh sách bài thi, thanh tìm kiếm + bộ lọc, thẻ bài thi có nhãn tiến độ, và Warning Modal xác nhận trước khi thi.
- **Application & Infrastructure**:
  - `apps/api/src/application/exam/exam.service.ts`: Cập nhật `findAll` để include `_count: { select: { questions: true } }`, đảm bảo trả về số câu hỏi thực tế cho từng bài thi.
  - Tận dụng `GET /progress/me` (đã có sẵn `certProgress` và `progress` theo bài học) để tính toán độ sẵn sàng.

---

## 3. Chi tiết chức năng

### 3.1. Sửa lỗi đếm câu hỏi phía Backend (`ExamsService.findAll`)
- Trong `apps/api/src/application/exam/exam.service.ts`:
  ```typescript
  this.prisma.exam.findMany({
    where,
    skip,
    take: limit,
    include: {
      domain: true,
      level: true,
      certificate: true,
      _count: { select: { questions: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
  ```
- Kết quả trả về cho frontend sẽ có `_count.questions` chính xác (ví dụ: 10, 20 câu).

### 3.2. Thanh tìm kiếm và Bộ lọc trên `/learn/quiz/tech`
- **Ô tìm kiếm (Search Box)**: Tìm kiếm theo tiêu đề (`title`) và mô tả (`description`) của bài thi.
- **Bộ lọc Chuyên ngành (Domain Filter)**:
  - Tùy chọn: *Tất cả lĩnh vực*, và danh sách các Chuyên ngành (Cloud Computing, Software Engineering, DevOps, Cybersecurity...) lấy từ các bài thi hiện có hoặc API Domains.
- **Bộ lọc Trình độ (Level Filter)**:
  - Tùy chọn: *Tất cả cấp độ*, *Cơ bản (Beginner)*, *Trung cấp (Intermediate)*, *Nâng cao (Advanced)*.
- **Lọc trực tiếp trên client**: Đảm bảo trải nghiệm mượt mà, phản hồi ngay lập tức khi người học thay đổi từ khóa hoặc bộ lọc.

### 3.3. Tính toán Tiến độ & Đánh giá mức độ sẵn sàng (Readiness)
- Khi người học vào trang `/learn/quiz/tech`, frontend tải song song danh sách bài thi và `/progress/me`.
- Với mỗi bài thi:
  1. **Nếu bài thi thuộc Chứng chỉ (`exam.certificateId`)**:
     - Tra cứu trong `certProgress` của học viên theo `certificateId`.
     - Lấy tỷ lệ hoàn thành bài học `completionPercent`.
  2. **Nếu bài thi thuộc Chuyên ngành (`exam.domainId`)**:
     - Tính tỷ lệ phần trăm số bài học đã hoàn thành (`status === 'completed'`) thuộc domain đó trên tổng số bài học của domain.
  3. **Đánh giá**:
     - Nếu `completionPercent >= 70%`: Đạt tiến độ sẵn sàng (`isReady = true`).
     - Nếu `completionPercent < 70%` hoặc chưa học bài nào: Chưa đạt tiến độ (`isReady = false`, `readinessPercent = completionPercent || 0`).

### 3.4. Giao diện Thẻ bài thi (Exam Card)
- **Hiển thị Badge số câu hỏi**: `{exam._count?.questions ?? 0} CÂU`.
- **Hiển thị Badge tiến độ**:
  - Nếu `!isReady`: Hiển thị huy hiệu màu vàng/cam `⚠️ Khuyên ôn trước ({readinessPercent}%)`.
  - Nếu `isReady`: Hiển thị huy hiệu màu xanh lục `✓ Sẵn sàng thi`.

### 3.5. Warning Modal khi bấm "Bắt đầu kiểm tra" (Không chặn thi)
- Khi người học bấm nút **"Bắt đầu kiểm tra"**:
  - Nếu `isReady === true`: Chuyển hướng trực tiếp vào `/learn/quiz/{id}` để làm bài ngay.
  - Nếu `isReady === false`: Hiển thị Modal Cảnh báo (Popup):
    - **Tiêu đề**: Khuyến nghị ôn tập trước khi thi
    - **Biểu tượng**: `warning` hoặc `school` màu hổ phách/vàng.
    - **Thông điệp**:
      > *"Tiến độ bài học liên quan của bạn hiện mới đạt **{readinessPercent}%**. Chúng tôi khuyến nghị bạn nên ôn tập và hoàn thành các bài học chuyên ngành trước khi thi để đạt kết quả tốt nhất."*
    - **Hành động 1**: **"Ôn tập bài học"** (Nút phụ / outline) -> Chuyển hướng tới `/learn/lessons` kèm bộ lọc domain tương ứng.
    - **Hành động 2**: **"Tiếp tục làm bài thi"** (Nút chính) -> Vào thẳng `/learn/quiz/{id}`, **tuyệt đối không chặn người học**.

---

## 4. Kế hoạch Kiểm thử & Xác thực

1. **Backend Verification**:
   - Chạy kiểm tra API `/exams` để đảm bảo field `_count.questions` trả về đúng số câu hỏi.
2. **Frontend Verification**:
   - Kiểm tra hiển thị thanh bộ lọc: tìm kiếm từ khóa, đổi chuyên ngành, đổi cấp độ.
   - Kiểm tra trường hợp học viên có tiến độ < 70%: hiển thị nhãn cảnh báo trên thẻ bài thi.
   - Bấm vào "Bắt đầu kiểm tra" khi chưa đạt tiến độ: Modal cảnh báo xuất hiện.
   - Bấm "Ôn tập bài học": chuyển hướng đúng sang bài học liên quan.
   - Bấm "Tiếp tục làm bài thi": vào làm bài thi bình thường mà không bị chặn.
   - Kiểm tra trường hợp tiến độ >= 70%: chuyển thẳng vào thi không hiện modal.
3. **Typecheck & Lint**:
   - `pnpm --filter web typecheck`
   - `pnpm --filter api typecheck` (hoặc build)
