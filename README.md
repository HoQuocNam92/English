# TechEnglish Pro (KLCN028)

TechEnglish Pro là hệ thống học tiếng Anh chuyên ngành Công nghệ thông tin dành cho sinh viên, lập trình viên và kỹ sư phần mềm. Sản phẩm hướng tới ba nhóm người dùng: **Admin**, **Giảng viên** và **Học viên**, với hai giao diện chính là cổng quản trị trên web và ứng dụng học tập trên thiết bị di động.

> **Trạng thái hiện tại:** Web và Mobile đã có giao diện cùng dữ liệu demo để kiểm thử luồng sử dụng. Backend, xác thực thật và cơ sở dữ liệu vẫn đang ở giai đoạn khởi tạo, chưa được kết nối vào hai ứng dụng.

## Chức năng

### Cổng quản trị và giảng viên — Web

Ứng dụng web cung cấp giao diện cho Admin và Giảng viên:

- Đăng nhập, đăng xuất và lưu phiên đăng nhập demo.
- Dashboard tổng quan hoạt động học tập.
- Quản lý người dùng, học viên và nhóm học viên.
- Xem hồ sơ, mục tiêu nghề nghiệp và tiến độ của từng học viên.
- Quản lý cấp độ học: Beginner, Intermediate, Advanced và Professional.
- Quản lý nội dung học, bài học và nội dung ôn chứng chỉ.
- Tạo và quản lý ngân hàng câu hỏi.
- Tạo bài kiểm tra, xem kết quả và lịch sử làm bài.
- Theo dõi tiến độ và xem báo cáo thống kê.

Các màn hình hiện sử dụng repository mock và dữ liệu mẫu trong trình duyệt; thao tác chưa được lưu vào PostgreSQL.

### Ứng dụng học viên — Mobile

Ứng dụng Expo/React Native hỗ trợ các luồng học tập:

- Đăng ký, đăng nhập, sửa hồ sơ và đổi mật khẩu.
- Thiết lập lộ trình theo trình độ tiếng Anh, lĩnh vực CNTT, mục tiêu nghề nghiệp và chứng chỉ.
- Xem trang chủ và lộ trình học cá nhân.
- Học bài học, thuật ngữ và từ vựng chuyên ngành.
- Ôn từ bằng flashcard.
- Làm quiz, bài luyện tập tình huống và bài kiểm tra.
- Xem điểm, giải thích đáp án và lịch sử làm bài.
- Theo dõi tiến độ học tập cá nhân.

Mobile hiện chạy ở chế độ demo; đăng nhập và dữ liệu học chưa gọi backend thật.

### Backend và dữ liệu

Kiến trúc mục tiêu của backend là **NestJS + Prisma + PostgreSQL** theo Clean Architecture. Hiện tại `apps/api` mới có:

- Prisma schema khởi tạo.
- Biến môi trường mẫu cho PostgreSQL.
- Quy ước vị trí Prisma trong tầng Infrastructure.

Các API cho xác thực, người dùng, nội dung học, bài kiểm tra, tiến độ, báo cáo và gợi ý cá nhân hóa chưa được triển khai.

## Tài khoản Web demo

Tại trang `/login`, có thể dùng một trong hai tài khoản sau với mật khẩu bất kỳ dài ít nhất 6 ký tự:

| Vai trò | Email |
| --- | --- |
| Admin | `admin@techenglish.pro` |
| Giảng viên | `teacher@techenglish.pro` |

Bạn cũng có thể chọn nút đăng nhập nhanh ngay trên giao diện.

## Công nghệ

| Thành phần | Công nghệ |
| --- | --- |
| Web | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| Mobile | Expo SDK 54, React Native 0.81, Expo Router 6, TypeScript |
| Backend mục tiêu | NestJS, TypeScript |
| Dữ liệu mục tiêu | PostgreSQL, Prisma ORM |
| Monorepo | pnpm Workspaces |
| Kiến trúc | Clean Architecture, feature-based modules |

## Kiến trúc tổng thể

```text
Next.js Web ─────┐
                 ├── REST API (NestJS) ── Prisma ── PostgreSQL
Expo Mobile ─────┘

        apps dùng chung kiểu dữ liệu và design tokens
                           │
                           ▼
                 packages/contracts
                 packages/design-tokens
                 packages/shared-kernel
```

Web và Mobile chỉ giao tiếp với NestJS API, không truy cập trực tiếp PostgreSQL. Backend được định hướng chia thành bốn lớp:

1. **Domain:** entity, value object và quy tắc nghiệp vụ thuần TypeScript.
2. **Application:** use case và interface giao tiếp với dữ liệu/dịch vụ.
3. **Infrastructure:** Prisma, PostgreSQL và các adapter bên ngoài.
4. **Presentation:** REST controller và DTO của NestJS.

## Cấu trúc thư mục

```text
English/
├── apps/
│   ├── api/                 # Backend skeleton và Prisma schema
│   ├── web/                 # Cổng Admin/Giảng viên và giao diện learner trên web
│   └── mobile/              # Ứng dụng học viên Expo/React Native
├── packages/
│   ├── contracts/           # API contracts và kiểu dữ liệu dùng chung
│   ├── design-tokens/       # Màu sắc, typography, spacing và radius
│   └── shared-kernel/       # Result, pagination và tiện ích thuần TypeScript
├── docs/                    # Yêu cầu, domain, kiến trúc và roadmap
├── pnpm-workspace.yaml
└── package.json
```

## Yêu cầu môi trường

- **Node.js `>= 20.19.4`** — yêu cầu của React Native 0.81.
- **pnpm `11.9.0`** — phiên bản được khai báo trong repository.
- **Expo Go** tương thích SDK 54 hoặc Android/iOS emulator để chạy Mobile.
- PostgreSQL chỉ cần thiết khi bắt đầu triển khai backend và persistence thật.

Kiểm tra phiên bản đang dùng:

```bash
node --version
pnpm --version
```

## Cài đặt

```bash
git clone <repository-url>
cd English
pnpm install
```

## Chạy dự án

### Web

```bash
pnpm --filter web dev
```

Mở [http://localhost:3000](http://localhost:3000). Trang đăng nhập nằm tại [http://localhost:3000/login](http://localhost:3000/login).

### Mobile

```bash
pnpm --filter mobile dev
```

Sau khi Expo khởi động:

- Quét mã QR bằng Expo Go để chạy trên thiết bị thật.
- Nhấn `a` để mở Android emulator.
- Nhấn `i` để mở iOS Simulator trên macOS.

Nếu Metro giữ cache cũ sau khi cập nhật dependency:

```bash
pnpm -C apps/mobile exec expo start --clear
```

### Backend

Backend chưa có NestJS application để khởi chạy. `apps/api` hiện chỉ là skeleton cho Prisma; cần triển khai API trước khi kết nối Web và Mobile.

### Swagger / OpenAPI

Đặc tả API nguồn nằm tại [`apps/api/openapi.yaml`](apps/api/openapi.yaml). File sử dụng OpenAPI 3.0.3 và có thể import trực tiếp vào [Swagger Editor](https://editor.swagger.io/) để xem tài liệu tương tác hoặc dùng làm contract khi triển khai NestJS.

Contract hiện bao phủ 16 nhóm tài nguyên, gồm xác thực, người dùng, hồ sơ và nhóm học viên, danh mục, nội dung học, câu hỏi, bài thi, lượt làm bài, tiến độ, báo cáo và gợi ý cá nhân hóa. Mỗi endpoint định nghĩa rõ:

- Quyền truy cập và JWT Bearer authentication.
- Path/query parameters, request body và response body.
- Kiểu dữ liệu, trường bắt buộc, giới hạn độ dài, enum và ví dụ.
- Phân trang, tìm kiếm, lọc và sắp xếp.
- Mã lỗi xác thực, phân quyền, validation, not found và conflict.
- Quy tắc server tự chấm bài và giữ snapshot kết quả lịch sử.

## Kiểm tra mã nguồn

Kiểm tra các package dùng chung:

```bash
pnpm typecheck
```

Kiểm tra riêng từng giao diện:

```bash
pnpm --filter web typecheck
pnpm --filter mobile typecheck
```

Build bản production của Web:

```bash
pnpm --filter web build
```

## Cấu hình PostgreSQL dự kiến

Sao chép `apps/api/.env.example` thành `apps/api/.env` và thay thông tin kết nối:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/techenglish?schema=public"
```

Không commit file `.env` hoặc thông tin đăng nhập thật lên repository.

## Trạng thái triển khai

| Hạng mục | Trạng thái |
| --- | --- |
| Web Admin/Giảng viên | Giao diện và luồng demo bằng mock data |
| Mobile học viên | Giao diện và điều hướng demo |
| Shared contracts/design tokens | Đã có nền tảng ban đầu |
| Swagger/OpenAPI contract | Đã định nghĩa contract v1 |
| NestJS API | Chưa triển khai |
| Prisma data model và migrations | Chưa triển khai |
| PostgreSQL integration | Chưa kết nối |
| Xác thực và RBAC thật | Chưa triển khai |
| AI personalization | Mới ở mức yêu cầu sản phẩm |

## Tài liệu chi tiết

- [Project brief](docs/00-project-brief.md)
- [Yêu cầu chức năng](docs/01-functional-requirements.md)
- [Domain model](docs/03-domain-model.md)
- [Cấu trúc dự án](docs/08-project-structure.md)
- [Tech stack](docs/16-tech-stack.md)
- [Clean Architecture](docs/17-clean-architecture.md)
- [Web Next.js](docs/19-web-nextjs.md)
- [Mobile React Native](docs/20-mobile-react-native.md)
- [PostgreSQL và Prisma](docs/22-postgresql-prisma.md)
- [Swagger/OpenAPI contract](apps/api/openapi.yaml)

## Roadmap gần nhất

1. Thiết kế Prisma models và migrations theo domain tài liệu.
2. Khởi tạo NestJS API theo các module nghiệp vụ.
3. Triển khai authentication và RBAC cho Admin, Giảng viên, Học viên.
4. Thay repository mock trên Web/Mobile bằng adapter gọi REST API.
5. Hoàn thiện lưu tiến độ, chấm điểm, báo cáo và gợi ý cá nhân hóa.
