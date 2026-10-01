# Docker và CI/CD

## Trạng thái kiểm chứng

Đã kiểm tra cú pháp YAML và shell. Máy phát triển hiện chưa có Docker nên chưa xác nhận build/run container.

Database mới dùng lịch sử khởi tạo riêng tại `docker/prisma/migrations`. Đã chạy SQL thật trên database tạm rỗng, đối chiếu schema không có khác biệt và chạy lại thành công. Database có lịch sử cũ vẫn dùng `apps/api/prisma/migrations`; không sửa checksum, không đánh dấu migration chưa chạy là đã chạy. PostgreSQL thật không bị thay đổi trong quá trình kiểm tra.

## Thành phần

- PostgreSQL 16 lưu dữ liệu trong volume `postgres_data`, không mở cổng database ra host.
- API NestJS chạy cổng 8080. Dịch vụ `migrate` phải hoàn tất trước khi API chạy.
- Web Next.js chạy cổng 3000, chờ API healthy.
- Profile `mobile` chạy Expo Metro cổng 8081; điện thoại/emulator chạy ứng dụng native.
- Không dùng Redis.
- Các image hiện giữ dependencies của workspace để hỗ trợ Prisma CLI và package TypeScript nội bộ; chưa tối ưu thành image runtime tối thiểu.

## Chạy trên máy

Yêu cầu Docker Engine/Desktop và Compose >= 2.24.

```bash
cp .env.compose.example .env.compose
openssl rand -hex 24
# Điền POSTGRES_PASSWORD và JWT_SECRET bằng hai giá trị ngẫu nhiên riêng biệt.
docker compose --env-file .env.compose config --quiet
docker compose --env-file .env.compose up -d --build --wait
docker compose --env-file .env.compose logs -f migrate api web
```

Lần đầu chỉ tạo cấu trúc database, không sao chép dữ liệu PostgreSQL thật. Muốn dùng dữ liệu đang có, xem mục Compose kết nối PostgreSQL hiện có bên dưới.

Truy cập web http://localhost:3000, Swagger http://localhost:8080/api/docs.
Không dùng hostname `api` trong `NEXT_PUBLIC_API_URL`: trình duyệt phải truy cập được URL công khai này. URL được đóng vào bundle lúc build; thay URL phải build/publish image web mới.

Tùy chọn email, OAuth, Cloudinary, Firebase: cấu hình `apps/api/.env` (không đưa vào image). Với Compose, các biến SMTP_HOST/SMTP_PORT/SMTP_FROM và GOOGLE_CALLBACK_URL cần đặt trong `.env.compose` để ghi đè giá trị mặc định. Không tự seed. Khi cần dữ liệu demo, sau khi database sẵn sàng:

```bash
docker compose --env-file .env.compose exec api ./node_modules/.bin/ts-node prisma/seed.ts
```

Không chạy seed demo trên production.

## Mobile trong Docker

Điền IP LAN của máy Docker vào `MOBILE_LAN_HOST` và `EXPO_PUBLIC_API_URL`, ví dụ `192.168.1.10` và `http://192.168.1.10:8080/api/v1`. Điện thoại cùng mạng Wi-Fi; firewall cho phép 8080/8081. Android emulator có thể gọi API qua `http://10.0.2.2:8080/api/v1`.

```bash
docker compose --env-file .env.compose --profile mobile up -d --build
docker compose --env-file .env.compose logs -f mobile
```

Mở URL `exp://<IP-LAN>:8081` bằng Expo Go tương thích SDK 57 hoặc development client phù hợp. Image chứa snapshot mã nguồn; sửa code cần build lại mobile. Có thể chạy `pnpm --filter mobile dev` trên host để dùng hot reload.

Container này không tạo APK/IPA, không chạy Android emulator, và không thay thế App Store/Google Play.

## GitHub Actions

### CI and container delivery

PR, push main hoặc chạy thủ công:
1. Cài dependencies theo lockfile, generate Prisma.
2. Chạy migration trên PostgreSQL tạm.
3. Typecheck các package, web/mobile; API và shared-kernel tests.
4. Build API/web; export JavaScript bundle Android làm artifact (không phải APK).
5. Build cả 3 target Docker. Chỉ main được publish lên GHCR, tag bằng SHA đầy đủ.

Repository variable `NEXT_PUBLIC_API_URL` phải là HTTPS API production trước khi phát hành web production. Giá trị mặc định localhost chỉ dùng kiểm tra/local.
GHCR dùng `GITHUB_TOKEN` với quyền packages:write; không cần PAT trong workflow build.

### Deploy containers (thủ công)

Chuẩn bị Linux server có Git, Docker/Compose:
- Clone repository vào `/opt/techenglish/repo`.
- Copy `docker/deploy.sh` đến `/opt/techenglish/deploy.sh`.
- Đặt `.env.compose` ở `/opt/techenglish/.env.compose`, chmod 600. Đây là file shell do quản trị viên quản lý; quote giá trị có khoảng trắng.
- Thêm `IMAGE_PREFIX=ghcr.io/hoquocnam92/english`.
- Cấu hình quyền đọc Git và đăng nhập GHCR trên server nếu package private.
- Đặt reverse proxy/TLS phía trước web/API; đặt WEB_URL, CORS_ORIGIN, API_PUBLIC_URL, GOOGLE_CALLBACK_URL đúng domain.
- Backup PostgreSQL trước release có migration.

Tạo GitHub Environment `production`, nên có required reviewer:
- Secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`.
- KNOWN_HOSTS phải được xác minh fingerprint ngoài workflow, không tự tin cậy host bất kỳ.

Chạy workflow Deploy containers với SHA đầy đủ của release main đã có image CI thành công. Server kiểm tra SHA thuộc main, pull image, migrate, rồi `up --wait`. Migration lỗi thì dừng; không xóa dữ liệu. Production không build từ mã nguồn tại server.

Rollback ứng dụng: chạy lại workflow với SHA trước đó đã publish, **chỉ khi schema hiện tại tương thích**. Script không đảo migration. Khi schema không tương thích cần kế hoạch phục hồi database/backup riêng.

### Mobile EAS build (thủ công)

1. Trên host, đăng nhập Expo và liên kết project: `cd apps/mobile && npx eas-cli init`.
2. Tạo GitHub Environment `mobile`: secret `EXPO_TOKEN`; variables `EAS_PROJECT_ID`, `EXPO_OWNER`.
3. Cấu hình EAS environment với `EXPO_PUBLIC_API_URL` là API HTTPS truy cập được, OAuth public client IDs nếu dùng; upload `GOOGLE_SERVICES_JSON` dưới dạng EAS file secret.
4. Thiết lập Android/iOS signing credentials tương tác lần đầu trên EAS; CI chạy non-interactive.
5. Chạy workflow, chọn android/ios/all và preview/production. Preview Android tạo APK; production tạo bản phân phối theo EAS.
6. Link tải binary nằm trong EAS build. Workflow chưa tự submit lên store, không tự tạo signing credentials.

## Vận hành

```bash
docker compose --env-file .env.compose ps
docker compose --env-file .env.compose logs --tail 100 api
docker compose --env-file .env.compose exec -T db pg_dump -U techenglish techenglish > backup.sql
docker compose --env-file .env.compose down
```

`down` giữ volume dữ liệu; `down -v` xóa database. Không chạy tùy tiện trên server.
Healthcheck API hiện kiểm tra HTTP Swagger; PostgreSQL được kiểm tra riêng bằng pg_isready.

Tham khảo: [Docker Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/), [Expo EAS setup](https://docs.expo.dev/build/setup/).


## Dùng PostgreSQL hiện có làm nguồn chuẩn

Đối chiếu ngày 01/10/2026: database hiện có 39 bảng và 52 migration hoàn tất, không có migration pending/failed. Bốn file migration trong repository khác checksum lịch sử; không replay các file này để dựng lại dữ liệu thật. Prisma đã được bổ sung hai cột đếm bài học và hai index từ schema PostgreSQL.

Dùng file Compose riêng để kết nối trực tiếp database hiện tại; file này không tạo PostgreSQL và không tự chạy migration:

```bash
# Điền DATABASE_URL thật vào .env.compose (không commit).
# Docker host: thay localhost bằng host.docker.internal.
docker compose --env-file .env.compose -f compose.postgres.yml config --quiet
docker compose --env-file .env.compose -f compose.postgres.yml up -d --build --wait
# Thêm --profile mobile trước up nếu cần Expo.
```

PostgreSQL cần cho phép kết nối từ mạng Docker qua listen_addresses/pg_hba.conf; giới hạn đúng subnet và dùng xác thực mật khẩu. Không mở database ra Internet. Nếu PostgreSQL nằm ở server khác, dùng hostname và TLS theo cấu hình server.

Ứng dụng sẽ đọc/ghi database thật khi người dùng thao tác. Cấu hình này không sao chép dữ liệu, không seed, không reset và không chạy migration tự động. Workflow deploy mặc định dùng migration runner phân biệt database mới và lịch sử hiện có.

Bản sao dữ liệu thật, nếu được tạo sau khi có xác nhận, phải giữ ngoài Git, Docker image và CI artifacts.


## Bảo trì migration

Chạy `node docker/migrate.cjs` từ root với DATABASE_URL đã cấu hình. Runner chỉ chọn lịch sử:
- Database public rỗng: thực thi initial-schema SQL của nhánh fresh-install.
- Database có bản ghi baseline fresh-install hoàn tất: tiếp tục nhánh fresh-install.
- Database có lịch sử cũ: tiếp tục lịch sử cũ.
- Database có bảng nhưng không có lịch sử Prisma: dừng để kiểm tra thủ công.

Không sử dụng db push, reset hoặc migrate resolve. Schema trong docker/prisma/schema.prisma là bản sao sinh từ schema chính, không commit.
Mọi thay đổi schema tiếp theo phải có migration tương đương cho **cả hai lịch sử**. CI kiểm tra schema sau migration fresh-install để phát hiện thiếu migration. Không sửa initial-schema SQL sau khi đã triển khai nó.
