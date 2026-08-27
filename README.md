# TechEnglish Pro

<p align="center">
  <strong>Hệ thống học tiếng Anh chuyên ngành IT cho sinh viên & kỹ sư phần mềm</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs" />
  <img src="https://img.shields.io/badge/Expo-SDK%2054-white?logo=expo&logoColor=black" />
  <img src="https://img.shields.io/badge/NestJS-10-ea2845?logo=nestjs" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma" />
  <img src="https://img.shields.io/badge/pnpm-11.9-F69220?logo=pnpm&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" />
</p>

---

TechEnglish Pro la nen tang hoc tieng Anh ky thuat chuyen sau danh cho ba nhom nguoi dung: **Admin**, **Giang vien** va **Hoc vien**. He thong cung cap lo trinh hoc ca nhan hoa theo domain IT, muc tieu nghe nghiep, chung chi quoc te, cung tinh nang thi thu va cham diem tu dong.

## Tinh nang chinh

### Desktop Cong Admin & Giang vien (Web)

- Dang nhap, phan quyen RBAC (admin / teacher / learner)
- Quan ly bai hoc, tu vung, ngan hang cau hoi, noi dung on chung chi
- Tao nhom hoc vien, gan chung chi muc tieu, theo doi tien do
- Tao de thi, cau hinh thoi gian & diem dat; xem ket qua & lich su
- Dashboard bao cao tien do hoc vien

### Mobile Ung dung Hoc vien (Mobile)

- Onboarding: trinh do, domain IT, muc tieu nghe nghiep, chung chi dich
- Hoc bai hoc ky thuat, tu vung chuyen nganh, flashcard, tai lieu API
- Quiz, bai tap tinh huong, de thi thu chung chi
- Diem so, giai thich dap an, lich su lam bai, tien do ca nhan
- Goi y bai hoc & de thi ca nhan hoa dua tren diem yeu va muc tieu

### Backend & Database

- **NestJS** theo **Clean Architecture** (Domain -> Application -> Infrastructure -> Presentation)
- **PostgreSQL 16** voi **Prisma ORM 5** — schema day du 32 bang, migration da ap dung
- **OpenAPI 3.0** contract 2800+ dong cho toan bo REST API
- Snapshot cau hoi tai thoi diem thi (JSONB) de bao toan lich su lam bai
- JWT refresh-token rotation, RBAC ba cap

---

## Cong nghe

| Thanh phan | Stack |
|---|---|
| **Web** | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| **Mobile** | Expo SDK 54, React Native 0.81, Expo Router 6, TypeScript |
| **Backend** | NestJS 10, TypeScript — Clean Architecture |
| **Database** | PostgreSQL 16, Prisma ORM 5.22 |
| **Monorepo** | pnpm 11 Workspaces |
| **API Spec** | OpenAPI 3.0.3 (Swagger) |

---

## Kien truc

```
Next.js Web ────┐
                ├──▶  NestJS REST API  ──▶  Prisma  ──▶  PostgreSQL
Expo Mobile ────┘
                           │
                  packages/contracts       ← API types dung chung
                  packages/design-tokens  ← mau, spacing, radius
                  packages/shared-kernel  ← Result<T>, pagination
```

Backend chia thanh bon lop tach biet hoan toan:

```
Presentation   ← HTTP request/response (Controller, DTO, Guard)
Application    ← Use cases, Interfaces (Port)
Domain         ← Entity, Value Object, Domain Rule (pure TypeScript)
Infrastructure ← Prisma adapter, PostgreSQL, External Services
```

---

## Cau truc thu muc

```
TechEnglish-Pro/
├── apps/
│   ├── api/                        # NestJS backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # 32 models, full schema
│   │   │   ├── seed.ts             # Seed data (levels, domains, users...)
│   │   │   └── migrations/         # Migration khoi tao da ap dung
│   │   ├── src/
│   │   │   ├── modules/            # Feature modules (chua implement)
│   │   │   └── shared/             # Guards, interceptors, pipes
│   │   ├── openapi.yaml            # OpenAPI 3.0 contract (2800+ dong)
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── web/                        # Next.js 15 — Admin & Teacher portal
│   └── mobile/                     # Expo SDK 54 — Learner app
├── packages/
│   ├── contracts/                  # Kieu du lieu & API contract dung chung
│   ├── design-tokens/              # Mau sac, typography, spacing
│   └── shared-kernel/              # Result<T>, AppError, pagination
├── docs/                           # 23 tai lieu thiet ke & kien truc
├── pnpm-workspace.yaml
└── package.json
```

---

## Database — 32 bang PostgreSQL

| Nhom | Bang | Mo ta |
|---|---|---|
| Auth | `users`, `refresh_tokens` | Tai khoan & JWT rotation |
| Master data | `levels`, `domains`, `career_goals`, `certificates`, `certificate_domains` | Danh muc he thong |
| Learner profile | `learner_profiles` + 3 bang noi | Ho so, domain, muc tieu, chung chi dich |
| Groups | `learner_groups`, `learner_group_members` | Lop hoc & thanh vien |
| Vocabulary | `vocabularies`, `vocabulary_examples` | Tu vung chuyen nganh |
| Lessons | `lessons`, `lesson_sections`, `lesson_vocabularies`, `lesson_certificates`, `certification_contents` | Bai hoc & noi dung |
| Questions | `questions`, `question_options`, `question_certificates` | Ngan hang cau hoi |
| Exams | `exams`, `exam_questions` | De thi |
| Attempts | `exam_attempts` (JSONB snapshot), `attempt_answers`, `attempt_answer_options` | Luot lam bai |
| Progress | `learning_progress`, `progress_summary_cache` | Tien do hoc tap |
| AI | `recommendations`, `recommendation_feedbacks` | Goi y ca nhan hoa |

---

## Yeu cau moi truong

| Cong cu | Phien ban |
|---|---|
| Node.js | `>= 20.19.4` |
| pnpm | `11.9.0` |
| PostgreSQL | `>= 15` |
| Expo Go | SDK 54 |

```bash
node --version   # v20+
pnpm --version   # 11.9.0
```

---

## Cai dat & Chay

### 1. Clone va cai dependencies

```bash
git clone git@github.com:HoQuocNam92/English.git
cd English
pnpm install
```

### 2. Cau hinh moi truong

```bash
# Windows
copy apps\api\.env.example apps\api\.env

# macOS / Linux
cp apps/api/.env.example apps/api/.env
```

Chinh `apps/api/.env` voi thong tin PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/techenglish?schema=public"
```

> Khong commit file `.env` len repository.

### 3. Khoi tao database

```bash
# Tao toan bo 32 bang
pnpm --filter @techenglish/api db:migrate:dev

# Generate Prisma Client
pnpm --filter @techenglish/api db:generate

# Seed du lieu mau
pnpm --filter @techenglish/api db:seed
```

Sau khi seed, tai khoan demo:

| Tai khoan | Mat khau | Vai tro |
|---|---|---|
| `admin@techenglish.pro` | `Demo@123456` | Admin |
| `teacher@techenglish.pro` | `Demo@123456` | Giang vien |
| `learner1@techenglish.pro` | `Demo@123456` | Hoc vien |
| `learner2@techenglish.pro` | `Demo@123456` | Hoc vien |

Xem data truc quan:

```bash
pnpm --filter @techenglish/api db:studio
# → http://localhost:5555
```

### 4. Chay ung dung

**Web (Admin & Teacher portal):**

```bash
pnpm --filter web dev
# → http://localhost:3000
```

**Mobile (Learner app):**

```bash
pnpm --filter mobile dev
# Quet QR bang Expo Go | nhan `a` Android | nhan `i` iOS
```

Xoa Metro cache neu can:

```bash
pnpm -C apps/mobile exec expo start --clear
```

---

## Swagger / OpenAPI

Contract API nam tai [`apps/api/openapi.yaml`](apps/api/openapi.yaml) — OpenAPI 3.0.3, hon 2 800 dong, bao phu **16 nhom tai nguyen**: Auth, Users, Learner Profiles, Domains, Levels, Career Goals, Certificates, Learner Groups, Vocabulary, Lessons, Questions, Exams, Exam Attempts, Learning Progress, Reports, Recommendations, Dashboard.

Import vao [Swagger Editor](https://editor.swagger.io/) de xem tai lieu tuong tac.

---

## Scripts huu ich

```bash
# Typecheck
pnpm typecheck
pnpm --filter web typecheck
pnpm --filter mobile typecheck

# Build web production
pnpm --filter web build

# Database
pnpm --filter @techenglish/api db:migrate:dev    # Tao migration moi
pnpm --filter @techenglish/api db:migrate:deploy # Apply migration (production)
pnpm --filter @techenglish/api db:generate       # Generate Prisma Client
pnpm --filter @techenglish/api db:seed           # Seed demo data
pnpm --filter @techenglish/api db:studio         # GUI Prisma Studio
pnpm --filter @techenglish/api db:reset          # Reset toan bo DB (dev only)
```

---

## Trang thai trien khai

| Hang muc | Trang thai |
|---|---|
| Web Admin/Giang vien | Giao dien & luong demo (mock data) |
| Mobile hoc vien | Giao dien & dieu huong demo |
| Shared packages | contracts, design-tokens, shared-kernel |
| OpenAPI contract | Contract v1 day du — 16 nhom tai nguyen |
| Prisma schema | 32 bang, index, trigger, enum day du |
| Database migration | `init_full_schema` da apply thanh cong |
| Seed data | Levels, domains, certs, users, lessons, questions, exam |
| NestJS API | Chua implement — schema & contract san sang |
| Authentication that | JWT + RBAC — cho NestJS |
| Web/Mobile -> API | Dang dung mock data, cho backend |
| AI Recommendations | Moi o muc thiet ke, cho backend |

---

## Roadmap

1. **Auth module** — JWT, refresh token, RBAC (Admin / Teacher / Learner)
2. **Users & Learner Profile** — CRUD, onboarding flow
3. **Content modules** — Vocabulary, Lessons, Questions, Exams
4. **Exam engine** — Submit, auto-grade, JSONB snapshot ket qua
5. **Progress tracking** — Cap nhat tien do real-time
6. **Web/Mobile integration** — Thay mock repository bang HTTP adapter
7. **AI Recommendations** — Goi y ca nhan hoa dua tren profile & tien do

---

## Tai lieu

| Tai lieu | Mo ta |
|---|---|
| [Project brief](docs/00-project-brief.md) | Tong quan san pham |
| [Functional requirements](docs/01-functional-requirements.md) | Yeu cau chuc nang chi tiet |
| [Domain model](docs/03-domain-model.md) | Entity & quan he nghiep vu |
| [Complex flows](docs/05-complex-flows.md) | Exam lifecycle, progress, AI |
| [Project structure](docs/08-project-structure.md) | Cau truc thu muc |
| [Tech stack](docs/16-tech-stack.md) | Cong nghe & ly do chon |
| [Clean Architecture](docs/17-clean-architecture.md) | Kien truc backend |
| [Web Next.js](docs/19-web-nextjs.md) | Huong dan web frontend |
| [Mobile React Native](docs/20-mobile-react-native.md) | Huong dan mobile |
| [PostgreSQL & Prisma](docs/22-postgresql-prisma.md) | Quy uoc database |
| [Seed data guidance](docs/14-seed-data-guidance.md) | Huong dan seed |
| [OpenAPI contract](apps/api/openapi.yaml) | Dac ta REST API day du |

---

## License

Private project — moi quyen thuoc ve tac gia.
