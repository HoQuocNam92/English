# TechEnglish Pro

<p align="center">
  <strong>Nền tảng học tiếng Anh chuyên ngành CNTT & Luyện thi Chứng chỉ Quốc tế</strong><br/>
  <em>IT English Learning Platform</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/Expo-SDK%2054-white?style=for-the-badge&logo=expo&logoColor=black" />
  <img src="https://img.shields.io/badge/NestJS-11-red?style=for-the-badge&logo=nestjs" />
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-18-336791?style=for-the-badge&logo=postgresql" />
</p>

---

## Giới thiệu

**TechEnglish Pro** là nền tảng học tiếng Anh chuyên ngành CNTT toàn diện, xây dựng theo kiến trúc monorepo với 3 ứng dụng chính:

| App | Công nghệ | Port |
|-----|-----------|------|
| **Web** | Next.js 15 + Tailwind CSS v4 | `3000` |
| **Mobile** | Expo SDK 54 / React Native | `8081` |
| **API** | NestJS 11 + Prisma + PostgreSQL | `8080` |

---

## Tính năng nổi bật

### 🎓 Học viên (Learner)
- **Onboarding cá nhân hóa** — Khảo sát trình độ, lĩnh vực IT quan tâm (Software Engineering, Cloud, DevOps, Cybersecurity...), mục tiêu nghề nghiệp và chứng chỉ quốc tế.
- **Bài học chuyên ngành** — Học thuật ngữ, tài liệu kỹ thuật theo cấu trúc phân mục (sections: Text, Code Snippet, Callout...).
- **Flashcard & Học từ vựng SRS** — Học từ vựng thông minh theo chu kỳ lặp lại ngắt quãng (Spaced Repetition System), phát âm chuẩn IPA & Text-to-Speech (TTS), lật thẻ tương tác, phân trang danh mục.
- **Thi thử & Kiểm tra mô phỏng (Tech Quiz & Exams)**:
  - Bộ lọc bài thi theo từ khóa, chuyên ngành (Domain) và cấp độ (Level).
  - Đánh giá độ sẵn sàng (Readiness score) thông minh dựa trên tiến độ học tập và chuyên đề.
  - Giao diện làm bài chuyên nghiệp: Đồng hồ đếm ngược, tự động nộp bài khi hết giờ, bảng danh sách câu hỏi (Question Palette).
  - Phân biệt trực quan câu hỏi 1 đáp án (Radio) và câu hỏi nhiều đáp án (Checkbox).
  - **Hộp thoại cảnh báo & xác nhận nộp bài**: Cảnh báo số câu chưa làm, danh sách câu chưa làm dạng chip bấm vào để nhảy ngay tới câu hỏi đó, ngăn chặn nộp nhầm khi chưa hoàn thành.
  - Xem kết quả chi tiết, thống kê tỷ lệ đạt, so sánh đáp án học viên với đáp án chính xác kèm giải thích kỹ thuật.
- **Báo cáo Năng lực & Tiến độ Cá nhân** — Theo dõi trực quan tiến độ học tập, độ sẵn sàng chứng chỉ mục tiêu, độ thành thạo chuyên ngành và lịch sử kết quả thi.

### 👨‍🏫 Giảng viên & Quản trị viên (Admin / Teacher)
- **Quản lý & Soạn thảo đề thi (Test Builder)** — Tìm kiếm, lọc câu hỏi theo chuyên ngành, cấp độ và loại câu; chọn câu hỏi vào đề thi kèm xem trước nội dung trực tiếp.
- **Ngân hàng câu hỏi & Nhập liệu Excel** — Quản lý ngân hàng câu hỏi đa dạng (single choice, multiple choice); hỗ trợ **Import hàng loạt nhiều file Excel đồng thời**, tự động phân tích và kiểm tra lỗi định dạng.
- **Quản lý học viên & Chi tiết kết quả thi** — Theo dõi danh sách học viên, hồ sơ năng lực, lịch sử các lượt thi; xem chi tiết từng lượt làm bài qua modal popup chuyên sâu.
- **Quản lý phân quyền RBAC & Danh mục hệ thống** — Quản trị người dùng, vai trò (Admin, Teacher, Learner), phân quyền chi tiết; quản lý chuyên ngành (Domains), cấp độ (Levels), chứng chỉ (Certificates).
- **Giao diện quản trị hiện đại** — Menu bên (Sidebar) thu gọn linh hoạt, tối ưu diện tích làm việc, thanh phân trang chuẩn hóa toàn hệ thống.

---

## Kiến trúc

```
techenglish-pro/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── prisma/             # Schema + Migrations + Seed
│   │   └── src/
│   │       ├── application/    # Business logic (services)
│   │       ├── infrastructure/ # Database (Prisma), external services
│   │       ├── modules/        # NestJS modules
│   │       └── presentation/   # REST Controllers & DTOs
│   ├── web/                    # Next.js 15 Frontend
│   │   └── app/
│   │       ├── (admin)/        # Admin & Teacher portal (students, questions, tests, reports)
│   │       ├── (auth)/         # Authentication (login, register, OAuth, password reset)
│   │       ├── (learner)/      # Learner portal (learn, lessons, flashcards, quiz, progress)
│   │       ├── landing/        # Landing page
│   │       └── onboarding/     # Learner personalization flow
│   └── mobile/                 # Expo React Native
│       └── app/
│           ├── (auth)/         # Login, register, forgot password
│           ├── (onboarding)/   # Level, IT field, career, certificate
│           ├── (tabs)/         # Home, Learning, Practice, Progress, Profile
│           ├── flashcards/     # Flashcard study
│           ├── lessons/        # Lesson detail + vocabulary
│           ├── quiz/           # Mobile exam taking
│           └── test-result/    # Mobile test results & review
├── packages/
│   ├── contracts/              # Shared TypeScript interfaces & contracts
│   ├── design-tokens/          # Shared colors, typography, spacing
│   └── shared-kernel/          # Shared pagination, error & result types
├── docker-compose.yml          # Redis & infrastructure services
├── pnpm-workspace.yaml         # Monorepo workspace config
└── tsconfig.base.json          # Shared TypeScript base config
```

---

## Cơ sở dữ liệu

**32 bảng** trên PostgreSQL, chia thành các nhóm:

| Nhóm | Bảng |
|------|------|
| **Auth & RBAC** | `users`, `user_details`, `roles`, `permissions`, `role_permissions`, `user_roles`, `refresh_tokens`, `password_reset_tokens` |
| **Learner Profile** | `learner_profiles`, `learner_profile_domains`, `learner_profile_career_goals`, `learner_certificate_goals` |
| **Taxonomy** | `domains`, `levels`, `career_goals`, `certificates`, `certificate_domains` |
| **Lessons** | `lessons`, `lesson_sections`, `lesson_certificates` |
| **Vocabulary** | `vocabularies`, `vocabulary_examples`, `lesson_vocabularies`, `vocabulary_progress` |
| **Questions & Exams** | `questions`, `question_options`, `question_certificates`, `exams`, `exam_questions`, `exam_attempts`, `attempt_answers` |
| **Progress** | `learning_progress` |

---

## API Endpoints

Base URL: `http://localhost:8080/api/v1`

| Module | Endpoints chính |
|--------|----------------|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/google`, `POST /auth/forgot-password`, `POST /auth/reset-password` |
| **Users** | `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id` |
| **Learner Profile** | `GET /learner-profile/me`, `POST /learner-profile/onboarding` |
| **Taxonomy** | `GET /taxonomy/domains`, `GET /taxonomy/levels`, `GET /taxonomy/careers`, `GET /taxonomy/certificates` |
| **Lessons** | `GET /lessons`, `GET /lessons/:id`, `POST /lessons`, `PATCH /lessons/:id` |
| **Vocabulary** | `GET /vocabulary`, `POST /vocabulary`, `PATCH /vocabulary/:id` |
| **Vocab Study** | `GET /vocab-study/session`, `GET /vocab-study/quiz`, `POST /vocab-study/answer`, `GET /vocab-study/summary` |
| **Questions** | `GET /questions`, `POST /questions`, `PATCH /questions/:id` |
| **Exams** | `GET /exams`, `POST /exams`, `POST /exams/:id/start`, `POST /exam-attempts/:id/submit` |
| **Progress** | `GET /progress/me`, `POST /progress/mark-lesson/:id` |
| **Reports** | `GET /reports/dashboard`, `GET /reports/students` |
| **Upload** | `POST /upload/image` (Cloudinary) |
| **Roles** | `GET /roles`, `POST /roles`, `PATCH /roles/:id` |

---

## Yêu cầu hệ thống

- **Node.js** >= 20.x
- **pnpm** >= 11.x
- **PostgreSQL** >= 15
- **Redis** >= 7 (Docker)

---

## Cài đặt & Chạy

### 1. Clone và cài dependencies

```bash
git clone https://github.com/HoQuocNam92/English.git
cd English
pnpm install
```

### 2. Khởi động Redis

```bash
docker compose up -d
```

### 3. Cấu hình Database

Tạo file `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/techenglish"
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:8080/api/v1/auth/google/callback"

# Cloudinary (upload ảnh)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# Mail (SMTP)
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-app-password"
```

### 4. Khởi tạo Database

```bash
cd apps/api
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. Chạy ứng dụng

**API Server:**
```bash
cd apps/api
pnpm dev
# → http://localhost:8080/api/v1
# → Swagger: http://localhost:8080/api/docs
```

**Web App:**
```bash
cd apps/web
pnpm dev
# → http://localhost:3000
```

**Mobile App:**
```bash
cd apps/mobile
pnpm start
# → Expo DevTools: http://localhost:8081
# Scan QR code bằng Expo Go trên điện thoại
```

---

## Tài khoản mặc định (Seed)

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| Admin | `admin@techenglish.pro` | `Demo@123456` |
| Giảng viên | `teacher@techenglish.pro` | `Demo@123456` |
| Học viên | `learner@techenglish.pro` | `Demo@123456` |

---

## Tech Stack

### Backend
- **NestJS 11** — Framework Node.js, kiến trúc module
- **Prisma 5.22** — ORM, type-safe database access
- **PostgreSQL 18** — Relational database
- **Redis 7** — Caching (cache-manager-ioredis)
- **Passport.js** — Authentication (JWT + Google OAuth)
- **Swagger** — API documentation tự động
- **Cloudinary** — Upload & quản lý hình ảnh
- **Nodemailer** — Gửi email (forgot password, OTP)
- **Helmet** — Security headers

### Frontend (Web)
- **Next.js 15** — React framework, App Router
- **Tailwind CSS v4** — Utility-first CSS
- **TypeScript** — Type safety

### Mobile
- **Expo SDK 54** — React Native framework
- **Expo Router** — File-based routing
- **React Native** — Cross-platform mobile

### Shared Packages
- **@techenglish/contracts** — Shared TypeScript interfaces
- **@techenglish/design-tokens** — Colors, spacing, typography
- **@techenglish/shared-kernel** — Shared utilities (pagination, result types)

### DevOps
- **pnpm 11** — Package manager (monorepo workspaces)
- **Docker Compose** — Redis infrastructure
- **TypeScript 5.9** — Across all apps

---

## Scripts

| Script | Mô tả |
|--------|-------|
| `pnpm dev` | Chạy dev server (trong mỗi app) |
| `pnpm build` | Build production |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:push` | Push schema lên DB |
| `pnpm db:seed` | Seed dữ liệu mẫu |
| `pnpm db:studio` | Mở Prisma Studio (GUI) |

---

## Tác giả

**Hồ Quốc Nam** — Đại học Công nghiệp TP.HCM (IUH)

---

## License

Private — All rights reserved.
