# TechEnglish Pro 🚀

<p align="center">
  <strong>Nền tảng học tiếng Anh chuyên ngành IT & Luyện thi Chứng chỉ Quốc tế</strong><br/>
  <em>IT English Learning Platform with AI-powered features</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tác%20giả-Quốc%20Nam-blue?style=for-the-badge&logo=github" />
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/Expo-SDK%2054-white?style=for-the-badge&logo=expo&logoColor=black" />
  <img src="https://img.shields.io/badge/NestJS-11-red?style=for-the-badge&logo=nestjs" />
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-18-336791?style=for-the-badge&logo=postgresql" />
</p>

---

## 📋 Giới thiệu

**TechEnglish Pro** là nền tảng học tiếng Anh chuyên ngành CNTT toàn diện, xây dựng theo kiến trúc monorepo với 3 ứng dụng chính:

- 🌐 **Web App** — Giao diện người học & quản trị (Next.js 15 + Tailwind CSS v4)
- 📱 **Mobile App** — Ứng dụng di động (Expo / React Native)
- ⚙️ **API Server** — Backend RESTful API (NestJS + Prisma + PostgreSQL)

---

## ✨ Tính năng nổi bật

| Tính năng | Mô tả |
|-----------|-------|
| 🤖 AI Tutor RAG | Hỏi đáp theo học liệu đã duyệt, tìm kiếm ngữ nghĩa đa ngôn ngữ, rerank và dẫn nguồn về lesson |
| 🃏 Flashcards | Ôn tập từ vựng kỹ thuật theo bài học |
| 📖 Đọc tài liệu trong Luyện tập | Đọc hiểu tài liệu IT và làm câu hỏi comprehension, dùng chung dữ liệu bài học |
| 📚 Technical Dictionary | Từ điển kỹ thuật IT chuyên ngành, tìm kiếm nhanh |
| 🗓️ Learning Calendar | Quản lý lịch học, kế hoạch theo ngày/tuần/tháng |
| 👥 Community Discussion | Thảo luận, đặt câu hỏi, chia sẻ kinh nghiệm IT |
| 🏆 Leaderboard & Gamification | Bảng xếp hạng EXP, streak hàng ngày, badge, thành tích |
| 🔔 Notification Center | Thông báo hệ thống, nhắc nhở học tập, flash sale |
| 📊 Learning Analytics | Phân tích tiến độ, biểu đồ học tập chi tiết |
| 🎯 Certification Objectives | Quản lý mục tiêu kiến thức, nội dung và mức độ thành thạo theo chứng chỉ |
| 🗺️ AI Learning Path Generator | AI tạo lộ trình học cá nhân hóa theo mục tiêu |
| 🌙 Dark / Light Mode | Hỗ trợ cả 2 theme, mặc định Light, nhớ lựa chọn |
| 🌐 Tiếng Việt / English | Chuyển đổi ngôn ngữ giao diện hoàn toàn (20+ trang) |
| 💳 Subscription Plans | Gói 1/3/6/12 tháng PRO, tích hợp SePay |
| 🔐 Google OAuth | Đăng nhập bằng Google account |
| 📧 Email Reset Password | Quên mật khẩu gửi email qua SMTP |
| ☁️ Cloudinary Upload | Upload avatar, hình ảnh bài học |

---

## 🧭 Luồng học tập sản phẩm

`Placement Test → IT Field → Career Goal → Personal Roadmap → Foundation → IT Core → Specialized → Lesson → Vocabulary / Reading / Listening → Practice → Scenario → Mini Test → Review → Spaced Repetition`

- Placement Test lấy câu hỏi `published` có topic `placement` và chấm tại API; client không nhận đáp án đúng.
- IT Field và Career Goal đọc từ `domains` và `career_goals`, không gán cứng trong giao diện.
- Personal Roadmap chỉ chọn lesson `published` phù hợp trình độ, domain và mục tiêu nghề nghiệp.
- Scenario là dạng câu hỏi tình huống, không phải Mock Interview hoặc Writing Practice.

### Phân chia chức năng Web và Mobile

- **Mobile dành cho học viên:** onboarding, hồ sơ mục tiêu nghề nghiệp, bài học, từ vựng/flashcard, đọc tài liệu trong Luyện tập, bài thi, lịch sử làm bài, tiến độ, lộ trình cá nhân hóa, chứng chỉ, thông báo, cộng đồng và AI Tutor RAG có dẫn nguồn.
- **Web dành cho học viên:** cung cấp các luồng học tương ứng trên màn hình lớn; mục Đọc tài liệu nằm trong Luyện tập để tránh trùng với Học tập.
- **Web Admin/Teacher:** quản trị nội dung, câu hỏi, đề thi, nội dung ôn tập theo chứng chỉ, lọc/thống kê học viên theo `career_goal`, báo cáo và vận hành kho tri thức RAG.
- Mobile không chứa các màn quản trị vì đây là ứng dụng học viên theo đúng phạm vi đề tài.

## 🤖 AI Tutor RAG

AI Tutor là semantic RAG chạy thật trên Web và Mobile. Hệ thống chỉ index `lessons`, `lesson_sections` và `vocabularies` có trạng thái `published`. Mỗi câu trả lời có citation tới chunk/lesson gốc; nếu bằng chứng không đạt ngưỡng, API từ chối trả lời thay vì yêu cầu LLM suy đoán.

### Kiến trúc

```text
Published content
      │
      ▼
Chunking + content versioning
      │
      ▼
Cohere embed-v4.0 (search_document, 1024 dimensions)
      │
      ▼
LangChain PGVectorStore + PostgreSQL pgvector 0.8.6
      │
      ▼
HNSW cosine retrieval (Top K)
      │
      ▼
Cohere rerank-v4.0-fast
      │
      ▼
Relevance threshold + metadata/lesson scope
      │
      ▼
Groq openai/gpt-oss-20b grounded generation
      │
      ▼
Answer + citations + feedback + usage tracking
```

Điểm tổng hợp dùng Cohere rerank 60%, pgvector similarity 30% và keyword score 10%. Khi hỏi từ màn hình lesson, `lessonId` được đưa vào metadata filter để không truy xuất bài khác. Nội dung bị unpublish sẽ bị loại khỏi cả knowledge source, chunk và vector trong lần reindex tiếp theo.

### Thành phần

| Thành phần | Công nghệ |
|---|---|
| Orchestration/retrieval | LangChain.js |
| Document/query embedding | Cohere `embed-v4.0` |
| Vector store | PostgreSQL 18 + pgvector `vector(1024)` |
| Approximate nearest neighbor | HNSW + cosine distance |
| Reranking | Cohere `rerank-v4.0-fast` |
| Grounded generation | Groq `openai/gpt-oss-20b` |
| API, auth, quota | NestJS |
| Metadata và citation | Prisma/PostgreSQL |

### Bảo vệ và giới hạn

- Chỉ dữ liệu `published` được gửi sang Cohere để embedding/rerank.
- Không index tài khoản, tiến độ, hội thoại, thanh toán hoặc dữ liệu quản trị.
- Không tiết lộ đáp án của bài kiểm tra đang diễn ra.
- Có giới hạn số câu hỏi theo người dùng/ngày qua `AI_DAILY_MESSAGE_LIMIT`.
- Trial Cohere phù hợp phát triển/thử nghiệm; production phải dùng key và điều khoản production.
- Không được trộn vector từ hai embedding model hoặc hai kích thước trong cùng bảng.

### Vận hành và kiểm tra

```bash
# Áp migration, gồm extension/table/index pgvector
pnpm --filter @techenglish/api db:migrate:deploy

# Index hoặc đồng bộ lại nội dung published
pnpm --filter @techenglish/api rag:reindex

# Kiểm tra extension, số vector, dimensions và indexes
pnpm --filter @techenglish/api rag:vector-status

# Semantic retrieval + Cohere rerank smoke test
pnpm --filter @techenglish/api rag:test
```

Trạng thái đã kiểm chứng tại thời điểm cập nhật README: 59 vector, 1024 chiều, có HNSW cosine index và GIN metadata index.

API quản trị:

```text
POST /admin/knowledge/reindex   Reindex toàn bộ nguồn published
GET  /admin/knowledge/health    Kiểm tra source/chunk/vector/model/reranker
```

API người học:

```text
POST /ai-chat/conversations
GET  /ai-chat/conversations
GET  /ai-chat/conversations/:id/messages
POST /ai-chat/conversations/:id/messages
POST /ai-chat/messages/:id/feedback
```

---

## 🗂️ Cấu trúc monorepo

```
English/
├── apps/
│   ├── api/                        # NestJS Backend (Clean Architecture)
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Database schema (1200+ lines)
│   │   │   └── seed.ts             # Seed data đầy đủ
│   │   └── src/
│   │       ├── domain/             # Entities & Repository interfaces
│   │       ├── application/        # Use cases & Services
│   │       ├── infrastructure/     # Prisma, Redis, Cloudinary, Email
│   │       ├── presentation/       # Controllers (HTTP endpoints)
│   │       └── modules/            # NestJS DI modules
│   │
│   ├── web/                        # Next.js 15 Web App
│   │   ├── app/
│   │   │   ├── (admin)/            # Admin & Teacher portal
│   │   │   │   └── admin/          # Users, Content, Exams, Reports, AI RAG...
│   │   │   ├── (auth)/             # Login, Register, Forgot Password
│   │   │   └── (learner)/learn/    # Learner dashboard and learning flows
│   │   │       ├── page.tsx        # Dashboard chính
│   │   │       ├── lessons/        # Danh sách & chi tiết bài học
│   │   │       ├── practice/       # Vocabulary, reading, tests and scenarios
│   │   │       ├── dictionary/     # Technical Dictionary
│   │   │       ├── calendar/       # Learning Calendar
│   │   │       ├── community/      # Community Discussion
│   │   │       ├── analytics/      # Learning Analytics
│   │   │       ├── leaderboard/    # Leaderboard
│   │   │       ├── notifications/  # Notification Center
│   │   │       ├── planner/        # Learning Planner
│   │   │       ├── career/         # Career Insight
│   │   │       ├── achievements/   # Achievements & Milestones
│   │   │       ├── roadmap/        # Learning Roadmap
│   │   │       ├── certifications/ # Certification Progress
│   │   │       ├── saved/          # Saved Lessons
│   │   │       ├── skill-gap/      # Skill Gap Analysis
│   │   │       ├── exam-readiness/ # Exam Readiness Score
│   │   │       ├── path-generator/ # AI Path Generator
│   │   │       ├── ai-recommendations/ # AI Recommendations
│   │   │       └── profile/        # User Profile + Settings
│   │   └── src/shared/
│   │       ├── i18n/               # VI/EN translations (200+ keys)
│   │       │   └── locales/        # vi.ts, en.ts
│   │       ├── theme/              # Dark/Light ThemeProvider
│   │       ├── layout/             # LearnerShell, AdminShell
│   │       └── ui/                 # ThemeLanguageToggle, shared components
│   │
│   └── mobile/                     # Expo React Native App
│       ├── app/
│       │   ├── (auth)/             # Login, Register, Forgot Password
│       │   ├── (onboarding)/       # Level, Domain, Certificate, Career Goal
│       │   ├── (tabs)/             # 5 tabs: Home, Learning, Practice, Progress, Profile
│       │   ├── ai-tutor/           # Mobile AI Tutor RAG
│       │   ├── calendar/           # Learning Calendar + mini calendar
│       │   ├── community/          # Community list + [id] detail
│       │   ├── leaderboard/        # Leaderboard
│       │   ├── lessons/            # Lesson list + [id] detail
│       │   ├── quiz/[id]           # Exam quiz
│       │   ├── payment/            # Subscription plans + history
│       │   └── profile/            # Edit profile + change password
│       └── src/shared/store/
│           ├── auth-context.tsx    # Auth state & logout
│           ├── theme-context.tsx   # Dark/Light mode (AsyncStorage)
│           └── i18n-context.tsx    # VI/EN language (AsyncStorage)
│
└── packages/
    └── design-tokens/              # Shared colors & spacing tokens
```

---

## 🛠️ Tech Stack

### Backend (API)
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| NestJS | 11 | Framework chính |
| Prisma | 5.22 | ORM & Database migrations |
| PostgreSQL + pgvector | 18.3 + 0.8.6 | Database chính và vector store |
| LangChain.js | 1.x | PGVectorStore và retrieval orchestration |
| Cohere | Embed v4 + Rerank v4 Fast | Embedding đa ngôn ngữ và reranking |
| Groq | GPT OSS 20B | Grounded answer generation |
| Redis | 7 | Cache & Rate limiting |
| JWT | — | Access & Refresh tokens |
| Google OAuth | 2.0 | Social login |
| Cloudinary | — | Image upload & transformation |
| Nodemailer | — | SMTP email (reset password) |
| SePay | — | Thanh toán nội địa Việt Nam |

**Architecture**: Clean Architecture — Domain → Application → Infrastructure → Presentation

### Web
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| Next.js | 15 App Router | Framework + SSR |
| React | 19 | UI rendering |
| Tailwind CSS | v4 | Styling với CSS variables |
| TypeScript | 5 | Type safety |

### Mobile
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| Expo | SDK 54 | Build tool & runtime |
| React Native | 0.81 | Mobile UI |
| Expo Router | v6 | File-based routing |
| AsyncStorage | — | Local persistent storage |

---

## ⚡ Cài đặt

### Yêu cầu
- Node.js ≥ 20
- pnpm ≥ 11
- PostgreSQL 18 và pgvector ≥ 0.8
- Redis 7

### 1. Clone & Install

```bash
git clone https://github.com/HoQuocNam92/English.git
cd English
pnpm install
```

### 2. Environment Variables

```bash
# apps/api/.env
DATABASE_URL="postgresql://user:password@localhost:5432/techenglish"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"
GOOGLE_CALLBACK_URL="http://localhost:8080/api/v1/auth/google/callback"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your@gmail.com"
SMTP_PASS="your-app-password"
CLOUDINARY_CLOUD_NAME="xxx"
CLOUDINARY_API_KEY="xxx"
CLOUDINARY_API_SECRET="xxx"
SEPAY_API_KEY="xxx"
GROQ_API_KEY="gsk_your_key_here"
GROQ_MODEL="openai/gpt-oss-20b"
COHERE_API_KEY="your-cohere-key"
EMBEDDING_PROVIDER="cohere"
EMBEDDING_MODEL="embed-v4.0"
EMBEDDING_DIMENSIONS=1024
COHERE_RERANK_MODEL="rerank-v4.0-fast"
RAG_TOP_K=20
RAG_FINAL_K=6
RAG_MIN_SCORE=0.35
RAG_MIN_COMBINED_SCORE=0.4
AI_DAILY_MESSAGE_LIMIT=30
SEPAY_BANK_ACCOUNT="xxx"

# apps/web/.env.local
NEXT_PUBLIC_API_URL="http://localhost:8080/api/v1"
```

### 3. Database & Seed

```bash
pnpm --filter @techenglish/api db:migrate:deploy
pnpm --filter @techenglish/api db:seed
pnpm --filter @techenglish/api rag:reindex
```

### 4. Start Development

```bash
# API (port 8080)
cd apps/api && pnpm dev

# Web (port 3000)
cd apps/web && pnpm dev

# Mobile
cd apps/mobile && pnpm start
```

---

## 👤 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@techenglish.pro | Demo@123456 |
| **Teacher 1** (Cloud & DevOps) | nguyen.thanh@techenglish.pro | Demo@123456 |
| **Teacher 2** (Security) | tran.minh@techenglish.pro | Demo@123456 |
| **Learner 1** ⭐ PRO Yearly | learner1@techenglish.pro | Demo@123456 |
| **Learner 2** (DevOps intern) | learner2@techenglish.pro | Demo@123456 |
| **Learner 3** (Security analyst) | learner3@techenglish.pro | Demo@123456 |
| **Learner 4** (Data engineer) | learner4@techenglish.pro | Demo@123456 |
| **Learner 5** (Fresh grad) | learner5@techenglish.pro | Demo@123456 |

---

## 🌐 API Reference

### Authentication
```
POST /auth/register           Đăng ký tài khoản mới
POST /auth/login              Đăng nhập (email + password)
POST /auth/refresh            Làm mới access token
GET  /auth/me                 Thông tin user (cần JWT)
GET  /auth/google             Bắt đầu Google OAuth
POST /auth/forgot-password    Gửi email đặt lại mật khẩu
POST /auth/reset-password     Đặt lại mật khẩu bằng token
```

### Lessons & Vocabulary (public GET)
```
GET    /lessons               Danh sách bài học
GET    /lessons/:id           Chi tiết bài học
POST   /lessons               Tạo bài học [Teacher/Admin]
PATCH  /lessons/:id           Sửa bài học [Teacher/Admin]
GET    /vocabulary            Danh sách từ vựng (có search, filter)
GET    /vocabulary/:id        Chi tiết từ vựng
```

### Progress & Gamification
```
GET  /progress/me             Tiến độ học tập của tôi
GET  /leaderboard/top         Top learners (weekly/monthly/all)
GET  /leaderboard/streaks/me  Streak & EXP của tôi
POST /leaderboard/streaks/check-in  Điểm danh nhận EXP
```

### AI Tutor RAG
```
POST /ai-chat/public                     Hỏi đáp công khai
POST /ai-chat/conversations              Tạo cuộc trò chuyện
GET  /ai-chat/conversations              Danh sách cuộc trò chuyện
POST /ai-chat/conversations/:id/messages Gửi tin nhắn
POST /ai-chat/messages/:id/feedback       Đánh giá câu trả lời
POST /ai-chat/saved-vocabulary           Lưu từ vựng từ AI Coach
POST /admin/knowledge/reindex             Đồng bộ knowledge base [Admin]
GET  /admin/knowledge/health              Trạng thái RAG [Admin]
```

### Learner Profiles & Career Goals
```
GET  /students                  Lọc học viên theo lĩnh vực và mục tiêu nghề nghiệp
GET  /career-goals              Danh mục mục tiêu nghề nghiệp
GET  /analytics/dashboard       Thống kê học viên theo career goal [Admin]
```

### Planning & Notifications
```
GET    /planner/my                  Kế hoạch học (theo ngày)
POST   /planner/my                  Tạo kế hoạch mới
PATCH  /planner/my/:id              Cập nhật/hoàn thành kế hoạch
DELETE /planner/my/:id              Xóa kế hoạch
GET    /notifications/my            Thông báo + unreadCount
PATCH  /notifications/my/:id/read   Đánh dấu 1 thông báo đã đọc
PATCH  /notifications/my/read-all   Đánh dấu tất cả đã đọc
POST   /notifications               Tạo thông báo [Admin]
```

### Community
```
GET    /discussion/posts             Danh sách bài viết (filter by tag)
POST   /discussion/posts             Tạo bài viết mới
GET    /discussion/posts/:id         Chi tiết bài viết + comments
POST   /discussion/posts/:id/comments  Bình luận
POST   /discussion/posts/:id/vote    Vote toggle (like/unlike)
DELETE /discussion/posts/:id         Xóa bài viết [Admin/owner]
```

### Payment & Subscription
```
GET  /payment/plans             Danh sách gói (1/3/6/12 tháng)
POST /payment/create-order      Tạo đơn hàng SePay
GET  /payment/subscription/me   Gói đang sử dụng + isPro
```

---

## 🎨 Design System

### Màu sắc (CSS Variables)

```css
/* Light Mode (mặc định) */
:root {
  --primary: #3525cd;
  --surface: #f7f9fb;
  --surface-container-lowest: #ffffff;
  --on-surface: #191c1e;
  --on-surface-variant: #464555;
  --outline-variant: #c7c4d8;
}

/* Dark Mode (khi user toggle) */
.dark {
  --primary: #c3c0ff;
  --surface: #191c1e;
  --surface-container-lowest: #0a0d0e;
  --on-surface: #e1e3e5;
  --on-surface-variant: #c2c7cb;
  --outline-variant: #3f4346;
}
```

### Hooks quan trọng

```tsx
// Dark/Light Mode (Web)
import { useTheme } from '@/shared/theme';
const { theme, toggleTheme } = useTheme();
// → Toggle button ☀️/🌙 trong LearnerShell navbar

// i18n (Web)
import { useI18n } from '@/shared/i18n';
const { t, locale, setLocale } = useI18n();
// → t.nav.home, t.lessons.title, t.common.save...
// → Toggle VI/EN trong LearnerShell navbar

// Theme (Mobile)
import { useTheme } from '../../src/shared/store/theme-context';
const { colors, isDark, toggleTheme } = useTheme();

// i18n (Mobile)
import { useI18n } from '../../src/shared/store/i18n-context';
const { t, locale, setLocale } = useI18n();
// → Settings trong Tab Cá nhân
```

---

## 🗄️ Database Models

Database hiện có **61 bảng vật lý**: **59 bảng nghiệp vụ được ánh xạ bởi Prisma**, bảng vector chuyên dụng `knowledge_vectors` do LangChain/pgvector quản lý và bảng lịch sử migration `_prisma_migrations`.

Module lớp/nhóm học viên thủ công đã được loại bỏ. Học viên được phân loại và thống kê trực tiếp theo `career_goal` trong hồ sơ, đúng với phạm vi đề tài và không làm phát sinh bảng lớp/thành viên dư thừa.

Quy ước quan hệ:

- **1–1**: một bản ghi bên A có tối đa một bản ghi bên B.
- **1–N**: một bản ghi cha có nhiều bản ghi con; mỗi bản ghi con thuộc một cha.
- **N–N**: nhiều bản ghi hai phía liên kết qua một bảng nối.
- Các quan hệ có `onDelete: Cascade` sẽ tự xóa bản ghi con khi bản ghi cha bị xóa.

### 1. Xác thực, người dùng và RBAC — 8 bảng

| Bảng | Vai trò | Quan hệ chính |
|---|---|---|
| `users` | Tài khoản xác thực trung tâm: email, mật khẩu băm và trạng thái. | 1–1 với `user_details`, `learner_profiles`, `user_streaks`, `user_subscriptions`; 1–N với token, đơn hàng, tiến độ, thông báo và nội dung người dùng. |
| `user_details` | Hồ sơ cá nhân, avatar, tên hiển thị, locale và múi giờ. | 1–1, khóa ngoại duy nhất đến `users`. |
| `refresh_tokens` | Phiên đăng nhập dài hạn, hết hạn và thu hồi token. | N–1 với `users`. |
| `password_reset_tokens` | OTP/token đặt lại mật khẩu theo email. | Không FK; liên kết logic bằng email. |
| `roles` | Vai trò hệ thống và vai trò tùy chỉnh. | N–N với user qua `user_roles`; N–N với permission qua `role_permissions`. |
| `permissions` | Quyền chi tiết dạng `resource:action`. | N–N với `roles`. |
| `role_permissions` | Bảng nối role–permission. | PK ghép `role_id + permission_id`. |
| `user_roles` | Gán một hoặc nhiều role cho user, kèm người cấp và hạn dùng. | PK ghép `user_id + role_id`; hai FK đến `users`, `roles`. |

### 2. Danh mục và hồ sơ học viên — 9 bảng

| Bảng | Vai trò | Quan hệ chính |
|---|---|---|
| `domains` | Lĩnh vực CNTT như Cloud, DevOps, Security. | 1–N với bài học, từ vựng, câu hỏi và đề thi; N–N với certificate và learner profile. |
| `levels` | Cấp độ Beginner–Professional. | 1–N với profile, content, assessment và lab. |
| `career_goals` | Mục tiêu nghề nghiệp. | N–N với profile; 1–N với `career_goal_skills`. |
| `certificates` | Chứng chỉ CNTT và nhà cung cấp. | 1–N với nội dung ôn tập và đề thi; N–N với domain, lesson và question. |
| `certificate_domains` | Bảng nối certificate–domain. | Quan hệ N–N, PK ghép. |
| `learner_profiles` | Trình độ, mục tiêu học hàng tuần và onboarding. | 1–1 với user; N–N với domain/career goal; 1–N với certificate goal. |
| `learner_profile_domains` | Lĩnh vực học viên quan tâm. | Bảng nối N–N profile–domain. |
| `learner_profile_career_goals` | Nghề nghiệp học viên hướng tới. | Bảng nối N–N profile–career goal. |
| `learner_certificate_goals` | Chứng chỉ mục tiêu và ngày dự kiến. | N–1 với profile và certificate; unique theo cặp. |

### 3. Từ vựng và nguồn dữ liệu — 4 bảng

| Bảng | Vai trò | Quan hệ chính |
|---|---|---|
| `vocabularies` | Thuật ngữ IT, IPA, audio, nghĩa Anh–Việt, tag, domain và level. | N–1 với domain/level; 1–N với example/source; N–N với lesson/objective. |
| `vocabulary_examples` | Câu ví dụ và bản dịch. | N–1 với vocabulary, xóa cascade. |
| `lesson_vocabularies` | Từ vựng xuất hiện trong bài học. | Bảng nối N–N lesson–vocabulary. |
| `vocabulary_sources` | Nguồn, URL, tiêu đề, hash, metadata và thời điểm thu thập. | N–1 với vocabulary; PK ghép `vocabulary_id + source + source_url`. |

### 4. Bài học và nội dung chứng chỉ — 4 bảng

| Bảng | Vai trò | Quan hệ chính |
|---|---|---|
| `lessons` | Bài học, loại bài, thời lượng, domain, level và tác giả. | 1–N với section/progress/session; N–N với vocabulary và certificate. |
| `lesson_sections` | Các khối text, media, code, callout hoặc quiz theo thứ tự. | N–1 với lesson. |
| `lesson_certificates` | Bài học phục vụ chứng chỉ nào. | Bảng nối N–N. |
| `certification_contents` | Nội dung tham khảo riêng của chứng chỉ. | N–1 với certificate. |

### 5. Ngân hàng câu hỏi, đề thi và bài làm — 8 bảng

| Bảng | Vai trò | Quan hệ chính |
|---|---|---|
| `questions` | Câu hỏi, loại, ngữ cảnh, giải thích và điểm. | 1–N với option/answer; N–N với certificate và exam. |
| `question_options` | Phương án trắc nghiệm và cờ đúng. | N–1 với question. |
| `question_certificates` | Phạm vi chứng chỉ của câu hỏi. | Bảng nối N–N. |
| `exams` | Đề thi, thời lượng, điểm đạt và phạm vi nội dung. | N–1 với domain/level/certificate/tác giả; N–N với question; 1–N với attempt. |
| `exam_questions` | Câu hỏi trong đề, thứ tự và trọng số. | Bảng nối N–N exam–question. |
| `exam_attempts` | Một lần học viên làm đề, điểm và trạng thái. | N–1 với user/exam; 1–N với answer. |
| `attempt_answers` | Câu trả lời cho một question trong attempt. | N–1 với attempt/question; 1–N với option đã chọn. |
| `attempt_answer_options` | Lựa chọn cụ thể trong câu trả lời nhiều đáp án. | Bảng nối answer–question option. |

### 6. Tiến độ và gợi ý cá nhân hóa — 3 bảng

| Bảng | Vai trò | Quan hệ chính |
|---|---|---|
| `learning_progress` | Tiến độ polymorphic theo lesson/domain/certificate. | N–1 với user; `resource_id` trỏ logic theo `resource_type`. |
| `progress_summary_cache` | Tổng hợp tiến độ để dashboard đọc nhanh. | 1–1 với learner/user. |
| `recommendations` | Gợi ý lesson/practice/exam dựa trên hồ sơ, mục tiêu và tiến độ. | N–1 với user. |

### 7. Thanh toán và gói PRO — 2 bảng

| Bảng | Vai trò | Quan hệ chính |
|---|---|---|
| `payment_orders` | Đơn mua gói, idempotency, giao dịch SePay và webhook. | N–1 với user; 1–1 với subscription. |
| `user_subscriptions` | Gói hiện tại và thời hạn của user. | 1–1 với user và payment order. |

### 8. Gamification và thông báo — 3 bảng

| Bảng | Vai trò | Quan hệ chính |
|---|---|---|
| `user_streaks` | Streak, EXP, điểm tuần và tháng. | 1–1 với user. |
| `user_badges` | Huy hiệu đã mở khóa. | N–1 với user; unique theo user–badge code. |
| `notifications` | Thông báo cá nhân hoặc toàn hệ thống. | N–1 tùy chọn với user; `user_id = null` là broadcast. |

### 9. Cộng đồng — 3 bảng

| Bảng | Vai trò | Quan hệ chính |
|---|---|---|
| `discussion_posts` | Bài viết, tag, vote, lượt xem và trạng thái kiểm duyệt. | N–1 với user; 1–N với comment/vote. |
| `discussion_comments` | Bình luận của user trong bài viết. | N–1 với post và user. |
| `discussion_votes` | Upvote/downvote của user. | N–N user–post; unique ngăn vote trùng. |

### 10. AI Tutor và RAG — 10 bảng vật lý (9 Prisma + 1 vector)

| Bảng | Vai trò | Quan hệ chính |
|---|---|---|
| `ai_conversations` | Cuộc trò chuyện Q&A/vocabulary, có thể giới hạn theo lesson. | N–1 với user; 1–N với message/error. |
| `ai_messages` | Tin nhắn user/assistant và metadata phản hồi. | N–1 với conversation; 1–N với citation/feedback/error. |
| `ai_learning_errors` | Lỗi gốc, bản sửa và giải thích tiếng Việt. | N–1 với conversation; tùy chọn N–1 với message. |
| `ai_saved_vocabulary` | Từ/cụm từ lưu từ AI Coach và ghi chú cá nhân. | N–1 với user; unique theo user–term–phrase. |
| `knowledge_sources` | Nguồn được index, loại nguồn, phiên bản và trạng thái index. | 1–N với knowledge chunk; unique theo source type–source ID. |
| `knowledge_chunks` | Đoạn nội dung sau chunking và metadata nghiệp vụ. | N–1 với source; 1–N với citation. |
| `knowledge_vectors` | Nội dung, metadata JSONB và embedding `vector(1024)`. | ID tương ứng `knowledge_chunks.id`; có HNSW và GIN index. |
| `ai_message_citations` | Nguồn chứng minh cho từng câu trả lời, kèm rank và score. | Bảng nối N–N AI message–knowledge chunk. |
| `ai_feedback` | Đánh giá hữu ích/chưa đúng của người học. | N–1 với AI message; unique theo message–user. |
| `ai_usage_daily` | Request và token AI theo ngày để kiểm soát quota. | Unique theo user–ngày. |

### 11. Lộ trình, planner và analytics — 5 bảng

| Bảng | Vai trò | Quan hệ chính |
|---|---|---|
| `learning_sessions` | Phiên học, thời lượng, ngày và khung giờ. | N–1 với user; tùy chọn N–1 với lesson. |
| `career_goal_skills` | Kỹ năng cần cho mục tiêu nghề nghiệp. | N–1 với career goal; tùy chọn N–1 với lesson. |
| `learning_paths` | Lộ trình cá nhân hóa của user. | N–1 với user; 1–N với module. |
| `learning_path_modules` | Các chặng theo thứ tự và phần trăm tiến độ. | N–1 với learning path; `current_lesson_id` là tham chiếu logic. |
| `learning_plan_items` | Kế hoạch học theo ngày, thời lượng và trạng thái hoàn thành. | N–1 với user; tùy chọn N–1 với lesson. |

### 12. Landing page — 1 bảng

| Bảng | Vai trò | Quan hệ chính |
|---|---|---|
| `landing_banners` | Banner, CTA, hình Cloudinary, bố cục chữ, màu sắc, thứ tự và lịch hiển thị. | Bảng độc lập, không có FK. |

---

## 🔐 Phân quyền

| Role | Permissions |
|------|-------------|
| **admin** | Full CRUD: users, lessons, exams, vocabulary, certification content, notifications, AI RAG, reports và roles |
| **teacher** | Create/edit lessons & exams, view learner progress |
| **learner** | Learn, take exams, use AI features, discussion, planner |

> **Public endpoints** (không cần JWT): `GET /lessons`, `GET /lessons/:id`, `GET /vocabulary`, `GET /leaderboard/top`

---

## 🧪 Seed Data Summary

| Model | Số lượng |
|-------|----------|
| Users | 8 (1 admin + 2 teachers + 5 learners) |
| Vocabulary terms | 29 (Cloud, Networking, Security, DevOps) |
| Lessons | 5 (published) |
| Questions | 15 |
| Exams | 2 |
| Subscription plans | 5 (1/3/6/12 tháng + Lifetime) |
| DiscussionPosts | 5 + comments + votes |
| Certification content | Nội dung ôn tập được quản lý theo từng chứng chỉ |
| VocabularySources | 2.577 nguồn từ vựng |
| Notifications | 6 (đa loại) |

---

## 📄 License

MIT © 2026 Quốc Nam

---

<p align="center">Made with ❤️ for IT professionals learning technical English in Vietnam 🇻🇳</p>
