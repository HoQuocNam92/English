# Exam Filters & Readiness Warning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm thanh tìm kiếm & bộ lọc bài thi theo Chuyên ngành/Trình độ, sửa lỗi hiển thị số câu hỏi và tích hợp cảnh báo ôn tập trước khi thi nếu tiến độ bài học liên quan < 70% (không chặn người học).

**Architecture:** 
- Backend: Cập nhật `ExamsService.findAll` để đính kèm `_count.questions`.
- Frontend: Cập nhật `apps/web/app/(learner)/learn/quiz/tech/page.tsx` tích hợp gọi song song `GET /exams`, `GET /progress/me`, `GET /lessons?limit=100`; thêm thanh Filter Bar; tính toán độ sẵn sàng theo bài học chứng chỉ/chuyên ngành; hiển thị Warning Modal khi chưa đạt tiến độ.

**Tech Stack:** NestJS, Prisma, Next.js 15, React 19, Tailwind CSS.

---

### Task 1: Sửa lỗi đếm số câu hỏi bài thi trong Backend API

**Files:**
- Modify: `apps/api/src/application/exam/exam.service.ts:18-23`

**Interfaces:**
- Produces: `_count: { questions: number }` trong mỗi item của `GET /exams`.

- [ ] **Step 1: Cập nhật query Prisma trong `exam.service.ts`**

Chỉnh sửa `findAll` trong `apps/api/src/application/exam/exam.service.ts`:
```typescript
    const [data, total] = await Promise.all([
      this.prisma.exam.findMany({
        where,
        skip,
        take: limit,
        include: {
          domain: true,
          level: true,
          certificate: true,
          _count: { select: { questions: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.exam.count({ where }),
    ]);
```

- [ ] **Step 2: Chạy kiểm tra Typecheck / Build Backend**

Run: `pnpm --filter api build`
Expected: Compile thành công không có lỗi.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/application/exam/exam.service.ts
git commit -m "fix(api): include question count in exam list query"
```

---

### Task 2: Cập nhật trang danh sách bài thi với Bộ lọc và Cảnh báo ôn tập

**Files:**
- Modify: `apps/web/app/(learner)/learn/quiz/tech/page.tsx`

**Interfaces:**
- Consumes:
  - `GET /exams?status=published&limit=50`
  - `GET /progress/me`
  - `GET /lessons?limit=100`

- [ ] **Step 1: Viết mã nguồn cho `apps/web/app/(learner)/learn/quiz/tech/page.tsx`**

Cập nhật giao diện:
1. State quản lý: `search`, `selectedDomain`, `selectedLevel`, `warningModalExam` (exam đang được chọn cảnh báo).
2. Tải song song `exams`, `progress` (chứa `certProgress`, `summary`, `progress` theo bài học), và `lessons`.
3. Logic tính toán `readiness` cho từng exam:
   - Nếu có `certificateId`: kiểm tra `certProgress.find(cp => cp.certificateId === exam.certificateId)?.completionPercent`.
   - Nếu có `domainId`: đếm số lesson thuộc domain đó mà học viên đã `status === 'completed'` chia cho tổng số lesson thuộc domain đó.
   - Ngưỡng: `< 70%` => `isReady = false`.
4. Giao diện Filter Bar gồm:
   - Ô Input Search (tiêu đề, mô tả).
   - Select Lĩnh vực / Chuyên ngành (Tất cả, và các domain từ danh sách bài thi hoặc lessons).
   - Select Cấp độ (Tất cả, Cơ bản, Trung cấp, Nâng cao).
5. Thẻ bài thi:
   - Badge câu hỏi: `{exam._count?.questions ?? 0} CÂU`.
   - Badge tiến độ:
     - Chưa đạt: `⚠️ Khuyên ôn trước ({readinessPercent}%)` (nền vàng cam, chữ cam đậm).
     - Đã đạt: `✓ Sẵn sàng thi` (nền xanh lục nhạt, chữ xanh đậm).
   - Nút "Bắt đầu kiểm tra":
     - Nếu `isReady`: gọi `router.push('/learn/quiz/' + exam.id)`.
     - Nếu `!isReady`: gán `setWarningModalExam(exam)` để mở Modal cảnh báo.
6. Modal Cảnh báo (Popup):
   - Tiêu đề: "Khuyến nghị ôn tập trước khi thi"
   - Icon cảnh báo.
   - Nội dung rõ ràng nhắc học viên tiến độ hiện tại `{readinessPercent}%` và khuyên nên ôn bài học liên quan trước.
   - Nút 1: "Ôn tập bài học" -> chuyển sang `/learn/lessons`.
   - Nút 2: "Tiếp tục thi ngay" -> chuyển vào `/learn/quiz/{warningModalExam.id}` (hoàn toàn không chặn).
   - Nút đóng (X) hoặc bấm ngoài modal.

- [ ] **Step 2: Kiểm tra Typecheck phía Frontend**

Run: `pnpm --filter web typecheck`
Expected: PASS (0 errors).

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(learner\)/learn/quiz/tech/page.tsx
git commit -m "feat(web): add exam filters, question counts and readiness warning modal"
```

---

### Task 3: Xác thực tổng thể (Verification)

- [ ] **Step 1: Kiểm tra chạy typecheck toàn bộ workspace**
Run: `pnpm typecheck`
Expected: Hoàn thành không lỗi.

- [ ] **Step 2: Đánh giá UI và luồng hoạt động**
- Kiểm tra các bài thi hiển thị đúng số câu hỏi (không còn 0 CÂU).
- Thử tìm kiếm và lọc theo domain/level.
- Thử bấm vào bài thi có tiến độ < 70%: popup mở ra, bấm "Tiếp tục thi ngay" vẫn vào thi bình thường.
