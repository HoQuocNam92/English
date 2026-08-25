# TechEnglish Pro (KLCN028)

Chào mừng bạn đến với **TechEnglish Pro** — Nền tảng học tiếng Anh chuyên ngành CNTT và ôn luyện chứng chỉ quốc tế dành cho lập trình viên và kỹ sư phần mềm. Dự án được phát triển theo cấu trúc Monorepo hiện đại, sử dụng Clean Architecture để đảm bảo khả năng mở rộng, bảo trì và kiểm thử độc lập.

---

## 🗺️ Bản Đồ Kiến Trúc & Công Nghệ

Hệ thống được tổ chức dưới dạng **Monorepo** quản lý bởi **PNPM Workspaces**:

```text
                        ┌───────────────────┐
                        │    Next.js Web    │ (Admin/Teacher Portal)
                        └─────────┬─────────┘
                                  │ (HTTP REST API)
                                  ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│   React Native    ├──>│    NestJS API     ├──>│   Prisma ORM &    │
│    Learner App    │   │ (Clean Architecture)  │    PostgreSQL     │
└───────────────────┘   └───────────────────┘   └───────────────────┘
```

### 1. Phân chia ứng dụng (`apps/`)
* **`apps/api`**: RESTful API Backend xây dựng trên **NestJS** + **TypeScript**. Sử dụng **Prisma ORM** kết nối tới cơ sở dữ liệu **PostgreSQL**.
* **`apps/web`**: Giao diện Web xây dựng trên **Next.js (App Router)** dành cho Admin & Giảng viên để soạn giáo trình, bài học, ngân hàng câu hỏi, quản lý học viên và xem báo cáo.
* **`apps/mobile`**: Ứng dụng di động xây dựng trên **React Native (Expo SDK 51)** dành cho học viên ôn luyện từ vựng, flashcard, làm bài thi thử và theo dõi tiến độ.

### 2. Các gói dùng chung (`packages/`)
* **`packages/contracts`**: Định nghĩa các API Contracts, kiểu dữ liệu Pure TypeScript được chia sẻ giữa Backend, Web và Mobile.
* **`packages/design-tokens`**: Các định nghĩa về màu sắc, khoảng cách, font chữ dùng chung giữa Web và Mobile.
* **`packages/shared-kernel`**: Chứa các hàm tiện ích, cấu trúc dữ liệu cơ bản dùng chung, độc lập hoàn toàn với framework.

---

## 🏗️ Kiến Trúc Sạch (Clean Architecture)

Hệ thống tuân thủ nghiêm ngặt nguyên lý **Clean Architecture** với hướng đi của Dependency từ ngoài vào trong:

$$\text{Presentation} \longrightarrow \text{Application} \longrightarrow \text{Domain}$$

* **Domain Layer (Core)**: Chứa các Entity, Value Object độc lập hoàn toàn với framework (không chứa NestJS, Next.js, React Native hay Prisma decorator).
* **Application Layer**: Chứa các Use Case (nghiệp vụ hệ thống) và các Port (Interface) cho Repository.
* **Infrastructure Layer**: Hiện thực hóa (Implementation) các Port của Application. Chứa Prisma Client, cấu hình database PostgreSQL, kết nối các dịch vụ thứ ba.
* **Presentation Layer**: Điểm giao tiếp với người dùng gồm NestJS Controller, Next.js Pages, React Native Screens.

---

## ⚙️ Yêu Cầu Hệ Thống (Prerequisites)

Trước khi bắt đầu cài đặt, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
* **Node.js**: Phiên bản `>= 18.x` (Khuyến nghị sử dụng bản LTS mới nhất).
* **PNPM**: Trình quản lý gói chính của dự án (phiên bản `>= 9.x`).
  * Cài đặt qua npm: `npm install -g pnpm`
* **PostgreSQL**: Cơ sở dữ liệu chính (có thể chạy local hoặc qua Docker).
* **Expo Go / Emulator**:
  * Thiết bị iOS/Android chạy app **Expo Go** (để test trên máy thật).
  * Hoặc Android Studio (Android Emulator) / Xcode (iOS Simulator) trên máy tính.

---

## 🚀 Hướng Dẫn Cài Đặt (Installation)

### Bước 1: Clone mã nguồn dự án
```bash
git clone <repository_url>
cd English
```

### Bước 2: Cài đặt Dependencies cho toàn bộ Monorepo
Chạy duy nhất một lệnh tại thư mục gốc để pnpm tự động phân tích và cài đặt thư viện cho tất cả các app và package con:
```bash
pnpm install
```

---

## 💻 Hướng Dẫn Chạy Ứng Dụng (Running the Apps)

Tất cả lệnh chạy dự án đều có thể thực hiện trực tiếp từ thư mục gốc thông qua lệnh lọc (`--filter`) của pnpm:

### 1. Khởi chạy Web Portal (Next.js)
```bash
pnpm --filter "web" run dev
```
* Ứng dụng Web sẽ hoạt động tại địa chỉ: 👉 [**http://localhost:3000**](http://localhost:3000)

### 2. Khởi chạy Mobile App (Expo / React Native)
Để khởi động môi trường Expo:
```bash
pnpm --filter "mobile" run dev
```
* **Lưu ý**: Nếu gặp lỗi bộ nhớ đệm hoặc mới cập nhật thư viện, bạn nên chạy lệnh xóa cache:
  ```bash
  pnpm --filter "mobile" run dev -c
  ```
* **Cách mở app**:
  * Nhấn phím **`a`** để mở trên máy ảo Android (Pixel/Android Emulator).
  * Nhấn phím **`i`** để mở trên máy ảo iOS.
  * Quét mã QR hiển thị trên màn hình bằng ứng dụng **Expo Go** trên điện thoại để test máy thật.

### 3. Khởi chạy Backend API (NestJS)
*(Sau khi đã thiết lập cơ sở dữ liệu)*
```bash
pnpm --filter "api" run dev
```
* API của bạn sẽ chạy tại địa chỉ mặc định: 👉 `http://localhost:3080/api` (hoặc cấu hình trong `.env`).

---

## 🗄️ Thiết Lập Cơ Sở Dữ Liệu (PostgreSQL & Prisma)

### 1. Thiết lập biến môi trường
Tạo file `.env` trong thư mục `apps/api/` dựa trên file `.env.example`:
```env
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<db_name>?schema=public"
```

### 2. Đồng bộ Database & Sinh Prisma Client
Tại thư mục gốc, chạy các lệnh sau để định hình dữ liệu:
```bash
# Định dạng lại schema prisma
pnpm --filter "api" exec prisma format

# Kiểm tra tính hợp lệ của schema
pnpm --filter "api" exec prisma validate

# Áp dụng migration để tạo bảng trong PostgreSQL
pnpm --filter "api" exec prisma migrate dev --name init

# Sinh mã nguồn Prisma Client tương ứng
pnpm --filter "api" exec prisma generate
```

---

## 🛠️ Quy Trình & Kế Hoạch Phát Triển Tiếp Theo (Roadmap)

Dự án hiện tại đang hoàn thiện giao diện Client & Admin. Các bước tiếp theo cần triển khai bao gồm:

### 🚀 1. Phát triển Cơ sở dữ liệu (PostgreSQL + Prisma)
- [ ] Thiết kế cơ sở dữ liệu chi tiết trong `apps/api/prisma/schema.prisma`.
- [ ] Xây dựng các Model: `User`, `Role`, `LearnerProfile`, `Level` (CEFR), `Lesson`, `Vocabulary`, `Question` (Trắc nghiệm, Tình huống, Đọc hiểu), `Exam`, `Progress`.
- [ ] Viết script Seed dữ liệu mẫu (`apps/api/prisma/seed.ts`) cho các vai trò và hệ thống từ vựng chuyên ngành.

### 🔌 2. Phát triển API Backend (NestJS)
- [ ] Xây dựng mô hình Authentication & Authorization (RBAC: Admin, Teacher, Learner).
- [ ] Phát triển các Use Cases quản lý nội dung học (Tạo/Sửa bài học, câu hỏi, đề thi).
- [ ] Phát triển công cụ chấm điểm tự động và lưu lịch sử làm bài thi thử của Học viên.

### 📱 3. Tích hợp & Kiểm thử (Integration)
- [ ] Kết nối Next.js Web và Expo Mobile tới NestJS API Backend thay cho dữ liệu Mock hiện tại.
- [ ] Tích hợp tính năng phát âm âm thanh (Audio IPA) và các bài học tương tác.
- [ ] Thực hiện kiểm thử tích hợp (Integration Tests) bảo đảm tính chính xác của luồng chấm điểm và lưu tiến độ học tập.
