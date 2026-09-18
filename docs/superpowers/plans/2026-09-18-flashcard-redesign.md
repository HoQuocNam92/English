# Kế Hoạch Triển Khai Hệ Thống Flashcards Mới (Study4 UI)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng lại hoàn chỉnh giao diện và luồng học Flashcard theo phong cách Study4: bỏ cột quảng cáo bên phải, 3 tabs (Đang học, Khám phá, List từ của tôi), màn hình chi tiết bài học (Luyện tập, Xem ngẫu nhiên, Dừng học list, Danh sách từ dọc), và màn hình luyện tập flashcard với 4 mức độ đánh giá (Dễ, Trung bình, Khó, Đã biết), checkbox chỉ ôn từ mới và dừng học list.

**Architecture:** Mở rộng NestJS `VocabStudyService` & `VocabStudyController` để hỗ trợ rating 4 mức độ SRS, quản lý trạng thái học bộ từ (bảng `LearningProgress` & `VocabularyProgress`), và xây dựng 3 màn hình React/Next.js App Router tại `apps/web/app/(learner)/learn/flashcards`.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS, Material Symbols Icons, NestJS, Prisma ORM, PostgreSQL.

---

### Task 1: Cập Nhật Backend API (VocabStudyService & VocabStudyController)

**Files:**
- Modify: `apps/api/src/application/vocab-study/vocab-study.service.ts`
- Modify: `apps/api/src/presentation/vocab-study.controller.ts`

**Interfaces:**
- Produces:
  - `POST /vocab-study/rate`: `{ vocabularyId: string, rating: 'easy' | 'medium' | 'hard' | 'mastered' }` -> cập nhật Spaced Repetition cho từ vựng.
  - `GET /vocab-study/dashboard`: -> `{ stats: { learned, remembered, needsReview }, heatmap: { date: string, count: number }[], studyingLessons: any[] }`
  - `GET /vocab-study/lesson/:id`: -> `{ lesson: any, words: any[], stats: { total, needsReview, remembered, isStudying } }`
  - `POST /vocab-study/toggle-studying`: `{ lessonId: string, isStudying: boolean }` -> cập nhật `LearningProgress`

- [ ] **Step 1: Viết logic rating SRS 4 mức độ trong VocabStudyService**
  - `easy`: `correctCount + 1`, nếu `correctCount >= 2` -> `mastered`, `nextReviewAt = now + 4 ngày`.
  - `medium`: `correctCount + 1`, `status = learning`, `nextReviewAt = now + 1 ngày`.
  - `hard`: `wrongCount + 1`, `correctCount = 0`, `status = learning`, `nextReviewAt = now + 10 phút`.
  - `mastered`: `status = mastered`, `correctCount = 5`, `nextReviewAt = now + 365 ngày`.

- [ ] **Step 2: Viết logic lấy Dashboard stats & heatmap trong VocabStudyService**
  - Đếm tổng số từ `status != 'new'` (Đã học), `status == 'mastered'` (Đã nhớ), `status == 'learning' && nextReviewAt <= now` (Cần ôn tập).
  - Gom nhóm `VocabularyProgress.lastReviewAt` trong 60 ngày gần nhất để vẽ biểu đồ nhiệt heatmap.
  - Lấy danh sách các bài học mà người dùng đang học (có `LearningProgress` với `status != 'abandoned'`), tính kèm số từ cần ôn tập và đã nhớ cho mỗi bài.

- [ ] **Step 3: Viết logic toggle trạng thái đang học của bài học**
  - Khi bấm "Dừng học list từ này": cập nhật `LearningProgress` của `lessonId` thành `abandoned` hoặc xóa khỏi danh sách đang học, bảo lưu nguyên vẹn `VocabularyProgress`.

- [ ] **Step 4: Mở rộng VocabStudyController khai báo các route mới**

- [ ] **Step 5: Kiểm tra biên dịch backend (`pnpm --filter api build`)**

---

### Task 2: Trang Chủ Flashcards (`/learn/flashcards/page.tsx`)

**Files:**
- Modify: `apps/web/app/(learner)/learn/flashcards/page.tsx`

**Interfaces:**
- Consumes: `GET /vocab-study/dashboard`, `GET /lessons`

- [ ] **Step 1: Xây dựng Layout tổng thể rộng thoáng (loại bỏ cột quảng cáo phải)**
  - Căn giữa giao diện `max-w-5xl mx-auto px-4 py-6`.
  - Header: Icon `style` + Tiêu đề "Flashcards".
  - Thanh Tab: `List từ của tôi` | `Đang học` | `Khám phá`.

- [ ] **Step 2: Xây dựng Tab `Đang học`**
  - Khung thống kê 3 con số: **Đã học**, **Đã nhớ**, **Cần ôn tập**.
  - Biểu đồ ô vuông nhiệt Heatmap mô phỏng hoạt động học tập các ngày trong tuần/tháng.
  - Lưới danh sách bài học đang học: Thẻ bài học hiển thị tên bài, số từ, người tạo, badge `Cần ôn tập: X` (đỏ cam), `Đã nhớ: Y` (xanh lá), và nút bấm **Học tiếp**.
  - Khu vực "List từ đã tạo": Thẻ viền nét đứt `+ Tạo list từ`.

- [ ] **Step 3: Xây dựng Tab `Khám phá`**
  - Lưới toàn bộ bài học và bộ từ vựng kỹ thuật trong hệ thống.
  - Bộ lọc tìm kiếm theo từ khóa, chuyên ngành (Domain), và trình độ (Level).
  - Nút "Bắt đầu học" dẫn vào trang chi tiết bài học.

- [ ] **Step 4: Xây dựng Tab `List từ của tôi`**
  - Giao diện quản lý các từ vựng người dùng đã lưu hoặc danh sách tự tạo.

---

### Task 3: Chi Tiết Bộ Từ Vựng (`/learn/flashcards/[id]/page.tsx`)

**Files:**
- Modify: `apps/web/app/(learner)/learn/flashcards/[id]/page.tsx`

**Interfaces:**
- Consumes: `GET /vocab-study/lesson/:id`, `POST /vocab-study/toggle-studying`

- [ ] **Step 1: Header và Khung tác vụ chính**
  - Tiêu đề: `Flashcards: [Tên bài học]`.
  - Nút lớn nổi bật: **"Luyện tập flashcards"** dẫn tới `/learn/flashcards/[id]/practice`.
  - Thanh công cụ phụ:
    - Trái: Nút **"🔀 Xem ngẫu nhiên"** (đảo thứ tự từ trong danh sách hiển thị) và nút phụ **"📝 Kiểm tra trắc nghiệm (Quiz)"**.
    - Phải: Nút đỏ **"🗄️ Dừng học list từ này"** có modal xác nhận (gỡ khỏi mục Đang học, bảo lưu tiến độ).
  - Dòng thống kê: `List có X từ`.

- [ ] **Step 2: Danh sách từ vựng chi tiết (Vertical Cards)**
  - Mỗi thẻ từ vựng hiển thị:
    - Cột trái: Từ tiếng Anh, (loại từ), /phiên âm IPA/, nút loa phát âm âm thanh.
    - Dòng định nghĩa: `Định nghĩa: [Nghĩa tiếng Việt]`.
    - Dòng ví dụ: `Ví dụ: • [Câu tiếng Anh] - [Dịch tiếng Việt]`.
    - Cột phải: Hình ảnh minh họa (nếu có ảnh).

- [ ] **Step 3: Xử lý chức năng "Xem ngẫu nhiên" và "Dừng học list từ này"**
  - Bấm "Xem ngẫu nhiên": Xáo trộn mảng từ vựng hiển thị ngay lập tức.
  - Bấm "Dừng học list từ này": Gọi API toggle trạng thái và chuyển hướng về `/learn/flashcards`.

---

### Task 4: Màn Hình Luyện Tập Flashcard 4 Mức Độ (`/learn/flashcards/[id]/practice/page.tsx`)

**Files:**
- Create: `apps/web/app/(learner)/learn/flashcards/[id]/practice/page.tsx`

**Interfaces:**
- Consumes: `GET /vocab-study/practice-session/:id`, `POST /vocab-study/rate`

- [ ] **Step 1: Thanh điều khiển trên & Thông báo giới hạn từ**
  - Thanh trên: `<< Xem tất cả` (quay lại màn 2) · `⚙️ Cài đặt` · `Các từ đã bỏ qua` · Checkbox **`[ ] Chỉ ôn từ mới`** · Nút đỏ `🗄️ Dừng học list từ này`.
  - Hộp thông báo màu vàng: *"Chú ý: bạn được học tối đa 20 từ mới một ngày. Đây là lượng từ phù hợp để bạn có thể học hiệu quả."* (kèm đếm số từ đã học hôm nay).

- [ ] **Step 2: Thẻ Flashcard tương tác (3D Flip Card)**
  - Badge góc trên: "Từ mới" (màu cam) hoặc "Cần ôn tập" (màu xanh).
  - Mặt trước: Từ tiếng Anh (cỡ chữ lớn 36-44px), nút loa nghe phát âm chuẩn, (loại từ) và phiên âm IPA bên dưới. Góc dưới có icon xoay lật 🔁.
  - Mặt sau (khi chạm vào thẻ hoặc bấm 🔁): Lật 3D hiển thị nghĩa tiếng Việt, nghĩa tiếng Anh, câu ví dụ và ảnh minh họa.

- [ ] **Step 3: Thanh 4 nút đánh giá mức độ ghi nhớ**
  - 🟢 **Dễ** (Icon mặt cười xanh)
  - 🟠 **Trung bình** (Icon mặt bình thường cam)
  - 🔴 **Khó** (Icon mặt mếu/chéo đỏ) -> Đưa từ vào hàng đợi ôn lại ngay trong phiên.
  - ⏩ **Đã biết, loại khỏi danh sách ôn tập** -> Đánh dấu `mastered`, loại khỏi mọi danh sách ôn.
  - Hỗ trợ phím tắt bàn phím: `Space` để lật thẻ, `1` (Dễ), `2` (Trung bình), `3` (Khó), `4` (Đã biết).

- [ ] **Step 4: Màn hình tổng kết phiên luyện tập (Summary View)**
  - Khi hoàn thành tất cả thẻ trong phiên: Hiển thị điểm tổng kết, số từ đã thuộc mới, số từ cần ôn lại, nút "Luyện tập tiếp" hoặc "Về danh sách bài học".

---

### Task 5: Giữ Chế Độ Kiểm Tra Trắc Nghiệm Cũ (`/learn/flashcards/[id]/quiz/page.tsx`)

**Files:**
- Create: `apps/web/app/(learner)/learn/flashcards/[id]/quiz/page.tsx`

- [ ] **Step 1: Di chuyển luồng làm Quiz trắc nghiệm / điền từ sang trang quiz riêng**
  - Giữ lại đầy đủ tính năng làm bài kiểm tra trắc nghiệm / điền từ vào chỗ trống cho những ai muốn tự kiểm tra kiến thức như lựa chọn ban đầu của bạn.

---

### Task 6: Kiểm Thử Toàn Diện & Tinh Chỉnh UI

- [ ] **Step 1: Chạy kiểm tra TypeScript và build cả web lẫn api**
  - `pnpm --filter api build`
  - `pnpm --filter web build`
- [ ] **Step 2: Kiểm tra responsive trên mobile và desktop**
- [ ] **Step 3: Kiểm tra audio phát âm trên trình duyệt**
