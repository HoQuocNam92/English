# TechEnglish Pro 🚀

<p align="center">
  <strong>Nền tảng học tiếng Anh chuyên ngành IT & Luyện thi Chứng chỉ Quốc tế</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/T%C3%A1c%20gi%E1%BA%A3-Qu%E1%BB%91c%20Nam-blue?style=for-the-badge&logo=github" />
  <img src="https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/Expo-SDK%2054-white?style=for-the-badge&logo=expo&logoColor=black" />
  <img src="https://img.shields.io/badge/NestJS-11.2-ea2845?style=for-the-badge&logo=nestjs" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/pnpm-11.9-F69220?style=for-the-badge&logo=pnpm&logoColor=white" />
</p>

---

## 👨‍💻 Tác Giả & Bản Quyền
- **Tác giả chính**: **Quốc Nam** ([@HoQuocNam92](https://github.com/HoQuocNam92))
- **Dự án**: Khóa luận tốt nghiệp / Đồ án hệ thống **TechEnglish Pro (KLCN028)**
- **Bản quyền**: © 2026 **Quốc Nam**. Mọi quyền được bảo lưu.

---

## 📌 Giới Thiệu Dự Án

**TechEnglish Pro** là hệ thống phần mềm hỗ trợ học tiếng Anh chuyên ngành CNTT dành cho sinh viên, lập trình viên và kỹ sư phần mềm (Backend, Frontend, DevOps, Cloud, Security, Data Engineering).

Hệ thống được phát triển trên kiến trúc Monorepo hiện đại, phục vụ cho **3 nhóm người dùng**:
1. **Admin (Quản trị viên)**: Quản lý người dùng, phân quyền RBAC, quản lý nội dung bài học, ngân hàng đề thi và cấu hình hệ thống.
2. **Giảng viên (Teacher)**: Tạo bài học, từ vựng, quản lý nhóm học viên, tạo đề thi thử và theo dõi kết quả thi của học viên.
3. **Học viên (Learner)**: Học bài học kỹ thuật, làm flashcard từ vựng, thực hành quiz, thi thử chứng chỉ quốc tế (AWS, CKA, Security+), theo dõi tiến độ và nâng cấp gói PRO.

---

## 🔥 Các Tính Năng Chính

### 1. 📱 Ứng Dụng Mobile Học Viên (React Native / Expo SDK 54)
- **Onboarding & Cá nhân hóa**: Lựa chọn trình độ (Beginner → Professional), chuyên ngành IT (Cloud, DevOps, Security...), mục tiêu nghề nghiệp và chứng chỉ mục tiêu.
- **Học Bài Học & Từ Vựng**: Giao diện đọc bài học kỹ thuật, học thuật ngữ kèm phát âm IPA, câu ví dụ thực tế và tài liệu API.
- **Lưu Tiến Độ Thực Tế**: Tự động lưu vết bài học đã hoàn thành real-time, đánh dấu hoàn thành và cập nhật phần trăm tiến độ từng chuyên ngành.
- **Luyện Thi Chứng Chỉ & Lịch Sử Làm Bài**: Thi thử với bộ đề thời gian thực, tự động chấm điểm, lưu lịch sử lượt thi có phân trang (`10 bài/trang`) kèm xem lại đáp án từng câu.
- **Nâng Cấp Gói PRO (VietQR / SePay)**: Tích hợp cổng thanh toán VietQR chuyển khoản ngân hàng tự động, hiển thị trạng thái PRO và lịch sử đơn hàng.
- **Quên Mật Khẩu Qua Email**: Tính năng khôi phục mật khẩu 2 bước gửi mã OTP 6 số qua Email (kèm chế độ Dev Fallback console log khi chưa có SMTP).

### 2. 💻 Desktop Portal Quản Trị & Giảng Viên (Next.js 15 Web)
- **Xác Thực & Phân Quyền Enterprise (RBAC)**: Đăng nhập JWT, quản lý 3 vai trò hệ thống (`admin`, `teacher`, `learner`) và phân quyền chi tiết (Permissions).
- **Quản Lý Bài Học & Từ Vựng**: Giao diện tạo/sửa bài học rich text, gán từ vựng chuyên ngành, quản lý cấp độ và lĩnh vực.
- **Ngân Hàng Câu Hỏi & Tạo Đề Thi**: Quản lý câu hỏi trắc nghiệm/tình huống, tạo đề thi cài đặt thời gian, trọng số điểm và điểm đạt.
- **Quản Lý Nhóm Lớp Học Viên**: Giảng viên tạo lớp học, gán chứng chỉ mục tiêu và theo dõi bảng điểm học viên.

### 3. ⚙️ Backend REST API (NestJS 11 & Prisma 5)
- **Clean Architecture 4 Lớp**: Presentation → Application → Domain → Infrastructure.
- **Chuẩn Phân Trang Metadata**: Tất cả API danh sách đều hỗ trợ phân trang chuẩn `{ data, meta: { total, page, limit, totalPages } }`.
- **Xác Thực Thanh Toán SePay Webhook**: Kiểm tra chữ ký HMAC SHA256 an toàn, tự động kích hoạt gói PRO ngay sau khi nhận tiền chuyển khoản.
- **Dịch Vụ Email Nodemailer**: Tự động gửi email OTP khôi phục mật khẩu chuẩn HTML responsive.

---

## 🛠 Công Nghệ Sử Dụng

| Thành phần | Công nghệ / Thư viện |
|---|---|
| **Tác giả** | **Quốc Nam** |
| **Web Frontend** | Next.js 15.5, React 19, Tailwind CSS v4, TypeScript |
| **Mobile App** | Expo SDK 54, React Native 0.81, Expo Router v6, TypeScript |
| **Backend API** | NestJS 11.2, TypeScript, Nodemailer, Cloudinary, SePay SDK |
| **Database** | PostgreSQL 16, Prisma ORM 5.22 (33 models) |
| **Monorepo** | pnpm Workspaces 11.9.0 |
| **API Contract** | OpenAPI 3.0.3 (Swagger UI) |

---

## 📁 Cấu Trúc Thư Mục Monorepo

```
English/
├── apps/
│   ├── api/                        # NestJS Backend API (Port 8080)
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # 33 bảng PostgreSQL
│   │   │   └── seed.ts             # Dữ liệu seed (Tài khoản, Bài học, Đề thi, Gói PRO)
│   │   ├── src/
│   │   │   ├── application/        # Use cases (Auth, Exams, Progress, Payment, Upload)
│   │   │   ├── domain/             # Entities & Quy tắc nghiệp vụ
│   │   │   ├── infrastructure/     # Prisma, Email Service, Storage, Auth Guards
│   │   │   └── presentation/       # Controllers & DTOs
│   │   └── .env                    # Biến môi trường Backend
│   ├── web/                        # Next.js 15 Web Portal (Admin & Teacher) (Port 3000)
│   └── mobile/                     # Expo React Native Learner App
├── packages/
│   ├── contracts/                  # Type interface & API Contract dùng chung
│   ├── design-tokens/              # Màu sắc, Spacing, Radius chuẩn
│   └── shared-kernel/              # Result<T>, AppError, Pagination helpers
├── docs/                           # Tài liệu thiết kế kiến trúc
└── README.md                       # Tài liệu hướng dẫn dự án (Quốc Nam)
```

---

## 🔑 Danh Sách Tài Khoản Demo & Seed Data

Sau khi chạy lệnh `db:seed`, hệ thống khởi tạo sẵn các tài khoản thử nghiệm:

| Tài khoản | Mật khẩu | Vai trò | Trạng thái Gói | Ghi chú |
|---|---|---|---|---|
| `admin@techenglish.pro` | `Demo@123456` | **Admin** | **PRO Lifetime** | Quản trị viên hệ thống |
| `nguyen.thanh@techenglish.pro` | `Demo@123456` | **Teacher** | Standard | Giảng viên Cloud & DevOps |
| `tran.minh@techenglish.pro` | `Demo@123456` | **Teacher** | Standard | Giảng viên Security & Networking |
| `learner1@techenglish.pro` | `Demo@123456` | **Learner** | **PRO Yearly** | Backend Dev (Mục tiêu AWS-SAA) |
| `learner2@techenglish.pro` | `Demo@123456` | **Learner** | Standard | DevOps Intern (Mục tiêu CKA) |
| `learner3@techenglish.pro` | `Demo@123456` | **Learner** | Standard | Security Analyst (Mục tiêu Security+) |

---

## ⚡ Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Yêu cầu môi trường
- **Node.js**: `>= 20.19.0`
- **pnpm**: `>= 11.9.0`
- **PostgreSQL**: `>= 15`

### 2. Cài đặt Dependencies
```bash
# Clone repository của Quốc Nam
git clone git@github.com:HoQuocNam92/English.git
cd English

# Cài đặt toàn bộ thư viện trong Monorepo
pnpm install
```

### 3. Cấu hình File Môi Trường (`.env`)
Copy file môi trường mẫu:
```bash
# Trên Windows PowerShell
copy apps\api\.env.example apps\api\.env
```

Nội dung cấu hình trong file `apps/api/.env`:
```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/techenglish?schema=public"
JWT_SECRET=techenglish-super-secret-jwt-key-change-in-production-2026
PORT=8080
NODE_ENV=development

# Cấu hình SMTP Email (Dùng cho tính năng Quên Mật Khẩu OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="TechEnglish Pro" <no-reply@techenglish.pro>

# Cấu hình Cổng Thanh Toán SePay VietQR
SEPAY_BANK_NAME=VIETINBANK
SEPAY_BANK_ACC=105886719416
SEPAY_ACCOUNT_NAME=HO QUOC NAM
```

### 4. Khởi Tạo Cơ Sở Dữ Liệu & Seed Data
```bash
# Đồng bộ Schema vào PostgreSQL Database
pnpm --filter @techenglish/api run db:push

# Tạo Prisma Client
pnpm --filter @techenglish/api run db:generate

# Nạp dữ liệu Seed mẫu (User, Bài học, Đề thi, Gói PRO)
pnpm --filter @techenglish/api run db:seed
```

### 5. Khởi Chạy Các Ứng Dụng

**Khởi chạy NestJS API Server (Port 8080):**
```bash
pnpm --filter @techenglish/api run dev
```

**Khởi chạy Web Portal Admin & Teacher (Next.js 15 - Port 3000):**
```bash
pnpm --filter web dev
```

**Khởi chạy App Mobile Học Viên (Expo React Native):**
```bash
pnpm --filter mobile dev
```

---

## 🧪 Các Lệnh Kiểm Tra & Phân Tích Code

```bash
# Kiểm tra lỗi kiểu dữ liệu TypeScript ứng dụng Mobile
pnpm --filter mobile run typecheck

# Build kiểm tra ứng dụng NestJS API
pnpm --filter @techenglish/api run build

# Xem và quản lý cơ sở dữ liệu giao diện trực quan Prisma Studio (Port 5555)
pnpm --filter @techenglish/api run db:studio
```

---

## 📜 Giấy Phép & Bản Quyền

Dự án **TechEnglish Pro** được phát triển và thuộc sở hữu toàn quyền của **Quốc Nam**.

- **Tác giả**: **Quốc Nam** ([@HoQuocNam92](https://github.com/HoQuocNam92))
- **Email liên hệ**: hoquocnam92@gmail.com
