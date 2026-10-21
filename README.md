# TechEnglish Pro

Nền tảng học tiếng Anh chuyên ngành CNTT, luyện từ vựng và ôn thi chứng chỉ. Dự án gồm website cho học viên/quản trị, REST API và ứng dụng mobile trong cùng một pnpm workspace.

## Địa chỉ khi chạy local

| Thành phần | Địa chỉ |
| --- | --- |
| Trang giới thiệu | http://localhost:3000/landing |
| Đăng nhập | http://localhost:3000/login |
| REST API | http://localhost:8080/api/v1 |
| Tài liệu Swagger | http://localhost:8080/api/docs |

Các địa chỉ trên hoạt động khi tiến trình web và API đang chạy. PostgreSQL phải truy cập được theo cấu hình trong `apps/api/.env`.

## Công nghệ và cấu trúc

- **Web:** Next.js 15, React 19, Tailwind CSS 4.
- **API:** NestJS 11, Prisma 5, PostgreSQL.
- **Mobile:** Expo SDK 57, React Native.
- **Workspace:** pnpm, TypeScript; dependencies dùng chế độ `hoisted`.

```text
apps/
  api/                 # Backend; Clean Architecture
    prisma/            # Schema, migrations và seed
    src/               # Application, infrastructure, presentation
  web/                 # Next.js App Router
  mobile/              # Expo Router
packages/
  contracts/           # Kiểu và giao ước API
  design-tokens/       # Màu sắc và token giao diện
  shared-kernel/       # Nghiệp vụ dùng chung
docker/                # Migration runner, cấu hình và hướng dẫn triển khai
docs/                  # Tài liệu hệ thống, kiểm thử và luận văn
scripts/ubuntu/        # Lập lịch nhắc học
```

## Chức năng chính

- Đăng ký, đăng nhập, Google OAuth, khôi phục mật khẩu và phân quyền.
- Quản lý học viên, nhóm học, bài học, từ vựng, câu hỏi, đề thi và chứng chỉ.
- Kiểm tra đầu vào, lộ trình cá nhân, kế hoạch tuần và theo dõi tiến độ.
- Flashcard, ôn tập theo lịch, câu hỏi nghĩa từ và lịch sử ôn tập.
- Thi thử, báo cáo kết quả và gợi ý học theo luật hoặc dịch vụ AI tùy cấu hình.
- Nhắc học trong web; upload ảnh và thông báo đẩy khi cấu hình dịch vụ tương ứng.

## Yêu cầu

- Node.js **24**, theo môi trường CI của dự án.
- pnpm **12.8.1**, theo trường `packageManager` trong `package.json`.
- PostgreSQL đang chạy và một database dành cho dự án.
- Kết nối mạng khi cài dependencies và tải Prisma engine lần đầu.

Kiểm tra công cụ trước khi cài:

```bash
node --version
pnpm --version
```

Dùng phiên bản pnpm trong `package.json` để đọc đúng lockfile; không hạ xuống pnpm 9/10. Khi chuyển giữa Linux và Windows, cài lại dependencies trên hệ điều hành đích thay vì sao chép `node_modules`.

## Cài đặt lần đầu

Chạy các lệnh sau tại thư mục gốc repository:

```bash
git clone https://github.com/HoQuocNam92/English.git
cd English
pnpm install --frozen-lockfile
```

### 1. Tạo file môi trường

Chỉ sao chép nếu chưa có file cấu hình; giữ lại file đang dùng.

**Windows PowerShell:**

```powershell
if (!(Test-Path apps/api/.env)) { Copy-Item apps/api/.env.example apps/api/.env }
if (!(Test-Path apps/web/.env.local)) { Copy-Item apps/web/.env.example apps/web/.env.local }
```

**Linux/macOS:**

```bash
[ -f apps/api/.env ] || cp apps/api/.env.example apps/api/.env
[ -f apps/web/.env.local ] || cp apps/web/.env.example apps/web/.env.local
```

Chỉnh các biến chính trong `apps/api/.env`:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/techenglish?schema=public"
JWT_SECRET=thay-bang-chuoi-bi-mat-ngau-nhien
NODE_ENV=development
HOST=0.0.0.0
PORT=8080
API_PUBLIC_URL=http://localhost:8080
WEB_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

Thay `USER`, `PASSWORD` và tên database bằng thông tin PostgreSQL của bạn. Tạo database trước nếu chưa tồn tại. Mật khẩu chứa ký tự đặc biệt cần được URL-encode trong connection string.

Trong `apps/web/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

Google OAuth, SMTP, Cloudinary, Firebase và AI được cấu hình qua các biến trong file mẫu khi cần dùng. Không commit file môi trường thật hoặc đưa khóa máy chủ vào biến `NEXT_PUBLIC_*`.

### 2. Tạo Prisma Client và áp dụng migration

```bash
pnpm --filter @techenglish/api db:generate
node --env-file=apps/api/.env docker/migrate.cjs
```

Migration runner chọn lịch sử phù hợp cho database mới hoặc database đã có Prisma migration. Kiểm tra `DATABASE_URL` trước khi chạy vì migration cập nhật cấu trúc database đích. Lệnh này không tự seed hoặc reset dữ liệu.

Nếu cần dữ liệu mẫu trên database phát triển:

```bash
pnpm --filter @techenglish/api db:seed
```

Seed ghi dữ liệu vào database; không chạy seed demo trên production. Không dùng `db:reset` với database cần giữ dữ liệu.

### 3. Khởi chạy web và API

```bash
pnpm dev
```

Mở http://localhost:3000/login. Giữ terminal đang chạy; nhấn **Ctrl+C** để dừng.

Có thể chạy hai phần trong hai terminal riêng:

```bash
# Terminal 1
pnpm dev:api
```

```bash
# Terminal 2
pnpm dev:web
```

Những lần chạy sau, khi dependencies, môi trường và database đã sẵn sàng, chỉ cần chạy `pnpm dev` từ thư mục gốc.

### 4. Kiểm tra dịch vụ

**PowerShell:**

```powershell
(Invoke-WebRequest http://localhost:3000/login).StatusCode
(Invoke-WebRequest http://localhost:8080/api/docs).StatusCode
```

**Linux/macOS:**

```bash
curl -I http://localhost:3000/login
curl -I http://localhost:8080/api/docs
```

Cả hai địa chỉ cần trả về HTTP 200. Kiểm tra này xác nhận dịch vụ HTTP hoạt động; để kiểm tra nghiệp vụ, đăng nhập và thử chức năng trên giao diện.

## Tài khoản mẫu

Các tài khoản dưới đây được tạo sau khi seed dữ liệu phát triển:

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Quản trị viên | `admin@techenglish.pro` | `Demo@123456` |
| Giảng viên | `nguyen.thanh@techenglish.pro` | `Demo@123456` |
| Học viên | `learner1@techenglish.pro` | `Demo@123456` |

## Mobile

Cấu hình `EXPO_PUBLIC_API_URL` cho môi trường chạy mobile, sau đó khởi động Expo:

```bash
pnpm --filter mobile dev
```

- Android emulator: thường dùng `http://10.0.2.2:8080/api/v1`.
- Điện thoại thật: dùng IP LAN của máy chạy API, chẳng hạn `http://192.168.1.10:8080/api/v1`; máy tính và điện thoại cần kết nối được với nhau.
- Dùng Expo Go tương thích hoặc development client phù hợp với các module native của ứng dụng.

Lệnh trên chạy dev server, không tạo APK/IPA.

## Build và chạy production

```bash
pnpm --filter @techenglish/api db:generate
pnpm --filter @techenglish/api build
pnpm --filter web build
```

Sau khi thiết lập môi trường production và áp dụng migration, chạy mỗi lệnh trong một terminal:

```bash
pnpm --filter @techenglish/api start
```

```bash
pnpm --filter web start
```

API xuất mã vào `apps/api/dist`, web vào `apps/web/.next`. `NEXT_PUBLIC_API_URL` được đưa vào bundle khi build; đổi địa chỉ API cần build lại web.

## Kiểm thử

| Mục đích | Lệnh |
| --- | --- |
| Backend | `pnpm --filter @techenglish/api test` |
| Web regression | `pnpm --filter web test` |
| Web typecheck | `pnpm --filter web typecheck` |
| Mobile typecheck | `pnpm --filter mobile typecheck` |
| Các package `@techenglish/*` có script typecheck | `pnpm typecheck` |
| Nghiệp vụ chứng chỉ | `pnpm --filter @techenglish/api test:certification` |
| Kiểm tra đầu vào | `pnpm --filter @techenglish/api test:placement` |
| Kế hoạch học | `pnpm --filter @techenglish/api test:agenda` |
| AI lập kế hoạch | `pnpm --filter @techenglish/api test:learning-ai` |

Xem [tài liệu kiểm thử](docs/testing/README.md) cho danh mục và kịch bản chi tiết.

## Xử lý lỗi thường gặp

### Thiếu thư viện native sau khi chuyển Linux/Windows

Biểu hiện: thiếu `@next/swc-win32-x64-msvc`, `lightningcss.win32-x64-msvc.node` hoặc `@tailwindcss/oxide-win32-x64-msvc`.

Dừng dev server, cài lại dependencies từ thư mục gốc trên máy đích rồi khởi động lại:

```bash
pnpm install --frozen-lockfile --force
pnpm --filter @techenglish/api db:generate
pnpm dev
```

Giữ nguyên lockfile. Đảm bảo máy truy cập được npm registry khi tải các gói theo hệ điều hành.

### Prisma được tạo cho Linux nhưng đang chạy Windows

Nếu báo `Prisma Client could not locate the Query Engine for runtime "windows"`, tạo lại client trên máy đang chạy:

```bash
pnpm --filter @techenglish/api db:generate
```

Sau đó khởi động lại backend. Chạy lệnh này cả khi Prisma Client thiếu model sau khi cập nhật schema.

### Không kết nối được database (`P1001`)

Kiểm tra PostgreSQL đang chạy, host/port truy cập được và `DATABASE_URL` đúng. Nếu database ở máy khác, kiểm tra kết nối mạng và quyền truy cập. Không reset database để xử lý lỗi kết nối.

### Cổng 3000 hoặc 8080 đã được sử dụng

Kiểm tra terminal và tiến trình đang chạy trước khi mở thêm dev server. Dùng lại dịch vụ hiện có hoặc dừng đúng tiến trình bằng Ctrl+C. Nếu đổi cổng, cập nhật cả URL API, web và CORS tương ứng.

### Web mở được nhưng không gọi được API

Kiểm tra API tại http://localhost:8080/api/docs, sau đó đối chiếu `NEXT_PUBLIC_API_URL`, `WEB_URL` và `CORS_ORIGIN`. Khởi động lại dev server sau khi đổi môi trường; với production, build lại web khi đổi biến public.

### Không có thông báo đẩy

Firebase chưa cấu hình sẽ tắt push notification. Nhắc học trong web vẫn dùng dữ liệu lưu trên máy chủ, nhưng cần migration và lịch gọi job nhắc học.

## Nhắc học trên Ubuntu

Cron gọi `POST /api/v1/internal/jobs/learning-reminders` mỗi phút với header `x-scheduler-key`; backend không tự chạy lịch nhắc học trong NestJS.

Đặt `LEARNING_REMINDER_JOB_KEY` là khóa ngẫu nhiên tối thiểu 32 ký tự, áp dụng migration rồi làm theo [hướng dẫn nhắc học Ubuntu](docs/ubuntu-learning-reminders.md). Web kiểm tra thông báo khi đang mở; thông báo chưa đọc được lưu cho lần truy cập sau.

## Docker và triển khai

Xem [hướng dẫn Docker và CI/CD](docker/README.md) trước khi triển khai.

- [docker-compose.yml](docker-compose.yml): PostgreSQL riêng, migration runner, API và web.
- [compose.postgres.yml](compose.postgres.yml): kết nối PostgreSQL hiện có; không tự tạo database hoặc chạy migration.
- [.env.compose.example](.env.compose.example): biến môi trường Compose.
- [Dockerfile](Dockerfile): các target API, web và mobile.
- [CI](.github/workflows/ci.yml), [deploy](.github/workflows/deploy.yml), [mobile build](.github/workflows/mobile-build.yml).

Với Vercel, chọn Root Directory là `apps/web` và cho phép truy cập các package ngoài thư mục này. Cấu hình [apps/web/vercel.json](apps/web/vercel.json) dùng pnpm 12.8.1 qua `npx` và gọi Next.js từ `node_modules` gốc. Đặt `NEXT_PUBLIC_API_URL` trước khi deploy.

## Tài liệu bổ sung

- [Cấu trúc dự án](docs/08-project-structure.md).
- [Ghi chú dữ liệu câu hỏi từ vựng](apps/api/prisma/data/vocabulary-quiz-notes.md).
- [Danh sách nghĩa từ cần biên tập](apps/api/prisma/data/vocabulary-quiz-review.json).
- Hồ sơ luận văn: `docs/thesis/`.

## Tác giả và giấy phép

Hồ Quốc Nam — Đại học Công nghiệp TP.HCM (IUH).

Private — All rights reserved.
