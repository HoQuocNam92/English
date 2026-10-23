# TechEnglish Pro

Hệ thống học tiếng Anh chuyên ngành CNTT và ôn tập chứng chỉ, gồm website cho học viên và quản trị viên, REST API và ứng dụng Android/iOS trong cùng một pnpm workspace.

## Chức năng

- Đăng ký bằng Gmail, đăng nhập, Google OAuth, khôi phục mật khẩu và phân quyền theo vai trò.
- Quản lý học viên, nhóm học, chuyên ngành, trình độ, mục tiêu nghề nghiệp và chứng chỉ.
- Biên soạn, xuất bản bài học, từ vựng, câu hỏi và đề luyện tập; nhập câu hỏi từ Excel.
- Thiết lập mục tiêu, kiểm tra xếp trình độ, tạo kế hoạch học và theo dõi tiến độ.
- Học thẻ từ, đánh giá mức độ ghi nhớ, ôn tập theo lịch và xem lịch sử học.
- Làm bài luyện tập, tính điểm trên máy chủ, lưu phiên bản đề khi bắt đầu và xem lại kết quả.
- Báo cáo quản trị, gợi ý học theo quy tắc hoặc AI, dịch từ, phát âm và nhắc học.

Google OAuth, email khôi phục mật khẩu, tải ảnh, dịch AI và thông báo đẩy cần cấu hình dịch vụ tương ứng.

### Quy tắc đăng ký và dữ liệu

- Tài khoản tự đăng ký mới chỉ nhận đúng tên miền `gmail.com`. Email ngoài Gmail, `@sub.gmail.com` và `@gmail.com.tenkhac` bị từ chối với thông báo **“Chỉ chấp nhận địa chỉ email @gmail.com”**.
- Email đăng ký được bỏ khoảng trắng ngoài và chuyển thành chữ thường trước khi kiểm tra trùng. Web, mobile và máy chủ đều kiểm tra quy tắc Gmail; tạo tài khoản mới qua Google cũng áp dụng quy tắc này.
- Tài khoản mẫu có sẵn vẫn đăng nhập bằng địa chỉ đã seed.
- Hoàn tất thiết lập hồ sơ phải có mục tiêu và lựa chọn chuyên ngành/chứng chỉ tương ứng. Cập nhật sở thích không tự đánh dấu hoàn tất thiết lập.
- Nhập câu hỏi có mã chuyên ngành hoặc cấp độ không tồn tại bị từ chối trước khi ghi dữ liệu; lô có dòng sai không được lưu một phần.
- Đáp án đúng và nội dung nháp được giới hạn theo quyền; bài thi được chấm trên máy chủ.

## Công nghệ và cấu trúc

| Thành phần | Công nghệ |
| --- | --- |
| Web | Next.js 15, React 19, Tailwind CSS 4 |
| API | NestJS 11, Prisma 5, PostgreSQL |
| Mobile | Expo SDK 57, React Native 0.86 |
| Workspace | Node.js 24, pnpm 12.8.1, TypeScript |
| Triển khai | Docker Compose, GitHub Actions |

```text
apps/
  api/                  # API, Prisma schema, migrations và seed
  web/                  # Website Next.js App Router
  mobile/               # Ứng dụng Expo Router
packages/
  contracts/            # Kiểu dữ liệu và giao ước API
  design-tokens/        # Màu sắc và thiết kế dùng chung
  shared-kernel/        # Nghiệp vụ dùng chung
docker/                 # Migration runner và hướng dẫn triển khai
docs/                   # Tài liệu hệ thống, kiểm thử và luận văn
scripts/ubuntu/         # Lập lịch nhắc học
```

## Địa chỉ local

| Dịch vụ | Địa chỉ |
| --- | --- |
| Website | http://localhost:3000 |
| Đăng nhập | http://localhost:3000/login |
| Đăng ký | http://localhost:3000/register |
| REST API | http://localhost:8080/api/v1 |
| Swagger | http://localhost:8080/api/docs |

## Chạy Docker

Cần Docker Engine/Desktop và Compose từ 2.24. Chạy các lệnh từ thư mục gốc repository.

### Dùng PostgreSQL hiện có

Tạo `.env.compose` từ [.env.compose.example](.env.compose.example) nếu chưa có. Giữ lại cấu hình đang sử dụng.

```powershell
if (!(Test-Path .env.compose)) { Copy-Item .env.compose.example .env.compose }
```

Điền `DATABASE_URL`, `JWT_SECRET` và các URL trong `.env.compose`. Nếu PostgreSQL chạy trên máy host của Docker Desktop, dùng `host.docker.internal` thay cho `localhost` trong địa chỉ kết nối của container.

Khi image đã build sẵn:

```bash
docker compose --env-file .env.compose -f compose.postgres.yml config --quiet
docker compose --env-file .env.compose -f compose.postgres.yml up -d --no-build --wait api web
docker compose --env-file .env.compose -f compose.postgres.yml ps
```

Khi mã nguồn thay đổi hoặc chưa có image:

```bash
docker compose --env-file .env.compose -f compose.postgres.yml up -d --build --wait api web
```

`API_IMAGE` và `WEB_IMAGE` chọn tag image. Khi không đặt, mặc định là `techenglish-api:local` và `techenglish-web:local`. Lệnh `--no-build` chạy image đã có, không áp dụng mã nguồn vừa sửa.

[compose.postgres.yml](compose.postgres.yml) không tạo PostgreSQL, không tự migration và không seed. Thao tác trên ứng dụng sẽ đọc/ghi database đã cấu hình.

### Tạo PostgreSQL riêng trong Docker

Điền `POSTGRES_PASSWORD`, `JWT_SECRET` và các URL trong `.env.compose`, sau đó chạy:

```bash
docker compose --env-file .env.compose up -d --build --wait
docker compose --env-file .env.compose ps
docker compose --env-file .env.compose logs --tail 100 migrate api web
```

[docker-compose.yml](docker-compose.yml) tạo PostgreSQL trong volume riêng, chạy migration rồi khởi động API và web. Không tự seed dữ liệu mẫu. Xem [hướng dẫn Docker](docker/README.md) cho seed, backup, vận hành và CI/CD.

## Chạy bằng mã nguồn

### Cài đặt và cấu hình

Cài Node.js 24, pnpm 12.8.1 và PostgreSQL. Dùng phiên bản pnpm theo `packageManager` để đọc đúng lockfile.

```bash
git clone https://github.com/HoQuocNam92/English.git
cd English
pnpm install --frozen-lockfile
```

Tạo cấu hình nếu chưa có, ví dụ trong PowerShell:

```powershell
if (!(Test-Path apps/api/.env)) { Copy-Item apps/api/.env.example apps/api/.env }
if (!(Test-Path apps/web/.env.local)) { Copy-Item apps/web/.env.example apps/web/.env.local }
```

Trên Linux/macOS, dùng `cp` để sao chép các file mẫu tương ứng nếu file đích chưa tồn tại.

Các biến chính trong `apps/api/.env`:

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

Database phải tồn tại và truy cập được. Mật khẩu có ký tự đặc biệt cần được URL-encode trong connection string.

Trong `apps/web/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

Không commit file môi trường thật. Chỉ đưa giá trị public cần thiết vào biến `NEXT_PUBLIC_*` hoặc `EXPO_PUBLIC_*`.

### Chuẩn bị database và khởi động

```bash
pnpm --filter @techenglish/api db:generate
node --env-file=apps/api/.env docker/migrate.cjs
```

Migration runner chọn lịch sử phù hợp cho database mới hoặc database có lịch sử Prisma. Lệnh cập nhật cấu trúc database đích, không tự seed hoặc reset.

Nếu cần dữ liệu mẫu trên database phát triển:

```bash
pnpm --filter @techenglish/api db:seed
```

Không seed demo hoặc dùng `db:reset` trên database cần giữ dữ liệu. Khởi động web và API:

```bash
pnpm dev
```

Hoặc chạy riêng `pnpm dev:api` và `pnpm dev:web` trong hai terminal.

### Tài khoản mẫu

Các tài khoản sau được khai báo trong `apps/api/prisma/seed.ts` và được tạo khi chạy seed dữ liệu phát triển. Đây là tài khoản demo dùng đuôi `@techenglish.pro`; tài khoản tự đăng ký mới phải dùng đúng đuôi `@gmail.com`.

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Quản trị viên | `admin@techenglish.pro` | `Demo@123456` |
| Giảng viên | `nguyen.thanh@techenglish.pro` | `Demo@123456` |
| Học viên | `learner1@techenglish.pro` | `Demo@123456` |

Bảng này mô tả dữ liệu seed, không xác nhận tài khoản đang có trong database của bạn. Khi đăng nhập, dùng đúng email đã tạo; không tự thay `@techenglish.pro` thành `@gmail.com`. Seed dùng `upsert` với `update: {}`, nên chạy lại không đặt lại mật khẩu tài khoản đã tồn tại.

## Mobile

Đặt `EXPO_PUBLIC_API_URL` theo môi trường chạy ứng dụng:

- Android emulator: `http://10.0.2.2:8080/api/v1`.
- Thiết bị thật: IP LAN của máy chạy API, ví dụ `http://192.168.1.10:8080/api/v1`.

```bash
pnpm --filter mobile dev
```

Máy tính và điện thoại phải kết nối được với nhau. Lệnh trên mở Expo Metro, không tạo APK/IPA. Đăng nhập Google native cần development build hoặc bản cài phù hợp; không hỗ trợ trong Expo Go. Xem [hướng dẫn Docker và mobile](docker/README.md) khi tạo bản cài.

## Kiểm thử và build

| Mục đích | Lệnh |
| --- | --- |
| API và hồi quy chất lượng dữ liệu | `pnpm --filter @techenglish/api test` |
| Hồi quy câu hỏi, bài học, chứng chỉ và đề thi | `pnpm --filter @techenglish/api test:bug-regressions` |
| Nghiệp vụ chứng chỉ | `pnpm --filter @techenglish/api test:certification` |
| Xếp trình độ | `pnpm --filter @techenglish/api test:placement` |
| Lịch học | `pnpm --filter @techenglish/api test:agenda` |
| AI lập kế hoạch | `pnpm --filter @techenglish/api test:learning-ai` |
| Web | `pnpm --filter web test` |
| Mobile | `pnpm --filter mobile test` |
| Nghiệp vụ dùng chung | `pnpm --filter @techenglish/shared-kernel test` |
| Typecheck package | `pnpm typecheck` |
| Typecheck web | `pnpm --filter web typecheck` |
| Typecheck mobile | `pnpm --filter mobile typecheck` |
| Build API | `pnpm --filter @techenglish/api build` |
| Build web | `pnpm --filter web build` |

Các script API chia thành nhiều bộ; chỉ chạy `test` chưa bao gồm toàn bộ script chuyên biệt trong bảng. Khi chạy test với môi trường ứng dụng đã nạp, bỏ biến `LEARNING_REMINDER_JOB_KEY` khỏi tiến trình test để không ảnh hưởng fixture giả lập khóa scheduler.

Đợt kiểm tra Docker ngày **23/10/2026** đã chạy toàn bộ file API `.spec.ts` với **160/160 đạt**, test web/mobile/shared với **29/29 đạt**, cùng **304/304 kiểm tra HTTP/workflow** và **8/8 kiểm tra quy tắc Gmail**. API và web build thành công; mobile typecheck thành công. Các kiểm tra thay đổi dữ liệu dùng database QA riêng.

Đây là kết quả trong phạm vi đã chạy, chưa phải nghiệm thu toàn bộ hệ thống. Còn các phần chưa xác nhận đầy đủ như Android/iOS native, Google OAuth thực tế, thông báo đẩy, dịch vụ ngoài, giao diện nhập/xuất Excel, hiệu năng, bảo mật và các hành trình xuyên suốt.

Xem [tài liệu kiểm thử](docs/testing/README.md) và [kết quả kiểm thử, sửa lỗi ngày 23/10](docs/testing/bug-document-2026-10-23.md).

## Production và tích hợp

- Build API/web trước khi chạy `pnpm --filter @techenglish/api start` và `pnpm --filter web start`.
- `NEXT_PUBLIC_API_URL` được đưa vào bundle lúc build; thay địa chỉ API cần build lại web.
- Cấu hình Google OAuth, SMTP, Cloudinary, Firebase và AI theo [file môi trường API mẫu](apps/api/.env.example).
- Tác vụ nhắc học được gọi bằng `POST /api/v1/internal/jobs/learning-reminders` với header `x-scheduler-key`. Đặt `LEARNING_REMINDER_JOB_KEY` ngẫu nhiên tối thiểu 32 ký tự và làm theo [hướng dẫn Ubuntu](docs/ubuntu-learning-reminders.md).
- Xem [Docker và CI/CD](docker/README.md) cho GHCR, deploy, rollback và build mobile. Với Vercel, chọn Root Directory `apps/web`, cho phép truy cập package ngoài thư mục này và đặt URL API trước khi build.

## Xử lý lỗi thường gặp

| Hiện tượng | Cách kiểm tra |
| --- | --- |
| Web mở được nhưng không gọi API | Kiểm tra Swagger, URL API và CORS; build lại web nếu đã đổi biến public. |
| Database báo `P1001` | Kiểm tra PostgreSQL, host/port, mật khẩu và quyền kết nối; container không dùng localhost để gọi database trên host. |
| Prisma thiếu engine cho Windows/Linux | Chạy lại `pnpm --filter @techenglish/api db:generate` trên hệ điều hành đích. |
| Thiếu thư viện native sau khi đổi hệ điều hành | Cài lại bằng `pnpm install --frozen-lockfile --force`; không chép node_modules giữa Windows và Linux. |
| Cổng 3000 hoặc 8080 đã được dùng | Kiểm tra tiến trình/container đang chạy trước khi khởi động thêm. |
| Sửa code nhưng Docker vẫn chạy bản cũ | Chạy lại với `--build`; kiểm tra tag image và trạng thái container. |
| Đăng ký email ngoài Gmail bị từ chối | Đây là quy tắc đăng ký; dùng địa chỉ có đúng đuôi @gmail.com. |
| Không có thông báo đẩy | Kiểm tra Firebase, quyền thiết bị và lịch gọi tác vụ nhắc học. |

## Tài liệu

- [Cấu trúc dự án](docs/08-project-structure.md).
- [Docker và CI/CD](docker/README.md).
- [Kiểm thử](docs/testing/README.md).
- [Ghi chú dữ liệu câu hỏi từ vựng](apps/api/prisma/data/vocabulary-quiz-notes.md).
- Hồ sơ luận văn: `docs/thesis/`.

## Tác giả và giấy phép

Hồ Quốc Nam — Đại học Công nghiệp TP.HCM (IUH).

Private — All rights reserved.
