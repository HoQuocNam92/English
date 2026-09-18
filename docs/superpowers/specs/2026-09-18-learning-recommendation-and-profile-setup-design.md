# Thiết kế: Quy trình gợi ý học tập, Thiết lập trình độ/mục tiêu & Bổ sung Bài học vào mục Luyện tập

**Ngày lập**: 18/09/2026  
**Dự án**: TechEnglish Pro (KLCN028)  
**Tài liệu tham chiếu**: `docs/01-functional-requirements.md`, `docs/05-complex-flows.md`, `CLAUDE.md`

---

## 1. Bối cảnh & Mục tiêu

Người học tiếng Anh chuyên ngành CNTT trên TechEnglish Pro cần:
1. **Dễ dàng tìm thấy bài học để học và luyện tập**:
   - Hiện tại trang `/learn/practice` thiếu ô thẻ "Bài học chuyên ngành" (chỉ có 3 ô: Từ vựng, Bài thi, Tình huống thực tế).
   - Thanh điều hướng (Topbar) của người học thiếu đường dẫn trực tiếp tới kho "Bài học" (`/learn/lessons`).
2. **Chủ động thiết lập và thay đổi Trình độ, Lĩnh vực CNTT, Mục tiêu nghề nghiệp, Chứng chỉ mục tiêu**:
   - Khi tạo tài khoản mới (đăng ký email hoặc Google OAuth), người dùng chưa được tự động chuyển hướng qua màn hình Onboarding mà bị gán mặc định `Beginner` và trạng thái `Chưa thiết lập` cho Lĩnh vực và Chứng chỉ.
   - Trang Hồ sơ cá nhân (`/learn/profile`) thiếu giao diện để xem và cập nhật lại các mục tiêu học tập này.
   - Trang chủ (`/learn`) bị lỗi ghép chuỗi hiển thị `"Chưa thiết lập Cloud Practitioner"` và `"về Chưa thiết lập..."`.
3. **Quy trình gợi ý học tập thích ứng (Adaptive Learning Recommendation Flow)**:
   - Hệ thống tự động phân tích dữ liệu thực tế: bài học dở dang, điểm số các bài kiểm tra gần đây (đặc biệt các bài thi chưa đạt / điểm thấp), và từ vựng hay trả lời sai.
   - Sắp xếp nội dung theo độ ưu tiên rõ ràng (Ưu tiên 1: Cần củng cố gấp $\rightarrow$ Ưu tiên 2: Luyện tập tăng cường $\rightarrow$ Ưu tiên 3: Lộ trình tiếp theo).
   - Hiển thị trực quan tại Trang chủ (`/learn`) với lý do đề xuất cụ thể và nút hành động nhanh để người học bắt đầu ngay.

---

## 2. Kiến trúc & Thiết kế kỹ thuật

Tuân thủ nghiêm ngặt **Clean Architecture**:
- **Presentation**: NestJS Controller / Next.js UI Components.
- **Application**: Use cases, DTOs, Service Interfaces.
- **Domain**: Pure TypeScript entities & business logic rules.
- **Infrastructure**: Prisma Repositories, Database queries.

```
┌────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                        │
│  - LearnerShell (Topbar: Thêm link Bài học)                │
│  - /learn/practice (Thêm thẻ Bài học chuyên ngành)         │
│  - /learn (Khối Gợi ý học tập theo độ ưu tiên + fix text)  │
│  - /learn/profile (Tab Mục tiêu & Trình độ học tập)         │
│  - /register & /google/callback (Chuyển sang /onboarding)  │
└────────────────────────────┬───────────────────────────────┘
                             │ HTTP API Calls
                             ▼
┌────────────────────────────────────────────────────────────┐
│                      NestJS API                            │
│  - GET /recommendations/me                                 │
│      └─ RecommendationService                              │
│           ├─ Phân tích LearningProgress (bài dở dang)      │
│           ├─ Phân tích ExamAttempt (bài thi < 70%)         │
│           ├─ Phân tích VocabularyProgress (từ sai > 0)     │
│           └─ Phân tích LearnerProfile (level, domain, cert)│
│  - PUT /learner-profiles/me/goals (Cập nhật goals & level) │
└────────────────────────────┬───────────────────────────────┘
                             │ Prisma Client
                             ▼
┌────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                       │
│  (lessons, exams, exam_attempts, learning_progress,       │
│   vocabulary_progress, learner_profiles, levels, domains)  │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Chi tiết chức năng

### 3.1. Ô "Bài học chuyên ngành" & Điều hướng học tập

#### Frontend:
1. **Trang Luyện tập (`apps/web/app/(learner)/learn/practice/page.tsx`)**:
   - Thêm thẻ thứ 4 vào `practiceCategories`:
     - `id`: `lessons`
     - `title`: `Bài học chuyên ngành`
     - `badge`: `${data.lessons.length} BÀI HỌC`
     - `description`: `Học và thực hành đọc hiểu tài liệu kỹ thuật, kiến trúc hệ thống và thuật ngữ.`
     - `icon`: `auto_stories`
     - `bgIcon`: `bg-primary-light text-primary group-hover:bg-primary-container group-hover:text-surface-white`
     - `badgeClass`: `text-primary bg-primary/10`
     - `link`: `/learn/lessons`
2. **Thanh điều hướng Learner Topbar (`apps/web/src/shared/layout/LearnerShell.tsx`)**:
   - Cập nhật danh sách điều hướng:
     - Trang chủ (`/learn`)
     - **Bài học** (`/learn/lessons`) *(mới)*
     - Luyện tập (`/learn/practice`)
     - Thi thử (`/learn/quiz/tech`)
     - Tiến độ (`/learn/progress`)

---

### 3.2. Luồng Onboarding & Quản lý Mục tiêu / Trình độ

#### Frontend:
1. **Sau khi đăng ký (`apps/web/app/(auth)/register/page.tsx`)**:
   - Sau khi tạo tài khoản và lưu token thành công, điều hướng người dùng tới `/onboarding` thay vì `/learn`.
2. **Sau khi đăng nhập Google lần đầu (`apps/web/app/(auth)/google/callback/page.tsx`)**:
   - Kiểm tra `learnerProfile`: nếu chưa hoàn thành onboarding (`onboardingCompleted === false`), chuyển sang `/onboarding`.
3. **Trang Hồ sơ cá nhân (`apps/web/app/(learner)/learn/profile/page.tsx`)**:
   - Thêm tab: **"Mục tiêu & Trình độ"** (`goals`).
   - Tải danh sách taxonomy: `levels`, `domains`, `certificates`, `career-goals`.
   - Cho phép học viên cập nhật:
     - Trình độ tiếng Anh (Level).
     - Lĩnh vực CNTT quan tâm (Domains - Multi-select).
     - Mục tiêu nghề nghiệp (Career Goal).
     - Chứng chỉ mục tiêu (Target Certificate).
   - Nút **"Lưu thay đổi mục tiêu"** gọi API cập nhật.
4. **Trang chủ (`apps/web/app/(learner)/learn/page.tsx`)**:
   - Xử lý khi `cert` chưa thiết lập:
     - Tiêu đề: *"Chưa thiết lập mục tiêu chứng chỉ"* (thay vì `"Chưa thiết lập Cloud Practitioner"`).
     - Mô tả: *"Hãy chọn chứng chỉ mục tiêu và lĩnh vực CNTT để nhận lộ trình bài học cá nhân hoá tối ưu."*
     - Nút bấm: *"Thiết lập mục tiêu ngay"* dẫn tới `/learn/profile` hoặc `/onboarding`.

#### Backend:
1. **API cập nhật mục tiêu học tập**:
   - `PUT /learner-profiles/me/goals` (hoặc mở rộng `PUT /learner-profiles/me`):
     - Nhận: `{ levelCode?: string; domainCodes?: string[]; careerGoalCodes?: string[]; certificateCodes?: string[]; weeklyStudyTargetMinutes?: number }`.
     - Đồng bộ cập nhật bảng `learner_profiles`, `learner_profile_domains`, `learner_profile_career_goals`, `learner_certificate_goals`.

---

### 3.3. Quy trình & Thuật toán Gợi ý học tập (Recommendation Engine)

#### Backend:
1. **Module `recommendation`**:
   - Endpoint: `GET /recommendations/me`
   - Thuật toán xếp hạng độ ưu tiên:
     - **Tầng 1 (Độ ưu tiên: Cao nhất - `urgent` / Điểm ưu tiên: 90 - 100)**:
       - **Bài thi kiểm tra chưa đạt**: Tìm các lần thi trong `ExamAttempt` có `scorePercent < 70` hoặc `passed === false`. Lấy domain/topics của bài thi để tìm các bài học liên quan chưa hoàn thành.
         - *Lý do*: `"Cần củng cố: Điểm bài kiểm tra gần nhất chưa đạt ({score}%)"`.
         - *Hành động*: Ôn tập lại bài học đó (`/learn/lessons/{id}`).
       - **Bài học dở dang**: Bài học trong `LearningProgress` có `status === 'in_progress'` và `completionPercent < 100`.
         - *Lý do*: `"Tiếp tục bài học dở dang (đã hoàn thành {percent}%)"`.
         - *Hành động*: Tiếp tục học (`/learn/lessons/{id}`).
       - **Từ vựng hay sai**: Từ vựng trong `VocabularyProgress` có `wrongCount > 0`.
         - *Lý do*: `"Củng cố từ vựng: Bạn có {count} từ vựng hay trả lời sai"`.
         - *Hành động*: Luyện tập Flashcards (`/learn/flashcards`).
     - **Tầng 2 (Độ ưu tiên: Cao - `practice` / Điểm ưu tiên: 70 - 89)**:
       - Nếu vừa học xong bài học lý thuyết mà chưa làm bài thi liên quan: Gợi ý bài kiểm tra trắc nghiệm hoặc bài thi thử (`/learn/quiz/tech` hoặc bài exam cụ thể).
         - *Lý do*: `"Luyện tập củng cố sau khi hoàn thành bài học"`.
     - **Tầng 3 (Độ ưu tiên: Tiêu chuẩn - `next_path` / Điểm ưu tiên: 50 - 69)**:
       - Bài học mới (`status === 'not_started'`) khớp với Trình độ hiện tại (`level`) + Lĩnh vực CNTT (`domain`) hoặc Chứng chỉ (`certificate`) của học viên.
         - *Lý do*: `"Đề xuất theo lộ trình {domainName} - Trình độ {levelName}"`.
         - *Hành động*: Bắt đầu bài học (`/learn/lessons/{id}`).

2. **Dữ liệu trả về (DTO)**:
```typescript
interface LearningRecommendationItem {
  id: string;
  type: 'lesson' | 'exam' | 'vocab' | 'scenario';
  title: string;
  summary?: string;
  reason: string;
  priority: 'urgent' | 'high' | 'normal';
  priorityScore: number;
  domainName?: string;
  levelName?: string;
  actionUrl: string;
  actionText: string;
  progressPercent?: number;
}
```

#### Frontend:
- Tại **Trang chủ (`apps/web/app/(learner)/learn/page.tsx`)**:
  - Đặt khu vực **"Gợi ý học tập dành cho bạn"** ở vị trí trên cùng của lưới nội dung chính.
  - Sử dụng visual treatment chuẩn violet / AI:
    - Huy hiệu độ ưu tiên:
      - 🔴 `Cần củng cố gấp` (badge màu đỏ/cam nổi bật với icon `warning` hoặc `autorenew`).
      - 🟡 `Luyện tập tăng cường` (badge màu tím AI với icon `psychology`).
      - 🟢 `Lộ trình đề xuất` (badge màu xanh primary với icon `recommend`).
    - Thẻ hiển thị rõ tiêu đề, tên domain, trình độ, lý do gợi ý cụ thể, thanh tiến độ nếu có, và nút bấm trực tiếp để học viên tiếp tục học hoặc luyện tập ngay chỉ bằng một cú nhấp chuột.

---

## 4. Kế hoạch kiểm thử & Xác thực

1. **Kiểm tra giao diện Luyện tập (`/learn/practice`)**:
   - Thấy đủ 4 ô thẻ, ô "Bài học chuyên ngành" hiển thị đúng số lượng bài học và nhấp chuyển sang `/learn/lessons`.
   - Topbar học viên có link "Bài học".
2. **Kiểm tra luồng Onboarding & Hồ sơ cá nhân**:
   - Đăng ký tài khoản mới $\rightarrow$ tự động dẫn vào `/onboarding` 4 bước $\rightarrow$ chọn trình độ và lĩnh vực $\rightarrow$ lưu thành công.
   - Vào `/learn/profile` tab "Mục tiêu & Trình độ" $\rightarrow$ đổi sang Intermediate + DevOps $\rightarrow$ lưu và kiểm tra trang chủ cập nhật theo mục tiêu mới.
   - Trang chủ hiển thị chuẩn xác, không còn lỗi chuỗi `"Chưa thiết lập Cloud Practitioner"`.
3. **Kiểm tra Quy trình gợi ý học tập**:
   - Khi có bài học dở dang $\rightarrow$ xuất hiện thẻ gợi ý mức ưu tiên cao "Tiếp tục bài học dở dang".
   - Khi có bài thi điểm thấp (< 70%) $\rightarrow$ xuất hiện thẻ gợi ý "Cần củng cố sau bài thi".
   - Khi học viên mới chưa có lịch sử $\rightarrow$ gợi ý bài học mở đầu theo Trình độ và Lĩnh vực đã chọn.
