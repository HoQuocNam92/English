# GÓI KIỂM CHỨNG CHƯƠNG 3 KHÓA LUẬN — TECHENGLISH PRO
## Verification Package for Thesis Chapter 3

> **Dự án:** TechEnglish Pro — Hệ thống học tiếng Anh chuyên ngành CNTT & Luyện thi chứng chỉ quốc tế  
> **Sinh viên thực hiện:** Hồ Quốc Nam (MSSV: 2001230536)  
> **Giảng viên hướng dẫn:** ThS. Huỳnh Thị Cẩm Dung  
> **Khoa:** Công nghệ Thông tin — Trường Đại học Công Thương TP.HCM (HUIT)  
> **Ngày đóng gói:** 09/09/2026  

---

## 1. Mục đích của gói kiểm chứng

Gói tài liệu và mã nguồn này được chuẩn bị độc lập nhằm mục đích phục vụ Hội đồng phản biện, Giảng viên hướng dẫn và các bên liên quan thực hiện **đối chiếu và kiểm chứng chính xác 100%** giữa:
1. Nội dung thiết kế hệ thống và cơ sở dữ liệu được trình bày trong **Chương 3 của Khóa luận tốt nghiệp**.
2. **Trạng thái thực tế** của hệ thống cơ sở dữ liệu, Prisma ORM, và các quy tắc nghiệp vụ đang vận hành trong dự án.

Toàn bộ thông tin nhạy cảm (`.env`, secrets, JWT keys, user data thật, credential dịch vụ thanh toán/mail) đã được loại trừ tuyệt đối để đảm bảo an toàn thông tin theo quy chuẩn học thuật.

---

## 2. Cấu trúc thư mục gói kiểm chứng

```
chapter3_verification_package/
├── database/
│   ├── schema.prisma                  # File Prisma Schema gốc định nghĩa toàn bộ 53 Models & 16 Enums
│   ├── database_schema.sql            # File DDL SQL hoàn chỉnh tạo 53 bảng trên PostgreSQL
│   ├── seed.ts                        # Script nạp dữ liệu mẫu hệ thống (Master data, RBAC, Vocab, Exams)
│   └── migrations/                    # Lịch sử migrations chính thức của Prisma
│       ├── 20260827115400_init_full_schema/
│       │   └── migration.sql          # Migration 1: Khởi tạo 32 bảng ban đầu
│       ├── 20260827150358_rbac_user_detail_split/
│       │   └── migration.sql          # Migration 2: Tách user_details và thêm 4 bảng RBAC (37 bảng)
│       └── migration_lock.toml
│
├── backend_services/                  # Mã nguồn chứa toàn bộ quy tắc nghiệp vụ (Business Rules)
│   ├── auth_rbac/                     # Tài khoản, xác thực JWT, bảo mật mật khẩu bcrypt, RBAC động
│   │   ├── auth.service.ts
│   │   ├── role.service.ts
│   │   ├── user.service.ts
│   │   ├── auth.controller.ts
│   │   ├── role.controller.ts
│   │   ├── permissions.guard.ts
│   │   └── jwt.strategy.ts
│   ├── learner_profile/               # Hồ sơ học viên, trình độ, mục tiêu nghề nghiệp, chứng chỉ
│   │   ├── learner-profile.service.ts
│   │   └── learner-profile.controller.ts
│   ├── lesson_vocabulary/             # Quản lý bài học kỹ thuật, blocks JSONB, từ vựng CNTT, IPA
│   │   ├── lesson.service.ts
│   │   ├── vocabulary.service.ts
│   │   ├── lesson.controller.ts
│   │   └── vocabulary.controller.ts
│   ├── taxonomy_certificates/         # Lĩnh vực CNTT (Domains), Cấp độ (Levels), Chứng chỉ quốc tế
│   │   ├── taxonomy.service.ts
│   │   └── taxonomy.controller.ts
│   ├── questions_exams/               # Ngân hàng câu hỏi, đề thi thử, snapshot bài thi, chấm điểm tự động
│   │   ├── question.service.ts
│   │   ├── exam.service.ts
│   │   ├── question.controller.ts
│   │   └── exam.controller.ts
│   ├── progress_roadmap_gamification/ # Tiến độ học tập, gợi ý AI, Daily Streak, Bảng xếp hạng EXP, Planner
│   │   ├── progress.service.ts
│   │   ├── recommendation.service.ts
│   │   ├── progress.controller.ts
│   │   ├── recommendation.controller.ts
│   │   ├── leaderboard.controller.ts
│   │   └── planner.controller.ts
│   ├── ai_interactive/                # Phỏng vấn kỹ thuật AI Mock Interview & Chấm bài viết AI Writing
│   │   ├── mock-interview.controller.ts
│   │   └── writing.controller.ts
│   └── payment_subscription/          # Đơn hàng VietQR SePay, Gói cước PRO, Mã giảm giá Voucher, Flash Sale, Redis Lock
│       ├── payment.service.ts
│       ├── payment.controller.ts
│       ├── voucher.controller.ts
│       ├── flash-sale.controller.ts
│       └── redis-lock.service.ts
│
├── models_dtos_contracts/             # Data Transfer Objects, TypeScript Contracts & Shared Kernel
│   ├── contracts/
│   │   ├── auth.ts
│   │   ├── pagination.ts
│   │   └── index.ts
│   ├── http_dto/
│   │   ├── auth.dto.ts
│   │   ├── content.dto.ts
│   │   ├── exam-attempt.dto.ts
│   │   ├── payment.dto.ts
│   │   ├── profile.dto.ts
│   │   ├── user.dto.ts
│   │   └── voucher.dto.ts
│   └── shared_kernel/
│       ├── pagination.ts
│       ├── result.ts
│       └── index.ts
│
└── config_framework/                  # Cấu hình Framework, Package Dependencies & Monorepo Workspace
    ├── root_package.json
    ├── root_pnpm-workspace.yaml
    ├── root_tsconfig.base.json
    ├── api_package.json               # Backend NestJS 11 + Prisma ORM 5.22 + PostgreSQL
    ├── api_tsconfig.json
    ├── web_package.json               # Frontend Web Next.js 15
    └── mobile_package.json            # Mobile App React Native / Expo SDK 54
```

---

## 3. Tóm tắt kết quả kiểm chứng nhanh

1. **Tổng số Model trong Prisma Schema:** **53 Models**
2. **Tổng số Bảng cơ sở dữ liệu thực tế:** **53 Bảng**
3. **Tổng số Kiểu Enum (PostgreSQL Custom Types):** **16 Enums**
4. **Tổng số Quan hệ Khóa ngoại (Foreign Keys):** **72 quan hệ Prisma / 71 ràng buộc FK vật lý SQL**
5. **Tổng số Ràng buộc Duy nhất (Unique Constraints):** **23 ràng buộc** (14 `@unique` đơn trường và 9 `@@unique` tổ hợp)
6. **Xác nhận số lượng bảng:** Hệ thống thực tế đang sử dụng **53 bảng**, **KHÔNG PHẢI 75 bảng**. Chi tiết chứng minh khoa học và nguồn gốc của các con số được giải trình đầy đủ trong báo cáo đính kèm [`chapter3_verification_report.md`](../chapter3_verification_report.md).
