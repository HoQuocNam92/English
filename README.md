# TechEnglish Pro 🚀

<p align="center">
  <strong>Nền tảng học tiếng Anh chuyên ngành IT & Luyện thi Chứng chỉ Quốc tế</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.5-black?logo=nextdotjs" />
  <img src="https://img.shields.io/badge/Expo-SDK%2054-white?logo=expo&logoColor=black" />
  <img src="https://img.shields.io/badge/NestJS-11.2-ea2845?logo=nestjs" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma" />
  <img src="https://img.shields.io/badge/pnpm-11.9-F69220?logo=pnpm&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" />
</p>

---

## 📌 Giới thiệu Dự Án

**TechEnglish Pro** (KLCN028) là hệ thống học tiếng Anh kỹ thuật chuyên sâu dành cho sinh viên và kỹ sư phần mềm (Backend, Frontend, DevOps, Cloud, Security, Data). Nền tảng được thiết kế cho 3 nhóm người dùng: **Admin**, **Giảng viên** và **Học viên**.

Hệ thống kết hợp lộ trình học cá nhân hóa, từ vựng theo chuyên ngành, bài học kỹ thuật chuẩn hóa, cùng hệ thống thi thử chứng chỉ (AWS, Kubernetes CKA, CompTIA Security+...) có chấm điểm tự động và theo dõi tiến độ chi tiết.

---

## 🔥 Tính Năng Nổi Bật

### 1. Học viên (App Mobile Expo)
- **Onboarding Cá Nhân Hóa**: Thiết lập trình độ, lĩnh vực IT quan tâm, mục tiêu nghề nghiệp và chứng chỉ quốc tế.
- **Học Từ Vựng & Kỹ Thuật**: Flashcard từ vựng kèm phát âm IPA, câu ví dụ thực tế và tài liệu API.
- **Theo Dõi Tiến Độ**: Lưu vết hoàn thành bài học real-time, biểu đồ thành thạo theo chuyên ngành.
- **Thi Thử Chứng Chỉ**: Đề thi thời gian thực, tự động chấm điểm, lưu lịch sử lượt làm bài (phân trang 10 bài/trang) và đáp án chi tiết.
- **Nâng Cấp Gói PRO (VietQR / SePay)**: Tích hợp cổng thanh toán VietQR quét mã tự động, hiển thị thông tin gói PRO và lịch sử đơn hàng.
- **Quên Mật Khẩu Qua Email**: Khôi phục mật khẩu 2 bước qua mã OTP gửi về Email (kèm chế độ Dev Fallback console log).

### 2. Quản Trị & Giảng Viên (Web Portal Next.js 15)
- **Đăng Nhập Phân Quyền RBAC**: Hỗ trợ 3 vai trò chính (`admin`, `teacher`, `learner`) và custom permissions.
- **Quản Lý Bài Học & Từ Vựng**: Tạo, sửa, xuất bản nội dung bài học, thuật ngữ và ví dụ.
- **Ngân Hàng Câu Hỏi & Đề Thi**: Thiết lập bộ đề thi, trọng số câu hỏi, thời gian làm bài và điểm đạt.
- **Quản Lý Học Viên & Nhóm Lớp**: Giảng viên tạo nhóm lớp, gán chứng chỉ mục tiêu và xem báo cáo kết quả thi.

### 3. Backend REST API & Database (NestJS & Prisma)
- **NestJS Clean Architecture**: Phân lớp rõ ràng (Presentation, Application, Domain, Infrastructure).
- **Phân Trang Chuẩn REST**: Áp dụng phân trang metadata `{ data, meta: { total, page, limit, totalPages } }` cho toàn bộ danh sách.
- **Thanh Toán SePay & Auto Webhook**: Xác thực Webhook HMAC SHA256 an toàn, tự động kích hoạt gói PRO.
- **Email Service (Nodemailer)**: Tự động gửi OTP khôi phục mật khẩu qua SMTP, hỗ trợ Dev Fallback mượt mà.

---

## 🛠 Công Nghệ Sử Dụng

| Thành phần | Công nghệ / Thư viện |
|---|---|
| **Web Frontend** | Next.js 15, React 19, Tailwind CSS v4, TypeScript |
| **Mobile App** | Expo SDK 54, React Native 0.81, Expo Router v6, TypeScript |
| **Backend API** | NestJS 11, TypeScript, Nodemailer, Cloudinary, SePay SDK |
| **Database** | PostgreSQL 16, Prisma ORM 5.22 (33 models) |
| **Monorepo** | pnpm Workspaces 11.9.0 |
| **API Contract** | OpenAPI 3.0.3 (Swagger UI) |

---

## 📁 Cấu Trúc Dự Án

```
English/
├── apps/
│   ├── api/                        # NestJS Backend API (Port 8080)
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Full 33 tables schema
│   │   │   └── seed.ts             # Seed database data (Accounts, Pro plans, Lessons, Exams)
│   │   ├── src/
│   │   │   ├── application/        # Use cases (Auth, Exams, Progress, Payment, Upload)
│   │   │   ├── domain/             # Entities & business rules
│   │   │   ├── infrastructure/     # Prisma, Email, Storage, Auth Guards
│   │   │   ├── presentation/       # REST Controllers & DTOs
│   │   │   └── modules/            # NestJS Feature Modules
│   │   └── .env                    # Environment configuration
│   ├── web/                        # Next.js 15 Web Portal (Admin & Teacher) (Port 3000)
│   └── mobile/                     # Expo React Native Learner App
├── packages/
│   ├── contracts/                  # Shared API contracts & TypeScript interfaces
│   ├── design-tokens/              # Design tokens (Colors, Spacing, Radius)
│   └── shared-kernel/              # AppError, Result<T>, Pagination helpers
├── docs/                           # Architecture specs & guidelines
└── README.md
```

---

## 🔑 Tài Khoản Demo & Seed Data

Sau khi chạy lệnh `db:seed`, hệ thống khởi tạo sẵn các tài khoản thử nghiệm:

| Tài khoản | Mật khẩu | Vai trò | Gói dịch vụ | Ghi chú |
|---|---|---|---|---|
| `admin@techenglish.pro` | `Demo@123456` | **Admin** | **PRO Lifetime** | Quyền quản trị tối cao |
| `nguyen.thanh@techenglish.pro` | `Demo@123456` | **Teacher** | Standard | Giảng viên Cloud & DevOps |
| `tran.minh@techenglish.pro` | `Demo@123456` | **Teacher** | Standard | Giảng viên Security & Networking |
| `learner1@techenglish.pro` | `Demo@123456` | **Learner** | **PRO Yearly** | Backend Dev, AWS-SAA |
| `learner2@techenglish.pro` | `Demo@123456` | **Learner** | Standard | DevOps Intern, CKA |
| `learner3@techenglish.pro` | `Demo@123456` | **Learner** | Standard | Security Analyst, Security+ |

---

## ⚡ Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Yêu cầu môi trường
- Node.js >= 20.19.0
- pnpm >= 11.9.0
- PostgreSQL >= 15

### 2. Cài đặt Dependencies
```bash
# Clone repository
git clone git@github.com:HoQuocNam92/English.git
cd English

# Cài đặt toàn bộ node_modules
pnpm install
```

### 3. Cấu hình Môi trường (`.env`)
Tạo file `apps/api/.env` từ file mẫu:
```bash
# Windows PowerShell
copy apps\api\.env.example apps\api\.env
```

Nội dung cấu hình trong `apps/api/.env`:
```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/techenglish?schema=public"
JWT_SECRET=techenglish-super-secret-jwt-key-change-in-production-2026
PORT=8080
NODE_ENV=development

# SMTP Email Configuration (Dùng cho Quên Mật Khẩu OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="TechEnglish Pro" <no-reply@techenglish.pro>

# SePay VietQR Payment Gateway
SEPAY_BANK_NAME=VIETINBANK
SEPAY_BANK_ACC=105886719416
SEPAY_ACCOUNT_NAME=HO QUOC NAM
```

### 4. Khởi tạo Cơ sở dữ liệu & Seed Data
```bash
# Đẩy schema vào Database
pnpm --filter @techenglish/api run db:push

# Generate Prisma Client
pnpm --filter @techenglish/api run db:generate

# Nạp dữ liệu seed
pnpm --filter @techenglish/api run db:seed
```

### 5. Khởi chạy Ứng dụng

**Chạy API Server (NestJS - Port 8080):**
```bash
pnpm --filter @techenglish/api run dev
```

**Chạy Web Portal (Next.js 15 - Port 3000):**
```bash
pnpm --filter web dev
```

**Chạy Mobile App (Expo SDK 54):**
```bash
pnpm --filter mobile dev
```

---

## 🧪 Lệnh Kiểm Tra & Build

```bash
# Typecheck TypeScript cho toàn bộ project
pnpm --filter mobile run typecheck

# Build NestJS API
pnpm --filter @techenglish/api run build

# Xem dữ liệu trực quan bằng Prisma Studio (Port 5555)
pnpm --filter @techenglish/api run db:studio
```

---

## 📄 Giấy Phép (License)

Dự án thuộc bản quyền **KLCN028 TechEnglish Pro**. Mọi quyền được bảo lưu.
