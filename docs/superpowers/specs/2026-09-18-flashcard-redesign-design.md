# Thiết Kế Chi Tiết Hệ Thống Flashcards Mới

## 1. Tổng Quan Mục Tiêu
Cải tiến toàn diện phân hệ học từ vựng Flashcard theo giao diện chuyên nghiệp kiểu Study4:
- **Loại bỏ** thanh quảng cáo / nhóm Facebook bên phải.
- **Màn hình 1 (Trang chủ Flashcards `/learn/flashcards`)**: Bổ sung tab *Đang học*, *Khám phá*, *List từ của tôi*, thống kê Đã học/Đã nhớ/Cần ôn tập, biểu đồ nhiệt Heatmap, danh sách bộ từ đang học kèm chỉ số tiến độ và nút tạo danh sách từ.
- **Màn hình 2 (Chi tiết bộ từ vựng `/learn/flashcards/[id]`)**: Nút lớn "Luyện tập flashcards", nút "🔀 Xem ngẫu nhiên", nút "Dừng học list từ này" (màu đỏ), và danh sách từ vựng chi tiết dạng thẻ dọc (kèm từ loại, phiên âm, audio, định nghĩa, ví dụ, hình ảnh).
- **Màn hình 3 (Luyện tập Flashcard `/learn/flashcards/[id]/practice`)**: Thẻ lật 3D tương tác, huy hiệu từ mới/cần ôn, thanh công cụ trên (chỉ ôn từ mới, dừng học list, thông báo giới hạn từ/ngày), và 4 nút phản hồi Spaced Repetition System (SRS):
  - 🟢 **Dễ (Easy)**
  - 🟠 **Trung bình (Medium)**
  - 🔴 **Khó (Hard)**
  - ⏩ **Đã biết, loại khỏi danh sách ôn tập (Mastered)**

---

## 2. Kiến Trúc Dữ Liệu & Backend

### 2.1. Quản lý trạng thái học bộ từ (Lesson / Flashcard Set)
Sử dụng hoặc mở rộng bảng `LearningProgress` và `VocabularyProgress`:
- **Trạng thái bộ từ vựng**:
  - Khi người dùng bấm vào một bài học hoặc bắt đầu học -> ghi nhận tiến độ `LearningProgress` với trạng thái `in_progress`.
  - Khi bấm **"Dừng học list từ này"**: cập nhật trạng thái bài học thành `paused` / `abandoned` hoặc gỡ khỏi danh sách hiển thị `Đang học`, bảo lưu toàn bộ tiến độ của các từ vựng đã học.
- **Thống kê theo từng bài học**:
  - `total`: Tổng số từ trong bài học.
  - `remembered` (Đã nhớ): Số từ có `status = 'mastered'` hoặc `correctCount >= 2`.
  - `needsReview` (Cần ôn tập): Số từ có `status = 'learning'` và `nextReviewAt <= now`.
  - `newCount` (Từ mới): Số từ chưa có bản ghi tiến độ.

### 2.2. Thuật toán Spaced Repetition (SRS) với 4 Mức Độ
Khi người học đánh giá trên Flashcard (`POST /vocab-study/rate`):
1. **🟢 Dễ (Easy):**
   - Từ này người học đã nắm rất chắc.
   - `correctCount += 1`.
   - Nếu `correctCount >= 2` -> `status = 'mastered'`.
   - `nextReviewAt = now + 4 ngày` (hoặc nhân hệ số interval 2.5).
2. **🟠 Trung bình (Medium):**
   - Người học nhớ được nghĩa nhưng cần mất chút thời gian suy nghĩ.
   - `correctCount += 1`.
   - `status = 'learning'`.
   - `nextReviewAt = now + 1 ngày`.
3. **🔴 Khó (Hard):**
   - Người học chưa nhớ hoặc quên nghĩa.
   - `wrongCount += 1`, reset hoặc giảm `correctCount`.
   - `status = 'learning'`.
   - `nextReviewAt = now + 10 phút` (xuất hiện lại ngay ở cuối phiên luyện tập).
4. **⏩ Đã biết, loại khỏi danh sách ôn tập (Mastered / Skip):**
   - Người học đã biết từ này từ trước, không cần học hay ôn lại nữa.
   - `status = 'mastered'`.
   - `correctCount = 5`.
   - `nextReviewAt = now + 365 ngày` (vĩnh viễn không hiển thị lại trong danh sách ôn tập).

### 2.3. API Endpoints
- `GET /vocab-study/dashboard`: Lấy thống kê tổng quan (đã học, đã nhớ, cần ôn tập), ma trận heatmap hoạt động 30-60 ngày gần nhất, và danh sách các bài học đang theo học.
- `GET /vocab-study/lesson/:lessonId`: Lấy thông tin chi tiết bài học, danh sách toàn bộ từ vựng (kèm nghĩa, ví dụ, audio, trạng thái học hiện tại). Hỗ trợ query `?sort=random` hoặc `?sort=default`.
- `GET /vocab-study/practice-session/:lessonId`: Lấy danh sách từ để luyện tập flashcard. Hỗ trợ query `?onlyNew=true` (chỉ lấy từ mới).
- `POST /vocab-study/rate`: Nhận `{ vocabularyId, rating: 'easy' | 'medium' | 'hard' | 'mastered' }`.
- `POST /vocab-study/toggle-active-list`: Nhận `{ lessonId, active: boolean }` để đánh dấu đang học hoặc dừng học list từ này.

---

## 3. Thiết Kế Giao Diện (Frontend Next.js)

### 3.1. Màn hình 1: Trang chủ Flashcards (`/learn/flashcards/page.tsx`)
- **Tabs Navigation:**
  - `List từ của tôi`: Hiển thị danh sách do người dùng tạo hoặc từ lưu riêng.
  - `Đang học` (active mặc định):
    - Banner hướng dẫn / thông báo đầu trang.
    - Card thống kê tổng: 3 con số nổi bật (*Đã học*, *Đã nhớ*, *Cần ôn tập*) + Lưới ô vuông nhiệt (Activity Heatmap 52 tuần hoặc 30 ngày).
    - Grid danh sách bộ từ đang học: Mỗi card hiển thị: Tên bài học, số từ, lượt học, người tạo (`study4` / `TechEnglish`), số từ cần ôn tập (màu đỏ cam), số từ đã nhớ (màu xanh lá), nút **"Học tiếp"**.
    - Section "List từ đã tạo": Card có nút `+ Tạo list từ`.
  - `Khám phá`: Grid danh sách các bài học và bộ từ trong toàn hệ thống, có thanh tìm kiếm và lọc theo chủ đề/trình độ.
- **Bố cục:** Toàn bộ trang rộng thoáng, canh giữa, loại bỏ hoàn toàn các banner quảng cáo bên phải.

### 3.2. Màn hình 2: Xem chi tiết bộ từ vựng (`/learn/flashcards/[id]/page.tsx`)
- **Header:** Tên bài học, danh mục, số lượng từ (`List có X từ`).
- **Nút hành động chính:** Nút lớn xanh dương: **"Luyện tập flashcards"** dẫn tới `/learn/flashcards/[id]/practice`.
- **Thanh công cụ phụ:**
  - Trái: `🔀 Xem ngẫu nhiên` (đảo lộn thứ tự danh sách hiển thị).
  - Phụ: `📝 Kiểm tra trắc nghiệm (Quiz)` dẫn tới `/learn/flashcards/[id]/quiz`.
  - Phải: Nút đỏ `🗄️ Dừng học list từ này` (hiển thị popup xác nhận bảo lưu tiến độ).
- **Danh sách từ vựng chi tiết:**
  - Card cuộn dọc cho từng từ vựng:
    - Cột trái: Từ vựng tiếng Anh (chữ đậm) + loại từ trong ngoặc đơn `(noun)` + phiên âm quốc tế `/.../` + nút loa phát âm.
    - Dòng định nghĩa: `Định nghĩa: [Nghĩa tiếng Việt]`.
    - Dòng ví dụ: `Ví dụ: • [Câu tiếng Anh] - [Dịch tiếng Việt]`.
    - Cột phải: Ảnh minh họa của từ vựng (nếu có).

### 3.3. Màn hình 3: Luyện tập Flashcard (`/learn/flashcards/[id]/practice/page.tsx`)
- **Thanh điều khiển trên:**
  - `<< Xem tất cả` (quay lại màn hình chi tiết bài).
  - `⚙️ Cài đặt` (tùy chọn phát âm tự động, lật mặt trước/sau).
  - `Các từ đã bỏ qua` (xem danh sách các từ đã bấm "Đã biết").
  - Checkbox: `[ ] Chỉ ôn từ mới` (lọc nhanh để chỉ học từ chưa thuộc).
  - Nút đỏ: `🗄️ Dừng học list từ này`.
- **Thông báo giới hạn học:**
  - Hộp cảnh báo màu vàng: *"Chú ý: bạn được học tối đa 20 từ mới một ngày. Đây là lượng từ phù hợp để bạn có thể học hiệu quả."* (kèm đếm số từ đã nạp hôm nay).
- **Thẻ Flashcard tương tác:**
  - Huy hiệu góc trên: Badge "Từ mới" (màu cam) hoặc "Cần ôn tập" (màu xanh).
  - Mặt trước:
    - Từ tiếng Anh (cỡ chữ 36-44px, đậm).
    - Nút loa nghe phát âm chuẩn.
    - Loại từ và phiên âm IPA bên dưới.
    - Icon xoay lật thẻ 🔁 ở góc phải dưới.
  - Mặt sau:
    - Lật 3D tự nhiên khi click vào bất kỳ đâu trên thẻ hoặc bấm 🔁.
    - Hiển thị đầy đủ nghĩa tiếng Việt, nghĩa tiếng Anh, câu ví dụ và ảnh minh họa.
- **Thanh 4 nút đánh giá:**
  - 🟢 **Dễ** (Icon mặt cười xanh): SRS giãn cách ôn tập.
  - 🟠 **Trung bình** (Icon mặt bình thường cam): Ôn lại vào ngày mai.
  - 🔴 **Khó** (Icon mặt chéo/mếu đỏ): Cho từ vào hàng đợi ôn lại ngay trong phiên.
  - ⏩ **Đã biết, loại khỏi danh sách ôn tập**: Đánh dấu đã thuộc và ẩn khỏi mọi vòng ôn tập.

---

## 4. Kế Hoạch Kiểm Thử & Xác Nhận
1. **Kiểm thử API:**
   - Đảm bảo gọi API rating 4 mức độ cập nhật đúng `status`, `correctCount`, `nextReviewAt` trong DB.
   - Đảm bảo tính năng "Dừng học list từ này" gỡ đúng bài học khỏi tab "Đang học" mà không làm mất từ vựng đã thuộc.
2. **Kiểm thử UI/UX:**
   - Kiểm tra lật thẻ mượt mà, phím tắt tiện lợi (Space để lật, phím số 1-4 để đánh giá).
   - Kiểm tra checkbox "Chỉ ôn từ mới" lọc chính xác danh sách từ.
   - Kiểm tra responsive hoàn hảo trên cả máy tính và thiết bị di động.
