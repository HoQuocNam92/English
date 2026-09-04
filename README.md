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
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql" />
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
| 🤖 AI Mock Interview | Luyện phỏng vấn kỹ thuật với AI, chấm điểm & nhận xét |
| ✍️ AI Writing Practice | Luyện viết technical English, AI chấm ngữ pháp/từ vựng/rõ ràng |
| 🃏 AI Smart Review | Ôn tập từ vựng thông minh bằng flashcard 3D flip |
| 📖 Technical Reading Lab | Đọc hiểu tài liệu IT, câu hỏi comprehension |
| 📚 Technical Dictionary | Từ điển kỹ thuật IT chuyên ngành, tìm kiếm nhanh |
| 🗓️ Learning Calendar | Quản lý lịch học, kế hoạch theo ngày/tuần/tháng |
| 👥 Community Discussion | Thảo luận, đặt câu hỏi, chia sẻ kinh nghiệm IT |
| 🏆 Leaderboard & Gamification | Bảng xếp hạng EXP, streak hàng ngày, badge, thành tích |
| 🔔 Notification Center | Thông báo hệ thống, nhắc nhở học tập, flash sale |
| 📊 Learning Analytics | Phân tích tiến độ, biểu đồ học tập chi tiết |
| 🎯 Skill Gap Analysis | So sánh kỹ năng hiện tại với yêu cầu công việc mục tiêu |
| 📝 Exam Readiness Score | Đánh giá sẵn sàng thi chứng chỉ (AWS, Azure, GCP, CKA...) |
| 🗺️ AI Learning Path Generator | AI tạo lộ trình học cá nhân hóa theo mục tiêu |
| 🌙 Dark / Light Mode | Hỗ trợ cả 2 theme, mặc định Light, nhớ lựa chọn |
| 🌐 Tiếng Việt / English | Chuyển đổi ngôn ngữ giao diện hoàn toàn (20+ trang) |
| 💳 Subscription Plans | Gói 1/3/6/12 tháng PRO, tích hợp SePay |
| ⚡ Flash Sale & Voucher | Quản lý khuyến mãi real-time từ Admin panel |
| 🔐 Google OAuth | Đăng nhập bằng Google account |
| 📧 Email Reset Password | Quên mật khẩu gửi email qua SMTP |
| ☁️ Cloudinary Upload | Upload avatar, hình ảnh bài học |

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
│   │   │   │   └── admin/          # Users, Lessons, Exams, Notifications, Flash Sales...
│   │   │   ├── (auth)/             # Login, Register, Forgot Password
│   │   │   └── (learner)/learn/    # 20+ learner pages
│   │   │       ├── page.tsx        # Dashboard chính
│   │   │       ├── lessons/        # Danh sách & chi tiết bài học
│   │   │       ├── mock-interview/ # AI Mock Interview
│   │   │       ├── writing-practice/ # AI Writing Practice
│   │   │       ├── smart-review/   # AI Smart Review Flashcards
│   │   │       ├── reading-lab/    # Technical Reading Lab
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
│       │   ├── mock-interview/     # AI Mock Interview (3-phase)
│       │   ├── writing-practice/   # AI Writing Practice + history
│       │   ├── dictionary/         # Technical Dictionary + A-Z filter
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
| Prisma | 6 | ORM & Database migrations |
| PostgreSQL | 16 | Database chính |
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
| React Native | 0.76 | Mobile UI |
| Expo Router | v4 | File-based routing |
| AsyncStorage | — | Local persistent storage |

---

## ⚡ Cài đặt

### Yêu cầu
- Node.js ≥ 20
- pnpm ≥ 9
- PostgreSQL 16
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
GOOGLE_CALLBACK_URL="http://localhost:3001/auth/google/callback"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your@gmail.com"
SMTP_PASS="your-app-password"
CLOUDINARY_CLOUD_NAME="xxx"
CLOUDINARY_API_KEY="xxx"
CLOUDINARY_API_SECRET="xxx"
SEPAY_API_KEY="xxx"
SEPAY_BANK_ACCOUNT="xxx"

# apps/web/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 3. Database & Seed

```bash
cd apps/api
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Start Development

```bash
# API (port 3001)
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

### AI Features
```
POST /interview/start         Bắt đầu AI Mock Interview
POST /interview/:id/answer    Trả lời câu hỏi phỏng vấn
GET  /interview/my            Lịch sử phỏng vấn của tôi
GET  /writing/prompts         Danh sách đề bài Writing
POST /writing/submit          Nộp bài → nhận AI feedback + scores
GET  /writing/my              Lịch sử bài nộp
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
GET  /flash-sales/active        Flash sale đang active
GET  /vouchers/active           Voucher đang áp dụng
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

```
User ──┬── UserDetail       (profile info, avatar, bio)
       ├── UserStreak        (EXP, currentStreak, badges)
       ├── UserBadge[]
       ├── Subscription      (plan type, expiry, isPro)
       ├── LessonProgress[]
       ├── TestResult[]
       ├── LearningPlanItem[]
       ├── Notification[]
       ├── MockInterview[]   ── MockInterviewTurn[]
       ├── WritingSubmission[]
       └── DiscussionPost[]  ── DiscussionComment[]
                             └── DiscussionVote[]

Lesson ─── VocabularyItem[]
       └── Question[]        ── Exam[]
                             └── ExamQuestion[]

Domain / Level / CertificateGoal / CareerGoal (taxonomies)
Plan / FlashSale / Voucher / Order (payment)
```

---

## 🔐 Phân quyền

| Role | Permissions |
|------|-------------|
| **admin** | Full CRUD: users, lessons, exams, vocabulary, notifications, flash sales, vouchers, roles |
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
| MockInterview sessions | 2 hoàn chỉnh + 5 turns |
| WritingSubmissions | 3 (với AI scores) |
| DiscussionPosts | 5 + comments + votes |
| LearningPlanItems | 6 |
| Notifications | 6 (đa loại) |
| Flash Sales | 1 active |
| Vouchers | 3 active |

---

## 📄 License

MIT © 2025 Quốc Nam

---

<p align="center">Made with ❤️ for IT professionals learning technical English in Vietnam 🇻🇳</p>
