# Learning Recommendation & Profile Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai quy trình gợi ý học tập thích ứng (Adaptive Learning Recommendations) tại trang chủ theo mức độ ưu tiên kết quả/tiến độ, bổ sung thẻ "Bài học chuyên ngành" vào trang Luyện tập & Topbar, kích hoạt luồng Onboarding khi đăng ký tài khoản mới và cho phép cập nhật Trình độ/Mục tiêu trong Hồ sơ cá nhân.

**Architecture:** Tuân thủ Clean Architecture: NestJS Recommendation module tại backend phân tích LearningProgress, ExamAttempt, VocabularyProgress và LearnerProfile để tính toán xếp hạng ưu tiên theo 3 tầng. Next.js web client tích hợp trực quan với visual treatment AI (violet/primary) tại trang chủ, thêm tab quản lý mục tiêu trong Profile, thêm thẻ Bài học trong Practice và thanh Topbar.

**Tech Stack:** NestJS, TypeScript, Prisma, PostgreSQL, Next.js 15 (App Router), Tailwind CSS, Lucide / Material Symbols Icons.

## Global Constraints
- Backend: Clean Architecture (Domain $\rightarrow$ Application $\rightarrow$ Infrastructure/Presentation).
- Prisma: Chỉ được import và sử dụng trong Infrastructure layer backend.
- UI: Giữ nguyên design token và theme hiện tại của TechEnglish Pro.

---

### Task 1: Thêm ô "Bài học chuyên ngành" vào mục Luyện tập & Link "Bài học" vào Topbar

**Files:**
- Modify: `apps/web/app/(learner)/learn/practice/page.tsx:42-74`
- Modify: `apps/web/src/shared/layout/LearnerShell.tsx:21-27`

**Interfaces:**
- Consumes: `data.lessons` từ API `GET /lessons?limit=100&status=published`
- Produces: Thẻ thứ 4 trong `practiceCategories` dẫn tới `/learn/lessons`

- [ ] **Step 1: Cập nhật `LearnerShell.tsx` để thêm link Bài học**
Thêm `{ href: '/learn/lessons', label: 'Bài học', exactMatch: false }` vào `navLinks` giữa Trang chủ và Luyện tập.

- [ ] **Step 2: Thêm thẻ "Bài học chuyên ngành" vào `apps/web/app/(learner)/learn/practice/page.tsx`**
Cập nhật mảng `practiceCategories`:
```typescript
    {
      id: 'lessons',
      title: 'Bài học chuyên ngành',
      badge: `${data.lessons.length} BÀI HỌC`,
      description: 'Học và thực hành đọc hiểu tài liệu kỹ thuật, kiến trúc hệ thống và thuật ngữ CNTT.',
      icon: 'auto_stories',
      bgIcon: 'bg-primary-light text-primary group-hover:bg-primary-container group-hover:text-surface-white',
      badgeClass: 'text-primary bg-primary-container/20',
      link: '/learn/lessons',
    }
```

- [ ] **Step 3: Kiểm tra giao diện Luyện tập**
Xác nhận trang `/learn/practice` hiển thị đủ 4 cột đều đặn trên màn hình lớn (grid-cols-4), ô Bài học hiển thị đúng số bài học và bấm vào chuyển sang `/learn/lessons`.

- [ ] **Step 4: Commit**
```bash
git add apps/web/app/(learner)/learn/practice/page.tsx apps/web/src/shared/layout/LearnerShell.tsx
git commit -m "feat(learner): add lessons card to practice page and lessons link to topbar"
```

---

### Task 2: Kích hoạt Onboarding sau khi Đăng ký và Đăng nhập Google

**Files:**
- Modify: `apps/web/app/(auth)/register/page.tsx:61-66`
- Modify: `apps/web/app/(auth)/google/callback/page.tsx:32-38`

**Interfaces:**
- Produces: Chuyển hướng người học mới tạo tài khoản qua `/onboarding` để thiết lập trình độ và mục tiêu.

- [ ] **Step 1: Sửa luồng redirect sau đăng ký email trong `register/page.tsx`**
Thay đổi `router.push('/learn')` thành `router.push('/onboarding')` khi đăng ký tài khoản thành công.

- [ ] **Step 2: Sửa luồng redirect sau Google OAuth trong `google/callback/page.tsx`**
Kiểm tra nếu vai trò là `learner`, điều hướng sang `/onboarding` nếu tài khoản mới (hoặc gọi check profile).

- [ ] **Step 3: Commit**
```bash
git add apps/web/app/(auth)/register/page.tsx apps/web/app/(auth)/google/callback/page.tsx
git commit -m "feat(auth): redirect newly registered learners to onboarding flow"
```

---

### Task 3: Backend - Bổ sung API cập nhật Trình độ & Mục tiêu học tập

**Files:**
- Modify: `apps/api/src/application/learner-profile/learner-profile.service.ts`
- Modify: `apps/api/src/presentation/learner-profile.controller.ts`
- Modify: `apps/api/src/presentation/http-dto/content.dto.ts`

**Interfaces:**
- Endpoint: `PUT /learner-profiles/me/goals`
- Request Body: `{ levelCode?: string; domainCodes?: string[]; careerGoalCodes?: string[]; certificateCodes?: string[]; weeklyStudyTargetMinutes?: number }`
- Response: LearnerProfile với đầy đủ `level`, `domains`, `careerGoals`, `certGoals`.

- [ ] **Step 1: Định nghĩa DTO `UpdateLearnerGoalsDto` trong `content.dto.ts`**
Thêm DTO hỗ trợ cập nhật `levelCode`, `domainCodes`, `careerGoalCodes`, `certificateCodes`, `weeklyStudyTargetMinutes`.

- [ ] **Step 2: Thêm hàm `updateGoals(userId, dto)` trong `learner-profile.service.ts`**
Cập nhật `levelId` dựa trên `levelCode`, đồng bộ hoá quan hệ domains (`learnerProfileDomain`), careerGoals (`learnerProfileCareerGoal`), và certificateGoals (`learnerCertificateGoal`).

- [ ] **Step 3: Thêm endpoint `PUT me/goals` trong `learner-profile.controller.ts`**
Gắn decorator `@UseGuards(JwtAuthGuard, PermissionsGuard)` và gọi `svc.updateGoals(u.sub, dto)`.

- [ ] **Step 4: Commit**
```bash
git add apps/api/src/application/learner-profile/learner-profile.service.ts apps/api/src/presentation/learner-profile.controller.ts apps/api/src/presentation/http-dto/content.dto.ts
git commit -m "feat(api): add update learner learning goals and level API endpoint"
```

---

### Task 4: Frontend - Thêm tab "Mục tiêu & Trình độ" trong Profile & Sửa lỗi Trang chủ

**Files:**
- Modify: `apps/web/app/(learner)/learn/profile/page.tsx`
- Modify: `apps/web/app/(learner)/learn/page.tsx:180-218`

**Interfaces:**
- Consumes: `GET /levels`, `GET /domains`, `GET /career-goals`, `GET /certificates`, `PUT /learner-profiles/me/goals`
- Produces: Giao diện trực quan cho phép người học xem và đổi Trình độ, Lĩnh vực CNTT, Mục tiêu nghề nghiệp, Chứng chỉ.

- [ ] **Step 1: Mở rộng `LearnerProfilePage` với tab `goals`**
Thêm tab "Mục tiêu & Trình độ". Tải options từ `/levels`, `/domains`, `/career-goals`, `/certificates`.
Cho phép người dùng chọn lại Level, multi-select Lĩnh vực CNTT, chọn Chứng chỉ mục tiêu và lưu lại qua `PUT /learner-profiles/me/goals`.

- [ ] **Step 2: Sửa lỗi hiển thị chuỗi `"Chưa thiết lập Cloud Practitioner"` trên Trang chủ (`/learn/page.tsx`)**
Khi `cert === 'Chưa thiết lập'`:
- Tiêu đề mục tiêu hiển thị: *"Chưa thiết lập mục tiêu chứng chỉ"*.
- Mô tả hiển thị: *"Hãy thiết lập chứng chỉ và lĩnh vực quan tâm để hệ thống gợi ý lộ trình học tập tối ưu cho bạn."*
- Nút CTA hiển thị: *"Thiết lập mục tiêu ngay"* dẫn tới `/learn/profile`.

- [ ] **Step 3: Commit**
```bash
git add apps/web/app/(learner)/learn/profile/page.tsx apps/web/app/(learner)/learn/page.tsx
git commit -m "feat(learner): add learning goals setup tab in profile and fix home page goal card"
```

---

### Task 5: Backend - Xây dựng Recommendation Engine (Quy trình gợi ý học tập)

**Files:**
- Create: `apps/api/src/application/recommendation/recommendation.service.ts`
- Create: `apps/api/src/presentation/recommendation.controller.ts`
- Create: `apps/api/src/modules/recommendation.module.ts`
- Modify: `apps/api/src/app.module.ts`

**Interfaces:**
- Endpoint: `GET /recommendations/me`
- Response: `{ recommendations: LearningRecommendationItem[] }`
- Thuật toán ưu tiên:
  - **Tầng 1 (Cao nhất / Cần củng cố gấp)**:
    - `ExamAttempt` có `scorePercent < 70` hoặc `passed === false` $\rightarrow$ gợi ý bài học thuộc topics/domain của bài thi để củng cố.
    - `LearningProgress` có `status === 'in_progress'` và `completionPercent < 100` $\rightarrow$ gợi ý hoàn thành bài học.
    - `VocabularyProgress` có `wrongCount > 0` $\rightarrow$ gợi ý luyện tập flashcards từ vựng hay sai.
  - **Tầng 2 (Ưu tiên cao / Luyện tập tăng cường)**:
    - Bài thi hoặc quiz tương ứng với bài học vừa hoàn thành.
  - **Tầng 3 (Tiêu chuẩn / Lộ trình tiếp theo)**:
    - Bài học mới theo Trình độ và Lĩnh vực CNTT / Chứng chỉ mục tiêu của học viên.

- [ ] **Step 1: Viết `recommendation.service.ts`**
Triển khai logic truy vấn Prisma, tổng hợp dữ liệu học viên, chấm điểm độ ưu tiên và sắp xếp `recommendations`.

- [ ] **Step 2: Viết `recommendation.controller.ts`**
Đăng ký route `GET /recommendations/me` với JWT guard.

- [ ] **Step 3: Đăng ký `RecommendationModule` vào `app.module.ts`**

- [ ] **Step 4: Kiểm tra build API**
Chạy `npm run build` trong `apps/api` để đảm bảo biên dịch TypeScript thành công không lỗi type.

- [ ] **Step 5: Commit**
```bash
git add apps/api/src/application/recommendation apps/api/src/presentation/recommendation.controller.ts apps/api/src/modules/recommendation.module.ts apps/api/src/app.module.ts
git commit -m "feat(api): implement adaptive learning recommendation engine with multi-tier priority"
```

---

### Task 6: Frontend - Hiển thị Khối "Gợi ý học tập" tại Trang chủ (`/learn`)

**Files:**
- Modify: `apps/web/app/(learner)/learn/page.tsx`

**Interfaces:**
- Consumes: `GET /recommendations/me`
- Produces: Khu vực "Gợi ý học tập hôm nay" với visual treatment chuẩn AI/violet, phân cấp huy hiệu:
  - 🔴 `Cần củng cố gấp` (Bài thi điểm thấp, bài học dở dang)
  - 🟡 `Luyện tập tăng cường` (Làm bài kiểm tra, ôn từ vựng)
  - 🟢 `Lộ trình đề xuất` (Bài học tiếp theo theo Level & Domain)
  - Mỗi thẻ hiển thị: Tiêu đề, Domain badge, Level badge, Lý do gợi ý chi tiết, thanh tiến độ và Nút hành động trực tiếp ("Củng cố ngay" / "Tiếp tục học" / "Luyện tập").

- [ ] **Step 1: Cập nhật hàm `loadData()` trong `/learn/page.tsx`**
Thêm promise gọi `apiClient.get('/recommendations/me')` và lưu state `recommendations`.

- [ ] **Step 2: Thiết kế component khối Gợi ý học tập**
Render khối thẻ gợi ý ở vị trí trung tâm nổi bật trên trang chủ, kèm empty state thân thiện nếu chưa có gợi ý.

- [ ] **Step 3: Kiểm tra hiển thị responsive và theme styling**

- [ ] **Step 4: Commit**
```bash
git add apps/web/app/(learner)/learn/page.tsx
git commit -m "feat(learner): render adaptive learning recommendations with priority badges on home page"
```

---

### Task 7: Xác thực toàn diện & Kiểm thử (End-to-End Verification)

**Files:**
- Kiểm tra toàn bộ luồng hoạt động từ UI đến Backend database.

- [ ] **Step 1: Typecheck & Build**
Chạy `npm run build` cho cả `apps/api` và `apps/web` để kiểm tra tính toàn vẹn code.

- [ ] **Step 2: Xác thực các tiêu chí**
1. Ô "Bài học chuyên ngành" xuất hiện ở `/learn/practice`, bấm chuyển sang danh sách bài học.
2. Topbar có link "Bài học".
3. Trang Profile có tab cập nhật Trình độ & Lĩnh vực & Chứng chỉ mục tiêu.
4. Trang chủ hiển thị khối Gợi ý học tập sắp xếp theo mức độ ưu tiên và không còn lỗi text `"Chưa thiết lập Cloud Practitioner"`.
