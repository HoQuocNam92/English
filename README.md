# TechEnglish Pro

Nền tảng học tiếng Anh chuyên ngành CNTT và luyện thi chứng chỉ quốc tế, được phát triển dưới dạng monorepo cho Web, Mobile và REST API.

## Tổng quan

| Ứng dụng | Công nghệ chính | Địa chỉ mặc định |
| --- | --- | --- |
| Web | Next.js 15, React 19, Tailwind CSS 4 | `http://localhost:3000` |
| API | NestJS 11, Prisma 5, PostgreSQL | `http://localhost:8080/api/v1` |
| Mobile | Expo SDK 57, React Native | Expo Dev Server |
| API Docs | Swagger | `http://localhost:8080/api/docs` |

TechEnglish Pro hỗ trợ ba nhóm người dùng:

- **Học viên:** onboarding cá nhân hóa, bài học chuyên ngành, flashcard/SRS, bài kiểm tra, tiến độ và gợi ý học tập.
- **Giảng viên:** quản lý nội dung, câu hỏi, bài học, học viên, nhóm học viên và kết quả học tập.
- **Quản trị viên:** toàn bộ nghiệp vụ giảng viên cùng quản lý người dùng, vai trò, quyền, danh mục và chứng chỉ.

## Tính năng chính

- Xác thực bằng email/mật khẩu, JWT, Google OAuth và khôi phục mật khẩu bằng OTP.
- Phân quyền RBAC theo vai trò và quyền chi tiết.
- Quản lý bài học, từ vựng, ví dụ, lĩnh vực CNTT và cấp độ học tập.
- Ngân hàng câu hỏi, nhập câu hỏi từ Excel và tạo bài kiểm tra.
- Chứng chỉ, blueprint theo domain/topic và liên kết nội dung ôn tập.
- Flashcard và theo dõi từ vựng bằng cơ chế lặp lại ngắt quãng.
- Bài kiểm tra xếp lớp, bài thi mô phỏng, chấm điểm và xem lại đáp án.
- Hồ sơ học viên, mục tiêu nghề nghiệp/chứng chỉ và lộ trình học.
- Báo cáo tiến độ, phân tích kết quả và gợi ý học tập bằng luật hoặc AI tùy chọn.
- Nhóm học viên và thông báo đẩy qua Firebase.
- Upload hình ảnh qua Cloudinary và cache qua Redis.

## Cấu trúc dự án

```text
English/
├── apps/
│   ├── api/                    # NestJS REST API
│   │   ├── prisma/             # Schema, migrations và seed
│   │   └── src/
│   │       ├── application/    # Nghiệp vụ
│   │       ├── infrastructure/ # Prisma và dịch vụ ngoài
│   │       ├── modules/        # NestJS modules
│   │       └── presentation/   # Controllers, DTOs và filters
│   ├── web/                    # Next.js App Router
│   └── mobile/                 # Expo Router / React Native
├── packages/
│   ├── contracts/              # Kiểu và giao ước dùng chung
│   ├── design-tokens/          # Màu sắc và design tokens
│   └── shared-kernel/          # Tiện ích nghiệp vụ dùng chung
├── docs/                       # Tài liệu phân tích và kiểm thử
├── docker-compose.yml          # Redis và Redis Commander
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Yêu cầu hệ thống

- Node.js 20 trở lên.
- pnpm 11 (phiên bản dự án: `11.9.0`).
- PostgreSQL 15 trở lên.
- Docker Desktop nếu chạy Redis bằng Docker Compose.
- Expo Go hoặc Android/iOS emulator nếu chạy ứng dụng mobile.

## Cài đặt nhanh

### 1. Cài dependencies

```bash
git clone https://github.com/HoQuocNam92/English.git
cd English
pnpm install
```

### 2. Tạo cấu hình môi trường

Sao chép các file mẫu:

```powershell
Copy-Item .env.example .env
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env.local
```

Tối thiểu cần cấu hình `DATABASE_URL` và `JWT_SECRET` trong `apps/api/.env`. Các cấu hình OpenAI, Google OAuth, Cloudinary, Firebase và SMTP là tùy chọn theo tính năng sử dụng.

Không commit file `.env` chứa khóa bí mật lên Git.

### 3. Khởi động Redis

```bash
docker compose up -d
```

Redis Commander mặc định chạy tại `http://localhost:8081`.

### 4. Chuẩn bị Prisma và database

Tạo Prisma Client (không thay đổi dữ liệu):

```bash
pnpm --filter @techenglish/api db:generate
```

Áp dụng các migration đã có:

```bash
pnpm --filter @techenglish/api db:migrate:deploy
```

Nạp dữ liệu mẫu khi cần:

```bash
pnpm --filter @techenglish/api db:seed
```

> `db:generate` chỉ tạo mã Prisma Client. Không dùng `db:reset` trên database có dữ liệu cần giữ vì lệnh đó xóa và tạo lại database.

### 5. Chạy ứng dụng

Mở các terminal riêng từ thư mục gốc.

```bash
# Backend
pnpm --filter @techenglish/api dev

# Web
pnpm --filter web dev

# Mobile
pnpm --filter mobile dev
```

## Các lệnh thường dùng

| Lệnh | Công dụng |
| --- | --- |
| `pnpm --filter @techenglish/api dev` | Chạy API ở chế độ watch |
| `pnpm --filter @techenglish/api build` | Build API |
| `pnpm --filter @techenglish/api test` | Chạy test API |
| `pnpm --filter @techenglish/api db:generate` | Tạo lại Prisma Client |
| `pnpm --filter @techenglish/api db:migrate:deploy` | Áp dụng migration hiện có |
| `pnpm --filter @techenglish/api db:seed` | Nạp dữ liệu mẫu |
| `pnpm --filter @techenglish/api db:studio` | Mở Prisma Studio |
| `pnpm --filter web dev` | Chạy Next.js dev server |
| `pnpm --filter web build` | Build Web production |
| `pnpm --filter web typecheck` | Kiểm tra TypeScript Web |
| `pnpm --filter mobile dev` | Chạy Expo dev server |
| `pnpm --filter mobile typecheck` | Kiểm tra TypeScript Mobile |
| `pnpm typecheck` | Kiểm tra các package dùng chung |

## Database

Prisma schema hiện có 38 model, thuộc các nhóm:

- Xác thực và RBAC: user, role, permission, refresh token và password reset.
- Hồ sơ học viên: cấp độ, mục tiêu, lĩnh vực, chứng chỉ và nhóm học viên.
- Nội dung: lesson, section, vocabulary, example và các bảng liên kết.
- Chứng chỉ: certificate, domain, certification topic và blueprint nội dung.
- Đánh giá: question, option, exam, attempt và answer.
- Tiến độ: learning progress, vocabulary progress và thông báo đẩy.

Mọi thay đổi schema phải đi kèm migration trong `apps/api/prisma/migrations`.

## API và Swagger

- Base URL: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/api/docs`

Các nhóm endpoint chính gồm auth, users, roles, learner profiles, learner groups, lessons, vocabulary, vocab study, questions, exams, progress, recommendations, notifications, taxonomy, certificates, analytics và upload.

Swagger là nguồn tham chiếu chính xác nhất cho request/response của phiên bản đang chạy.

## Tài khoản seed

Sau khi chạy seed, có thể sử dụng:

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@techenglish.pro` | `Demo@123456` |
| Giảng viên | `nguyen.thanh@techenglish.pro` | `Demo@123456` |
| Học viên | `learner1@techenglish.pro` | `Demo@123456` |

Chỉ sử dụng các tài khoản/mật khẩu mẫu trong môi trường phát triển.

## Xử lý lỗi thường gặp

### PrismaService không có `$connect`, `user`, `question` hoặc `$transaction`

Đây thường là dấu hiệu Prisma Client chưa được tạo hoặc `node_modules` chưa hoàn chỉnh:

```bash
pnpm --filter @techenglish/api db:generate
pnpm --filter @techenglish/api build
```

### pnpm báo `ERR_PNPM_EEXIST` khi tạo symlink

Dừng các tiến trình Node, đổi tên thư mục `node_modules`, sau đó cài lại:

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process
Rename-Item node_modules node_modules_old
pnpm install
```

Sau khi xác nhận dự án hoạt động bình thường, có thể xóa `node_modules_old`.

### Web không gọi được API

Kiểm tra các giá trị sau có cùng host và port với môi trường đang chạy:

- `NEXT_PUBLIC_API_URL` trong `apps/web/.env.local`.
- `WEB_URL` và `CORS_ORIGIN` trong `apps/api/.env`.

## Kiểm tra trước khi commit

```bash
pnpm --filter @techenglish/api build
pnpm --filter web typecheck
pnpm --filter mobile typecheck
pnpm typecheck
```

## Tác giả

Hồ Quốc Nam — Đại học Công nghiệp TP.HCM (IUH)

## Giấy phép

Private — All rights reserved.
