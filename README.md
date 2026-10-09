# TechEnglish Pro

Nền tảng học tiếng Anh chuyên ngành CNTT, học từ vựng và luyện thi chứng chỉ. Dự án dùng monorepo gồm web dành cho học viên/quản trị, ứng dụng mobile và REST API.

## Công nghệ và địa chỉ

| Thành phần | Công nghệ | Địa chỉ local |
| --- | --- | --- |
| Frontend | Next.js 15, React 19, Tailwind CSS 4 | http://localhost:3000 |
| Backend | NestJS 11, Prisma 5, PostgreSQL | http://localhost:8080/api/v1 |
| API docs | Swagger | http://localhost:8080/api/docs |
| Mobile | Expo SDK 57, React Native | Expo Dev Server |

## Chức năng

- Đăng ký, đăng nhập, Google OAuth, khôi phục mật khẩu và phân quyền theo vai trò.
- Quản lý người dùng, học viên, nhóm học viên, cấp độ và mục tiêu nghề nghiệp.
- Quản lý bài học, từ vựng, ngân hàng câu hỏi, đề thi và chứng chỉ theo lĩnh vực/chủ đề.
- Kiểm tra đầu vào, lộ trình cá nhân, kế hoạch học theo tuần và theo dõi tiến độ.
- Học từ vựng bằng flashcard, ôn tập theo lịch và kiểm tra nghĩa của từ.
- Khi trả lời câu hỏi từ vựng: đáp án đúng màu xanh, lựa chọn sai màu đỏ; giải thích chỉ mở khi bấm **Xem chi tiết**.
- Lọc lịch sử ôn tập theo khoảng ngày; danh sách hỗ trợ phân trang, trang con có nút quay lại.
- Báo cáo học tập, kết quả bài thi và gợi ý học bằng luật hoặc dịch vụ AI tùy cấu hình.
- Nhắc học lưu trên máy chủ và hiển thị trong web; hỗ trợ cron trên Ubuntu gọi API.
- Upload ảnh qua Cloudinary và thông báo đẩy qua Firebase khi được cấu hình.

## Cấu trúc

```text
apps/
  api/                  # NestJS: application, infrastructure, modules, presentation
    prisma/             # Schema, migration, seed và dữ liệu từ vựng
  web/                  # Next.js App Router và UI dùng chung
  mobile/               # Expo Router
packages/
  contracts/            # Kiểu/giao ước API
  design-tokens/        # Màu sắc và token giao diện
  shared-kernel/        # Nghiệp vụ dùng chung
docker/                 # Container, migration cho cài đặt mới, tài liệu triển khai
docs/                   # Tài liệu hệ thống và kiểm thử
scripts/ubuntu/        # Script lập lịch nhắc học
```

## Cài đặt và chạy local

Chuẩn bị Node.js 24 (cùng phiên bản CI), pnpm theo `packageManager` trong [package.json](package.json) — hiện là `12.8.1` — và PostgreSQL. Chạy các lệnh dưới đây tại thư mục gốc.

```bash
git clone https://github.com/HoQuocNam92/English.git
cd English
pnpm install --frozen-lockfile
```

### 1. Cấu hình môi trường

Linux/macOS:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

PowerShell:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env.local
```

Trong `apps/api/.env`, cấu hình `DATABASE_URL`, `JWT_SECRET`, `HOST`, `PORT`, `API_PUBLIC_URL`, `WEB_URL` và `CORS_ORIGIN`. File mẫu đã có địa chỉ local; thay mật khẩu database và JWT secret theo môi trường của bạn.

Trong `apps/web/.env.local`, đặt `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`. Khi đổi địa chỉ triển khai, cấu hình lại biến này **trước khi build frontend**.

Google OAuth, SMTP, Cloudinary, Firebase và AI chỉ cần cấu hình khi sử dụng tính năng tương ứng. Không đưa khóa máy chủ vào biến `NEXT_PUBLIC_*` hoặc commit file môi trường thật.

### 2. Tạo Prisma Client và áp dụng migration

```bash
pnpm --filter @techenglish/api db:generate
node --env-file=apps/api/.env docker/migrate.cjs
```

Migration runner chọn lịch sử phù hợp cho database mới hoặc database đã có Prisma migration. Các migration bổ sung được duy trì trong cả `apps/api/prisma/migrations` và `docker/prisma/migrations`.

Lệnh trên không tự seed hoặc reset dữ liệu. Nếu cần dữ liệu mẫu cho môi trường phát triển:

```bash
pnpm --filter @techenglish/api db:seed
```

Không chạy `db:reset` trên database cần giữ dữ liệu.

### 3. Chạy backend và frontend

Mở hai terminal riêng:

```bash
pnpm --filter @techenglish/api dev
```

```bash
pnpm --filter web dev
```

Hoặc chạy cả backend và frontend từ thư mục gốc bằng `pnpm dev`.
Chạy riêng từng phần bằng `pnpm dev:api` và `pnpm dev:web`.
Nếu backend báo `EADDRINUSE` ở cổng 8080, kiểm tra terminal backend đã chạy
trước đó; dùng tiến trình đó hoặc dừng bằng Ctrl+C trước khi chạy lại.

Trang giới thiệu: http://localhost:3000/landing. Đăng nhập: http://localhost:3000/login.

Mobile tùy chọn:

```bash
pnpm --filter mobile dev
```

## Build production

```bash
pnpm --filter @techenglish/api db:generate
pnpm --filter @techenglish/api build
pnpm --filter web build
```

Chạy các bản build trong hai terminal:

```bash
pnpm --filter @techenglish/api start
```

```bash
pnpm --filter web start
```

Backend xuất mã vào `apps/api/dist`; frontend tạo `apps/web/.next`. Cấu hình môi trường production, CORS và database trước khi khởi động. Áp dụng migration bằng runner trước khi dùng chức năng mới; không commit thư mục build.

## Kiểm thử

```bash
pnpm --filter @techenglish/api test
pnpm --filter web typecheck
pnpm typecheck
```

Lệnh test backend bao gồm xác thực, người dùng, từ vựng, tiến độ, gợi ý AI và nhắc học. Có thêm các bộ kiểm thử nghiệp vụ:

```bash
pnpm --filter @techenglish/api test:certification
pnpm --filter @techenglish/api test:placement
pnpm --filter @techenglish/api test:agenda
pnpm --filter @techenglish/api test:learning-ai
```

Xem [tài liệu kiểm thử](docs/testing/README.md) cho danh mục và kịch bản kiểm thử hệ thống.

## Nhắc học trên web và Ubuntu Server

Nhắc học được lưu vào bảng `learning_notifications`; migration `20261005040000_learning_notifications` cần được áp dụng khi triển khai.

- Cron trên Ubuntu gọi API mỗi phút; backend không tự chạy lịch nhắc học trong NestJS.
- Đặt `LEARNING_REMINDER_JOB_KEY` là khóa ngẫu nhiên tối thiểu 32 ký tự; cài lịch bằng `sudo bash scripts/ubuntu/install-learning-reminders.sh /etc/techenglish/learning-reminders.curl`.
- Scheduler gọi `POST /api/v1/internal/jobs/learning-reminders` với header `x-scheduler-key`. Khóa này chỉ nằm trên server.
- Web kiểm tra thông báo khi đang mở; thông báo chưa đọc được lưu để hiển thị khi người học quay lại. Nhắc trong web không cần quyền thông báo trình duyệt.
- Thông báo ngoài cửa sổ web vẫn cần cấu hình Firebase và quyền thông báo phù hợp.

Xem [hướng dẫn Ubuntu Server](docs/ubuntu-learning-reminders.md) và script trong [scripts/ubuntu](scripts/ubuntu).

## Dữ liệu kiểm tra từ vựng

Nghĩa ngắn phục vụ câu hỏi được tách khỏi định nghĩa đầy đủ, không thay đổi tiến độ học. Câu có nghĩa quá dài hoặc tham chiếu chưa giải quyết được sẽ không dùng để sinh lựa chọn trắc nghiệm.

Xem [ghi chú dữ liệu](apps/api/prisma/data/vocabulary-quiz-notes.md), [danh sách cần biên tập](apps/api/prisma/data/vocabulary-quiz-review.json) và [bộ nghĩa ngắn](apps/api/src/application/vocab-study/quiz-meanings.ts).

## Tài khoản mẫu

Sau khi seed ở môi trường phát triển:

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Quản trị viên | `admin@techenglish.pro` | `Demo@123456` |
| Giảng viên | `nguyen.thanh@techenglish.pro` | `Demo@123456` |
| Học viên | `learner1@techenglish.pro` | `Demo@123456` |

## Lỗi thường gặp

- **Prisma thiếu model hoặc phương thức:** chạy `pnpm --filter @techenglish/api db:generate`, sau đó build lại backend.
- **Web không gọi được API:** kiểm tra API đang chạy, `NEXT_PUBLIC_API_URL`, `WEB_URL` và `CORS_ORIGIN`; build lại frontend nếu đã đổi biến public.
- **Nhắc học không hiển thị:** kiểm tra migration, giờ/múi giờ của hồ sơ, khóa gọi API, trạng thái cron và log trên Ubuntu.
- **Migration runner không tìm thấy database:** truyền `DATABASE_URL` bằng môi trường hoặc dùng `node --env-file=apps/api/.env docker/migrate.cjs`.

## Docker và CI/CD

Xem [hướng dẫn Docker và triển khai](docker/README.md) cho Compose, PostgreSQL hiện có, backup và rollback.

- [Docker Compose](docker-compose.yml), [Dockerfile](Dockerfile), [môi trường mẫu](.env.compose.example).
- [CI và build image GHCR](.github/workflows/ci.yml).
- [Triển khai server](.github/workflows/deploy.yml).
- [Build mobile qua EAS](.github/workflows/mobile-build.yml).

CI trên `main` chạy kiểm tra và build trước khi xuất bản container. Build local không đồng nghĩa với đã triển khai hoặc đã áp dụng migration trên server.

## Tác giả và giấy phép

Hồ Quốc Nam — Đại học Công nghiệp TP.HCM (IUH).

Private — All rights reserved.

## File xuất ra và tài liệu bổ sung

APK và kết quả kiểm tra local không thuộc mã nguồn dự án.
Hồ sơ luận văn và gói kiểm chứng nằm trong `docs/thesis/`.
Xem [cấu trúc dự án](docs/08-project-structure.md). Clean Architecture chỉ áp dụng cho backend.
